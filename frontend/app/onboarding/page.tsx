"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useShelterDesignStore } from "@/stores/shelterDesignStore";
import { authHeaders, getStoredUser, isAuthenticated } from "@/lib/auth";
import OpenStreetLocationMap from "@/components/OpenStreetLocationMap";

const API_BASE = "/backend-api";

interface SelectedLocation {
  name: string;
  latitude: number;
  longitude: number;
  elevation_m: number | null;
  timezone: string | null;
  source: "gps" | "search" | "manual";
}

interface OsmSearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const setLocation = useShelterDesignStore((state) => state.setLocation);
  const user = getStoredUser();

  // Active step/mode: "location" or "image"
  const [activeTab, setActiveTab] = useState<"location" | "image">("location");

  // Location sub-mode: "gps" | "search" | "manual"
  const [locationInputMode, setLocationInputMode] = useState<"gps" | "search" | "manual">("gps");

  // Location states
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation>({
    name: "Leh, Ladakh (Default Alpine Base)",
    latitude: 34.1526,
    longitude: 77.5771,
    elevation_m: 3524,
    timezone: "Asia/Kolkata",
    source: "manual",
  });
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<OsmSearchResult[]>([]);

  // Manual coordinate inputs
  const [manualLat, setManualLat] = useState("34.1526");
  const [manualLon, setManualLon] = useState("77.5771");
  const [manualName, setManualName] = useState("Ladakh Plateau");

  // Photo upload states
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState<{ id: string; analysis_message: string } | null>(null);

  // Messages
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Populate initial location from design store if exists
  useEffect(() => {
    const existing = sessionStorage.getItem("thermo-shelter-selected-location");
    if (existing) {
      try {
        const parsed = JSON.parse(existing);
        setSelectedLocation(parsed);
        setManualLat(parsed.latitude.toString());
        setManualLon(parsed.longitude.toString());
        setManualName(parsed.name);
      } catch {
        // use default
      }
    }
  }, []);

  // 1. Auto-detect GPS with OpenStreetMap Nominatim reverse geocoder
  function detectGpsLocation() {
    setError("");
    setSuccessMsg("");

    if (!navigator.geolocation) {
      setError("Your browser or device doesn't support GPS location access.");
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy: locationAccuracy } = position.coords;

        try {
          let name = `Site Coordinates (${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°)`;

          // Reverse geocode via OpenStreetMap Nominatim
          try {
            const osmRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
              { headers: { "Accept-Language": "en" } },
            );
            if (osmRes.ok) {
              const osmData = await osmRes.json();
              if (osmData.display_name) {
                const parts = osmData.display_name.split(",");
                name = parts.slice(0, 3).join(",").trim();
              }
            }
          } catch {
            // fallback to coordinates name
          }

          // Elevation & weather from local backend
          let elevation: number | null = null;
          let timezone: string | null = null;

          try {
            const weatherResponse = await fetch(
              `${API_BASE}/api/weather/forecast?latitude=${latitude}&longitude=${longitude}&hours=1`,
            );
            if (weatherResponse.ok) {
              const weather = await weatherResponse.json();
              elevation = weather.elevation_m ?? null;
              timezone = weather.timezone ?? null;
            }
          } catch {
            // weather optional
          }

          const loc: SelectedLocation = {
            name,
            latitude,
            longitude,
            elevation_m: elevation,
            timezone,
            source: "gps",
          };

          setSelectedLocation(loc);
          setManualLat(latitude.toFixed(5));
          setManualLon(longitude.toFixed(5));
          setManualName(name);
          setAccuracy(locationAccuracy);
          setLocation(loc);

          sessionStorage.setItem("thermo-shelter-selected-location", JSON.stringify(loc));
          setSuccessMsg(`GPS site locked: ${name} (accuracy: ±${Math.round(locationAccuracy)}m)`);
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Location detected, but we couldn't resolve the details. Please verify on the map.",
          );
        } finally {
          setIsGettingLocation(false);
        }
      },
      (locError) => {
        setIsGettingLocation(false);
        if (locError.code === locError.PERMISSION_DENIED) {
          setError(
            "GPS access was declined by the browser. You can search by town name or type your coordinates below instead.",
          );
        } else if (locError.code === locError.TIMEOUT) {
          setError("GPS satellite request timed out. Try typing your coordinates or searching below.");
        } else {
          setError("Could not retrieve GPS satellites right now. Try searching your valley or city below.");
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 },
    );
  }

  // 2. OpenStreetMap Search
  async function searchOsmLocation(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setError("");
    setSuccessMsg("");
    setIsSearching(true);
    setSearchResults([]);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery.trim())}&format=json&limit=5`,
        { headers: { "Accept-Language": "en" } },
      );
      if (!res.ok) throw new Error("Search service was temporarily unavailable.");
      const data = await res.json();
      if (!data || data.length === 0) {
        setError(`No locations found for "${searchQuery}". Try a nearby landmark, city, or coordinates.`);
      } else {
        setSearchResults(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  }

  // Select result from search
  function pickSearchResult(result: OsmSearchResult) {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    const parts = result.display_name.split(",");
    const cleanName = parts.slice(0, 3).join(",").trim();

    const loc: SelectedLocation = {
      name: cleanName,
      latitude: lat,
      longitude: lon,
      elevation_m: null,
      timezone: null,
      source: "search",
    };

    setSelectedLocation(loc);
    setManualLat(lat.toFixed(5));
    setManualLon(lon.toFixed(5));
    setManualName(cleanName);
    setLocation(loc);
    sessionStorage.setItem("thermo-shelter-selected-location", JSON.stringify(loc));
    setSearchResults([]);
    setSuccessMsg(`Site selected: ${cleanName}`);
  }

  // 3. Manual Coordinate Apply
  function applyManualCoordinates(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const lat = parseFloat(manualLat);
    const lon = parseFloat(manualLon);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      setError("Please provide a valid latitude between -90 and +90 degrees.");
      return;
    }
    if (isNaN(lon) || lon < -180 || lon > 180) {
      setError("Please provide a valid longitude between -180 and +180 degrees.");
      return;
    }

    const loc: SelectedLocation = {
      name: manualName.trim() || `Custom Site (${lat.toFixed(4)}°, ${lon.toFixed(4)}°)`,
      latitude: lat,
      longitude: lon,
      elevation_m: null,
      timezone: null,
      source: "manual",
    };

    setSelectedLocation(loc);
    setLocation(loc);
    sessionStorage.setItem("thermo-shelter-selected-location", JSON.stringify(loc));
    setSuccessMsg(`Custom coordinates applied: ${loc.name}`);
  }

  // 4. Photo Upload
  function chooseImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setError("");
    setSuccessMsg("");
    setUploaded(null);

    if (!file) {
      setImage(null);
      setPreview("");
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Please pick a standard JPG, PNG, or WEBP terrain image.");
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Please select an image smaller than 10 MB.");
      event.target.value = "";
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  async function uploadLandImage() {
    if (!image) return;

    setUploading(true);
    setError("");
    setSuccessMsg("");

    try {
      const formData = new FormData();
      formData.append("file", image);

      const response = await fetch(`${API_BASE}/api/land/upload`, {
        method: "POST",
        headers: authHeaders(),
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Site image upload could not be completed.");

      setUploaded(data);
      sessionStorage.setItem("thermo-shelter-land-image", JSON.stringify(data));
      setSuccessMsg("Site photograph attached to your station profile successfully!");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Photo upload failed. If running in guest mode, you can still proceed to the 3D simulator.",
      );
    } finally {
      setUploading(false);
    }
  }

  function launchSimulator() {
    router.push("/3d");
  }

  return (
    <main className="min-h-screen bg-[#070b14] text-slate-100 px-6 py-8 relative font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto z-10 relative">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10 font-mono text-xs">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <span className="text-cyan-400 font-bold">←</span>
            <span>Return to Overview</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-white/60">
              {user ? (
                <>
                  Logged in as <strong className="text-cyan-400">{user.name}</strong>
                </>
              ) : (
                "Guest Architect Mode"
              )}
            </span>
            <Link
              href="/3d"
              className="px-4 py-1.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/15 text-cyan-300 transition"
            >
              Skip to 3D Sim →
            </Link>
          </div>
        </div>

        {/* Hero Header */}
        <div className="mt-8 mb-8">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-mono text-cyan-400 mb-2">
            <span>Station Setup</span>
            <span className="text-white/20">/</span>
            <span>Terrain & Sun Orientation</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-normal text-white tracking-tight">
            {user ? `Let's map your site, ${user.name.split(" ")[0]}.` : "Let's map your mountain site."}
          </h1>

          <p className="mt-2 text-slate-400 max-w-3xl text-sm sm:text-base leading-relaxed">
            Passive solar performance depends on exact solar angles, horizon shadows, and mountain wind corridors.
            Pin your location on OpenStreetMap or upload a site photo to calibrate the thermal physics.
          </p>
        </div>

        {/* Top Step Navigation Tabs */}
        <div className="grid grid-cols-2 gap-3 max-w-md mb-8 font-mono text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("location")}
            className={`p-3 rounded-2xl border transition-all text-left flex items-center gap-3 ${
              activeTab === "location"
                ? "border-cyan-400/50 bg-cyan-500/15 text-white shadow-lg shadow-cyan-500/10"
                : "border-white/10 bg-white/[0.03] text-slate-400 hover:text-white"
            }`}
          >
            <span className="text-lg">🗺️</span>
            <div>
              <div className="font-bold uppercase tracking-wider text-[11px]">Step 1 · Map</div>
              <div className="text-xs text-white/70 font-sans">OpenStreetMap Site</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("image")}
            className={`p-3 rounded-2xl border transition-all text-left flex items-center gap-3 ${
              activeTab === "image"
                ? "border-violet-400/50 bg-violet-500/15 text-white shadow-lg shadow-violet-500/10"
                : "border-white/10 bg-white/[0.03] text-slate-400 hover:text-white"
            }`}
          >
            <span className="text-lg">📷</span>
            <div>
              <div className="font-bold uppercase tracking-wider text-[11px]">Step 2 · Photo</div>
              <div className="text-xs text-white/70 font-sans">Terrain & Slope Photo</div>
            </div>
          </button>
        </div>

        {/* Global Notifications */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-200 flex items-start gap-3 leading-relaxed">
            <span className="text-red-400 text-base">⚠</span>
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-200 flex items-start gap-3 leading-relaxed">
            <span className="text-emerald-400 text-base">✓</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* TAB 1: LOCATION ON OPENSTREETMAP */}
        {activeTab === "location" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Control Column */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 sm:p-7 shadow-2xl">
                <h2 className="text-lg font-semibold text-white mb-2">How would you like to set your location?</h2>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  Pick whichever is easiest for you right now:
                </p>

                {/* Sub-mode buttons */}
                <div className="grid grid-cols-3 gap-2 font-mono text-[11px] mb-6">
                  <button
                    type="button"
                    onClick={() => setLocationInputMode("gps")}
                    className={`py-2 px-2.5 rounded-xl border text-center transition ${
                      locationInputMode === "gps"
                        ? "border-cyan-400 bg-cyan-500/20 text-cyan-300 font-bold"
                        : "border-white/10 bg-white/[0.02] text-slate-400 hover:text-white"
                    }`}
                  >
                    📡 Live GPS
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocationInputMode("search")}
                    className={`py-2 px-2.5 rounded-xl border text-center transition ${
                      locationInputMode === "search"
                        ? "border-cyan-400 bg-cyan-500/20 text-cyan-300 font-bold"
                        : "border-white/10 bg-white/[0.02] text-slate-400 hover:text-white"
                    }`}
                  >
                    🔍 Search
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocationInputMode("manual")}
                    className={`py-2 px-2.5 rounded-xl border text-center transition ${
                      locationInputMode === "manual"
                        ? "border-cyan-400 bg-cyan-500/20 text-cyan-300 font-bold"
                        : "border-white/10 bg-white/[0.02] text-slate-400 hover:text-white"
                    }`}
                  >
                    ⌨️ Custom
                  </button>
                </div>

                {/* 1. GPS Mode */}
                {locationInputMode === "gps" && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-300 leading-relaxed">
                      If you are on-site in Ladakh, Spiti, or the Alps with a laptop or mobile device, tap below to request live GPS coordinates.
                    </p>

                    <button
                      type="button"
                      onClick={detectGpsLocation}
                      disabled={isGettingLocation}
                      className="w-full py-3.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isGettingLocation ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
                          <span>Requesting Satellite GPS...</span>
                        </>
                      ) : (
                        <>
                          <span>📡</span>
                          <span>Detect My Site Location</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* 2. Search Mode */}
                {locationInputMode === "search" && (
                  <form onSubmit={searchOsmLocation} className="space-y-4">
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Search any mountain town, valley, glacier pass, or region on OpenStreetMap:
                    </p>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="e.g. Leh, Kaza, Siachen, Zanskar..."
                        className="flex-1 rounded-xl border border-white/10 bg-[#070b14] px-4 py-2.5 text-xs text-white placeholder:text-slate-600 outline-none focus:border-cyan-400"
                      />
                      <button
                        type="submit"
                        disabled={isSearching}
                        className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase transition disabled:opacity-50"
                      >
                        {isSearching ? "Searching..." : "Find"}
                      </button>
                    </div>

                    {/* Quick Suggestions */}
                    <div className="pt-2">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1.5">
                        Suggested Alpine Stations:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {["Leh, Ladakh", "Kaza, Spiti", "Dras, Kargil", "Keylong, Lahaul"].map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => {
                              setSearchQuery(tag);
                              fetch(
                                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(tag)}&format=json&limit=1`,
                                { headers: { "Accept-Language": "en" } },
                              )
                                .then((r) => r.json())
                                .then((d) => {
                                  if (d && d[0]) pickSearchResult(d[0]);
                                });
                            }}
                            className="px-2.5 py-1 rounded-lg border border-white/10 bg-white/[0.04] text-[11px] text-slate-300 hover:text-white hover:border-cyan-400/40 transition"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Search Results Dropdown */}
                    {searchResults.length > 0 && (
                      <div className="mt-3 rounded-xl border border-cyan-400/30 bg-[#070b14] divide-y divide-white/10 overflow-hidden max-h-56 overflow-y-auto">
                        {searchResults.map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => pickSearchResult(item)}
                            className="w-full text-left p-3 hover:bg-cyan-500/10 transition text-xs text-slate-200 flex items-start gap-2"
                          >
                            <span className="text-cyan-400 mt-0.5">📍</span>
                            <span className="line-clamp-2">{item.display_name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </form>
                )}

                {/* 3. Manual Mode */}
                {locationInputMode === "manual" && (
                  <form onSubmit={applyManualCoordinates} className="space-y-4">
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Enter surveyed GPS coordinates directly:
                    </p>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">Site Label</label>
                      <input
                        type="text"
                        value={manualName}
                        onChange={(e) => setManualName(e.target.value)}
                        placeholder="e.g. Pangong North Shore Station"
                        className="w-full rounded-xl border border-white/10 bg-[#070b14] px-3.5 py-2 text-xs text-white outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 mb-1">Latitude (°N)</label>
                        <input
                          type="number"
                          step="0.0001"
                          value={manualLat}
                          onChange={(e) => setManualLat(e.target.value)}
                          placeholder="34.1526"
                          className="w-full rounded-xl border border-white/10 bg-[#070b14] px-3.5 py-2 text-xs text-white outline-none focus:border-cyan-400 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 mb-1">Longitude (°E)</label>
                        <input
                          type="number"
                          step="0.0001"
                          value={manualLon}
                          onChange={(e) => setManualLon(e.target.value)}
                          placeholder="77.5771"
                          className="w-full rounded-xl border border-white/10 bg-[#070b14] px-3.5 py-2 text-xs text-white outline-none focus:border-cyan-400 font-mono"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition font-mono"
                    >
                      Update OpenStreetMap Marker →
                    </button>
                  </form>
                )}

                {/* Selected Location Summary Card */}
                <div className="mt-6 pt-5 border-t border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] uppercase tracking-wider font-mono text-emerald-400 font-semibold">
                      Current Site Selected
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 uppercase">Ready</span>
                  </div>

                  <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.04] p-4 space-y-2">
                    <div className="font-semibold text-sm text-white">{selectedLocation.name}</div>
                    <div className="text-xs font-mono text-slate-400">
                      Lat: {selectedLocation.latitude.toFixed(5)}° · Lon: {selectedLocation.longitude.toFixed(5)}°
                    </div>
                    {accuracy && (
                      <div className="text-[11px] font-mono text-slate-500">
                        GPS Accuracy: ±{Math.round(accuracy)} meters
                      </div>
                    )}
                    {selectedLocation.elevation_m && (
                      <div className="text-[11px] font-mono text-cyan-300">
                        Elevation: {Math.round(selectedLocation.elevation_m)} m AMSL
                      </div>
                    )}
                  </div>
                </div>

                {/* Primary Proceed CTA */}
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={launchSimulator}
                    className="w-full py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-widest transition-all shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 hover:scale-[1.01]"
                  >
                    <span>Launch 3D Simulator With This Site</span>
                    <span className="text-base">→</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Map Column (OpenStreetMap) */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl overflow-hidden border border-white/10 bg-white/[0.02] shadow-2xl h-[560px] flex flex-col">
                <OpenStreetLocationMap
                  latitude={selectedLocation.latitude}
                  longitude={selectedLocation.longitude}
                  locationName={selectedLocation.name}
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-500 px-2">
                <div>OpenStreetMap data © OpenStreetMap contributors</div>
                <button
                  type="button"
                  onClick={() => setActiveTab("image")}
                  className="text-cyan-400 hover:text-cyan-300 font-sans text-xs underline"
                >
                  Optional: Attach Ground Photo →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SITE PHOTO UPLOAD */}
        {activeTab === "image" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 sm:p-7 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">Terrain Photograph</h2>
                  <span className="text-[11px] font-mono text-violet-300 uppercase">Station Asset</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-6">
                  Snap a clear photo of your building site slope, mountain ridge horizon, or snowline.
                  The thermal simulator pairs this with your coordinates to assess mountain shadows and solar reflection.
                </p>

                {/* Dropzone */}
                <label className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-violet-400/30 bg-violet-500/[0.03] hover:bg-violet-500/[0.06] hover:border-violet-400/60 cursor-pointer transition text-center group">
                  <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">🏔️</span>
                  <span className="text-xs font-semibold text-violet-200">
                    {image ? "Click to select a different photo" : "Select site photograph from device"}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1 font-mono">
                    JPG, PNG, or WEBP up to 10 MB
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={chooseImage}
                    className="hidden"
                  />
                </label>

                {image && (
                  <div className="mt-4 p-3 rounded-xl border border-white/10 bg-white/[0.04] text-xs font-mono flex items-center justify-between">
                    <span className="truncate max-w-[200px] text-slate-300">{image.name}</span>
                    <span className="text-slate-500">{(image.size / (1024 * 1024)).toFixed(2)} MB</span>
                  </div>
                )}

                {image && !uploaded && (
                  <button
                    type="button"
                    onClick={uploadLandImage}
                    disabled={uploading}
                    className="w-full mt-4 py-3.5 rounded-xl bg-violet-500 hover:bg-violet-400 text-white font-bold text-xs uppercase tracking-wider transition disabled:opacity-50"
                  >
                    {uploading ? "Attaching Photo..." : "Save Photo to Station Profile"}
                  </button>
                )}

                {uploaded && (
                  <div className="mt-4 p-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 text-xs text-emerald-300 space-y-1">
                    <div className="font-semibold">✓ Site Visual Stored</div>
                    <div className="text-slate-300 text-[11px]">{uploaded.analysis_message}</div>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                  <button
                    type="button"
                    onClick={launchSimulator}
                    className="w-full py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-widest transition shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
                  >
                    <span>Proceed to 3D Simulator</span>
                    <span className="text-base">→</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("location")}
                    className="w-full py-2.5 rounded-xl text-xs font-mono text-slate-400 hover:text-white transition"
                  >
                    ← Back to OpenStreetMap
                  </button>
                </div>
              </div>
            </div>

            {/* Right Photo Preview Column */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl overflow-hidden border border-white/10 bg-white/[0.02] shadow-2xl h-[560px] flex items-center justify-center p-4">
                {preview ? (
                  <div className="relative w-full h-full rounded-2xl overflow-hidden">
                    <img
                      src={preview}
                      alt="Site preview"
                      className="w-full h-full object-cover rounded-2xl"
                    />
                    <div className="absolute bottom-4 left-4 bg-[#070b14]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/15 text-[11px] font-mono text-slate-300">
                      Terrain Survey Preview
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8 text-slate-500 space-y-3 max-w-sm">
                    <div className="text-4xl opacity-40">🌄</div>
                    <div className="text-sm font-medium text-slate-400">No photo selected yet</div>
                    <p className="text-xs leading-relaxed text-slate-500">
                      When you pick or take a photo of the ground slope or valley horizon, a full-resolution preview will render here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
