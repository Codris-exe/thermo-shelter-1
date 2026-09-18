from fastapi import APIRouter

from app.schemas.solar import (
    SolarCalculationRequest,
    SolarCalculationResult,
    SolarSurfaceResult,
    SolarWindowResult,
)
from app.solar.model import calculate_solar


router = APIRouter(
    prefix="/api/solar",
    tags=["Solar"],
)


@router.post(
    "/calculate",
    response_model=SolarCalculationResult,
)
def calculate_solar_endpoint(
    request: SolarCalculationRequest,
) -> SolarCalculationResult:

    result = calculate_solar(request)

    surfaces = [
        SolarSurfaceResult(
            surface=surface.surface,
            azimuth_deg=surface.azimuth_deg,
            tilt_deg=surface.tilt_deg,
            area_m2=surface.area_m2,
            irradiance_w_m2=surface.irradiance_w_m2,
            incident_power_w=surface.incident_power_w,
            absorbed_power_w=surface.absorbed_power_w,
        )
        for surface in result.surfaces
    ]

    windows = [
        SolarWindowResult(
            wall=window.wall,
            area_m2=window.area_m2,
            irradiance_w_m2=window.irradiance_w_m2,
            solar_transmitted_power_w=(
                window.solar_transmitted_power_w
            ),
        )
        for window in result.windows
    ]

    return SolarCalculationResult(
        timestamp=result.timestamp,
        solar_zenith_deg=result.solar_zenith_deg,
        solar_azimuth_deg=result.solar_azimuth_deg,
        total_incident_power_w=(
            result.total_incident_power_w
        ),
        total_opaque_absorbed_power_w=(
            result.total_opaque_absorbed_power_w
        ),
        total_window_solar_gain_w=(
            result.total_window_solar_gain_w
        ),
        surfaces=surfaces,
        windows=windows,
    )