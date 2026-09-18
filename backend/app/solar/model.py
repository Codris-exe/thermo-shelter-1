from dataclasses import dataclass
from datetime import datetime
from zoneinfo import ZoneInfo

import pandas as pd
import pvlib

from app.schemas.design import ShelterDesign
from app.schemas.solar import (
    SolarCalculationRequest,
)


@dataclass(frozen=True)
class SolarSurfaceCalculation:
    surface: str
    azimuth_deg: float
    tilt_deg: float
    area_m2: float
    irradiance_w_m2: float
    incident_power_w: float
    absorbed_power_w: float


@dataclass(frozen=True)
class SolarWindowCalculation:
    wall: str
    area_m2: float
    irradiance_w_m2: float
    solar_transmitted_power_w: float


@dataclass(frozen=True)
class SolarCalculation:
    timestamp: datetime
    solar_zenith_deg: float
    solar_azimuth_deg: float
    total_incident_power_w: float
    total_opaque_absorbed_power_w: float
    total_window_solar_gain_w: float
    surfaces: list[SolarSurfaceCalculation]
    windows: list[SolarWindowCalculation]


# The shelter orientation is defined as:
#
#   180° = south-facing primary facade
#   0°   = north-facing primary facade
#   90°  = east-facing primary facade
#   270° = west-facing primary facade
#
# This keeps the existing Thermo Shelter convention
# intuitive for the solar model.


def _wall_azimuths(
    orientation_deg: float,
) -> dict[str, float]:
    """
    Calculate geographic azimuth of each wall.

    Returns the direction that each wall faces.
    """

    south = orientation_deg % 360

    north = (south + 180) % 360
    east = (south - 90) % 360
    west = (south + 90) % 360

    return {
        "north": north,
        "south": south,
        "east": east,
        "west": west,
    }


def _ensure_timezone(
    timestamp: datetime,
    timezone_name: str,
) -> pd.Timestamp:
    """
    Convert a Python datetime to a timezone-aware
    pandas timestamp.
    """

    timestamp_pd = pd.Timestamp(timestamp)

    if timestamp_pd.tzinfo is None:
        timestamp_pd = timestamp_pd.tz_localize(
            ZoneInfo(timezone_name)
        )
    else:
        timestamp_pd = timestamp_pd.tz_convert(
            ZoneInfo(timezone_name)
        )

    return timestamp_pd


def _calculate_surface_irradiance(
    solar_zenith_deg: float,
    solar_azimuth_deg: float,
    surface_azimuth_deg: float,
    surface_tilt_deg: float,
    ghi_w_m2: float,
    dni_w_m2: float,
    dhi_w_m2: float,
) -> float:
    """
    Calculate irradiance incident on a specific surface.

    Uses pvlib's plane-of-array irradiance model.
    """

    if solar_zenith_deg >= 90:
        return 0.0

    poa = pvlib.irradiance.get_total_irradiance(
        surface_tilt=surface_tilt_deg,
        surface_azimuth=surface_azimuth_deg,
        solar_zenith=solar_zenith_deg,
        solar_azimuth=solar_azimuth_deg,
        dni=max(dni_w_m2, 0.0),
        ghi=max(ghi_w_m2, 0.0),
        dhi=max(dhi_w_m2, 0.0),
        albedo=0.2,
        model="isotropic",
    )

    value = poa.get(
        "poa_global",
        0.0,
    )

    if value is None or pd.isna(value):
        return 0.0

    return max(float(value), 0.0)


