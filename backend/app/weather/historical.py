from __future__ import annotations

from datetime import date, datetime
from statistics import mean
from typing import Any

import httpx

from app.schemas.historical_weather import (
    ClimateProfilePoint,
    HistoricalClimateResult,
    HistoricalWeatherPoint,
    HistoricalWeatherRequest,
)


HISTORICAL_WEATHER_URL = "https://archive-api.open-meteo.com/v1/archive"


HOURLY_VARIABLES = [
    "temperature_2m",
    "relative_humidity_2m",
    "wind_speed_10m",
    "wind_direction_10m",
    "shortwave_radiation",
    "direct_radiation",
    "diffuse_radiation",
    "direct_normal_irradiance",
    "cloud_cover",
    "is_day",
]


def _safe_float(value: Any) -> float | None:
    """
    Convert a value into float while safely handling missing data.
    """
    if value is None:
        return None

    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _safe_int(value: Any) -> int | None:
    """
    Convert a value into int while safely handling missing data.
    """
    if value is None:
        return None

    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def _mean(values: list[float]) -> float | None:
    """
    Calculate the arithmetic mean while ignoring missing values.
    """
    if not values:
        return None

    return mean(values)


def _minimum(values: list[float]) -> float | None:
    """
    Calculate minimum while ignoring missing values.
    """
    if not values:
        return None

    return min(values)


def _maximum(values: list[float]) -> float | None:
    """
    Calculate maximum while ignoring missing values.
    """
    if not values:
        return None

    return max(values)


def _build_weather_points(
    payload: dict[str, Any],
) -> list[HistoricalWeatherPoint]:
    """
    Convert Open-Meteo's column-oriented hourly JSON response into
    structured weather points.
    """
    hourly = payload.get("hourly", {})

    times = hourly.get("time", [])

    temperatures = hourly.get("temperature_2m", [])
    humidities = hourly.get("relative_humidity_2m", [])
    wind_speeds = hourly.get("wind_speed_10m", [])
    wind_directions = hourly.get("wind_direction_10m", [])

    solar = hourly.get("shortwave_radiation", [])
    direct = hourly.get("direct_radiation", [])
    diffuse = hourly.get("diffuse_radiation", [])
    dni = hourly.get("direct_normal_irradiance", [])

    cloud = hourly.get("cloud_cover", [])
    is_day_values = hourly.get("is_day", [])

    points: list[HistoricalWeatherPoint] = []

    for index, raw_timestamp in enumerate(times):
        try:
            timestamp = datetime.fromisoformat(str(raw_timestamp))
        except ValueError:
            continue

        point = HistoricalWeatherPoint(
            timestamp=timestamp,
            hour_of_day=timestamp.hour,
            month=timestamp.month,
            temperature_c=_safe_float(
                temperatures[index] if index < len(temperatures) else None
            ),
            relative_humidity_pct=_safe_float(
                humidities[index] if index < len(humidities) else None
            ),
            wind_speed_m_s=_safe_float(
                wind_speeds[index] if index < len(wind_speeds) else None
            ),
            wind_direction_deg=_safe_float(
                wind_directions[index]
                if index < len(wind_directions)
                else None
            ),
            solar_irradiance_w_m2=_safe_float(
                solar[index] if index < len(solar) else None
            ),
            direct_radiation_w_m2=_safe_float(
                direct[index] if index < len(direct) else None
            ),
            diffuse_radiation_w_m2=_safe_float(
                diffuse[index] if index < len(diffuse) else None
            ),
            direct_normal_irradiance_w_m2=_safe_float(
                dni[index] if index < len(dni) else None
            ),
            cloud_cover_pct=_safe_float(
                cloud[index] if index < len(cloud) else None
            ),
            is_day=(
                bool(_safe_int(is_day_values[index]))
                if index < len(is_day_values)
                and is_day_values[index] is not None
                else None
            ),
        )

        points.append(point)

    return points


def _group_points_by_hour(
    points: list[HistoricalWeatherPoint],
    selected_month: int | None,
) -> dict[int, list[HistoricalWeatherPoint]]:
    """
    Group historical observations by hour of day.

    Example:
        all 00:00 observations -> group 0
        all 01:00 observations -> group 1
        ...
        all 23:00 observations -> group 23

    When a month is supplied, only that month is included.
    """
    groups: dict[int, list[HistoricalWeatherPoint]] = {
        hour: [] for hour in range(24)
    }

    for point in points:
        if selected_month is not None and point.month != selected_month:
            continue

        groups[point.hour_of_day].append(point)

    return groups


