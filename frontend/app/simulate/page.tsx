"use client";

import { useState } from "react";
import Link from "next/link";

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

interface WeatherResponse {
  latitude: number;
  longitude: number;
  elevation_m: number;
  timezone: string;
  source: string;
  points: WeatherPoint[];
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

interface LocationResult {
  name: string;
  country: string | null;
  country_code: string | null;
  region: string | null;
  latitude: number;
  longitude: number;
  elevation_m: number | null;
  timezone: string | null;
}

export default function RegionalSimulationPage() {
  const [locationQuery, setLocationQuery] = useState("Leh");
  const [locations, setLocations] = useState<LocationResult[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(null);
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [initialTemperature, setInitialTemperature] = useState(18);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [isLoadingSimulation, setIsLoadingSimulation] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState("");

  async function searchLocation() {
    if (!locationQuery.trim()) return;
    setIsSearchingLocation(true);
    setError("");

    try {
      const response = await fetch(
        `/backend-api/api/location/search?q=${encodeURIComponent(locationQuery)}`
      );

      if (!response.ok) {
        throw new Error("Location search failed.");
      }

      const data = await response.json();
      setLocations(data.results ?? []);
      if (!data.results || data.results.length === 0) {
        setError("No locations found. Try another city or coordinates.");
      }
    } catch (searchError) {
      console.error(searchError);
      setError("Unable to search for the location. Ensure the backend is running.");
    } finally {
      setIsSearchingLocation(false);
    }
  }

  async function loadWeather(location: LocationResult) {
    setSelectedLocation(location);
    setIsLoadingWeather(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        `/backend-api/api/weather/forecast?latitude=${location.latitude}&longitude=${location.longitude}&hours=24`
      );

      if (!response.ok) {
        throw new Error("Weather request failed.");
      }

      const data: WeatherResponse = await response.json();
      setWeather(data);
    } catch (weatherError) {
      console.error(weatherError);
      setError("Unable to retrieve real weather data for this location.");
    } finally {
      setIsLoadingWeather(false);
    }
  }

  async function useMyLocation() {
    setIsGettingLocation(true);
    setError("");
    setResult(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          const accuracy = position.coords.accuracy;

          const currentLocation: LocationResult = {
            name: "Current Location",
            country: null,
            country_code: null,
            region: null,
            latitude,
            longitude,
            elevation_m: null,
            timezone: null,
          };

          setSelectedLocation(currentLocation);
          setLocations([]);

          const weatherResponse = await fetch(
            `/backend-api/api/weather/forecast?latitude=${latitude}&longitude=${longitude}&hours=24`
          );

          if (!weatherResponse.ok) {
            throw new Error("Weather request failed.");
          }

          const weatherData: WeatherResponse = await weatherResponse.json();
          setWeather(weatherData);
          setLocationQuery(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } catch (locationError) {
          console.error(locationError);
          setError("Your location was detected, but weather data could not be retrieved.");
        } finally {
          setIsGettingLocation(false);
        }
      },
      (locationError) => {
        console.error(locationError);
        let message = "Unable to access your current location.";
        if (locationError.code === locationError.PERMISSION_DENIED) {
          message = "Location permission was denied. Please allow location access in your browser.";
        } else if (locationError.code === locationError.POSITION_UNAVAILABLE) {
          message = "Your current location could not be determined.";
        } else if (locationError.code === locationError.TIMEOUT) {
          message = "Location request timed out. Please try again.";
        }
        setError(message);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000,
      }
    );
  }

