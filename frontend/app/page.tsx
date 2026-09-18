"use client";

import { useState } from "react";

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

  initial_thermal_mass_temperature_c:
    | number
    | null;

  final_thermal_mass_temperature_c:
    | number
    | null;

  minimum_thermal_mass_temperature_c:
    | number
    | null;

  maximum_thermal_mass_temperature_c:
    | number
    | null;

  comfort_hours: number;
  cold_hours: number;
  hot_hours: number;
  comfort_percentage: number;

  points: SimulationPoint[];
}


function createDemoWeather() {
  const start =
    new Date("2026-01-15T00:00:00");

  return Array.from(
    { length: 24 },
    (_, hour) => {
      const timestamp =
        new Date(start);

      timestamp.setHours(
        start.getHours() + hour,
      );

      const daylightFactor =
        Math.max(
          0,
          1 - Math.abs(hour - 12) / 7,
        );

      const solarIrradiance =
        Math.round(
          700 * daylightFactor,
        );

      const solarGain =
        Math.round(
          1200 * daylightFactor,
        );

      let outdoorTemperature = -14;

      if (hour >= 6 && hour <= 14) {
        outdoorTemperature =
          -14 + (hour - 6) * 1.5;
      } else if (hour > 14) {
        outdoorTemperature =
          -2 - (hour - 14) * 1.5;
      }

      return {
        timestamp:
          timestamp.toISOString(),

        outdoor_temperature_c:
          Number(
            outdoorTemperature.toFixed(1),
          ),

        wind_speed_m_s: 2.5,

        solar_irradiance_w_m2:
          solarIrradiance,

        solar_gain_w:
          solarGain,

        relative_humidity_pct: 40,

        ground_temperature_c: -2,
      };
    },
  );
}


export default function Home() {

  const [
    initialTemperature,
    setInitialTemperature,
  ] = useState(18);

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [result, setResult] =
    useState<SimulationResult | null>(
      null,
    );


  async function runSimulation() {

    setIsLoading(true);
    setError("");

    try {

      const weather =
        createDemoWeather();

      const payload = {

        design: {

          location: {
            name: "Leh, Ladakh",
            latitude: 34.1526,
            longitude: 77.5771,
            elevation_m: 3500,
            timezone: "Asia/Kolkata",
            source: "manual",
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

        weather,

        internal_heat_gain_w: 200,

        timestep_minutes: 60,
      };


      const response =
        await fetch(
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


      const data:
        SimulationResult =
        await response.json();


      setResult(data);

    } catch (
      simulationError
    ) {

      console.error(
        simulationError,
      );

      setError(
        "Simulation failed. Check the FastAPI terminal for the exact error.",
      );

    } finally {

      setIsLoading(false);

    }
  }


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
            Physics-based passive shelter
            thermal simulation.
          </p>

        </header>


        <section className="grid gap-6 lg:grid-cols-[320px_1fr]">


          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <h2 className="text-xl font-semibold">
              Simulation Setup
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Demo location: Leh, Ladakh
            </p>


            <div className="mt-8">

              <label className="text-sm text-slate-300">
                Initial Indoor Temperature
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
                Shelter
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
                  Thermal Mass: 1000 kg Stone
                </p>

                <p>
                  Thermal Mass Coupling: 5 W/K
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
                isLoading
              }
              className="mt-8 w-full rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
            >
              {
                isLoading
                  ? "Running Simulation..."
                  : "Run 24-Hour Simulation"
              }
            </button>


            {error && (
              <div className="mt-5 rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
                {error}
              </div>
            )}

          </div>


          <div className="space-y-6">

            {!result && (

              <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-slate-800 bg-slate-900">

                <div className="text-center">

                  <div className="text-6xl">
                    🏠
                  </div>

                  <h2 className="mt-5 text-2xl font-semibold">
                    Ready to Simulate
                  </h2>

                  <p className="mt-3 max-w-md text-slate-400">
                    Run the model to calculate
                    indoor temperature,
                    thermal-mass behavior,
                    heat loss and solar gain.
                  </p>

                </div>

              </div>

            )}


            {result && (

              <>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                  <MetricCard
                    title="Final Indoor"
                    value={`${result.final_indoor_temperature_c.toFixed(1)} °C`}
                  />

                  <MetricCard
                    title="Minimum Indoor"
                    value={`${result.minimum_indoor_temperature_c.toFixed(1)} °C`}
                  />

                  <MetricCard
                    title="Maximum Indoor"
                    value={`${result.maximum_indoor_temperature_c.toFixed(1)} °C`}
                  />

                  <MetricCard
                    title="Comfort"
                    value={`${result.comfort_percentage.toFixed(1)} %`}
                  />

                </div>


                <div className="grid gap-4 sm:grid-cols-2">

                  <MetricCard
                    title="Final Thermal Mass"
                    value={
                      result.final_thermal_mass_temperature_c !== null
                        ? `${result.final_thermal_mass_temperature_c.toFixed(1)} °C`
                        : "Not configured"
                    }
                  />

                  <MetricCard
                    title="Thermal Mass Range"
                    value={
                      result.minimum_thermal_mass_temperature_c !== null &&
                      result.maximum_thermal_mass_temperature_c !== null
                        ? `${result.minimum_thermal_mass_temperature_c.toFixed(1)} – ${result.maximum_thermal_mass_temperature_c.toFixed(1)} °C`
                        : "Not configured"
                    }
                  />

                </div>


                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

                  <h2 className="text-xl font-semibold">
                    24-Hour Thermal Simulation
                  </h2>

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

                          <th className="px-3 py-3">
                            Net Heat W
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


                              <td
                                className={`px-3 py-3 ${
                                  point.net_heat_gain_w >= 0
                                    ? "text-emerald-400"
                                    : "text-red-400"
                                }`}
                              >

                                {point.net_heat_gain_w.toFixed(
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