def _create_climate_profile(
    points: list[HistoricalWeatherPoint],
    selected_month: int | None,
) -> list[ClimateProfilePoint]:
    """
    Create a representative 24-hour historical climate profile.

    Each hour contains:
    - average temperature
    - historical minimum temperature
    - historical maximum temperature
    - average humidity
    - average wind speed
    - average solar radiation
    - average direct/diffuse radiation
    - average DNI
    - average cloud cover
    - daylight fraction
    """
    groups = _group_points_by_hour(points, selected_month)

    profile: list[ClimateProfilePoint] = []

    for hour in range(24):
        hourly_points = groups[hour]

        temperatures = [
            point.temperature_c
            for point in hourly_points
            if point.temperature_c is not None
        ]

        humidities = [
            point.relative_humidity_pct
            for point in hourly_points
            if point.relative_humidity_pct is not None
        ]

        wind_speeds = [
            point.wind_speed_m_s
            for point in hourly_points
            if point.wind_speed_m_s is not None
        ]

        solar_values = [
            point.solar_irradiance_w_m2
            for point in hourly_points
            if point.solar_irradiance_w_m2 is not None
        ]

        direct_values = [
            point.direct_radiation_w_m2
            for point in hourly_points
            if point.direct_radiation_w_m2 is not None
        ]

        diffuse_values = [
            point.diffuse_radiation_w_m2
            for point in hourly_points
            if point.diffuse_radiation_w_m2 is not None
        ]

        dni_values = [
            point.direct_normal_irradiance_w_m2
            for point in hourly_points
            if point.direct_normal_irradiance_w_m2 is not None
        ]

        cloud_values = [
            point.cloud_cover_pct
            for point in hourly_points
            if point.cloud_cover_pct is not None
        ]

        daylight_values = [
            1.0
            for point in hourly_points
            if point.is_day is True
        ]

        daylight_fraction = (
            len(daylight_values) / len(hourly_points)
            if hourly_points
            else None
        )

        profile.append(
            ClimateProfilePoint(
                hour_of_day=hour,
                sample_count=len(hourly_points),
                average_temperature_c=_mean(temperatures),
                minimum_temperature_c=_minimum(temperatures),
                maximum_temperature_c=_maximum(temperatures),
                average_relative_humidity_pct=_mean(humidities),
                average_wind_speed_m_s=_mean(wind_speeds),
                average_solar_irradiance_w_m2=_mean(solar_values),
                average_direct_radiation_w_m2=_mean(direct_values),
                average_diffuse_radiation_w_m2=_mean(diffuse_values),
                average_direct_normal_irradiance_w_m2=_mean(dni_values),
                average_cloud_cover_pct=_mean(cloud_values),
                daylight_fraction=daylight_fraction,
            )
        )

    return profile


async def get_historical_climate(
    request: HistoricalWeatherRequest,
) -> HistoricalClimateResult:
    """
    Fetch historical hourly weather from Open-Meteo and convert it into
    a representative hourly climate profile.

    The raw API data is intentionally converted immediately into a
    structured profile so the thermal engine can use the same conceptual
    weather representation without storing a large raw dataset.
    """

    if request.end_date < request.start_date:
        raise ValueError("end_date must be on or after start_date")

    query_params = {
        "latitude": request.latitude,
        "longitude": request.longitude,
        "start_date": request.start_date.isoformat(),
        "end_date": request.end_date.isoformat(),
        "hourly": ",".join(HOURLY_VARIABLES),
        "timezone": request.timezone,
        "wind_speed_unit": "ms",
        "temperature_unit": "celsius",
        "models": request.model,
    }

    timeout = httpx.Timeout(60.0)

    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.get(
            HISTORICAL_WEATHER_URL,
            params=query_params,
        )

    response.raise_for_status()

    payload = response.json()

    if "hourly" not in payload:
        raise ValueError(
            "Open-Meteo historical response did not contain hourly data."
        )

    points = _build_weather_points(payload)

    if not points:
        raise ValueError(
            "Open-Meteo returned no usable historical weather points."
        )

    filtered_points = [
        point
        for point in points
        if request.month is None or point.month == request.month
    ]

    if not filtered_points:
        raise ValueError(
            "No historical observations were available for the selected month."
        )

    climate_profile = _create_climate_profile(
        points,
        selected_month=request.month,
    )

    valid_timestamps = [point.timestamp for point in points]

    actual_start = min(valid_timestamps).date()
    actual_end = max(valid_timestamps).date()

    year_values = {point.timestamp.year for point in filtered_points}

    return HistoricalClimateResult(
        latitude=request.latitude,
        longitude=request.longitude,
        requested_start_date=request.start_date,
        requested_end_date=request.end_date,
        actual_start_date=actual_start,
        actual_end_date=actual_end,
        timezone=str(
            payload.get(
                "timezone",
                request.timezone,
            )
        ),
        model=request.model,
        elevation_m=(
            request.elevation_m
            if request.elevation_m is not None
            else _safe_float(payload.get("elevation"))
        ),
        years_available=len(year_values),
        hourly_samples=len(filtered_points),
        selected_month=request.month,
        profile_type=request.aggregation,
        climate_profile=climate_profile,
    )