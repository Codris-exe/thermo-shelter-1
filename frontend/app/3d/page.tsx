"use client";

import Shelter3D from "@/components/Shelter3D";

import {
  useShelterDesignStore,
} from "@/stores/shelterDesignStore";


export default function ThreeDPage() {
  const length = useShelterDesignStore(
    (state) => state.length_m,
  );

  const width = useShelterDesignStore(
    (state) => state.width_m,
  );

  const height = useShelterDesignStore(
    (state) => state.height_m,
  );

  const orientation = useShelterDesignStore(
    (state) => state.orientation_deg,
  );

  const wallLayers = useShelterDesignStore(
    (state) => state.wall_layers,
  );

  const roofLayers = useShelterDesignStore(
    (state) => state.roof_layers,
  );

  const setDimensions = useShelterDesignStore(
    (state) => state.setDimensions,
  );

  const setOrientation = useShelterDesignStore(
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
          layer.material_id === "brick",
      )?.thickness_m ?? 0
    ) * 1000;


  const insulationThickness =
    (
      wallLayers.find(
        (layer) =>
          layer.material_id === "rock_wool",
      )?.thickness_m ?? 0
    ) * 1000;


  const gypsumThickness =
    (
      wallLayers.find(
        (layer) =>
          layer.material_id === "gypsum",
      )?.thickness_m ?? 0
    ) * 1000;


  const roofInsulationThickness =
    (
      roofLayers.find(
        (layer) =>
          layer.material_id === "rock_wool",
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
          layer.material_id === "brick"
            ? 0.72
            : layer.material_id === "rock_wool"
              ? 0.04
              : layer.material_id === "gypsum"
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

          <div className="hidden items-center gap-3 text-xs text-slate-400 sm:flex">

            <StatusBadge
              label="3D Model"
              value="Live"
            />

            <StatusBadge
              label="Design State"
              value="Synced"
            />

          </div>

        </header>


        {/* MAIN SINGLE SCREEN */}
        <div className="mt-4 grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">

          {/* 3D AREA */}
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
                  {orientation}° • {orientationName}
                </div>

              </div>


              <div className="min-h-0 flex-1 p-3">

                <Shelter3D
                  length={length}
                  width={width}
                  height={height}
                  orientation={orientation}
                  wallThickness={wallThickness}
                  roofThickness={roofThickness}
                />

              </div>

            </div>

          </section>


          {/* CONTROLS */}
          <aside className="min-h-0 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-4">

            {/* SECTION */}
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
                      length_m: value,
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
                      width_m: value,
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
                      height_m: value,
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

              <div className="mt-2 flex justify-between text-[10px] text-slate-500">
                <span>N</span>
                <span>E</span>
                <span>S</span>
                <span>W</span>
                <span>N</span>
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
                thickness={`${brickThickness.toFixed(0)} mm`}
              />

              <div className="mt-2">

                <div className="flex items-center justify-between">

                  <span className="text-xs text-slate-300">
                    Rock Wool
                  </span>

                  <span className="text-xs font-semibold text-cyan-300">
                    {insulationThickness.toFixed(
                      0,
                    )}{" "}
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
                thickness={`${gypsumThickness.toFixed(0)} mm`}
              />


              {/* R/U CARDS */}
              <div className="mt-3 grid grid-cols-2 gap-2">

                <div className="rounded-xl border border-cyan-900/70 bg-cyan-950/30 p-3">

                  <p className="text-[10px] uppercase tracking-wider text-slate-500">
                    R-Value
                  </p>

                  <p className="mt-1 text-lg font-bold text-cyan-300">
                    {wallRValue.toFixed(3)}
                  </p>

                  <p className="text-[10px] text-slate-500">
                    m²K/W
                  </p>

                </div>


                <div className="rounded-xl border border-emerald-900/70 bg-emerald-950/30 p-3">

                  <p className="text-[10px] uppercase tracking-wider text-slate-500">
                    U-Value
                  </p>

                  <p className="mt-1 text-lg font-bold text-emerald-300">
                    {wallUValue.toFixed(3)}
                  </p>

                  <p className="text-[10px] text-slate-500">
                    W/m²K
                  </p>

                </div>

              </div>


              <div className="mt-2 flex items-center justify-between rounded-lg bg-slate-950 px-3 py-2 text-xs">

                <span className="text-slate-500">
                  Total wall thickness
                </span>

                <span className="font-semibold text-white">
                  {(wallThickness * 1000).toFixed(
                    0,
                  )}{" "}
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
                    )}{" "}
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

              <div className="mt-2 flex items-center justify-between rounded-lg bg-slate-950 px-3 py-2 text-xs">

                <span className="text-slate-500">
                  Total roof thickness
                </span>

                <span className="font-semibold text-white">
                  {(roofThickness * 1000).toFixed(
                    0,
                  )}{" "}
                  mm
                </span>

              </div>

            </PanelSection>


            {/* DESIGN SUMMARY */}
            <PanelSection title="Design Summary">

              <div className="grid grid-cols-2 gap-2">

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
                  label="Orientation"
                  value={`${orientation}°`}
                />

                <Summary
                  label="Wall"
                  value={`${(
                    wallThickness *
                    1000
                  ).toFixed(0)} mm`}
                />

              </div>

            </PanelSection>


            {/* LEGEND */}
            <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950 p-3">

              <div className="flex items-center justify-between">

                <span className="text-xs text-slate-500">
                  Live design state
                </span>

                <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Synced
                </span>

              </div>

            </div>

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

      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
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
  onChange: (value: number) => void;
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


function Summary({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-slate-950 p-2.5">

      <p className="text-[10px] text-slate-500">
        {label}
      </p>

      <p className="mt-0.5 text-sm font-semibold text-white">
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
    <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5">

      <span className="text-slate-500">
        {label}
      </span>

      <span className="text-emerald-400">
        ● {value}
      </span>

    </div>
  );
}