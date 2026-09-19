"use client";

interface DesignSnapshot {
  orientation_deg: number;
  wall_insulation_thickness_mm: number;
  roof_insulation_thickness_mm: number;
  comfort_percentage?: number | null;
  minimum_indoor_temperature_c?: number | null;
  maximum_indoor_temperature_c?: number | null;
}

interface DesignComparisonCardProps {
  baseline: DesignSnapshot;
  optimized: DesignSnapshot;
  isApplied?: boolean;
}

function formatValue(
  value: number | null | undefined,
  suffix = "",
) {
  if (value == null) {
    return "—";
  }

  return `${value.toFixed(1)}${suffix}`;
}

export default function DesignComparisonCard({
  baseline,
  optimized,
  isApplied = false,
}: DesignComparisonCardProps) {
  return (
    <div className="border border-slate-200 bg-white shadow-sm p-3 corner-bracket font-mono">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
            Configuration Comparison
          </div>

          <div className="mt-0.5 text-[9px] text-slate-500">
            Baseline envelope vs optimized architectural model
          </div>
        </div>

        {isApplied && (
          <div className="border border-emerald-600/30 bg-emerald-50 px-2 py-0.5 text-[9px] text-emerald-700 font-bold uppercase rounded">
            Active in 3D
          </div>
        )}
      </div>

      <div className="grid grid-cols-[1fr_1fr] gap-2">
        {/* Baseline */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
          <div className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
            Baseline
          </div>

          <div className="mt-2 space-y-2">
            <div>
              <div className="text-[8px] text-slate-500 uppercase">
                Orientation
              </div>

              <div className="text-xs font-bold text-slate-900">
                {baseline.orientation_deg}°
              </div>
            </div>

            <div>
              <div className="text-[8px] text-slate-500 uppercase">
                Wall Insulation
              </div>

              <div className="text-xs font-bold text-slate-900">
                {baseline.wall_insulation_thickness_mm.toFixed(
                  0,
                )}{" "}
                mm
              </div>
            </div>

            <div>
              <div className="text-[8px] text-slate-500 uppercase">
                Roof Insulation
              </div>

              <div className="text-xs font-bold text-slate-900">
                {baseline.roof_insulation_thickness_mm.toFixed(
                  0,
                )}{" "}
                mm
              </div>
            </div>

            <div>
              <div className="text-[8px] text-slate-500 uppercase">
                Comfort
              </div>

              <div className="text-xs font-bold text-slate-800">
                {formatValue(
                  baseline.comfort_percentage,
                  "%",
                )}
              </div>
            </div>

            <div>
              <div className="text-[8px] text-slate-500 uppercase">
                Temperature Range
              </div>

              <div className="text-xs font-bold text-slate-800">
                {formatValue(
                  baseline.minimum_indoor_temperature_c,
                  "°C",
                )}
                {" – "}
                {formatValue(
                  baseline.maximum_indoor_temperature_c,
                  "°C",
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Optimized */}
        <div className="rounded-lg border border-amber-500/30 bg-amber-50/60 p-2.5">
          <div className="text-[9px] font-bold uppercase tracking-wide text-amber-800">
            Optimized Design
          </div>

          <div className="mt-2 space-y-2">
            <div>
              <div className="text-[8px] text-slate-500 uppercase">
                Orientation
              </div>

              <div className="text-xs font-bold text-slate-900">
                {optimized.orientation_deg}°
              </div>
            </div>

            <div>
              <div className="text-[8px] text-slate-500 uppercase">
                Wall Insulation
              </div>

              <div className="text-xs font-bold text-slate-900">
                {optimized.wall_insulation_thickness_mm.toFixed(
                  0,
                )}{" "}
                mm
              </div>
            </div>

            <div>
              <div className="text-[8px] text-slate-500 uppercase">
                Roof Insulation
              </div>

              <div className="text-xs font-bold text-slate-900">
                {optimized.roof_insulation_thickness_mm.toFixed(
                  0,
                )}{" "}
                mm
              </div>
            </div>

            <div>
              <div className="text-[8px] text-slate-500 uppercase">
                Comfort
              </div>

              <div className="text-xs font-bold text-emerald-700">
                {formatValue(
                  optimized.comfort_percentage,
                  "%",
                )}
              </div>
            </div>

            <div>
              <div className="text-[8px] text-slate-500 uppercase">
                Temperature Range
              </div>

              <div className="text-xs font-bold text-sky-700">
                {formatValue(
                  optimized.minimum_indoor_temperature_c,
                  "°C",
                )}
                {" – "}
                {formatValue(
                  optimized.maximum_indoor_temperature_c,
                  "°C",
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-200 pt-2">
        <div className="rounded-lg bg-slate-50 border border-slate-200 px-2 py-1.5">
          <div className="text-[8px] text-slate-500 uppercase">
            Wall Δ
          </div>

          <div className="text-[10px] font-bold text-slate-900">
            {(
              optimized.wall_insulation_thickness_mm -
              baseline.wall_insulation_thickness_mm
            ).toFixed(0)}{" "}
            mm
          </div>
        </div>

        <div className="rounded-lg bg-slate-50 border border-slate-200 px-2 py-1.5">
          <div className="text-[8px] text-slate-500 uppercase">
            Roof Δ
          </div>

          <div className="text-[10px] font-bold text-slate-900">
            {(
              optimized.roof_insulation_thickness_mm -
              baseline.roof_insulation_thickness_mm
            ).toFixed(0)}{" "}
            mm
          </div>
        </div>

        <div className="rounded-lg bg-slate-50 border border-slate-200 px-2 py-1.5">
          <div className="text-[8px] text-slate-500 uppercase">
            Orientation Δ
          </div>

          <div className="text-[10px] font-bold text-slate-900">
            {(
              optimized.orientation_deg -
              baseline.orientation_deg
            ).toFixed(0)}
            °
          </div>
        </div>
      </div>
    </div>
  );
}