def calculate_solar(
    request: SolarCalculationRequest,
) -> SolarCalculation:
    """
    Calculate solar position, surface irradiance,
    opaque-surface absorption and window-transmitted
    solar gain.
    """

    timezone_name = request.timezone or "UTC"

    timestamp = _ensure_timezone(
        request.timestamp,
        timezone_name,
    )

    solar_position = (
        pvlib.solarposition.get_solarposition(
            time=pd.DatetimeIndex([timestamp]),
            latitude=request.latitude,
            longitude=request.longitude,
        )
    )

    solar_zenith = float(
        solar_position["apparent_zenith"].iloc[0]
    )

    solar_azimuth = float(
        solar_position["azimuth"].iloc[0]
    )

    geometry = request.design.geometry

    if geometry.shape not in {
        "rectangular",
        "square",
    }:
        raise NotImplementedError(
            "Solar calculations currently support "
            "rectangular and square shelters."
        )

    length = geometry.length_m
    width = geometry.width_m
    height = geometry.height_m

    wall_areas = {
        "north": length * height,
        "south": length * height,
        "east": width * height,
        "west": width * height,
    }

    floor_area = length * width
    roof_area = floor_area

    wall_azimuths = _wall_azimuths(
        request.design.orientation_deg
    )

    surface_definitions = [
        (
            "north",
            wall_areas["north"],
            wall_azimuths["north"],
            90.0,
        ),
        (
            "south",
            wall_areas["south"],
            wall_azimuths["south"],
            90.0,
        ),
        (
            "east",
            wall_areas["east"],
            wall_azimuths["east"],
            90.0,
        ),
        (
            "west",
            wall_areas["west"],
            wall_azimuths["west"],
            90.0,
        ),
        (
            "roof",
            roof_area,
            180.0,
            0.0,
        ),
    ]

    surfaces: list[SolarSurfaceCalculation] = []

    total_incident_power_w = 0.0
    total_opaque_absorbed_power_w = 0.0

    surface_material_absorptivity = {
        "north": 0.60,
        "south": 0.60,
        "east": 0.60,
        "west": 0.60,
        "roof": 0.70,
    }

    for (
        surface_name,
        area_m2,
        azimuth_deg,
        tilt_deg,
    ) in surface_definitions:

        irradiance = _calculate_surface_irradiance(
            solar_zenith_deg=solar_zenith,
            solar_azimuth_deg=solar_azimuth,
            surface_azimuth_deg=azimuth_deg,
            surface_tilt_deg=tilt_deg,
            ghi_w_m2=request.solar_irradiance_w_m2,
            dni_w_m2=request.direct_normal_irradiance_w_m2,
            dhi_w_m2=request.diffuse_radiation_w_m2,
        )

        incident_power = (
            irradiance * area_m2
        )

        absorptivity = (
            surface_material_absorptivity[
                surface_name
            ]
        )

        absorbed_power = (
            incident_power * absorptivity
        )

        total_incident_power_w += (
            incident_power
        )

        total_opaque_absorbed_power_w += (
            absorbed_power
        )

        surfaces.append(
            SolarSurfaceCalculation(
                surface=surface_name,
                azimuth_deg=azimuth_deg,
                tilt_deg=tilt_deg,
                area_m2=area_m2,
                irradiance_w_m2=irradiance,
                incident_power_w=incident_power,
                absorbed_power_w=absorbed_power,
            )
        )

    # ---------------------------------------------------------
    # WINDOWS
    # ---------------------------------------------------------

    windows: list[SolarWindowCalculation] = []

    total_window_solar_gain_w = 0.0

    for window in request.design.windows:

        wall_azimuth = wall_azimuths[
            window.wall
        ]

        wall_irradiance = (
            _calculate_surface_irradiance(
                solar_zenith_deg=solar_zenith,
                solar_azimuth_deg=solar_azimuth,
                surface_azimuth_deg=wall_azimuth,
                surface_tilt_deg=90.0,
                ghi_w_m2=request.solar_irradiance_w_m2,
                dni_w_m2=request.direct_normal_irradiance_w_m2,
                dhi_w_m2=request.diffuse_radiation_w_m2,
            )
        )

        window_area = (
            window.width_m
            * window.height_m
        )

        transmitted_power = (
            wall_irradiance
            * window_area
            * window.solar_transmittance
        )

        total_window_solar_gain_w += (
            transmitted_power
        )

        windows.append(
            SolarWindowCalculation(
                wall=window.wall,
                area_m2=window_area,
                irradiance_w_m2=wall_irradiance,
                solar_transmitted_power_w=(
                    transmitted_power
                ),
            )
        )

    return SolarCalculation(
        timestamp=request.timestamp,
        solar_zenith_deg=solar_zenith,
        solar_azimuth_deg=solar_azimuth,
        total_incident_power_w=(
            total_incident_power_w
        ),
        total_opaque_absorbed_power_w=(
            total_opaque_absorbed_power_w
        ),
        total_window_solar_gain_w=(
            total_window_solar_gain_w
        ),
        surfaces=surfaces,
        windows=windows,
    )