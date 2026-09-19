"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";

const Shelter3D = dynamic(() => import("@/components/Shelter3D"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center font-mono text-xs text-amber-700">
      <span className="w-2 h-2 rounded-full bg-amber-500 status-ping mr-2" />
      INITIALIZING 3D ENGINE...
    </div>
  ),
});

interface ShelterPreset {
  name: string;
  length: number;
  width: number;
  height: number;
  desc: string;
}

const PRESETS: Record<string, ShelterPreset> = {
  standard: {
    name: "Expedition Standard",
    length: 6.0,
    width: 4.0,
    height: 2.8,
    desc: "4-Person Alpine Research",
  },
  compact: {
    name: "High Ridge Outpost",
    length: 4.5,
    width: 3.2,
    height: 2.5,
    desc: "2-Person Emergency Refuge",
  },
  basecamp: {
    name: "Base Camp Station",
    length: 8.0,
    width: 5.0,
    height: 3.2,
    desc: "8-Person Field Headquarters",
  },
};

export default function HomePage() {
  const [selectedPreset, setSelectedPreset] = useState<string>("standard");
  const [orientation, setOrientation] = useState<number>(180);

  const currentPreset = PRESETS[selectedPreset] ?? PRESETS.standard;

  // Approximate solar capture factor based on azimuth alignment to true south (180°)
  const azimuthOffset = Math.abs(orientation - 180);
  const solarCaptureEff = Math.max(
    25,
    Math.round(Math.cos((azimuthOffset * Math.PI) / 180) * 45 + 55),
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-amber-500 selection:text-white antialiased font-sans">
      {/* 1. Ultra-clean Top Micro Status Bar */}
      <div className="border-b border-slate-200 bg-white/95 px-6 lg:px-12 py-2 text-[11px] font-mono tracking-wider text-slate-500 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 text-amber-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-500 status-ping" />
            <span>TS-1 RESEARCH INITIATIVE</span>
          </span>
          <span className="hidden sm:inline text-slate-300">/</span>
          <span className="hidden sm:inline text-slate-600">
            HIGH-ALTITUDE PASSIVE CLIMATE SYSTEMS
          </span>
        </div>
        <div className="flex items-center gap-4 text-slate-500 text-[10px]">
          <span className="hidden md:inline">TRL-9 VERIFIED SPEC</span>
          <span className="px-2 py-0.5 border border-emerald-600/30 bg-emerald-50 text-emerald-800 font-medium">
            FIELD READY
          </span>
        </div>
      </div>

      {/* 2. Top Navigation */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-6 lg:px-12 h-16">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-mono font-bold text-amber-700 text-xs">
              TS
            </div>
            <div>
              <div
                className="text-sm font-bold tracking-tight text-slate-900 group-hover:text-amber-700 transition-colors"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                THERMO SHELTER 1
              </div>
              <div className="text-[10px] font-mono tracking-wider text-slate-500">
                PASSIVE ALPINE LAB
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-mono uppercase tracking-wider text-slate-600">
            <a href="#hero-3d" className="hover:text-slate-950 transition-colors">
              3D Model
            </a>
            <a href="#how-it-works" className="hover:text-slate-950 transition-colors">
              Heat Flow
            </a>
            <a href="#night-autonomy" className="hover:text-slate-950 transition-colors">
              Night Thermal
            </a>
            <a href="#deployments" className="hover:text-slate-950 transition-colors">
              Deployments
            </a>
          </nav>

          <Link
            href="/3d"
            className="chamfer-btn bg-amber-600 hover:bg-amber-500 text-white px-5 py-2.5 text-xs font-mono font-bold tracking-wider uppercase transition-colors flex items-center gap-2 shadow-sm"
          >
            <span>Launch Simulator</span>
            <span>→</span>
          </Link>
        </div>
      </header>

      <main>
        {/* 3. Hero Section with Real High-Altitude Photography & Live 3D Parametric Viewer */}
        <section
          id="hero-3d"
          className="relative min-h-[calc(100vh-80px)] flex flex-col justify-center py-16 lg:py-24 border-b border-slate-200 overflow-hidden"
        >
          {/* Real Generated Cinematic Background Photo */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/hero-alpine-shelter.jpg"
              alt="Extreme-altitude passive solar alpine shelter on Himalayan ridge"
              fill
              priority
              className="object-cover object-center opacity-85"
            />
            {/* Subtle light wash to ensure text readability on the left while keeping mountain photo vibrant */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#f8fafc]/95 via-[#f8fafc]/60 to-transparent lg:w-3/4 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#f8fafc] via-transparent to-[#f8fafc]/30 pointer-events-none" />
            <div className="absolute inset-0 cad-grid opacity-20 pointer-events-none" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left Column: Mission Overview & Architectural Headline */}
              <div className="lg:col-span-6 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-600/30 bg-amber-50 text-amber-800 font-mono text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 status-ping" />
                  <span>Passive Solar Architecture</span>
                  <span className="text-slate-400">•</span>
                  <span>Zero Fuel Burn</span>
                </div>

                <h1
                  className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-950 leading-[1.1]"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  Engineered for <span className="text-sky-600">-50°C</span>.
                  <br />
                  Powered entirely by the sun.
                </h1>

                <p className="text-slate-600 text-base sm:text-lg font-normal leading-relaxed max-w-xl">
                  Thermo Shelter 1 captures low-angle winter sunlight on high-altitude peaks,
                  storing it within a 3,200 kg phase-change Trombe matrix. It maintains a stable{" "}
                  <strong className="text-amber-700 font-semibold">+19.5°C</strong> interior through
                  11.4 hours of darkness without kerosene or diesel generators.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    href="/3d"
                    className="chamfer-btn bg-amber-600 hover:bg-amber-500 text-white font-mono font-bold text-xs px-7 py-4 tracking-wider uppercase transition-colors inline-flex items-center gap-3 shadow-md"
                  >
                    <span>Open Full 3D Simulator</span>
                    <span>→</span>
                  </Link>

                  <a
                    href="#how-it-works"
                    className="chamfer-btn border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-mono text-xs px-6 py-4 tracking-wider uppercase transition-colors shadow-sm"
                  >
                    Heat Flow Diagram ↓
                  </a>
                </div>

                {/* Quick HUD Metrics */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200 font-mono text-[11px]">
                  <div className="border border-slate-200 bg-white/90 p-3 rounded-lg shadow-sm">
                    <div className="text-slate-500 uppercase text-[9px]">Internal Core</div>
                    <div className="text-base font-bold text-amber-700 mt-0.5">+19.5°C</div>
                    <div className="text-slate-500 text-[9px]">Autonomous</div>
                  </div>

                  <div className="border border-slate-200 bg-white/90 p-3 rounded-lg shadow-sm">
                    <div className="text-slate-500 uppercase text-[9px]">Insulation Barrier</div>
                    <div className="text-base font-bold text-sky-700 mt-0.5">R-82.4</div>
                    <div className="text-slate-500 text-[9px]">Aerogel Core</div>
                  </div>

                  <div className="border border-slate-200 bg-white/90 p-3 rounded-lg shadow-sm">
                    <div className="text-slate-500 uppercase text-[9px]">Aux Fuel</div>
                    <div className="text-base font-bold text-emerald-700 mt-0.5">0.0 L</div>
                    <div className="text-slate-500 text-[9px]">100% Solar</div>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive 3D Model Viewport */}
              <div className="lg:col-span-6">
                <div className="border border-slate-200 bg-white shadow-xl rounded-2xl overflow-hidden corner-bracket">
                  {/* 3D Viewport Header */}
                  <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3 font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 status-ping" />
                      <span className="font-bold text-slate-900 uppercase tracking-wider">
                        Interactive 3D Envelope
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-500">
                      ORBIT: <span className="text-sky-700 font-bold">DRAG 360°</span>
                    </div>
                  </div>

                  {/* 3D WebGL Canvas */}
                  <div className="relative h-[340px] sm:h-[380px] w-full cad-grid-dense bg-slate-100">
                    {/* Live CAD Floating Telemetry */}
                    <div className="absolute left-3 top-3 z-10 font-mono text-[10px] space-y-1 bg-white/95 border border-slate-200 p-2.5 rounded shadow-sm pointer-events-none">
                      <div className="text-slate-500">
                        SPAN:{" "}
                        <span className="text-slate-900 font-bold">
                          {currentPreset.length}m × {currentPreset.width}m × {currentPreset.height}m
                        </span>
                      </div>
                      <div className="text-slate-500">
                        AZIMUTH: <span className="text-amber-700 font-bold">{orientation}°</span>
                      </div>
                      <div className="text-slate-500">
                        SOLAR EFFICIENCY:{" "}
                        <span className="text-emerald-700 font-bold">{solarCaptureEff}%</span>
                      </div>
                    </div>

                    <Shelter3D
                      length={currentPreset.length}
                      width={currentPreset.width}
                      height={currentPreset.height}
                      orientation={orientation}
                      wallThickness={0.2}
                      roofThickness={0.25}
                    />
                  </div>

                  {/* Interactive Controls Bar */}
                  <div className="p-4 border-t border-slate-200 bg-white space-y-3 font-mono text-xs">
                    {/* Presets */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider shrink-0">
                        Preset:
                      </span>
                      <div className="grid grid-cols-3 gap-1.5 w-full">
                        {Object.entries(PRESETS).map(([key, p]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setSelectedPreset(key)}
                            className={`py-1.5 px-2 rounded text-[10px] uppercase font-semibold border transition-all truncate ${
                              selectedPreset === key
                                ? "border-amber-600 bg-amber-50 text-amber-900 font-bold shadow-xs"
                                : "border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                            }`}
                          >
                            {p.name.split(" ")[0]}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Azimuth / Orientation Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-500 uppercase">Orientation Azimuth:</span>
                        <span className="text-sky-700 font-bold">{orientation}°</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        step="5"
                        value={orientation}
                        onChange={(e) => setOrientation(Number(e.target.value))}
                        className="w-full accent-sky-600"
                      />
                      <div className="flex justify-between text-[9px] text-slate-500 pt-0.5">
                        <span>N (0°)</span>
                        <span>E (90°)</span>
                        <span className="text-amber-700 font-bold">S (180° Optimal)</span>
                        <span>W (270°)</span>
                        <span>N (360°)</span>
                      </div>
                    </div>

                    {/* Launch Full 3D Suite button */}
                    <div className="pt-1">
                      <Link
                        href="/3d"
                        className="chamfer-btn w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 text-center text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm"
                      >
                        <span>Configure in Full 3D Thermal Simulator</span>
                        <span>→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Clean Big Telemetry Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-16 pt-8 border-t border-slate-200 font-mono">
              <div className="p-5 border border-slate-200 bg-white rounded-xl shadow-sm">
                <div className="text-[11px] text-slate-500 uppercase tracking-wider">
                  Internal Stability
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-amber-700 mt-2">+19.5°C</div>
                <div className="text-xs text-slate-500 mt-1">Constant core comfort zone</div>
              </div>

              <div className="p-5 border border-slate-200 bg-white rounded-xl shadow-sm">
                <div className="text-[11px] text-slate-500 uppercase tracking-wider">
                  Envelope Rating
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-sky-700 mt-2">R-82.4</div>
                <div className="text-xs text-slate-500 mt-1">m²·K/W combined barrier</div>
              </div>

              <div className="p-5 border border-slate-200 bg-white rounded-xl shadow-sm">
                <div className="text-[11px] text-slate-500 uppercase tracking-wider">
                  Thermal Lag
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-emerald-700 mt-2">11.4h</div>
                <div className="text-xs text-slate-500 mt-1">Nighttime radiant release</div>
              </div>

              <div className="p-5 border border-slate-200 bg-white rounded-xl shadow-sm">
                <div className="text-[11px] text-slate-500 uppercase tracking-wider">
                  Auxiliary Fuel
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">0.0 L</div>
                <div className="text-xs text-slate-500 mt-1">100% passive solar autonomy</div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Visual Cross-Section & How It Works */}
        <section className="py-20 border-b border-slate-200" id="how-it-works">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <div className="text-xs font-mono uppercase tracking-widest text-amber-700 mb-2">
                  System Diagram
                </div>
                <h2
                  className="text-3xl sm:text-4xl font-bold text-slate-950 tracking-tight"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  Passive Solar Heat Flow Architecture
                </h2>
              </div>
              <p className="text-slate-600 text-sm max-w-md leading-relaxed">
                How low-angle winter sunlight is gathered, stored in high-density phase-change
                materials, and circulated continuously through natural gravity convection.
              </p>
            </div>

            {/* Clean SVG Cross-Section Illustration */}
            <div className="border border-slate-200 bg-white shadow-md rounded-2xl overflow-hidden p-6 sm:p-8">
              <div className="relative w-full aspect-[16/9] max-h-[460px] bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-center cad-grid-dense">
                <svg
                  className="w-full h-full"
                  fill="none"
                  viewBox="0 0 700 400"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Permafrost Ground */}
                  <path
                    d="M50 340 L650 340"
                    stroke="#94a3b8"
                    strokeDasharray="4 4"
                    strokeWidth="2"
                  />
                  <text fill="#64748b" fontFamily="monospace" fontSize="11" x="60" y="365">
                    FROZEN GLACIER BEDROCK (-45°C)
                  </text>

                  {/* Foundation Piers with Aerogel Break */}
                  <rect
                    fill="#e2e8f0"
                    height="35"
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                    width="28"
                    x="140"
                    y="305"
                    rx="3"
                  />
                  <rect
                    fill="#e2e8f0"
                    height="35"
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                    width="28"
                    x="480"
                    y="305"
                    rx="3"
                  />
                  <rect fill="#0284c7" height="5" width="38" x="135" y="300" rx="1" />
                  <rect fill="#0284c7" height="5" width="38" x="475" y="300" rx="1" />
                  <text fill="#0284c7" fontFamily="monospace" fontSize="9" fontWeight="600" x="185" y="322">
                    AEROGEL THERMAL ISOLATION BREAK
                  </text>

                  {/* Shelter Shell Boundary */}
                  <polygon
                    fill="#f8fafc"
                    points="120,300 540,300 540,160 360,90 120,160"
                    stroke="#475569"
                    strokeWidth="2"
                  />

                  {/* South Solar Aperture (Amber Glazing) */}
                  <polygon
                    fill="#f59e0b"
                    fillOpacity="0.18"
                    points="360,90 540,160 540,300 515,300 515,170 355,105"
                    stroke="#d97706"
                    strokeWidth="2"
                  />

                  {/* Thermal Mass Storage Core */}
                  <rect
                    fill="#fef3c7"
                    height="120"
                    stroke="#d97706"
                    strokeDasharray="3 3"
                    strokeWidth="1.5"
                    width="85"
                    x="410"
                    y="175"
                    rx="6"
                  />
                  <text
                    fill="#b45309"
                    fontFamily="monospace"
                    fontSize="11"
                    fontWeight="700"
                    x="420"
                    y="225"
                  >
                    TROMBE
                  </text>
                  <text fill="#b45309" fontFamily="monospace" fontSize="9" x="420" y="240">
                    HEAT CORE
                  </text>
                  <text
                    fill="#92400e"
                    fontFamily="monospace"
                    fontSize="10"
                    fontWeight="700"
                    x="420"
                    y="260"
                  >
                    +24.5°C
                  </text>

                  {/* Main Living Pod */}
                  <rect
                    fill="#ffffff"
                    height="120"
                    stroke="#0284c7"
                    strokeDasharray="4 2"
                    strokeWidth="1.5"
                    width="220"
                    x="160"
                    y="175"
                    rx="6"
                  />
                  <text
                    fill="#0f172a"
                    fontFamily="sans-serif"
                    fontSize="14"
                    fontWeight="700"
                    x="180"
                    y="215"
                  >
                    HABITATION CORE
                  </text>
                  <text
                    fill="#b45309"
                    fontFamily="monospace"
                    fontSize="12"
                    fontWeight="700"
                    x="180"
                    y="240"
                  >
                    STABLE: +19.5°C
                  </text>
                  <text fill="#64748b" fontFamily="monospace" fontSize="9" x="180" y="260">
                    RELATIVE HUMIDITY: 42%
                  </text>

                  {/* Incident Solar Rays */}
                  <g>
                    <line
                      stroke="#d97706"
                      strokeDasharray="6 3"
                      strokeWidth="2"
                      x1="560"
                      x2="440"
                      y1="30"
                      y2="135"
                    />
                    <polygon fill="#d97706" points="440,135 448,127 437,130" />

                    <line
                      stroke="#d97706"
                      strokeDasharray="6 3"
                      strokeWidth="2"
                      x1="600"
                      x2="480"
                      y1="70"
                      y2="175"
                    />
                    <polygon fill="#d97706" points="480,175 488,167 477,170" />

                    <text
                      fill="#b45309"
                      fontFamily="monospace"
                      fontSize="11"
                      fontWeight="700"
                      x="510"
                      y="45"
                    >
                      45° WINTER SUN VECTOR
                    </text>
                    <text fill="#b45309" fontFamily="monospace" fontSize="9" x="510" y="60">
                      1,120 W/m² HIGH-ALTITUDE FLUX
                    </text>
                  </g>

                  {/* Convection Air Loops */}
                  <path
                    d="M 495 180 C 470 145, 300 145, 270 170"
                    stroke="#d97706"
                    strokeDasharray="3 3"
                    strokeWidth="1.5"
                  />
                  <polygon fill="#d97706" points="270,170 274,160 281,166" />
                  <text fill="#b45309" fontFamily="monospace" fontSize="8" fontWeight="600" x="320" y="140">
                    WARM CONVECTIVE AIRFLOW
                  </text>

                  <path
                    d="M 200 295 C 230 315, 370 315, 430 295"
                    stroke="#0284c7"
                    strokeDasharray="3 3"
                    strokeWidth="1.5"
                  />
                  <polygon fill="#0284c7" points="430,295 422,301 423,291" />
                  <text fill="#0284c7" fontFamily="monospace" fontSize="8" fontWeight="600" x="250" y="325">
                    SUB-FLOOR RECOVERY PLENUM
                  </text>
                </svg>
              </div>

              {/* 3 Step Summary Cards Below Diagram */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 font-mono">
                <div className="p-4 border border-slate-200 bg-slate-50 rounded-xl">
                  <div className="text-amber-700 font-bold text-xs uppercase mb-1">
                    01 / SOLAR ABSORPTION
                  </div>
                  <div className="text-sm font-semibold text-slate-900 mb-2">
                    Triple-Glazed South Facade
                  </div>
                  <div className="text-xs text-slate-600 leading-relaxed">
                    Captures up to 14.8 kWh/m² daily solar radiation directly through low-iron
                    high-transmittance glazing.
                  </div>
                </div>

                <div className="p-4 border border-slate-200 bg-slate-50 rounded-xl">
                  <div className="text-sky-700 font-bold text-xs uppercase mb-1">
                    02 / SENSIBLE STORAGE
                  </div>
                  <div className="text-sm font-semibold text-slate-900 mb-2">
                    Phase-Change Trombe Core
                  </div>
                  <div className="text-xs text-slate-600 leading-relaxed">
                    3,200 kg paraffin-basalt matrix locks latent thermal energy at 21°C, preventing
                    daytime overheating.
                  </div>
                </div>

                <div className="p-4 border border-slate-200 bg-slate-50 rounded-xl">
                  <div className="text-emerald-700 font-bold text-xs uppercase mb-1">
                    03 / NIGHTTIME RELEASE
                  </div>
                  <div className="text-sm font-semibold text-slate-900 mb-2">
                    11.4-Hour Radiant Phase Shift
                  </div>
                  <div className="text-xs text-slate-600 leading-relaxed">
                    Releases warm radiant heat between 02:00 and 06:00 during peak sub-zero
                    temperatures.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Immersive Night Thermal Autonomy Section with Real Background Photo */}
        <section
          id="night-autonomy"
          className="relative py-24 lg:py-32 border-b border-slate-200 overflow-hidden"
        >
          {/* Real Generated Night Photo with Milky Way and Glowing Shelter */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/night-thermal-shelter.jpg"
              alt="Himalayan research station shelter under the Milky Way with glowing thermal core"
              fill
              className="object-cover object-center opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#f8fafc] via-white/50 to-[#f8fafc] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/60 to-transparent lg:w-3/4 pointer-events-none" />
            <div className="absolute inset-0 cad-grid opacity-20 pointer-events-none" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
            <div className="max-w-2xl space-y-4 mb-16">
              <div className="text-xs font-mono uppercase tracking-widest text-amber-700 font-semibold">
                Night Autonomy & Telemetry
              </div>
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-950 tracking-tight leading-tight"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                Surviving the <span className="text-sky-700">-50°C</span> Alpine Night.
                <br />
                Zero Active Generators.
              </h2>
              <p className="text-slate-600 text-base leading-relaxed">
                When the sun dips below the Himalayan ridges, ambient temperatures plummet to
                deadly sub-zero levels. Thermo Shelter 1 maintains thermal equilibrium through its
                11.4-hour calibrated thermal lag, slowly radiating daytime solar warmth through the
                living core.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
              <div className="border border-slate-200 bg-white/95 backdrop-blur-md rounded-2xl p-6 corner-bracket shadow-sm">
                <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-bold text-sm mb-4">
                  11.4h
                </div>
                <h3 className="text-base font-bold text-slate-900 uppercase mb-2">
                  Calibrated Radiant Lag
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Heat gathered during daylight hours takes exactly 11.4 hours to conduct through the
                  Trombe core, peaking radiation right during the coldest pre-dawn hours (03:00 to
                  06:00).
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between text-[11px]">
                  <span className="text-slate-500">Core Temp Drop:</span>
                  <span className="text-emerald-700 font-bold">&lt; 1.8°C / 12h</span>
                </div>
              </div>

              <div className="border border-slate-200 bg-white/95 backdrop-blur-md rounded-2xl p-6 corner-bracket shadow-sm">
                <div className="w-9 h-9 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 font-bold text-sm mb-4">
                  R-82
                </div>
                <h3 className="text-base font-bold text-slate-900 uppercase mb-2">
                  Aerogel Vacuum Shell
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Multi-layer insulation sandwich combining silica aerogel (k=0.014 W/mK) and
                  reflective radiation barriers completely halts conductive, convective, and
                  infrared heat loss.
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between text-[11px]">
                  <span className="text-slate-500">Thermal Transmittance:</span>
                  <span className="text-sky-700 font-bold">0.012 W/m²K</span>
                </div>
              </div>

              <div className="border border-slate-200 bg-white/95 backdrop-blur-md rounded-2xl p-6 corner-bracket shadow-sm">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-sm mb-4">
                  0.0L
                </div>
                <h3 className="text-base font-bold text-slate-900 uppercase mb-2">
                  100% Passive Autonomy
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Eliminates catastrophic dependency on supply lines for kerosene or diesel in
                  inaccessible alpine zones, preventing carbon monoxide poisoning and mechanical
                  freezing failures.
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between text-[11px]">
                  <span className="text-slate-500">Expedition Fuel Saved:</span>
                  <span className="text-emerald-700 font-bold">1,800 L / winter</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Proven Field Deployments */}
        <section className="py-20 border-b border-slate-200" id="deployments">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <div className="text-xs font-mono uppercase tracking-widest text-amber-700 font-semibold mb-2">
                  Extreme Test Stations
                </div>
                <h2
                  className="text-3xl sm:text-4xl font-bold text-slate-950 tracking-tight"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  Validated in the World&apos;s Harshest Climates
                </h2>
              </div>
              <p className="text-slate-600 text-sm max-w-md leading-relaxed">
                Tested and verified across glaciated ridges, cold desert plateaus, and equatorial
                alpine summits.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
              {/* Siachen */}
              <div className="border border-slate-200 bg-white shadow-sm rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-amber-700 text-xs font-bold uppercase">Station 01</div>
                      <h3 className="text-xl font-bold text-slate-900 mt-1">Siachen Ridge</h3>
                      <div className="text-xs text-slate-500">Karakoram · 5,400m AMSL</div>
                    </div>
                    <span className="px-2 py-0.5 border border-amber-300 bg-amber-50 text-amber-800 text-[10px] font-bold">
                      ACTIVE
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-600 pt-4 border-t border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Record Ambient:</span>
                      <span className="font-semibold text-sky-700">-54.8°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Interior Stable:</span>
                      <span className="font-semibold text-amber-700">+19.2°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Katabatic Wind:</span>
                      <span className="text-slate-800">280 km/h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Fuel Burn:</span>
                      <span className="text-emerald-700 font-bold">0.0 Liters</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/3d"
                  className="mt-6 w-full text-center chamfer-btn border border-slate-300 hover:border-amber-600 bg-slate-50 hover:bg-white text-slate-700 hover:text-amber-700 py-2.5 text-xs font-bold uppercase transition-colors"
                >
                  Simulate Siachen
                </Link>
              </div>

              {/* Spiti */}
              <div className="border border-slate-200 bg-white shadow-sm rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-sky-700 text-xs font-bold uppercase">Station 02</div>
                      <h3 className="text-xl font-bold text-slate-900 mt-1">Spiti Plateau</h3>
                      <div className="text-xs text-slate-500">Himalayas · 4,500m AMSL</div>
                    </div>
                    <span className="px-2 py-0.5 border border-sky-300 bg-sky-50 text-sky-800 text-[10px] font-bold">
                      ACTIVE
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-600 pt-4 border-t border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Annual Solar Flux:</span>
                      <span className="font-semibold text-amber-700">2,140 kWh/m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Glazing SHGC:</span>
                      <span className="font-semibold text-slate-900">0.68</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Seismic Zone:</span>
                      <span className="text-slate-800">Zone V (M8.2)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Autonomy:</span>
                      <span className="text-emerald-700 font-bold">100% Year-Round</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/3d"
                  className="mt-6 w-full text-center chamfer-btn border border-slate-300 hover:border-sky-600 bg-slate-50 hover:bg-white text-slate-700 hover:text-sky-700 py-2.5 text-xs font-bold uppercase transition-colors"
                >
                  Simulate Spiti
                </Link>
              </div>

              {/* Andes */}
              <div className="border border-slate-200 bg-white shadow-sm rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-slate-500 text-xs font-bold uppercase">Station 03</div>
                      <h3 className="text-xl font-bold text-slate-900 mt-1">High Andes</h3>
                      <div className="text-xs text-slate-500">Ecuador · 5,200m AMSL</div>
                    </div>
                    <span className="px-2 py-0.5 border border-slate-300 bg-slate-50 text-slate-700 text-[10px] font-bold">
                      VERIFIED
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-600 pt-4 border-t border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Solar UV Index:</span>
                      <span className="font-semibold text-amber-700">Index 22 (Extreme)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Interior Temp:</span>
                      <span className="font-semibold text-slate-800">+18.8°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Assembly Time:</span>
                      <span className="text-slate-800">72 Hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Autonomy Record:</span>
                      <span className="text-emerald-700 font-bold">99.4%</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/3d"
                  className="mt-6 w-full text-center chamfer-btn border border-slate-300 hover:border-slate-500 bg-slate-50 hover:bg-white text-slate-700 hover:text-slate-900 py-2.5 text-xs font-bold uppercase transition-colors"
                >
                  Simulate Andes
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Clean Interactive CTA Banner */}
        <section className="py-20 bg-slate-100 border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-950 tracking-tight"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              Test and configure your shelter in real time.
            </h2>
            <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Rotate orientations, adjust aerogel thicknesses, load live weather coordinates, and
              inspect the transient energy response instantly.
            </p>
            <div className="pt-4">
              <Link
                href="/3d"
                className="chamfer-btn bg-amber-600 hover:bg-amber-500 text-white font-mono font-bold text-sm px-8 py-4 uppercase tracking-wider transition-colors inline-flex items-center gap-2 shadow-md"
              >
                <span>Launch Interactive 3D Simulator</span>
                <span className="text-base">→</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 8. Clean Minimalist Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 px-6 lg:px-12 text-slate-500 font-mono text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-slate-800 font-bold mr-2">TS-1 // THERMO SHELTER</span>
            <span>© 2025 PASSIVE SOLAR ALPINE ARCHITECTURE</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/3d" className="text-amber-700 hover:text-amber-800 font-semibold transition-colors">
              3D Simulator
            </Link>
            <a href="#how-it-works" className="hover:text-slate-800 transition-colors">
              Heat Flow
            </a>
            <a href="#night-autonomy" className="hover:text-slate-800 transition-colors">
              Night Autonomy
            </a>
            <a href="#deployments" className="hover:text-slate-800 transition-colors">
              Field Stations
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}