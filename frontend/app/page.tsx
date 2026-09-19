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

        {/* 3. Engineering Principles & Heat Flow */}
        <section className="py-24 sm:py-32 border-b border-white/10 relative overflow-hidden" id="how-it-works">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
            {/* Editorial Section Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
              <div>
                <div className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold mb-2">
                  Thermodynamic Architecture
                </div>
                <h2
                  className="text-3xl sm:text-4xl lg:text-5xl font-light text-white tracking-tight"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  Passive Solar Heat Flow Principles
                </h2>
              </div>
              <p className="text-slate-300 text-sm sm:text-base max-w-md leading-relaxed font-sans">
                Sub-zero survival without diesel generators. Low-angle Himalayan sunlight is captured, stored within dense thermal mass, and distributed continuously through natural gravity convection.
              </p>
            </div>

            {/* Clean 4-Pillar Editorial Architecture Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="space-y-3 border-t border-white/15 pt-6">
                <div className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
                  01 // Solar Aperture
                </div>
                <h3 className="text-xl font-normal text-white">
                  Triple-Glazed South Facade
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed font-sans">
                  Optimized tilt capturing low-angle winter sun. High-transmittance low-iron glass maximizes direct solar gain while halting longwave infrared radiation from escaping back into the atmosphere.
                </p>
              </div>

              <div className="space-y-3 border-t border-white/15 pt-6">
                <div className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                  02 // Thermal Mass Core
                </div>
                <h3 className="text-xl font-normal text-white">
                  Calibrated Trombe Lag
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed font-sans">
                  High heat-capacity basalt and phase-change storage absorbing daytime heat spikes, creating an 11.4-hour calibrated phase shift that releases steady warmth during the coldest pre-dawn hours.
                </p>
              </div>

              <div className="space-y-3 border-t border-white/15 pt-6">
                <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                  03 // Aerogel Envelope
                </div>
                <h3 className="text-xl font-normal text-white">
                  Thermal Bridge Isolation
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed font-sans">
                  Continuous vacuum-insulated aerogel barrier (R-82 combined rating) severing conductive heat pathways to frozen bedrock and glacial winds, completely eliminating cold bridging.
                </p>
              </div>

              <div className="space-y-3 border-t border-white/15 pt-6">
                <div className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold">
                  04 // Gravity Convection
                </div>
                <h3 className="text-xl font-normal text-white">
                  Autonomous Air Loop
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed font-sans">
                  Zero electrical fans. Density differentials drive natural thermosiphoning: warm air rises through the living space while cooler air returns to the sub-floor solar plenum for continuous reheating.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Immersive Night Thermal Autonomy Section */}
        <section
          id="night-autonomy"
          className="relative min-h-[720px] lg:min-h-[820px] py-32 lg:py-40 border-b border-white/10 flex items-center overflow-hidden"
        >
          {/* Panoramic Night Alpine Photography */}
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
            {/* Soft dark vignette on the right to keep unboxed typography readable against the sky */}
            <div className="absolute inset-y-0 right-0 w-full lg:w-3/5 bg-gradient-to-l from-[#070b14]/85 via-[#070b14]/40 to-transparent pointer-events-none" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full">
            {/* Clean Unboxed Right-Aligned Narrative */}
            <div className="lg:ml-auto max-w-xl space-y-6">
              <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
                Autonomous Night Survival
              </div>
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-normal text-white tracking-tight leading-tight drop-shadow-lg"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                Surviving the <span className="text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]">-50°C</span> Alpine Night.
                <br />
                Zero Active Generators.
              </h2>
              <p className="text-slate-200 text-base sm:text-lg leading-relaxed font-sans drop-shadow-md">
                When the sun dips below the Himalayan ridges, ambient temperatures plummet to deadly sub-zero levels. Thermo Shelter maintains thermal equilibrium through its 11.4-hour calibrated thermal lag, slowly radiating daytime solar warmth through the living core.
              </p>

              {/* Minimal Unboxed Telemetry Line (Zero cards, zero boxes) */}
              <div className="pt-6 border-t border-white/20 grid grid-cols-3 gap-6 font-mono text-xs">
                <div>
                  <div className="text-amber-400 font-bold text-lg sm:text-xl">11.4h</div>
                  <div className="text-white/60 text-[11px] mt-1 font-sans">Radiant Thermal Lag</div>
                </div>
                <div>
                  <div className="text-cyan-400 font-bold text-lg sm:text-xl">R-82</div>
                  <div className="text-white/60 text-[11px] mt-1 font-sans">Aerogel Shell</div>
                </div>
                <div>
                  <div className="text-emerald-400 font-bold text-lg sm:text-xl">0.0 L</div>
                  <div className="text-white/60 text-[11px] mt-1 font-sans">Diesel / Kerosene</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Regional Alpine Validations */}
        <section className="py-24 sm:py-32 border-b border-white/10 relative overflow-hidden" id="deployments">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
              <div>
                <div className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold mb-2">
                  Regional Climate Profiles
                </div>
                <h2
                  className="text-3xl sm:text-4xl lg:text-5xl font-normal text-white tracking-tight"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  Validated for Extreme Himalayan Climates
                </h2>
              </div>
              <p className="text-slate-300 text-sm sm:text-base max-w-md leading-relaxed font-sans">
                Calibrated against long-term ERA5 meteorological datasets across glaciated passes, high-altitude military ridges, and cold desert plateaus.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Siachen */}
              <div className="border-t border-white/15 pt-6 flex flex-col justify-between space-y-6">
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
                    Station 01 // Glacial Ridge
                  </div>
                  <h3 className="text-2xl font-normal text-white mt-1">Siachen Ridge</h3>
                  <div className="text-xs text-white/50 font-mono mt-0.5">Karakoram · 5,400m AMSL</div>

                  <div className="space-y-3 text-xs pt-5 mt-4 border-t border-white/10 font-mono">
                    <div className="flex justify-between items-center">
                      <span className="text-white/50">Extreme Low:</span>
                      <span className="text-cyan-400 font-semibold">-54.8°C</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/50">Passive Living Core:</span>
                      <span className="text-amber-400 font-semibold">+18.5°C</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/50">Auxiliary Fuel:</span>
                      <span className="text-emerald-400 font-bold">0.0 Liters</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/3d"
                  className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-amber-400 hover:text-amber-300 transition-colors"
                >
                  <span>Simulate Siachen Architecture</span>
                  <span>→</span>
                </Link>
              </div>

              {/* Spiti */}
              <div className="border-t border-white/15 pt-6 flex flex-col justify-between space-y-6">
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                    Station 02 // Cold Plateau
                  </div>
                  <h3 className="text-2xl font-normal text-white mt-1">Spiti Valley</h3>
                  <div className="text-xs text-white/50 font-mono mt-0.5">Himachal · 4,500m AMSL</div>

                  <div className="space-y-3 text-xs pt-5 mt-4 border-t border-white/10 font-mono">
                    <div className="flex justify-between items-center">
                      <span className="text-white/50">Solar Insolation:</span>
                      <span className="text-amber-400 font-semibold">2,140 kWh/m²</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/50">Thermal Phase Lag:</span>
                      <span className="text-white font-semibold">11.4 Hours</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/50">Solar Autonomy:</span>
                      <span className="text-emerald-400 font-bold">100% Winter</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/3d"
                  className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <span>Simulate Spiti Architecture</span>
                  <span>→</span>
                </Link>
              </div>

              {/* Ladakh */}
              <div className="border-t border-white/15 pt-6 flex flex-col justify-between space-y-6">
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                    Station 03 // High Desert
                  </div>
                  <h3 className="text-2xl font-normal text-white mt-1">Leh / Ladakh</h3>
                  <div className="text-xs text-white/50 font-mono mt-0.5">Trans-Himalayas · 3,500m AMSL</div>

                  <div className="space-y-3 text-xs pt-5 mt-4 border-t border-white/10 font-mono">
                    <div className="flex justify-between items-center">
                      <span className="text-white/50">Winter Solar Window:</span>
                      <span className="text-amber-400 font-semibold">8.5 h / day</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/50">Internal Stability:</span>
                      <span className="text-white font-semibold">+19.2°C Core</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/50">Diesel Displacement:</span>
                      <span className="text-emerald-400 font-bold">10,950 L / yr</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/3d"
                  className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <span>Simulate Ladakh Architecture</span>
                  <span>→</span>
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
                href="/3d"
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