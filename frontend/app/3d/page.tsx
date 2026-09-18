"use client";

import { useState } from "react";

import Shelter3D from "@/components/Shelter3D";

import {
  useShelterDesignStore,
} from "@/stores/shelterDesignStore";


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


interface WeatherResponse {
  source: string;
  timezone: string;

  latitude: number;
  longitude: number;

  elevation_m: number;

  points: Array<{
    timestamp: string;

    outdoor_temperature_c: number;

    wind_speed_m_s: number;

    solar_irradiance_w_m2: number;

    solar_gain_w: number;

    direct_radiation_w_m2: number;

    diffuse_radiation_w_m2: number;

    direct_normal_irradiance_w_m2: number;

    cloud_cover_pct:
      | number
      | null;

    is_day: boolean;

    relative_humidity_pct:
      | number
      | null;

    ground_temperature_c:
      | number
      | null;
  }>;
}


export default function ThreeDPage() {

  const length =
    useShelterDesignStore(
      (state) => state.length_m,
    );

  const width =
    useShelterDesignStore(
      (state) => state.width_m,
    );

  const height =
    useShelterDesignStore(
      (state) => state.height_m,
    );

  const orientation =
    useShelterDesignStore(
      (state) =>
        state.orientation_deg,
    );

  const location =
    useShelterDesignStore(
      (state) => state.location,
    );

  const wallLayers =
    useShelterDesignStore(
      (state) =>
        state.wall_layers,
    );

  const roofLayers =
    useShelterDesignStore(
      (state) =>
        state.roof_layers,
    );

  const floorLayers =
    useShelterDesignStore(
      (state) =>
        state.floor_layers,
    );

  const windows =
    useShelterDesignStore(
      (state) => state.windows,
    );

  const doors =
    useShelterDesignStore(
      (state) => state.doors,
    );

  const thermalMass =
    useShelterDesignStore(
      (state) =>
        state.thermal_mass,
    );

  const ach =
    useShelterDesignStore(
      (state) => state.ach,
    );

  const comfortMin =
    useShelterDesignStore(
      (state) =>
        state.comfort_min_c,
    );

  const comfortMax =
    useShelterDesignStore(
      (state) =>
        state.comfort_max_c,
    );

  const initialIndoorTemperature =
    useShelterDesignStore(
      (state) =>
        state.initial_indoor_temperature_c,
    );


  const setDimensions =
    useShelterDesignStore(
      (state) =>
        state.setDimensions,
    );

  const setOrientation =
    useShelterDesignStore(
      (state) =>
        state.setOrientation,
    );

  const setWallInsulationThicknessMm =
    useShelterDesignStore(
      (state) =>
        state.setWallInsulationThicknessMm,
    );

  const setRoofInsulationThicknessMm =
    useShelterDesignStore(
      (state) =>
        state.setRoofInsulationThicknessMm,
    );

  const setInitialIndoorTemperature =
    useShelterDesignStore(
      (state) =>
        state.setInitialIndoorTemperature,
    );


  const [
    isSimulating,
    setIsSimulating,
  ] = useState(false);


  const [
    simulationResult,
    setSimulationResult,
  ] =
    useState<SimulationResult | null>(
      null,
    );


  const [
    weatherSource,
    setWeatherSource,
  ] = useState("");


  const [
    simulationError,
    setSimulationError,
  ] = useState("");


  const brickThickness =
    (
      wallLayers.find(
        (layer) =>
          layer.material_id ===
          "brick",
      )?.thickness_m ?? 0
    ) * 1000;


  const insulationThickness =
    (
      wallLayers.find(
        (layer) =>
          layer.material_id ===
          "rock_wool",
      )?.thickness_m ?? 0
    ) * 1000;


  const gypsumThickness =
    (
      wallLayers.find(
        (layer) =>
          layer.material_id ===
          "gypsum",
      )?.thickness_m ?? 0
    ) * 1000;


  const roofInsulationThickness =
    (
      roofLayers.find(
        (layer) =>
          layer.material_id ===
          "rock_wool",
      )?.thickness_m ?? 0
    ) * 1000;


  const wallThickness =
    wallLayers.reduce(
      (total, layer) =>
        total + layer.thickness_m,
      0,
    );


  const roofThickness =
    roofLayers.reduce(
      (total, layer) =>
        total + layer.thickness_m,
      0,
    );


  const wallRValue =
    0.12 +
    wallLayers.reduce(
      (total, layer) => {

        const conductivity =
          layer.material_id ===
          "brick"
            ? 0.72
            : layer.material_id ===
                "rock_wool"
              ? 0.04
              : layer.material_id ===
                  "gypsum"
                ? 0.17
                : 1.0;

        return (
          total +
          layer.thickness_m /
            conductivity
        );
      },
      0,
    ) +
    0.03;


  const wallUValue =
    1 / wallRValue;


  const orientationName =
    orientation === 0
      ? "North"
      : orientation === 90
        ? "East"
        : orientation === 180
          ? "South"
          : orientation === 270
            ? "West"
            : "Custom";


  async function runThermalSimulation() {

    setIsSimulating(true);

    setSimulationError("");

    try {

      /*
       * 1. Retrieve REAL hourly weather
       *    for the location stored in the
       *    shared design state.
       */

      const weatherResponse =
        await fetch(
          `/backend-api/api/weather/forecast?latitude=${location.latitude}&longitude=${location.longitude}&hours=24`,
        );


      if (!weatherResponse.ok) {

        throw new Error(
          "Unable to retrieve weather data.",
        );
      }


      const weather:
        WeatherResponse =
        await weatherResponse.json();


      setWeatherSource(
        weather.source,
      );


      /*
       * 2. Convert the shared frontend
       *    design state into the backend
       *    ShelterDesign schema.
       */

      const payload = {

        design: {

          location: {
            name:
              location.name,

            latitude:
              location.latitude,

            longitude:
              location.longitude,

            elevation_m:
              location.elevation_m,

            timezone:
              location.timezone,

            source:
              location.source,
          },


          geometry: {
            shape: "rectangular",

            length_m:
              length,

            width_m:
              width,

            height_m:
              height,
          },


          orientation_deg:
            orientation,


          wall_assembly: {
            layers:
              wallLayers,
          },


          roof_assembly: {
            layers:
              roofLayers,
          },


          floor_assembly: {
            layers:
              floorLayers,
          },


          windows,


          doors,


          thermal_mass:
            thermalMass,


          ventilation: {
            ach,
          },


          comfort: {
            minimum_c:
              comfortMin,

            maximum_c:
              comfortMax,
          },
        },


        initial_indoor_temperature_c:
          initialIndoorTemperature,


        weather:
          weather.points,


        internal_heat_gain_w:
          200,


        timestep_minutes:
          60,
      };


      /*
       * 3. Send the actual current
       *    design to the thermal engine.
       */

      const simulationResponse =
        await fetch(
          "/backend-api/api/simulations/run",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                payload,
              ),
          },
        );


      if (
        !simulationResponse.ok
      ) {

        const message =
          await simulationResponse.text();

        throw new Error(
          message,
        );
      }


      const result:
        SimulationResult =
        await simulationResponse.json();


      setSimulationResult(
        result,
      );

    } catch (error) {

      console.error(error);

      setSimulationError(
        "Simulation failed. Check the backend terminal for details.",
      );

      setSimulationResult(
        null,
      );

    } finally {

      setIsSimulating(false);

    }
  }


  return (
    <main className="h-screen overflow-hidden bg-slate-950 text-white">

      <div className="mx-auto flex h-full max-w-[1600px] flex-col px-5 py-4">


        {/* HEADER */}

        <header className="flex shrink-0 items-center justify-between border-b border-slate-800 pb-3">

          <div>

            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-400">
              Thermo Shelter 1
            </p>

            <h1 className="mt-1 text-2xl font-bold">
              3D Design Studio
            </h1>

          </div>


          <div className="hidden items-center gap-3 sm:flex">

            <StatusBadge
              label="3D Model"
              value="Live"
            />

            <StatusBadge
              label="Thermal Engine"
              value="Ready"
            />

          </div>

        </header>


        {/* MAIN */}

        <div className="mt-4 grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_400px]">


          {/* 3D */}

          <section className="min-h-0 rounded-2xl border border-slate-800 bg-slate-900/70">

            <div className="flex h-full min-h-0 flex-col">

              <div className="flex shrink-0 items-center justify-between border-b border-slate-800 px-5 py-3">

                <div>

                  <h2 className="font-semibold">
                    Shelter Visualization
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Drag to rotate • Scroll to zoom • Right-click to pan
                  </p>

                </div>


                <div className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-400">

                  {orientation}°
                  {" "}
                  •
                  {" "}
                  {orientationName}

                </div>

              </div>


              <div className="min-h-0 flex-1 p-3">

                <Shelter3D
                  length={length}
                  width={width}
                  height={height}
                  orientation={orientation}
                  wallThickness={
                    wallThickness
                  }
                  roofThickness={
                    roofThickness
                  }
                />

              </div>

            </div>

          </section>


          {/* RIGHT PANEL */}

          <aside className="min-h-0 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-4">


            {/* LOCATION */}

            <PanelSection title="Simulation Location">

              <div className="rounded-xl bg-slate-950 p-3">

                <p className="font-semibold text-white">
                  {location.name}
                </p>

                <p className="mt-1 text-xs text-slate-500">

                  {location.latitude.toFixed(
                    4,
                  )}

                  ,
                  {" "}

                  {location.longitude.toFixed(
                    4,
                  )}

                </p>

                <p className="mt-1 text-xs text-slate-500">

                  {location.timezone ||
                    "Local timezone"}

                </p>

              </div>

            </PanelSection>


            {/* DIMENSIONS */}

            <PanelSection title="Dimensions">

              <div className="grid grid-cols-3 gap-2">

                <MiniControl
                  label="Length"
                  value={length}
                  unit="m"
                  min={2}
                  max={15}
                  step={0.1}
                  onChange={(value) =>
                    setDimensions({
                      length_m:
                        value,
                    })
                  }
                />

                <MiniControl
                  label="Width"
                  value={width}
                  unit="m"
                  min={2}
                  max={12}
                  step={0.1}
                  onChange={(value) =>
                    setDimensions({
                      width_m:
                        value,
                    })
                  }
                />

                <MiniControl
                  label="Height"
                  value={height}
                  unit="m"
                  min={2}
                  max={8}
                  step={0.1}
                  onChange={(value) =>
                    setDimensions({
                      height_m:
                        value,
                    })
                  }
                />

              </div>

            </PanelSection>


            {/* ORIENTATION */}

            <PanelSection title="Orientation">

              <div className="flex items-center gap-3">

                <input
                  type="range"
                  min="0"
                  max="360"
                  step="1"
                  value={orientation}
                  onChange={(event) =>
                    setOrientation(
                      Number(
                        event.target.value,
                      ),
                    )
                  }
                  className="min-w-0 flex-1 accent-cyan-400"
                />

                <div className="w-20 rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-center text-sm font-semibold text-cyan-300">

                  {orientation}°

                </div>

              </div>

              <p className="mt-2 text-xs text-slate-400">

                Facing:
                <span className="ml-1 font-medium text-white">
                  {orientationName}
                </span>

              </p>

            </PanelSection>


            {/* WALL */}

            <PanelSection title="Wall Construction">

              <LayerRow
                material="Brick"
                thickness={`${brickThickness.toFixed(
                  0,
                )} mm`}
              />


              <div className="mt-2">

                <div className="flex items-center justify-between">

                  <span className="text-xs text-slate-300">
                    Rock Wool
                  </span>

                  <span className="text-xs font-semibold text-cyan-300">

                    {insulationThickness.toFixed(
                      0,
                    )}
                    {" "}
                    mm

                  </span>

                </div>


                <input
                  type="range"
                  min="25"
                  max="250"
                  step="5"
                  value={
                    insulationThickness
                  }
                  onChange={(event) =>
                    setWallInsulationThicknessMm(
                      Number(
                        event.target.value,
                      ),
                    )
                  }
                  className="mt-1 w-full accent-cyan-400"
                />

              </div>


              <LayerRow
                material="Gypsum"
                thickness={`${gypsumThickness.toFixed(
                  0,
                )} mm`}
              />


              <div className="mt-3 grid grid-cols-2 gap-2">

                <ValueCard
                  title="R-Value"
                  value={wallRValue.toFixed(
                    3,
                  )}
                  unit="m²K/W"
                  type="cyan"
                />

                <ValueCard
                  title="U-Value"
                  value={wallUValue.toFixed(
                    3,
                  )}
                  unit="W/m²K"
                  type="green"
                />

              </div>


              <div className="mt-2 flex items-center justify-between rounded-lg bg-slate-950 px-3 py-2 text-xs">

                <span className="text-slate-500">
                  Total wall thickness
                </span>

                <span className="font-semibold text-white">

                  {(
                    wallThickness *
                    1000
                  ).toFixed(0)}

                  {" "}
                  mm

                </span>

              </div>

            </PanelSection>


            {/* ROOF */}

            <PanelSection title="Roof Construction">

              <div className="flex items-center justify-between">

                <span className="text-xs text-slate-300">
                  Concrete
                </span>

                <span className="text-xs text-slate-400">
                  100 mm
                </span>

              </div>


              <div className="mt-3">

                <div className="flex items-center justify-between">

                  <span className="text-xs text-slate-300">
                    Rock Wool
                  </span>

                  <span className="text-xs font-semibold text-cyan-300">

                    {roofInsulationThickness.toFixed(
                      0,
                    )}
                    {" "}
                    mm

                  </span>

                </div>


                <input
                  type="range"
                  min="25"
                  max="300"
                  step="5"
                  value={
                    roofInsulationThickness
                  }
                  onChange={(event) =>
                    setRoofInsulationThicknessMm(
                      Number(
                        event.target.value,
                      ),
                    )
                  }
                  className="mt-1 w-full accent-cyan-400"
                />

              </div>

            </PanelSection>


            {/* INITIAL TEMPERATURE */}

            <PanelSection title="Simulation Conditions">

              <div className="flex items-center justify-between">

                <span className="text-xs text-slate-400">
                  Initial Indoor Temperature
                </span>

                <span className="text-sm font-semibold text-cyan-300">
                  {initialIndoorTemperature.toFixed(
                    1,
                  )}
                  °C
                </span>

              </div>


              <input
                type="range"
                min="5"
                max="30"
                step="0.5"
                value={
                  initialIndoorTemperature
                }
                onChange={(event) =>
                  setInitialIndoorTemperature(
                    Number(
                      event.target.value,
                    ),
                  )
                }
                className="mt-2 w-full accent-cyan-400"
              />

              <div className="mt-2 text-xs text-slate-500">

                Comfort range:
                {" "}
                {comfortMin}°C –{" "}
                {comfortMax}°C

              </div>

            </PanelSection>


            {/* RUN BUTTON */}

            <button
              onClick={
                runThermalSimulation
              }
              disabled={
                isSimulating
              }
              className="mt-3 w-full rounded-xl bg-cyan-500 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >

              {isSimulating
                ? "Running Real-Weather Simulation..."
                : "Run Thermal Simulation"}

            </button>


            {/* SIMULATION ERROR */}

            {simulationError && (

              <div className="mt-3 rounded-xl border border-red-900 bg-red-950/30 p-3 text-xs text-red-300">

                {simulationError}

              </div>

            )}


            {/* RESULTS */}

            {simulationResult && (

              <section className="mt-4 border-t border-slate-800 pt-4">

                <div className="flex items-center justify-between">

                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Thermal Results
                  </h3>

                  <span className="text-[10px] text-emerald-400">
                    {weatherSource}
                  </span>

                </div>


                <div className="mt-3 grid grid-cols-2 gap-2">

                  <ResultCard
                    title="Final Indoor"
                    value={`${simulationResult.final_indoor_temperature_c.toFixed(
                      1,
                    )}°C`}
                  />

                  <ResultCard
                    title="Min Indoor"
                    value={`${simulationResult.minimum_indoor_temperature_c.toFixed(
                      1,
                    )}°C`}
                  />

                  <ResultCard
                    title="Comfort"
                    value={`${simulationResult.comfort_percentage.toFixed(
                      1,
                    )}%`}
                  />

                  <ResultCard
                    title="Cold Hours"
                    value={`${simulationResult.cold_hours.toFixed(
                      1,
                    )} h`}
                  />

                </div>


                <div className="mt-3 rounded-xl bg-slate-950 p-3">

                  <div className="flex justify-between text-xs">

                    <span className="text-slate-500">
                      Thermal Mass
                    </span>

                    <span className="text-amber-300">

                      {simulationResult.final_thermal_mass_temperature_c !==
                      null
                        ? `${simulationResult.final_thermal_mass_temperature_c.toFixed(
                            1,
                          )}°C`
                        : "Not configured"}

                    </span>

                  </div>


                  <div className="mt-2 flex justify-between text-xs">

                    <span className="text-slate-500">
                      Maximum Indoor
                    </span>

                    <span className="text-white">

                      {simulationResult.maximum_indoor_temperature_c.toFixed(
                        1,
                      )}
                      °C

                    </span>

                  </div>

                </div>


                <div className="mt-3 rounded-xl border border-cyan-900/50 bg-cyan-950/20 p-3">

                  <p className="text-[10px] uppercase tracking-wider text-cyan-400">
                    Model Status
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-400">

                    This result uses the current 3D
                    design dimensions, construction,
                    orientation and real hourly weather
                    data.

                  </p>

                </div>

              </section>

            )}


            {/* LIVE SUMMARY */}

            <section className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-3">

              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                Live Design
              </p>

              <div className="mt-2 grid grid-cols-2 gap-2">

                <Summary
                  label="Floor Area"
                  value={`${(
                    length * width
                  ).toFixed(1)} m²`}
                />

                <Summary
                  label="Volume"
                  value={`${(
                    length *
                    width *
                    height
                  ).toFixed(1)} m³`}
                />

                <Summary
                  label="Wall"
                  value={`${(
                    wallThickness *
                    1000
                  ).toFixed(0)} mm`}
                />

                <Summary
                  label="Orientation"
                  value={`${orientation}°`}
                />

              </div>

            </section>

          </aside>

        </div>

      </div>
    </main>
  );
}


function PanelSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-slate-800 pb-3 pt-1 first:pt-0">

      <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {title}
      </h3>

      {children}

    </section>
  );
}


function MiniControl({
  label,
  value,
  unit,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  onChange: (
    value: number,
  ) => void;
}) {
  return (
    <div>

      <div className="flex items-baseline justify-between">

        <span className="text-[10px] text-slate-500">
          {label}
        </span>

        <span className="text-xs font-semibold text-cyan-300">
          {value}
          {unit}
        </span>

      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) =>
          onChange(
            Number(
              event.target.value,
            ),
          )
        }
        className="mt-1 w-full accent-cyan-400"
      />

    </div>
  );
}


function LayerRow({
  material,
  thickness,
}: {
  material: string;
  thickness: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-slate-950 px-3 py-2">

      <span className="text-xs text-slate-300">
        {material}
      </span>

      <span className="text-xs text-slate-400">
        {thickness}
      </span>

    </div>
  );
}


function ValueCard({
  title,
  value,
  unit,
  type,
}: {
  title: string;
  value: string;
  unit: string;
  type: "cyan" | "green";
}) {

  const styles =
    type === "cyan"
      ? "border-cyan-900/70 bg-cyan-950/30 text-cyan-300"
      : "border-emerald-900/70 bg-emerald-950/30 text-emerald-300";

  return (
    <div
      className={`rounded-xl border p-3 ${styles}`}
    >

      <p className="text-[10px] uppercase tracking-wider text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-lg font-bold">
        {value}
      </p>

      <p className="text-[10px] text-slate-500">
        {unit}
      </p>

    </div>
  );
}


function ResultCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-950 p-3">

      <p className="text-[10px] uppercase tracking-wider text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-lg font-bold text-white">
        {value}
      </p>

    </div>
  );
}


function Summary({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-slate-900 p-2">

      <p className="text-[10px] text-slate-500">
        {label}
      </p>

      <p className="mt-0.5 text-xs font-semibold text-white">
        {value}
      </p>

    </div>
  );
}


function StatusBadge({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs">

      <span className="text-slate-500">
        {label}
      </span>

      <span className="text-emerald-400">
        ● {value}
      </span>

    </div>
  );
}