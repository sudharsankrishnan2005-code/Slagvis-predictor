"""Unit tests for Phase-II viscosity model."""

from models.phase_ii import calculate_viscosity


def test_example_from_spec():
    """Verify against documented example values."""
    result = calculate_viscosity(
        sio2=35,
        al2o3=15,
        mgo=8,
        mno=4,
        k2o=0.5,
        tio2=1,
        temperature=1500,
    )
    assert abs(result["log_eta"] - (-0.5864)) < 0.001
    assert abs(result["viscosity"] - 0.259) < 0.01


def test_contributions_count():
    result = calculate_viscosity(35, 15, 8, 4, 0.5, 1, 1500)
    assert len(result["contributions"]) == 7
