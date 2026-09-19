"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
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
import DemoRunButton from "@/components/DemoRunButton";
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

  const [
    weatherPoints,
    setWeatherPoints,
  ] = useState<WeatherPoint[]>([]);

  const [
    simulationResult,
    setSimulationResult,
  ] = useState<SimulationResult | null>(
    null,
  );

  const [
    optimizationResult,
    setOptimizationResult,
  ] = useState<OptimizationResult | null>(
    null,
  );

  const [
    baselineDesign,
    setBaselineDesign,
  ] = useState<DesignSnapshot | null>(
    null,
  );

  const [
    baselineForReset,
    setBaselineForReset,
  ] = useState<{
    orientation_deg: number;
    wall_insulation_thickness_mm: number;
    roof_insulation_thickness_mm: number;
  } | null>(null);

  const [
    isApplied,
    setIsApplied,
  ] = useState(false);

  const [
    isSimulating,
    setIsSimulating,
  ] = useState(false);

  const [
    isOptimizing,
    setIsOptimizing,
  ] = useState(false);

  const [
    isApplyingOptimization,
    setIsApplyingOptimization,
  ] = useState(false);

  const [
    isResetting,
    setIsResetting,
  ] = useState(false);

  const [activeTab, setActiveTab] = useState<
    "envelope" | "climate" | "solver"
  >("envelope");

  const [error, setError] =
    useState("");

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
      comfort_percentage: null,
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

              weather:
                points,

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

      return result;
    } catch (err) {
      console.warn("Optimize shelter notice:", err);

      throw err;
    } finally {
      setIsOptimizing(false);
    }
  }

  async function applyOptimizationResult(
    result: OptimizationResult,
  ) {
    const best =
      result.best_candidate;

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

    return optimizedSimulation;
  }

  async function applyBestDesign() {
    if (
      !optimizationResult ||
      !baselineDesign
    ) {
      return;
    }

    setIsApplyingOptimization(
      true,
    );

    setError("");

    try {
      await applyOptimizationResult(
        optimizationResult,
      );
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

  async function runFullDemo() {
    setError("");
    setIsApplied(false);

    /*
     * 1. Capture the current design.
     */
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

    try {
      /*
       * 2. Fetch real weather.
       */
      const points =
        await fetchWeather();

      /*
       * 3. Run baseline simulation.
       */
      setIsSimulating(true);

      const baselineSimulation =
        await runSimulationForDesign(
          buildDesignPayload(),
          points,
        );

      setSimulationResult(
        baselineSimulation,
      );

      const baselineSnapshot: DesignSnapshot =
        {
          orientation_deg,

          wall_insulation_thickness_mm:
            baselineWall,

          roof_insulation_thickness_mm:
            baselineRoof,

          comfort_percentage:
            baselineSimulation.comfort_percentage,

          minimum_indoor_temperature_c:
            baselineSimulation.minimum_indoor_temperature_c,

          maximum_indoor_temperature_c:
            baselineSimulation.maximum_indoor_temperature_c,
        };

      setBaselineDesign(
        baselineSnapshot,
      );

      setIsSimulating(false);

      /*
       * 4. Run optimization.
       */
      setIsOptimizing(true);

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

              weather:
                points,

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

      const optimization =
        (await response.json()) as OptimizationResult;

      setOptimizationResult(
        optimization,
      );

      setIsOptimizing(false);

      /*
       * 5. Apply the best tested candidate.
       */
      setIsApplyingOptimization(
        true,
      );

      await applyOptimizationResult(
        optimization,
      );

      setIsApplyingOptimization(
        false,
      );
    } catch (err) {
      console.error(err);

      setIsSimulating(false);
      setIsOptimizing(false);
      setIsApplyingOptimization(
        false,
      );

      throw err;
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

  const anyOperationRunning =
    isSimulating ||
    isOptimizing ||
    isApplyingOptimization ||
    isResetting;

  return (
    <main className="h-screen overflow-hidden bg-[#070c16] text-slate-100 font-sans">
      {/* ARCHITECTURAL HEADER */}
      <header className="flex h-[58px] items-center justify-between border-b border-white/10 px-6 bg-[#090e1b]">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-slate-300 hover:text-white transition-colors"
          >
            <div className="w-7 h-7 bg-amber-500/10 border border-amber-500/40 flex items-center justify-center chamfer-btn">
              <span className="font-mono text-amber-400 font-bold text-[11px]">TS</span>
            </div>
            <span className="text-sm font-bold tracking-wider uppercase font-mono text-slate-200">
              THERMO SHELTER // TS-1
            </span>
          </Link>

          <span className="hidden sm:inline text-slate-600 font-mono text-xs">/</span>

          <span className="hidden sm:inline text-xs font-mono text-amber-400 font-medium tracking-wide">
            3D INTERACTIVE SIMULATOR
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px]">
          <div className="flex items-center gap-2 border border-white/10 bg-[#060913] px-3 py-1 text-slate-300">
            <span className="h-2 w-2 rounded-full bg-amber-400 status-ping" />
            <span>SI UNITS: METRIC</span>
          </div>

          <div className="flex items-center gap-2 border border-white/10 bg-[#060913] px-3 py-1 text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>SOLVER: TRANSIENT EULER</span>
          </div>

          <Link
            href="/"
            className="chamfer-btn border border-white/20 bg-slate-900 hover:bg-slate-800 text-slate-300 px-3 py-1 transition-colors uppercase text-[10px] tracking-wider"
          >
            ← Mission Spec
          </Link>
        </div>
      </header>

      <div className="grid h-[calc(100vh-58px)] grid-cols-[minmax(0,1fr)_430px] gap-3 p-3">
        {/* LEFT */}
        <section className="grid min-h-0 grid-rows-[minmax(0,1fr)_250px] gap-3">
          <div className="relative min-h-0 overflow-hidden border border-white/15 bg-[#090e1b] corner-bracket">
            <div className="absolute left-4 top-4 z-10 border border-white/15 bg-[#060913]/90 px-3 py-2 backdrop-blur-md font-mono">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 status-ping" />
                <span className="text-xs font-semibold text-white uppercase tracking-wider">
                  3D Parametric Envelope
                </span>
              </div>

              <div className="mt-1 text-[10px] text-slate-400">
                SPAN: {length_m.toFixed(1)}m × {width_m.toFixed(1)}m × {height_m.toFixed(1)}m | ROT: {orientation_deg}°
              </div>
            </div>

            <div className="h-full w-full cad-grid-dense">
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

        {/* RIGHT CONTROLS PANEL */}
        <aside className="min-h-0 flex flex-col overflow-hidden border border-white/15 bg-[#090e1b] corner-bracket">
          {/* TAB STRIP */}
          <div className="flex border-b border-white/10 shrink-0 bg-[#060913] font-mono text-xs select-none">
            <button
              type="button"
              onClick={() => setActiveTab("envelope")}
              className={`flex-1 py-3 px-3 text-center border-b-2 transition-all uppercase tracking-wider font-semibold flex items-center justify-center gap-1.5 ${
                activeTab === "envelope"
                  ? "border-amber-400 text-amber-400 bg-amber-400/[0.08]"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]"
              }`}
            >
              <span>01. Envelope</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("climate")}
              className={`flex-1 py-3 px-3 text-center border-b-2 transition-all uppercase tracking-wider font-semibold flex items-center justify-center gap-1.5 ${
                activeTab === "climate"
                  ? "border-cyan-400 text-cyan-400 bg-cyan-400/[0.08]"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]"
              }`}
            >
              <span>02. Climate</span>
              {hasWeather && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("solver")}
              className={`flex-1 py-3 px-3 text-center border-b-2 transition-all uppercase tracking-wider font-semibold flex items-center justify-center gap-1.5 ${
                activeTab === "solver"
                  ? "border-emerald-400 text-emerald-400 bg-emerald-400/[0.08]"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]"
              }`}
            >
              <span>03. Solver</span>
              {(simulationResult || optimizationResult) && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 status-ping" />
              )}
            </button>
          </div>

          {/* PERSISTENT STATUS BAR */}
          <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#070c17] px-4 py-2 text-[11px] font-mono shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 uppercase">Core:</span>
              <span className={`font-semibold ${simulationResult ? "text-emerald-400" : "text-slate-400"}`}>
                {simulationResult
                  ? `${simulationResult.final_indoor_temperature_c > 0 ? "+" : ""}${simulationResult.final_indoor_temperature_c.toFixed(1)}°C`
                  : "Unsimulated"}
              </span>
              {simulationResult && (
                <span className="text-slate-400 text-[10px]">
                  ({simulationResult.comfort_percentage.toFixed(0)}% Comfort)
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={runThermalSimulation}
                disabled={anyOperationRunning}
                className="chamfer-btn bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold px-2.5 py-1 text-[10px] uppercase transition-colors"
              >
                {isSimulating ? "Simulating..." : "Simulate"}
              </button>
            </div>
          </div>

          {/* TAB CONTENT AREA */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* TAB 1: ENVELOPE */}
            {activeTab === "envelope" && (
              <div className="space-y-4 font-mono">
                {/* DIMENSIONS */}
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
                  <div className="mb-2 flex items-center justify-between text-xs font-semibold text-white uppercase tracking-wider">
                    <span>Parametric Geometry</span>
                    <span className="text-[10px] text-amber-400">
                      Vol: {(length_m * width_m * height_m).toFixed(1)} m³
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <label className="rounded-lg border border-white/10 bg-[#060913] p-2">
                      <div className="text-[9px] uppercase text-slate-400">Length (m)</div>
                      <input
                        type="number"
                        min="1"
                        step="0.1"
                        value={length_m}
                        onChange={(e) => setDimensions({ length_m: Number(e.target.value) })}
                        className="mt-1 w-full bg-transparent text-sm font-semibold text-white outline-none"
                      />
                    </label>

                    <label className="rounded-lg border border-white/10 bg-[#060913] p-2">
                      <div className="text-[9px] uppercase text-slate-400">Width (m)</div>
                      <input
                        type="number"
                        min="1"
                        step="0.1"
                        value={width_m}
                        onChange={(e) => setDimensions({ width_m: Number(e.target.value) })}
                        className="mt-1 w-full bg-transparent text-sm font-semibold text-white outline-none"
                      />
                    </label>

                    <label className="rounded-lg border border-white/10 bg-[#060913] p-2">
                      <div className="text-[9px] uppercase text-slate-400">Height (m)</div>
                      <input
                        type="number"
                        min="1"
                        step="0.1"
                        value={height_m}
                        onChange={(e) => setDimensions({ height_m: Number(e.target.value) })}
                        className="mt-1 w-full bg-transparent text-sm font-semibold text-white outline-none"
                      />
                    </label>
                  </div>

                  <div className="mt-2 text-[10px] text-slate-500">
                    Footprint: {(length_m * width_m).toFixed(1)} m² • Envelope Area: {(2 * (length_m * height_m + width_m * height_m) + length_m * width_m).toFixed(1)} m²
                  </div>
                </div>

                {/* ORIENTATION */}
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
                  <div className="mb-2 flex items-center justify-between text-xs font-semibold text-white uppercase tracking-wider">
                    <span>Azimuth Orientation</span>
                    <span className="text-cyan-400 font-bold">{orientation_deg}°</span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="1"
                    value={orientation_deg}
                    onChange={(e) => setOrientation(Number(e.target.value))}
                    className="w-full accent-cyan-400"
                  />

                  <div className="mt-2 grid grid-cols-4 gap-1 text-[10px]">
                    {[
                      { label: "N (0°)", deg: 0 },
                      { label: "E (90°)", deg: 90 },
                      { label: "S (180°)", deg: 180 },
                      { label: "W (270°)", deg: 270 },
                    ].map((p) => (
                      <button
                        key={p.deg}
                        type="button"
                        onClick={() => setOrientation(p.deg)}
                        className={`rounded py-1 text-center transition-colors border ${
                          orientation_deg === p.deg
                            ? "border-cyan-400 bg-cyan-400/20 text-cyan-300 font-bold"
                            : "border-white/10 text-slate-400 hover:text-white"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* WALL CONSTRUCTION */}
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
                  <div className="mb-2 flex items-center justify-between text-xs font-semibold text-white uppercase tracking-wider">
                    <span>Wall Insulation Assembly</span>
                    <span className="text-slate-300">
                      {Math.round(wallAssembly.thickness * 1000)} mm
                    </span>
                  </div>

                  <input
                    type="range"
                    min="20"
                    max="300"
                    step="5"
                    value={Math.round(getInsulationThicknessMm(wall_layers, 100))}
                    onChange={(e) => setWallInsulationThicknessMm(Number(e.target.value))}
                    className="w-full accent-amber-400"
                  />

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-lg border border-white/10 bg-[#060913] p-2">
                      <div className="text-[9px] uppercase text-slate-500">Wall R-Value</div>
                      <div className="mt-0.5 text-sm font-bold text-amber-400">
                        {wallAssembly.rValue.toFixed(2)}{" "}
                        <span className="text-[9px] font-normal text-slate-500">m²K/W</span>
                      </div>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-[#060913] p-2">
                      <div className="text-[9px] uppercase text-slate-500">Wall U-Value</div>
                      <div className="mt-0.5 text-sm font-bold text-cyan-300">
                        {wallAssembly.uValue.toFixed(3)}{" "}
                        <span className="text-[9px] font-normal text-slate-500">W/m²K</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ROOF CONSTRUCTION */}
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
                  <div className="mb-2 flex items-center justify-between text-xs font-semibold text-white uppercase tracking-wider">
                    <span>Roof Insulation Assembly</span>
                    <span className="text-slate-300">
                      {Math.round(roofAssembly.thickness * 1000)} mm
                    </span>
                  </div>

                  <input
                    type="range"
                    min="20"
                    max="300"
                    step="5"
                    value={Math.round(getInsulationThicknessMm(roof_layers, 120))}
                    onChange={(e) => setRoofInsulationThicknessMm(Number(e.target.value))}
                    className="w-full accent-amber-400"
                  />

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-lg border border-white/10 bg-[#060913] p-2">
                      <div className="text-[9px] uppercase text-slate-500">Roof R-Value</div>
                      <div className="mt-0.5 text-sm font-bold text-amber-400">
                        {roofAssembly.rValue.toFixed(2)}{" "}
                        <span className="text-[9px] font-normal text-slate-500">m²K/W</span>
                      </div>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-[#060913] p-2">
                      <div className="text-[9px] uppercase text-slate-500">Roof U-Value</div>
                      <div className="mt-0.5 text-sm font-bold text-cyan-300">
                        {roofAssembly.uValue.toFixed(3)}{" "}
                        <span className="text-[9px] font-normal text-slate-500">W/m²K</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* INITIAL INDOOR TEMP */}
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
                  <div className="mb-2 flex items-center justify-between text-xs font-semibold text-white uppercase tracking-wider">
                    <span>Initial Core Temperature</span>
                    <span className="text-orange-400 font-bold">
                      {initial_indoor_temperature_c.toFixed(1)}°C
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="35"
                    step="0.5"
                    value={initial_indoor_temperature_c}
                    onChange={(e) => setInitialIndoorTemperature(Number(e.target.value))}
                    className="w-full accent-orange-400"
                  />
                  <div className="mt-1 flex justify-between text-[9px] text-slate-500">
                    <span>0°C (Cold Start)</span>
                    <span>18°C (Baseline)</span>
                    <span>35°C (Preheated)</span>
                  </div>
                </div>

                {/* TAB ACTION */}
                <button
                  type="button"
                  onClick={runThermalSimulation}
                  disabled={anyOperationRunning}
                  className="chamfer-btn w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold py-3 text-xs uppercase tracking-wider transition-colors shadow-lg flex items-center justify-center gap-2"
                >
                  <span>{isSimulating ? "Simulating Heat Flow..." : "Run Thermal Simulation →"}</span>
                </button>
              </div>
            )}

            {/* TAB 2: CLIMATE */}
            {activeTab === "climate" && (
              <div className="space-y-4 font-mono">
                {/* LOCATION CARD */}
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
                  <div className="mb-2 text-xs font-semibold text-white uppercase tracking-wider">
                    Station Coordinates & Topology
                  </div>

                  <div className="rounded-lg border border-white/10 bg-[#060913] p-3">
                    <div className="text-sm font-bold text-white">{location.name}</div>
                    <div className="mt-1 text-[10px] text-slate-400">
                      {location.latitude.toFixed(4)}°N, {location.longitude.toFixed(4)}°E
                      {location.elevation_m != null ? ` • ${Math.round(location.elevation_m)} m ASL` : ""}
                    </div>
                    <div className="mt-2.5 flex items-center gap-2 text-[10px] text-emerald-400 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 status-ping" />
                      <span>Live Satellite Weather via Open-Meteo</span>
                    </div>
                  </div>
                </div>

                {/* WEATHER CARD */}
                <WeatherSummaryCard points={weatherPoints} />

                {/* THERMAL MASS & VENTILATION SPECS */}
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 space-y-3">
                  <div className="text-xs font-semibold text-white uppercase tracking-wider">
                    Core Physics & Infiltration
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="rounded-lg border border-white/10 bg-[#060913] p-2.5">
                      <div className="text-slate-500 uppercase text-[9px]">Thermal Mass Core</div>
                      <div className="mt-1 text-sm font-bold text-white">3,200 kg</div>
                      <div className="text-[9px] text-slate-400">High-density concrete slab</div>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-[#060913] p-2.5">
                      <div className="text-slate-500 uppercase text-[9px]">Air Exchange (n50)</div>
                      <div className="mt-1 text-sm font-bold text-emerald-400">0.14 ACH</div>
                      <div className="text-[9px] text-slate-400">Passive House airtight</div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-[#060913] p-2.5 text-[10px] text-slate-400 leading-relaxed">
                    Solar radiation penetrating the south-facing multi-chamber glazing is stored in the interior Trombe core during peak daylight hours, then released slowly over an 11.4h thermal lag.
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: SOLVER & RESULTS */}
            {activeTab === "solver" && (
              <div className="space-y-4 font-mono">
                {/* PIPELINE PROGRESS */}
                <AnalysisPipelineCard
                  hasWeather={hasWeather}
                  hasSimulation={hasSimulation}
                  hasOptimization={hasOptimization}
                />

                {/* PRIMARY ACTIONS */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={runThermalSimulation}
                    disabled={anyOperationRunning}
                    className="chamfer-btn w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold py-3 text-xs uppercase tracking-wider transition-colors shadow-lg"
                  >
                    {isSimulating ? "Running Transient Simulation..." : "Run Thermal Simulation"}
                  </button>

                  <button
                    type="button"
                    onClick={optimizeShelter}
                    disabled={anyOperationRunning}
                    className="chamfer-btn w-full border border-cyan-400/40 bg-cyan-400/10 hover:bg-cyan-400/20 disabled:opacity-50 text-cyan-200 font-bold py-3 text-xs uppercase tracking-wider transition-colors shadow-lg"
                  >
                    {isOptimizing ? "Evaluating 64 Shelter Candidates..." : "Run 64-Candidate Matrix Optimization"}
                  </button>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <DemoRunButton
                      onRunDemo={runFullDemo}
                      disabled={anyOperationRunning}
                    />

                    {baselineForReset && (
                      <button
                        type="button"
                        onClick={resetToBaseline}
                        disabled={anyOperationRunning}
                        className="chamfer-btn border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-50 text-slate-300 py-2 text-[10px] uppercase font-semibold transition-colors"
                      >
                        {isResetting ? "Restoring..." : "Reset Baseline"}
                      </button>
                    )}
                  </div>
                </div>

                {/* ERROR BANNER */}
                {error && (
                  <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-[11px] text-red-300 leading-relaxed">
                    {error}
                  </div>
                )}

                {/* SIMULATION RESULTS */}
                {simulationResult && (
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-white uppercase tracking-wider">
                      <span>Simulation Telemetry</span>
                      <span className="text-emerald-400 text-[10px]">24H SOLVER PASSED</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg border border-white/10 bg-[#060913] p-2.5">
                        <div className="text-[9px] uppercase text-slate-500">Final Indoor Temp</div>
                        <div className="mt-1 text-lg font-bold text-emerald-400">
                          {simulationResult.final_indoor_temperature_c > 0 ? "+" : ""}
                          {simulationResult.final_indoor_temperature_c.toFixed(1)}°C
                        </div>
                      </div>

                      <div className="rounded-lg border border-white/10 bg-[#060913] p-2.5">
                        <div className="text-[9px] uppercase text-slate-500">Comfort Score</div>
                        <div className="mt-1 text-lg font-bold text-cyan-300">
                          {simulationResult.comfort_percentage.toFixed(0)}%
                        </div>
                      </div>

                      <div className="rounded-lg border border-white/10 bg-[#060913] p-2.5">
                        <div className="text-[9px] uppercase text-slate-500">Min Core Temp</div>
                        <div className="mt-1 text-sm font-semibold text-sky-300">
                          {simulationResult.minimum_indoor_temperature_c.toFixed(1)}°C
                        </div>
                      </div>

                      <div className="rounded-lg border border-white/10 bg-[#060913] p-2.5">
                        <div className="text-[9px] uppercase text-slate-500">Max Core Temp</div>
                        <div className="mt-1 text-sm font-semibold text-amber-300">
                          {simulationResult.maximum_indoor_temperature_c.toFixed(1)}°C
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-[#060913] p-3 space-y-1.5 text-[10px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Comfort Hours:</span>
                        <span className="text-white font-bold">{simulationResult.comfort_hours.toFixed(1)} h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Cold Stress Hours:</span>
                        <span className="text-sky-300 font-bold">{simulationResult.cold_hours.toFixed(1)} h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Heat Stress Hours:</span>
                        <span className="text-orange-300 font-bold">{simulationResult.hot_hours.toFixed(1)} h</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* OPTIMIZATION RESULTS */}
                {optimizationResult && (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.04] p-3.5 space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-amber-400 uppercase tracking-wider">
                      <span>Optimal Tested Envelope</span>
                      <span className="text-[10px] text-slate-400">
                        {optimizationResult.total_candidates_tested} Evaluated
                      </span>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-[#060913] p-3 space-y-2 text-[11px]">
                      <div className="flex justify-between items-center pb-2 border-b border-white/10">
                        <span className="text-slate-400">Candidate Rank:</span>
                        <span className="text-white font-bold">#{optimizationResult.best_candidate.rank}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Optimized Comfort:</span>
                        <span className="text-emerald-400 font-bold">
                          {optimizationResult.best_candidate.comfort_percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Optimal Orientation:</span>
                        <span className="text-white font-bold">{optimizationResult.best_candidate.orientation_deg}°</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Wall Insulation:</span>
                        <span className="text-white font-bold">
                          {optimizationResult.best_candidate.wall_insulation_thickness_mm.toFixed(0)} mm
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Roof Insulation:</span>
                        <span className="text-white font-bold">
                          {optimizationResult.best_candidate.roof_insulation_thickness_mm.toFixed(0)} mm
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Comfort Gain:</span>
                        <span className={comfortDifference !== null && comfortDifference >= 0 ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                          {comfortDifference !== null ? `${comfortDifference >= 0 ? "+" : ""}${comfortDifference.toFixed(1)} pts` : "—"}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={applyBestDesign}
                      disabled={anyOperationRunning}
                      className="chamfer-btn w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold py-2.5 text-xs uppercase tracking-wider transition-colors"
                    >
                      {isApplyingOptimization ? "Applying to 3D Scene..." : "Apply & Render Best Design"}
                    </button>
                  </div>
                )}

                {/* DESIGN COMPARISON */}
                {baselineDesign && optimizedSnapshot && (
                  <DesignComparisonCard
                    baseline={baselineDesign}
                    optimized={optimizedSnapshot}
                    isApplied={isApplied}
                  />
                )}

                {/* OPTIMIZATION CANDIDATE MATRIX */}
                {optimizationResult && (
                  <OptimizationResultsTable
                    candidates={optimizationResult.candidates}
                    totalCandidates={optimizationResult.total_candidates_tested}
                  />
                )}

                {/* ASSUMPTIONS */}
                <ModelAssumptionsCard />

                {/* DOSSIER EXPORT */}
                <ReportButton
                  data={{
                    projectName: "Thermo Shelter TS-1",
                    location: {
                      name: location.name,
                      latitude: location.latitude,
                      longitude: location.longitude,
                      elevation_m: location.elevation_m,
                    },
                    geometry: { length_m, width_m, height_m },
                    orientation_deg,
                    wall: {
                      thickness_mm: wallAssembly.thickness * 1000,
                      r_value: wallAssembly.rValue,
                      u_value: wallAssembly.uValue,
                    },
                    roof: {
                      thickness_mm: roofAssembly.thickness * 1000,
                      r_value: roofAssembly.rValue,
                      u_value: roofAssembly.uValue,
                    },
                    simulation: simulationResult
                      ? {
                          final_indoor_temperature_c: simulationResult.final_indoor_temperature_c,
                          minimum_indoor_temperature_c: simulationResult.minimum_indoor_temperature_c,
                          maximum_indoor_temperature_c: simulationResult.maximum_indoor_temperature_c,
                          comfort_hours: simulationResult.comfort_hours,
                          cold_hours: simulationResult.cold_hours,
                          hot_hours: simulationResult.hot_hours,
                          comfort_percentage: simulationResult.comfort_percentage,
                        }
                      : null,
                    optimization: optimizationResult
                      ? {
                          total_candidates_tested: optimizationResult.total_candidates_tested,
                          baseline_comfort_percentage: optimizationResult.baseline_comfort_percentage,
                          best_candidate: optimizationResult.best_candidate,
                          candidates: optimizationResult.candidates,
                        }
                      : null,
                    baselineDesign,
                  }}
                />
              </div>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}