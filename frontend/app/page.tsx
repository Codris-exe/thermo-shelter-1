"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  const [heroOpacity, setHeroOpacity] = useState(1);
  const [heroTranslateY, setHeroTranslateY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const fadeDistance = 420;
      const opacity = Math.max(0, 1 - scrollY / fadeDistance);
      const translateY = scrollY * 0.35;
      setHeroOpacity(opacity);
      setHeroTranslateY(translateY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);



  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 selection:bg-amber-500 selection:text-white antialiased font-sans">
      {/* 1. Transparent Floating Navigation */}
      <header className="absolute top-0 left-0 right-0 z-50 px-6 lg:px-12 py-6 flex items-center justify-between">
        <div className="w-20 hidden md:block" />

        <nav className="flex items-center gap-5 sm:gap-8 text-xs font-semibold uppercase tracking-widest text-white/90 drop-shadow-sm mx-auto md:mx-0">
          <Link href="/login" className="hover:text-white transition-colors">
            3D Simulator
          </Link>
          <Link href="/simulate" className="hover:text-white transition-colors">
            24h Regional Sim
          </Link>
          <a href="#how-it-works" className="hover:text-white transition-colors">
            Heat Flow
          </a>
          <a href="#night-autonomy" className="hover:text-white transition-colors">
            Autonomy
          </a>
          <a href="#deployments" className="hover:text-white transition-colors">
            Stations
          </a>
        </nav>

        <div className="flex items-center">
          <Link
            href="/login"
            className="rounded-full bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-md px-5 py-2 text-xs font-bold tracking-wider uppercase transition shadow-md"
          >
            Launch Simulator
          </Link>
        </div>
      </header>

      <main>
        {/* 2. Fullscreen Panoramic Alpine Hero Section */}
        <section
          id="hero"
          className="relative h-screen min-h-[720px] flex flex-col justify-between items-center pt-28 pb-12 sm:pb-16 px-6 overflow-hidden select-none"
        >
          {/* Real Full-bleed High-Resolution Alpine Photography */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <Image
              src="/images/hero-alpine-shelter.jpg"
              alt="Extreme-altitude passive solar alpine shelter on Himalayan ridge"
              fill
              priority
              className="object-cover object-center"
            />
            {/* Elegant cinematic contrast gradients matching Frostbound reference */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/10 to-black/65" />
          </div>

          {/* Upper Title: Giant Justified Letters Across the Whole Page */}
          <div
            className="relative z-10 w-full px-4 sm:px-8 lg:px-12 mt-2 sm:mt-6 transition-transform duration-75 ease-out"
            style={{
              opacity: heroOpacity,
              transform: `translateY(${heroTranslateY}px)`,
              willChange: "opacity, transform",
            }}
          >
            <h1
              className="text-white text-4xl sm:text-6xl md:text-8xl lg:text-[7.5rem] xl:text-[9.5rem] 2xl:text-[12rem] font-light uppercase select-none drop-shadow-2xl flex justify-between items-center w-full leading-none"
              style={{ fontFamily: "var(--font-headline)" }}
              aria-label="THERMO SHELTER"
            >
              {"THERMO SHELTER".split("").map((char, index) => (
                <span
                  key={index}
                  className={
                    char === " "
                      ? "w-8 sm:w-12 md:w-16 lg:w-24 shrink-0 inline-block text-center"
                      : "inline-block text-center flex-1"
                  }
                  aria-hidden="true"
                >
                  {char}
                </span>
              ))}
            </h1>
          </div>

          {/* Bottom Area: Main 3D Simulation Button & Clean Scroll Prompt */}
          <div
            className="relative z-10 flex flex-col items-center gap-5 sm:gap-6 pb-2 transition-transform duration-75 ease-out"
            style={{
              opacity: heroOpacity,
              transform: `translateY(${heroTranslateY * 0.4}px)`,
              willChange: "opacity, transform",
            }}
          >
            <Link
              href="/login"
              className="rounded-full bg-white hover:bg-slate-100 text-slate-950 font-bold px-9 sm:px-12 py-3.5 sm:py-4 text-xs sm:text-sm tracking-widest uppercase transition-all shadow-2xl transform hover:scale-[1.02]"
            >
              Launch 3D Simulator
            </Link>

            <a
              href="#how-it-works"
              className="flex flex-col items-center gap-1.5 text-white/70 hover:text-white transition-colors font-mono text-[10px] tracking-widest uppercase cursor-pointer drop-shadow-md"
            >
              <span>Explore Architecture</span>
              <span className="w-4 h-7 rounded-full border border-white/40 flex items-start justify-center p-1">
                <span className="w-1 h-2 rounded-full bg-white animate-bounce" />
              </span>
            </a>
          </div>
        </section>

        {/* 3. Visual Cross-Section & How It Works with Scroll Reveal */}
        <section className="py-24 border-b border-white/10 relative overflow-hidden" id="how-it-works">
          {/* Subtle glow background */}
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px]" />

          <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
            <div className="scroll-reveal flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <div className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold mb-2">
                  System Diagram
                </div>
                <h2
                  className="text-3xl sm:text-4xl lg:text-5xl font-light text-white tracking-tight"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  Passive Solar Heat Flow Architecture
                </h2>
              </div>
              <p className="text-slate-300 text-sm sm:text-base max-w-md leading-relaxed">
                How low-angle winter sunlight is gathered, stored in high-density phase-change
                materials, and circulated continuously through natural gravity convection.
              </p>
            </div>

            {/* Frostbound Glass Cross-Section Illustration */}
            <div className="scroll-reveal-scale rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-2xl shadow-2xl p-6 sm:p-8 overflow-hidden">
              <div className="relative w-full aspect-[16/9] max-h-[480px] bg-[#050813] border border-white/10 rounded-2xl p-4 flex items-center justify-center cad-grid-dense overflow-hidden shadow-inner">
                <svg
                  className="w-full h-full"
                  fill="none"
                  viewBox="0 0 700 400"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="solarGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#d97706" stopOpacity="0.1" />
                    </linearGradient>
                    <linearGradient id="coreGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#b45309" stopOpacity="0.15" />
                    </linearGradient>
                    <linearGradient id="habGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0284c7" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#0f172a" stopOpacity="0.6" />
                    </linearGradient>
                    <filter id="neonAmber" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <filter id="neonCyan" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Permafrost Ground */}
                  <path
                    d="M40 340 L660 340"
                    stroke="#334155"
                    strokeDasharray="4 4"
                    strokeWidth="1.5"
                  />
                  <text fill="#64748b" fontFamily="monospace" fontSize="11" x="50" y="365" letterSpacing="1">
                    FROZEN BEDROCK (-45°C)
                  </text>

                  {/* Foundation Piers with Aerogel Break */}
                  <rect
                    fill="#0f172a"
                    height="35"
                    stroke="#334155"
                    strokeWidth="1.5"
                    width="28"
                    x="140"
                    y="305"
                    rx="4"
                  />
                  <rect
                    fill="#0f172a"
                    height="35"
                    stroke="#334155"
                    strokeWidth="1.5"
                    width="28"
                    x="480"
                    y="305"
                    rx="4"
                  />
                  <rect fill="#38bdf8" height="6" width="38" x="135" y="300" rx="2" filter="url(#neonCyan)" />
                  <rect fill="#38bdf8" height="6" width="38" x="475" y="300" rx="2" filter="url(#neonCyan)" />
                  <text fill="#38bdf8" fontFamily="monospace" fontSize="9" fontWeight="600" x="210" y="325" letterSpacing="0.5">
                    AEROGEL THERMAL BREAK
                  </text>

                  {/* Shelter Shell Boundary */}
                  <polygon
                    fill="#0a0f1d"
                    fillOpacity="0.9"
                    points="120,300 540,300 540,160 360,90 120,160"
                    stroke="#38bdf8"
                    strokeOpacity="0.5"
                    strokeWidth="2"
                  />

                  {/* South Solar Aperture (Amber Glazing) */}
                  <polygon
                    fill="url(#solarGlow)"
                    points="360,90 540,160 540,300 515,300 515,170 355,105"
                    stroke="#fbbf24"
                    strokeWidth="2"
                    filter="url(#neonAmber)"
                  />

                  {/* Thermal Mass Storage Core */}
                  <rect
                    fill="url(#coreGlow)"
                    height="120"
                    stroke="#fbbf24"
                    strokeDasharray="4 4"
                    strokeWidth="1.5"
                    width="85"
                    x="410"
                    y="175"
                    rx="8"
                  />
                  <text
                    fill="#fbbf24"
                    fontFamily="monospace"
                    fontSize="11"
                    fontWeight="700"
                    x="420"
                    y="222"
                    letterSpacing="1"
                  >
                    THERMAL
                  </text>
                  <text fill="#fbbf24" fontFamily="monospace" fontSize="9" x="420" y="238" letterSpacing="0.5">
                    MASS CORE
                  </text>
                  <text
                    fill="#fef08a"
                    fontFamily="monospace"
                    fontSize="11"
                    fontWeight="700"
                    x="420"
                    y="260"
                  >
                    +24.5°C
                  </text>

                  {/* Main Living Pod */}
                  <rect
                    fill="url(#habGlow)"
                    height="120"
                    stroke="#38bdf8"
                    strokeOpacity="0.6"
                    strokeDasharray="4 2"
                    strokeWidth="1.5"
                    width="220"
                    x="160"
                    y="175"
                    rx="8"
                  />
                  <text
                    fill="#ffffff"
                    fontFamily="sans-serif"
                    fontSize="13"
                    fontWeight="700"
                    x="180"
                    y="220"
                    letterSpacing="0.5"
                  >
                    LIVING HABITAT
                  </text>
                  <text
                    fill="#fbbf24"
                    fontFamily="monospace"
                    fontSize="12"
                    fontWeight="700"
                    x="180"
                    y="245"
                  >
                    STABLE: +19.5°C
                  </text>

                  {/* Incident Solar Rays */}
                  <g>
                    <line
                      stroke="#fbbf24"
                      strokeDasharray="6 4"
                      strokeWidth="2"
                      x1="560"
                      x2="440"
                      y1="30"
                      y2="135"
                    />
                    <polygon fill="#fbbf24" points="440,135 448,127 437,130" />

                    <line
                      stroke="#fbbf24"
                      strokeDasharray="6 4"
                      strokeWidth="2"
                      x1="600"
                      x2="480"
                      y1="70"
                      y2="175"
                    />
                    <polygon fill="#fbbf24" points="480,175 488,167 477,170" />

                    <text
                      fill="#fbbf24"
                      fontFamily="monospace"
                      fontSize="11"
                      fontWeight="700"
                      x="500"
                      y="45"
                      letterSpacing="0.5"
                    >
                      WINTER SUNLIGHT
                    </text>
                    <text fill="#fef08a" fontFamily="monospace" fontSize="9" x="500" y="60">
                      DIRECT SOLAR GAIN
                    </text>
                  </g>

                  {/* Convection Air Loops */}
                  <path
                    d="M 495 180 C 470 145, 300 145, 270 170"
                    stroke="#fbbf24"
                    strokeDasharray="4 3"
                    strokeWidth="1.5"
                  />
                  <polygon fill="#fbbf24" points="270,170 274,160 281,166" />
                  <text fill="#fbbf24" fontFamily="monospace" fontSize="8" fontWeight="600" x="320" y="140" letterSpacing="0.5">
                    NATURAL CONVECTIVE AIRFLOW
                  </text>

                  <path
                    d="M 200 295 C 230 315, 370 315, 430 295"
                    stroke="#38bdf8"
                    strokeDasharray="4 3"
                    strokeWidth="1.5"
                  />
                  <polygon fill="#38bdf8" points="430,295 422,301 423,291" />
                </svg>
              </div>

              {/* 3 Step Summary Cards Below Diagram */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8 font-mono">
                <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl hover:border-amber-500/30 hover:bg-white/[0.05] transition-all duration-300">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-2">
                    01 · Solar Absorption
                  </div>
                  <div className="text-base font-semibold text-white mb-2 font-sans">
                    South-Facing Glazing
                  </div>
                  <div className="text-xs text-white/70 font-sans leading-relaxed">
                    Captures direct winter sunlight through multi-layer low-iron glass, warming the living core during daylight hours.
                  </div>
                </div>

                <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl hover:border-cyan-500/30 hover:bg-white/[0.05] transition-all duration-300">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 mb-2">
                    02 · Heat Storage
                  </div>
                  <div className="text-base font-semibold text-white mb-2 font-sans">
                    Thermal Mass Core
                  </div>
                  <div className="text-xs text-white/70 font-sans leading-relaxed">
                    Dense internal storage absorbs excess daytime heat, preventing overheating and storing energy for the night.
                  </div>
                </div>

                <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl hover:border-emerald-500/30 hover:bg-white/[0.05] transition-all duration-300">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-2">
                    03 · Nighttime Release
                  </div>
                  <div className="text-base font-semibold text-white mb-2 font-sans">
                    Overnight Radiant Warmth
                  </div>
                  <div className="text-xs text-white/70 font-sans leading-relaxed">
                    Slowly releases banked heat back into the shelter overnight, keeping temperatures comfortable until sunrise.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Immersive Night Thermal Autonomy Section with Scroll Reveal */}
        <section
          id="night-autonomy"
          className="relative py-28 lg:py-36 border-b border-white/10 overflow-hidden"
        >
          {/* Real Generated Night Photo with Milky Way and Glowing Shelter */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <Image
              src="/images/night-thermal-shelter.jpg"
              alt="Himalayan research station shelter under the Milky Way with glowing thermal core"
              fill
              className="object-cover object-center"
              priority
            />
            {/* Subtle edge fades to blend into background seamlessly without hiding the shelter */}
            <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-[#070b14] to-transparent" />
            <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#070b14] to-transparent" />
            {/* Subtle soft dark vignette on the right to keep unboxed typography readable against the sky */}
            <div className="absolute inset-y-0 right-0 w-full lg:w-3/5 bg-gradient-to-l from-[#070b14]/70 via-[#070b14]/30 to-transparent pointer-events-none" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
            {/* Unboxed Clean Right-Aligned Editorial Typography */}
            <div className="lg:ml-auto max-w-2xl mb-16 space-y-4">
              <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
                Night Autonomy & Telemetry
              </div>
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-normal text-white tracking-tight leading-tight drop-shadow-lg"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                Surviving the <span className="text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]"> -50°C</span> Alpine Night.
                <br />
                Zero Active Generators.
              </h2>
              <p className="text-slate-200 text-base sm:text-lg leading-relaxed font-sans drop-shadow-md">
                When outside temperatures plunge to -50°C, the shelter maintains a warm, stable interior using solar energy stored during the day — with zero fuel or generators.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
              <div className="border border-white/15 bg-[#070b14]/80 hover:bg-[#070b14]/90 hover:border-amber-500/40 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl transition-all duration-300 flex flex-col justify-between group">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-base mb-6 shadow-[0_0_20px_rgba(251,191,36,0.15)]">
                    11.4h
                  </div>
                  <h3 className="text-lg font-normal text-white font-sans uppercase mb-2">
                    Calibrated Radiant Lag
                  </h3>
                  <p className="text-xs text-white/70 font-sans leading-relaxed">
                    Solar warmth stored in the thermal core conducts slowly over 11 hours, radiating steady heat throughout sub-zero nights.
                  </p>
                </div>
                <div className="mt-6 pt-5 border-t border-white/10 flex justify-between items-center text-xs">
                  <span className="text-white/50">Nighttime Temp Drop:</span>
                  <span className="text-emerald-400 font-bold drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]">
                    &lt; 2°C / 12h
                  </span>
                </div>
              </div>

              <div className="border border-white/15 bg-[#070b14]/80 hover:bg-[#070b14]/90 hover:border-cyan-500/40 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl transition-all duration-300 flex flex-col justify-between group">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-base mb-6 shadow-[0_0_20px_rgba(34,211,238,0.15)]">
                    R-82
                  </div>
                  <h3 className="text-lg font-normal text-white font-sans uppercase mb-2">
                    Aerogel Insulation Shell
                  </h3>
                  <p className="text-xs text-white/70 font-sans leading-relaxed">
                    Advanced aerogel panels seal the building envelope, blocking intense alpine cold and stopping heat from escaping.
                  </p>
                </div>
                <div className="mt-6 pt-5 border-t border-white/10 flex justify-between items-center text-xs">
                  <span className="text-white/50">Thermal Insulation:</span>
                  <span className="text-cyan-400 font-bold drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
                    Zero Cold Bridges
                  </span>
                </div>
              </div>

              <div className="border border-white/15 bg-[#070b14]/80 hover:bg-[#070b14]/90 hover:border-emerald-500/40 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl transition-all duration-300 flex flex-col justify-between group">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-base mb-6 shadow-[0_0_20px_rgba(52,211,153,0.15)]">
                    0.0L
                  </div>
                  <h3 className="text-lg font-normal text-white font-sans uppercase mb-2">
                    100% Passive Autonomy
                  </h3>
                  <p className="text-xs text-white/70 font-sans leading-relaxed">
                    Operates completely off-grid without diesel, kerosene, or moving parts, eliminating fuel logistics and carbon monoxide hazards.
                  </p>
                </div>
                <div className="mt-6 pt-5 border-t border-white/10 flex justify-between items-center text-xs">
                  <span className="text-white/50">Heating Fuel Burn:</span>
                  <span className="text-emerald-400 font-bold drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]">
                    0.0 Liters / day
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Proven Field Deployments with Scroll Reveal */}
        <section className="py-24 border-b border-white/10 relative overflow-hidden" id="deployments">
          {/* Subtle Ambient Lighting Orb */}
          <div className="pointer-events-none absolute -bottom-24 right-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px]" />

          <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
            <div className="scroll-reveal flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <div className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold mb-2">
                  Extreme Test Stations
                </div>
                <h2
                  className="text-3xl sm:text-4xl lg:text-5xl font-normal text-white tracking-tight"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  Validated in the World&apos;s Harshest Climates
                </h2>
              </div>
              <p className="text-slate-300 text-sm sm:text-base max-w-md leading-relaxed font-sans">
                Tested and verified across glaciated ridges, cold desert plateaus, and equatorial
                alpine summits.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
              {/* Siachen */}
              <div className="scroll-reveal scroll-delay-1 border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-amber-500/40 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl transition-all duration-300 flex flex-col justify-between group">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="text-amber-400 text-xs font-bold uppercase tracking-wider">Station 01</div>
                      <h3 className="text-2xl font-normal text-white font-sans mt-1">Siachen Ridge</h3>
                      <div className="text-xs text-white/50 mt-0.5">Karakoram · 5,400m AMSL</div>
                    </div>
                    <span className="text-[11px] font-mono font-semibold tracking-wider text-amber-400 uppercase">
                      Active
                    </span>
                  </div>

                  <div className="space-y-3 text-xs pt-5 border-t border-white/10">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-white/50">Record Ambient:</span>
                      <span className="font-semibold text-cyan-400 font-mono text-sm">-54.8°C</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-t border-white/5">
                      <span className="text-white/50">Interior Stable:</span>
                      <span className="font-semibold text-amber-400 font-mono text-sm">+19.2°C</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-t border-white/5">
                      <span className="text-white/50">Katabatic Wind:</span>
                      <span className="text-white font-mono">280 km/h</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-t border-white/5">
                      <span className="text-white/50">Fuel Burn:</span>
                      <span className="text-emerald-400 font-bold font-mono">0.0 Liters</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/login"
                  className="mt-8 w-full text-center rounded-full border border-white/15 bg-white/[0.06] hover:bg-white hover:text-slate-950 text-white py-3 text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-md group-hover:border-white/30"
                >
                  Simulate Siachen →
                </Link>
              </div>

              {/* Spiti */}
              <div className="scroll-reveal scroll-delay-2 border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-cyan-500/40 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl transition-all duration-300 flex flex-col justify-between group">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="text-cyan-400 text-xs font-bold uppercase tracking-wider">Station 02</div>
                      <h3 className="text-2xl font-normal text-white font-sans mt-1">Spiti Plateau</h3>
                      <div className="text-xs text-white/50 mt-0.5">Himalayas · 4,500m AMSL</div>
                    </div>
                    <span className="text-[11px] font-mono font-semibold tracking-wider text-cyan-400 uppercase">
                      Active
                    </span>
                  </div>

                  <div className="space-y-3 text-xs pt-5 border-t border-white/10">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-white/50">Annual Solar Flux:</span>
                      <span className="font-semibold text-amber-400 font-mono text-sm">2,140 kWh/m²</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-t border-white/5">
                      <span className="text-white/50">Glazing SHGC:</span>
                      <span className="font-semibold text-white font-mono">0.68</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-t border-white/5">
                      <span className="text-white/50">Seismic Zone:</span>
                      <span className="text-white font-mono">Zone V (M8.2)</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-t border-white/5">
                      <span className="text-white/50">Autonomy:</span>
                      <span className="text-emerald-400 font-bold font-mono">100% Year-Round</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/login"
                  className="mt-8 w-full text-center rounded-full border border-white/15 bg-white/[0.06] hover:bg-white hover:text-slate-950 text-white py-3 text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-md group-hover:border-white/30"
                >
                  Simulate Spiti →
                </Link>
              </div>

              {/* Andes */}
              <div className="scroll-reveal scroll-delay-3 border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-emerald-500/40 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl transition-all duration-300 flex flex-col justify-between group">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="text-white/60 text-xs font-bold uppercase tracking-wider">Station 03</div>
                      <h3 className="text-2xl font-normal text-white font-sans mt-1">High Andes</h3>
                      <div className="text-xs text-white/50 mt-0.5">Ecuador · 5,200m AMSL</div>
                    </div>
                    <span className="text-[11px] font-mono font-semibold tracking-wider text-slate-400 uppercase">
                      Verified
                    </span>
                  </div>

                  <div className="space-y-3 text-xs pt-5 border-t border-white/10">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-white/50">Solar UV Index:</span>
                      <span className="font-semibold text-amber-400 font-mono text-sm">Index 22 (Extreme)</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-t border-white/5">
                      <span className="text-white/50">Interior Temp:</span>
                      <span className="font-semibold text-white font-mono">+18.8°C</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-t border-white/5">
                      <span className="text-white/50">Assembly Time:</span>
                      <span className="text-white font-mono">72 Hours</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-t border-white/5">
                      <span className="text-white/50">Autonomy Record:</span>
                      <span className="text-emerald-400 font-bold font-mono">99.4%</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/login"
                  className="mt-8 w-full text-center rounded-full border border-white/15 bg-white/[0.06] hover:bg-white hover:text-slate-950 text-white py-3 text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-md group-hover:border-white/30"
                >
                  Simulate Andes →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Clean Minimalist CTA Section */}
        <section className="relative py-28 sm:py-36 border-t border-white/10 bg-[#070b14] overflow-hidden">
          <div className="relative z-10 max-w-3xl mx-auto px-6 text-center space-y-6">
            <h2
              className="text-4xl sm:text-5xl lg:text-6xl font-normal text-white tracking-tight leading-tight"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              Test and configure your shelter in real time.
            </h2>

            <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed font-sans">
              Rotate orientations, adjust aerogel thicknesses, and inspect the thermal equilibrium response instantly.
            </p>

            <div className="pt-4 flex items-center justify-center font-mono">
              <Link
                href="/login"
                className="rounded-full bg-white hover:bg-slate-100 text-slate-950 font-bold px-10 sm:px-12 py-4 text-xs sm:text-sm tracking-widest uppercase transition-all shadow-2xl hover:scale-105 inline-flex items-center gap-2.5"
              >
                <span>Launch 3D Simulator</span>
                <span className="text-base">→</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 8. Clean Minimalist Editorial Footer */}
      <footer className="border-t border-white/10 bg-[#050810] py-12 px-6 lg:px-12 text-slate-400 font-mono text-xs relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <span className="text-white font-bold tracking-widest uppercase">TS-1 // THERMO SHELTER</span>
            <span className="hidden sm:inline text-white/20">|</span>
            <span className="text-slate-500 font-sans text-xs">Passive Solar Alpine Architecture</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs">
            <Link href="/login" className="text-amber-400 hover:text-amber-300 font-semibold transition-colors">
              3D Simulator
            </Link>
            <Link href="/simulate" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
              24h Regional Sim
            </Link>
            <a href="#how-it-works" className="hover:text-white transition-colors">
              Heat Flow
            </a>
            <a href="#night-autonomy" className="hover:text-white transition-colors">
              Night Autonomy
            </a>
            <a href="#deployments" className="hover:text-white transition-colors">
              Stations
            </a>
          </div>

          <div className="text-[11px] text-slate-600">
            © 2025 Thermo Shelter
          </div>
        </div>
      </footer>
    </div>
  );
}