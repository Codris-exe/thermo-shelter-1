"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useShelterDesignStore } from "@/stores/shelterDesignStore";
import { authHeaders, getStoredUser, isAuthenticated } from "@/lib/auth";
import GoogleLocationMap from "@/components/GoogleLocationMap";

const API_BASE = "/backend-api";

interface SelectedLocation {
  name: string;
  latitude: number;
  longitude: number;
  elevation_m: number | null;
  timezone: string | null;
  source: "gps" | "search" | "manual";
}

export default function OnboardingPage() {
  const router = useRouter();
  const setLocation = useShelterDesignStore((state) => state.setLocation);
  const user = getStoredUser();

  const [mode, setMode] = useState<"choose" | "location" | "image">("choose");
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState<{ id: string; analysis_message: string } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated()) router.replace("/login");
  }, [router]);

  function detectLocation() {
    setError("");

    if (!navigator.geolocation) {
      setError("This browser does not support location access.");
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy: locationAccuracy } = position.coords;

        try {
          const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
          let name = "Current Location";

          if (googleMapsKey) {
            const { Loader } = await import("@googlemaps/js-api-loader");
            const loader = new Loader({ apiKey: googleMapsKey, version: "weekly" });
            const google = await loader.load();
            const geocoder = new google.maps.Geocoder();
            const result = await geocoder.geocode({ location: { lat: latitude, lng: longitude } });
            const address = result.results[0]?.formatted_address;
            if (address) name = address;
          }

          let elevation: number | null = null;
          let timezone: string | null = null;

          const weatherResponse = await fetch(
            `${API_BASE}/api/weather/forecast?latitude=${latitude}&longitude=${longitude}&hours=1`,
          );
          if (weatherResponse.ok) {
            const weather = await weatherResponse.json();
            elevation = weather.elevation_m ?? null;
            timezone = weather.timezone ?? null;
          }

          const location: SelectedLocation = {
            name,
            latitude,
            longitude,
            elevation_m: elevation,
            timezone,
            source: "gps",
          };

          setSelectedLocation(location);
          setAccuracy(locationAccuracy);
          setLocation(location);

          sessionStorage.setItem(
            "thermo-shelter-selected-location",
            JSON.stringify(location),
          );
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Location was detected but could not be resolved.",
          );
        } finally {
          setIsGettingLocation(false);
        }
      },
      (locationError) => {
        setIsGettingLocation(false);
        if (locationError.code === locationError.PERMISSION_DENIED) {
          setError("Location permission was denied. Allow location access and try again.");
        } else if (locationError.code === locationError.TIMEOUT) {
          setError("Location request timed out. Please try again.");
        } else {
          setError("Your current location could not be determined.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000,
      },
    );
  }

  function chooseImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setError("");
    setUploaded(null);

    if (!file) {
      setImage(null);
      setPreview("");
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Please choose a JPG, PNG, or WEBP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("The image must be 10 MB or smaller.");
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

    try {
      const formData = new FormData();
      formData.append("file", image);

      const response = await fetch(`${API_BASE}/api/land/upload`, {
        method: "POST",
        headers: authHeaders(),
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Land image upload failed.");

      setUploaded(data);
      sessionStorage.setItem("thermo-shelter-land-image", JSON.stringify(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Land image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function continueWithLocation() {
    if (!selectedLocation) return;
    router.push("/3d");
  }

  return (
    <main className="min-h-screen bg-[#070b14] px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-cyan-400">
              Site onboarding
            </div>
            <h1 className="mt-3 text-4xl font-semibold">
              Welcome{user?.name ? `, ${user.name}` : ""}.
            </h1>
            <p className="mt-3 max-w-2xl text-slate-400">
              Before the thermal simulator starts, tell us where the shelter will be
              placed — or upload a picture of the land so the site can be analyzed.
            </p>
          </div>
          <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-slate-400">
            Step 1 · Site information
          </div>
        </header>

        {mode === "choose" && (
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <button
              onClick={() => setMode("location")}
              className="rounded-3xl border border-cyan-400/20 bg-cyan-400/5 p-8 text-left transition hover:border-cyan-400/50 hover:bg-cyan-400/10"
            >
              <div className="text-3xl">⌖</div>
              <h2 className="mt-5 text-2xl font-semibold">Get My Location</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Use your device GPS to capture latitude and longitude, reverse-geocode
                the location, load elevation/weather data, and place an exact marker on Google Maps.
              </p>
              <div className="mt-6 text-sm font-semibold text-cyan-300">
                Use GPS →
              </div>
            </button>

            <button
              onClick={() => setMode("image")}
              className="rounded-3xl border border-violet-400/20 bg-violet-400/5 p-8 text-left transition hover:border-violet-400/50 hover:bg-violet-400/10"
            >
              <div className="text-3xl">▧</div>
              <h2 className="mt-5 text-2xl font-semibold">Upload Land Picture</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Upload a site photograph. We store it against your account so a later
                land-analysis stage can combine terrain, orientation and visual site information.
              </p>
              <div className="mt-6 text-sm font-semibold text-violet-300">
                Upload site image →
              </div>
            </button>
          </div>
        )}

        {mode === "location" && (
          <section className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <button
                onClick={() => setMode("choose")}
                className="text-xs text-slate-500 hover:text-white"
              >
                ← Back
              </button>

              <h2 className="mt-5 text-xl font-semibold">Use my current location</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Your browser will ask for permission. High-accuracy mode is requested
                when available.
              </p>

              <button
                onClick={detectLocation}
                disabled={isGettingLocation}
                className="mt-6 w-full rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
              >
                {isGettingLocation ? "Detecting..." : "Access My Location"}
              </button>

              {selectedLocation && (
                <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4">
                  <div className="text-xs uppercase tracking-wider text-emerald-300">
                    Location captured
                  </div>
                  <div className="mt-2 font-medium">{selectedLocation.name}</div>
                  <div className="mt-2 font-mono text-xs text-slate-400">
                    {selectedLocation.latitude.toFixed(6)},{" "}
                    {selectedLocation.longitude.toFixed(6)}
                  </div>
                  {accuracy !== null && (
                    <div className="mt-2 text-xs text-slate-500">
                      Browser-reported accuracy: ±{Math.round(accuracy)} m
                    </div>
                  )}
                  {selectedLocation.elevation_m !== null && (
                    <div className="mt-2 text-xs text-slate-500">
                      Elevation: {Math.round(selectedLocation.elevation_m)} m
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <button
                onClick={continueWithLocation}
                disabled={!selectedLocation}
                className="mt-5 w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 font-semibold hover:bg-white/[0.1] disabled:opacity-40"
              >
                Continue to Simulator →
              </button>
            </div>

            <div className="min-h-[420px] rounded-3xl border border-white/10 bg-white/[0.03] p-2">
              {selectedLocation ? (
                <GoogleLocationMap
                  latitude={selectedLocation.latitude}
                  longitude={selectedLocation.longitude}
                />
              ) : (
                <div className="flex h-full min-h-[420px] items-center justify-center text-sm text-slate-500">
                  Your exact Google Maps position will appear here.
                </div>
              )}
            </div>
          </section>
        )}

        {mode === "image" && (
          <section className="mt-8 grid gap-6 lg:grid-cols-[420px_1fr]">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <button
                onClick={() => setMode("choose")}
                className="text-xs text-slate-500 hover:text-white"
              >
                ← Back
              </button>

              <h2 className="mt-5 text-xl font-semibold">Upload land picture</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Use a clear photo of the proposed site. JPG, PNG and WEBP are supported,
                up to 10 MB.
              </p>

              <label className="mt-6 flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-violet-400/30 bg-violet-400/5 px-5 py-8 text-center hover:bg-violet-400/10">
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseImage} className="hidden" />
                <span className="text-sm font-semibold text-violet-200">
                  {image ? "Choose a different image" : "Choose site image"}
                </span>
              </label>

              {image && (
                <button
                  onClick={uploadLandImage}
                  disabled={uploading}
                  className="mt-4 w-full rounded-xl bg-violet-500 px-4 py-3 font-semibold hover:bg-violet-400 disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "Save Land Image"}
                </button>
              )}

              {uploaded && (
                <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4 text-sm text-emerald-300">
                  <div className="font-semibold">Image saved</div>
                  <div className="mt-1 text-xs text-slate-400">{uploaded.analysis_message}</div>
                </div>
              )}

              {error && (
                <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-sm text-red-300">
                  {error}
                </div>
              )}
            </div>

            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
              {preview ? (
                <img src={preview} alt="Uploaded land preview" className="h-full min-h-[420px] w-full object-cover" />
              ) : (
                <div className="flex h-full min-h-[420px] items-center justify-center text-sm text-slate-500">
                  Your land photo preview will appear here.
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
