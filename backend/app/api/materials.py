from fastapi import APIRouter

from app.thermal.materials import MATERIALS


router = APIRouter(
    prefix="/api/materials",
    tags=["Materials"],
)


@router.get("")
def get_materials():
    """Return the complete material library for the frontend."""

    return [
        {
            "id": material_id,
            "name": material.name,
            "thermal_conductivity_w_mk": material.thermal_conductivity_w_mk,
            "density_kg_m3": material.density_kg_m3,
            "specific_heat_j_kgk": material.specific_heat_j_kgk,
            "solar_absorptivity": material.solar_absorptivity,
            "emissivity": material.emissivity,
            "category": material.category,
            "description": material.description,
        }
        for material_id, material in MATERIALS.items()
    ]