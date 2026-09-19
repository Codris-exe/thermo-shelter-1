"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";

const Shelter3D = dynamic(() => import("@/components/Shelter3D"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">
      Loading 3D Scene...
    </div>
  ),
});
import ThermalResultsChart from "@/components/ThermalResultsChart";
import WeatherSummaryCard from "@/components/WeatherSummaryCard";
import OptimizationResultsTable from "@/components/OptimizationResultsTable";
import DesignComparisonCard from "@/components/DesignComparisonCard";
import ReportButton from "@/components/ReportButton";
import ModelAssumptionsCard from "@/components/ModelAssumptionsCard";
import AnalysisPipelineCard from "@/components/AnalysisPipelineCard";
import { useShelterDesignStore } from "@/stores/shelterDesignStore";

const API_BASE = "/backend-api";

interface WeatherPoint {
  timestamp: string;
  outdoor_temperature_c: number;
  wind_speed_m_s?: number;
  solar_irradiance_w_m2?: number;
  direct_radiation_w_m2?: number;
  diffuse_radiation_w_m2?: number;
  direct_normal_irradiance_w_m2?: number;
  cloud_cover_pct?: number | null;
  is_day?: boolean;
  relative_humidity_pct?: number | null;
  ground_temperature_c?: number | null;
}

interface MaterialLayer {
  material_id: string;
  thickness_m: number;
}

interface SimulationPoint {
  timestamp: string;
  indoor_temperature_c: number;
  thermal_mass_temperature_c: number;
  outdoor_temperature_c: number;
  solar_irradiance_w_m2: number;
  solar_gain_w: number;
  wall_heat_transfer_w: number;
  roof_heat_transfer_w: number;
  floor_heat_transfer_w: number;
  window_heat_transfer_w: number;
  door_heat_transfer_w: number;
  ventilation_heat_transfer_w: number;
  thermal_mass_heat_transfer_w: number;
  total_heat_loss_w: number;
  net_heat_gain_w: number;
}

interface SimulationResult {
  initial_indoor_temperature_c: number;
  final_indoor_temperature_c: number;
  minimum_indoor_temperature_c: number;
  maximum_indoor_temperature_c: number;
  initial_thermal_mass_temperature_c: number | null;
  final_thermal_mass_temperature_c: number | null;
  minimum_thermal_mass_temperature_c: number | null;
  maximum_thermal_mass_temperature_c: number | null;
  comfort_hours: number;
  cold_hours: number;
  hot_hours: number;
  comfort_percentage: number;
  points: SimulationPoint[];
}

interface OptimizationCandidate {
  rank: number;
  orientation_deg: number;
  wall_insulation_thickness_mm: number;
  roof_insulation_thickness_mm: number;
  comfort_percentage: number;
  comfort_hours: number;
  minimum_indoor_temperature_c: number;
  maximum_indoor_temperature_c: number;
  final_indoor_temperature_c: number;
}

interface OptimizationResult {
  total_candidates_tested: number;
  baseline_comfort_percentage: number;
  best_candidate: OptimizationCandidate;
  candidates: OptimizationCandidate[];
}

interface DesignSnapshot {
  orientation_deg: number;
  wall_insulation_thickness_mm: number;
  roof_insulation_thickness_mm: number;
  comfort_percentage?: number | null;
  minimum_indoor_temperature_c?: number | null;
  maximum_indoor_temperature_c?: number | null;
}

const MATERIAL_K: Record<string, number> = {
  brick: 0.72,
  concrete: 1.4,
  stone: 1.7,
  wood: 0.13,
  eps: 0.035,
  xps: 0.03,
  rock_wool: 0.04,
  gypsum: 0.17,
  adobe: 0.43,
};

const INSULATION_MATERIALS = new Set([
  "rock_wool",
  "eps",
  "xps",
]);

function calculateAssembly(layers: MaterialLayer[]) {
  const rInterior = 0.12;
  const rExterior = 0.03;

  const materialResistance = layers.reduce(
    (sum, layer) => {
      const conductivity =
        MATERIAL_K[layer.material_id] ?? 0.1;

      return (
        sum +
        layer.thickness_m / conductivity
      );
    },
    0,
  );

  const totalR =
    rInterior +
    materialResistance +
    rExterior;

  const uValue =
    totalR > 0 ? 1 / totalR : 0;

  const thickness = layers.reduce(
    (sum, layer) =>
      sum + layer.thickness_m,
    0,
  );

  return {
    rValue: totalR,
    uValue,
    thickness,
  };
}

