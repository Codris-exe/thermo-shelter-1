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

  useEffect(() => {
    const elements = document.querySelectorAll(".scroll-reveal, .scroll-reveal-scale");
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
          } else {
            entry.target.classList.remove("is-revealed");
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
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
          className="py-12 border-b border-slate-200 dark:border-white/10 bg-white/70 dark:bg-[#070b14]/70 backdrop-blur-sm"
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
              <div className="scroll-reveal scroll-delay-1 p-5 border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b1120]/80 rounded-xl shadow-sm">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Internal Stability
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-amber-700 dark:text-amber-400 mt-2">+19.5°C</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Constant core comfort zone</div>
              </div>

              <div className="scroll-reveal scroll-delay-2 p-5 border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b1120]/80 rounded-xl shadow-sm">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Envelope Rating
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-sky-700 dark:text-cyan-400 mt-2">R-82.4</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">m²·K/W combined barrier</div>
              </div>

              <div className="scroll-reveal scroll-delay-3 p-5 border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b1120]/80 rounded-xl shadow-sm">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Thermal Lag
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-emerald-700 dark:text-emerald-400 mt-2">11.4h</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Nighttime radiant release</div>
              </div>

              <div className="scroll-reveal scroll-delay-4 p-5 border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b1120]/80 rounded-xl shadow-sm">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Auxiliary Fuel
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">0.0 L</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">100% passive solar autonomy</div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Visual Cross-Section & How It Works with Scroll Reveal */}
        <section className="py-20 border-b border-slate-200 dark:border-white/10" id="how-it-works">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="scroll-reveal flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <div className="text-xs font-mono uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-2 font-semibold">
                  System Diagram
                </div>
                <h2
                  className="text-3xl sm:text-4xl font-bold text-slate-950 dark:text-white tracking-tight"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  Passive Solar Heat Flow Architecture
                </h2>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm max-w-md leading-relaxed">
                How low-angle winter sunlight is gathered, stored in high-density phase-change
                materials, and circulated continuously through natural gravity convection.
              </p>
            </div>

            {/* Clean SVG Cross-Section Illustration */}
            <div className="scroll-reveal-scale border border-slate-200 dark:border-white/10 bg-white dark:bg-[#090e1b] shadow-md rounded-2xl overflow-hidden p-6 sm:p-8">
              <div className="relative w-full aspect-[16/9] max-h-[460px] bg-slate-50 dark:bg-[#050810] border border-slate-200 dark:border-white/5 rounded-xl p-4 flex items-center justify-center cad-grid-dense">
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
                <div className="scroll-reveal scroll-delay-1 p-4 border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#070b14] rounded-xl">
                  <div className="text-amber-700 dark:text-amber-400 font-bold text-xs uppercase mb-1">
                    01 / SOLAR ABSORPTION
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Triple-Glazed South Facade
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Captures up to 14.8 kWh/m² daily solar radiation directly through low-iron
                    high-transmittance glazing.
                  </div>
                </div>

                <div className="scroll-reveal scroll-delay-2 p-4 border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#070b14] rounded-xl">
                  <div className="text-sky-700 dark:text-cyan-400 font-bold text-xs uppercase mb-1">
                    02 / SENSIBLE STORAGE
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Phase-Change Trombe Core
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    3,200 kg paraffin-basalt matrix locks latent thermal energy at 21°C, preventing
                    daytime overheating.
                  </div>
                </div>

                <div className="scroll-reveal scroll-delay-3 p-4 border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#070b14] rounded-xl">
                  <div className="text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase mb-1">
                    03 / NIGHTTIME RELEASE
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    11.4-Hour Radiant Phase Shift
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
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
          className="relative py-24 lg:py-32 border-b border-slate-200 dark:border-white/10 overflow-hidden"
        >
          {/* Real Generated Night Photo with Milky Way and Glowing Shelter */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <Image
              src="/images/night-thermal-shelter.jpg"
              alt="Himalayan research station shelter under the Milky Way with glowing thermal core"
              fill
              className="object-cover object-center opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#f8fafc] via-white/50 to-[#f8fafc] dark:from-[#070b14] dark:via-[#070b14]/70 dark:to-[#070b14] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/60 to-transparent dark:from-[#070b14]/90 dark:via-[#070b14]/60 dark:to-transparent lg:w-3/4 pointer-events-none" />
            <div className="absolute inset-0 cad-grid opacity-20 pointer-events-none" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
            <div className="scroll-reveal max-w-2xl space-y-4 mb-16">
              <div className="text-xs font-mono uppercase tracking-widest text-amber-700 dark:text-amber-400 font-semibold">
                Night Autonomy & Telemetry
              </div>
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-950 dark:text-white tracking-tight leading-tight"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                Surviving the <span className="text-sky-700 dark:text-cyan-400">-50°C</span> Alpine Night.
                <br />
                Zero Active Generators.
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
                When the sun dips below the Himalayan ridges, ambient temperatures plummet to
                deadly sub-zero levels. Thermo Shelter 1 maintains thermal equilibrium through its
                11.4-hour calibrated thermal lag, slowly radiating daytime solar warmth through the
                living core.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
              <div className="scroll-reveal scroll-delay-1 border border-slate-200 dark:border-white/15 bg-white/95 dark:bg-[#090e1b]/85 backdrop-blur-md rounded-2xl p-6 corner-bracket shadow-sm">
                <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center text-amber-700 dark:text-amber-400 font-bold text-sm mb-4">
                  11.4h
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase mb-2">
                  Calibrated Radiant Lag
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Heat gathered during daylight hours takes exactly 11.4 hours to conduct through the
                  Trombe core, peaking radiation right during the coldest pre-dawn hours (03:00 to
                  06:00).
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/10 flex justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400">Core Temp Drop:</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">&lt; 1.8°C / 12h</span>
                </div>
              </div>

              <div className="scroll-reveal scroll-delay-2 border border-slate-200 dark:border-white/15 bg-white/95 dark:bg-[#090e1b]/85 backdrop-blur-md rounded-2xl p-6 corner-bracket shadow-sm">
                <div className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-cyan-500/10 border border-sky-200 dark:border-cyan-500/30 flex items-center justify-center text-sky-700 dark:text-cyan-400 font-bold text-sm mb-4">
                  R-82
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase mb-2">
                  Aerogel Vacuum Shell
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Multi-layer insulation sandwich combining silica aerogel (k=0.014 W/mK) and
                  reflective radiation barriers completely halts conductive, convective, and
                  infrared heat loss.
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/10 flex justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400">Thermal Transmittance:</span>
                  <span className="text-sky-700 dark:text-cyan-400 font-bold">0.012 W/m²K</span>
                </div>
              </div>

              <div className="scroll-reveal scroll-delay-3 border border-slate-200 dark:border-white/15 bg-white/95 dark:bg-[#090e1b]/85 backdrop-blur-md rounded-2xl p-6 corner-bracket shadow-sm">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold text-sm mb-4">
                  0.0L
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase mb-2">
                  100% Passive Autonomy
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Eliminates catastrophic dependency on supply lines for kerosene or diesel in
                  inaccessible alpine zones, preventing carbon monoxide poisoning and mechanical
                  freezing failures.
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/10 flex justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400">Expedition Fuel Saved:</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">1,800 L / winter</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Proven Field Deployments with Scroll Reveal */}
        <section className="py-20 border-b border-slate-200 dark:border-white/10" id="deployments">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="scroll-reveal flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <div className="text-xs font-mono uppercase tracking-widest text-amber-700 dark:text-amber-400 font-semibold mb-2">
                  Extreme Test Stations
                </div>
                <h2
                  className="text-3xl sm:text-4xl font-bold text-slate-950 dark:text-white tracking-tight"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  Validated in the World&apos;s Harshest Climates
                </h2>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm max-w-md leading-relaxed">
                Tested and verified across glaciated ridges, cold desert plateaus, and equatorial
                alpine summits.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
              {/* Siachen */}
              <div className="scroll-reveal scroll-delay-1 border border-slate-200 dark:border-white/10 bg-white dark:bg-[#090e1b] shadow-sm rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-amber-700 dark:text-amber-400 text-xs font-bold uppercase">Station 01</div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">Siachen Ridge</h3>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Karakoram · 5,400m AMSL</div>
                    </div>
                    <span className="px-2 py-0.5 border border-amber-300 dark:border-amber-400/30 bg-amber-50 dark:bg-amber-400/10 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                      ACTIVE
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 pt-4 border-t border-slate-100 dark:border-white/10">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Record Ambient:</span>
                      <span className="font-semibold text-sky-700 dark:text-cyan-400">-54.8°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Interior Stable:</span>
                      <span className="font-semibold text-amber-700 dark:text-amber-400">+19.2°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Katabatic Wind:</span>
                      <span className="text-slate-800 dark:text-slate-200">280 km/h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Fuel Burn:</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">0.0 Liters</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/3d"
                  className="mt-6 w-full text-center chamfer-btn border border-slate-300 dark:border-white/20 hover:border-amber-600 dark:hover:border-amber-400 bg-slate-50 dark:bg-transparent hover:bg-white dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-400 py-2.5 text-xs font-bold uppercase transition-colors"
                >
                  Simulate Siachen
                </Link>
              </div>

              {/* Spiti */}
              <div className="scroll-reveal scroll-delay-2 border border-slate-200 dark:border-white/10 bg-white dark:bg-[#090e1b] shadow-sm rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-sky-700 dark:text-cyan-400 text-xs font-bold uppercase">Station 02</div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">Spiti Plateau</h3>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Himalayas · 4,500m AMSL</div>
                    </div>
                    <span className="px-2 py-0.5 border border-sky-300 dark:border-cyan-400/30 bg-sky-50 dark:bg-cyan-400/10 text-sky-800 dark:text-cyan-300 text-[10px] font-bold">
                      ACTIVE
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 pt-4 border-t border-slate-100 dark:border-white/10">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Annual Solar Flux:</span>
                      <span className="font-semibold text-amber-700 dark:text-amber-400">2,140 kWh/m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Glazing SHGC:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">0.68</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Seismic Zone:</span>
                      <span className="text-slate-800 dark:text-slate-200">Zone V (M8.2)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Autonomy:</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">100% Year-Round</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/3d"
                  className="mt-6 w-full text-center chamfer-btn border border-slate-300 dark:border-white/20 hover:border-sky-600 dark:hover:border-cyan-400 bg-slate-50 dark:bg-transparent hover:bg-white dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 hover:text-sky-700 dark:hover:text-cyan-400 py-2.5 text-xs font-bold uppercase transition-colors"
                >
                  Simulate Spiti
                </Link>
              </div>

              {/* Andes */}
              <div className="scroll-reveal scroll-delay-3 border border-slate-200 dark:border-white/10 bg-white dark:bg-[#090e1b] shadow-sm rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">Station 03</div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">High Andes</h3>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Ecuador · 5,200m AMSL</div>
                    </div>
                    <span className="px-2 py-0.5 border border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                      VERIFIED
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 pt-4 border-t border-slate-100 dark:border-white/10">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Solar UV Index:</span>
                      <span className="font-semibold text-amber-700 dark:text-amber-400">Index 22 (Extreme)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Interior Temp:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">+18.8°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Assembly Time:</span>
                      <span className="text-slate-800 dark:text-slate-200">72 Hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Autonomy Record:</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">99.4%</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/3d"
                  className="mt-6 w-full text-center chamfer-btn border border-slate-300 dark:border-white/20 hover:border-slate-500 dark:hover:border-white bg-slate-50 dark:bg-transparent hover:bg-white dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white py-2.5 text-xs font-bold uppercase transition-colors"
                >
                  Simulate Andes
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Clean Interactive CTA Banner with Scroll Reveal */}
        <section className="scroll-reveal-scale py-20 bg-slate-100 dark:bg-gradient-to-b dark:from-[#070b14] dark:to-[#090e1b] border-b border-slate-200 dark:border-white/10">
          <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-950 dark:text-white tracking-tight"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              Test and configure your shelter in real time.
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
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
      <footer className="border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#050810] py-8 px-6 lg:px-12 text-slate-500 dark:text-slate-400 font-mono text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-slate-800 dark:text-white font-bold mr-2">TS-1 // THERMO SHELTER</span>
            <span>© 2025 PASSIVE SOLAR ALPINE ARCHITECTURE</span>
          </div>

          <div className="flex items-center gap-6">
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