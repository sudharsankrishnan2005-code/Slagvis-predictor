"""
Base model interface and registry for extensible viscosity prediction.

Future models (Phase III, Machin, Riboud, Iida, Urbain) implement BaseModel
and register via ModelRegistry.register().
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any


@dataclass
class Contribution:
    """Single term contribution to log10(η)."""

    variable: str
    coefficient: float
    input_value: float
    contribution: float
    unit: str = "wt.%"

    def to_dict(self) -> dict[str, Any]:
        return {
            "variable": self.variable,
            "coefficient": self.coefficient,
            "input_value": self.input_value,
            "contribution": self.contribution,
            "unit": self.unit,
        }


@dataclass
class ViscosityResult:
    """Complete calculation result with step-by-step breakdown."""

    model_id: str
    model_name: str
    log_eta: float
    viscosity: float
    interpretation: str
    contributions: list[Contribution] = field(default_factory=list)
    intercept: float = 0.0
    equation_latex: str = ""
    equation_plain: str = ""

    def to_dict(self) -> dict[str, Any]:
        return {
            "model_id": self.model_id,
            "model_name": self.model_name,
            "log_eta": self.log_eta,
            "viscosity": self.viscosity,
            "interpretation": self.interpretation,
            "intercept": self.intercept,
            "contributions": [c.to_dict() for c in self.contributions],
            "equation_latex": self.equation_latex,
            "equation_plain": self.equation_plain,
        }


class BaseModel(ABC):
    """Abstract base class for slag viscosity empirical models."""

    @property
    @abstractmethod
    def model_id(self) -> str:
        """Unique identifier, e.g. 'phase_ii'."""

    @property
    @abstractmethod
    def model_name(self) -> str:
        """Human-readable model name."""

    @property
    @abstractmethod
    def equation_latex(self) -> str:
        """LaTeX representation of the model equation."""

    @property
    @abstractmethod
    def equation_plain(self) -> str:
        """Plain-text equation for reports."""

    @property
    @abstractmethod
    def coefficients(self) -> dict[str, float]:
        """Coefficient table for documentation."""

    @abstractmethod
    def calculate(
        self,
        sio2: float,
        al2o3: float,
        mgo: float,
        mno: float,
        k2o: float,
        tio2: float,
        temperature: float,
    ) -> ViscosityResult:
        """Run prediction and return detailed breakdown."""


class ModelRegistry:
    """Central registry for viscosity models — supports dropdown selection."""

    _models: dict[str, BaseModel] = {}

    @classmethod
    def register(cls, model: BaseModel) -> None:
        cls._models[model.model_id] = model

    @classmethod
    def get(cls, model_id: str) -> BaseModel:
        if model_id not in cls._models:
            raise KeyError(f"Model '{model_id}' not found. Available: {list(cls._models)}")
        return cls._models[model_id]

    @classmethod
    def list_models(cls) -> list[dict[str, str]]:
        return [
            {"id": m.model_id, "name": m.model_name, "available": True}
            for m in cls._models.values()
        ]

    @classmethod
    def list_all_with_placeholders(cls) -> list[dict[str, str]]:
        """Include future models as unavailable placeholders."""
        registered = {m["id"]: m for m in cls.list_models()}
        future = [
            ("phase_iii", "Phase-III Model"),
            ("machin", "Machin Model"),
            ("riboud", "Riboud Model"),
            ("iida", "Iida Model"),
            ("urbain", "Urbain Model"),
        ]
        result = list(registered.values())
        for fid, fname in future:
            if fid not in registered:
                result.append({"id": fid, "name": fname, "available": False})
        return result


def interpret_viscosity(viscosity: float) -> str:
    """Engineering interpretation of predicted viscosity (Pa·s)."""
    if viscosity < 0.5:
        return "Low viscosity slag"
    if viscosity <= 1.5:
        return "Medium viscosity slag"
    return "High viscosity slag"
