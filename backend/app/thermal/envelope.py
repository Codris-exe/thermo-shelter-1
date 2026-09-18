from dataclasses import dataclass

from app.schemas.design import MaterialAssembly
from app.thermal.materials import get_material


@dataclass(frozen=True)
class ThermalLayerResult:
    material_id: str
    thickness_m: float
    conductivity_w_mk: float
    resistance_m2k_w: float


@dataclass(frozen=True)
class AssemblyThermalResult:
    layers: list[ThermalLayerResult]
    r_inside_m2k_w: float
    r_outside_m2k_w: float
    r_total_m2k_w: float
    u_value_w_m2k: float


def calculate_assembly_thermal_properties(
    assembly: MaterialAssembly,
    r_inside_m2k_w: float = 0.12,
    r_outside_m2k_w: float = 0.03,
) -> AssemblyThermalResult:
    """Calculate R-total and U-value for a multilayer assembly."""

    layers: list[ThermalLayerResult] = []

    total_layer_resistance = 0.0

    for layer in assembly.layers:
        material = get_material(layer.material_id)

        resistance = (
            layer.thickness_m
            / material.thermal_conductivity_w_mk
        )

        total_layer_resistance += resistance

        layers.append(
            ThermalLayerResult(
                material_id=layer.material_id,
                thickness_m=layer.thickness_m,
                conductivity_w_mk=material.thermal_conductivity_w_mk,
                resistance_m2k_w=resistance,
            )
        )

    r_total = (
        r_inside_m2k_w
        + total_layer_resistance
        + r_outside_m2k_w
    )

    if r_total <= 0:
        raise ValueError("Total thermal resistance must be greater than zero.")

    u_value = 1.0 / r_total

    return AssemblyThermalResult(
        layers=layers,
        r_inside_m2k_w=r_inside_m2k_w,
        r_outside_m2k_w=r_outside_m2k_w,
        r_total_m2k_w=r_total,
        u_value_w_m2k=u_value,
    )


def heat_transfer_w(
    u_value_w_m2k: float,
    area_m2: float,
    inside_temperature_c: float,
    outside_temperature_c: float,
) -> float:
    """Calculate conductive heat transfer in watts.

    Positive result means heat flows from inside toward outside.
    Negative result means heat flows from outside toward inside.
    """

    return (
        u_value_w_m2k
        * area_m2
        * (inside_temperature_c - outside_temperature_c)
    )