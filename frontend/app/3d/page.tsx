"use client";

import { useState } from "react";
import Shelter3D from "@/components/Shelter3D";

export default function ThreeDPage() {
  const [length, setLength] = useState(5);
  const [width, setWidth] = useState(4);
  const [height, setHeight] = useState(3);
  const [orientation, setOrientation] = useState(180);

  const orientationName =
    orientation === 0
      ? "North"
      : orientation === 90
        ? "East"
        : orientation === 180
          ? "South"
          : orientation === 270
            ? "West"
            : `${orientation}°`;

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
            Change the shelter dimensions and orientation
            and see the 3D model update in real time.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

          {/* 3D VIEW */}
          <Shelter3D
            length={length}
            width={width}
            height={height}
            orientation={orientation}
          />

          {/* CONTROLS */}
          <aside className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <h2 className="text-xl font-semibold">
              Shelter Configuration
            </h2>

            {/* LENGTH */}
            <div className="mt-8">
              <div className="flex justify-between">
                <label className="text-sm text-slate-300">
                  Length
                </label>

                <span className="text-sm text-cyan-400">
                  {length.toFixed(1)} m
                </span>
              </div>

              <input
                type="range"
                min="2"
                max="15"
                step="0.1"
                value={length}
                onChange={(event) =>
                  setLength(
                    Number(event.target.value),
                  )
                }
                className="mt-3 w-full accent-cyan-400"
              />

              <input
                type="number"
                min="2"
                max="15"
                step="0.1"
                value={length}
                onChange={(event) =>
                  setLength(
                    Number(event.target.value),
                  )
                }
                className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
            </div>

            {/* WIDTH */}
            <div className="mt-6">
              <div className="flex justify-between">
                <label className="text-sm text-slate-300">
                  Width
                </label>

                <span className="text-sm text-cyan-400">
                  {width.toFixed(1)} m
                </span>
              </div>

              <input
                type="range"
                min="2"
                max="12"
                step="0.1"
                value={width}
                onChange={(event) =>
                  setWidth(
                    Number(event.target.value),
                  )
                }
                className="mt-3 w-full accent-cyan-400"
              />

              <input
                type="number"
                min="2"
                max="12"
                step="0.1"
                value={width}
                onChange={(event) =>
                  setWidth(
                    Number(event.target.value),
                  )
                }
                className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
            </div>

            {/* HEIGHT */}
            <div className="mt-6">
              <div className="flex justify-between">
                <label className="text-sm text-slate-300">
                  Height
                </label>

                <span className="text-sm text-cyan-400">
                  {height.toFixed(1)} m
                </span>
              </div>

              <input
                type="range"
                min="2"
                max="8"
                step="0.1"
                value={height}
                onChange={(event) =>
                  setHeight(
                    Number(event.target.value),
                  )
                }
                className="mt-3 w-full accent-cyan-400"
              />

              <input
                type="number"
                min="2"
                max="8"
                step="0.1"
                value={height}
                onChange={(event) =>
                  setHeight(
                    Number(event.target.value),
                  )
                }
                className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
            </div>

            {/* ORIENTATION */}
            <div className="mt-6">
              <div className="flex justify-between">
                <label className="text-sm text-slate-300">
                  Orientation
                </label>

                <span className="text-sm text-cyan-400">
                  {orientation}°
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="360"
                step="1"
                value={orientation}
                onChange={(event) =>
                  setOrientation(
                    Number(event.target.value),
                  )
                }
                className="mt-3 w-full accent-cyan-400"
              />

              <input
                type="number"
                min="0"
                max="360"
                step="1"
                value={orientation}
                onChange={(event) =>
                  setOrientation(
                    Number(event.target.value),
                  )
                }
                className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />

              <p className="mt-2 text-sm text-slate-400">
                Direction:{" "}
                <span className="text-white">
                  {orientationName}
                </span>
              </p>
            </div>

            {/* CURRENT DESIGN */}
            <div className="mt-8 rounded-xl border border-cyan-900 bg-cyan-950/20 p-4">

              <p className="font-semibold text-cyan-300">
                Current Design
              </p>

              <div className="mt-3 space-y-2 text-sm text-slate-400">
                <p>
                  Length:{" "}
                  <span className="text-white">
                    {length.toFixed(1)} m
                  </span>
                </p>

                <p>
                  Width:{" "}
                  <span className="text-white">
                    {width.toFixed(1)} m
                  </span>
                </p>

                <p>
                  Height:{" "}
                  <span className="text-white">
                    {height.toFixed(1)} m
                  </span>
                </p>

                <p>
                  Floor Area:{" "}
                  <span className="text-white">
                    {(length * width).toFixed(2)} m²
                  </span>
                </p>

                <p>
                  Volume:{" "}
                  <span className="text-white">
                    {(length * width * height).toFixed(2)} m³
                  </span>
                </p>

                <p>
                  Orientation:{" "}
                  <span className="text-white">
                    {orientation}°
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