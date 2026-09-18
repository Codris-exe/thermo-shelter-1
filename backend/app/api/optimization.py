from fastapi import APIRouter, HTTPException

from app.schemas.optimization import (
    OptimizationRequest,
    OptimizationResult,
)
from app.thermal.optimization import run_optimization


router = APIRouter(
    prefix="/api/optimization",
    tags=["Optimization"],
)


@router.post(
    "/run",
    response_model=OptimizationResult,
)
def run_optimization_endpoint(
    request: OptimizationRequest,
) -> OptimizationResult:
    try:
        return run_optimization(request)

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Optimization failed: {exc}",
        ) from exc