import type {
  HistoricalClimateProfilePoint,
  HistoricalClimateResult,
} from "../stores/historicalClimateStore";

export interface SimulationWeatherPoint {
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

/**
 * Convert the representative historical 24-hour climate profile
 * into the same WeatherPoint structure already used by the
 * thermal simulation endpoint.
 *
 * We use a fixed reference date only to create a chronological
 * 24-hour sequence. The weather values themselves come entirely
 * from the historical climate profile.
 */
export function historicalClimateToSimulationWeather(
  climate: HistoricalClimateResult,
): SimulationWeatherPoint[] {
  const referenceDate = new Date(
    "2025-01-15T00:00:00Z",
  );

  const profile =
    climate.climate_profile
      .slice()
      .sort(
        (a, b) =>
          a.hour_of_day - b.hour_of_day,
      );

  return profile.map(
    (
      point: HistoricalClimateProfilePoint,
    ) => {
      const timestamp = new Date(
        referenceDate.getTime(),
      );

      timestamp.setUTCHours(
        point.hour_of_day,
        0,
        0,
        0,
      );

      const solar =
        point.average_solar_irradiance_w_m2 ?? 0;

      const direct =
        point.average_direct_radiation_w_m2 ?? 0;

      const diffuse =
        point.average_diffuse_radiation_w_m2 ?? 0;

      const dni =
        point.average_direct_normal_irradiance_w_m2 ??
        0;

      return {
        timestamp: timestamp.toISOString(),

        outdoor_temperature_c:
          point.average_temperature_c ?? 0,

        wind_speed_m_s:
          point.average_wind_speed_m_s ?? 0,

        solar_irradiance_w_m2: Math.max(
          0,
          solar,
        ),

        /*
         * The thermal engine currently calculates
         * shelter-specific solar gain from the solar
         * irradiance and the design's glazing.
         *
         * Therefore this value remains zero here.
         */
        solar_gain_w: 0,

        direct_radiation_w_m2: Math.max(
          0,
          direct,
        ),

        diffuse_radiation_w_m2: Math.max(
          0,
          diffuse,
        ),

        direct_normal_irradiance_w_m2: Math.max(
          0,
          dni,
        ),

        cloud_cover_pct:
          point.average_cloud_cover_pct,

        is_day:
          point.daylight_fraction !== null &&
          point.daylight_fraction > 0.5,

        relative_humidity_pct:
          point.average_relative_humidity_pct,

        ground_temperature_c: null,
      };
    },
  );
}