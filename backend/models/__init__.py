"""Slag viscosity prediction models package."""

from models.base import BaseModel, ModelRegistry
from models.phase_ii import PhaseIIModel

# Register available models
ModelRegistry.register(PhaseIIModel())

__all__ = ["BaseModel", "ModelRegistry", "PhaseIIModel"]
