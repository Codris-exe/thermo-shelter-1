"use client";

import Shelter3D from "@/components/Shelter3D";

import {
  useShelterDesignStore,
} from "@/stores/shelterDesignStore";


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
      (state) => state.orientation_deg,
    );

  const wallLayers =
    useShelterDesignStore(
      (state) => state.wall_layers,
    );

  const roofLayers =
    useShelterDesignStore(
      (state) => state.roof_layers,
    );

  const setDimensions =
    useShelterDesignStore(
      (state) => state.setDimensions,
    );

  const setOrientation =
    useShelterDesignStore(
      (state) => state.setOrientation,
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


  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <div className="mx-auto max-w-7xl px-6 py-10">

        <header className="mb-8">

          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
            3D Design Studio
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            Thermo Shelter 1 — 3D Shelter
          </h1>

          <p className="mt-3 max-w-3xl text-slate-400">
            This 3D model is driven by the shared
            Thermo Shelter design state.
          </p>

        </header>


        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">


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


          <aside className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <h2 className="text-xl font-semibold">
              Shelter Configuration
            </h2>


            <Control
              label="Length"
              value={length}
              min={2}
              max={15}
              step={0.1}
              unit="m"
              onChange={(value) =>
                setDimensions({
                  length_m:
                    value,
                })
              }
            />


            <Control
              label="Width"
              value={width}
              min={2}
              max={12}
              step={0.1}
              unit="m"
              onChange={(value) =>
                setDimensions({
                  width_m:
                    value,
                })
              }
            />


            <Control
              label="Height"
              value={height}
              min={2}
              max={8}
              step={0.1}
              unit="m"
              onChange={(value) =>
                setDimensions({
                  height_m:
                    value,
                })
              }
            />


            <Control
              label="Orientation"
              value={orientation}
              min={0}
              max={360}
              step={1}
              unit="°"
              onChange={
                setOrientation
              }
            />


            <Control
              label="Rock Wool Wall Insulation"
              value={insulationThickness}
              min={25}
              max={250}
              step={5}
              unit="mm"
              onChange={
                setWallInsulationThicknessMm
              }
            />


            <Control
              label="Rock Wool Roof Insulation"
              value={
                roofInsulationThickness
              }
              min={25}
              max={300}
              step={5}
              unit="mm"
              onChange={
                setRoofInsulationThicknessMm
              }
            />


            <div className="mt-8 rounded-xl border border-cyan-900 bg-cyan-950/20 p-4">

              <p className="font-semibold text-cyan-300">
                Shared Design State
              </p>

              <div className="mt-3 space-y-2 text-sm text-slate-400">

                <p>
                  Dimensions:
                  <span className="text-white">
                    {" "}
                    {length.toFixed(
                      1,
                    )}
                    ×
                    {width.toFixed(
                      1,
                    )}
                    ×
                    {height.toFixed(
                      1,
                    )}{" "}
                    m
                  </span>
                </p>

                <p>
                  Wall thickness:
                  <span className="text-white">
                    {" "}
                    {(
                      wallThickness *
                      1000
                    ).toFixed(
                      0,
                    )}{" "}
                    mm
                  </span>
                </p>

                <p>
                  Roof thickness:
                  <span className="text-white">
                    {" "}
                    {(
                      roofThickness *
                      1000
                    ).toFixed(
                      0,
                    )}{" "}
                    mm
                  </span>
                </p>

                <p>
                  Orientation:
                  <span className="text-white">
                    {" "}
                    {orientation}°
                    {" — "}
                    {orientationName}
                  </span>
                </p>

              </div>

            </div>


            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">

              <p className="font-semibold">
                Wall Construction
              </p>

              <div className="mt-3 space-y-2 text-sm text-slate-400">

                <p>
                  Brick:
                  <span className="text-white">
                    {" "}
                    {brickThickness.toFixed(
                      0,
                    )}{" "}
                    mm
                  </span>
                </p>

                <p>
                  Rock Wool:
                  <span className="text-white">
                    {" "}
                    {insulationThickness.toFixed(
                      0,
                    )}{" "}
                    mm
                  </span>
                </p>

                <p>
                  Gypsum:
                  <span className="text-white">
                    {" "}
                    {gypsumThickness.toFixed(
                      0,
                    )}{" "}
                    mm
                  </span>
                </p>

              </div>

            </div>


            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">

              <p className="font-semibold">
                Thermal Properties
              </p>

              <div className="mt-3 space-y-2 text-sm text-slate-400">

                <p>
                  R-value:
                  <span className="text-white">
                    {" "}
                    {wallRValue.toFixed(
                      3,
                    )}{" "}
                    m²K/W
                  </span>
                </p>

                <p>
                  U-value:
                  <span className="text-white">
                    {" "}
                    {wallUValue.toFixed(
                      3,
                    )}{" "}
                    W/m²K
                  </span>
                </p>

              </div>

            </div>

          </aside>

        </div>
      </div>
    </main>
  );
}


function Control({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (
    value: number,
  ) => void;
}) {

  return (
    <div className="mt-6">

      <div className="flex justify-between">

        <label className="text-sm text-slate-300">
          {label}
        </label>

        <span className="text-sm text-cyan-400">
          {value} {unit}
        </span>

      </div>


      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(
          event,
        ) =>
          onChange(
            Number(
              event.target.value,
            ),
          )
        }
        className="mt-3 w-full accent-cyan-400"
      />


      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(
          event,
        ) =>
          onChange(
            Number(
              event.target.value,
            ),
          )
        }
        className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
      />

    </div>
  );
}