"use client";

import { useState } from "react";

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

export default function Home() {
  const [locationQuery, setLocationQuery] = useState("Leh");

  const [locations, setLocations] = useState<LocationResult[]>([]);

  const [selectedLocation, setSelectedLocation] =
    useState<LocationResult | null>(null);

  const [weather, setWeather] =
    useState<WeatherResponse | null>(null);

  const [initialTemperature, setInitialTemperature] =
    useState(18);

  const [isSearchingLocation, setIsSearchingLocation] =
    useState(false);

  const [isGettingLocation, setIsGettingLocation] =
    useState(false);

  const [isLoadingWeather, setIsLoadingWeather] =
    useState(false);

  const [isLoadingSimulation, setIsLoadingSimulation] =
    useState(false);

  const [result, setResult] =
    useState<SimulationResult | null>(null);

  const [error, setError] = useState("");

  async function searchLocation() {
    setIsSearchingLocation(true);
    setError("");

    try {
      const response = await fetch(
        `/backend-api/api/location/search?q=${encodeURIComponent(
          locationQuery,
        )}`,
      );

      if (!response.ok) {
        throw new Error("Location search failed.");
      }

      const data = await response.json();

      setLocations(data.results ?? []);
    } catch (searchError) {
      console.error(searchError);

      setError(
        "Unable to search for the location.",
      );
    } finally {
      setIsSearchingLocation(false);
    }
  }

  async function loadWeather(
    location: LocationResult,
  ) {
    setSelectedLocation(location);
    setIsLoadingWeather(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        `/backend-api/api/weather/forecast?latitude=${location.latitude}&longitude=${location.longitude}&hours=24`,
      );

      if (!response.ok) {
        throw new Error(
          "Weather request failed.",
        );
      }

      const data: WeatherResponse =
        await response.json();

      setWeather(data);
    } catch (weatherError) {
      console.error(weatherError);

      setError(
        "Unable to retrieve real weather data.",
      );
    } finally {
      setIsLoadingWeather(false);
    }
  }

  async function useMyLocation() {
    setIsGettingLocation(true);
    setError("");
    setResult(null);

    if (!navigator.geolocation) {
      setError(
        "Geolocation is not supported by this browser.",
      );

      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude =
            position.coords.latitude;

          const longitude =
            position.coords.longitude;

          const accuracy =
            position.coords.accuracy;

          const currentLocation: LocationResult =
            {
              name: "Current Location",
              country: null,
              country_code: null,
              region: null,
              latitude,
              longitude,
              elevation_m: null,
              timezone: null,
            };

          setSelectedLocation(
            currentLocation,
          );

          setLocations([]);

          const weatherResponse =
            await fetch(
              `/backend-api/api/weather/forecast?latitude=${latitude}&longitude=${longitude}&hours=24`,
            );

          if (!weatherResponse.ok) {
            throw new Error(
              "Weather request failed.",
            );
          }

          const weatherData: WeatherResponse =
            await weatherResponse.json();

          setWeather(weatherData);

          setLocationQuery(
            `${latitude.toFixed(
              4,
            )}, ${longitude.toFixed(4)}`,
          );

          setError(
            `Location detected with approximately ${Math.round(
              accuracy,
            )} m accuracy.`,
          );
        } catch (locationError) {
          console.error(locationError);

          setError(
            "Your location was detected, but weather data could not be retrieved.",
          );
        } finally {
          setIsGettingLocation(false);
        }
      },

      (locationError) => {
        console.error(locationError);

        let message =
          "Unable to access your current location.";

        if (
          locationError.code ===
          locationError.PERMISSION_DENIED
        ) {
          message =
            "Location permission was denied. Please allow location access in your browser.";
        }

        if (
          locationError.code ===
          locationError.POSITION_UNAVAILABLE
        ) {
          message =
            "Your current location could not be determined.";
        }

        if (
          locationError.code ===
          locationError.TIMEOUT
        ) {
          message =
            "Location request timed out. Please try again.";
        }

        setError(message);
        setIsGettingLocation(false);
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000,
      },
    );
  }

  async function runSimulation() {
    if (!selectedLocation || !weather) {
      setError(
        "Select a location and load weather before running the simulation.",
      );

      return;
    }

    setIsLoadingSimulation(true);
    setError("");

    try {
      const payload = {
        design: {
          location: {
            name:
              selectedLocation.name,

            latitude:
              selectedLocation.latitude,

            longitude:
              selectedLocation.longitude,

            elevation_m:
              selectedLocation.elevation_m,

            timezone:
              weather.timezone,

            source:
              selectedLocation.name ===
              "Current Location"
                ? "gps"
                : "search",
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
              {
                material_id: "brick",
                thickness_m: 0.2,
              },
              {
                material_id: "rock_wool",
                thickness_m: 0.1,
              },
              {
                material_id: "gypsum",
                thickness_m: 0.012,
              },
            ],
          },

          roof_assembly: {
            layers: [
              {
                material_id: "concrete",
                thickness_m: 0.1,
              },
              {
                material_id: "rock_wool",
                thickness_m: 0.12,
              },
            ],
          },

          floor_assembly: {
            layers: [
              {
                material_id: "concrete",
                thickness_m: 0.12,
              },
            ],
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

        initial_indoor_temperature_c:
          initialTemperature,

        weather: weather.points,

        internal_heat_gain_w: 200,

        timestep_minutes: 60,
      };

      const response = await fetch(
        "/backend-api/api/simulations/run",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            payload,
          ),
        },
      );

      if (!response.ok) {
        const message =
          await response.text();

        throw new Error(message);
      }

      const data: SimulationResult =
        await response.json();

      setResult(data);
      setError("");
    } catch (simulationError) {
      console.error(
        simulationError,
      );

      setError(
        "Simulation failed. Check the FastAPI terminal.",
      );
    } finally {
      setIsLoadingSimulation(false);
    }
  }

  const latestPoint =
    result?.points[
      result.points.length - 1
    ];

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <header className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
            Passive Shelter Engineering
          </p>

          <h1 className="mt-3 text-5xl font-bold">
            Thermo Shelter 1
          </h1>

          <p className="mt-4 max-w-3xl text-lg text-slate-400">
            Real-location weather +
            physics-based passive shelter
            thermal simulation.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[340px_1fr]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">
              Location & Weather
            </h2>

            <div className="mt-6 flex gap-2">
              <input
                value={locationQuery}
                onChange={(event) =>
                  setLocationQuery(
                    event.target.value,
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter"
                  ) {
                    searchLocation();
                  }
                }}
                placeholder="Search location"
                className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none focus:border-cyan-400"
              />

              <button
                onClick={
                  searchLocation
                }
                disabled={
                  isSearchingLocation
                }
                className="rounded-lg bg-slate-700 px-4 py-3 text-sm font-semibold hover:bg-slate-600 disabled:opacity-50"
              >
                {isSearchingLocation
                  ? "..."
                  : "Search"}
              </button>
            </div>

            <button
              onClick={
                useMyLocation
              }
              disabled={
                isGettingLocation
              }
              className="mt-3 w-full rounded-lg border border-cyan-700 bg-cyan-950/40 px-4 py-3 text-sm font-semibold text-cyan-300 hover:bg-cyan-950 disabled:opacity-50"
            >
              {isGettingLocation
                ? "Detecting Location..."
                : "Use My Current Location"}
            </button>

            {locations.length >
              0 && (
              <div className="mt-3 space-y-2">
                {locations.map(
                  (location) => (
                    <button
                      key={`${location.latitude}-${location.longitude}-${location.name}`}
                      onClick={() =>
                        loadWeather(
                          location,
                        )
                      }
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-left hover:border-cyan-500"
                    >
                      <p className="font-medium">
                        {location.name}
                      </p>

                      <p className="text-xs text-slate-400">
                        {location.region
                          ? `${location.region}, `
                          : ""}
                        {
                          location.country
                        }
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {location.latitude.toFixed(
                          4,
                        )}
                        °
                        {" "}
                        {location.longitude.toFixed(
                          4,
                        )}
                        °
                      </p>
                    </button>
                  ),
                )}
              </div>
            )}

            {selectedLocation && (
              <div className="mt-5 rounded-xl border border-cyan-900 bg-cyan-950/20 p-4">
                <p className="font-semibold text-cyan-300">
                  Selected Location
                </p>

                <p className="mt-2">
                  {selectedLocation.name}
                </p>

                {selectedLocation.region && (
                  <p className="text-sm text-slate-400">
                    {
                      selectedLocation.region
                    }
                    {selectedLocation.country
                      ? `, ${selectedLocation.country}`
                      : ""}
                  </p>
                )}

                <p className="mt-2 text-xs text-slate-500">
                  Latitude:{" "}
                  {selectedLocation.latitude.toFixed(
                    5,
                  )}

                  <br />

                  Longitude:{" "}
                  {selectedLocation.longitude.toFixed(
                    5,
                  )}
                </p>
              </div>
            )}

            {weather && (
              <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="font-semibold">
                  Real Weather Data
                </p>

                <div className="mt-3 space-y-2 text-sm text-slate-400">
                  <p>
                    Source:{" "}
                    <span className="text-white">
                      {weather.source}
                    </span>
                  </p>

                  <p>
                    Timezone:{" "}
                    <span className="text-white">
                      {weather.timezone}
                    </span>
                  </p>

                  <p>
                    Elevation:{" "}
                    <span className="text-white">
                      {weather.elevation_m?.toFixed(
                        0,
                      )}{" "}
                      m
                    </span>
                  </p>

                  <p>
                    Hourly points:{" "}
                    <span className="text-white">
                      {
                        weather.points
                          .length
                      }
                    </span>
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6">
              <label className="text-sm text-slate-300">
                Initial Indoor Temperature °C
              </label>

              <input
                type="number"
                value={
                  initialTemperature
                }
                onChange={(event) =>
                  setInitialTemperature(
                    Number(
                      event.target.value,
                    ),
                  )
                }
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white"
              />
            </div>

            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="font-medium">
                Shelter Configuration
              </p>

              <div className="mt-3 space-y-2 text-sm text-slate-400">
                <p>
                  Dimensions: 5 × 4 × 3 m
                </p>

                <p>
                  Orientation: South
                </p>

                <p>
                  Wall: Brick + Rock Wool
                </p>

                <p>
                  Window: 1.5 × 1.2 m
                </p>

                <p>
                  Thermal Mass: 1000 kg Stone
                </p>

                <p>
                  Ventilation: 0.5 ACH
                </p>
              </div>
            </div>

            <button
              onClick={
                runSimulation
              }
              disabled={
                isLoadingSimulation ||
                !weather
              }
              className="mt-8 w-full rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoadingSimulation
                ? "Running Simulation..."
                : "Run Real-Weather Simulation"}
            </button>

            {error && (
              <div className="mt-5 rounded-xl border border-amber-900 bg-amber-950/30 p-4 text-sm text-amber-300">
                {error}
              </div>
            )}
          </div>

          <div className="space-y-6">
            {!result && (
              <div className="flex min-h-[600px] items-center justify-center rounded-2xl border border-slate-800 bg-slate-900">
                <div className="max-w-lg text-center">
                  <div className="text-6xl">
                    ☀️🏠❄️
                  </div>

                  <h2 className="mt-5 text-2xl font-semibold">
                    Real-Weather Thermal Simulation
                  </h2>

                  <p className="mt-3 text-slate-400">
                    Search for a location or
                    use your current location,
                    load real weather data,
                    and run the shelter
                    simulation.
                  </p>
                </div>
              </div>
            )}

            {result && (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <MetricCard
                    title="Final Indoor"
                    value={`${result.final_indoor_temperature_c.toFixed(
                      1,
                    )} °C`}
                  />

                  <MetricCard
                    title="Minimum Indoor"
                    value={`${result.minimum_indoor_temperature_c.toFixed(
                      1,
                    )} °C`}
                  />

                  <MetricCard
                    title="Maximum Indoor"
                    value={`${result.maximum_indoor_temperature_c.toFixed(
                      1,
                    )} °C`}
                  />

                  <MetricCard
                    title="Comfort"
                    value={`${result.comfort_percentage.toFixed(
                      1,
                    )} %`}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <MetricCard
                    title="Final Thermal Mass"
                    value={
                      result.final_thermal_mass_temperature_c !==
                      null
                        ? `${result.final_thermal_mass_temperature_c.toFixed(
                            1,
                          )} °C`
                        : "Not configured"
                    }
                  />

                  <MetricCard
                    title="Cold Hours"
                    value={`${result.cold_hours.toFixed(
                      1,
                    )} h`}
                  />
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">
                        Real-Weather Simulation
                      </h2>

                      <p className="mt-1 text-sm text-slate-400">
                        Weather source:{" "}
                        {weather?.source}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 overflow-x-auto">
                    <table className="w-full min-w-[1100px] text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400">
                          <th className="px-3 py-3">
                            Time
                          </th>

                          <th className="px-3 py-3">
                            Outdoor °C
                          </th>

                          <th className="px-3 py-3">
                            Indoor °C
                          </th>

                          <th className="px-3 py-3">
                            Mass °C
                          </th>

                          <th className="px-3 py-3">
                            Solar W
                          </th>

                          <th className="px-3 py-3">
                            Heat Loss W
                          </th>

                          <th className="px-3 py-3">
                            Mass Flow W
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {result.points.map(
                          (point) => (
                            <tr
                              key={
                                point.timestamp
                              }
                              className="border-b border-slate-800/60"
                            >
                              <td className="px-3 py-3">
                                {new Date(
                                  point.timestamp,
                                ).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </td>

                              <td className="px-3 py-3">
                                {point.outdoor_temperature_c.toFixed(
                                  1,
                                )}
                              </td>

                              <td className="px-3 py-3 font-semibold text-cyan-300">
                                {point.indoor_temperature_c.toFixed(
                                  1,
                                )}
                              </td>

                              <td className="px-3 py-3 text-amber-300">
                                {point.thermal_mass_temperature_c.toFixed(
                                  1,
                                )}
                              </td>

                              <td className="px-3 py-3">
                                {point.solar_gain_w.toFixed(
                                  0,
                                )}
                              </td>

                              <td className="px-3 py-3">
                                {point.total_heat_loss_w.toFixed(
                                  0,
                                )}
                              </td>

                              <td className="px-3 py-3">
                                {point.thermal_mass_heat_transfer_w.toFixed(
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
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function MetricCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">
        {title}
      </p>

      <p className="mt-3 text-2xl font-bold">
        {value}
      </p>
    </div>
  );
}