  async function runSimulation() {
    if (!selectedLocation || !weather) {
      setError("Select a location and load weather before running the simulation.");
      return;
    }

    setIsLoadingSimulation(true);
    setError("");

    try {
      const payload = {
        design: {
          location: {
            name: selectedLocation.name,
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude,
            elevation_m: selectedLocation.elevation_m,
            timezone: weather.timezone,
            source: selectedLocation.name === "Current Location" ? "gps" : "search",
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
          ventilation: {
            ach: 0.5,
          },
          comfort: {
            minimum_c: 18,
            maximum_c: 26,
          },
        },
        initial_indoor_temperature_c: initialTemperature,
        weather: weather.points,
        internal_heat_gain_w: 200,
        timestep_minutes: 60,
      };

      const response = await fetch("/backend-api/api/simulations/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message);
      }

      const data: SimulationResult = await response.json();
      setResult(data);
      setError("");
    } catch (simError) {
      console.error(simError);
      setError("Simulation execution failed. Please verify your connection to the simulation backend.");
    } finally {
      setIsLoadingSimulation(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 antialiased font-sans">
      {/* Top Header */}
      <header className="border-b border-white/10 bg-[#070b14]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xs font-mono tracking-wider text-slate-400 hover:text-white transition flex items-center gap-1.5"
            >
              <span>←</span>
              <span>Back to Home</span>
            </Link>
            <span className="text-white/20">|</span>
            <div className="text-sm font-bold tracking-tight text-white font-mono">
              24-HOUR REGIONAL THERMAL SIMULATION
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/3d"
              className="rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-1.5 text-xs font-bold font-mono tracking-wider uppercase transition shadow-sm"
            >
              3D Simulator →
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Panel: Location Search & Inputs */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-[#0b1120] p-6 shadow-sm">
              <h2 className="text-base font-bold uppercase tracking-wider text-white font-mono mb-4">
                01. Select Location
              </h2>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") searchLocation();
                  }}
                  placeholder="Enter city or region (e.g. Leh, Siachen)..."
                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#070b14] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
                <button
                  onClick={searchLocation}
                  disabled={isSearchingLocation}
                  className="rounded-xl bg-cyan-600 hover:bg-cyan-500 px-4 py-2.5 text-xs font-bold font-mono text-white transition disabled:opacity-50"
                >
                  {isSearchingLocation ? "..." : "Search"}
                </button>
              </div>

              <button
                onClick={useMyLocation}
                disabled={isGettingLocation}
                className="mt-3 w-full rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 px-4 py-2.5 text-xs font-bold font-mono text-cyan-400 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>📍</span>
                <span>{isGettingLocation ? "Detecting GPS..." : "Use My Current Location"}</span>
              </button>

              {locations.length > 0 && (
                <div className="mt-4 space-y-2 max-h-48 overflow-y-auto pr-1">
                  <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500">
                    Select a match:
                  </div>
                  {locations.map((loc) => (
                    <button
                      key={`${loc.latitude}-${loc.longitude}-${loc.name}`}
                      onClick={() => loadWeather(loc)}
                      className="w-full rounded-xl border border-white/10 bg-[#070b14] hover:border-cyan-500/60 p-3 text-left transition text-xs font-mono"
                    >
                      <p className="font-bold text-white">{loc.name}</p>
                      <p className="text-slate-400 mt-0.5">
                        {loc.region ? `${loc.region}, ` : ""}
                        {loc.country}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        {loc.latitude.toFixed(4)}°, {loc.longitude.toFixed(4)}°
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {selectedLocation && (
                <div className="mt-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4 font-mono text-xs">
                  <div className="text-[10px] uppercase tracking-wider text-cyan-400 font-bold">
                    Active Location Target
                  </div>
                  <div className="text-sm font-bold text-white mt-1">{selectedLocation.name}</div>
                  {selectedLocation.region && (
                    <div className="text-slate-400">
                      {selectedLocation.region}
                      {selectedLocation.country ? `, ${selectedLocation.country}` : ""}
                    </div>
                  )}
                  <div className="text-[10px] text-slate-500 mt-1">
                    Lat: {selectedLocation.latitude.toFixed(4)}° | Lon: {selectedLocation.longitude.toFixed(4)}°
                  </div>
                </div>
              )}

              {isLoadingWeather && (
                <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-white/10 text-xs font-mono text-cyan-400 animate-pulse text-center">
                  Loading 24h satellite weather forecast...
                </div>
              )}

              {weather && (
                <div className="mt-4 rounded-xl border border-white/10 bg-[#070b14] p-4 font-mono text-xs space-y-2">
                  <div className="text-[10px] uppercase tracking-wider text-amber-400 font-bold">
                    Real 24h Forecast Loaded
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Source:</span>
                    <span className="text-white font-semibold">{weather.source}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Elevation:</span>
                    <span className="text-white font-semibold">
                      {weather.elevation_m ? `${weather.elevation_m.toFixed(0)} m` : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Timezone:</span>
                    <span className="text-white font-semibold">{weather.timezone}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Forecast Points:</span>
                    <span className="text-white font-semibold">{weather.points.length} Hours</span>
                  </div>
                </div>
              )}
            </div>

            {/* Shelter Settings */}
            <div className="rounded-2xl border border-white/10 bg-[#0b1120] p-6 shadow-sm font-mono">
              <h2 className="text-base font-bold uppercase tracking-wider text-white mb-4">
                02. Shelter Model
              </h2>

              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1.5">
                  Initial Indoor Temp (°C)
                </label>
                <input
                  type="number"
                  value={initialTemperature}
                  onChange={(e) => setInitialTemperature(Number(e.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-[#070b14] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="mt-4 rounded-xl border border-white/10 bg-[#070b14] p-3 text-xs text-slate-400 space-y-1.5">
                <div className="text-slate-300 font-semibold mb-1">Preset Thermal Mass Envelope:</div>
                <div>• Geometry: 5m × 4m × 3m (South Glazed)</div>
                <div>• Wall: 200mm Brick + 100mm Rock Wool</div>
                <div>• Thermal Mass: 1,000 kg Basalt Stone</div>
                <div>• Ventilation: 0.5 ACH Natural Convection</div>
              </div>

              <button
                onClick={runSimulation}
                disabled={isLoadingSimulation || !weather}
                className="mt-6 w-full rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 py-3.5 px-4 font-bold text-xs uppercase tracking-wider transition disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
              >
                {isLoadingSimulation ? "Simulating 24 Hours..." : "Run 24h Real-Weather Simulation"}
              </button>

              {error && (
                <div className="mt-4 p-3 rounded-xl border border-rose-500/30 bg-rose-950/30 text-rose-300 text-xs">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Results & Telemetry Table */}
          <div className="lg:col-span-8 space-y-6">
            {!result ? (
              <div className="h-[600px] flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#0b1120] text-center p-8">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-3xl mb-4">
                  🏔️
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  No Simulation Results Yet
                </h3>
                <p className="mt-2 text-sm text-slate-400 max-w-md leading-relaxed">
                  Search for any global high-altitude region or town on the left panel, load the 24-hour Open-Meteo satellite weather forecast, and click Run Simulation.
                </p>
              </div>
            ) : (
              <>
                {/* 6 Key Performance Metric Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 font-mono">
                  <div className="rounded-2xl border border-white/10 bg-[#0b1120] p-5">
                    <div className="text-xs uppercase text-slate-400 tracking-wider">Final Indoor</div>
                    <div className="text-2xl sm:text-3xl font-bold text-cyan-400 mt-2">
                      {result.final_indoor_temperature_c.toFixed(1)}°C
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#0b1120] p-5">
                    <div className="text-xs uppercase text-slate-400 tracking-wider">Min Indoor</div>
                    <div className="text-2xl sm:text-3xl font-bold text-sky-400 mt-2">
                      {result.minimum_indoor_temperature_c.toFixed(1)}°C
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#0b1120] p-5">
                    <div className="text-xs uppercase text-slate-400 tracking-wider">Max Indoor</div>
                    <div className="text-2xl sm:text-3xl font-bold text-amber-400 mt-2">
                      {result.maximum_indoor_temperature_c.toFixed(1)}°C
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#0b1120] p-5">
                    <div className="text-xs uppercase text-slate-400 tracking-wider">Thermal Comfort</div>
                    <div className="text-2xl sm:text-3xl font-bold text-emerald-400 mt-2">
                      {result.comfort_percentage.toFixed(1)}%
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#0b1120] p-5">
                    <div className="text-xs uppercase text-slate-400 tracking-wider">Mass Core Temp</div>
                    <div className="text-2xl sm:text-3xl font-bold text-orange-400 mt-2">
                      {result.final_thermal_mass_temperature_c !== null
                        ? `${result.final_thermal_mass_temperature_c.toFixed(1)}°C`
                        : "—"}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#0b1120] p-5">
                    <div className="text-xs uppercase text-slate-400 tracking-wider">Cold Hours</div>
                    <div className="text-2xl sm:text-3xl font-bold text-slate-300 mt-2">
                      {result.cold_hours.toFixed(1)} h
                    </div>
                  </div>
                </div>

                {/* 24-Hour Telemetry Table */}
                <div className="rounded-2xl border border-white/10 bg-[#0b1120] p-6 font-mono shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-4 border-b border-white/10">
                    <div>
                      <h3 className="text-base font-bold text-white uppercase tracking-wider">
                        24-Hour Transient Simulation Data
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Location: {selectedLocation?.name} · Weather Source: {weather?.source}
                      </p>
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
                        {result.points.map((pt) => (
                          <tr key={pt.timestamp} className="hover:bg-white/[0.03] transition">
                            <td className="py-2.5 px-3 font-semibold text-slate-300">
                              {new Date(pt.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>
                            <td className="py-2.5 px-3 text-slate-400">
                              {pt.outdoor_temperature_c.toFixed(1)}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-cyan-400">
                              {pt.indoor_temperature_c.toFixed(1)}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-amber-400">
                              {pt.thermal_mass_temperature_c.toFixed(1)}
                            </td>
                            <td className="py-2.5 px-3 text-slate-300">
                              {pt.solar_gain_w.toFixed(0)}
                            </td>
                            <td className="py-2.5 px-3 text-rose-400">
                              {pt.total_heat_loss_w.toFixed(0)}
                            </td>
                            <td className="py-2.5 px-3 text-emerald-400">
                              {pt.thermal_mass_heat_transfer_w.toFixed(0)}
                            </td>
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
      </main>
    </div>
  );
}
