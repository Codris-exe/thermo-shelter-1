"use client";

import { useClimateSimulationStore } from "../stores/climateSimulationStore";
import { useHistoricalClimateStore } from "../stores/historicalClimateStore";

export default function ClimateModeCard() {
  const mode = useClimateSimulationStore(
    (state) => state.mode,
  );

  const useLiveWeather =
    useClimateSimulationStore(
      (state) => state.useLiveWeather,
    );

  const useHistoricalClimate =
    useClimateSimulationStore(
      (state) => state.useHistoricalClimate,
    );

  const historicalClimate =
    useHistoricalClimateStore(
      (state) => state.result,
    );

  const historicalLoading =
    useHistoricalClimateStore(
      (state) => state.isLoading,
    );

  const selectedMonth =
    historicalClimate?.selected_month ?? null;

  const monthName = selectedMonth
    ? new Date(
        2000,
        selectedMonth - 1,
        1,
      ).toLocaleString("en-US", {
        month: "long",
      })
    : "Annual";

  return (
    <section
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: 16,
        background: "#ffffff",
        padding: 18,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#64748b",
            }}
          >
            Simulation Climate
          </div>

          <h3
            style={{
              margin: "6px 0 0",
              fontSize: 18,
              color: "#0f172a",
            }}
          >
            Choose the weather basis
          </h3>

          <p
            style={{
              margin: "5px 0 0",
              fontSize: 12,
              lineHeight: 1.5,
              color: "#64748b",
              maxWidth: 560,
            }}
          >
            Historical Climate uses the selected
            long-term climate profile. Live Weather
            uses the current forecast data.
          </p>
        </div>

        <div
          style={{
            borderRadius: 999,
            padding: "6px 10px",
            background:
              mode === "historical"
                ? "#ecfdf5"
                : "#eff6ff",
            color:
              mode === "historical"
                ? "#047857"
                : "#1d4ed8",
            fontSize: 11,
            fontWeight: 800,
          }}
        >
          {mode === "historical"
            ? "HISTORICAL"
            : "LIVE"}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(2, minmax(0, 1fr))",
          gap: 10,
          marginTop: 16,
        }}
      >
        <button
          type="button"
          onClick={useHistoricalClimate}
          disabled={
            historicalLoading ||
            !historicalClimate
          }
          style={{
            textAlign: "left",
            border:
              mode === "historical"
                ? "2px solid #0f172a"
                : "1px solid #cbd5e1",
            borderRadius: 12,
            background:
              mode === "historical"
                ? "#f8fafc"
                : "#ffffff",
            padding: 14,
            cursor:
              historicalLoading ||
              !historicalClimate
                ? "not-allowed"
                : "pointer",
            opacity:
              historicalLoading ||
              !historicalClimate
                ? 0.6
                : 1,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: "#0f172a",
            }}
          >
            Historical Climate
          </div>

          <div
            style={{
              marginTop: 5,
              fontSize: 11,
              lineHeight: 1.5,
              color: "#64748b",
            }}
          >
            ERA5 historical profile
            <br />
            Period: 2016–2025
            <br />
            Profile: {monthName}
          </div>
        </button>

        <button
          type="button"
          onClick={useLiveWeather}
          style={{
            textAlign: "left",
            border:
              mode === "live"
                ? "2px solid #0f172a"
                : "1px solid #cbd5e1",
            borderRadius: 12,
            background:
              mode === "live"
                ? "#f8fafc"
                : "#ffffff",
            padding: 14,
            cursor: "pointer",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: "#0f172a",
            }}
          >
            Live Weather
          </div>

          <div
            style={{
              marginTop: 5,
              fontSize: 11,
              lineHeight: 1.5,
              color: "#64748b",
            }}
          >
            Current forecast conditions
            <br />
            Uses the existing weather pipeline
            <br />
            Best for current-condition testing
          </div>
        </button>
      </div>

      {!historicalClimate && (
        <div
          style={{
            marginTop: 12,
            borderRadius: 10,
            background: "#fff7ed",
            border: "1px solid #fed7aa",
            padding: 11,
            color: "#9a3412",
            fontSize: 11,
            lineHeight: 1.5,
          }}
        >
          Historical climate is not loaded yet.
          Return to the Location page and load a
          historical climate profile first.
        </div>
      )}

      {historicalClimate && (
        <div
          style={{
            marginTop: 12,
            display: "flex",
            gap: 14,
            flexWrap: "wrap",
            fontSize: 11,
            color: "#64748b",
          }}
        >
          <span>
            {historicalClimate.years_available} years
          </span>

          <span>
            {historicalClimate.hourly_samples.toLocaleString()}{" "}
            samples
          </span>

          <span>
            Source:{" "}
            {historicalClimate.source}
          </span>
        </div>
      )}
    </section>
  );
}