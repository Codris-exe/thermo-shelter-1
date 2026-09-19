"use client";

import Link from "next/link";

const features = [
  {
    number: "01",
    title: "Real Climate Data",
    description:
      "Use location-specific weather and solar radiation as inputs to the shelter simulation.",
  },
  {
    number: "02",
    title: "Physics-Based Thermal Model",
    description:
      "Evaluate envelope heat transfer, ventilation, solar gains and thermal mass with a transient model.",
  },
  {
    number: "03",
    title: "3D Design Exploration",
    description:
      "Change shelter dimensions, orientation and insulation while seeing the configuration interactively.",
  },
  {
    number: "04",
    title: "Design Optimization",
    description:
      "Test multiple configurations and compare their simulated thermal performance.",
  },
];

const workflow = [
  "Choose a location",
  "Configure the shelter",
  "Load real weather",
  "Run thermal simulation",
  "Optimize candidate designs",
  "Export the analysis report",
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#07111f] text-white">
      {/* Background atmosphere */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[10%] top-[-20%] h-[500px] w-[500px] rounded-full bg-cyan-500/[0.07] blur-[120px]" />
        <div className="absolute right-[5%] top-[20%] h-[450px] w-[450px] rounded-full bg-violet-500/[0.06] blur-[120px]" />
      </div>

      {/* Navigation */}
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
        <Link
          href="/"
          className="group flex items-center gap-3"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-sm font-bold text-cyan-300 transition group-hover:bg-cyan-400/15">
            TS
          </div>

          <div>
            <div className="text-sm font-bold tracking-tight">
              Thermo Shelter 1
            </div>

            <div className="text-[9px] uppercase tracking-[0.18em] text-slate-600">
              Passive Thermal Design
            </div>
          </div>
        </Link>

        <Link
          href="/3d"
          className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-400/15"
        >
          Launch Simulator
        </Link>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-20 pt-16 lg:px-8 lg:pb-28 lg:pt-24">
        <div className="max-w-4xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-3 py-1.5 text-[10px] font-medium text-cyan-300">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            Climate-aware shelter design platform
          </div>

          <h1 className="text-5xl font-bold leading-[1.05] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
            Design shelters for the{" "}
            <span className="text-cyan-300">
              climate they actually face.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            Thermo Shelter 1 combines real weather data,
            solar modeling, transient thermal simulation,
            interactive 3D visualization and design-space
            optimization in one workflow.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/3d"
              className="inline-flex items-center justify-center rounded-xl bg-cyan-500 px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Open Thermal Simulator
              <span className="ml-2 text-base">
                →
              </span>
            </Link>

            <a
              href="#workflow"
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.06]"
            >
              See How It Works
            </a>
          </div>
        </div>

        {/* Hero metric strip */}
        <div className="mt-14 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
            <div className="text-2xl font-bold text-white">
              3D
            </div>
            <div className="mt-1 text-[10px] text-slate-600">
              Interactive model
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
            <div className="text-2xl font-bold text-white">
              24h
            </div>
            <div className="mt-1 text-[10px] text-slate-600">
              Weather horizon
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
            <div className="text-2xl font-bold text-white">
              64
            </div>
            <div className="mt-1 text-[10px] text-slate-600">
              Tested configurations
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
            <div className="text-2xl font-bold text-white">
              PDF
            </div>
            <div className="mt-1 text-[10px] text-slate-600">
              Exportable analysis
            </div>
          </div>
        </div>
      </section>

      {/* Feature section */}
      <section className="relative z-10 border-y border-white/5 bg-white/[0.015]">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Core capabilities
            </div>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              From environmental data to a tested shelter design.
            </h2>

            <p className="mt-4 text-sm leading-6 text-slate-500">
              Every major stage of the workflow uses the same
              shelter design state, keeping the visualization,
              thermal model and optimization connected.
            </p>
          </div>

          <div className="mt-10 grid gap-3 md:grid-cols-2">
            {features.map((feature) => (
              <div
                key={feature.number}
                className="rounded-2xl border border-white/10 bg-[#0b1728] p-5 transition hover:border-cyan-400/20"
              >
                <div className="flex items-start justify-between">
                  <div className="text-[10px] font-bold tracking-[0.15em] text-cyan-400">
                    {feature.number}
                  </div>

                  <div className="h-2 w-2 rounded-full bg-cyan-400/60" />
                </div>

                <h3 className="mt-5 text-base font-semibold text-white">
                  {feature.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section
        id="workflow"
        className="relative z-10 mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20"
      >
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-300">
              Workflow
            </div>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              One connected design loop.
            </h2>

            <p className="mt-4 max-w-md text-sm leading-6 text-slate-500">
              Explore a shelter, simulate its thermal response,
              test alternatives, apply a selected configuration
              and generate a report.
            </p>

            <Link
              href="/3d"
              className="mt-7 inline-flex items-center rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400"
            >
              Start Designing
              <span className="ml-2">
                →
              </span>
            </Link>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0b1728] p-5 sm:p-6">
            <div className="space-y-2">
              {workflow.map(
                (step, index) => {
                  const isLast =
                    index ===
                    workflow.length - 1;

                  return (
                    <div
                      key={step}
                      className="flex items-center gap-4"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-xs font-bold text-cyan-300">
                        {String(
                          index + 1,
                        ).padStart(2, "0")}
                      </div>

                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">
                          {step}
                        </div>

                        {!isLast && (
                          <div className="mt-1 h-3 w-px bg-white/10" />
                        )}
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Scientific scope */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-16 lg:px-8">
        <div className="rounded-2xl border border-amber-400/15 bg-amber-400/[0.025] p-6 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-300">
                Scientific scope
              </div>

              <h3 className="mt-2 text-base font-semibold text-white">
                Built for design exploration, not detailed engineering certification.
              </h3>
            </div>

            <div className="rounded-full border border-amber-400/20 bg-amber-400/5 px-3 py-1.5 text-[9px] text-amber-300">
              Model-based estimates
            </div>
          </div>

          <p className="mt-4 max-w-4xl text-sm leading-6 text-slate-500">
            The current prototype uses a simplified transient
            thermal energy-balance model with envelope heat
            transfer, ventilation, solar gain and thermal mass.
            It is intended for early-stage design exploration and
            should not be treated as a replacement for detailed
            CFD, finite-element analysis or professional
            engineering validation.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="text-[10px] text-slate-600">
            Thermo Shelter 1 • Passive Shelter Thermal Simulator
          </div>

          <Link
            href="/3d"
            className="text-[10px] font-medium text-cyan-400 transition hover:text-cyan-300"
          >
            Launch Simulator →
          </Link>
        </div>
      </footer>
    </main>
  );
}