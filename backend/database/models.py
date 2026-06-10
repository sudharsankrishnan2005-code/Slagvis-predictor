"""SQLAlchemy ORM models for prediction history."""

from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class Prediction(Base):
    """Stored viscosity prediction record."""

    __tablename__ = "predictions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )
    model_id: Mapped[str] = mapped_column(String(50), default="phase_ii")
    sio2: Mapped[float] = mapped_column(Float)
    al2o3: Mapped[float] = mapped_column(Float)
    mgo: Mapped[float] = mapped_column(Float)
    mno: Mapped[float] = mapped_column(Float)
    k2o: Mapped[float] = mapped_column(Float)
    tio2: Mapped[float] = mapped_column(Float)
    temperature: Mapped[float] = mapped_column(Float)
    log_eta: Mapped[float] = mapped_column(Float)
    viscosity: Mapped[float] = mapped_column(Float)
    interpretation: Mapped[str] = mapped_column(String(100))
    report_json: Mapped[str | None] = mapped_column(Text, nullable=True)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "timestamp": self.timestamp.isoformat(),
            "model_id": self.model_id,
            "sio2": self.sio2,
            "al2o3": self.al2o3,
            "mgo": self.mgo,
            "mno": self.mno,
            "k2o": self.k2o,
            "tio2": self.tio2,
            "temperature": self.temperature,
            "log_eta": self.log_eta,
            "viscosity": self.viscosity,
            "interpretation": self.interpretation,
        }
