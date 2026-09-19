export interface GeometryConfig {
  shape: "rectangular" | "square" | "cylindrical" | "dome";
  length_m: number;
  width_m: number;
  height_m: number;
}

export interface WindowConfig {
  wall: "north" | "south" | "east" | "west";
  width_m: number;
  height_m: number;
  u_value_w_m2k: number;
  solar_transmittance: number;
}

export interface DoorConfig {
  wall: "north" | "south" | "east" | "west";
  width_m: number;
  height_m: number;
  u_value_w_m2k: number;
}

export interface WallGeometry {
  north_area_m2: number;
  south_area_m2: number;
  east_area_m2: number;
  west_area_m2: number;
  gross_wall_area_m2: number;
  opening_area_m2: number;
  opaque_wall_area_m2: number;
}

export interface ShelterGeometryResult {
  floor_area_m2: number;
  roof_area_m2: number;
  gross_wall_area_m2: number;
  opening_area_m2: number;
  opaque_wall_area_m2: number;
  volume_m3: number;
  surface_area_m2: number;
  surface_to_volume_ratio: number;
  walls: WallGeometry;
}

export function calculateGeometry(
  geometry: GeometryConfig,
  windows: WindowConfig[] = [],
  doors: DoorConfig[] = []
): ShelterGeometryResult {
  const { length_m: length, width_m: width, height_m: height } = geometry;

  const floor_area = length * width;
  const roof_area = floor_area;
  const volume = floor_area * height;

  const north_area = length * height;
  const south_area = length * height;
  const east_area = width * height;
  const west_area = width * height;

  const gross_wall_area = north_area + south_area + east_area + west_area;

  const opening_area =
    windows.reduce((sum, w) => sum + w.width_m * w.height_m, 0) +
    doors.reduce((sum, d) => sum + d.width_m * d.height_m, 0);

  const opaque_wall_area = Math.max(0, gross_wall_area - opening_area);
  const surface_area = floor_area + roof_area + gross_wall_area;
  const surface_to_volume_ratio = surface_area / (volume || 1);

  return {
    floor_area_m2: floor_area,
    roof_area_m2: roof_area,
    gross_wall_area_m2: gross_wall_area,
    opening_area_m2: opening_area,
    opaque_wall_area_m2: opaque_wall_area,
    volume_m3: volume,
    surface_area_m2: surface_area,
    surface_to_volume_ratio,
    walls: {
      north_area_m2: north_area,
      south_area_m2: south_area,
      east_area_m2: east_area,
      west_area_m2: west_area,
      gross_wall_area_m2: gross_wall_area,
      opening_area_m2: opening_area,
      opaque_wall_area_m2: opaque_wall_area,
    },
  };
}
