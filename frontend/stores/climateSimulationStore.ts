import { create } from "zustand";

export type ClimateSimulationMode =
  | "live"
  | "historical";

type ClimateSimulationState = {
  mode: ClimateSimulationMode;

  setMode: (
    mode: ClimateSimulationMode,
  ) => void;

  useLiveWeather: () => void;

  useHistoricalClimate: () => void;

  reset: () => void;
};

export const useClimateSimulationStore =
  create<ClimateSimulationState>((set) => ({
    mode: "historical",

    setMode: (mode) =>
      set({
        mode,
      }),

    useLiveWeather: () =>
      set({
        mode: "live",
      }),

    useHistoricalClimate: () =>
      set({
        mode: "historical",
      }),

    reset: () =>
      set({
        mode: "historical",
      }),
  }));