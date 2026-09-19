"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import HistoricalClimateCard from "../../components/HistoricalClimateCard";
import { useHistoricalClimateStore } from "../../stores/historicalClimateStore";
import { useShelterDesignStore } from "../../stores/shelterDesignStore";

interface WeatherPoint {
  timestamp: string;
  outdoor_temperature_c: number;
  wind_speed_m_s: number;
  solar_irradiance_w_m2: number;
  solar_gain_w: number;
  direct_radiation_w_m2: number;
  diffuse_radiation_w_m2: number;
  direct_normal_irradiance_w_m2: number;
  cloud_cover_pct: number | null;
  is_day: boolean;
  relative_humidity_pct: number | null;
  ground_temperature_c: number | null;
}

interface WeatherResponse {
  latitude: number;
  longitude: number;
  elevation_m: number;
  timezone: string;
  source: string;
  points: WeatherPoint[];
}

interface LocationResult {
  name: string;
  country: string | null;
  country_code: string | null;
  region: string | null;
  latitude: number;
  longitude: number;
  elevation_m: number | null;
  timezone: string | null;
}

export default function LocationPage() {
  const router = useRouter();

  const setLocation = useShelterDesignStore(
    (state) => state.setLocation,
  );

  const historicalClimate = useHistoricalClimateStore(
    (state) => state.result,
  );

  const isHistoricalLoading = useHistoricalClimateStore(
    (state) => state.isLoading,
  );

  const [locationQuery, setLocationQuery] =
    useState("Leh");

  const [locations, setLocations] = useState<
    LocationResult[]
  >([]);

  const [selectedLocation, setSelectedLocation] =
    useState<LocationResult | null>(null);

  const [weather, setWeather] =
    useState<WeatherResponse | null>(null);

  const [
    isSearchingLocation,
    setIsSearchingLocation,
  ] = useState(false);

  const [isGettingLocation, setIsGettingLocation] =
    useState(false);

  const [isLoadingWeather, setIsLoadingWeather] =
    useState(false);

  const [isContinuing, setIsContinuing] =
    useState(false);

  const [error, setError] = useState("");

  async function searchLocation() {
    const query = locationQuery.trim();

    if (!query) {
      setError("Enter a location to search.");
      return;
    }

    setIsSearchingLocation(true);
    setError("");
    setSelectedLocation(null);
    setWeather(null);

    try {
      const response = await fetch(
        `/backend-api/api/location/search?q=${encodeURIComponent(
          query,
        )}`,
      );

      if (!response.ok) {
        throw new Error(
          "Location search failed.",
        );
      }

      const data = await response.json();

      setLocations(data.results ?? []);

      if (!data.results?.length) {
        setError(
          "No matching locations were found.",
        );
      }
    } catch (searchError) {
      console.error(searchError);

      setError(
        "Unable to search for the location.",
      );

      setLocations([]);
    } finally {
      setIsSearchingLocation(false);
    }
  }

  async function loadWeather(
    location: LocationResult,
  ) {
    setSelectedLocation(location);
    setWeather(null);
    setIsLoadingWeather(true);
    setError("");

    try {
      const response = await fetch(
        `/backend-api/api/weather/forecast?latitude=${location.latitude}&longitude=${location.longitude}&hours=24`,
      );

      if (!response.ok) {
        throw new Error(
          "Weather request failed.",
        );
      }

      const data: WeatherResponse =
        await response.json();

      setWeather(data);
      setLocations([]);
    } catch (weatherError) {
      console.error(weatherError);

      setError(
        "The location was found, but real weather data could not be retrieved.",
      );
    } finally {
      setIsLoadingWeather(false);
    }
  }

  async function useMyLocation() {
    setIsGettingLocation(true);
    setError("");
    setSelectedLocation(null);
    setWeather(null);
    setLocations([]);

    if (!navigator.geolocation) {
      setError(
        "Geolocation is not supported by this browser.",
      );

      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude =
            position.coords.latitude;

          const longitude =
            position.coords.longitude;

          const accuracy =
            position.coords.accuracy;

          const currentLocation: LocationResult =
            {
              name: "Current Location",
              country: null,
              country_code: null,
              region: null,
              latitude,
              longitude,
              elevation_m: null,
              timezone: null,
            };

          setSelectedLocation(
            currentLocation,
          );

          const weatherResponse =
            await fetch(
              `/backend-api/api/weather/forecast?latitude=${latitude}&longitude=${longitude}&hours=24`,
            );

          if (!weatherResponse.ok) {
            throw new Error(
              "Weather request failed.",
            );
          }

          const weatherData: WeatherResponse =
            await weatherResponse.json();

          setWeather(weatherData);

          setLocationQuery(
            `${latitude.toFixed(
              4,
            )}, ${longitude.toFixed(4)}`,
          );

          setError(
            `Location detected with approximately ${Math.round(
              accuracy,
            )} m accuracy.`,
          );
        } catch (locationError) {
          console.error(locationError);

          setSelectedLocation(null);
          setWeather(null);

          setError(
            "Your location was detected, but real weather data could not be retrieved.",
          );
        } finally {
          setIsGettingLocation(false);
        }
      },
      (locationError) => {
        console.error(locationError);

        let message =
          "Unable to access your current location.";

        if (
          locationError.code ===
          locationError.PERMISSION_DENIED
        ) {
          message =
            "Location permission was denied. Please allow location access in your browser.";
        }

        if (
          locationError.code ===
          locationError.POSITION_UNAVAILABLE
        ) {
          message =
            "Your current location could not be determined.";
        }

        if (
          locationError.code ===
          locationError.TIMEOUT
        ) {
          message =
            "Location request timed out. Please try again.";
        }

        setError(message);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000,
      },
    );
  }

  function continueToSimulator() {
    if (!selectedLocation || !weather) {
      setError(
        "Select a location and load weather before continuing.",
      );
      return;
    }

    if (
      isHistoricalLoading ||
      !historicalClimate
    ) {
      setError(
        "Load the historical climate profile before continuing to the simulator.",
      );
      return;
    }

    setIsContinuing(true);
    setError("");

    const locationPayload = {
      name: selectedLocation.name,
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
      elevation_m: selectedLocation.elevation_m,
      timezone: weather.timezone,
      source:
        selectedLocation.name ===
        "Current Location"
          ? "gps"
          : "search",
    } as const;

    setLocation(locationPayload);

    sessionStorage.setItem(
      "thermo-shelter-selected-location",
      JSON.stringify(locationPayload),
    );

    sessionStorage.setItem(
      "thermo-shelter-weather-summary",
      JSON.stringify({
        latitude: weather.latitude,
        longitude: weather.longitude,
        elevation_m: weather.elevation_m,
        timezone: weather.timezone,
        source: weather.source,
      }),
    );

    sessionStorage.setItem(
      "thermo-shelter-historical-climate",
      JSON.stringify(historicalClimate),
    );

    router.push("/simulate");
  }

  const canContinue =
    Boolean(selectedLocation) &&
    Boolean(weather) &&
    Boolean(historicalClimate) &&
    !isHistoricalLoading &&
    !isContinuing;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-8 lg:py-12">
        <header className="mb-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
                Passive Shelter Engineering
              </p>

              <h1 className="mt-3 text-4xl font-bold sm:text-5xl">
                Choose Your Location
              </h1>

              <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-400">
                Start with the place. Thermo
                Shelter 1 will use real weather
                and historical climate data for
                the thermal analysis.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-400">
              Step 1 of 3
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
          {/* LEFT PANEL */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">
              Location & Weather
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Search for a place or use your
              browser&apos;s current location.
            </p>

            <div className="mt-6 flex gap-2">
              <input
                value={locationQuery}
                onChange={(event) =>
                  setLocationQuery(
                    event.target.value,
                  )
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    void searchLocation();
                  }
                }}
                placeholder="Search location"
                className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none transition focus:border-cyan-400"
              />

              <button
                onClick={() =>
                  void searchLocation()
                }
                disabled={
                  isSearchingLocation ||
                  isGettingLocation
                }
                className="rounded-lg bg-slate-700 px-4 py-3 text-sm font-semibold transition hover:bg-slate-600 disabled:opacity-50"
              >
                {isSearchingLocation
                  ? "..."
                  : "Search"}
              </button>
            </div>

            <button
              onClick={() =>
                void useMyLocation()
              }
              disabled={
                isGettingLocation ||
                isSearchingLocation
              }
              className="mt-3 w-full rounded-lg border border-cyan-700 bg-cyan-950/40 px-4 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-950 disabled:opacity-50"
            >
              {isGettingLocation
                ? "Detecting Location..."
                : "Use My Current Location"}
            </button>

            {locations.length > 0 && (
              <div className="mt-3 space-y-2">
                {locations.map(
                  (location) => (
                    <button
                      key={`${location.latitude}-${location.longitude}-${location.name}`}
                      onClick={() =>
                        void loadWeather(
                          location,
                        )
                      }
                      disabled={isLoadingWeather}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-left transition hover:border-cyan-500 disabled:opacity-50"
                    >
                      <p className="font-medium">
                        {location.name}
                      </p>

                      <p className="text-xs text-slate-400">
                        {location.region
                          ? `${location.region}, `
                          : ""}
                        {location.country ??
                          ""}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {location.latitude.toFixed(
                          4,
                        )}
                        °,{" "}
                        {location.longitude.toFixed(
                          4,
                        )}
                        °
                      </p>
                    </button>
                  ),
                )}
              </div>
            )}

            {isLoadingWeather && (
              <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">
                Loading real weather data...
              </div>
            )}

            {selectedLocation && (
              <div className="mt-5 rounded-xl border border-cyan-900 bg-cyan-950/20 p-4">
                <p className="font-semibold text-cyan-300">
                  Selected Location
                </p>

                <p className="mt-2 font-medium">
                  {selectedLocation.name}
                </p>

                {selectedLocation.region && (
                  <p className="text-sm text-slate-400">
                    {selectedLocation.region}
                    {selectedLocation.country
                      ? `, ${selectedLocation.country}`
                      : ""}
                  </p>
                )}

                <p className="mt-2 text-xs text-slate-500">
                  Latitude:{" "}
                  {selectedLocation.latitude.toFixed(
                    5,
                  )}
                  <br />
                  Longitude:{" "}
                  {selectedLocation.longitude.toFixed(
                    5,
                  )}
                </p>
              </div>
            )}

            {weather && (
              <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="font-semibold">
                  Real Weather Data
                </p>

                <div className="mt-3 space-y-2 text-sm text-slate-400">
                  <p>
                    Source:{" "}
                    <span className="text-white">
                      {weather.source}
                    </span>
                  </p>

                  <p>
                    Timezone:{" "}
                    <span className="text-white">
                      {weather.timezone}
                    </span>
                  </p>

                  <p>
                    Elevation:{" "}
                    <span className="text-white">
                      {weather.elevation_m?.toFixed(
                        0,
                      )}{" "}
                      m
                    </span>
                  </p>

                  <p>
                    Hourly points:{" "}
                    <span className="text-white">
                      {weather.points.length}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {historicalClimate && (
              <div className="mt-5 rounded-xl border border-emerald-900 bg-emerald-950/20 p-4">
                <p className="font-semibold text-emerald-300">
                  Historical Climate Ready
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  The selected historical climate
                  profile is ready to be used by
                  the simulator.
                </p>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-slate-950 p-2">
                    <span className="text-slate-500">
                      Years
                    </span>

                    <div className="mt-1 font-semibold text-white">
                      {
                        historicalClimate.years_available
                      }
                    </div>
                  </div>

                  <div className="rounded-lg bg-slate-950 p-2">
                    <span className="text-slate-500">
                      Samples
                    </span>

                    <div className="mt-1 font-semibold text-white">
                      {historicalClimate.hourly_samples.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-5 rounded-xl border border-amber-900 bg-amber-950/30 p-4 text-sm leading-6 text-amber-300">
                {error}
              </div>
            )}

            <button
              onClick={continueToSimulator}
              disabled={!canContinue}
              className="mt-7 w-full rounded-xl bg-cyan-500 px-5 py-3.5 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isContinuing
                ? "Opening Simulator..."
                : isHistoricalLoading
                  ? "Loading Historical Climate..."
                  : "Continue to Simulator →"}
            </button>
          </div>

          {/* RIGHT PANEL */}
          <div className="space-y-6">
            {selectedLocation ? (
              <>
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                        Climate Analysis
                      </p>

                      <h2 className="mt-2 text-2xl font-semibold">
                        {selectedLocation.name}
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        The historical climate
                        profile below will be
                        carried into the thermal
                        simulator.
                      </p>
                    </div>

                    <div className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-400">
                      ERA5 · 2016–2025
                    </div>
                  </div>
                </div>

                <HistoricalClimateCard
                  latitude={
                    selectedLocation.latitude
                  }
                  longitude={
                    selectedLocation.longitude
                  }
                  locationName={
                    selectedLocation.name
                  }
                />

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                  <h3 className="text-lg font-semibold">
                    Analysis Pipeline
                  </h3>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <PipelineStep
                      number="01"
                      title="Location"
                      description="Coordinates and elevation define the climate context."
                    />

                    <PipelineStep
                      number="02"
                      title="Real Weather"
                      description="Current weather is loaded for immediate conditions."
                    />

                    <PipelineStep
                      number="03"
                      title="Historical Climate"
                      description="Ten years of hourly historical data become a representative profile."
                    />

                    <PipelineStep
                      number="04"
                      title="Thermal Simulation"
                      description="The selected climate drives indoor thermal behavior."
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex min-h-[600px] items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 p-8">
                <div className="max-w-xl text-center">
                  <div className="text-6xl">
                    🌍
                  </div>

                  <h2 className="mt-6 text-3xl font-semibold">
                    Start with the climate.
                  </h2>

                  <p className="mt-4 text-lg leading-8 text-slate-400">
                    Search for a location or use
                    your current location. Once it
                    is selected, Thermo Shelter 1
                    will load both real weather and
                    historical climate data.
                  </p>

                  <div className="mt-10 grid gap-4 text-left sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                      <p className="text-sm font-semibold text-cyan-300">
                        Location
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Search or browser GPS
                        coordinates
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                      <p className="text-sm font-semibold text-cyan-300">
                        Weather
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Real Open-Meteo weather
                        inputs
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                      <p className="text-sm font-semibold text-cyan-300">
                        Climate
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Historical ERA5 climate
                        profile
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <footer className="mt-8 flex flex-col gap-2 border-t border-slate-800 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Thermo Shelter 1
          </span>

          <span>
            Location → Weather → Historical Climate → Thermal Simulation
          </span>
        </footer>
      </div>
    </main>
  );
}

function PipelineStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-950 text-xs font-bold text-cyan-300">
          {number}
        </span>

        <span className="font-semibold text-white">
          {title}
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}