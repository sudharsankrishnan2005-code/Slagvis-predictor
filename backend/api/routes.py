"""FastAPI route handlers."""

import json
from io import BytesIO
from typing import Optional

import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from api.schemas import (
    BatchResultItem,
    DashboardStats,
    ModelInfo,
    PredictionHistoryItem,
    PredictionResult,
    SlagCompositionInput,
)
from database import get_db
from database.models import Prediction
from models.base import ModelRegistry
from reports.pdf_generator import generate_pdf_report

router = APIRouter()

REQUIRED_COLUMNS = ["SiO2", "Al2O3", "MgO", "MnO", "K2O", "TiO2", "Temperature"]


def _run_prediction(data: SlagCompositionInput, db: Session) -> tuple[dict, Optional[int]]:
    """Execute model and optionally persist."""
    try:
        model = ModelRegistry.get(data.model_id)
    except KeyError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    result = model.calculate(
        sio2=data.sio2,
        al2o3=data.al2o3,
        mgo=data.mgo,
        mno=data.mno,
        k2o=data.k2o,
        tio2=data.tio2,
        temperature=data.temperature,
    )
    result_dict = result.to_dict()
    prediction_id = None

    if data.save:
        record = Prediction(
            model_id=data.model_id,
            sio2=data.sio2,
            al2o3=data.al2o3,
            mgo=data.mgo,
            mno=data.mno,
            k2o=data.k2o,
            tio2=data.tio2,
            temperature=data.temperature,
            log_eta=result.log_eta,
            viscosity=result.viscosity,
            interpretation=result.interpretation,
            report_json=json.dumps(result_dict),
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        prediction_id = record.id

    report_data = {
        **result_dict,
        "inputs": data.model_dump(exclude={"save", "model_id"}),
        "model_name": result.model_name,
    }
    return report_data, prediction_id


@router.post("/predict", response_model=PredictionResult)
def predict(data: SlagCompositionInput, db: Session = Depends(get_db)):
    """Single slag viscosity prediction with full calculation breakdown."""
    report_data, prediction_id = _run_prediction(data, db)
    return PredictionResult(
        **{k: v for k, v in report_data.items() if k != "inputs"},
        inputs=data,
        prediction_id=prediction_id,
    )


@router.post("/predict/batch")
async def predict_batch(
    file: UploadFile = File(...),
    model_id: str = Query(default="phase_ii"),
    db: Session = Depends(get_db),
):
    """Batch prediction from CSV or Excel upload."""
    try:
        model = ModelRegistry.get(model_id)
    except KeyError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    content = await file.read()
    filename = file.filename or ""

    try:
        if filename.endswith((".xlsx", ".xls")):
            df = pd.read_excel(BytesIO(content))
        else:
            df = pd.read_csv(BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {e}") from e

    missing = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required columns: {missing}. Expected: {REQUIRED_COLUMNS}",
        )

    results: list[BatchResultItem] = []
    for idx, row in df.iterrows():
        result = model.calculate(
            sio2=float(row["SiO2"]),
            al2o3=float(row["Al2O3"]),
            mgo=float(row["MgO"]),
            mno=float(row["MnO"]),
            k2o=float(row["K2O"]),
            tio2=float(row["TiO2"]),
            temperature=float(row["Temperature"]),
        )
        results.append(
            BatchResultItem(
                row=int(idx) + 1,
                sio2=float(row["SiO2"]),
                al2o3=float(row["Al2O3"]),
                mgo=float(row["MgO"]),
                mno=float(row["MnO"]),
                k2o=float(row["K2O"]),
                tio2=float(row["TiO2"]),
                temperature=float(row["Temperature"]),
                log_eta=result.log_eta,
                viscosity=result.viscosity,
                interpretation=result.interpretation,
            )
        )

    return {"count": len(results), "results": results}


async def _batch_to_dataframe(file: UploadFile, model_id: str) -> pd.DataFrame:
    """Parse upload and run batch predictions."""
    try:
        model = ModelRegistry.get(model_id)
    except KeyError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    content = await file.read()
    filename = file.filename or ""

    try:
        if filename.endswith((".xlsx", ".xls")):
            df = pd.read_excel(BytesIO(content))
        else:
            df = pd.read_csv(BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {e}") from e

    missing = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required columns: {missing}. Expected: {REQUIRED_COLUMNS}",
        )

    rows = []
    for idx, row in df.iterrows():
        result = model.calculate(
            sio2=float(row["SiO2"]),
            al2o3=float(row["Al2O3"]),
            mgo=float(row["MgO"]),
            mno=float(row["MnO"]),
            k2o=float(row["K2O"]),
            tio2=float(row["TiO2"]),
            temperature=float(row["Temperature"]),
        )
        rows.append(
            {
                "row": int(idx) + 1,
                "SiO2": float(row["SiO2"]),
                "Al2O3": float(row["Al2O3"]),
                "MgO": float(row["MgO"]),
                "MnO": float(row["MnO"]),
                "K2O": float(row["K2O"]),
                "TiO2": float(row["TiO2"]),
                "Temperature": float(row["Temperature"]),
                "log10_eta": result.log_eta,
                "Viscosity_Pa_s": result.viscosity,
                "Interpretation": result.interpretation,
            }
        )
    return pd.DataFrame(rows)


@router.post("/predict/batch/export")
async def export_batch(
    file: UploadFile = File(...),
    model_id: str = Query(default="phase_ii"),
    format: str = Query(default="csv", pattern="^(csv|xlsx)$"),
):
    """Batch predict and return downloadable CSV/Excel."""
    df = await _batch_to_dataframe(file, model_id)

    if format == "xlsx":
        buffer = BytesIO()
        df.to_excel(buffer, index=False, engine="openpyxl")
        buffer.seek(0)
        return StreamingResponse(
            buffer,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=batch_results.xlsx"},
        )

    buffer = BytesIO()
    df.to_csv(buffer, index=False)
    buffer.seek(0)
    return StreamingResponse(
        buffer,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=batch_results.csv"},
    )


@router.post("/report/pdf")
def generate_report_pdf(data: SlagCompositionInput, db: Session = Depends(get_db)):
    """Generate PDF report for given inputs (recalculates)."""
    report_data, _ = _run_prediction(
        SlagCompositionInput(**{**data.model_dump(), "save": False}),
        db,
    )
    pdf_bytes = generate_pdf_report(report_data)
    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=slag_viscosity_report.pdf"},
    )


