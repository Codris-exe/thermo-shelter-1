"use client";

const assumptions = [
  {
    title: "Thermal model",
    text: "Lumped transient energy-balance model using indoor air, thermal mass and an effective active envelope capacity.",
  },
  {
    title: "Heat transfer",
    text: "Wall, roof, floor, windows, doors and ventilation are represented using R/U values and temperature differences.",
  },
  {
    title: "Solar model",
    text: "Solar position and surface irradiance are calculated from location, time and weather radiation inputs.",
  },
  {
    title: "Thermal mass",
    text: "Configured thermal mass stores and releases energy through a simplified coupling model.",
  },
  {
    title: "Weather",
    text: "Location-specific forecast data is supplied by Open-Meteo and drives the transient simulation.",
  },
  {
    title: "Optimization",
    text: "Candidate designs are evaluated by running the same thermal model for each tested configuration.",
  },
];

export default function ModelAssumptionsCard() {
  return (
    <div className="rounded-xl border border-amber-400/15 bg-amber-400/[0.03] p-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-white">
            Model Assumptions
          </div>

          <div className="mt-0.5 text-[9px] text-slate-500">
            Scientific scope of the current prototype
          </div>
        </div>

        <div className="rounded-full border border-amber-400/20 bg-amber-400/5 px-2 py-1 text-[9px] text-amber-300">
          Prototype Model
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {assumptions.map((item) => (
          <div
            key={item.title}
            className="rounded-lg border border-white/5 bg-white/[0.02] p-2"
          >
            <div className="text-[10px] font-semibold text-slate-300">
              {item.title}
            </div>

            <div className="mt-0.5 text-[9px] leading-relaxed text-slate-500">
              {item.text}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-lg border border-white/5 bg-white/[0.02] p-2">
        <div className="text-[9px] font-semibold text-amber-300">
          Important
        </div>

        <div className="mt-1 text-[9px] leading-relaxed text-slate-500">
          Results are model-based estimates for design exploration.
          They are not a substitute for detailed CFD, finite-element
          analysis, building-code calculations, or professional
          engineering validation.
        </div>
      </div>
    </div>
  );
}