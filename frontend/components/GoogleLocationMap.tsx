"use client";

import { useEffect, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";

interface Props {
  latitude: number;
  longitude: number;
  zoom?: number;
}

export default function GoogleLocationMap({
  latitude,
  longitude,
  zoom = 17,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadMap() {
      if (!containerRef.current) return;

      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) return;

      const loader = new Loader({
        apiKey,
        version: "weekly",
      });

      const google = await loader.load();
      if (cancelled || !containerRef.current) return;

      const position = { lat: latitude, lng: longitude };

      if (!mapRef.current) {
        mapRef.current = new google.maps.Map(containerRef.current, {
          center: position,
          zoom,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          gestureHandling: "greedy",
        });

        markerRef.current = new google.maps.Marker({
          map: mapRef.current,
          position,
          title: "Selected land location",
        });
      } else {
        mapRef.current.setCenter(position);
        mapRef.current.setZoom(zoom);
        markerRef.current?.setPosition(position);
      }
    }

    void loadMap().catch((error) => {
      console.error("Google Maps load error:", error);
    });

    return () => {
      cancelled = true;
    };
  }, [latitude, longitude, zoom]);

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="flex h-full min-h-[360px] items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 text-center text-sm text-amber-300">
        Google Maps is not configured yet. Add
        NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to frontend/.env.local.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-full min-h-[360px] w-full overflow-hidden rounded-2xl"
    />
  );
}