@router.post("/report/pdf/from-result")
def generate_report_from_result(payload: dict):
    """Generate PDF from an existing calculation result payload."""
    pdf_bytes = generate_pdf_report(payload)
    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=slag_viscosity_report.pdf"},
    )


@router.get("/history", response_model=list[PredictionHistoryItem])
def get_history(
    search: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    """Retrieve prediction history with optional search."""
    query = db.query(Prediction).order_by(desc(Prediction.timestamp))
    if search:
        # Search by interpretation or approximate viscosity
        query = query.filter(Prediction.interpretation.ilike(f"%{search}%"))
    records = query.limit(limit).all()
    return [PredictionHistoryItem(**r.to_dict()) for r in records]


@router.get("/history/{prediction_id}")
def get_prediction(prediction_id: int, db: Session = Depends(get_db)):
    """Get single prediction with full report data."""
    record = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Prediction not found")
    data = record.to_dict()
    if record.report_json:
        data["report"] = json.loads(record.report_json)
    return data


@router.delete("/history/{prediction_id}")
def delete_prediction(prediction_id: int, db: Session = Depends(get_db)):
    """Delete a prediction record."""
    record = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Prediction not found")
    db.delete(record)
    db.commit()
    return {"deleted": prediction_id}


@router.get("/dashboard", response_model=DashboardStats)
def dashboard(db: Session = Depends(get_db)):
    """Dashboard statistics and recent calculations."""
    total = db.query(func.count(Prediction.id)).scalar() or 0
    avg_visc = db.query(func.avg(Prediction.viscosity)).scalar() or 0.0
    recent = db.query(Prediction).order_by(desc(Prediction.timestamp)).limit(10).all()
    last = recent[0] if recent else None

    return DashboardStats(
        total_predictions=total,
        average_viscosity=float(avg_visc),
        last_prediction=PredictionHistoryItem(**last.to_dict()) if last else None,
        recent_calculations=[PredictionHistoryItem(**r.to_dict()) for r in recent],
    )


@router.get("/models", response_model=list[ModelInfo])
def list_models():
    """List all models including future placeholders."""
    models = ModelRegistry.list_all_with_placeholders()
    result = []
    for m in models:
        info = ModelInfo(id=m["id"], name=m["name"], available=m["available"])
        if m["available"]:
            model = ModelRegistry.get(m["id"])
            info.equation_latex = model.equation_latex
            info.equation_plain = model.equation_plain
            info.coefficients = model.coefficients
        result.append(info)
    return result


@router.get("/models/{model_id}", response_model=ModelInfo)
def get_model(model_id: str):
    """Get detailed model information."""
    try:
        model = ModelRegistry.get(model_id)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    return ModelInfo(
        id=model.model_id,
        name=model.model_name,
        available=True,
        equation_latex=model.equation_latex,
        equation_plain=model.equation_plain,
        coefficients=model.coefficients,
    )