function getInsulationThicknessMm(
  layers: MaterialLayer[],
  fallbackMm: number,
) {
  const insulationLayer = layers.find(
    (layer) =>
      INSULATION_MATERIALS.has(
        layer.material_id,
      ),
  );

  return insulationLayer
    ? insulationLayer.thickness_m * 1000
    : fallbackMm;
}

function updateInsulationLayers(
  layers: MaterialLayer[],
  thicknessMm: number,
): MaterialLayer[] {
  const thicknessM = thicknessMm / 1000;

  const updated = layers.map(
    (layer) => ({
      ...layer,
    }),
  );

  const existingIndex =
    updated.findIndex(
      (layer) =>
        INSULATION_MATERIALS.has(
          layer.material_id,
        ),
    );

  if (existingIndex >= 0) {
    updated[existingIndex] = {
      ...updated[existingIndex],
      thickness_m: thicknessM,
    };

    return updated;
  }

  updated.push({
    material_id: "rock_wool",
    thickness_m: thicknessM,
  });

  return updated;
}

export default function ThreeDPage() {
  const {
    location,
    shape,
    length_m,
    width_m,
    height_m,
    orientation_deg,
    wall_layers,
    roof_layers,
    floor_layers,
    windows,
    doors,
    thermal_mass,
    ach,
    comfort_min_c,
    comfort_max_c,
    initial_indoor_temperature_c,
    setDimensions,
    setOrientation,
    setWallInsulationThicknessMm,
    setRoofInsulationThicknessMm,
    setInitialIndoorTemperature,
  } = useShelterDesignStore();

  const [weatherPoints, setWeatherPoints] =
    useState<WeatherPoint[]>([]);

  const [simulationResult, setSimulationResult] =
    useState<SimulationResult | null>(
      null,
    );

  const [optimizationResult, setOptimizationResult] =
    useState<OptimizationResult | null>(
      null,
    );

  const [baselineDesign, setBaselineDesign] =
    useState<DesignSnapshot | null>(
      null,
    );

  const [baselineForReset, setBaselineForReset] =
    useState<{
      orientation_deg: number;
      wall_insulation_thickness_mm: number;
      roof_insulation_thickness_mm: number;
    } | null>(null);

  const [isApplied, setIsApplied] =
    useState(false);

  const [isSimulating, setIsSimulating] =
    useState(false);

  const [isOptimizing, setIsOptimizing] =
    useState(false);

  const [isApplyingOptimization, setIsApplyingOptimization] =
    useState(false);

  const [isResetting, setIsResetting] =
    useState(false);

  const [error, setError] = useState("");

  const wallAssembly = useMemo(
    () =>
      calculateAssembly(
        wall_layers,
      ),
    [wall_layers],
  );

  const roofAssembly = useMemo(
    () =>
      calculateAssembly(
        roof_layers,
      ),
    [roof_layers],
  );

  function buildDesignPayload(
    overrides?: {
      orientation_deg?: number;
      wall_layers?: MaterialLayer[];
      roof_layers?: MaterialLayer[];
    },
  ) {
    return {
      location: {
        name: location.name,
        latitude: location.latitude,
        longitude: location.longitude,
        elevation_m: location.elevation_m,
        timezone: location.timezone,
        source: location.source,
      },

      geometry: {
        shape,
        length_m,
        width_m,
        height_m,
      },

      orientation_deg:
        overrides?.orientation_deg ??
        orientation_deg,

      wall_assembly: {
        layers:
          overrides?.wall_layers ??
          wall_layers,
      },

      roof_assembly: {
        layers:
          overrides?.roof_layers ??
          roof_layers,
      },

      floor_assembly: {
        layers: floor_layers,
      },

      windows,
      doors,
      thermal_mass,

      ventilation: {
        ach,
      },

      comfort: {
        minimum_c:
          comfort_min_c,
        maximum_c:
          comfort_max_c,
      },
    };
  }

  async function fetchWeather(): Promise<
    WeatherPoint[]
  > {
    const response =
      await fetch(
        `${API_BASE}/api/weather/forecast?latitude=${location.latitude}&longitude=${location.longitude}&hours=24`,
      );

    if (!response.ok) {
      throw new Error(
        "Unable to fetch real weather data.",
      );
    }

    const data =
      await response.json();

    const points: WeatherPoint[] =
      data.points ??
      data.data ??
      data;

    if (
      !Array.isArray(points) ||
      points.length < 2
    ) {
      throw new Error(
        "Not enough weather data was returned.",
      );
    }

    setWeatherPoints(points);

    return points;
  }

  async function runSimulationForDesign(
    designPayload: ReturnType<
      typeof buildDesignPayload
    >,
    simulationWeather: WeatherPoint[],
  ) {
    const response =
      await fetch(
        `${API_BASE}/api/simulations/run`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            design:
              designPayload,

            initial_indoor_temperature_c:
              initial_indoor_temperature_c,

            weather:
              simulationWeather,

            internal_heat_gain_w:
              0,

            timestep_minutes:
              60,
          }),
        },
      );

    if (!response.ok) {
      const message =
        await response.text();

      throw new Error(
        message ||
          "Thermal simulation failed.",
      );
    }

    return (await response.json()) as SimulationResult;
  }

  async function runThermalSimulation() {
    setIsSimulating(true);
    setError("");

    try {
      const points =
        await fetchWeather();

      const result =
        await runSimulationForDesign(
          buildDesignPayload(),
          points,
        );

      setSimulationResult(
        result,
      );
    } catch (err) {
      console.warn("Thermal simulation notice:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while running the simulation.",
      );
    } finally {
      setIsSimulating(false);
    }
  }

  async function optimizeShelter() {
    setIsOptimizing(true);
    setError("");
    setIsApplied(false);

    const baselineWall =
      getInsulationThicknessMm(
        wall_layers,
        100,
      );

    const baselineRoof =
      getInsulationThicknessMm(
        roof_layers,
        120,
      );

    setBaselineForReset({
      orientation_deg,
      wall_insulation_thickness_mm:
        baselineWall,
      roof_insulation_thickness_mm:
        baselineRoof,
    });

    const baselineSnapshot: DesignSnapshot = {
      orientation_deg,

      wall_insulation_thickness_mm:
        baselineWall,

      roof_insulation_thickness_mm:
        baselineRoof,

      comfort_percentage:
        null,

      minimum_indoor_temperature_c:
        null,

      maximum_indoor_temperature_c:
        null,
    };

    try {
      const points =
        await fetchWeather();

      const baselineSimulation =
        await runSimulationForDesign(
          buildDesignPayload(),
          points,
        );

      const completeBaseline: DesignSnapshot =
        {
          ...baselineSnapshot,

          comfort_percentage:
            baselineSimulation.comfort_percentage,

          minimum_indoor_temperature_c:
            baselineSimulation.minimum_indoor_temperature_c,

          maximum_indoor_temperature_c:
            baselineSimulation.maximum_indoor_temperature_c,
        };

      setBaselineDesign(
        completeBaseline,
      );

      const response =
        await fetch(
          `${API_BASE}/api/optimization/run`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              design:
                buildDesignPayload(),

              weather: points,

              initial_indoor_temperature_c:
                initial_indoor_temperature_c,

              internal_heat_gain_w:
                0,

              wall_insulation_thicknesses_mm:
                [
                  50,
                  100,
                  150,
                  200,
                ],

              roof_insulation_thicknesses_mm:
                [
                  50,
                  100,
                  150,
                  200,
                ],

              orientations_deg:
                [
                  0,
                  90,
                  180,
                  270,
                ],

              timestep_minutes:
                60,
            }),
          },
        );

      if (!response.ok) {
        const message =
          await response.text();

        throw new Error(
          message ||
            "Shelter optimization failed.",
        );
      }

      const result =
        (await response.json()) as OptimizationResult;

      setOptimizationResult(
        result,
      );

      setSimulationResult(
        baselineSimulation,
      );
    } catch (err) {
      console.warn("Optimize shelter notice:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while optimizing the shelter.",
      );
    } finally {
      setIsOptimizing(false);
    }
  }

  async function applyBestDesign() {
    if (
      !optimizationResult ||
      !baselineDesign
    ) {
      return;
    }

    const best =
      optimizationResult.best_candidate;

    setIsApplyingOptimization(true);
    setError("");

    try {
      const optimizedWallLayers =
        updateInsulationLayers(
          wall_layers,
          best.wall_insulation_thickness_mm,
        );

      const optimizedRoofLayers =
        updateInsulationLayers(
          roof_layers,
          best.roof_insulation_thickness_mm,
        );

      setOrientation(
        best.orientation_deg,
      );

      setWallInsulationThicknessMm(
        best.wall_insulation_thickness_mm,
      );

      setRoofInsulationThicknessMm(
        best.roof_insulation_thickness_mm,
      );

      const points =
        await fetchWeather();

      const optimizedDesign =
        buildDesignPayload({
          orientation_deg:
            best.orientation_deg,

          wall_layers:
            optimizedWallLayers,

          roof_layers:
            optimizedRoofLayers,
        });

      const optimizedSimulation =
        await runSimulationForDesign(
          optimizedDesign,
          points,
        );

      setSimulationResult(
        optimizedSimulation,
      );

      setIsApplied(true);
    } catch (err) {
      console.warn("Apply optimization notice:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to apply the optimized design.",
      );
    } finally {
      setIsApplyingOptimization(
        false,
      );
    }
  }

  async function resetToBaseline() {
    if (!baselineForReset) {
      return;
    }

    setIsResetting(true);
    setError("");

    try {
      setOrientation(
        baselineForReset.orientation_deg,
      );

      setWallInsulationThicknessMm(
        baselineForReset.wall_insulation_thickness_mm,
      );

      setRoofInsulationThicknessMm(
        baselineForReset.roof_insulation_thickness_mm,
      );

      const points =
        await fetchWeather();

      const baselineWallLayers =
        updateInsulationLayers(
          wall_layers,
          baselineForReset.wall_insulation_thickness_mm,
        );

      const baselineRoofLayers =
        updateInsulationLayers(
          roof_layers,
          baselineForReset.roof_insulation_thickness_mm,
        );

      const baselinePayload =
        buildDesignPayload({
          orientation_deg:
            baselineForReset.orientation_deg,

          wall_layers:
            baselineWallLayers,

          roof_layers:
            baselineRoofLayers,
        });

      const baselineSimulation =
        await runSimulationForDesign(
          baselinePayload,
          points,
        );

      setSimulationResult(
        baselineSimulation,
      );

      setIsApplied(false);
    } catch (err) {
      console.warn("Restore baseline notice:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to restore the baseline design.",
      );
    } finally {
      setIsResetting(false);
    }
  }

  const comfortDifference =
    optimizationResult
      ? optimizationResult.best_candidate
          .comfort_percentage -
        optimizationResult.baseline_comfort_percentage
      : null;

  const optimizedSnapshot =
    optimizationResult
      ? {
          orientation_deg:
            optimizationResult.best_candidate
              .orientation_deg,

          wall_insulation_thickness_mm:
            optimizationResult.best_candidate
              .wall_insulation_thickness_mm,

          roof_insulation_thickness_mm:
            optimizationResult.best_candidate
              .roof_insulation_thickness_mm,

          comfort_percentage:
            optimizationResult.best_candidate
              .comfort_percentage,

          minimum_indoor_temperature_c:
            optimizationResult.best_candidate
              .minimum_indoor_temperature_c,

          maximum_indoor_temperature_c:
            optimizationResult.best_candidate
              .maximum_indoor_temperature_c,
        }
      : null;

  const hasWeather =
    weatherPoints.length > 0;

  const hasSimulation =
    simulationResult !== null;

  const hasOptimization =
    optimizationResult !== null;

  return (
    <main className="h-screen overflow-hidden bg-[#07111f] text-white">
      {/* Header */}
      <header className="flex h-[58px] items-center justify-between border-b border-white/10 px-5">
        <div>
          <div className="text-lg font-bold tracking-tight">
            Thermo Shelter 1
          </div>

          <div className="text-[11px] text-slate-500">
            Passive Shelter Thermal Simulator
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1.5 text-[11px] text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            3D Model Live
          </div>

          <div className="flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/5 px-3 py-1.5 text-[11px] text-blue-300">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            Thermal Engine Ready
          </div>
        </div>
      </header>

      <div className="grid h-[calc(100vh-58px)] grid-cols-[minmax(0,1fr)_360px] gap-3 p-3">
        {/* LEFT */}
        <section className="grid min-h-0 grid-rows-[minmax(0,1fr)_220px] gap-3">
          <div className="relative min-h-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0b1728]">
            <div className="absolute left-4 top-4 z-10 rounded-xl border border-white/10 bg-black/25 px-3 py-2 backdrop-blur-md">
              <div className="text-xs font-semibold text-white">
                Shelter Visualization
              </div>

              <div className="mt-0.5 text-[10px] text-slate-400">
                {length_m.toFixed(1)}m ×{" "}
                {width_m.toFixed(1)}m ×{" "}
                {height_m.toFixed(1)}m
              </div>
            </div>

            <div className="h-full w-full">
              <Shelter3D
                length={length_m}
                width={width_m}
                height={height_m}
                orientation={orientation_deg}
                wallThickness={Math.max(
                  wallAssembly.thickness,
                  0.05,
                )}
                roofThickness={Math.max(
                  roofAssembly.thickness,
                  0.05,
                )}
              />
            </div>
          </div>

          <div className="min-h-0">
            <ThermalResultsChart
              points={
                simulationResult?.points.map(
                  (point) => ({
                    timestamp:
                      point.timestamp,

                    indoor_temperature_c:
                      point.indoor_temperature_c,

                    outdoor_temperature_c:
                      point.outdoor_temperature_c,

                    solar_gain_w:
                      point.solar_gain_w,

                    total_heat_loss_w:
                      point.total_heat_loss_w,
                  }),
                ) ?? []
              }
            />
          </div>
        </section>

        {/* RIGHT */}
        <aside className="min-h-0 overflow-y-auto rounded-2xl border border-white/10 bg-[#0b1728] p-4">
          {/* Location */}
          <div>
            <div className="mb-2 text-xs font-semibold text-white">
              Location
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="text-sm font-medium text-white">
                {location.name}
              </div>

              <div className="mt-1 text-[10px] text-slate-500">
                {location.latitude.toFixed(4)},{" "}
                {location.longitude.toFixed(4)}

                {location.elevation_m != null
                  ? ` • ${Math.round(
                      location.elevation_m,
                    )} m elevation`
                  : ""}
              </div>

              <div className="mt-2 text-[10px] text-emerald-400">
                Weather: Open-Meteo
              </div>
            </div>
          </div>

          {/* Pipeline */}
          <div className="mt-3">
            <AnalysisPipelineCard
              hasWeather={
                hasWeather
              }
              hasSimulation={
                hasSimulation
              }
              hasOptimization={
                hasOptimization
              }
            />
          </div>

          {/* Weather */}
          <div className="mt-3">
            <WeatherSummaryCard
              points={
                weatherPoints
              }
            />
          </div>

          {/* Dimensions */}
          <div className="mt-4">
            <div className="mb-2 text-xs font-semibold text-white">
              Shelter Dimensions
            </div>

            <div className="grid grid-cols-3 gap-2">
              <label className="rounded-xl border border-white/10 bg-white/[0.03] p-2">
                <div className="mb-1 text-[9px] uppercase tracking-wide text-slate-500">
                  Length
                </div>

                <input
                  type="number"
                  min="1"
                  step="0.1"
                  value={length_m}
                  onChange={(event) =>
                    setDimensions({
                      length_m:
                        Number(
                          event.target.value,
                        ),
                    })
                  }
                  className="w-full bg-transparent text-sm font-medium text-white outline-none"
                />
              </label>

              <label className="rounded-xl border border-white/10 bg-white/[0.03] p-2">
                <div className="mb-1 text-[9px] uppercase tracking-wide text-slate-500">
                  Width
                </div>

                <input
                  type="number"
                  min="1"
                  step="0.1"
                  value={width_m}
                  onChange={(event) =>
                    setDimensions({
                      width_m:
                        Number(
                          event.target.value,
                        ),
                    })
                  }
                  className="w-full bg-transparent text-sm font-medium text-white outline-none"
                />
              </label>

              <label className="rounded-xl border border-white/10 bg-white/[0.03] p-2">
                <div className="mb-1 text-[9px] uppercase tracking-wide text-slate-500">
                  Height
                </div>

                <input
                  type="number"
                  min="1"
                  step="0.1"
                  value={height_m}
                  onChange={(event) =>
                    setDimensions({
                      height_m:
                        Number(
                          event.target.value,
                        ),
                    })
                  }
                  className="w-full bg-transparent text-sm font-medium text-white outline-none"
                />
              </label>
            </div>
          </div>

          {/* Orientation */}
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-white">
                Orientation
              </span>

              <span className="text-xs text-cyan-300">
                {orientation_deg}°
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="360"
              step="1"
              value={orientation_deg}
              onChange={(event) =>
                setOrientation(
                  Number(
                    event.target.value,
                  ),
                )
              }
              className="w-full accent-cyan-400"
            />

            <div className="mt-1 flex justify-between text-[9px] text-slate-600">
              <span>0°</span>
              <span>90°</span>
              <span>180°</span>
              <span>270°</span>
              <span>360°</span>
            </div>
          </div>

          {/* Wall */}
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-white">
                Wall Construction
              </span>

              <span className="text-[10px] text-slate-400">
                {Math.round(
                  wallAssembly.thickness *
                    1000,
                )}{" "}
                mm
              </span>
            </div>

            <input
              type="range"
              min="20"
              max="300"
              step="5"
              value={Math.round(
                getInsulationThicknessMm(
                  wall_layers,
                  100,
                ),
              )}
              onChange={(event) =>
                setWallInsulationThicknessMm(
                  Number(
                    event.target.value,
                  ),
                )
              }
              className="w-full accent-cyan-400"
            />

            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
                <div className="text-[9px] uppercase tracking-wide text-slate-500">
                  R-Value
                </div>

                <div className="mt-1 text-sm font-semibold text-cyan-300">
                  {wallAssembly.rValue.toFixed(
                    2,
                  )}
                </div>

                <div className="text-[9px] text-slate-600">
                  m²K/W
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
                <div className="text-[9px] uppercase tracking-wide text-slate-500">
                  U-Value
                </div>

                <div className="mt-1 text-sm font-semibold text-cyan-300">
                  {wallAssembly.uValue.toFixed(
                    3,
                  )}
                </div>

                <div className="text-[9px] text-slate-600">
                  W/m²K
                </div>
              </div>
            </div>
          </div>

          {/* Roof */}
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-white">
                Roof Construction
              </span>

              <span className="text-[10px] text-slate-400">
                {Math.round(
                  roofAssembly.thickness *
                    1000,
                )}{" "}
                mm
              </span>
            </div>

            <input
              type="range"
              min="20"
              max="300"
              step="5"
              value={Math.round(
                getInsulationThicknessMm(
                  roof_layers,
                  120,
                ),
              )}
              onChange={(event) =>
                setRoofInsulationThicknessMm(
                  Number(
                    event.target.value,
                  ),
                )
              }
              className="w-full accent-cyan-400"
            />

            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
                <div className="text-[9px] uppercase tracking-wide text-slate-500">
                  R-Value
                </div>

                <div className="mt-1 text-sm font-semibold text-cyan-300">
                  {roofAssembly.rValue.toFixed(
                    2,
                  )}
                </div>

                <div className="text-[9px] text-slate-600">
                  m²K/W
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
                <div className="text-[9px] uppercase tracking-wide text-slate-500">
                  U-Value
                </div>

                <div className="mt-1 text-sm font-semibold text-cyan-300">
                  {roofAssembly.uValue.toFixed(
                    3,
                  )}
                </div>

                <div className="text-[9px] text-slate-600">
                  W/m²K
                </div>
              </div>
            </div>
          </div>

          {/* Initial Temperature */}
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-white">
                Initial Indoor Temperature
              </span>

              <span className="text-xs text-orange-300">
                {initial_indoor_temperature_c.toFixed(
                  1,
                )}
                °C
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="35"
              step="0.5"
              value={
                initial_indoor_temperature_c
              }
              onChange={(event) =>
                setInitialIndoorTemperature(
                  Number(
                    event.target.value,
                  ),
                )
              }
              className="w-full accent-orange-400"
            />
          </div>

          {/* Actions */}
          <button
            type="button"
            onClick={
              runThermalSimulation
            }
            disabled={
              isSimulating ||
              isOptimizing ||
              isApplyingOptimization ||
              isResetting
            }
            className="mt-5 w-full rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSimulating
              ? "Running Thermal Simulation..."
              : "Run Thermal Simulation"}
          </button>

          <button
            type="button"
            onClick={
              optimizeShelter
            }
            disabled={
              isSimulating ||
              isOptimizing ||
              isApplyingOptimization ||
              isResetting
            }
            className="mt-2 w-full rounded-xl border border-violet-400/30 bg-violet-400/10 px-4 py-3 text-sm font-semibold text-violet-200 transition hover:bg-violet-400/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isOptimizing
              ? "Testing 64 Shelter Designs..."
              : "Optimize Shelter"}
          </button>

          {baselineForReset && (
            <button
              type="button"
              onClick={
                resetToBaseline
              }
              disabled={
                isSimulating ||
                isOptimizing ||
                isApplyingOptimization ||
                isResetting
              }
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-medium text-slate-300 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isResetting
                ? "Restoring Baseline..."
                : "Reset to Baseline"}
            </button>
          )}

          {/* Error */}
          {error && (
            <div className="mt-3 rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-[11px] leading-relaxed text-red-300">
              {error}
            </div>
          )}

          {/* Simulation Results */}
          {simulationResult && (
            <div className="mt-4">
              <div className="mb-2 text-xs font-semibold text-white">
                Simulation Results
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
                  <div className="text-[9px] uppercase tracking-wide text-slate-500">
                    Final Indoor
                  </div>

                  <div className="mt-1 text-lg font-semibold text-emerald-300">
                    {simulationResult.final_indoor_temperature_c.toFixed(
                      1,
                    )}
                    °C
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
                  <div className="text-[9px] uppercase tracking-wide text-slate-500">
                    Comfort
                  </div>

                  <div className="mt-1 text-lg font-semibold text-cyan-300">
                    {simulationResult.comfort_percentage.toFixed(
                      0,
                    )}
                    %
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
                  <div className="text-[9px] uppercase tracking-wide text-slate-500">
                    Minimum
                  </div>

                  <div className="mt-1 text-sm font-semibold text-blue-300">
                    {simulationResult.minimum_indoor_temperature_c.toFixed(
                      1,
                    )}
                    °C
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
                  <div className="text-[9px] uppercase tracking-wide text-slate-500">
                    Maximum
                  </div>

                  <div className="mt-1 text-sm font-semibold text-orange-300">
                    {simulationResult.maximum_indoor_temperature_c.toFixed(
                      1,
                    )}
                    °C
                  </div>
                </div>
              </div>

              <div className="mt-2 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">
                    Comfort hours
                  </span>

                  <span className="font-medium text-white">
                    {simulationResult.comfort_hours.toFixed(
                      1,
                    )}{" "}
                    h
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">
                    Cold hours
                  </span>

                  <span className="font-medium text-blue-300">
                    {simulationResult.cold_hours.toFixed(
                      1,
                    )}{" "}
                    h
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">
                    Hot hours
                  </span>

                  <span className="font-medium text-orange-300">
                    {simulationResult.hot_hours.toFixed(
                      1,
                    )}{" "}
                    h
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Optimization */}
          {optimizationResult && (
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-xs font-semibold text-white">
                  Optimization
                </div>

                <div className="text-[10px] text-violet-300">
                  {
                    optimizationResult.total_candidates_tested
                  }{" "}
                  tested
                </div>
              </div>

              <div className="rounded-xl border border-violet-400/20 bg-violet-400/5 p-3">
                <div className="text-[9px] uppercase tracking-wide text-violet-300">
                  Best Tested Candidate
                </div>

                <div className="mt-1 text-lg font-semibold text-white">
                  #
                  {
                    optimizationResult
                      .best_candidate
                      .rank
                  }
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-[9px] text-slate-500">
                      Comfort
                    </div>

                    <div className="mt-0.5 text-sm font-semibold text-emerald-300">
                      {optimizationResult.best_candidate.comfort_percentage.toFixed(
                        1,
                      )}
                      %
                    </div>
                  </div>

                  <div>
                    <div className="text-[9px] text-slate-500">
                      Final Indoor
                    </div>

                    <div className="mt-0.5 text-sm font-semibold text-cyan-300">
                      {optimizationResult.best_candidate.final_indoor_temperature_c.toFixed(
                        1,
                      )}
                      °C
                    </div>
                  </div>

                  <div>
                    <div className="text-[9px] text-slate-500">
                      Orientation
                    </div>

                    <div className="mt-0.5 text-sm font-semibold text-white">
                      {
                        optimizationResult
                          .best_candidate
                          .orientation_deg
                      }°
                    </div>
                  </div>

                  <div>
                    <div className="text-[9px] text-slate-500">
                      Wall Insulation
                    </div>

                    <div className="mt-0.5 text-sm font-semibold text-white">
                      {optimizationResult.best_candidate.wall_insulation_thickness_mm.toFixed(
                        0,
                      )}{" "}
                      mm
                    </div>
                  </div>

                  <div>
                    <div className="text-[9px] text-slate-500">
                      Roof Insulation
                    </div>

                    <div className="mt-0.5 text-sm font-semibold text-white">
                      {optimizationResult.best_candidate.roof_insulation_thickness_mm.toFixed(
                        0,
                      )}{" "}
                      mm
                    </div>
                  </div>

                  <div>
                    <div className="text-[9px] text-slate-500">
                      Temperature Range
                    </div>

                    <div className="mt-0.5 text-sm font-semibold text-white">
                      {optimizationResult.best_candidate.minimum_indoor_temperature_c.toFixed(
                        1,
                      )}
                      –
                      {optimizationResult.best_candidate.maximum_indoor_temperature_c.toFixed(
                        1,
                      )}
                      °C
                    </div>
                  </div>
                </div>

                <div className="mt-3 border-t border-white/10 pt-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">
                      Baseline comfort
                    </span>

                    <span className="text-slate-300">
                      {optimizationResult.baseline_comfort_percentage.toFixed(
                        1,
                      )}
                      %
                    </span>
                  </div>

                  <div className="mt-1 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">
                      Best tested comfort
                    </span>

                    <span className="text-emerald-300">
                      {optimizationResult.best_candidate.comfort_percentage.toFixed(
                        1,
                      )}
                      %
                    </span>
                  </div>

                  <div className="mt-1 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">
                      Difference
                    </span>

                    <span
                      className={
                        comfortDifference !==
                          null &&
                        comfortDifference >= 0
                          ? "text-emerald-300"
                          : "text-orange-300"
                      }
                    >
                      {comfortDifference !==
                      null
                        ? `${
                            comfortDifference >=
                            0
                              ? "+"
                              : ""
                          }${comfortDifference.toFixed(
                            1,
                          )} percentage points`
                        : "—"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={
                    applyBestDesign
                  }
                  disabled={
                    isApplyingOptimization ||
                    isSimulating ||
                    isOptimizing ||
                    isResetting
                  }
                  className="mt-3 w-full rounded-xl bg-violet-500 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isApplyingOptimization
                    ? "Applying & Simulating..."
                    : "Apply & Simulate Best Design"}
                </button>
              </div>

              {baselineDesign &&
                optimizedSnapshot && (
                  <div className="mt-3">
                    <DesignComparisonCard
                      baseline={
                        baselineDesign
                      }
                      optimized={
                        optimizedSnapshot
                      }
                      isApplied={
                        isApplied
                      }
                    />
                  </div>
                )}

              <div className="mt-3">
                <OptimizationResultsTable
                  candidates={
                    optimizationResult.candidates
                  }
                  totalCandidates={
                    optimizationResult.total_candidates_tested
                  }
                />
              </div>
            </div>
          )}

          {/* Scientific scope */}
          <div className="mt-4 border-t border-white/10 pt-4">
            <ModelAssumptionsCard />
          </div>

          {/* PDF report */}
          <div className="mt-4 border-t border-white/10 pt-4">
            <ReportButton
              data={{
                projectName:
                  "Thermo Shelter 1",

                location: {
                  name:
                    location.name,

                  latitude:
                    location.latitude,

                  longitude:
                    location.longitude,

                  elevation_m:
                    location.elevation_m,
                },

                geometry: {
                  length_m,
                  width_m,
                  height_m,
                },

                orientation_deg,

                wall: {
                  thickness_mm:
                    wallAssembly.thickness *
                    1000,

                  r_value:
                    wallAssembly.rValue,

                  u_value:
                    wallAssembly.uValue,
                },

                roof: {
                  thickness_mm:
                    roofAssembly.thickness *
                    1000,

                  r_value:
                    roofAssembly.rValue,

                  u_value:
                    roofAssembly.uValue,
                },

                simulation:
                  simulationResult
                    ? {
                        final_indoor_temperature_c:
                          simulationResult.final_indoor_temperature_c,

                        minimum_indoor_temperature_c:
                          simulationResult.minimum_indoor_temperature_c,

                        maximum_indoor_temperature_c:
                          simulationResult.maximum_indoor_temperature_c,

                        comfort_hours:
                          simulationResult.comfort_hours,

                        cold_hours:
                          simulationResult.cold_hours,

                        hot_hours:
                          simulationResult.hot_hours,

                        comfort_percentage:
                          simulationResult.comfort_percentage,
                      }
                    : null,

                optimization:
                  optimizationResult
                    ? {
                        total_candidates_tested:
                          optimizationResult.total_candidates_tested,

                        baseline_comfort_percentage:
                          optimizationResult.baseline_comfort_percentage,

                        best_candidate:
                          optimizationResult.best_candidate,

                        candidates:
                          optimizationResult.candidates,
                      }
                    : null,

                baselineDesign:
                  baselineDesign,
              }}
            />
          </div>
        </aside>
      </div>
    </main>
  );
}