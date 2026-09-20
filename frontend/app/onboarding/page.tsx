"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useShelterDesignStore } from "@/stores/shelterDesignStore";
import { authHeaders, getStoredUser } from "@/lib/auth";
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

  // Location state
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation>({
    name: "Leh, Ladakh",
    latitude: 34.1526,
    longitude: 77.5771,
    elevation_m: 3524,
    timezone: "Asia/Kolkata",
    source: "manual",
  });

  const [latInput, setLatInput] = useState("34.1526");
  const [lonInput, setLonInput] = useState("77.5771");
  const [nameInput, setNameInput] = useState("Leh, Ladakh");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<OsmSearchResult[]>([]);
  const [isGpsLoading, setIsGpsLoading] = useState(false);

  // Photo state
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState<{ id: string; analysis_message: string } | null>(null);

  // Feedback
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  // Load existing session location if available
  useEffect(() => {
    const existing = sessionStorage.getItem("thermo-shelter-selected-location");
    if (existing) {
      try {
        const parsed = JSON.parse(existing);
        setSelectedLocation(parsed);
        setLatInput(parsed.latitude.toString());
        setLonInput(parsed.longitude.toString());
        setNameInput(parsed.name);
      } catch {
        // ignore
      }
    }
  }, []);

  // Browser GPS detection
  function handleDetectGps() {
    setError("");
    setStatusMessage("");

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setIsGpsLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          let name = `Site (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;

          // Reverse geocode with OpenStreetMap Nominatim
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
              { headers: { "Accept-Language": "en" } },
            );
            if (res.ok) {
              const data = await res.json();
              if (data.display_name) {
                const parts = data.display_name.split(",");
                name = parts.slice(0, 3).join(",").trim();
              }
            }
          } catch {
            // fallback
          }

          let elevation: number | null = null;
          let timezone: string | null = null;

          try {
            const weatherRes = await fetch(
              `${API_BASE}/api/weather/forecast?latitude=${latitude}&longitude=${longitude}&hours=1`,
            );
            if (weatherRes.ok) {
              const weather = await weatherRes.json();
              elevation = weather.elevation_m ?? null;
              timezone = weather.timezone ?? null;
            }
          } catch {
            // optional
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
          setLatInput(latitude.toFixed(5));
          setLonInput(longitude.toFixed(5));
          setNameInput(name);
          setLocation(loc);

          sessionStorage.setItem("thermo-shelter-selected-location", JSON.stringify(loc));
          setStatusMessage(`GPS location captured: ${name}`);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to resolve GPS coordinates.");
        } finally {
          setIsGpsLoading(false);
        }
      },
      (geoErr) => {
        setIsGpsLoading(false);
        if (geoErr.code === geoErr.PERMISSION_DENIED) {
          setError("Location permission denied. Enter coordinates manually below.");
        } else {
          setError("Could not retrieve GPS coordinates. Enter coordinates manually below.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  // OpenStreetMap location search
  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setError("");
    setStatusMessage("");
    setIsSearching(true);
    setSearchResults([]);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery.trim())}&format=json&limit=5`,
        { headers: { "Accept-Language": "en" } },
      );
      if (!res.ok) throw new Error("Search service unavailable.");
      const data = await res.json();
      if (!data || data.length === 0) {
        setError(`No results found for "${searchQuery}".`);
      } else {
        setSearchResults(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed.");
    } finally {
      setIsSearching(false);
    }
  }

  function handleSelectResult(result: OsmSearchResult) {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    const cleanName = result.display_name.split(",").slice(0, 3).join(",").trim();

    const loc: SelectedLocation = {
      name: cleanName,
      latitude: lat,
      longitude: lon,
      elevation_m: null,
      timezone: null,
      source: "search",
    };

    setSelectedLocation(loc);
    setLatInput(lat.toFixed(5));
    setLonInput(lon.toFixed(5));
    setNameInput(cleanName);
    setLocation(loc);
    sessionStorage.setItem("thermo-shelter-selected-location", JSON.stringify(loc));
    setSearchResults([]);
    setStatusMessage(`Location updated: ${cleanName}`);
  }

  // Manual coordinate update
  function handleApplyCoordinates(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStatusMessage("");

    const lat = parseFloat(latInput);
    const lon = parseFloat(lonInput);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      setError("Enter a valid latitude between -90 and 90.");
      return;
    }
    if (isNaN(lon) || lon < -180 || lon > 180) {
      setError("Enter a valid longitude between -180 and 180.");
      return;
    }

    const loc: SelectedLocation = {
      name: nameInput.trim() || `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
      latitude: lat,
      longitude: lon,
      elevation_m: null,
      timezone: null,
      source: "manual",
    };

    setSelectedLocation(loc);
    setLocation(loc);
    sessionStorage.setItem("thermo-shelter-selected-location", JSON.stringify(loc));
    setStatusMessage(`Coordinates applied: ${loc.name}`);
  }

  // Photo upload
  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setError("");
    setStatusMessage("");
    setUploaded(null);

    if (!file) {
      setImage(null);
      setPreview("");
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Please select a JPG, PNG, or WEBP image.");
      e.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image file size must be under 10 MB.");
      e.target.value = "";
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleUploadPhoto() {
    if (!image) return;

    setUploading(true);
    setError("");
    setStatusMessage("");

    try {
      const formData = new FormData();
      formData.append("file", image);

      const response = await fetch(`${API_BASE}/api/land/upload`, {
        method: "POST",
        headers: authHeaders(),
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Upload failed.");

      setUploaded(data);
      sessionStorage.setItem("thermo-shelter-land-image", JSON.stringify(data));
      setStatusMessage("Site photo uploaded successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Photo upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function handleContinue() {
    router.push("/3d");
  }

  return (
    <main className="min-h-screen bg-[#070b14] text-slate-100 px-6 py-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/10 text-xs font-mono">
          <Link href="/" className="text-slate-400 hover:text-white transition">
            ← Home
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <span className="text-slate-400">
                Account: <strong className="text-white">{user.name}</strong> ({user.role})
              </span>
            ) : null}
            <button
              type="button"
              onClick={handleContinue}
              className="text-cyan-400 hover:text-cyan-300 transition"
            >
              Skip to 3D Simulator →
            </button>
          </div>
        </div>

        {/* Page Title */}
        <div className="mt-6 mb-6">
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Site Location & Photo
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Set geographic coordinates and an optional terrain photo for the simulation.
          </p>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="mb-6 p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 text-xs text-red-200">
            {error}
          </div>
        )}
        {statusMessage && (
          <div className="mb-6 p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-200">
            {statusMessage}
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-5 space-y-6">
            {/* 1. Location Selection */}
            <div className="rounded-2xl border border-white/10 bg-[#0d1322] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 font-mono">
                  Coordinates
                </h2>
                <button
                  type="button"
                  onClick={handleDetectGps}
                  disabled={isGpsLoading}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-mono transition disabled:opacity-50"
                >
                  {isGpsLoading ? "Detecting GPS..." : "Detect GPS"}
                </button>
              </div>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search city, town, or pass (e.g. Leh)"
                  className="flex-1 rounded-lg border border-white/10 bg-[#070b14] px-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-cyan-400"
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-mono text-white transition disabled:opacity-50"
                >
                  {isSearching ? "..." : "Search"}
                </button>
              </form>

              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="rounded-lg border border-white/15 bg-[#070b14] divide-y divide-white/10 text-xs max-h-48 overflow-y-auto">
                  {searchResults.map((item, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectResult(item)}
                      className="w-full text-left p-2.5 hover:bg-white/5 text-slate-300 transition"
                    >
                      {item.display_name}
                    </button>
                  ))}
                </div>
              )}

              {/* Manual Coordinate Inputs */}
              <form onSubmit={handleApplyCoordinates} className="space-y-3 pt-2">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Location Name</label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-[#070b14] px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">Latitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={latInput}
                      onChange={(e) => setLatInput(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-[#070b14] px-3 py-2 text-xs text-white font-mono outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">Longitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={lonInput}
                      onChange={(e) => setLonInput(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-[#070b14] px-3 py-2 text-xs text-white font-mono outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-mono text-white transition"
                >
                  Apply Coordinates
                </button>
              </form>
            </div>

            {/* 2. Photo Attachment */}
            <div className="rounded-2xl border border-white/10 bg-[#0d1322] p-6 space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 font-mono">
                Site Photo (Optional)
              </h2>
              <p className="text-xs text-slate-400">
                Attach a photo of the ground slope or building site.
              </p>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-mono file:bg-white/10 file:text-white hover:file:bg-white/20"
              />

              {image && (
                <div className="pt-2 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="truncate max-w-[200px]">{image.name}</span>
                  <button
                    type="button"
                    onClick={handleUploadPhoto}
                    disabled={uploading}
                    className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition disabled:opacity-50"
                  >
                    {uploading ? "Uploading..." : "Upload Photo"}
                  </button>
                </div>
              )}

              {uploaded && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                  Photo saved: {uploaded.id}
                </div>
              )}
            </div>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={handleContinue}
              className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition font-mono shadow-md"
            >
              Open in 3D Simulator →
            </button>
          </div>

          {/* Right Column: OpenStreetMap & Preview */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#0d1322] h-[480px]">
              <OpenStreetLocationMap
                latitude={selectedLocation.latitude}
                longitude={selectedLocation.longitude}
                locationName={selectedLocation.name}
              />
            </div>

            {preview && (
              <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#0d1322] p-3">
                <div className="text-xs font-mono text-slate-400 mb-2">Photo Preview:</div>
                <img
                  src={preview}
                  alt="Site preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
