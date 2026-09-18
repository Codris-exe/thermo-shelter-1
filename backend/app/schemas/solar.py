from datetime import datetime

from pydantic import BaseModel, Field

from .design import ShelterDesign


class SolarCalculationRequest(BaseModel):
    design: ShelterDesign

    timestamp: datetime

    latitude: float = Field(
        ge=-90,
        le=90,
    )

    longitude: float = Field(
        ge=-180,
        le=180,
    )

    solar_irradiance_w_m2: float = Field(
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

    timezone: str = "UTC"


class SolarSurfaceResult(BaseModel):
    surface: str

    azimuth_deg: float

    tilt_deg: float

    area_m2: float

    irradiance_w_m2: float

    incident_power_w: float

    absorbed_power_w: float


class SolarWindowResult(BaseModel):
    wall: str

    area_m2: float

    irradiance_w_m2: float

    solar_transmitted_power_w: float


class SolarCalculationResult(BaseModel):
    timestamp: datetime

    solar_zenith_deg: float

    solar_azimuth_deg: float

    total_incident_power_w: float

    total_opaque_absorbed_power_w: float

    total_window_solar_gain_w: float

    surfaces: list[SolarSurfaceResult]

    windows: list[SolarWindowResult]