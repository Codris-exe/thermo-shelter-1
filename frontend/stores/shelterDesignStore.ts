import { create } from "zustand";

export interface ShelterLocation {
  name: string;
  latitude: number;
  longitude: number;
  elevation_m: number | null;
  timezone: string | null;
  source: "gps" | "search" | "manual";
}

export interface MaterialLayer {
  material_id: string;
  thickness_m: number;
}

export interface MaterialOption {
  id: string;
  name: string;
  thermal_conductivity_w_mk: number;
  density_kg_m3: number;
  specific_heat_j_kgk: number;
  solar_absorptivity: number;
  emissivity: number;
  category: string;
  description: string;
}

export interface WindowConfig {
  wall: "north" | "south" | "east" | "west";
  width_m: number;
  height_m: number;
  u_value_w_m2k: number;
  solar_transmittance: number;
}

export interface DoorConfig {
  wall: "north" | "south" | "east" | "west";
  width_m: number;
  height_m: number;
  u_value_w_m2k: number;
}

export interface ThermalMassConfig {
  material_id: string;
  mass_kg: number;
  specific_heat_j_kgk: number;
  initial_temperature_c: number;
  coupling_w_per_k: number;
}

export interface ShelterDesignState {
  location: ShelterLocation;

  shape: "rectangular" | "square" | "cylindrical" | "dome";

  length_m: number;
  width_m: number;
  height_m: number;

  orientation_deg: number;

  wall_layers: MaterialLayer[];
  roof_layers: MaterialLayer[];
  floor_layers: MaterialLayer[];

  windows: WindowConfig[];
  doors: DoorConfig[];

  thermal_mass: ThermalMassConfig | null;

  ach: number;

  comfort_min_c: number;
  comfort_max_c: number;

  initial_indoor_temperature_c: number;

  /*
   * Material selection actions
   */
  setWallMaterial: (
    materialId: string,
  ) => void;

  setRoofMaterial: (
    materialId: string,
  ) => void;

  setFloorMaterial: (
    materialId: string,
  ) => void;

  setWallInsulationMaterial: (
    materialId: string,
  ) => void;

  setRoofInsulationMaterial: (
    materialId: string,
  ) => void;

  setThermalMassMaterial: (
    materialId: string,
  ) => void;

  /*
   * Existing design actions
   */
  setLocation: (
    location: ShelterLocation,
  ) => void;

  setDimensions: (
    dimensions: {
      length_m?: number;
      width_m?: number;
      height_m?: number;
    },
  ) => void;

  setOrientation: (
    orientation_deg: number,
  ) => void;

  setWallInsulationThicknessMm: (
    thickness_mm: number,
  ) => void;

  setRoofInsulationThicknessMm: (
    thickness_mm: number,
  ) => void;

  setInitialIndoorTemperature: (
    temperature_c: number,
  ) => void;
}


const DEFAULT_LOCATION: ShelterLocation = {
  name: "Leh, Ladakh",
  latitude: 34.1650,
  longitude: 77.5840,
  elevation_m: 3507,
  timezone: "Asia/Kolkata",
  source: "manual",
};


