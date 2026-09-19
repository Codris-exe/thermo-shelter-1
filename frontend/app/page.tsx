"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#070c16] text-slate-100 selection:bg-amber-500 selection:text-slate-950 antialiased relative overflow-x-hidden">
      {/* 1. Coordinate Stamp & Operational Telemetry Header Bar */}
      <div className="border-b border-white/10 bg-[#060913] px-6 md:px-12 py-1.5 text-[11px] font-mono tracking-widest text-slate-400 flex flex-wrap justify-between items-center z-50 relative">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-2 text-amber-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-400 status-ping" />
            <span>LAT 35°25&apos;N · LON 77°06&apos;E</span>
          </span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:inline text-slate-300">
            SIACHEN FIELD STATION // 5,400m AMSL
          </span>
          <span className="hidden lg:inline text-slate-600">|</span>
          <span className="hidden lg:inline text-cyan-400 font-medium">
            BAROMETRIC PRESSURE: 50.4 kPa (EXTREME LOW DENSITY)
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-400 hidden md:inline">SYSTEM INTEGRITY: 99.98%</span>
          <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-semibold tracking-wider">
            TELEMETRY LIVE
          </span>
        </div>
      </div>

      {/* 2. Top Navigation Bar */}
      <header className="bg-[#090e1b]/90 backdrop-blur-md sticky top-0 z-50 border-b border-white/10">
        <div className="flex justify-between items-center w-full px-6 md:px-12 max-w-7xl mx-auto h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500/10 border border-amber-500/40 flex items-center justify-center chamfer-btn">
              <span className="font-mono text-amber-400 font-bold text-xs">TS</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm tracking-widest font-bold text-slate-100 uppercase" style={{ fontFamily: "var(--font-headline)" }}>
                THERMO SHELTER // TS-1
              </span>
              <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase">
                PASSIVE SOLAR THERMAL LAB
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-7 text-xs font-mono uppercase tracking-widest">
            <a href="#telemetry" className="text-amber-400 border-b border-amber-400 pb-1 font-semibold">
              Telemetry
            </a>
            <a href="#axonometric" className="text-slate-400 hover:text-slate-200 transition-colors">
              Axonometric
            </a>
            <a href="#thermal-lag" className="text-slate-400 hover:text-slate-200 transition-colors">
              Thermal Lag
            </a>
            <a href="#deployments" className="text-slate-400 hover:text-slate-200 transition-colors">
              Deployments
            </a>
            <a href="#specs" className="text-slate-400 hover:text-slate-200 transition-colors">
              Specs
            </a>
          </nav>

          <div className="flex items-center gap-3 font-mono">
            <Link
              href="/3d"
              className="chamfer-btn bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 text-xs font-bold tracking-wider uppercase transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>Launch 3D Simulator</span>
              <span className="text-sm">→</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 3. Hero Section: Architectural CAD Axonometric Layout */}
      <main className="relative z-10">
        <section className="relative cad-grid border-b border-white/10 overflow-hidden pt-10 pb-16 md:py-20">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div className="inline-flex items-center gap-2 border border-white/10 bg-[#090e1b] px-3 py-1 text-[11px] font-mono tracking-widest text-slate-300">
                <span className="w-2 h-2 bg-amber-400 rounded-sm" />
                <span>ALPINE SURVIVABILITY SPEC 2025 // ARCTIC-CLASS ENVELOPE</span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 tracking-wider">
                PROJECT REF: ARCH-TS1-SIACHEN // TRL-9 VALIDATED
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* Left Column: Mission Brief */}
              <div className="lg:col-span-6 space-y-6">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 font-mono text-xs text-amber-400 tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>ZERO-COMBUSTION THERMAL EQUILIBRIUM</span>
                  </div>

                  <h1
                    className="text-3xl sm:text-4xl lg:text-[3.25rem] font-bold tracking-tight text-white leading-[1.08] uppercase"
                    style={{ fontFamily: "var(--font-headline)" }}
                  >
                    Passive solar survivability at{" "}
                    <span className="text-cyan-400 font-mono">-50°C</span> without fuel combustion.
                  </h1>

                  <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl">
                    The TS-1 alpine architectural envelope leverages aerogel insulation matrices, cross-laminated timber chassis, and dual-chamber Trombe phase-change batteries to convert ambient high-altitude solar flux into continuous radiant thermal mass for multi-week glaciated bivouacs.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-2 font-mono text-xs">
                  <Link
                    href="/3d"
                    className="chamfer-cut bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold tracking-wider uppercase px-6 py-4 transition-colors duration-150 inline-flex items-center gap-3"
                  >
                    <span className="w-2 h-2 rounded-full bg-slate-950 status-ping" />
                    <span>LAUNCH 3D THERMAL SIMULATOR</span>
                    <span className="text-base">→</span>
                  </Link>

                  <a
                    href="#specs"
                    className="chamfer-cut border border-white/20 bg-[#090e1b] hover:bg-slate-800 text-slate-200 tracking-wider uppercase px-5 py-4 transition-colors duration-150 inline-flex items-center gap-2"
                  >
                    <span>VIEW ENGINEERING MATRIX</span>
                  </a>
                </div>

                {/* Telemetry Pill Badges */}
                <div className="pt-6 border-t border-white/10 space-y-2.5">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                    Deployed Field Telemetry Verification
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-xs">
                    <div className="p-2.5 bg-[#090e1b]/80 border border-white/10 corner-bracket">
                      <div className="text-[10px] text-slate-400 uppercase">SIACHEN RIDGE</div>
                      <div className="text-slate-100 font-medium text-xs mt-0.5">
                        -52°C Ext / <span className="text-amber-400 font-semibold">+18.4°C</span> Core
                      </div>
                      <div className="text-[9px] text-cyan-400 mt-1">ΔT 70.4°C Differential</div>
                    </div>

                    <div className="p-2.5 bg-[#090e1b]/80 border border-white/10 corner-bracket">
                      <div className="text-[10px] text-slate-400 uppercase">LEH LADAKH 4,200m</div>
                      <div className="text-slate-100 font-medium text-xs mt-0.5">R-82.4 m²·K/W</div>
                      <div className="text-[9px] text-emerald-400 mt-1">Aerogel + VIP Assembly</div>
                    </div>

                    <div className="p-2.5 bg-[#090e1b]/80 border border-white/10 corner-bracket">
                      <div className="text-[10px] text-slate-400 uppercase">HIGH ANDES REFUGIO</div>
                      <div className="text-slate-100 font-medium text-xs mt-0.5">98.2% Autonomy</div>
                      <div className="text-[9px] text-amber-400 mt-1">Zero Gas Burn Record</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Architectural SVG Axonometric Thermal Flux Section */}
              <div className="lg:col-span-6 relative">
                <div className="border border-white/15 bg-[#090e1b]/95 overflow-hidden p-6 corner-bracket">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4 font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      <span className="font-semibold text-slate-200 uppercase tracking-wider">
                        AXONOMETRIC THERMAL FLUX // ARCH-01
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 tracking-widest">
                      WINTER SOLSTICE // 45° APERTURE
                    </div>
                  </div>

                  <div className="relative w-full aspect-[4/3] bg-[#050811] border border-white/5 p-4 flex items-center justify-center cad-grid-dense">
                    <svg className="w-full h-full" fill="none" viewBox="0 0 600 450" xmlns="http://www.w3.org/2000/svg">
                      {/* Bedrock Base */}
                      <path d="M40 380 L560 380" stroke="#334155" strokeDasharray="4 4" strokeWidth="2" />
                      <path d="M40 395 L560 395" stroke="#1e293b" strokeWidth="1" />
                      <text fill="#64748b" fontFamily="monospace" fontSize="10" x="50" y="405">
                        PERMAFROST BEDROCK BASE // -42°C SUB-SURFACE
                      </text>

                      {/* Foundations */}
                      <rect fill="#1e293b" height="40" stroke="#475569" strokeWidth="1.5" width="30" x="120" y="340" />
                      <rect fill="#1e293b" height="40" stroke="#475569" strokeWidth="1.5" width="30" x="420" y="340" />
                      <rect fill="#38bdf8" height="4" width="40" x="115" y="336" />
                      <rect fill="#38bdf8" height="4" width="40" x="415" y="336" />
                      <text fill="#38bdf8" fontFamily="monospace" fontSize="8" x="165" y="358">
                        AEROGEL ISOLATION PAD (λ 0.014 W/mK)
                      </text>

                      {/* Main Shell Profile */}
                      <polygon fill="#0b1120" fillOpacity="0.9" points="100,335 480,335 480,180 320,110 100,180" stroke="#94a3b8" strokeWidth="2" />
                      <polygon fill="#f59e0b" fillOpacity="0.15" points="320,110 480,180 480,335 460,335 460,190 315,125" stroke="#f59e0b" strokeWidth="1.5" />

                      {/* Trombe Thermal Mass Battery */}
                      <rect fill="#1c1917" height="125" stroke="#f59e0b" strokeDasharray="2 2" strokeWidth="1.5" width="80" x="360" y="210" />
                      <text fill="#f59e0b" fontFamily="monospace" fontSize="9" fontWeight="600" x="365" y="270">PCM TROMBE</text>
                      <text fill="#f59e0b" fontFamily="monospace" fontSize="8" x="365" y="282">CORE BATTERY</text>
                      <text fill="#cbd5e1" fontFamily="monospace" fontSize="8" x="365" y="294">+24.2°C PEAK</text>

                      {/* Habitation Core */}
                      <rect fill="#0f172a" height="125" stroke="#38bdf8" strokeDasharray="4 2" strokeWidth="1" width="180" x="140" y="210" />
                      <text fill="#e2e8f0" fontFamily="sans-serif" fontSize="12" fontWeight="600" x="155" y="245">HABITATION HABITAT</text>
                      <text fill="#94a3b8" fontFamily="monospace" fontSize="10" x="155" y="260">STABILIZED: +19.5°C</text>
                      <text fill="#64748b" fontFamily="monospace" fontSize="8" x="155" y="275">HUMIDITY: 42% RH</text>
                      <text fill="#38bdf8" fontFamily="monospace" fontSize="8" x="155" y="288">AIR CYCLES: 1.8 ACH</text>

                      {/* Solar Vector Rays at 45 Degrees */}
                      <g>
                        <line stroke="#f59e0b" strokeDasharray="6 3" strokeWidth="2" x1="490" x2="380" y1="30" y2="140" />
                        <polygon fill="#f59e0b" points="380,140 387,131 376,134" />
                        <line stroke="#f59e0b" strokeDasharray="6 3" strokeWidth="2" x1="530" x2="420" y1="70" y2="180" />
                        <polygon fill="#f59e0b" points="420,180 427,171 416,174" />
                        <line stroke="#f59e0b" strokeDasharray="3 3" strokeWidth="1.5" x1="570" x2="445" y1="110" y2="235" />
                        <polygon fill="#f59e0b" points="445,235 452,226 441,229" />
                        <text fill="#f59e0b" fontFamily="monospace" fontSize="9" fontWeight="700" x="440" y="55">WINTER VECTOR: 45.2°</text>
                        <text fill="#f59e0b" fontFamily="monospace" fontSize="8" x="440" y="67">1,120 W/m² HIGH IRRADIANCE</text>
                      </g>

                      {/* Convection and Plenum Circulation */}
                      <path d="M 430 215 C 410 180, 260 175, 230 205" stroke="#f59e0b" strokeDasharray="3 3" strokeWidth="1.5" />
                      <polygon fill="#f59e0b" points="230,205 233,195 240,201" />
                      <text fill="#f59e0b" fontFamily="monospace" fontSize="8" x="260" y="170">GRAV CONVECTIVE LOOP</text>

                      <path d="M 170 335 C 190 350, 340 350, 380 335" stroke="#38bdf8" strokeDasharray="3 3" strokeWidth="1.5" />
                      <polygon fill="#38bdf8" points="380,335 372,342 373,332" />
                      <text fill="#38bdf8" fontFamily="monospace" fontSize="8" x="210" y="365">HEAT-RECOVERY SUB-FLOOR PLENUM</text>

                      {/* Ambient Low Callout */}
                      <circle cx="90" cy="120" fill="#0369a1" fillOpacity="0.2" r="14" stroke="#38bdf8" strokeWidth="1" />
                      <text fill="#38bdf8" fontFamily="monospace" fontSize="10" fontWeight="700" x="80" y="124">-50°</text>
                      <text fill="#64748b" fontFamily="monospace" fontSize="8" x="50" y="145">EXT AMBIENT GALE</text>
                    </svg>

                    <div className="absolute bottom-3 left-3 bg-[#090e1b]/90 border border-white/10 px-2 py-1 font-mono text-[10px] text-slate-300">
                      SCALE 1:50 METRIC · VECTOR MODEL TS-1 REV 4.12
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 mt-2 border-t border-white/10 font-mono text-[10px]">
                    <div>
                      <span className="text-slate-400 block">APERTURE:</span>
                      <span className="text-amber-400 font-semibold">TRIPLE POLYCARB</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">CORE MASS:</span>
                      <span className="text-slate-200 font-semibold">TROMBE PCM 1,400kg</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">PLENUM:</span>
                      <span className="text-cyan-400 font-semibold">VACUUM SUB-CORE</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">EFFICIENCY:</span>
                      <span className="text-emerald-400 font-semibold">94.8% RETENTION</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Telemetry Strip Bar */}
        <section className="border-b border-white/10 bg-[#080d19] py-5 px-6 md:px-12" id="telemetry">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-mono">
              <div className="border-l-2 border-amber-500 pl-4 py-1">
                <div className="text-[10px] uppercase tracking-widest text-slate-400">
                  DIURNAL TEMPERATURE SWING
                </div>
                <div className="text-xl font-bold text-white tracking-tight mt-1">
                  EXT Δ48.6°C <span className="text-slate-400 font-normal">→</span>{" "}
                  <span className="text-amber-400">INT Δ2.8°C</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Core stabilization: 94.2% amplitude reduction
                </div>
              </div>

              <div className="border-l-2 border-cyan-400 pl-4 py-1">
                <div className="text-[10px] uppercase tracking-widest text-slate-400">
                  ENVELOPE THERMAL RESISTANCE
                </div>
                <div className="text-xl font-bold text-white tracking-tight mt-1">
                  R-82.4 <span className="text-sm font-normal text-slate-400">m²·K/W</span>
                </div>
                <div className="text-[11px] text-cyan-400 mt-0.5">
                  Aerogel blankets + Vacuum Core (0.004 W/m·K)
                </div>
              </div>

              <div className="border-l-2 border-amber-400 pl-4 py-1">
                <div className="text-[10px] uppercase tracking-widest text-slate-400">
                  24H SOLAR RADIATION ABSORPTION
                </div>
                <div className="text-xl font-bold text-white tracking-tight mt-1">
                  14.8 <span className="text-sm font-normal text-slate-400">kWh/m² FLUX</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Peak solar capture at 45° latitude solstice
                </div>
              </div>

              <div className="border-l-2 border-emerald-400 pl-4 py-1">
                <div className="text-[10px] uppercase tracking-widest text-slate-400">
                  TRANSIENT THERMAL LAG
                </div>
                <div className="text-xl font-bold text-white tracking-tight mt-1">
                  11.4 <span className="text-sm font-normal text-slate-400">HOURS PHASE-SHIFT</span>
                </div>
                <div className="text-[11px] text-emerald-400 mt-0.5">
                  Discharges heat during 02:00-06:00 subzero trough
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Deep Architectural Modules */}
        <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto space-y-20" id="axonometric">
          {/* Module 01: Multi-Layer Material Taxonomy */}
          <div>
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-4 mb-8">
              <div>
                <span className="font-mono text-xs text-amber-500 uppercase tracking-widest block mb-1">
                  MODULE 01 // MATERIAL CAD TAXONOMY
                </span>
                <h2
                  className="text-2xl md:text-3xl font-bold uppercase text-white tracking-tight"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  Multi-Layer Aerogel Envelope Assembly
                </h2>
              </div>
              <div className="font-mono text-xs text-slate-400">
                TOTAL WALL PROFILE THICKNESS: <span className="text-white font-semibold">280mm</span> · STRUCTURAL PAYLOAD: <span className="text-amber-400 font-semibold">32.4 kg/m²</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="bg-[#090e1b] border border-white/10 p-5 flex flex-col justify-between corner-bracket">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-mono text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300">LAYER 01 [EXT]</span>
                    <span className="font-mono text-xs text-slate-400">30mm</span>
                  </div>
                  <h3 className="text-base font-bold text-white uppercase mb-2" style={{ fontFamily: "var(--font-headline)" }}>
                    Basalt Fiber Rainscreen
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Hydrophobic continuous-filament basalt composite resisting Category 5 Katabatic wind scour and glaciated ice crystallization.
                  </p>
                </div>
                <div className="pt-4 border-t border-white/5 mt-4 font-mono text-[10px] text-slate-400">
                  TENSILE: 4,800 MPa · DENSITY: 2.7 g/cm³
                </div>
              </div>

              <div className="bg-[#090e1b] border border-white/10 p-5 flex flex-col justify-between corner-bracket">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-mono text-[10px] px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-500/30">LAYER 02</span>
                    <span className="font-mono text-xs text-cyan-400 font-semibold">60mm</span>
                  </div>
                  <h3 className="text-base font-bold text-white uppercase mb-2" style={{ fontFamily: "var(--font-headline)" }}>
                    Aerogel Thermal Blanket
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Silica matrix with 99.8% porosity. Thermal conductivity of 0.014 W/m·K suppresses molecular heat conduction in hyper-alpine low barometric environments.
                  </p>
                </div>
                <div className="pt-4 border-t border-white/5 mt-4 font-mono text-[10px] text-cyan-400">
                  R-VALUE: 4.28 / INCH · OPACITY: 88%
                </div>
              </div>

              <div className="bg-[#090e1b] border border-amber-500/30 p-5 flex flex-col justify-between corner-bracket">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-mono text-[10px] px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-500/30">LAYER 03 [CORE]</span>
                    <span className="font-mono text-xs text-amber-400 font-semibold">20mm</span>
                  </div>
                  <h3 className="text-base font-bold text-white uppercase mb-2" style={{ fontFamily: "var(--font-headline)" }}>
                    Vacuum Panels (VIP)
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Evacuated nanoporous fumed silica encapsulated in gas-tight metallic barrier envelope achieving R-60 performance in sub-centimeter envelope bounds.
                  </p>
                </div>
                <div className="pt-4 border-t border-white/5 mt-4 font-mono text-[10px] text-amber-400">
                  PRESSURE: &lt; 5 mbar · λ = 0.004 W/m·K
                </div>
              </div>

              <div className="bg-[#090e1b] border border-white/10 p-5 flex flex-col justify-between corner-bracket">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-mono text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300">LAYER 04</span>
                    <span className="font-mono text-xs text-slate-400">120mm</span>
                  </div>
                  <h3 className="text-base font-bold text-white uppercase mb-2" style={{ fontFamily: "var(--font-headline)" }}>
                    Cross-Laminated Timber
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    5-ply glued cross-laminated structural timber providing ductile seismic resistance, biogenic carbon sink, and hygroscopic moisture equilibrium buffering.
                  </p>
                </div>
                <div className="pt-4 border-t border-white/5 mt-4 font-mono text-[10px] text-slate-400">
                  MODULUS: 12,000 N/mm² · VAPOR DIFF: μ 50
                </div>
              </div>

              <div className="bg-[#090e1b] border border-white/10 p-5 flex flex-col justify-between corner-bracket">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-mono text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300">LAYER 05 [INT]</span>
                    <span className="font-mono text-xs text-slate-400">50mm</span>
                  </div>
                  <h3 className="text-base font-bold text-white uppercase mb-2" style={{ fontFamily: "var(--font-headline)" }}>
                    PCM Paraffin Battery
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Micro-encapsulated phase change material engineered with 21°C latent melting point. Captures surplus solar wattage and releases gentle radiant heat over 12 hours.
                  </p>
                </div>
                <div className="pt-4 border-t border-white/5 mt-4 font-mono text-[10px] text-slate-400">
                  LATENT HEAT: 195 kJ/kg · CYCLE: 10,000+
                </div>
              </div>
            </div>
          </div>

          {/* Module 02: 24-Hour Diurnal Heat Flux Chart */}
          <div className="bg-[#090e1b] border border-white/10 p-6 md:p-8 corner-bracket" id="thermal-lag">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-6">
              <div>
                <span className="font-mono text-xs text-cyan-400 uppercase tracking-widest block mb-1">
                  MODULE 02 // TRANSIENT THERMAL FLUX
                </span>
                <h2
                  className="text-2xl md:text-3xl font-bold uppercase text-white tracking-tight"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  24-Hour Diurnal Heat Flux &amp; Phase Shift
                </h2>
              </div>
              <div className="flex items-center gap-6 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-1 bg-cyan-400 inline-block" />
                  <span className="text-slate-300">Ambient Temp (-52°C to -18°C)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-1 bg-amber-400 inline-block" />
                  <span className="text-slate-300">Interior Core (+18.4°C to +21.2°C)</span>
                </div>
              </div>
            </div>

            <div className="w-full bg-[#050811] p-4 border border-white/5 relative">
              <svg className="w-full h-auto" fill="none" viewBox="0 0 1000 360" xmlns="http://www.w3.org/2000/svg">
                <line stroke="#1e293b" strokeDasharray="2 4" strokeWidth="1" x1="60" x2="960" y1="40" y2="40" />
                <text fill="#64748b" fontFamily="monospace" fontSize="10" x="25" y="44">+25°C</text>
                <line stroke="#1e293b" strokeDasharray="2 4" strokeWidth="1" x1="60" x2="960" y1="100" y2="100" />
                <text fill="#64748b" fontFamily="monospace" fontSize="10" x="25" y="104">+10°C</text>
                <line stroke="#334155" strokeWidth="1.5" x1="60" x2="960" y1="160" y2="160" />
                <text fill="#94a3b8" fontFamily="monospace" fontSize="10" fontWeight="700" x="30" y="164">0°C</text>
                <line stroke="#1e293b" strokeDasharray="2 4" strokeWidth="1" x1="60" x2="960" y1="220" y2="220" />
                <text fill="#64748b" fontFamily="monospace" fontSize="10" x="25" y="224">-20°C</text>
                <line stroke="#1e293b" strokeDasharray="2 4" strokeWidth="1" x1="60" x2="960" y1="280" y2="280" />
                <text fill="#64748b" fontFamily="monospace" fontSize="10" x="25" y="284">-40°C</text>
                <line stroke="#1e293b" strokeDasharray="2 4" strokeWidth="1" x1="60" x2="960" y1="330" y2="330" />
                <text fill="#0284c7" fontFamily="monospace" fontSize="10" x="25" y="334">-55°C</text>

                {/* Vertical Time Ticks */}
                <line stroke="#1e293b" strokeWidth="1" x1="100" x2="100" y1="30" y2="340" />
                <text fill="#64748b" fontFamily="monospace" fontSize="10" x="90" y="355">00:00</text>
                <line stroke="#1e293b" strokeDasharray="2 2" strokeWidth="1" x1="240" x2="240" y1="30" y2="340" />
                <text fill="#64748b" fontFamily="monospace" fontSize="10" x="230" y="355">04:00</text>
                <line stroke="#1e293b" strokeDasharray="2 2" strokeWidth="1" x1="380" x2="380" y1="30" y2="340" />
                <text fill="#64748b" fontFamily="monospace" fontSize="10" x="370" y="355">08:00</text>
                <line stroke="#1e293b" strokeWidth="1" x1="520" x2="520" y1="30" y2="340" />
                <text fill="#f59e0b" fontFamily="monospace" fontSize="10" x="508" y="355">12:00 ZENITH</text>
                <line stroke="#1e293b" strokeDasharray="2 2" strokeWidth="1" x1="660" x2="660" y1="30" y2="340" />
                <text fill="#64748b" fontFamily="monospace" fontSize="10" x="650" y="355">16:00</text>
                <line stroke="#1e293b" strokeDasharray="2 2" strokeWidth="1" x1="800" x2="800" y1="30" y2="340" />
                <text fill="#64748b" fontFamily="monospace" fontSize="10" x="790" y="355">20:00</text>
                <line stroke="#1e293b" strokeWidth="1" x1="940" x2="940" y1="30" y2="340" />
                <text fill="#64748b" fontFamily="monospace" fontSize="10" x="930" y="355">24:00</text>

                {/* Solar Absorption Window */}
                <rect fill="#f59e0b" fillOpacity="0.06" height="290" width="300" x="380" y="40" />
                <text fill="#f59e0b" fontFamily="monospace" fontSize="9" x="440" y="55">
                  SOLAR ABSORPTION WINDOW [14.8 kWh/m²]
                </text>

                {/* Ambient Temp Plunge Curve */}
                <path
                  d="M 100 305 C 160 320, 220 330, 280 324 C 350 315, 440 230, 520 214 C 600 205, 680 250, 760 290 C 840 320, 900 315, 940 310"
                  stroke="#38bdf8"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                />

                {/* Stabilized Interior Horizon */}
                <path
                  d="M 100 62 C 180 64, 280 66, 380 63 C 480 60, 540 54, 620 56 C 720 58, 820 60, 940 62"
                  stroke="#f59e0b"
                  strokeLinecap="round"
                  strokeWidth="3"
                />

                <circle cx="240" cy="65" fill="#f59e0b" r="4" stroke="#0f172a" strokeWidth="2" />
                <text fill="#f59e0b" fontFamily="monospace" fontSize="9" fontWeight="700" x="210" y="85">
                  TROMBE DISCHARGE PEAK (+19.1°C)
                </text>

                <circle cx="280" cy="324" fill="#38bdf8" r="4" stroke="#0f172a" strokeWidth="2" />
                <text fill="#38bdf8" fontFamily="monospace" fontSize="9" fontWeight="700" x="290" y="335">
                  AMBIENT LOW: -52.4°C
                </text>

                <path d="M 520 20 L 880 20" stroke="#94a3b8" strokeDasharray="3 3" strokeWidth="1.5" />
                <polyline fill="none" points="875,17 880,20 875,23" stroke="#94a3b8" strokeWidth="1.5" />
                <text fill="#94a3b8" fontFamily="monospace" fontSize="9" x="640" y="15">
                  11.4 HOURS LATENT PHASE SHIFT OFFSET
                </text>
              </svg>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-white/10 text-xs font-mono">
              <div className="text-slate-400">
                <span className="text-white font-semibold block mb-1">ZERO AUXILIARY HEATING:</span>
                Shelter retains comfort standard ISO 7730 throughout 72-hour sustained storm cycles with zero auxiliary burner combustion.
              </div>
              <div className="text-slate-400">
                <span className="text-white font-semibold block mb-1">PASSIVE SENSIBLE STORAGE:</span>
                Trombe basalt matrix stores 42.6 MJ/m² during daylight, releasing continuous 120 W/m² radiant warmth throughout the night.
              </div>
              <div className="text-slate-400">
                <span className="text-white font-semibold block mb-1">MICROCLIMATE STABILITY:</span>
                Mean radiant temperature (MRT) matches dry-bulb temperature within ±0.8°C, preventing human radiant chill.
              </div>
            </div>
          </div>

          {/* Module 03: Field Deployments */}
          <div id="deployments">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-4 mb-8">
              <div>
                <span className="font-mono text-xs text-amber-500 uppercase tracking-widest block mb-1">
                  MODULE 03 // EMPIRICAL VALIDATION
                </span>
                <h2
                  className="text-2xl md:text-3xl font-bold uppercase text-white tracking-tight"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  Active Extreme Alpine Deployments
                </h2>
              </div>
              <div className="font-mono text-xs text-slate-400">
                TIME IN SERVICE: <span className="text-white font-semibold">18,420 OPERATIONAL HOURS</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Station 01 */}
              <div className="border border-white/15 bg-[#090e1b] p-6 flex flex-col justify-between corner-bracket">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[10px] font-mono text-amber-400 font-semibold uppercase tracking-wider block">
                        STATION ARCH-01
                      </span>
                      <h3 className="text-xl font-bold text-white uppercase" style={{ fontFamily: "var(--font-headline)" }}>
                        Siachen Ridge Line
                      </h3>
                      <span className="font-mono text-xs text-slate-400">Karakoram · 5,400m AMSL</span>
                    </div>
                    <span className="px-2 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[10px]">
                      LIVE TELEMETRY
                    </span>
                  </div>

                  <ul className="space-y-2 font-mono text-xs text-slate-300 border-t border-white/10 pt-4">
                    <li className="flex justify-between">
                      <span className="text-slate-400">RECORD LOW:</span>
                      <span className="font-semibold text-cyan-400">-54.8°C</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-400">INTERIOR STABILIZED:</span>
                      <span className="font-semibold text-amber-400">+19.2°C CONSTANT</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-400">KATABATIC WIND:</span>
                      <span>280 km/h (CAT 5 GALE)</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-400">FUEL CONSUMED:</span>
                      <span className="text-emerald-400 font-bold">0.0 LITERS</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 mt-6 border-t border-white/5">
                  <Link
                    href="/3d"
                    className="w-full chamfer-btn border border-white/20 hover:border-amber-400 hover:text-amber-400 text-slate-300 font-mono text-xs py-2 uppercase tracking-wider transition-colors flex items-center justify-center gap-1"
                  >
                    <span>Simulate Siachen Coordinates</span>
                    <span className="text-sm">→</span>
                  </Link>
                </div>
              </div>

              {/* Station 02 */}
              <div className="border border-white/15 bg-[#090e1b] p-6 flex flex-col justify-between corner-bracket">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[10px] font-mono text-cyan-400 font-semibold uppercase tracking-wider block">
                        STATION ARCH-02
                      </span>
                      <h3 className="text-xl font-bold text-white uppercase" style={{ fontFamily: "var(--font-headline)" }}>
                        Spiti Observatory
                      </h3>
                      <span className="font-mono text-xs text-slate-400">Trans-Himalaya · 4,500m</span>
                    </div>
                    <span className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-[10px]">
                      VERIFIED 48 MOS
                    </span>
                  </div>

                  <ul className="space-y-2 font-mono text-xs text-slate-300 border-t border-white/10 pt-4">
                    <li className="flex justify-between">
                      <span className="text-slate-400">ANNUAL SOLAR FLUX:</span>
                      <span className="font-semibold text-amber-400">2,140 kWh/m²</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-400">GLAZING EFFICIENCY:</span>
                      <span className="font-semibold text-white">SHGC 0.68 / U-0.45</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-400">SEISMIC ZONE:</span>
                      <span>ZONE V (M8.2 RATED)</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-400">THERMAL AUTONOMY:</span>
                      <span className="text-emerald-400 font-bold">100.0% YEAR-ROUND</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 mt-6 border-t border-white/5">
                  <Link
                    href="/3d"
                    className="w-full chamfer-btn border border-white/20 hover:border-amber-400 hover:text-amber-400 text-slate-300 font-mono text-xs py-2 uppercase tracking-wider transition-colors flex items-center justify-center gap-1"
                  >
                    <span>Simulate Spiti Coordinates</span>
                    <span className="text-sm">→</span>
                  </Link>
                </div>
              </div>

              {/* Station 03 */}
              <div className="border border-white/15 bg-[#090e1b] p-6 flex flex-col justify-between corner-bracket">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase tracking-wider block">
                        STATION ARCH-03
                      </span>
                      <h3 className="text-xl font-bold text-white uppercase" style={{ fontFamily: "var(--font-headline)" }}>
                        Chimborazo Apex
                      </h3>
                      <span className="font-mono text-xs text-slate-400">Equatorial Andes · 5,200m</span>
                    </div>
                    <span className="px-2 py-1 bg-slate-800 text-slate-300 font-mono text-[10px]">
                      VALIDATED
                    </span>
                  </div>

                  <ul className="space-y-2 font-mono text-xs text-slate-300 border-t border-white/10 pt-4">
                    <li className="flex justify-between">
                      <span className="text-slate-400">SOLAR UV INDEX:</span>
                      <span className="font-semibold text-amber-400">INDEX 22 (ULTRA-HIGH)</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-400">INTERIOR TEMP:</span>
                      <span className="font-semibold text-slate-200">+18.8°C NOMINAL</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-400">AIR-DROP ASSEMBLY:</span>
                      <span>72 HOURS VIA CH-47</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-400">AUTONOMY METRIC:</span>
                      <span className="text-emerald-400 font-bold">99.4% RECORD</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 mt-6 border-t border-white/5">
                  <Link
                    href="/3d"
                    className="w-full chamfer-btn border border-white/20 hover:border-amber-400 hover:text-amber-400 text-slate-300 font-mono text-xs py-2 uppercase tracking-wider transition-colors flex items-center justify-center gap-1"
                  >
                    <span>Simulate Andes Coordinates</span>
                    <span className="text-sm">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Module 04: Specification Verification Matrix */}
          <div className="border border-white/15 bg-[#090e1b] p-6 md:p-8 corner-bracket" id="specs">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-4 mb-6">
              <div>
                <span className="font-mono text-xs text-amber-500 uppercase tracking-widest block mb-1">
                  ENGINEERING VERIFICATION MATRIX
                </span>
                <h2
                  className="text-2xl font-bold uppercase text-white tracking-tight"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  Technical Specification Matrix // Class-1 Alpine
                </h2>
              </div>
              <div className="inline-flex items-center gap-2 font-mono text-xs text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>STANDARD COMPLIANCE: ISO 13790 / EN 12831</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px] tracking-wider bg-[#060913]">
                    <th className="py-3 px-4">Subsystem Parameter</th>
                    <th className="py-3 px-4">Design Requirement</th>
                    <th className="py-3 px-4">TS-1 Measured Field Value</th>
                    <th className="py-3 px-4">Safety Factor</th>
                    <th className="py-3 px-4 text-right">Verification Protocol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">Roof Snow Load Capacity</td>
                    <td className="py-3.5 px-4 text-slate-400">≥ 8.0 kN/m² (Glacier Apex)</td>
                    <td className="py-3.5 px-4 text-amber-400 font-bold">12.4 kN/m² Sustained</td>
                    <td className="py-3.5 px-4">γ = 2.45</td>
                    <td className="py-3.5 px-4 text-right text-slate-400">FEA Non-Linear Ansys #412</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">Katabatic Wind Loading</td>
                    <td className="py-3.5 px-4 text-slate-400">220 km/h Gust Survival</td>
                    <td className="py-3.5 px-4 text-amber-400 font-bold">280 km/h Continuous Dynamic</td>
                    <td className="py-3.5 px-4">γ = 1.90</td>
                    <td className="py-3.5 px-4 text-right text-slate-400">Wind Tunnel ETH Zurich</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">Thermal Transmittance (U)</td>
                    <td className="py-3.5 px-4 text-slate-400">≤ 0.080 W/(m²·K)</td>
                    <td className="py-3.5 px-4 text-cyan-400 font-bold">0.0121 W/(m²·K) [R-82.4]</td>
                    <td className="py-3.5 px-4">γ = 6.60</td>
                    <td className="py-3.5 px-4 text-right text-slate-400">ASTM C1363 Hot Box</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">Envelope Airtightness (n50)</td>
                    <td className="py-3.5 px-4 text-slate-400">≤ 0.60 ACH @ 50 Pa</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-bold">0.14 ACH @ 50 Pa</td>
                    <td className="py-3.5 px-4">γ = 4.28</td>
                    <td className="py-3.5 px-4 text-right text-slate-400">Blower Door ISO 9972</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">Seismic Acceleration (Ground PGA)</td>
                    <td className="py-3.5 px-4 text-slate-400">0.45 g Peak Accel</td>
                    <td className="py-3.5 px-4 text-slate-200 font-bold">0.82 g Elastic Ductility</td>
                    <td className="py-3.5 px-4">γ = 1.82</td>
                    <td className="py-3.5 px-4 text-right text-slate-400">Time-History Shake Table</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">Air-Drop Erection Assembly</td>
                    <td className="py-3.5 px-4 text-slate-400">≤ 120 Hours</td>
                    <td className="py-3.5 px-4 text-amber-400 font-bold">72 Hours Modular Chassis</td>
                    <td className="py-3.5 px-4">4-Man Crew</td>
                    <td className="py-3.5 px-4 text-right text-slate-400">Spiti Field Deployment</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap justify-between items-center text-slate-400 font-mono text-[11px] gap-4">
              <div className="flex items-center gap-3">
                <span className="text-amber-400 font-bold">✓ VERIFIED</span>
                <span>CHIEF STRUCTURAL ENGINEER: PEAK ALPINE LABS / SPEC CERTIFIED</span>
              </div>
              <div>
                CHECKSUM: <span className="text-slate-300">0x9F4B...72A1</span> (SHA-256 TS-1 REV 4.12)
              </div>
            </div>
          </div>
        </section>

        {/* 6. Launch Simulator Call to Action Banner */}
        <section className="cad-grid border-t border-b border-white/10 py-16 px-6 md:px-12 bg-[#080d19]">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3">
              <span className="font-mono text-xs text-amber-400 uppercase tracking-widest block">
                INTERACTIVE ENGINEERING SUITE
              </span>
              <h2
                className="text-3xl font-bold uppercase text-white tracking-tight"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                Launch the Interactive 3D Thermal Simulator
              </h2>
              <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
                Tune shelter dimensions, test custom multi-layer assemblies, fetch real satellite irradiance, and simulate transient heat balance with sub-second feedback.
              </p>
            </div>

            <Link
              href="/3d"
              className="chamfer-btn bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs px-8 py-4 uppercase tracking-wider transition-colors flex items-center gap-2 shrink-0 shadow-lg"
            >
              <span>Launch 3D Simulator</span>
              <span className="text-base">→</span>
            </Link>
          </div>
        </section>
      </main>

      {/* 7. Footer */}
      <footer className="bg-[#050811] border-t border-white/10 py-8 px-6 md:px-12 text-slate-500 font-mono text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-slate-400 font-bold mr-2">TS-1 // THERMO SHELTER</span>
            <span>© 2025 PASSIVE SOLAR ENGINEERING CORP. SPEC REV 4.12</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/3d" className="text-amber-400 hover:text-amber-300 transition-colors">
              3D Simulator
            </Link>
            <a href="#telemetry" className="hover:text-slate-300 transition-colors">
              Telemetry
            </a>
            <a href="#axonometric" className="hover:text-slate-300 transition-colors">
              Materials
            </a>
            <a href="#specs" className="hover:text-slate-300 transition-colors">
              Specs
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}