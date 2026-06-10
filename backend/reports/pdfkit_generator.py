"""PDFKit HTML-to-PDF fallback (optional — requires wkhtmltopdf installed)."""

import shutil
from typing import Any

import pdfkit


def is_pdfkit_available() -> bool:
    return shutil.which("wkhtmltopdf") is not None


def generate_pdf_from_html(html: str, output_path: str | None = None) -> bytes | None:
    """
    Generate PDF from HTML using PDFKit/wkhtmltopdf.

    Returns None if wkhtmltopdf is not installed on the system.
    """
    if not is_pdfkit_available():
        return None
    options = {
        "page-size": "A4",
        "margin-top": "20mm",
        "margin-bottom": "20mm",
        "encoding": "UTF-8",
    }
    if output_path:
        pdfkit.from_string(html, output_path, options=options)
        return None
    return pdfkit.from_string(html, False, options=options)


def build_report_html(data: dict[str, Any]) -> str:
    """Build HTML report string for PDFKit conversion."""
    rows = ""
    for key, label in [
        ("sio2", "SiO₂"),
        ("al2o3", "Al₂O₃"),
        ("mgo", "MgO"),
        ("mno", "MnO"),
        ("k2o", "K₂O"),
        ("tio2", "TiO₂"),
    ]:
        val = data.get("inputs", {}).get(key, 0)
        rows += f"<tr><td>{label}</td><td>{val:.2f}</td><td>wt.%</td></tr>"

    temp = data.get("inputs", {}).get("temperature", 0)
    rows += f"<tr><td>Temperature</td><td>{temp:.1f}</td><td>°C</td></tr>"

    return f"""
    <html><head><style>
    body {{ font-family: Arial, sans-serif; margin: 40px; }}
    h1 {{ color: #1e3a5f; text-align: center; }}
    table {{ border-collapse: collapse; width: 100%; margin: 16px 0; }}
    th, td {{ border: 1px solid #ccc; padding: 8px; text-align: left; }}
    th {{ background: #1e3a5f; color: white; }}
    .footer {{ text-align: center; color: #888; font-size: 10px; margin-top: 40px; }}
    </style></head><body>
    <h1>Slag Viscosity Prediction Report</h1>
    <h2>Input Parameters</h2>
    <table><tr><th>Variable</th><th>Value</th><th>Unit</th></tr>{rows}</table>
    <h2>Result</h2>
    <p><b>η = {data.get('viscosity', 0):.4f} Pa·s</b></p>
    <p>{data.get('interpretation', '')}</p>
    <div class="footer">Generated using SlagVis Predictor</div>
    </body></html>
    """