export const useShelterDesignStore =
  create<ShelterDesignState>((set) => ({

    location: DEFAULT_LOCATION,

    shape: "rectangular",

    length_m: 5,
    width_m: 4,
    height_m: 3,

    orientation_deg: 180,

    /*
     * Default wall assembly:
     *
     * Brick
     * Rock Wool
     * Gypsum
     */
    wall_layers: [
      {
        material_id: "brick",
        thickness_m: 0.20,
      },
      {
        material_id: "rock_wool",
        thickness_m: 0.10,
      },
      {
        material_id: "gypsum",
        thickness_m: 0.012,
      },
    ],

    /*
     * Default roof assembly:
     *
     * Concrete
     * Rock Wool
     */
    roof_layers: [
      {
        material_id: "concrete",
        thickness_m: 0.10,
      },
      {
        material_id: "rock_wool",
        thickness_m: 0.12,
      },
    ],

    /*
     * Default floor:
     *
     * Concrete
     */
    floor_layers: [
      {
        material_id: "concrete",
        thickness_m: 0.12,
      },
    ],

    windows: [
      {
        wall: "south",
        width_m: 1.5,
        height_m: 1.2,
        u_value_w_m2k: 2.7,
        solar_transmittance: 0.65,
      },
    ],

    doors: [
      {
        wall: "north",
        width_m: 0.9,
        height_m: 2.1,
        u_value_w_m2k: 1.8,
      },
    ],

    thermal_mass: {
      material_id: "stone",
      mass_kg: 1000,
      specific_heat_j_kgk: 800,
      initial_temperature_c: 12,
      coupling_w_per_k: 5,
    },

    ach: 0.5,

    comfort_min_c: 18,

    comfort_max_c: 26,

    initial_indoor_temperature_c: 18,


    /*
     * ---------------------------------------------------------
     * MATERIAL SELECTION
     * ---------------------------------------------------------
     */

    setWallMaterial: (
      materialId,
    ) =>
      set((state) => {
        /*
         * Change the primary structural/wall material.
         *
         * We deliberately only replace the first wall layer.
         * Existing insulation and interior layers remain intact.
         */
        if (state.wall_layers.length === 0) {
          return {
            wall_layers: [
              {
                material_id: materialId,
                thickness_m: 0.20,
              },
            ],
          };
        }

        const layers = [...state.wall_layers];

        layers[0] = {
          ...layers[0],
          material_id: materialId,
        };

        return {
          wall_layers: layers,
        };
      }),


    setRoofMaterial: (
      materialId,
    ) =>
      set((state) => {
        /*
         * Change the primary roof material.
         */
        if (state.roof_layers.length === 0) {
          return {
            roof_layers: [
              {
                material_id: materialId,
                thickness_m: 0.10,
              },
            ],
          };
        }

        const layers = [...state.roof_layers];

        layers[0] = {
          ...layers[0],
          material_id: materialId,
        };

        return {
          roof_layers: layers,
        };
      }),


    setFloorMaterial: (
      materialId,
    ) =>
      set((state) => {
        /*
         * Change the primary floor material.
         */
        if (state.floor_layers.length === 0) {
          return {
            floor_layers: [
              {
                material_id: materialId,
                thickness_m: 0.12,
              },
            ],
          };
        }

        const layers = [...state.floor_layers];

        layers[0] = {
          ...layers[0],
          material_id: materialId,
        };

        return {
          floor_layers: layers,
        };
      }),


    setWallInsulationMaterial: (
      materialId,
    ) =>
      set((state) => {
        /*
         * Find the existing insulation layer.
         *
         * If one exists, change only its material.
         *
         * If none exists, add a 100 mm insulation layer.
         */
        const insulationIndex =
          state.wall_layers.findIndex(
            (layer) =>
              [
                "rock_wool",
                "glass_wool",
                "eps",
                "xps",
                "polyurethane",
                "cellulose",
                "straw_bale",
              ].includes(layer.material_id),
          );

        if (insulationIndex >= 0) {
          const layers = [
            ...state.wall_layers,
          ];

          layers[insulationIndex] = {
            ...layers[insulationIndex],
            material_id: materialId,
          };

          return {
            wall_layers: layers,
          };
        }

        return {
          wall_layers: [
            ...state.wall_layers,
            {
              material_id: materialId,
              thickness_m: 0.10,
            },
          ],
        };
      }),


    setRoofInsulationMaterial: (
      materialId,
    ) =>
      set((state) => {
        /*
         * Find the existing roof insulation.
         */
        const insulationIndex =
          state.roof_layers.findIndex(
            (layer) =>
              [
                "rock_wool",
                "glass_wool",
                "eps",
                "xps",
                "polyurethane",
                "cellulose",
                "straw_bale",
              ].includes(layer.material_id),
          );

        if (insulationIndex >= 0) {
          const layers = [
            ...state.roof_layers,
          ];

          layers[insulationIndex] = {
            ...layers[insulationIndex],
            material_id: materialId,
          };

          return {
            roof_layers: layers,
          };
        }

        return {
          roof_layers: [
            ...state.roof_layers,
            {
              material_id: materialId,
              thickness_m: 0.10,
            },
          ],
        };
      }),


    setThermalMassMaterial: (
      materialId,
    ) =>
      set((state) => {
        if (!state.thermal_mass) {
          return {
            thermal_mass: {
              material_id: materialId,
              mass_kg: 1000,
              specific_heat_j_kgk: 800,
              initial_temperature_c: 12,
              coupling_w_per_k: 5,
            },
          };
        }

        return {
          thermal_mass: {
            ...state.thermal_mass,
            material_id: materialId,
          },
        };
      }),


    /*
     * ---------------------------------------------------------
     * EXISTING DESIGN ACTIONS
     * ---------------------------------------------------------
     */

    setLocation: (location) =>
      set({
        location,
      }),


    setDimensions: ({
      length_m,
      width_m,
      height_m,
    }) =>
      set((state) => ({
        length_m:
          length_m ??
          state.length_m,

        width_m:
          width_m ??
          state.width_m,

        height_m:
          height_m ??
          state.height_m,
      })),


    setOrientation: (
      orientation_deg,
    ) =>
      set({
        orientation_deg,
      }),


    setWallInsulationThicknessMm: (
      thickness_mm,
    ) =>
      set((state) => ({
        wall_layers:
          state.wall_layers.map(
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
              )
                ? {
                    ...layer,
                    thickness_m:
                      thickness_mm /
                      1000,
                  }
                : layer,
          ),
      })),


    setRoofInsulationThicknessMm: (
      thickness_mm,
    ) =>
      set((state) => ({
        roof_layers:
          state.roof_layers.map(
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
              )
                ? {
                    ...layer,
                    thickness_m:
                      thickness_mm /
                      1000,
                  }
                : layer,
          ),
      })),


    setInitialIndoorTemperature: (
      temperature_c,
    ) =>
      set({
        initial_indoor_temperature_c:
          temperature_c,
      }),
  }));