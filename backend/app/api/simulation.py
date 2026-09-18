from fastapi import APIRouter

from app.schemas.simulation import (
    HeatBalanceRequest,
    HeatBalanceResult,
    SimulationRequest,
    SimulationResult,
)
from app.thermal.heat_balance import calculate_heat_balance
from app.thermal.simulation import run_transient_simulation


router = APIRouter(
    prefix="/api/simulations",
    tags=["Simulations"],
)


@router.post(
    "/heat-balance",
    response_model=HeatBalanceResult,
)
def calculate_heat_balance_endpoint(
    request: HeatBalanceRequest,
) -> HeatBalanceResult:

    result = calculate_heat_balance(request)

    return HeatBalanceResult(
        timestamp=request.weather.timestamp,

        wall_heat_transfer_w=result.wall_w,
        roof_heat_transfer_w=result.roof_w,
        floor_heat_transfer_w=result.floor_w,

        window_heat_transfer_w=result.windows_w,
        door_heat_transfer_w=result.doors_w,

        ventilation_heat_transfer_w=result.ventilation_w,

        conductive_heat_transfer_w=result.conductive_w,
        total_heat_loss_w=result.total_loss_w,

        solar_gain_w=result.solar_gain_w,
        internal_heat_gain_w=result.internal_gain_w,

        net_heat_gain_w=result.net_gain_w,

        indoor_temperature_c=request.indoor_temperature_c,
        outdoor_temperature_c=(
            request.weather.outdoor_temperature_c
        ),
    )


@router.post(
    "/run",
    response_model=SimulationResult,
)
def run_simulation(
    request: SimulationRequest,
) -> SimulationResult:

    return run_transient_simulation(request)