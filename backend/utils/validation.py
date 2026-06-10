"""Input validation helpers."""

from fastapi import HTTPException


def validate_composition(
    sio2: float,
    al2o3: float,
    mgo: float,
    mno: float,
    k2o: float,
    tio2: float,
    temperature: float,
) -> None:
    """Validate slag composition and temperature ranges."""
    components = {
        "SiO2": sio2,
        "Al2O3": al2o3,
        "MgO": mgo,
        "MnO": mno,
        "K2O": k2o,
        "TiO2": tio2,
    }
    for name, val in components.items():
        if val < 0:
            raise HTTPException(status_code=422, detail=f"{name} must be non-negative")
    if not 800 <= temperature <= 1800:
        raise HTTPException(
            status_code=422,
            detail="Temperature must be between 800°C and 1800°C",
        )
