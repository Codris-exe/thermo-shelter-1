from pydantic import BaseModel, Field

from .design import ShelterDesign
from .simulation import WeatherPoint


class OptimizationRequest(BaseModel):
    design: ShelterDesign
    weather: list[WeatherPoint] = Field(min_length=2)

    initial_indoor_temperature_c: float = 18.0
    internal_heat_gain_w: float = Field(default=0.0, ge=0)

    wall_insulation_thicknesses_mm: list[float] = Field(
        default=[50, 100, 150, 200]
    )

    roof_insulation_thicknesses_mm: list[float] = Field(
        default=[50, 100, 150, 200]
    )

    orientations_deg: list[float] = Field(
        default=[0, 90, 180, 270]
    )

    timestep_minutes: int = Field(
        default=60,
        ge=5,
        le=60,
    )


class OptimizationCandidate(BaseModel):
    rank: int

    orientation_deg: float

    wall_insulation_thickness_mm: float
    roof_insulation_thickness_mm: float

    comfort_percentage: float
    comfort_hours: float

    minimum_indoor_temperature_c: float
    maximum_indoor_temperature_c: float
    final_indoor_temperature_c: float


class OptimizationResult(BaseModel):
    total_candidates_tested: int

    baseline_comfort_percentage: float

    best_candidate: OptimizationCandidate

    candidates: list[OptimizationCandidate]