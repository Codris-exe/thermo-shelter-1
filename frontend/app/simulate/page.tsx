"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  ReferenceLine,
} from "recharts";

import { historicalClimateToSimulationWeather } from "../../lib/historicalWeatherAdapter";
import MaterialSelector from "../../components/MaterialSelector";
import { useShelterDesignStore } from "../../stores/shelterDesignStore";

import {
  useHistoricalClimateStore,
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

// Default Leh, Ladakh pre-calibrated baseline
const DEFAULT_LEH_LOCATION: LocationPayload = {
  name: "Leh, India",
  latitude: 34.1650,
  longitude: 77.5840,
  elevation_m: 3502,
  timezone: "Asia/Kolkata",
  source: "search",
};

function generateDefaultLehWeather(): WeatherPoint[] {
  const points: WeatherPoint[] = [];

  const baseTemps = [
    -24.8,
    -25.0,
    -24.6,
    -24.2,
    -23.5,
    -22.0,
    -18.5,
    -14.2,
    -8.5,
    -3.2,
    1.5,
    4.2,
    6.0,
    5.8,
    3.2,
    -1.0,
    -6.5,
    -11.0,
    -15.5,
    -19.0,
    -21.5,
    -23.0,
    -24.0,
    -24.5,
  ];

  for (let hour = 0; hour < 24; hour++) {
    const isDay = hour >= 6 && hour <= 18;
    const solarW = isDay
      ? Math.sin(((hour - 6) / 12) * Math.PI) * 720
      : 0;

    const directW = solarW * 0.78;
    const diffuseW = solarW * 0.22;

    points.push({
      timestamp: `2025-01-15T${hour
        .toString()
        .padStart(2, "0")}:00:00Z`,
      outdoor_temperature_c: baseTemps[hour],
      wind_speed_m_s: 0.5 + Math.sin(hour / 4) * 0.2,
      solar_irradiance_w_m2: solarW,
      solar_gain_w: solarW * 1.8,
      direct_radiation_w_m2: directW,
      diffuse_radiation_w_m2: diffuseW,
      direct_normal_irradiance_w_m2: isDay ? directW * 1.15 : 0,
      cloud_cover_pct: 12,
      is_day: isDay,
      relative_humidity_pct: 35,
      ground_temperature_c: baseTemps[hour] - 1.2,
    });
  }

  return points;
}

function readSession<T>(key: string): T | null {
  try {
    const value = sessionStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

export default function SimulationPage() {
  /*
   * Shared shelter design state.
   *
   * Material selectors modify this store and the exact
   * same values are sent to the backend simulation.
   */
  const shelterDesign = useShelterDesignStore();

  const [location, setLocation] =
    useState<LocationPayload>(DEFAULT_LEH_LOCATION);

  const [historicalClimate, setHistoricalClimate] =
    useState<HistoricalClimateResult | null>(null);

  const [weatherPoints, setWeatherPoints] =
    useState<WeatherPoint[]>([]);

  const [initialTemperature, setInitialTemperature] =
    useState(18);

  const [accordionOpen, setAccordionOpen] =
    useState(true);

  const [isSimulating, setIsSimulating] =
    useState(false);

  const [simulationResult, setSimulationResult] =
    useState<SimulationResult | null>(null);

  const [error, setError] = useState("");

  const [isCustomSession, setIsCustomSession] =
    useState(false);

  const setHistoricalClimateStoreResult =
    useHistoricalClimateStore(
      (state) => state.setResult,
    );

  /*
   * Keep a compact material summary for the preset envelope.
   */
  const materialSummary = useMemo(() => {
    const wall = shelterDesign.wall_layers
      .map(
        (layer) =>
          `${Math.round(layer.thickness_m * 1000)}mm ${layer.material_id}`,
      )
      .join(" + ");

    const roof = shelterDesign.roof_layers
      .map(
        (layer) =>
          `${Math.round(layer.thickness_m * 1000)}mm ${layer.material_id}`,
      )
      .join(" + ");

    const floor = shelterDesign.floor_layers
      .map(
        (layer) =>
          `${Math.round(layer.thickness_m * 1000)}mm ${layer.material_id}`,
      )
      .join(" + ");

    return {
      wall,
      roof,
      floor,
      thermalMass: shelterDesign.thermal_mass
        ? `${shelterDesign.thermal_mass.mass_kg.toLocaleString()} kg ${shelterDesign.thermal_mass.material_id}`
        : "Disabled",
    };
  }, [
    shelterDesign.wall_layers,
    shelterDesign.roof_layers,
    shelterDesign.floor_layers,
    shelterDesign.thermal_mass,
  ]);

  useEffect(() => {
    const savedLocation =
      readSession<LocationPayload>(
        "thermo-shelter-selected-location",
      );

    const savedClimate =
      readSession<HistoricalClimateResult>(
        "thermo-shelter-historical-climate",
      );

    if (savedLocation && savedClimate) {
      setLocation(savedLocation);
      setHistoricalClimate(savedClimate);
      setHistoricalClimateStoreResult(savedClimate);

      const converted =
        historicalClimateToSimulationWeather(
          savedClimate,
        );

      setWeatherPoints(converted);
      setIsCustomSession(true);
    } else {
      setLocation(DEFAULT_LEH_LOCATION);
      setWeatherPoints(
        generateDefaultLehWeather(),
      );
      setIsCustomSession(false);
    }
  }, [setHistoricalClimateStoreResult]);

  async function handleRunSimulation() {
    setIsSimulating(true);
    setError("");
    setSimulationResult(null);

    try {
      /*
       * The material configuration now comes directly
       * from the shared shelter design store.
       */
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
            shape: shelterDesign.shape,
            length_m: shelterDesign.length_m,
            width_m: shelterDesign.width_m,
            height_m: shelterDesign.height_m,
          },

          orientation_deg:
            shelterDesign.orientation_deg,

          wall_assembly: {
            layers: shelterDesign.wall_layers,
          },

          roof_assembly: {
            layers: shelterDesign.roof_layers,
          },

          floor_assembly: {
            layers: shelterDesign.floor_layers,
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

          /*
           * Thermal mass now follows the selected
           * material from the shared store.
           */
          thermal_mass:
            shelterDesign.thermal_mass,

          ventilation: {
            ach: shelterDesign.ach,
          },

          comfort: {
            minimum_c:
              shelterDesign.comfort_min_c,

            maximum_c:
              shelterDesign.comfort_max_c,
          },
        },

        initial_indoor_temperature_c:
          initialTemperature,

        weather: weatherPoints,

        internal_heat_gain_w: 200,

        timestep_minutes: 60,
      };

      const res = await fetch(
        "/backend-api/api/simulations/run",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) {
        const msg = await res.text();

        throw new Error(
          msg ||
            "Thermal simulation call failed.",
        );
      }

      const data: SimulationResult =
        await res.json();

      setSimulationResult(data);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Simulation execution failed.",
      );
    } finally {
      setIsSimulating(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 font-sans antialiased selection:bg-[#2E5E43] selection:text-white">

      {/* ========================================================= */}
      {/* TOP NAVIGATION                                            */}
      {/* ========================================================= */}

      <header className="border-b border-stone-200/70 bg-[#FAF8F5]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">

          <div className="flex items-center gap-6">

            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 group"
            >
              <svg
                className="w-8 h-8 shrink-0"
                viewBox="0 0 36 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13 28L22 11L31 28H13Z"
                  fill="#2E5E43"
                />
                <path
                  d="M5 28L14 16L23 28H5Z"
                  fill="#528F68"
                  fillOpacity="0.85"
                />
                <path
                  d="M18 19L22 11L26 19H18Z"
                  fill="#F4F8F5"
                />
                <circle
                  cx="28"
                  cy="8"
                  r="3"
                  fill="#D97736"
                />
              </svg>

              <div>
                <div className="text-base font-extrabold text-stone-900 tracking-tight leading-none group-hover:text-[#2E5E43] transition">
                  Thermo Shelter
                </div>

                <div className="text-[9px] font-mono tracking-[0.22em] text-stone-500 font-semibold uppercase mt-0.5">
                  CLIMATE SIMULATION
                </div>
              </div>
            </Link>

            <div className="h-4 w-px bg-stone-300 mx-1 hidden sm:block" />

            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-3 text-xs">

              <Link
                href="/"
                className="font-medium text-stone-600 hover:text-stone-950 transition flex items-center gap-1.5"
              >
                ← Back to Home
              </Link>

              <span className="text-stone-300">
                |
              </span>

              <span className="font-semibold text-stone-800">
                Historical Climate Thermal Simulation
              </span>

            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-4">

            <div className="flex items-center gap-2">

              <svg
                className="w-4 h-4 text-amber-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="4"
                />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>

              <div className="w-9 h-5 bg-[#5D6F59] rounded-full p-0.5 cursor-pointer flex items-center justify-end">
                <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
              </div>

            </div>

            <Link
              href="/3d"
              className="bg-[#2E5E43] hover:bg-[#254F38] text-white px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition shadow-sm flex items-center gap-1.5"
            >
              3D Simulator →
            </Link>

          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* MAIN CONTENT                                              */}
      {/* ========================================================= */}

      <main className="max-w-[1400px] mx-auto px-6 py-6">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* ===================================================== */}
          {/* LEFT COLUMN                                            */}
          {/* ===================================================== */}

          <div className="lg:col-span-4 space-y-5">

            {/* =================================================== */}
            {/* CARD 1: ACTIVE CLIMATE SETUP                         */}
            {/* =================================================== */}

            <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden">

              <div className="absolute right-0 top-0 w-36 h-28 pointer-events-none opacity-40">
                <svg
                  viewBox="0 0 140 100"
                  fill="none"
                  className="w-full h-full text-slate-300"
                >
                  <path
                    d="M50 85L90 35L135 85H50Z"
                    fill="currentColor"
                    fillOpacity="0.3"
                  />
                  <path
                    d="M80 85L110 50L140 85H80Z"
                    fill="currentColor"
                    fillOpacity="0.4"
                  />
                </svg>
              </div>

              <div className="flex items-start justify-between relative z-10">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-full bg-[#E5EFE7] text-[#2E5E43] flex items-center justify-center shrink-0">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                  </div>

                  <div>

                    <div className="text-[10px] font-mono tracking-wider text-stone-500 font-bold uppercase">
                      01. ACTIVE CLIMATE SETUP
                    </div>

                    <h2 className="text-xl font-bold text-stone-900 leading-tight">
                      {location.name}
                    </h2>

                    <div className="text-xs font-mono text-stone-500 mt-0.5">
                      {location.latitude.toFixed(4)}° N,{" "}
                      {location.longitude.toFixed(4)}° E
                    </div>

                  </div>
                </div>

                <div className="bg-[#E2ECE4] text-[#2E5E43] px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 shadow-xs">
                  <svg
                    className="w-3 h-3"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 4L3 19h18L12 4z" />
                  </svg>

                  <span>
                    High Altitude
                  </span>
                </div>

              </div>

              {/* Metadata */}
              <div className="mt-6 pt-5 border-t border-stone-100 space-y-2.5 text-xs">

                <div className="flex items-center justify-between text-stone-600">
                  <div className="flex items-center gap-2">
                    <span>Climate source</span>
                  </div>

                  <span className="font-semibold text-[#2E5E43]">
                    {historicalClimate?.source ||
                      "Open-Meteo ERA5"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-stone-600">
                  <span>Period</span>

                  <span className="font-semibold text-stone-900">
                    {historicalClimate?.actual_start_date ||
                      "2016-01-01"}{" "}
                    →{" "}
                    {historicalClimate?.actual_end_date ||
                      "2025-12-31"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-stone-600">
                  <span>Profile</span>

                  <span className="font-semibold text-stone-900">
                    {historicalClimate?.selected_month
                      ? `Month ${historicalClimate.selected_month} Profile`
                      : "Annual representative profile"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-stone-600">
                  <span>Years</span>

                  <span className="font-semibold text-stone-900">
                    {historicalClimate?.years_available ??
                      11}
                  </span>
                </div>

                <div className="flex items-center justify-between text-stone-600">
                  <span>Hourly samples</span>

                  <span className="font-semibold text-stone-900">
                    {(
                      historicalClimate?.hourly_samples ??
                      87672
                    ).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-stone-600">
                  <span>Simulation hours</span>

                  <span className="font-semibold text-stone-900">
                    {weatherPoints.length || 24}
                  </span>
                </div>

              </div>
            </div>

            {/* =================================================== */}
            {/* CARD 2: SHELTER MODEL                                */}
            {/* =================================================== */}

            <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">

              {/* Header */}
              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-full bg-[#FFEBD8] text-[#D97736] flex items-center justify-center shrink-0">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                  </svg>
                </div>

                <div>
                  <div className="text-[10px] font-mono tracking-wider text-stone-500 font-bold uppercase">
                    02. SHELTER MODEL
                  </div>
                </div>

              </div>

              {/* Initial temperature */}
              <div className="mt-5">

                <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                  Initial indoor temperature (°C)
                </label>

                <input
                  type="number"
                  value={initialTemperature}
                  onChange={(e) =>
                    setInitialTemperature(
                      Number(e.target.value),
                    )
                  }
                  className="w-full rounded-xl border border-stone-200 bg-[#FDFBF9] px-4 py-2.5 text-sm font-semibold text-stone-900 focus:outline-none focus:border-[#2E5E43] focus:ring-1 focus:ring-[#2E5E43] transition"
                />

              </div>

              {/* ================================================= */}
              {/* MATERIAL CONFIGURATION                            */}
              {/* ================================================= */}

              <div className="mt-5 space-y-3">

                <div>
                  <div className="text-[10px] font-mono tracking-wider text-stone-500 font-bold uppercase">
                    MATERIAL CONFIGURATION
                  </div>

                  <p className="text-xs text-stone-500 mt-1">
                    Select construction materials and
                    insulation. Changes are used directly
                    in the thermal simulation.
                  </p>
                </div>

                <MaterialSelector
                  title="Wall Material"
                  description="Primary wall construction material."
                  type="wall"
                />

                <MaterialSelector
                  title="Wall Insulation"
                  description="Thermal insulation layer for the walls."
                  type="wall-insulation"
                />

                <MaterialSelector
                  title="Roof Material"
                  description="Primary roof construction material."
                  type="roof"
                />

                <MaterialSelector
                  title="Roof Insulation"
                  description="Thermal insulation layer for the roof."
                  type="roof-insulation"
                />

                <MaterialSelector
                  title="Floor Material"
                  description="Primary floor construction material."
                  type="floor"
                />

                <MaterialSelector
                  title="Thermal Mass"
                  description="Dense material used to store and release heat."
                  type="thermal-mass"
                />

              </div>

              {/* ================================================= */}
              {/* CURRENT ENVELOPE SUMMARY                         */}
              {/* ================================================= */}

              <div className="mt-5 rounded-xl border border-stone-200/80 bg-[#FBF9F5] overflow-hidden">

                <button
                  type="button"
                  onClick={() =>
                    setAccordionOpen(
                      !accordionOpen,
                    )
                  }
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-stone-100/60 transition"
                >

                  <div className="flex items-center gap-2.5">

                    <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12.0002 2.5L20.6605 7.5V17.5L12.0002 22.5L3.33984 17.5V7.5L12.0002 2.5ZM12.0002 4.80902L5.61803 8.5L12.0002 12.191L18.3824 8.5L12.0002 4.80902ZM5.33984 10.2361V16.3454L11.0002 19.6202V13.5109L5.33984 10.2361ZM13.0002 19.6202L18.6605 16.3454V10.2361L13.0002 13.5109V19.6202Z" />
                      </svg>
                    </div>

                    <span className="text-xs font-bold text-stone-800">
                      Current Shelter Configuration
                    </span>

                  </div>

                  <svg
                    className={`w-4 h-4 text-stone-400 transition-transform ${
                      accordionOpen
                        ? "rotate-180"
                        : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>

                </button>

                {accordionOpen && (
                  <div className="px-4 pb-4 pt-1 font-mono text-[11px] text-stone-600 space-y-1 leading-relaxed border-t border-stone-200/50">

                    <div>
                      • Geometry:{" "}
                      {shelterDesign.length_m}m ×{" "}
                      {shelterDesign.width_m}m ×{" "}
                      {shelterDesign.height_m}m
                    </div>

                    <div>
                      • Wall: {materialSummary.wall}
                    </div>

                    <div>
                      • Roof: {materialSummary.roof}
                    </div>

                    <div>
                      • Floor: {materialSummary.floor}
                    </div>

                    <div>
                      • Thermal Mass:{" "}
                      {materialSummary.thermalMass}
                    </div>

                    <div>
                      • Ventilation:{" "}
                      {shelterDesign.ach} ACH
                    </div>

                    <div>
                      • Comfort:{" "}
                      {shelterDesign.comfort_min_c}–
                      {shelterDesign.comfort_max_c}°C
                    </div>

                    <div>
                      • Orientation:{" "}
                      {shelterDesign.orientation_deg}°
                    </div>

                  </div>
                )}

              </div>

              {/* ================================================= */}
              {/* RUN SIMULATION                                     */}
              {/* ================================================= */}

              <button
                type="button"
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="mt-5 w-full rounded-xl bg-[#2E5E43] hover:bg-[#254F38] text-white py-3.5 px-4 font-bold text-xs tracking-wide transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
              >

                <svg
                  className="w-4 h-4 fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>

                <span>
                  {isSimulating
                    ? "Running Transient Simulation..."
                    : "Run Historical Climate Simulation"}
                </span>

              </button>

              {error && (
                <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                  {error}
                </div>
              )}

            </div>
          </div>

          {/* ===================================================== */}
          {/* RIGHT COLUMN                                           */}
          {/* ===================================================== */}

          <div className="lg:col-span-8 space-y-5">

            {/* Hero */}
            <div className="rounded-2xl border border-stone-200/80 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden relative min-h-[220px] flex items-center">

              <div
                className="absolute inset-0 z-0 bg-cover bg-right"
                style={{
                  backgroundImage:
                    "url('/images/leh-mountains-clean.png')",
                  backgroundPosition:
                    "right center",
                  backgroundRepeat:
                    "no-repeat",
                }}
              />

              <div className="absolute inset-0 z-10 bg-gradient-to-r from-white via-white/90 to-transparent w-full md:w-[68%]" />

              <div className="relative z-20 p-6 md:p-8 max-w-lg">

                <div className="text-[10px] font-mono font-bold tracking-[0.2em] text-stone-600 uppercase">
                  HISTORICAL CLIMATE ANALYSIS
                </div>

                <h1 className="text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight mt-1 mb-2">
                  {location.name}
                </h1>

                <p className="text-xs md:text-sm text-stone-700 leading-relaxed max-w-md">
                  Harnessing real climate data for
                  resilient and sustainable shelter
                  design.
                </p>

                <div className="w-10 h-1 bg-[#D97736] rounded-full my-3" />

                <p className="italic text-xs text-stone-600 font-serif">
                  &ldquo;Adapting today, for a warmer
                  tomorrow.&rdquo;
                </p>

              </div>
            </div>

            {/* Bottom callout */}
            <div className="rounded-2xl bg-[#EDF5EE] border border-[#D5E8D8] px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-700 shadow-xs">

              <div className="flex items-center gap-2.5">

                <div className="w-6 h-6 rounded-full bg-[#2E5E43] text-white flex items-center justify-center shrink-0">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
                  </svg>
                </div>

                <span className="font-medium">
                  This simulation uses the location&apos;s
                  24-hour historical profile for accurate
                  results.
                </span>

              </div>

              <div className="flex items-center gap-1.5 font-semibold text-[#2E5E43] shrink-0">

                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
                </svg>

                <span>
                  Data-driven. Sustainable. Resilient.
                </span>

              </div>
            </div>

            {/* =================================================== */}
            {/* SIMULATION RESULTS                                  */}
            {/* =================================================== */}

            {simulationResult && (
              <div className="space-y-5 animate-fadeIn">

                {/* KPI cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">

                  <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
                    <div className="text-[10px] uppercase font-mono text-stone-500 font-bold">
                      Final Indoor
                    </div>

                    <div className="text-2xl font-extrabold text-[#2E5E43] mt-1">
                      {simulationResult.final_indoor_temperature_c.toFixed(
                        1,
                      )}
                      °C
                    </div>
                  </div>

                  <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
                    <div className="text-[10px] uppercase font-mono text-stone-500 font-bold">
                      Min Indoor
                    </div>

                    <div className="text-2xl font-extrabold text-sky-600 mt-1">
                      {simulationResult.minimum_indoor_temperature_c.toFixed(
                        1,
                      )}
                      °C
                    </div>
                  </div>

                  <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
                    <div className="text-[10px] uppercase font-mono text-stone-500 font-bold">
                      Max Indoor
                    </div>

                    <div className="text-2xl font-extrabold text-amber-600 mt-1">
                      {simulationResult.maximum_indoor_temperature_c.toFixed(
                        1,
                      )}
                      °C
                    </div>
                  </div>

                  <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
                    <div className="text-[10px] uppercase font-mono text-stone-500 font-bold">
                      Thermal Comfort
                    </div>

                    <div className="text-2xl font-extrabold text-emerald-600 mt-1">
                      {simulationResult.comfort_percentage.toFixed(
                        1,
                      )}
                      %
                    </div>
                  </div>

                  <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
                    <div className="text-[10px] uppercase font-mono text-stone-500 font-bold">
                      Thermal Mass Core
                    </div>

                    <div className="text-2xl font-extrabold text-orange-600 mt-1">
                      {simulationResult.final_thermal_mass_temperature_c !==
                      null
                        ? `${simulationResult.final_thermal_mass_temperature_c.toFixed(
                            1,
                          )}°C`
                        : "—"}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
                    <div className="text-[10px] uppercase font-mono text-stone-500 font-bold">
                      Comfort Hours
                    </div>

                    <div className="text-2xl font-extrabold text-stone-800 mt-1">
                      {simulationResult.comfort_hours.toFixed(
                        0,
                      )}{" "}
                      / 24 h
                    </div>
                  </div>

                </div>

                {/* ================================================= */}
                {/* CHART                                               */}
                {/* ================================================= */}

                <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs">

                  <h3 className="text-sm font-bold text-stone-800 mb-4">
                    24-Hour Diurnal Thermal Equilibrium
                  </h3>

                  <div className="h-64 w-full">

                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >
                      <LineChart
                        data={
                          simulationResult.points
                        }
                      >

                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#F0EEE6"
                        />

                        <XAxis
                          dataKey="timestamp"
                          stroke="#A8A29E"
                          tick={{
                            fontSize: 10,
                            fill: "#78716C",
                          }}
                          tickFormatter={(val) =>
                            new Date(
                              val,
                            ).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )
                          }
                        />

                        <YAxis
                          stroke="#A8A29E"
                          tick={{
                            fontSize: 10,
                            fill: "#78716C",
                          }}
                          tickFormatter={(v) =>
                            `${v}°C`
                          }
                        />

                        <Tooltip
                          content={({
                            active,
                            payload,
                          }) => {
                            if (
                              active &&
                              payload &&
                              payload.length
                            ) {
                              const p =
                                payload[0]
                                  .payload as SimulationPoint;

                              return (
                                <div className="bg-stone-900 text-white px-3 py-2 rounded-xl text-xs font-mono shadow-md">

                                  <div className="font-bold text-stone-300">
                                    {new Date(
                                      p.timestamp,
                                    ).toLocaleTimeString(
                                      [],
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      },
                                    )}
                                  </div>

                                  <div className="text-[#2E5E43] font-bold">
                                    Indoor:{" "}
                                    {p.indoor_temperature_c.toFixed(
                                      1,
                                    )}
                                    °C
                                  </div>

                                  <div className="text-stone-400">
                                    Outdoor:{" "}
                                    {p.outdoor_temperature_c.toFixed(
                                      1,
                                    )}
                                    °C
                                  </div>

                                  <div className="text-amber-400">
                                    Mass:{" "}
                                    {p.thermal_mass_temperature_c.toFixed(
                                      1,
                                    )}
                                    °C
                                  </div>

                                </div>
                              );
                            }

                            return null;
                          }}
                        />

                        <ReferenceLine
                          y={18}
                          stroke="#10B981"
                          strokeDasharray="3 3"
                          label={{
                            value:
                              "18°C Min Comfort",
                            fill: "#10B981",
                            fontSize: 10,
                          }}
                        />

                        <ReferenceLine
                          y={26}
                          stroke="#10B981"
                          strokeDasharray="3 3"
                          label={{
                            value:
                              "26°C Max Comfort",
                            fill: "#10B981",
                            fontSize: 10,
                          }}
                        />

                        <Line
                          type="monotone"
                          dataKey="indoor_temperature_c"
                          stroke="#2E5E43"
                          strokeWidth={2.5}
                          dot={false}
                          name="Indoor"
                        />

                        <Line
                          type="monotone"
                          dataKey="outdoor_temperature_c"
                          stroke="#94A3B8"
                          strokeWidth={1.5}
                          dot={false}
                          name="Outdoor"
                          strokeDasharray="4 4"
                        />

                        <Line
                          type="monotone"
                          dataKey="thermal_mass_temperature_c"
                          stroke="#D97736"
                          strokeWidth={2}
                          dot={false}
                          name="Mass"
                        />

                      </LineChart>
                    </ResponsiveContainer>

                  </div>
                </div>

                {/* ================================================= */}
                {/* DATA LEDGER                                         */}
                {/* ================================================= */}

                <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs overflow-x-auto">

                  <table className="w-full text-left text-xs font-mono">

                    <thead>
                      <tr className="border-b border-stone-200 text-stone-500 uppercase text-[10px] tracking-wider">

                        <th className="py-2 px-3">
                          Hour
                        </th>

                        <th className="py-2 px-3">
                          Outdoor °C
                        </th>

                        <th className="py-2 px-3 text-[#2E5E43]">
                          Indoor °C
                        </th>

                        <th className="py-2 px-3 text-[#D97736]">
                          Mass °C
                        </th>

                        <th className="py-2 px-3">
                          Solar W
                        </th>

                        <th className="py-2 px-3 text-red-600">
                          Loss W
                        </th>

                        <th className="py-2 px-3 text-emerald-700">
                          Mass Flow W
                        </th>

                      </tr>
                    </thead>

                    <tbody className="divide-y divide-stone-100">

                      {simulationResult.points.map(
                        (pt) => (
                          <tr
                            key={pt.timestamp}
                            className="hover:bg-stone-50/60"
                          >

                            <td className="py-2 px-3 font-semibold text-stone-800">
                              {new Date(
                                pt.timestamp,
                              ).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </td>

                            <td className="py-2 px-3 text-stone-600">
                              {pt.outdoor_temperature_c.toFixed(
                                1,
                              )}
                            </td>

                            <td className="py-2 px-3 font-bold text-[#2E5E43]">
                              {pt.indoor_temperature_c.toFixed(
                                1,
                              )}
                            </td>

                            <td className="py-2 px-3 font-semibold text-[#D97736]">
                              {pt.thermal_mass_temperature_c.toFixed(
                                1,
                              )}
                            </td>

                            <td className="py-2 px-3 text-stone-600">
                              {pt.solar_gain_w.toFixed(
                                0,
                              )}
                            </td>

                            <td className="py-2 px-3 text-red-600">
                              {pt.total_heat_loss_w.toFixed(
                                0,
                              )}
                            </td>

                            <td className="py-2 px-3 text-emerald-700">
                              {pt.thermal_mass_heat_transfer_w.toFixed(
                                0,
                              )}
                            </td>

                          </tr>
                        ),
                      )}

                    </tbody>

                  </table>

                </div>

              </div>
            )}

            {/* Watermark */}
            <div className="flex justify-end pt-2 pb-6">

              <div className="flex items-center gap-2 text-stone-400 text-xs italic font-serif opacity-70">

                <svg
                  className="w-5 h-5 text-stone-300"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 4L3 19h18L12 4z" />
                </svg>

                <span>
                  A cooler planet builds brighter
                  tomorrows.
                </span>

              </div>

            </div>

          </div>
        </div>
      </main>
    </div>
  );
}