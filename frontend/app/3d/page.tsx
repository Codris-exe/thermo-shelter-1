"use client";

import { useMemo, useState } from "react";
import Shelter3D from "@/components/Shelter3D";

export default function ThreeDPage() {
  const [length, setLength] = useState(5);
  const [width, setWidth] = useState(4);
  const [height, setHeight] = useState(3);

  const [orientation, setOrientation] =
    useState(180);

  const [insulationThickness, setInsulationThickness] =
    useState(100);

  const [roofInsulationThickness, setRoofInsulationThickness] =
    useState(120);

  const brickThickness = 200;
  const gypsumThickness = 12;

  /*
   * Total wall thickness is now calculated
   * from the actual construction layers.
   *
   * Brick + Rock Wool + Gypsum
   */
  const wallThickness =
    (
      brickThickness +
      insulationThickness +
      gypsumThickness
    ) / 1000;

  /*
   * Concrete roof + Rock Wool insulation
   */
  const roofThickness =
    (
      100 +
      roofInsulationThickness
    ) / 1000;

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

  const wallRValue = useMemo(() => {
    const brickK = 0.72;
    const rockWoolK = 0.04;
    const gypsumK = 0.17;

    const rInside = 0.12;
    const rOutside = 0.03;

    return (
      rInside +
      brickThickness / 1000 / brickK +
      insulationThickness /
        1000 /
        rockWoolK +
      gypsumThickness / 1000 / gypsumK +
      rOutside
    );
  }, [insulationThickness]);

  const wallUValue =
    1 / wallRValue;

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
            Interactive shelter geometry and
            construction configuration.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">

          <Shelter3D
            length={length}
            width={width}
            height={height}
            orientation={orientation}
            wallThickness={wallThickness}
            roofThickness={roofThickness}
          />

          <aside className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <h2 className="text-xl font-semibold">
              Shelter Configuration
            </h2>

            {/* LENGTH */}
            <Control
              label="Length"
              value={length}
              min={2}
              max={15}
              step={0.1}
              unit="m"
              onChange={setLength}
            />

            {/* WIDTH */}
            <Control
              label="Width"
              value={width}
              min={2}
              max={12}
              step={0.1}
              unit="m"
              onChange={setWidth}
            />

            {/* HEIGHT */}
            <Control
              label="Height"
              value={height}
              min={2}
              max={8}
              step={0.1}
              unit="m"
              onChange={setHeight}
            />

            {/* ORIENTATION */}
            <Control
              label="Orientation"
              value={orientation}
              min={0}
              max={360}
              step={1}
              unit="°"
              onChange={setOrientation}
            />

            {/* WALL INSULATION */}
            <Control
              label="Rock Wool Insulation"
              value={insulationThickness}
              min={25}
              max={250}
              step={5}
              unit="mm"
              onChange={
                setInsulationThickness
              }
            />

            {/* ROOF INSULATION */}
            <Control
              label="Roof Rock Wool"
              value={
                roofInsulationThickness
              }
              min={25}
              max={300}
              step={5}
              unit="mm"
              onChange={
                setRoofInsulationThickness
              }
            />

            {/* CONSTRUCTION */}
            <div className="mt-8 rounded-xl border border-cyan-900 bg-cyan-950/20 p-4">

              <p className="font-semibold text-cyan-300">
                Wall Construction
              </p>

              <div className="mt-3 space-y-2 text-sm text-slate-400">

                <p>
                  Brick:
                  <span className="text-white">
                    {" "}
                    200 mm
                  </span>
                </p>

                <p>
                  Rock Wool:
                  <span className="text-white">
                    {" "}
                    {insulationThickness} mm
                  </span>
                </p>

                <p>
                  Gypsum:
                  <span className="text-white">
                    {" "}
                    12 mm
                  </span>
                </p>

                <p className="border-t border-cyan-900 pt-2">

                  Total Wall Thickness:
                  <span className="font-semibold text-cyan-300">
                    {" "}
                    {(wallThickness * 1000).toFixed(
                      0,
                    )} mm
                  </span>

                </p>

              </div>

            </div>

            {/* THERMAL PROPERTIES */}
            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">

              <p className="font-semibold">
                Thermal Properties
              </p>

              <div className="mt-3 space-y-2 text-sm text-slate-400">

                <p>
                  R-value:
                  <span className="text-white">
                    {" "}
                    {wallRValue.toFixed(3)}{" "}
                    m²K/W
                  </span>
                </p>

                <p>
                  U-value:
                  <span className="text-white">
                    {" "}
                    {wallUValue.toFixed(3)}{" "}
                    W/m²K
                  </span>
                </p>

              </div>

            </div>

            {/* DESIGN SUMMARY */}
            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">

              <p className="font-semibold">
                Current Design
              </p>

              <div className="mt-3 space-y-2 text-sm text-slate-400">

                <p>
                  Floor Area:
                  <span className="text-white">
                    {" "}
                    {(length * width).toFixed(
                      2,
                    )}{" "}
                    m²
                  </span>
                </p>

                <p>
                  Volume:
                  <span className="text-white">
                    {" "}
                    {(length * width * height).toFixed(
                      2,
                    )}{" "}
                    m³
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

                <p>
                  Roof Thickness:
                  <span className="text-white">
                    {" "}
                    {(roofThickness * 1000).toFixed(
                      0,
                    )}{" "}
                    mm
                  </span>
                </p>

              </div>

            </div>

            <div className="mt-4 rounded-xl border border-amber-900 bg-amber-950/20 p-4">

              <p className="font-semibold text-amber-300">
                Model Assumption
              </p>

              <p className="mt-2 text-xs leading-5 text-slate-400">
                Wall R-value uses the current
                multilayer construction:
                brick + rock wool + gypsum,
                including simplified internal
                and external surface resistances.
              </p>

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
  onChange: (value: number) => void;
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
        onChange={(event) =>
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
        onChange={(event) =>
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