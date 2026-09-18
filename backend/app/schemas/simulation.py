from datetime import datetime

from pydantic import BaseModel, Field

from .design import ShelterDesign


class WeatherPoint(BaseModel):
    timestamp: datetime

    outdoor_temperature_c: float

    wind_speed_m_s: float = Field(
        default=0.0,
        ge=0,
    )

    solar_irradiance_w_m2: float = Field(
        default=0.0,
        ge=0,
    )

    solar_gain_w: float = Field(
        default=0.0,
        ge=0,
    )

    direct_radiation_w_m2: float = Field(
        default=0.0,
        ge=0,
    )

    diffuse_radiation_w_m2: float = Field(
        default=0.0,
        ge=0,
    )

    direct_normal_irradiance_w_m2: float = Field(
        default=0.0,
        ge=0,
    )

    cloud_cover_pct: float | None = Field(
        default=None,
        ge=0,
        le=100,
    )

    is_day: bool = False

    relative_humidity_pct: float | None = Field(
        default=None,
        ge=0,
        le=100,
    )

    ground_temperature_c: float | None = None


class HeatBalanceRequest(BaseModel):
    design: ShelterDesign

    indoor_temperature_c: float

    weather: WeatherPoint

    internal_heat_gain_w: float = Field(
        default=0.0,
        ge=0,
    )


class HeatBalanceResult(BaseModel):
    timestamp: datetime

    wall_heat_transfer_w: float
    roof_heat_transfer_w: float
    floor_heat_transfer_w: float

    window_heat_transfer_w: float
    door_heat_transfer_w: float

    ventilation_heat_transfer_w: float

    conductive_heat_transfer_w: float
    total_heat_loss_w: float

    solar_gain_w: float
    internal_heat_gain_w: float

    net_heat_gain_w: float

    indoor_temperature_c: float
    outdoor_temperature_c: float


class SimulationRequest(BaseModel):
    design: ShelterDesign

    initial_indoor_temperature_c: float = 18.0

    weather: list[WeatherPoint] = Field(
        min_length=2
    )

    internal_heat_gain_w: float = Field(
        default=0.0,
        ge=0,
    )

    timestep_minutes: int = Field(
        default=60,
        ge=5,
        le=60,
    )


class SimulationPoint(BaseModel):
    timestamp: datetime

    indoor_temperature_c: float
    thermal_mass_temperature_c: float

    outdoor_temperature_c: float

    solar_irradiance_w_m2: float
    solar_gain_w: float

    wall_heat_transfer_w: float
    roof_heat_transfer_w: float
    floor_heat_transfer_w: float

    window_heat_transfer_w: float
    door_heat_transfer_w: float
    ventilation_heat_transfer_w: float

    thermal_mass_heat_transfer_w: float

    total_heat_loss_w: float
    net_heat_gain_w: float


class SimulationResult(BaseModel):
    initial_indoor_temperature_c: float
    final_indoor_temperature_c: float

    minimum_indoor_temperature_c: float
    maximum_indoor_temperature_c: float

    initial_thermal_mass_temperature_c: float | None
    final_thermal_mass_temperature_c: float | None

    minimum_thermal_mass_temperature_c: float | None
    maximum_thermal_mass_temperature_c: float | None

    comfort_hours: float
    cold_hours: float
    hot_hours: float
    comfort_percentage: float

    points: list[SimulationPoint]