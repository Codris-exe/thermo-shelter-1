import { WindowConfig } from "./geometry";

export interface SolarPosition {
  zenithDeg: number;
  azimuthDeg: number;
  elevationDeg: number;
  isAboveHorizon: boolean;
}

export function calculateSolarPosition(
  timestamp: string | Date,
  latitude: number,
  longitude: number
): SolarPosition {
  const date = new Date(timestamp);
  const startOfYear = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / 86400000) + 1;

  const b = (2 * Math.PI * (dayOfYear - 1)) / 365;
  const eot =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(b) -
      0.032077 * Math.sin(b) -
      0.014615 * Math.cos(2 * b) -
      0.040849 * Math.sin(2 * b));

  const declination =
    23.45 * Math.sin(((360 / 365) * (dayOfYear + 284) * Math.PI) / 180);
  const declinationRad = (declination * Math.PI) / 180;
  const latRad = (latitude * Math.PI) / 180;

  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60;
  const solarTime = utcHours + (4 * longitude + eot) / 60;
  let hourAngleDeg = 15 * (solarTime - 12);
  while (hourAngleDeg > 180) hourAngleDeg -= 360;
  while (hourAngleDeg < -180) hourAngleDeg += 360;
  const hourAngleRad = (hourAngleDeg * Math.PI) / 180;

  const sinElevation =
    Math.sin(latRad) * Math.sin(declinationRad) +
    Math.cos(latRad) * Math.cos(declinationRad) * Math.cos(hourAngleRad);
  const elevationRad = Math.asin(Math.max(-1, Math.min(1, sinElevation)));
  const elevationDeg = (elevationRad * 180) / Math.PI;
  const zenithDeg = 90 - elevationDeg;

  let azimuthDeg = 180;
  if (elevationDeg > -5) {
    const cosAzimuth =
      (Math.sin(declinationRad) * Math.cos(latRad) -
        Math.cos(declinationRad) * Math.sin(latRad) * Math.cos(hourAngleRad)) /
      (Math.cos(elevationRad) || 0.001);
    const azRad = Math.acos(Math.max(-1, Math.min(1, cosAzimuth)));
    azimuthDeg = hourAngleDeg > 0 ? 360 - (azRad * 180) / Math.PI : (azRad * 180) / Math.PI;
  }

  return {
    zenithDeg: Math.max(0, zenithDeg),
    azimuthDeg: (azimuthDeg + 360) % 360,
    elevationDeg,
    isAboveHorizon: elevationDeg > 0,
  };
}

export function calculateWindowSolarGain(
  windows: WindowConfig[],
  orientationDeg: number,
  solarZenithDeg: number,
  solarAzimuthDeg: number,
  ghiWm2: number,
  dniWm2: number,
  dhiWm2: number
): number {
  if (solarZenithDeg >= 90 || ghiWm2 <= 0) {
    return 0.0;
  }

  const southAzimuth = orientationDeg % 360;
  const wallAzimuths: Record<string, number> = {
    south: southAzimuth,
    north: (southAzimuth + 180) % 360,
    east: (southAzimuth - 90 + 360) % 360,
    west: (southAzimuth + 90) % 360,
  };

  let totalSolarGainW = 0.0;

  for (const window of windows) {
    const surfaceAzimuth = wallAzimuths[window.wall] ?? southAzimuth;
    const zenithRad = (solarZenithDeg * Math.PI) / 180;
    const azimuthDiffRad = ((solarAzimuthDeg - surfaceAzimuth) * Math.PI) / 180;

    // For vertical walls (tilt = 90 deg):
    const cosIncidence = Math.sin(zenithRad) * Math.cos(azimuthDiffRad);
    const incidentBeam = Math.max(0, cosIncidence) * (dniWm2 || ghiWm2 * 0.75);
    const incidentDiffuse = (dhiWm2 || ghiWm2 * 0.25) * 0.5; // view factor to sky = 0.5
    const groundReflected = ghiWm2 * 0.2 * 0.5; // albedo = 0.2, ground view factor = 0.5

    const poaTotal = incidentBeam + incidentDiffuse + groundReflected;
    const windowArea = window.width_m * window.height_m;
    const transmittedPower = poaTotal * windowArea * window.solar_transmittance;

    totalSolarGainW += transmittedPower;
  }

  return Math.max(0, totalSolarGainW);
}
