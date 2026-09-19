"use client";

import { useEffect, useMemo, useState } from "react";

import {
  HistoricalClimateProfilePoint,
  useHistoricalClimateStore,
} from "../stores/historicalClimateStore";

type HistoricalClimateCardProps = {
  latitude: number;
  longitude: number;
  locationName?: string;
};

const MONTHS = [
  { value: null, label: "Annual profile" },
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

function formatHour(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

function formatValue(
  value: number | null,
  digits = 1,
): string {
  if (value === null || !Number.isFinite(value)) {
    return "—";
  }

  return value.toFixed(digits);
}

function averageOf(
  values: Array<number | null>,
): number | null {
  const validValues = values.filter(
    (value): value is number =>
      value !== null && Number.isFinite(value),
  );

  if (validValues.length === 0) {
    return null;
  }

  return (
    validValues.reduce(
      (sum, value) => sum + value,
      0,
    ) / validValues.length
  );
}

function getMinimum(
  values: Array<number | null>,
): number | null {
  const validValues = values.filter(
    (value): value is number =>
      value !== null && Number.isFinite(value),
  );

  return validValues.length > 0
    ? Math.min(...validValues)
    : null;
}

function getMaximum(
  values: Array<number | null>,
): number | null {
  const validValues = values.filter(
    (value): value is number =>
      value !== null && Number.isFinite(value),
  );

  return validValues.length > 0
    ? Math.max(...validValues)
    : null;
}

export default function HistoricalClimateCard({
  latitude,
  longitude,
  locationName = "Selected Location",
}: HistoricalClimateCardProps) {
  const {
    result,
    isLoading,
    error,
    selectedMonth,
    setResult,
    setLoading,
    setError,
    setSelectedMonth,
  } = useHistoricalClimateStore();

  const [hasLoadedOnce, setHasLoadedOnce] =
    useState(false);

  async function loadHistoricalClimate(
    monthOverride?: number | null,
  ) {
    const month =
      monthOverride !== undefined
        ? monthOverride
        : selectedMonth;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "/backend-api/api/weather/historical",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            latitude,
            longitude,
            start_date: "2016-01-01",
            end_date: "2025-12-31",
            timezone: "auto",
            model: "era5",
            month,
            aggregation: "hourly_profile",
          }),
        },
      );

      if (!response.ok) {
        let detail =
          "Historical weather request failed.";

        try {
          const payload = await response.json();

          if (typeof payload?.detail === "string") {
            detail = payload.detail;
          }
        } catch {
          // Preserve the default message.
        }

        throw new Error(detail);
      }

      const payload = await response.json();

      if (
        !payload.climate_profile ||
        !Array.isArray(payload.climate_profile) ||
        payload.climate_profile.length === 0
      ) {
        throw new Error(
          "No historical climate profile was returned.",
        );
      }

      setResult(payload);
      setHasLoadedOnce(true);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to load historical climate data.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (
      !hasLoadedOnce &&
      Number.isFinite(latitude) &&
      Number.isFinite(longitude)
    ) {
      void loadHistoricalClimate(
        selectedMonth,
      );
    }

    // Initial request only.
    // Subsequent requests are controlled by the
    // month selector and Load Climate button.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude]);

  const summary = useMemo(() => {
    if (!result) {
      return {
        averageTemperature: null,
        minimumTemperature: null,
        maximumTemperature: null,
        averageSolar: null,
        averageWind: null,
        averageHumidity: null,
      };
    }

    const profile =
      result.climate_profile;

    return {
      averageTemperature: averageOf(
        profile.map(
          (point: HistoricalClimateProfilePoint) =>
            point.average_temperature_c,
        ),
      ),

      minimumTemperature: getMinimum(
        profile.map(
          (point: HistoricalClimateProfilePoint) =>
            point.minimum_temperature_c,
        ),
      ),

      maximumTemperature: getMaximum(
        profile.map(
          (point: HistoricalClimateProfilePoint) =>
            point.maximum_temperature_c,
        ),
      ),

      averageSolar: averageOf(
        profile.map(
          (point: HistoricalClimateProfilePoint) =>
            point.average_solar_irradiance_w_m2,
        ),
      ),

      averageWind: averageOf(
        profile.map(
          (point: HistoricalClimateProfilePoint) =>
            point.average_wind_speed_m_s,
        ),
      ),

      averageHumidity: averageOf(
        profile.map(
          (point: HistoricalClimateProfilePoint) =>
            point.average_relative_humidity_pct,
        ),
      ),
    };
  }, [result]);

  const temperatureRange =
    summary.minimumTemperature !== null &&
    summary.maximumTemperature !== null
      ? Math.max(
          1,
          summary.maximumTemperature -
            summary.minimumTemperature,
        )
      : 1;

  const selectedMonthLabel =
    MONTHS.find(
      (month) => month.value === selectedMonth,
    )?.label ?? "Annual profile";

  return (
    <section
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 18,
        background: "#ffffff",
        padding: 20,
        boxShadow:
          "0 8px 30px rgba(15, 23, 42, 0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          alignItems: "flex-start",
          marginBottom: 18,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#64748b",
              marginBottom: 6,
            }}
          >
            Historical Climate
          </div>

          <h3
            style={{
              margin: 0,
              fontSize: 20,
              lineHeight: 1.2,
              color: "#0f172a",
            }}
          >
            {locationName}
          </h3>

          <p
            style={{
              margin: "6px 0 0",
              color: "#64748b",
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            ERA5 hourly climate data from
            {" 2016–2025"}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <select
            value={
              selectedMonth === null
                ? ""
                : String(selectedMonth)
            }
            onChange={(event) => {
              const value = event.target.value;

              const month =
                value === ""
                  ? null
                  : Number(value);

              setSelectedMonth(month);
            }}
            style={{
              border: "1px solid #cbd5e1",
              borderRadius: 10,
              background: "#ffffff",
              color: "#0f172a",
              padding: "9px 12px",
              fontSize: 12,
              fontWeight: 700,
              outline: "none",
            }}
          >
            {MONTHS.map((month) => (
              <option
                key={
                  month.value === null
                    ? "annual"
                    : month.value
                }
                value={
                  month.value === null
                    ? ""
                    : month.value
                }
              >
                {month.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() =>
              void loadHistoricalClimate(
                selectedMonth,
              )
            }
            disabled={isLoading}
            style={{
              border: "1px solid #0f172a",
              borderRadius: 10,
              background: "#0f172a",
              color: "#ffffff",
              padding: "9px 14px",
              fontSize: 12,
              fontWeight: 700,
              cursor: isLoading
                ? "not-allowed"
                : "pointer",
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {isLoading
              ? "Loading..."
              : "Load Climate"}
          </button>
        </div>
      </div>

      <div
        style={{
          marginBottom: 16,
          padding: 12,
          borderRadius: 12,
          background:
            selectedMonth === null
              ? "#fff7ed"
              : "#f8fafc",
          border:
            selectedMonth === null
              ? "1px solid #fed7aa"
              : "1px solid #e2e8f0",
          color:
            selectedMonth === null
              ? "#9a3412"
              : "#475569",
          fontSize: 12,
          lineHeight: 1.5,
        }}
      >
        {selectedMonth === null ? (
          <>
            <strong>Annual profile:</strong>{" "}
            the 24-hour values represent the average
            across all months. For seasonal shelter
            design, select a specific month before
            running the thermal simulation.
          </>
        ) : (
          <>
            <strong>{selectedMonthLabel} profile:</strong>{" "}
            each hour is averaged across the selected
            month for the historical period. This keeps
            seasonal temperature and solar patterns
            intact.
          </>
        )}
      </div>

      {isLoading && (
        <div
          style={{
            borderRadius: 12,
            background: "#f8fafc",
            padding: 14,
            color: "#475569",
            fontSize: 13,
          }}
        >
          Downloading historical hourly weather and
          building the {selectedMonthLabel.toLowerCase()}
          {" "}climate profile...
        </div>
      )}

      {error && !isLoading && (
        <div
          style={{
            borderRadius: 12,
            background: "#fff7ed",
            border: "1px solid #fed7aa",
            padding: 14,
            color: "#9a3412",
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          <strong>
            Historical climate unavailable.
          </strong>

          <div style={{ marginTop: 4 }}>
            {error}
          </div>
        </div>
      )}

      {result && !isLoading && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(130px, 1fr))",
              gap: 10,
              marginBottom: 18,
            }}
          >
            <Metric
              label="Mean Temperature"
              value={`${formatValue(
                summary.averageTemperature,
              )}°C`}
            />

            <Metric
              label="Historical Range"
              value={`${formatValue(
                summary.minimumTemperature,
              )}–${formatValue(
                summary.maximumTemperature,
              )}°C`}
            />

            <Metric
              label="Mean Solar"
              value={`${formatValue(
                summary.averageSolar,
              )} W/m²`}
            />

            <Metric
              label="Mean Wind"
              value={`${formatValue(
                summary.averageWind,
              )} m/s`}
            />

            <Metric
              label="Mean Humidity"
              value={`${formatValue(
                summary.averageHumidity,
              )}%`}
            />
          </div>

          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#475569",
              marginBottom: 9,
            }}
          >
            Representative 24-hour temperature
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 3,
              height: 150,
              padding: "14px 10px 10px",
              borderRadius: 14,
              background: "#f8fafc",
              overflow: "hidden",
            }}
          >
            {result.climate_profile.map(
              (point) => {
                const temperature =
                  point.average_temperature_c;

                const relativeHeight =
                  temperature !== null &&
                  summary.minimumTemperature !==
                    null
                    ? ((temperature -
                        summary.minimumTemperature) /
                        temperatureRange) *
                      100
                    : 0;

                return (
                  <div
                    key={point.hour_of_day}
                    title={`${formatHour(
                      point.hour_of_day,
                    )}: ${formatValue(
                      temperature,
                    )}°C`}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      height: `${Math.max(
                        8,
                        Math.min(
                          100,
                          relativeHeight,
                        ),
                      )}%`,
                      borderRadius:
                        "5px 5px 2px 2px",
                      background:
                        "linear-gradient(180deg, #0f172a 0%, #64748b 100%)",
                    }}
                  />
                );
              },
            )}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(6, 1fr)",
              gap: 4,
              marginTop: 6,
              fontSize: 10,
              color: "#94a3b8",
            }}
          >
            {[0, 4, 8, 12, 16, 20].map(
              (hour) => (
                <span key={hour}>
                  {formatHour(hour)}
                </span>
              ),
            )}
          </div>

          <div
            style={{
              marginTop: 16,
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
              fontSize: 11,
              color: "#64748b",
            }}
          >
            <span>
              {result.years_available} historical
              years
            </span>

            <span>
              {result.hourly_samples.toLocaleString()}{" "}
              hourly samples
            </span>

            <span>
              Profile: {selectedMonthLabel}
            </span>

            <span>
              Source: {result.source}
            </span>
          </div>
        </>
      )}
    </section>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        background: "#f8fafc",
        borderRadius: 12,
        padding: 13,
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: "#64748b",
          marginBottom: 4,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 18,
          fontWeight: 800,
          color: "#0f172a",
        }}
      >
        {value}
      </div>
    </div>
  );
}