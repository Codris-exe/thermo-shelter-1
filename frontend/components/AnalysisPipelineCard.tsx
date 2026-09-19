"use client";

interface AnalysisPipelineCardProps {
  hasWeather: boolean;
  hasSimulation: boolean;
  hasOptimization: boolean;
}

interface PipelineStepProps {
  number: string;
  title: string;
  description: string;
  active: boolean;
  complete: boolean;
}

function PipelineStep({
  number,
  title,
  description,
  active,
  complete,
}: PipelineStepProps) {
  return (
    <div className="flex items-start gap-2.5">
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[9px] font-bold ${
          complete
            ? "border-emerald-600/30 bg-emerald-50 text-emerald-700"
            : active
              ? "border-amber-500/40 bg-amber-50 text-amber-700"
              : "border-slate-200 bg-slate-100 text-slate-400"
        }`}
      >
        {complete ? "✓" : number}
      </div>

      <div className="min-w-0">
        <div
          className={`text-[10px] font-semibold ${
            complete
              ? "text-emerald-700"
              : active
                ? "text-amber-700"
                : "text-slate-400"
          }`}
        >
          {title}
        </div>

        <div className="mt-0.5 text-[8px] leading-relaxed text-slate-500">
          {description}
        </div>
      </div>
    </div>
  );
}

export default function AnalysisPipelineCard({
  hasWeather,
  hasSimulation,
  hasOptimization,
}: AnalysisPipelineCardProps) {
  return (
    <div className="border border-slate-200 bg-white shadow-sm p-3 corner-bracket font-mono">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
            Evaluation Pipeline
          </div>

          <div className="mt-0.5 text-[9px] text-slate-500">
            Automated physics simulation chain
          </div>
        </div>

        <div className="border border-sky-600/30 bg-sky-50 px-2 py-0.5 text-[8px] text-sky-700 font-bold uppercase rounded">
          LIVE
        </div>
      </div>

      <div className="mt-3 space-y-3">
        <PipelineStep
          number="1"
          title="Location"
          description="Shelter coordinates define the climate context."
          active
          complete={hasWeather}
        />

        <PipelineStep
          number="2"
          title="Real Weather"
          description="Forecast temperature, wind and radiation drive the model."
          active={hasWeather}
          complete={hasWeather}
        />

        <PipelineStep
          number="3"
          title="Solar Model"
          description="Solar position and surface radiation are evaluated."
          active={hasSimulation}
          complete={hasSimulation}
        />

        <PipelineStep
          number="4"
          title="Thermal Engine"
          description="Envelope, ventilation, thermal mass and solar gains are simulated."
          active={hasSimulation}
          complete={hasSimulation}
        />

        <PipelineStep
          number="5"
          title="Optimization"
          description="Tested configurations are compared using the thermal model."
          active={hasOptimization}
          complete={hasOptimization}
        />
      </div>

      <div className="mt-3 border-t border-slate-200 pt-2 text-[8px] leading-relaxed text-slate-400">
        The pipeline uses the same design state throughout the
        visualization, simulation and optimization workflow.
      </div>
    </div>
  );
}