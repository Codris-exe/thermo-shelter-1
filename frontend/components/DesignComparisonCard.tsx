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
    <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.03] p-3">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-white">
            Design Comparison
          </div>

          <div className="mt-0.5 text-[9px] text-slate-500">
            Baseline configuration vs best tested configuration
          </div>
        </div>

        {isApplied && (
          <div className="rounded-full border border-emerald-400/20 bg-emerald-400/5 px-2 py-1 text-[9px] text-emerald-300">
            Applied
          </div>
        )}
      </div>

      <div className="grid grid-cols-[1fr_1fr] gap-2">
        {/* Baseline */}
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
          <div className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
            Baseline
          </div>

          <div className="mt-2 space-y-2">
            <div>
              <div className="text-[8px] text-slate-600">
                Orientation
              </div>

              <div className="text-xs font-semibold text-white">
                {baseline.orientation_deg}°
              </div>
            </div>

            <div>
              <div className="text-[8px] text-slate-600">
                Wall Insulation
              </div>

              <div className="text-xs font-semibold text-white">
                {baseline.wall_insulation_thickness_mm.toFixed(
                  0,
                )}{" "}
                mm
              </div>
            </div>

            <div>
              <div className="text-[8px] text-slate-600">
                Roof Insulation
              </div>

              <div className="text-xs font-semibold text-white">
                {baseline.roof_insulation_thickness_mm.toFixed(
                  0,
                )}{" "}
                mm
              </div>
            </div>

            <div>
              <div className="text-[8px] text-slate-600">
                Comfort
              </div>

              <div className="text-xs font-semibold text-slate-300">
                {formatValue(
                  baseline.comfort_percentage,
                  "%",
                )}
              </div>
            </div>

            <div>
              <div className="text-[8px] text-slate-600">
                Temperature Range
              </div>

              <div className="text-xs font-semibold text-slate-300">
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
        <div className="rounded-lg border border-violet-400/20 bg-violet-400/[0.06] p-2.5">
          <div className="text-[9px] font-semibold uppercase tracking-wide text-violet-300">
            Optimized
          </div>

          <div className="mt-2 space-y-2">
            <div>
              <div className="text-[8px] text-slate-600">
                Orientation
              </div>

              <div className="text-xs font-semibold text-white">
                {optimized.orientation_deg}°
              </div>
            </div>

            <div>
              <div className="text-[8px] text-slate-600">
                Wall Insulation
              </div>

              <div className="text-xs font-semibold text-white">
                {optimized.wall_insulation_thickness_mm.toFixed(
                  0,
                )}{" "}
                mm
              </div>
            </div>

            <div>
              <div className="text-[8px] text-slate-600">
                Roof Insulation
              </div>

              <div className="text-xs font-semibold text-white">
                {optimized.roof_insulation_thickness_mm.toFixed(
                  0,
                )}{" "}
                mm
              </div>
            </div>

            <div>
              <div className="text-[8px] text-slate-600">
                Comfort
              </div>

              <div className="text-xs font-semibold text-emerald-300">
                {formatValue(
                  optimized.comfort_percentage,
                  "%",
                )}
              </div>
            </div>

            <div>
              <div className="text-[8px] text-slate-600">
                Temperature Range
              </div>

              <div className="text-xs font-semibold text-cyan-300">
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

      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/10 pt-2">
        <div className="rounded-lg bg-white/[0.02] px-2 py-1.5">
          <div className="text-[8px] text-slate-600">
            Wall Δ
          </div>

          <div className="text-[10px] font-semibold text-white">
            {(
              optimized.wall_insulation_thickness_mm -
              baseline.wall_insulation_thickness_mm
            ).toFixed(0)}{" "}
            mm
          </div>
        </div>

        <div className="rounded-lg bg-white/[0.02] px-2 py-1.5">
          <div className="text-[8px] text-slate-600">
            Roof Δ
          </div>

          <div className="text-[10px] font-semibold text-white">
            {(
              optimized.roof_insulation_thickness_mm -
              baseline.roof_insulation_thickness_mm
            ).toFixed(0)}{" "}
            mm
          </div>
        </div>

        <div className="rounded-lg bg-white/[0.02] px-2 py-1.5">
          <div className="text-[8px] text-slate-600">
            Orientation Δ
          </div>

          <div className="text-[10px] font-semibold text-white">
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