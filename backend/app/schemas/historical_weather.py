from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field


HistoricalModel = Literal[
    "era5",
    "era5_land",
    "era5_seamless",
    "best_match",
]


class HistoricalWeatherRequest(BaseModel):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)

    start_date: date
    end_date: date

    timezone: str = "auto"

    model: HistoricalModel = "era5"

    elevation_m: float | None = Field(default=None, ge=-500, le=10000)

    # Optional month filter.
    # Example:
    # 1 = January
    # 12 = December
    month: int | None = Field(default=None, ge=1, le=12)

    # Number of years used when calculating the representative profile.
    # This is informational and allows the frontend to display the
    # historical period being analysed.
    aggregation: Literal["hourly_profile", "daily_profile"] = "hourly_profile"


class HistoricalWeatherPoint(BaseModel):
    timestamp: datetime

    hour_of_day: int = Field(ge=0, le=23)
    month: int = Field(ge=1, le=12)

    temperature_c: float | None = None
    relative_humidity_pct: float | None = Field(default=None, ge=0, le=100)

    wind_speed_m_s: float | None = Field(default=None, ge=0)
    wind_direction_deg: float | None = Field(default=None, ge=0, le=360)

    solar_irradiance_w_m2: float | None = Field(default=None, ge=0)
    direct_radiation_w_m2: float | None = Field(default=None, ge=0)
    diffuse_radiation_w_m2: float | None = Field(default=None, ge=0)
    direct_normal_irradiance_w_m2: float | None = Field(default=None, ge=0)

    cloud_cover_pct: float | None = Field(default=None, ge=0, le=100)

    is_day: bool | None = None


class ClimateProfilePoint(BaseModel):
    hour_of_day: int = Field(ge=0, le=23)

    sample_count: int = Field(ge=1)

    average_temperature_c: float | None = None
    minimum_temperature_c: float | None = None
    maximum_temperature_c: float | None = None

    average_relative_humidity_pct: float | None = Field(
        default=None,
        ge=0,
        le=100,
    )

    average_wind_speed_m_s: float | None = Field(
        default=None,
        ge=0,
    )

    average_solar_irradiance_w_m2: float | None = Field(
        default=None,
        ge=0,
    )

    average_direct_radiation_w_m2: float | None = Field(
        default=None,
        ge=0,
    )

    average_diffuse_radiation_w_m2: float | None = Field(
        default=None,
        ge=0,
    )

    average_direct_normal_irradiance_w_m2: float | None = Field(
        default=None,
        ge=0,
    )

    average_cloud_cover_pct: float | None = Field(
        default=None,
        ge=0,
        le=100,
    )

    daylight_fraction: float | None = Field(
        default=None,
        ge=0,
        le=1,
    )


class HistoricalClimateResult(BaseModel):
    latitude: float
    longitude: float

    requested_start_date: date
    requested_end_date: date

    actual_start_date: date
    actual_end_date: date

    timezone: str
    model: HistoricalModel

    elevation_m: float | None = None

    years_available: int = Field(ge=0)
    hourly_samples: int = Field(ge=0)

    selected_month: int | None = Field(
        default=None,
        ge=1,
        le=12,
    )

    profile_type: Literal["hourly_profile", "daily_profile"]

    climate_profile: list[ClimateProfilePoint]

    source: str = "Open-Meteo Historical Weather API"