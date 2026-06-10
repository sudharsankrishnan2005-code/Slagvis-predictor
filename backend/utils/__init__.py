"""Shared backend utilities."""

from utils.validation import validate_composition


def format_report_number(value: float, decimals: int = 4) -> str:
    return f"{value:.{decimals}f}"
