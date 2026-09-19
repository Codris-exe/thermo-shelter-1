"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 selection:bg-amber-500 selection:text-slate-950 antialiased font-sans">
      {/* 1. Ultra-clean Top Micro Status Bar */}
      <div className="border-b border-white/[0.08] bg-[#050810] px-6 lg:px-12 py-2 text-[11px] font-mono tracking-wider text-slate-400 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 text-amber-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-400 status-ping" />
            <span>TS-1 RESEARCH INITIATIVE</span>
          </span>
          <span className="hidden sm:inline text-slate-600">/</span>
          <span className="hidden sm:inline text-slate-400">HIGH-ALTITUDE PASSIVE CLIMATE SYSTEMS</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400 text-[10px]">
          <span className="hidden md:inline">TRL-9 VERIFIED SPEC</span>
          <span className="px-2 py-0.5 border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 font-medium">
            FIELD READY
          </span>
        </div>
      </div>

      {/* 2. Top Navigation */}
      <header className="sticky top-0 z-50 bg-[#070b14]/85 backdrop-blur-md border-b border-white/[0.08]">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-6 lg:px-12 h-16">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-mono font-bold text-amber-400 text-xs">
              TS
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors" style={{ fontFamily: "var(--font-headline)" }}>
                THERMO SHELTER 1
              </div>
              <div className="text-[10px] font-mono tracking-wider text-slate-400">
                PASSIVE ALPINE LAB
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-mono uppercase tracking-wider text-slate-400">
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#thermal-specs" className="hover:text-white transition-colors">
              Thermal Specs
            </a>
            <a href="#deployments" className="hover:text-white transition-colors">
              Deployments
            </a>
            <a href="#benchmarks" className="hover:text-white transition-colors">
              Benchmarks
            </a>
          </nav>

          <Link
            href="/3d"
            className="chamfer-btn bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2.5 text-xs font-mono font-bold tracking-wider uppercase transition-colors flex items-center gap-2 shadow-sm"
          >
            <span>Launch Simulator</span>
            <span>→</span>
          </Link>
        </div>
      </header>

      {/* 3. Hero Section */}
      <main>
        <section className="relative pt-16 pb-20 md:py-24 border-b border-white/[0.08] overflow-hidden">
          {/* Subtle architectural grid background */}
          <div className="cad-grid absolute inset-0 opacity-40 pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
            <div className="max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 font-mono text-xs">
                <span>Passive Solar Architecture</span>
                <span className="text-slate-500">•</span>
                <span>Zero Fuel Burn</span>
              </div>

              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                Engineered for <span className="text-cyan-400">-50°C</span>. Powered entirely by the sun.
              </h1>

              <p className="text-slate-300 text-lg sm:text-xl font-normal leading-relaxed max-w-2xl">
                Thermo Shelter 1 is a physics-driven alpine shelter designed for extreme environments. It combines high-performance insulation, phase-change thermal storage, and passive solar capture to keep interiors at +19°C without heaters or generators.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/3d"
                  className="chamfer-btn bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs px-7 py-4 tracking-wider uppercase transition-colors inline-flex items-center gap-3 shadow-md"
                >
                  <span>Launch 3D Thermal Simulator</span>
                  <span>→</span>
                </Link>

                <a
                  href="#how-it-works"
                  className="chamfer-btn border border-white/20 bg-[#090e1b] hover:bg-slate-800 text-slate-200 font-mono text-xs px-6 py-4 tracking-wider uppercase transition-colors"
                >
                  Explore Architecture
                </a>
              </div>
            </div>

            {/* 4 Clean Big Telemetry Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-16 pt-8 border-t border-white/[0.08] font-mono">
              <div className="p-5 border border-white/[0.08] bg-[#0b1120]/70 rounded-xl">
                <div className="text-[11px] text-slate-400 uppercase tracking-wider">Internal Stability</div>
                <div className="text-2xl sm:text-3xl font-bold text-amber-400 mt-2">+19.5°C</div>
                <div className="text-xs text-slate-400 mt-1">Constant core comfort zone</div>
              </div>

              <div className="p-5 border border-white/[0.08] bg-[#0b1120]/70 rounded-xl">
                <div className="text-[11px] text-slate-400 uppercase tracking-wider">Envelope Rating</div>
                <div className="text-2xl sm:text-3xl font-bold text-cyan-400 mt-2">R-82.4</div>
                <div className="text-xs text-slate-400 mt-1">m²·K/W combined barrier</div>
              </div>

              <div className="p-5 border border-white/[0.08] bg-[#0b1120]/70 rounded-xl">
                <div className="text-[11px] text-slate-400 uppercase tracking-wider">Thermal Lag</div>
                <div className="text-2xl sm:text-3xl font-bold text-emerald-400 mt-2">11.4h</div>
                <div className="text-xs text-slate-400 mt-1">Nighttime radiant release</div>
              </div>

              <div className="p-5 border border-white/[0.08] bg-[#0b1120]/70 rounded-xl">
                <div className="text-[11px] text-slate-400 uppercase tracking-wider">Auxiliary Fuel</div>
                <div className="text-2xl sm:text-3xl font-bold text-white mt-2">0.0 L</div>
                <div className="text-xs text-slate-400 mt-1">100% passive solar autonomy</div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Visual Cross-Section & How It Works */}
        <section className="py-20 border-b border-white/[0.08]" id="how-it-works">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <div className="text-xs font-mono uppercase tracking-widest text-amber-400 mb-2">
                  System Diagram
                </div>
                <h2
                  className="text-3xl sm:text-4xl font-bold text-white tracking-tight"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  Passive Solar Heat Flow Architecture
                </h2>
              </div>
              <p className="text-slate-400 text-sm max-w-md leading-relaxed">
                How low-angle winter sunlight is gathered, stored in high-density phase-change materials, and circulated continuously through natural gravity convection.
              </p>
            </div>

            {/* Clean SVG Cross-Section Illustration */}
            <div className="border border-white/10 bg-[#090e1b] rounded-2xl overflow-hidden p-6 sm:p-8">
              <div className="relative w-full aspect-[16/9] max-h-[460px] bg-[#050810] border border-white/5 rounded-xl p-4 flex items-center justify-center cad-grid-dense">
                <svg className="w-full h-full" fill="none" viewBox="0 0 700 400" xmlns="http://www.w3.org/2000/svg">
                  {/* Permafrost Ground */}
                  <path d="M50 340 L650 340" stroke="#334155" strokeDasharray="4 4" strokeWidth="2" />
                  <text fill="#64748b" fontFamily="monospace" fontSize="11" x="60" y="365">
                    FROZEN GLACIER BEDROCK (-45°C)
                  </text>

                  {/* Foundation Piers with Aerogel Break */}
                  <rect fill="#1e293b" height="35" stroke="#475569" strokeWidth="1.5" width="28" x="140" y="305" rx="3" />
                  <rect fill="#1e293b" height="35" stroke="#475569" strokeWidth="1.5" width="28" x="480" y="305" rx="3" />
                  <rect fill="#38bdf8" height="5" width="38" x="135" y="300" rx="1" />
                  <rect fill="#38bdf8" height="5" width="38" x="475" y="300" rx="1" />
                  <text fill="#38bdf8" fontFamily="monospace" fontSize="9" x="185" y="322">
                    AEROGEL THERMAL ISOLATION BREAK
                  </text>

                  {/* Shelter Shell Boundary */}
                  <polygon fill="#0d1424" fillOpacity="0.95" points="120,300 540,300 540,160 360,90 120,160" stroke="#94a3b8" strokeWidth="2" />
                  
                  {/* South Solar Aperture (Amber Glazing) */}
                  <polygon fill="#f59e0b" fillOpacity="0.16" points="360,90 540,160 540,300 515,300 515,170 355,105" stroke="#f59e0b" strokeWidth="2" />

                  {/* Thermal Mass Storage Core */}
                  <rect fill="#171e2e" height="120" stroke="#f59e0b" strokeDasharray="3 3" strokeWidth="1.5" width="85" x="410" y="175" rx="6" />
                  <text fill="#f59e0b" fontFamily="monospace" fontSize="11" fontWeight="700" x="420" y="225">TROMBE</text>
                  <text fill="#f59e0b" fontFamily="monospace" fontSize="9" x="420" y="240">HEAT CORE</text>
                  <text fill="#e2e8f0" fontFamily="monospace" fontSize="10" fontWeight="600" x="420" y="260">+24.5°C</text>

                  {/* Main Living Pod */}
                  <rect fill="#0a0f1d" height="120" stroke="#38bdf8" strokeDasharray="4 2" strokeWidth="1.5" width="220" x="160" y="175" rx="6" />
                  <text fill="#ffffff" fontFamily="sans-serif" fontSize="14" fontWeight="700" x="180" y="215">HABITATION CORE</text>
                  <text fill="#f59e0b" fontFamily="monospace" fontSize="12" fontWeight="700" x="180" y="240">STABLE: +19.5°C</text>
                  <text fill="#64748b" fontFamily="monospace" fontSize="9" x="180" y="260">RELATIVE HUMIDITY: 42%</text>

                  {/* Incident Solar Rays */}
                  <g>
                    <line stroke="#f59e0b" strokeDasharray="6 3" strokeWidth="2" x1="560" x2="440" y1="30" y2="135" />
                    <polygon fill="#f59e0b" points="440,135 448,127 437,130" />
                    
                    <line stroke="#f59e0b" strokeDasharray="6 3" strokeWidth="2" x1="600" x2="480" y1="70" y2="175" />
                    <polygon fill="#f59e0b" points="480,175 488,167 477,170" />
                    
                    <text fill="#f59e0b" fontFamily="monospace" fontSize="11" fontWeight="700" x="510" y="45">
                      45° WINTER SUN VECTOR
                    </text>
                    <text fill="#f59e0b" fontFamily="monospace" fontSize="9" x="510" y="60">
                      1,120 W/m² HIGH-ALTITUDE FLUX
                    </text>
                  </g>

                  {/* Convection Air Loops */}
                  <path d="M 495 180 C 470 145, 300 145, 270 170" stroke="#f59e0b" strokeDasharray="3 3" strokeWidth="1.5" />
                  <polygon fill="#f59e0b" points="270,170 274,160 281,166" />
                  <text fill="#f59e0b" fontFamily="monospace" fontSize="8" x="320" y="140">WARM CONVECTIVE AIRFLOW</text>

                  <path d="M 200 295 C 230 315, 370 315, 430 295" stroke="#38bdf8" strokeDasharray="3 3" strokeWidth="1.5" />
                  <polygon fill="#38bdf8" points="430,295 422,301 423,291" />
                  <text fill="#38bdf8" fontFamily="monospace" fontSize="8" x="250" y="325">SUB-FLOOR RECOVERY PLENUM</text>
                </svg>
              </div>

              {/* 3 Step Summary Cards Below Diagram */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 font-mono">
                <div className="p-4 border border-white/[0.08] bg-[#070b14] rounded-xl">
                  <div className="text-amber-400 font-bold text-xs uppercase mb-1">01 / SOLAR ABSORPTION</div>
                  <div className="text-sm font-semibold text-white mb-2">Triple-Glazed South Facade</div>
                  <div className="text-xs text-slate-400 leading-relaxed">
                    Captures up to 14.8 kWh/m² daily solar radiation directly through low-iron high-transmittance glazing.
                  </div>
                </div>

                <div className="p-4 border border-white/[0.08] bg-[#070b14] rounded-xl">
                  <div className="text-cyan-400 font-bold text-xs uppercase mb-1">02 / SENSIBLE STORAGE</div>
                  <div className="text-sm font-semibold text-white mb-2">Phase-Change Trombe Core</div>
                  <div className="text-xs text-slate-400 leading-relaxed">
                    1,400 kg paraffin-basalt matrix locks latent thermal energy at 21°C, preventing daytime overheating.
                  </div>
                </div>

                <div className="p-4 border border-white/[0.08] bg-[#070b14] rounded-xl">
                  <div className="text-emerald-400 font-bold text-xs uppercase mb-1">03 / NIGHTTIME RELEASE</div>
                  <div className="text-sm font-semibold text-white mb-2">11.4-Hour Radiant Phase Shift</div>
                  <div className="text-xs text-slate-400 leading-relaxed">
                    Releases warm radiant heat between 02:00 and 06:00 during peak sub-zero temperatures.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Proven Field Deployments */}
        <section className="py-20 border-b border-white/[0.08]" id="deployments">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <div className="text-xs font-mono uppercase tracking-widest text-amber-400 mb-2">
                  Extreme Test Stations
                </div>
                <h2
                  className="text-3xl sm:text-4xl font-bold text-white tracking-tight"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  Validated in the World&apos;s Harshest Climates
                </h2>
              </div>
              <p className="text-slate-400 text-sm max-w-md leading-relaxed">
                Tested and verified across glaciated ridges, cold desert plateaus, and equatorial alpine summits.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
              {/* Siachen */}
              <div className="border border-white/10 bg-[#090e1b] rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-amber-400 text-xs font-bold uppercase">Station 01</div>
                      <h3 className="text-xl font-bold text-white mt-1">Siachen Ridge</h3>
                      <div className="text-xs text-slate-400">Karakoram · 5,400m AMSL</div>
                    </div>
                    <span className="px-2 py-0.5 border border-amber-400/30 bg-amber-400/10 text-amber-300 text-[10px] font-bold">
                      ACTIVE
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-300 pt-4 border-t border-white/[0.08]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Record Ambient:</span>
                      <span className="font-semibold text-cyan-400">-54.8°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Interior Stable:</span>
                      <span className="font-semibold text-amber-400">+19.2°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Katabatic Wind:</span>
                      <span>280 km/h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Fuel Burn:</span>
                      <span className="text-emerald-400 font-bold">0.0 Liters</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/3d"
                  className="mt-6 w-full text-center chamfer-btn border border-white/20 hover:border-amber-400 text-slate-300 hover:text-amber-400 py-2.5 text-xs font-bold uppercase transition-colors"
                >
                  Simulate Siachen
                </Link>
              </div>

              {/* Spiti */}
              <div className="border border-white/10 bg-[#090e1b] rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-cyan-400 text-xs font-bold uppercase">Station 02</div>
                      <h3 className="text-xl font-bold text-white mt-1">Spiti Plateau</h3>
                      <div className="text-xs text-slate-400">Himalayas · 4,500m AMSL</div>
                    </div>
                    <span className="px-2 py-0.5 border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 text-[10px] font-bold">
                      ACTIVE
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-300 pt-4 border-t border-white/[0.08]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Annual Solar Flux:</span>
                      <span className="font-semibold text-amber-400">2,140 kWh/m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Glazing SHGC:</span>
                      <span className="font-semibold text-white">0.68</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Seismic Zone:</span>
                      <span>Zone V (M8.2)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Autonomy:</span>
                      <span className="text-emerald-400 font-bold">100% Year-Round</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/3d"
                  className="mt-6 w-full text-center chamfer-btn border border-white/20 hover:border-cyan-400 text-slate-300 hover:text-cyan-400 py-2.5 text-xs font-bold uppercase transition-colors"
                >
                  Simulate Spiti
                </Link>
              </div>

              {/* Andes */}
              <div className="border border-white/10 bg-[#090e1b] rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-slate-400 text-xs font-bold uppercase">Station 03</div>
                      <h3 className="text-xl font-bold text-white mt-1">High Andes</h3>
                      <div className="text-xs text-slate-400">Ecuador · 5,200m AMSL</div>
                    </div>
                    <span className="px-2 py-0.5 border border-white/20 bg-white/5 text-slate-300 text-[10px] font-bold">
                      VERIFIED
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-300 pt-4 border-t border-white/[0.08]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Solar UV Index:</span>
                      <span className="font-semibold text-amber-400">Index 22 (Extreme)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Interior Temp:</span>
                      <span className="font-semibold text-slate-200">+18.8°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Assembly Time:</span>
                      <span>72 Hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Autonomy Record:</span>
                      <span className="text-emerald-400 font-bold">99.4%</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/3d"
                  className="mt-6 w-full text-center chamfer-btn border border-white/20 hover:border-white text-slate-300 hover:text-white py-2.5 text-xs font-bold uppercase transition-colors"
                >
                  Simulate Andes
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Clean Interactive CTA Banner */}
        <section className="py-20 bg-gradient-to-b from-[#070b14] to-[#090e1b]">
          <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              Test and configure your shelter in real time.
            </h2>
            <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Rotate orientations, adjust aerogel thicknesses, load live weather coordinates, and inspect the transient energy response instantly.
            </p>
            <div className="pt-4">
              <Link
                href="/3d"
                className="chamfer-btn bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-sm px-8 py-4 uppercase tracking-wider transition-colors inline-flex items-center gap-2 shadow-lg"
              >
                <span>Launch Interactive 3D Simulator</span>
                <span className="text-base">→</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 7. Clean Minimalist Footer */}
      <footer className="border-t border-white/[0.08] bg-[#050810] py-8 px-6 lg:px-12 text-slate-500 font-mono text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-slate-300 font-bold mr-2">TS-1 // THERMO SHELTER</span>
            <span>© 2025 PASSIVE SOLAR ALPINE ARCHITECTURE</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/3d" className="text-amber-400 hover:text-amber-300 transition-colors">
              3D Simulator
            </Link>
            <a href="#how-it-works" className="hover:text-slate-300 transition-colors">
              Heat Flow
            </a>
            <a href="#deployments" className="hover:text-slate-300 transition-colors">
              Field Stations
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}