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
    <div className="relative w-full h-full min-h-[380px] rounded-2xl overflow-hidden border border-white/10 bg-[#070b14] flex flex-col">
      {/* Top Header */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto bg-[#070b14]/90 backdrop-blur-md border border-white/15 px-3 py-1 rounded-lg text-xs font-mono text-slate-300">
          OpenStreetMap
        </div>
        <div className="pointer-events-auto bg-[#070b14]/90 backdrop-blur-md border border-white/15 px-3 py-1 rounded-lg text-xs font-mono text-slate-300">
          {latitude.toFixed(5)}°N, {longitude.toFixed(5)}°E
        </div>
      </div>

      {/* Map Embed */}
      <div className="relative flex-1 w-full h-full min-h-[340px] bg-slate-900">
        <iframe
          title={`Map for ${locationName || "site"}`}
          src={osmEmbedUrl}
          className="w-full h-full border-0 absolute inset-0"
          loading="lazy"
        />
      </div>

      {/* Bottom Bar */}
      <div className="relative z-10 px-4 py-2.5 bg-[#0a0f1d] border-t border-white/10 flex items-center justify-between text-xs">
        <span className="truncate max-w-[260px] text-slate-300 font-medium">
          {locationName || "Site coordinates"}
        </span>
        <a
          href={osmDirectUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 hover:text-cyan-300 transition font-mono text-[11px]"
        >
          Open map ↗
        </a>
      </div>
    </div>
  );
}
