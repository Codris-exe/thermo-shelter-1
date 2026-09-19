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
          <Link href="/3d" className="hover:text-white transition-colors">
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
            href="/3d"
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
              href="/3d"
              className="rounded-full bg-white hover:bg-slate-100 text-slate-950 font-bold px-9 sm:px-12 py-3.5 sm:py-4 text-xs sm:text-sm tracking-widest uppercase transition-all shadow-2xl transform hover:scale-[1.02]"
            >
              Launch 3D Simulator
            </Link>

            <a
              href="#telemetry"
              className="flex flex-col items-center gap-1.5 text-white/70 hover:text-white transition-colors font-mono text-[10px] tracking-widest uppercase cursor-pointer drop-shadow-md"
            >
              <span>Explore Telemetry</span>
              <span className="w-4 h-7 rounded-full border border-white/40 flex items-start justify-center p-1">
                <span className="w-1 h-2 rounded-full bg-white animate-bounce" />
              </span>
            </a>
          </div>
        </section>

        {/* 3. Quick Telemetry Readout Strip with Scroll Reveal */}
        <section
          id="telemetry"
          className="relative py-16 border-y border-white/10 bg-[#070b14]/70 backdrop-blur-2xl overflow-hidden"
        >
          {/* Subtle Ambient Lighting Orbs */}
          <div className="pointer-events-none absolute -top-20 left-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />

          <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 font-mono">
              <div className="scroll-reveal scroll-delay-1 p-6 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-2xl hover:border-amber-500/30 hover:bg-white/[0.05] transition-all duration-300 group">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-white/50 uppercase tracking-widest">
                    Internal Stability
                  </span>
                  <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-amber-400 mt-3 drop-shadow-[0_0_12px_rgba(251,191,36,0.25)]">
                  +19.5°C
                </div>
                <div className="text-xs text-white/60 font-sans mt-2">
                  Constant core comfort zone
                </div>
              </div>

              <div className="scroll-reveal scroll-delay-2 p-6 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-2xl hover:border-cyan-500/30 hover:bg-white/[0.05] transition-all duration-300 group">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-white/50 uppercase tracking-widest">
                    Envelope Rating
                  </span>
                  <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-cyan-400 mt-3 drop-shadow-[0_0_12px_rgba(34,211,238,0.25)]">
                  R-82.4
                </div>
                <div className="text-xs text-white/60 font-sans mt-2">
                  m²·K/W combined barrier
                </div>
              </div>

              <div className="scroll-reveal scroll-delay-3 p-6 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-2xl hover:border-emerald-500/30 hover:bg-white/[0.05] transition-all duration-300 group">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-white/50 uppercase tracking-widest">
                    Thermal Lag
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-emerald-400 mt-3 drop-shadow-[0_0_12px_rgba(52,211,153,0.25)]">
                  11.4h
                </div>
                <div className="text-xs text-white/60 font-sans mt-2">
                  Nighttime radiant release
                </div>
              </div>

              <div className="scroll-reveal scroll-delay-4 p-6 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-2xl hover:border-white/30 hover:bg-white/[0.05] transition-all duration-300 group">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-white/50 uppercase tracking-widest">
                    Auxiliary Fuel
                  </span>
                  <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-white mt-3 drop-shadow-[0_0_12px_rgba(255,255,255,0.25)]">
                  0.0 L
                </div>
                <div className="text-xs text-white/60 font-sans mt-2">
                  100% passive solar autonomy
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Visual Cross-Section & How It Works with Scroll Reveal */}
        <section className="py-24 border-b border-white/10 relative overflow-hidden" id="how-it-works">
          {/* Subtle glow background */}
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px]" />

          <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
            <div className="scroll-reveal flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-widest text-amber-400 border border-amber-500/20 bg-amber-500/10 backdrop-blur-md mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  System Diagram
                </div>
                <h2
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight"
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
                    FROZEN GLACIER BEDROCK (-45°C)
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
                  <text fill="#38bdf8" fontFamily="monospace" fontSize="9" fontWeight="600" x="185" y="322" letterSpacing="0.5">
                    AEROGEL THERMAL ISOLATION BREAK (R-40)
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
                    x="422"
                    y="222"
                    letterSpacing="1"
                  >
                    TROMBE
                  </text>
                  <text fill="#fbbf24" fontFamily="monospace" fontSize="9" x="422" y="238" letterSpacing="0.5">
                    HEAT CORE
                  </text>
                  <text
                    fill="#fef08a"
                    fontFamily="monospace"
                    fontSize="11"
                    fontWeight="700"
                    x="422"
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
                    y="215"
                    letterSpacing="0.5"
                  >
                    HABITATION CORE
                  </text>
                  <text
                    fill="#fbbf24"
                    fontFamily="monospace"
                    fontSize="12"
                    fontWeight="700"
                    x="180"
                    y="240"
                  >
                    STABLE: +19.5°C
                  </text>
                  <text fill="#94a3b8" fontFamily="monospace" fontSize="9" x="180" y="260">
                    RELATIVE HUMIDITY: 42%
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
                      x="505"
                      y="45"
                      letterSpacing="0.5"
                    >
                      45° WINTER SUN VECTOR
                    </text>
                    <text fill="#fef08a" fontFamily="monospace" fontSize="9" x="505" y="60">
                      1,120 W/m² HIGH-ALTITUDE FLUX
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
                    WARM CONVECTIVE AIRFLOW
                  </text>

                  <path
                    d="M 200 295 C 230 315, 370 315, 430 295"
                    stroke="#38bdf8"
                    strokeDasharray="4 3"
                    strokeWidth="1.5"
                  />
                  <polygon fill="#38bdf8" points="430,295 422,301 423,291" />
                  <text fill="#38bdf8" fontFamily="monospace" fontSize="8" fontWeight="600" x="250" y="325" letterSpacing="0.5">
                    SUB-FLOOR RECOVERY PLENUM
                  </text>
                </svg>
              </div>

              {/* 3 Step Summary Cards Below Diagram */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8 font-mono">
                <div className="scroll-reveal scroll-delay-1 p-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl hover:border-amber-500/30 hover:bg-white/[0.05] transition-all duration-300">
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/20 mb-3">
                    01 / SOLAR ABSORPTION
                  </div>
                  <div className="text-base font-semibold text-white mb-2 font-sans">
                    Triple-Glazed South Facade
                  </div>
                  <div className="text-xs text-white/60 font-sans leading-relaxed">
                    Captures up to 14.8 kWh/m² daily solar radiation directly through low-iron
                    high-transmittance glazing.
                  </div>
                </div>

                <div className="scroll-reveal scroll-delay-2 p-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl hover:border-cyan-500/30 hover:bg-white/[0.05] transition-all duration-300">
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 mb-3">
                    02 / SENSIBLE STORAGE
                  </div>
                  <div className="text-base font-semibold text-white mb-2 font-sans">
                    Phase-Change Trombe Core
                  </div>
                  <div className="text-xs text-white/60 font-sans leading-relaxed">
                    3,200 kg paraffin-basalt matrix locks latent thermal energy at 21°C, preventing
                    daytime overheating.
                  </div>
                </div>

                <div className="scroll-reveal scroll-delay-3 p-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl hover:border-emerald-500/30 hover:bg-white/[0.05] transition-all duration-300">
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 mb-3">
                    03 / NIGHTTIME RELEASE
                  </div>
                  <div className="text-base font-semibold text-white mb-2 font-sans">
                    11.4-Hour Radiant Phase Shift
                  </div>
                  <div className="text-xs text-white/60 font-sans leading-relaxed">
                    Releases warm radiant heat between 02:00 and 06:00 during peak sub-zero
                    temperatures.
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
              className="object-cover object-center opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-[#070b14]/75 to-[#070b14] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#070b14]/95 via-[#070b14]/70 to-transparent lg:w-3/4 pointer-events-none" />
            <div className="absolute inset-0 cad-grid opacity-15 pointer-events-none" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
            <div className="scroll-reveal max-w-2xl space-y-4 mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-widest text-cyan-400 border border-cyan-500/20 bg-cyan-500/10 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                Night Autonomy & Telemetry
              </div>
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                Surviving the <span className="text-cyan-400"> -50°C</span> Alpine Night.
                <br />
                Zero Active Generators.
              </h2>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-sans">
                When the sun dips below the Himalayan ridges, ambient temperatures plummet to
                deadly sub-zero levels. Thermo Shelter maintains thermal equilibrium through its
                11.4-hour calibrated thermal lag, slowly radiating daytime solar warmth through the
                living core.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
              <div className="scroll-reveal scroll-delay-1 border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] hover:border-amber-500/30 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl transition-all duration-300 flex flex-col justify-between group">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-base mb-6 shadow-[0_0_20px_rgba(251,191,36,0.15)]">
                    11.4h
                  </div>
                  <h3 className="text-lg font-bold text-white font-sans uppercase mb-2">
                    Calibrated Radiant Lag
                  </h3>
                  <p className="text-xs text-white/60 font-sans leading-relaxed">
                    Heat gathered during daylight hours takes exactly 11.4 hours to conduct through the
                    Trombe core, peaking radiation right during the coldest pre-dawn hours (03:00 to
                    06:00).
                  </p>
                </div>
                <div className="mt-6 pt-5 border-t border-white/10 flex justify-between items-center text-xs">
                  <span className="text-white/50">Core Temp Drop:</span>
                  <span className="text-emerald-400 font-bold drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]">
                    &lt; 1.8°C / 12h
                  </span>
                </div>
              </div>

              <div className="scroll-reveal scroll-delay-2 border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] hover:border-cyan-500/30 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl transition-all duration-300 flex flex-col justify-between group">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-base mb-6 shadow-[0_0_20px_rgba(34,211,238,0.15)]">
                    R-82
                  </div>
                  <h3 className="text-lg font-bold text-white font-sans uppercase mb-2">
                    Aerogel Vacuum Shell
                  </h3>
                  <p className="text-xs text-white/60 font-sans leading-relaxed">
                    Multi-layer insulation sandwich combining silica aerogel (k=0.014 W/mK) and
                    reflective radiation barriers completely halts conductive, convective, and
                    infrared heat loss.
                  </p>
                </div>
                <div className="mt-6 pt-5 border-t border-white/10 flex justify-between items-center text-xs">
                  <span className="text-white/50">Thermal Transmittance:</span>
                  <span className="text-cyan-400 font-bold drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
                    0.012 W/m²K
                  </span>
                </div>
              </div>

              <div className="scroll-reveal scroll-delay-3 border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] hover:border-emerald-500/30 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl transition-all duration-300 flex flex-col justify-between group">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-base mb-6 shadow-[0_0_20px_rgba(52,211,153,0.15)]">
                    0.0L
                  </div>
                  <h3 className="text-lg font-bold text-white font-sans uppercase mb-2">
                    100% Passive Autonomy
                  </h3>
                  <p className="text-xs text-white/60 font-sans leading-relaxed">
                    Eliminates catastrophic dependency on supply lines for kerosene or diesel in
                    inaccessible alpine zones, preventing carbon monoxide poisoning and mechanical
                    freezing failures.
                  </p>
                </div>
                <div className="mt-6 pt-5 border-t border-white/10 flex justify-between items-center text-xs">
                  <span className="text-white/50">Expedition Fuel Saved:</span>
                  <span className="text-emerald-400 font-bold drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]">
                    1,800 L / winter
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
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-widest text-amber-400 border border-amber-500/20 bg-amber-500/10 backdrop-blur-md mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Extreme Test Stations
                </div>
                <h2
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight"
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
                      <h3 className="text-2xl font-bold text-white font-sans mt-1">Siachen Ridge</h3>
                      <div className="text-xs text-white/50 mt-0.5">Karakoram · 5,400m AMSL</div>
                    </div>
                    <span className="px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-[10px] font-bold tracking-wider flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                      ACTIVE
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
                  href="/3d"
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
                      <h3 className="text-2xl font-bold text-white font-sans mt-1">Spiti Plateau</h3>
                      <div className="text-xs text-white/50 mt-0.5">Himalayas · 4,500m AMSL</div>
                    </div>
                    <span className="px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-[10px] font-bold tracking-wider flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                      ACTIVE
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
                  href="/3d"
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
                      <h3 className="text-2xl font-bold text-white font-sans mt-1">High Andes</h3>
                      <div className="text-xs text-white/50 mt-0.5">Ecuador · 5,200m AMSL</div>
                    </div>
                    <span className="px-3 py-1 rounded-full border border-white/20 bg-white/5 text-white/80 text-[10px] font-bold tracking-wider">
                      VERIFIED
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
                  href="/3d"
                  className="mt-8 w-full text-center rounded-full border border-white/15 bg-white/[0.06] hover:bg-white hover:text-slate-950 text-white py-3 text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-md group-hover:border-white/30"
                >
                  Simulate Andes →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Clean Interactive CTA Banner with Scroll Reveal */}
        <section className="py-24 relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-6">
            <div className="scroll-reveal-scale relative rounded-3xl p-12 sm:p-20 border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] backdrop-blur-2xl shadow-2xl text-center overflow-hidden">
              {/* Radial ambient glow */}
              <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/15 rounded-full blur-[100px]" />
              <div className="pointer-events-none absolute -bottom-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]" />

              <div className="relative z-10 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-widest text-amber-400 border border-amber-500/20 bg-amber-500/10 backdrop-blur-md">
                  Real-Time Architectural Simulation
                </div>
                <h2
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight max-w-2xl mx-auto"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  Test and configure your shelter in real time.
                </h2>
                <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-sans">
                  Rotate orientations, adjust aerogel thicknesses, load live weather coordinates, and
                  inspect the transient energy response instantly.
                </p>
                <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4 font-mono">
                  <Link
                    href="/3d"
                    className="rounded-full bg-white hover:bg-slate-100 text-slate-950 font-bold px-10 sm:px-12 py-4 text-xs sm:text-sm tracking-widest uppercase transition-all shadow-2xl hover:scale-105 inline-flex items-center gap-2"
                  >
                    <span>Launch 3D Simulator</span>
                    <span className="text-base">→</span>
                  </Link>
                  <Link
                    href="/simulate"
                    className="rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold px-8 sm:px-10 py-4 text-xs sm:text-sm tracking-widest uppercase transition-all shadow-lg backdrop-blur-md inline-flex items-center gap-2"
                  >
                    <span>24h Regional Sim</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 8. Clean Minimalist Footer */}
      <footer className="border-t border-white/10 bg-[#050810]/90 backdrop-blur-xl py-10 px-6 lg:px-12 text-slate-400 font-mono text-xs relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="text-white font-bold tracking-wider">TS-1 // THERMO SHELTER</span>
            <span className="text-white/30">|</span>
            <span className="text-white/50">PASSIVE SOLAR ALPINE ARCHITECTURE</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <Link href="/3d" className="text-amber-400 hover:text-amber-300 font-semibold transition-colors">
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
              Field Stations
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}