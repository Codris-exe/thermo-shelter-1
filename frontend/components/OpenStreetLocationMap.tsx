"use client";

import { useMemo } from "react";

interface Props {
  latitude: number;
  longitude: number;
  zoom?: number;
  locationName?: string;
}

export default function OpenStreetLocationMap({
  latitude,
  longitude,
  zoom = 15,
  locationName,
}: Props) {
  // Compute bounding box for OpenStreetMap embed iframe
  // Delta approx: 0.012 deg lon, 0.008 deg lat for ~zoom 15
  const bbox = useMemo(() => {
    const deltaLon = 0.012;
    const deltaLat = 0.008;
    const minLon = (longitude - deltaLon).toFixed(5);
    const minLat = (latitude - deltaLat).toFixed(5);
    const maxLon = (longitude + deltaLon).toFixed(5);
    const maxLat = (latitude + deltaLat).toFixed(5);
    return `${minLon}%2C${minLat}%2C${maxLon}%2C${maxLat}`;
  }, [latitude, longitude]);

  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude}%2C${longitude}`;
  const osmDirectUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=${zoom}/${latitude}/${longitude}`;

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-3xl overflow-hidden border border-white/15 bg-[#070b14] flex flex-col shadow-2xl">
      {/* Top Map Header Pill */}
      <div className="absolute top-3.5 left-3.5 right-3.5 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="pointer-events-auto bg-[#070b14]/90 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-mono text-emerald-300 font-semibold">
            OpenStreetMap Verified
          </span>
        </div>

        <div className="pointer-events-auto bg-[#070b14]/90 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full shadow-lg text-[11px] font-mono text-slate-300">
          {latitude.toFixed(5)}°N, {longitude.toFixed(5)}°E
        </div>
      </div>

      {/* Interactive OpenStreetMap iframe embed */}
      <div className="relative flex-1 w-full h-full min-h-[380px] bg-slate-900">
        <iframe
          title={`OpenStreetMap for ${locationName || "selected site"}`}
          src={osmEmbedUrl}
          className="w-full h-full border-0 absolute inset-0 filter contrast-[1.05] brightness-[0.95]"
          loading="lazy"
        />
      </div>

      {/* Bottom Information & Action Bar */}
      <div className="relative z-10 px-4 py-3 bg-[#0a0f1d]/95 backdrop-blur-md border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="text-cyan-400">📍</span>
          <span className="truncate max-w-[240px] sm:max-w-xs font-medium text-slate-200">
            {locationName || "Shelter Coordinates Positioned"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={osmDirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors inline-flex items-center gap-1 font-mono"
          >
            <span>Open in OpenStreetMap</span>
            <span>↗</span>
          </a>
        </div>
      </div>
    </div>
  );
}
