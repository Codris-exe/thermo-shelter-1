from datetime import datetime

from pydantic import BaseModel, Field

from .design import ShelterDesign


class WeatherPoint(BaseModel):
    timestamp: datetime

    outdoor_temperature_c: float

    wind_speed_m_s: float = Field(default=0.0, ge=0)

    solar_irradiance_w_m2: float = Field(default=0.0, ge=0)

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

    solar_gain_w: float = Field(
        default=0.0,
        ge=0,
    )

    internal_heat_gain_w: float = Field(
        default=0.0,
        ge=0,
    )


class HeatBalanceResult(BaseModel):
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