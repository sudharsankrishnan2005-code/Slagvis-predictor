"""PDF report generation using ReportLab."""

import io
from datetime import datetime, timezone
from typing import Any

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


def _fmt(value: float, decimals: int = 4) -> str:
    return f"{value:.{decimals}f}"


def generate_pdf_report(data: dict[str, Any]) -> bytes:
    """
    Generate professional engineering PDF report.

    Args:
        data: Dict with inputs, result, contributions, model info.

    Returns:
        PDF file as bytes.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2 * cm,
        leftMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Heading1"],
        fontSize=18,
        alignment=TA_CENTER,
        spaceAfter=12,
        textColor=colors.HexColor("#1e3a5f"),
    )
    heading_style = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontSize=13,
        spaceBefore=14,
        spaceAfter=8,
        textColor=colors.HexColor("#2563eb"),
    )
    body_style = ParagraphStyle(
        "Body",
        parent=styles["Normal"],
        fontSize=10,
        leading=14,
    )
    footer_style = ParagraphStyle(
        "Footer",
        parent=styles["Normal"],
        fontSize=8,
        alignment=TA_CENTER,
        textColor=colors.grey,
    )

    story: list = []
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

    story.append(Paragraph("Slag Viscosity Prediction Report", title_style))
    story.append(Paragraph(f"Generated: {now}", body_style))
    story.append(Spacer(1, 0.5 * cm))

    # Input parameters
    story.append(Paragraph("1. Input Parameters", heading_style))
    inputs = data.get("inputs", {})
    input_table_data = [
        ["Variable", "Value", "Unit"],
        ["SiO₂", _fmt(inputs.get("sio2", 0), 2), "wt.%"],
        ["Al₂O₃", _fmt(inputs.get("al2o3", 0), 2), "wt.%"],
        ["MgO", _fmt(inputs.get("mgo", 0), 2), "wt.%"],
        ["MnO", _fmt(inputs.get("mno", 0), 2), "wt.%"],
        ["K₂O", _fmt(inputs.get("k2o", 0), 2), "wt.%"],
        ["TiO₂", _fmt(inputs.get("tio2", 0), 2), "wt.%"],
        ["Temperature", _fmt(inputs.get("temperature", 0), 1), "°C"],
    ]
    input_table = Table(input_table_data, colWidths=[5 * cm, 4 * cm, 3 * cm])
    input_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e3a5f")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 10),
                ("ALIGN", (1, 1), (1, -1), "RIGHT"),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f0f4f8")]),
            ]
        )
    )
    story.append(input_table)
    story.append(Spacer(1, 0.4 * cm))

    # Equation
    story.append(Paragraph("2. Equation Used", heading_style))
    model_name = data.get("model_name", "Phase-II Empirical Model")
    equation = data.get("equation_plain", "")
    story.append(Paragraph(f"<b>Model:</b> {model_name}", body_style))
    story.append(Paragraph(f"<b>Equation:</b> {equation}", body_style))
    story.append(Spacer(1, 0.3 * cm))

    # Step-by-step
    story.append(Paragraph("3. Step-by-Step Calculations", heading_style))
    calc_rows = [["Term", "Calculation", "Contribution"]]
    intercept = data.get("intercept", 1.777)
    calc_rows.append(["Intercept", "1.777", _fmt(intercept)])

    for c in data.get("contributions", []):
        coef = c["coefficient"]
        val = c["input_value"]
        sign = "+" if coef >= 0 else "−"
        calc_rows.append(
            [
                c["variable"],
                f"{sign}{abs(coef):.4f} × {_fmt(val, 2)}",
                _fmt(c["contribution"]),
            ]
        )

    calc_rows.append(["", "Σ log₁₀(η)", _fmt(data.get("log_eta", 0))])
    calc_table = Table(calc_rows, colWidths=[4 * cm, 5.5 * cm, 3.5 * cm])
    calc_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2563eb")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("ALIGN", (2, 1), (2, -1), "RIGHT"),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
                ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#e8f0fe")),
            ]
        )
    )
    story.append(calc_table)
    story.append(Spacer(1, 0.4 * cm))

    # Final result
    story.append(Paragraph("4. Final Result", heading_style))
    log_eta = data.get("log_eta", 0)
    viscosity = data.get("viscosity", 0)
    story.append(
        Paragraph(
            f"<b>log₁₀(η)</b> = {_fmt(log_eta)}",
            body_style,
        )
    )
    story.append(
        Paragraph(
            f"<b>η</b> = 10^({_fmt(log_eta)}) = <b>{_fmt(viscosity)} Pa·s</b>",
            body_style,
        )
    )
    story.append(Spacer(1, 0.3 * cm))

    # Interpretation
    story.append(Paragraph("5. Engineering Interpretation", heading_style))
    interpretation = data.get("interpretation", "")
    story.append(Paragraph(f"<b>{interpretation}</b>", body_style))

    story.append(Spacer(1, 1 * cm))
    story.append(Paragraph("Generated using SlagVis Predictor", footer_style))

    doc.build(story)
    buffer.seek(0)
    return buffer.read()
