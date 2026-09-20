"use client";

import { useEffect, useMemo, useState } from "react";

import {
  fetchMaterials,
  type MaterialOption,
} from "../lib/materials";

import { useShelterDesignStore } from "../stores/shelterDesignStore";


type MaterialSelectorProps = {
  title: string;
  description?: string;
  type:
    | "wall"
    | "wall-insulation"
    | "roof"
    | "roof-insulation"
    | "floor"
    | "thermal-mass";
};


const CATEGORY_MAP: Record<
  MaterialSelectorProps["type"],
  string[]
> = {
  wall: [
    "wall",
    "structural",
    "alternative",
  ],

  "wall-insulation": [
    "insulation",
    "alternative",
  ],

  roof: [
    "structural",
    "wall",
    "alternative",
  ],

  "roof-insulation": [
    "insulation",
    "alternative",
  ],

  floor: [
    "structural",
    "wall",
  ],

  "thermal-mass": [
    "wall",
    "structural",
    "alternative",
  ],
};


export default function MaterialSelector({
  title,
  description,
  type,
}: MaterialSelectorProps) {

  const [
    materials,
    setMaterials,
  ] = useState<MaterialOption[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(null);


  const wallLayers =
    useShelterDesignStore(
      (state) => state.wall_layers,
    );

  const roofLayers =
    useShelterDesignStore(
      (state) => state.roof_layers,
    );

  const floorLayers =
    useShelterDesignStore(
      (state) => state.floor_layers,
    );

  const thermalMass =
    useShelterDesignStore(
      (state) => state.thermal_mass,
    );


  const setWallMaterial =
    useShelterDesignStore(
      (state) => state.setWallMaterial,
    );

  const setRoofMaterial =
    useShelterDesignStore(
      (state) => state.setRoofMaterial,
    );

  const setFloorMaterial =
    useShelterDesignStore(
      (state) => state.setFloorMaterial,
    );

  const setWallInsulationMaterial =
    useShelterDesignStore(
      (state) =>
        state.setWallInsulationMaterial,
    );

  const setRoofInsulationMaterial =
    useShelterDesignStore(
      (state) =>
        state.setRoofInsulationMaterial,
    );

  const setThermalMassMaterial =
    useShelterDesignStore(
      (state) =>
        state.setThermalMassMaterial,
    );


  /*
   * Load materials from backend.
   */
  useEffect(() => {

    let mounted = true;

    async function loadMaterials() {

      try {

        setLoading(true);
        setError(null);

        const data =
          await fetchMaterials();

        if (mounted) {
          setMaterials(data);
        }

      } catch (err) {

        if (mounted) {

          setError(
            err instanceof Error
              ? err.message
              : "Unable to load materials.",
          );

        }

      } finally {

        if (mounted) {
          setLoading(false);
        }

      }
    }

    loadMaterials();

    return () => {
      mounted = false;
    };

  }, []);


  /*
   * Filter materials according to
   * the purpose of this selector.
   */
  const availableMaterials =
    useMemo(() => {

      const categories =
        CATEGORY_MAP[type];

      return materials.filter(
        (material) =>
          categories.includes(
            material.category,
          ),
      );

    }, [materials, type]);


  /*
   * Determine currently selected material.
   */
  const selectedMaterialId =
    useMemo(() => {

      switch (type) {

        case "wall":
          return (
            wallLayers[0]
              ?.material_id ?? ""
          );

        case "wall-insulation":
          return (
            wallLayers.find(
              (layer) =>
                [
                  "rock_wool",
                  "glass_wool",
                  "eps",
                  "xps",
                  "polyurethane",
                  "cellulose",
                  "straw_bale",
                ].includes(
                  layer.material_id,
                ),
            )?.material_id ?? ""
          );

        case "roof":
          return (
            roofLayers[0]
              ?.material_id ?? ""
          );

        case "roof-insulation":
          return (
            roofLayers.find(
              (layer) =>
                [
                  "rock_wool",
                  "glass_wool",
                  "eps",
                  "xps",
                  "polyurethane",
                  "cellulose",
                  "straw_bale",
                ].includes(
                  layer.material_id,
                ),
            )?.material_id ?? ""
          );

        case "floor":
          return (
            floorLayers[0]
              ?.material_id ?? ""
          );

        case "thermal-mass":
          return (
            thermalMass
              ?.material_id ?? ""
          );

        default:
          return "";

      }

    }, [
      type,
      wallLayers,
      roofLayers,
      floorLayers,
      thermalMass,
    ]);


  function handleChange(
    materialId: string,
  ) {

    switch (type) {

      case "wall":
        setWallMaterial(materialId);
        break;

      case "wall-insulation":
        setWallInsulationMaterial(
          materialId,
        );
        break;

      case "roof":
        setRoofMaterial(materialId);
        break;

      case "roof-insulation":
        setRoofInsulationMaterial(
          materialId,
        );
        break;

      case "floor":
        setFloorMaterial(materialId);
        break;

      case "thermal-mass":
        setThermalMassMaterial(
          materialId,
        );
        break;

    }

  }


  const selectedMaterial =
    materials.find(
      (material) =>
        material.id ===
        selectedMaterialId,
    );


  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">

      <div className="mb-4">

        <h3 className="text-sm font-semibold text-stone-900">
          {title}
        </h3>

        {description && (
          <p className="mt-1 text-xs leading-5 text-stone-500">
            {description}
          </p>
        )}

      </div>


      {loading ? (

        <div className="rounded-xl bg-stone-50 px-4 py-3 text-sm text-stone-500">
          Loading materials...
        </div>

      ) : error ? (

        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>

      ) : (

        <>
          <select
            value={selectedMaterialId}
            onChange={(event) =>
              handleChange(
                event.target.value,
              )
            }
            className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-stone-400 focus:ring-2 focus:ring-stone-100"
          >

            <option value="">
              Select material
            </option>

            {availableMaterials.map(
              (material) => (

                <option
                  key={material.id}
                  value={material.id}
                >
                  {material.name}
                </option>

              ),
            )}

          </select>


          {selectedMaterial && (

            <div className="mt-4 rounded-xl bg-stone-50 p-4">

              <p className="text-xs leading-5 text-stone-600">
                {selectedMaterial.description}
              </p>


              <div className="mt-3 grid grid-cols-3 gap-2">

                <div>
                  <p className="text-[10px] uppercase tracking-wide text-stone-400">
                    Conductivity
                  </p>

                  <p className="mt-1 text-xs font-medium text-stone-800">
                    {selectedMaterial.thermal_conductivity_w_mk.toFixed(
                      3,
                    )}{" "}
                    W/m·K
                  </p>
                </div>


                <div>
                  <p className="text-[10px] uppercase tracking-wide text-stone-400">
                    Density
                  </p>

                  <p className="mt-1 text-xs font-medium text-stone-800">
                    {selectedMaterial.density_kg_m3.toLocaleString()}{" "}
                    kg/m³
                  </p>
                </div>


                <div>
                  <p className="text-[10px] uppercase tracking-wide text-stone-400">
                    Heat Capacity
                  </p>

                  <p className="mt-1 text-xs font-medium text-stone-800">
                    {selectedMaterial.specific_heat_j_kgk.toLocaleString()}{" "}
                    J/kg·K
                  </p>
                </div>

              </div>

            </div>

          )}

        </>

      )}

    </div>
  );
}