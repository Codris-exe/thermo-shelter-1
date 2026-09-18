"use client";

import { useMemo, useState } from "react";
import Shelter3D from "@/components/Shelter3D";
import ThermalResultsChart from "@/components/ThermalResultsChart";
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

function calculateAssembly(layers: { material_id: string; thickness_m: number }[]) {
  const rInterior = 0.12;
  const rExterior = 0.03;

  const materialResistance = layers.reduce((sum, layer) => {
    const conductivity = MATERIAL_K[layer.material_id] ?? 0.1;
    return sum + layer.thickness_m / conductivity;
  }, 0);

  const totalR = rInterior + materialResistance + rExterior;
  const uValue = totalR > 0 ? 1 / totalR : 0;
  const thickness = layers.reduce(
    (sum, layer) => sum + layer.thickness_m,
    0,
  );

  return {
    rValue: totalR,
    uValue,
    thickness,
  };
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

  const [simulationResult, setSimulationResult] =
    useState<SimulationResult | null>(null);

  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState("");

  const wallAssembly = useMemo(
    () => calculateAssembly(wall_layers),
    [wall_layers],
  );

  const roofAssembly = useMemo(
    () => calculateAssembly(roof_layers),
    [roof_layers],
  );

  const floorAssembly = useMemo(
    () => calculateAssembly(floor_layers),
    [floor_layers],
  );

  async function runThermalSimulation() {
    setIsSimulating(true);
    setError("");

    try {
      const weatherResponse = await fetch(
        `${API_BASE}/api/weather/forecast?latitude=${location.latitude}&longitude=${location.longitude}&hours=24`,
      );

      if (!weatherResponse.ok) {
        throw new Error("Unable to fetch real weather data.");
      }

      const weatherData = await weatherResponse.json();

      const weatherPoints: WeatherPoint[] =
        weatherData.points ?? weatherData.data ?? weatherData;

      if (!Array.isArray(weatherPoints) || weatherPoints.length < 2) {
        throw new Error("Not enough weather data was returned.");
      }

      const designPayload = {
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

        orientation_deg,

        wall_assembly: {
          layers: wall_layers,
        },

        roof_assembly: {
          layers: roof_layers,
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
          minimum_c: comfort_min_c,
          maximum_c: comfort_max_c,
        },
      };

      const simulationResponse = await fetch(
        `${API_BASE}/api/simulations/run`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            design: designPayload,
            initial_indoor_temperature_c:
              initial_indoor_temperature_c,
            weather: weatherPoints,
            internal_heat_gain_w: 0,
            timestep_minutes: 60,
          }),
        },
      );

      if (!simulationResponse.ok) {
        const message = await simulationResponse.text();
        throw new Error(
          message || "Thermal simulation failed.",
        );
      }

      const result: SimulationResult =
        await simulationResponse.json();

      setSimulationResult(result);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while running the simulation.",
      );
    } finally {
      setIsSimulating(false);
    }
  }

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

      {/* Main screen */}
      <div className="grid h-[calc(100vh-58px)] grid-cols-[minmax(0,1fr)_360px] gap-3 p-3">
        {/* LEFT SIDE */}
        <section className="grid min-h-0 grid-rows-[minmax(0,1fr)_220px] gap-3">
          {/* 3D Model */}
          <div className="relative min-h-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0b1728]">
            <div className="absolute left-4 top-4 z-10 rounded-xl border border-white/10 bg-black/25 px-3 py-2 backdrop-blur-md">
              <div className="text-xs font-semibold text-white">
                Shelter Visualization
              </div>

              <div className="mt-0.5 text-[10px] text-slate-400">
                {length_m.toFixed(1)}m × {width_m.toFixed(1)}m ×{" "}
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

          {/* Charts */}
          <div className="min-h-0">
            <ThermalResultsChart
              points={
                simulationResult?.points.map((point) => ({
                  timestamp: point.timestamp,
                  indoor_temperature_c:
                    point.indoor_temperature_c,
                  outdoor_temperature_c:
                    point.outdoor_temperature_c,
                  solar_gain_w: point.solar_gain_w,
                  total_heat_loss_w:
                    point.total_heat_loss_w,
                })) ?? []
              }
            />
          </div>
        </section>

        {/* RIGHT SIDE */}
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
                  ? ` • ${Math.round(location.elevation_m)} m elevation`
                  : ""}
              </div>

              <div className="mt-2 text-[10px] text-emerald-400">
                Weather: Open-Meteo
              </div>
            </div>
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
                      length_m: Number(event.target.value),
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
                      width_m: Number(event.target.value),
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
                      height_m: Number(event.target.value),
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
                setOrientation(Number(event.target.value))
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
                {wallAssembly.thickness * 1000 > 0
                  ? `${Math.round(
                      wallAssembly.thickness * 1000,
                    )} mm`
                  : "0 mm"}
              </span>
            </div>

            <input
              type="range"
              min="20"
              max="300"
              step="5"
              value={
                Math.round(
                  (wall_layers.find(
                    (layer) =>
                      layer.material_id === "rock_wool",
                  )?.thickness_m ?? 0.1) * 1000,
                )
              }
              onChange={(event) =>
                setWallInsulationThicknessMm(
                  Number(event.target.value),
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
                  {wallAssembly.rValue.toFixed(2)}
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
                  {wallAssembly.uValue.toFixed(3)}
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
                {Math.round(roofAssembly.thickness * 1000)} mm
              </span>
            </div>

            <input
              type="range"
              min="20"
              max="300"
              step="5"
              value={
                Math.round(
                  (roof_layers.find(
                    (layer) =>
                      layer.material_id === "rock_wool",
                  )?.thickness_m ?? 0.12) * 1000,
                )
              }
              onChange={(event) =>
                setRoofInsulationThicknessMm(
                  Number(event.target.value),
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
                  {roofAssembly.rValue.toFixed(2)}
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
                  {roofAssembly.uValue.toFixed(3)}
                </div>

                <div className="text-[9px] text-slate-600">
                  W/m²K
                </div>
              </div>
            </div>
          </div>

          {/* Initial temperature */}
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-white">
                Initial Indoor Temperature
              </span>

              <span className="text-xs text-orange-300">
                {initial_indoor_temperature_c.toFixed(1)}°C
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="35"
              step="0.5"
              value={initial_indoor_temperature_c}
              onChange={(event) =>
                setInitialIndoorTemperature(
                  Number(event.target.value),
                )
              }
              className="w-full accent-orange-400"
            />
          </div>

          {/* Run simulation */}
          <button
            type="button"
            onClick={runThermalSimulation}
            disabled={isSimulating}
            className="mt-5 w-full rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSimulating
              ? "Running Thermal Simulation..."
              : "Run Thermal Simulation"}
          </button>

          {/* Error */}
          {error && (
            <div className="mt-3 rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-[11px] leading-relaxed text-red-300">
              {error}
            </div>
          )}

          {/* Results */}
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
                    {simulationResult.comfort_hours.toFixed(1)} h
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">
                    Cold hours
                  </span>

                  <span className="font-medium text-blue-300">
                    {simulationResult.cold_hours.toFixed(1)} h
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">
                    Hot hours
                  </span>

                  <span className="font-medium text-orange-300">
                    {simulationResult.hot_hours.toFixed(1)} h
                  </span>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}