import { create } from "zustand";

export type HistoricalClimateProfilePoint = {
  hour_of_day: number;
  sample_count: number;

  average_temperature_c: number | null;
  minimum_temperature_c: number | null;
  maximum_temperature_c: number | null;

  average_relative_humidity_pct: number | null;
  average_wind_speed_m_s: number | null;

  average_solar_irradiance_w_m2: number | null;
  average_direct_radiation_w_m2: number | null;
  average_diffuse_radiation_w_m2: number | null;
  average_direct_normal_irradiance_w_m2: number | null;

  average_cloud_cover_pct: number | null;
  daylight_fraction: number | null;
};

export type HistoricalClimateResult = {
  latitude: number;
  longitude: number;

  requested_start_date: string;
  requested_end_date: string;

  actual_start_date: string;
  actual_end_date: string;

  timezone: string;
  model: string;

  elevation_m: number | null;

  years_available: number;
  hourly_samples: number;

  selected_month: number | null;

  profile_type: "hourly_profile" | "daily_profile";

  climate_profile: HistoricalClimateProfilePoint[];

  source: string;
};

type HistoricalClimateState = {
  result: HistoricalClimateResult | null;

  isLoading: boolean;

  error: string | null;

  selectedMonth: number | null;

  setResult: (
    result: HistoricalClimateResult,
  ) => void;

  setLoading: (
    isLoading: boolean,
  ) => void;

  setError: (
    error: string | null,
  ) => void;

  setSelectedMonth: (
    month: number | null,
  ) => void;

  clear: () => void;
};


export const useHistoricalClimateStore =
  create<HistoricalClimateState>((set) => ({
    result: null,

    isLoading: false,

    error: null,

    selectedMonth: null,

    setResult: (result) =>
      set({
        result,
        error: null,
        isLoading: false,
        selectedMonth: result.selected_month,
      }),

    setLoading: (isLoading) =>
      set({
        isLoading,
      }),

    setError: (error) =>
      set({
        error,
        isLoading: false,
      }),

    setSelectedMonth: (month) =>
      set({
        selectedMonth: month,
      }),

    clear: () =>
      set({
        result: null,
        isLoading: false,
        error: null,
        selectedMonth: null,
      }),
  }));