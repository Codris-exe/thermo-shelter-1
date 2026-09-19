"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { historicalClimateToSimulationWeather } from "../../lib/historicalWeatherAdapter";
import {
  useHistoricalClimateStore,
  type HistoricalClimateProfilePoint,
  type HistoricalClimateResult,
} from "../../stores/historicalClimateStore";

interface WeatherPoint {
  timestamp: string;
  outdoor_temperature_c: number;
  wind_speed_m_s: number;
  solar_irradiance_w_m2: number;
  solar_gain_w: number;
  direct_radiation_w_m2: number;
  diffuse_radiation_w_m2: number;
  direct_normal_irradiance_w_m2: number;
  cloud_cover_pct: number | null;
  is_day: boolean;
  relative_humidity_pct: number | null;
  ground_temperature_c: number | null;
}

interface WeatherSummary {
  latitude: number;
  longitude: number;
  elevation_m: number;
  timezone: string;
  source: string;
}

interface LocationPayload {
  name: string;
  latitude: number;
  longitude: number;
  elevation_m: number | null;
  timezone: string;
  source: "gps" | "search";
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

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function readSession<T>(key: string): T | null {
  try {
    const value = sessionStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

export default function SimulationPage() {
  const [location, setLocation] = useState<LocationPayload | null>(null);
  const [weatherSummary, setWeatherSummary] = useState<WeatherSummary | null>(null);
  const [historicalClimate, setHistoricalClimate] = useState<HistoricalClimateResult | null>(null);
  const [weatherPoints, setWeatherPoints] = useState<WeatherPoint[]>([]);
  const [initialTemperature, setInitialTemperature] = useState(18);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSimulation, setIsLoadingSimulation] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState("");

  const setHistoricalClimateStoreResult = useHistoricalClimateStore(
    (state) => state.setResult,
  );

  useEffect(() => {
    const savedLocation = readSession<LocationPayload>(
      "thermo-shelter-selected-location",
    );
    const savedWeather = readSession<WeatherSummary>(
      "thermo-shelter-weather-summary",
    );
    const savedClimate = readSession<HistoricalClimateResult>(
      "thermo-shelter-historical-climate",
    );

    if (!savedLocation || !savedClimate) {
      setError(
        "No location and historical climate are loaded. Return to the Location page and complete the setup first.",
      );
      setIsLoading(false);
      return;
    }

    setLocation(savedLocation);
    setWeatherSummary(savedWeather);
    setHistoricalClimate(savedClimate);
    setHistoricalClimateStoreResult(savedClimate);

    const converted = historicalClimateToSimulationWeather(savedClimate);
    setWeatherPoints(converted);
    setIsLoading(false);
  }, [setHistoricalClimateStoreResult]);

  const climateLabel = useMemo(() => {
    if (!historicalClimate) return "Historical climate";
    if (historicalClimate.selected_month) {
      return `${MONTH_NAMES[historicalClimate.selected_month - 1]} representative profile`;
    }
    return "Annual representative profile";
  }, [historicalClimate]);

  async function runSimulation() {
    if (!location || weatherPoints.length < 2) {
      setError("Location and historical climate data are required before running the simulation.");
      return;
    }

    setIsLoadingSimulation(true);
    setError("");

    try {
      const payload = {
        design: {
          location: {
            name: location.name,
            latitude: location.latitude,
            longitude: location.longitude,
            elevation_m: location.elevation_m,
            timezone: location.timezone,
            source: location.source,
          },
          geometry: {
            shape: "rectangular",
            length_m: 5,
            width_m: 4,
            height_m: 3,
          },
          orientation_deg: 180,
          wall_assembly: {
            layers: [
              { material_id: "brick", thickness_m: 0.2 },
              { material_id: "rock_wool", thickness_m: 0.1 },
              { material_id: "gypsum", thickness_m: 0.012 },
            ],
          },
          roof_assembly: {
            layers: [
              { material_id: "concrete", thickness_m: 0.1 },
              { material_id: "rock_wool", thickness_m: 0.12 },
            ],
          },
          floor_assembly: {
            layers: [{ material_id: "concrete", thickness_m: 0.12 }],
          },
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
          ventilation: { ach: 0.5 },
          comfort: { minimum_c: 18, maximum_c: 26 },
        },
        initial_indoor_temperature_c: initialTemperature,
        weather: weatherPoints,
        internal_heat_gain_w: 200,
        timestep_minutes: 60,
      };

      const response = await fetch("/backend-api/api/simulations/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Thermal simulation failed.");
      }

      const data: SimulationResult = await response.json();
      setResult(data);
    } catch (simulationError) {
      console.error(simulationError);
      setError(
        simulationError instanceof Error
          ? simulationError.message
          : "Simulation execution failed. Check the FastAPI backend.",
      );
    } finally {
      setIsLoadingSimulation(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 antialiased font-sans">
      <header className="border-b border-white/10 bg-[#070b14]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs font-mono tracking-wider text-slate-400 hover:text-white transition">
              ← Back to Home
            </Link>
            <span className="text-white/20">|</span>
            <div className="text-sm font-bold tracking-tight text-white font-mono">
              HISTORICAL CLIMATE THERMAL SIMULATION
            </div>
          </div>

          <Link
            href="/3d"
            className="rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-1.5 text-xs font-bold font-mono tracking-wider uppercase transition"
          >
            3D Simulator →
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="min-h-[70vh] flex items-center justify-center">
            <div className="rounded-2xl border border-white/10 bg-[#0b1120] p-8 text-center">
              <div className="text-cyan-400 font-mono text-sm animate-pulse">
                Loading selected location and historical climate...
              </div>
            </div>
          </div>
        ) : !location || !historicalClimate ? (
          <div className="max-w-2xl mx-auto mt-16 rounded-2xl border border-amber-500/20 bg-amber-950/20 p-8 text-center">
            <div className="text-4xl">📍</div>
            <h1 className="mt-4 text-2xl font-bold">Location setup required</h1>
            <p className="mt-3 text-slate-400">
              Select a location and load its historical climate profile before entering the simulation.
            </p>
            <Link
              href="/location"
              className="mt-6 inline-flex rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400"
            >
              Go to Location Setup
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-6">
              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-950/10 p-6 shadow-sm">
                <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-400 font-bold font-mono">
                  01. Active Climate Setup
                </div>
                <h1 className="mt-2 text-2xl font-bold text-white">
                  {location.name}
                </h1>
                <p className="mt-1 text-xs text-slate-500 font-mono">
                  {location.latitude.toFixed(4)}°, {location.longitude.toFixed(4)}°
                </p>

                <div className="mt-5 space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Climate source</span>
                    <span className="text-emerald-300">{historicalClimate.source}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Period</span>
                    <span className="text-white">
                      {historicalClimate.actual_start_date || historicalClimate.requested_start_date} →{" "}
                      {historicalClimate.actual_end_date || historicalClimate.requested_end_date}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Profile</span>
                    <span className="text-white">{climateLabel}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Years</span>
                    <span className="text-white">{historicalClimate.years_available}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Hourly samples</span>
                    <span className="text-white">{historicalClimate.hourly_samples.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Simulation hours</span>
                    <span className="text-white">{weatherPoints.length}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0b1120] p-6 shadow-sm font-mono">
                <h2 className="text-base font-bold uppercase tracking-wider text-white mb-4">
                  02. Shelter Model
                </h2>

                <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1.5">
                  Initial Indoor Temp (°C)
                </label>
                <input
                  type="number"
                  value={initialTemperature}
                  onChange={(e) => setInitialTemperature(Number(e.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-[#070b14] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                />

                <div className="mt-4 rounded-xl border border-white/10 bg-[#070b14] p-3 text-xs text-slate-400 space-y-1.5">
                  <div className="text-slate-300 font-semibold mb-1">Preset Thermal Envelope</div>
                  <div>• Geometry: 5m × 4m × 3m</div>
                  <div>• Wall: 200mm Brick + 100mm Rock Wool</div>
                  <div>• Roof: 100mm Concrete + 120mm Rock Wool</div>
                  <div>• Thermal Mass: 1,000 kg Stone</div>
                  <div>• Ventilation: 0.5 ACH</div>
                  <div>• Comfort: 18–26°C</div>
                </div>

                <button
                  onClick={runSimulation}
                  disabled={isLoadingSimulation || weatherPoints.length < 2}
                  className="mt-6 w-full rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 py-3.5 px-4 font-bold text-xs uppercase tracking-wider transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isLoadingSimulation ? "Simulating Historical Profile..." : "Run Historical Climate Simulation"}
                </button>

                {error && (
                  <div className="mt-4 p-3 rounded-xl border border-rose-500/30 bg-rose-950/30 text-rose-300 text-xs leading-relaxed">
                    {error}
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-8 space-y-6">
              {!result ? (
                <div className="h-[600px] flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#0b1120] text-center p-8">
                  <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-3xl mb-4">
                    🏔️☀️🏠
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    Historical Climate Ready
                  </h3>
                  <p className="mt-2 text-sm text-slate-400 max-w-md leading-relaxed">
                    The location page has already selected the climate dataset. This simulation uses its representative 24-hour historical profile rather than asking for a second location.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 font-mono">
                    <div className="rounded-2xl border border-white/10 bg-[#0b1120] p-5">
                      <div className="text-xs uppercase text-slate-400 tracking-wider">Final Indoor</div>
                      <div className="text-2xl sm:text-3xl font-bold text-cyan-400 mt-2">{result.final_indoor_temperature_c.toFixed(1)}°C</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-[#0b1120] p-5">
                      <div className="text-xs uppercase text-slate-400 tracking-wider">Min Indoor</div>
                      <div className="text-2xl sm:text-3xl font-bold text-sky-400 mt-2">{result.minimum_indoor_temperature_c.toFixed(1)}°C</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-[#0b1120] p-5">
                      <div className="text-xs uppercase text-slate-400 tracking-wider">Max Indoor</div>
                      <div className="text-2xl sm:text-3xl font-bold text-amber-400 mt-2">{result.maximum_indoor_temperature_c.toFixed(1)}°C</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-[#0b1120] p-5">
                      <div className="text-xs uppercase text-slate-400 tracking-wider">Thermal Comfort</div>
                      <div className="text-2xl sm:text-3xl font-bold text-emerald-400 mt-2">{result.comfort_percentage.toFixed(1)}%</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-[#0b1120] p-5">
                      <div className="text-xs uppercase text-slate-400 tracking-wider">Mass Core Temp</div>
                      <div className="text-2xl sm:text-3xl font-bold text-orange-400 mt-2">
                        {result.final_thermal_mass_temperature_c !== null ? `${result.final_thermal_mass_temperature_c.toFixed(1)}°C` : "—"}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-[#0b1120] p-5">
                      <div className="text-xs uppercase text-slate-400 tracking-wider">Cold / Hot Hours</div>
                      <div className="text-xl sm:text-2xl font-bold text-slate-200 mt-2">{result.cold_hours.toFixed(1)} / {result.hot_hours.toFixed(1)} h</div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#0b1120] p-6 font-mono shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-4 border-b border-white/10">
                      <div>
                        <h3 className="text-base font-bold text-white uppercase tracking-wider">24-Hour Historical Thermal Data</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{location.name} · {climateLabel} · {historicalClimate.model}</p>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px] tracking-wider">
                            <th className="py-2.5 px-3">Time</th>
                            <th className="py-2.5 px-3">Outdoor °C</th>
                            <th className="py-2.5 px-3 text-cyan-400">Indoor °C</th>
                            <th className="py-2.5 px-3 text-amber-400">Mass °C</th>
                            <th className="py-2.5 px-3">Solar W</th>
                            <th className="py-2.5 px-3">Heat Loss W</th>
                            <th className="py-2.5 px-3">Mass Flow W</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {result.points.map((point) => (
                            <tr key={point.timestamp} className="hover:bg-white/[0.03] transition">
                              <td className="py-2.5 px-3 font-semibold text-slate-300">{new Date(point.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                              <td className="py-2.5 px-3 text-slate-400">{point.outdoor_temperature_c.toFixed(1)}</td>
                              <td className="py-2.5 px-3 font-bold text-cyan-400">{point.indoor_temperature_c.toFixed(1)}</td>
                              <td className="py-2.5 px-3 font-semibold text-amber-400">{point.thermal_mass_temperature_c.toFixed(1)}</td>
                              <td className="py-2.5 px-3 text-slate-300">{point.solar_gain_w.toFixed(0)}</td>
                              <td className="py-2.5 px-3 text-rose-400">{point.total_heat_loss_w.toFixed(0)}</td>
                              <td className="py-2.5 px-3 text-emerald-400">{point.thermal_mass_heat_transfer_w.toFixed(0)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

