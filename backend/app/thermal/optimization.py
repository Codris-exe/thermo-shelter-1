from __future__ import annotations

from app.schemas.design import MaterialLayer, ShelterDesign
from app.schemas.optimization import (
    OptimizationCandidate,
    OptimizationRequest,
    OptimizationResult,
)
from app.schemas.simulation import SimulationRequest, WeatherPoint
from app.thermal.simulation import run_transient_simulation


INSULATION_MATERIALS = {
    "rock_wool",
    "eps",
    "xps",
}


def _update_insulation_layers(
    layers: list[MaterialLayer],
    thickness_mm: float,
) -> list[MaterialLayer]:
    """
    Update the first recognised insulation layer.

    If the assembly does not already contain an insulation layer,
    a rock-wool layer is added.
    """
    thickness_m = thickness_mm / 1000.0

    updated_layers = [
        layer.model_copy(deep=True)
        for layer in layers
    ]

    for layer in updated_layers:
        if layer.material_id in INSULATION_MATERIALS:
            layer.thickness_m = thickness_m
            return updated_layers

    updated_layers.append(
        MaterialLayer(
            material_id="rock_wool",
            thickness_m=thickness_m,
        )
    )

    return updated_layers


def _build_candidate_design(
    base_design: ShelterDesign,
    orientation_deg: float,
    wall_insulation_thickness_mm: float,
    roof_insulation_thickness_mm: float,
) -> ShelterDesign:
    """
    Create an independent candidate design.
    """
    candidate = base_design.model_copy(deep=True)

    candidate.orientation_deg = orientation_deg

    candidate.wall_assembly.layers = (
        _update_insulation_layers(
            candidate.wall_assembly.layers,
            wall_insulation_thickness_mm,
        )
    )

    candidate.roof_assembly.layers = (
        _update_insulation_layers(
            candidate.roof_assembly.layers,
            roof_insulation_thickness_mm,
        )
    )

    return candidate


def _run_candidate(
    design: ShelterDesign,
    weather: list[WeatherPoint],
    initial_indoor_temperature_c: float,
    internal_heat_gain_w: float,
    timestep_minutes: int,
) -> OptimizationCandidate:
    simulation_request = SimulationRequest(
        design=design,
        initial_indoor_temperature_c=(
            initial_indoor_temperature_c
        ),
        weather=weather,
        internal_heat_gain_w=internal_heat_gain_w,
        timestep_minutes=timestep_minutes,
    )

    result = run_transient_simulation(
        simulation_request
    )

    wall_insulation = next(
        (
            layer.thickness_m * 1000
            for layer in design.wall_assembly.layers
            if layer.material_id in INSULATION_MATERIALS
        ),
        0.0,
    )

    roof_insulation = next(
        (
            layer.thickness_m * 1000
            for layer in design.roof_assembly.layers
            if layer.material_id in INSULATION_MATERIALS
        ),
        0.0,
    )

    return OptimizationCandidate(
        rank=0,
        orientation_deg=design.orientation_deg,
        wall_insulation_thickness_mm=wall_insulation,
        roof_insulation_thickness_mm=roof_insulation,
        comfort_percentage=result.comfort_percentage,
        comfort_hours=result.comfort_hours,
        minimum_indoor_temperature_c=(
            result.minimum_indoor_temperature_c
        ),
        maximum_indoor_temperature_c=(
            result.maximum_indoor_temperature_c
        ),
        final_indoor_temperature_c=(
            result.final_indoor_temperature_c
        ),
    )


def _sort_candidates(
    candidates: list[OptimizationCandidate],
) -> list[OptimizationCandidate]:
    """
    Rank candidates using the following deterministic objective:

    1. Maximise comfort percentage.
    2. Maximise comfort hours.
    3. Minimise indoor temperature range.
    """
    return sorted(
        candidates,
        key=lambda candidate: (
            -candidate.comfort_percentage,
            -candidate.comfort_hours,
            (
                candidate.maximum_indoor_temperature_c
                - candidate.minimum_indoor_temperature_c
            ),
        ),
    )


def run_optimization(
    request: OptimizationRequest,
) -> OptimizationResult:
    if not request.wall_insulation_thicknesses_mm:
        raise ValueError(
            "At least one wall insulation thickness is required."
        )

    if not request.roof_insulation_thicknesses_mm:
        raise ValueError(
            "At least one roof insulation thickness is required."
        )

    if not request.orientations_deg:
        raise ValueError(
            "At least one orientation is required."
        )

    # ---------------------------------------------------------
    # Baseline simulation
    # ---------------------------------------------------------
    baseline_request = SimulationRequest(
        design=request.design,
        initial_indoor_temperature_c=(
            request.initial_indoor_temperature_c
        ),
        weather=request.weather,
        internal_heat_gain_w=request.internal_heat_gain_w,
        timestep_minutes=request.timestep_minutes,
    )

    baseline_result = run_transient_simulation(
        baseline_request
    )

    # ---------------------------------------------------------
    # Candidate simulations
    # ---------------------------------------------------------
    candidates: list[OptimizationCandidate] = []

    for orientation_deg in request.orientations_deg:
        for wall_thickness_mm in (
            request.wall_insulation_thicknesses_mm
        ):
            for roof_thickness_mm in (
                request.roof_insulation_thicknesses_mm
            ):
                candidate_design = (
                    _build_candidate_design(
                        base_design=request.design,
                        orientation_deg=orientation_deg,
                        wall_insulation_thickness_mm=(
                            wall_thickness_mm
                        ),
                        roof_insulation_thickness_mm=(
                            roof_thickness_mm
                        ),
                    )
                )

                candidate = _run_candidate(
                    design=candidate_design,
                    weather=request.weather,
                    initial_indoor_temperature_c=(
                        request.initial_indoor_temperature_c
                    ),
                    internal_heat_gain_w=(
                        request.internal_heat_gain_w
                    ),
                    timestep_minutes=(
                        request.timestep_minutes
                    ),
                )

                candidates.append(candidate)

    if not candidates:
        raise ValueError(
            "Optimization produced no candidate designs."
        )

    # ---------------------------------------------------------
    # Ranking
    # ---------------------------------------------------------
    ranked_candidates = _sort_candidates(
        candidates
    )

    ranked_candidates = [
        candidate.model_copy(
            update={"rank": index}
        )
        for index, candidate in enumerate(
            ranked_candidates,
            start=1,
        )
    ]

    return OptimizationResult(
        total_candidates_tested=len(
            ranked_candidates
        ),
        baseline_comfort_percentage=(
            baseline_result.comfort_percentage
        ),
        best_candidate=ranked_candidates[0],
        candidates=ranked_candidates,
    )