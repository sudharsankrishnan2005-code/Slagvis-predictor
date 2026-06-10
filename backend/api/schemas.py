"""Pydantic schemas for API request/response validation."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class SlagCompositionInput(BaseModel):
    """Input parameters for single viscosity prediction."""

    sio2: float = Field(..., ge=0, description="SiO2 content (wt.%)")
    al2o3: float = Field(..., ge=0, description="Al2O3 content (wt.%)")
    mgo: float = Field(..., ge=0, description="MgO content (wt.%)")
    mno: float = Field(..., ge=0, description="MnO content (wt.%)")
    k2o: float = Field(..., ge=0, description="K2O content (wt.%)")
    tio2: float = Field(..., ge=0, description="TiO2 content (wt.%)")
    temperature: float = Field(..., ge=800, le=1800, description="Temperature (°C)")
    model_id: str = Field(default="phase_ii", description="Model identifier")
    save: bool = Field(default=True, description="Persist to history")


class ContributionSchema(BaseModel):
    variable: str
    coefficient: float
    input_value: float
    contribution: float
    unit: str


class PredictionResult(BaseModel):
    model_id: str
    model_name: str
    log_eta: float
    viscosity: float
    interpretation: str
    intercept: float
    contributions: list[ContributionSchema]
    equation_latex: str
    equation_plain: str
    inputs: SlagCompositionInput
    prediction_id: Optional[int] = None


class PredictionHistoryItem(BaseModel):
    id: int
    timestamp: datetime
    model_id: str
    sio2: float
    al2o3: float
    mgo: float
    mno: float
    k2o: float
    tio2: float
    temperature: float
    log_eta: float
    viscosity: float
    interpretation: str


class DashboardStats(BaseModel):
    total_predictions: int
    average_viscosity: float
    last_prediction: Optional[PredictionHistoryItem]
    recent_calculations: list[PredictionHistoryItem]


class BatchResultItem(BaseModel):
    row: int
    sio2: float
    al2o3: float
    mgo: float
    mno: float
    k2o: float
    tio2: float
    temperature: float
    log_eta: float
    viscosity: float
    interpretation: str


class ModelInfo(BaseModel):
    id: str
    name: str
    available: bool
    equation_latex: Optional[str] = None
    equation_plain: Optional[str] = None
    coefficients: Optional[dict[str, float]] = None
