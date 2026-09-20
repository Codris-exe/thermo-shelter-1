export interface MaterialOption {
  id: string;
  name: string;
  thermal_conductivity_w_mk: number;
  density_kg_m3: number;
  specific_heat_j_kgk: number;
  solar_absorptivity: number;
  emissivity: number;
  category: string;
  description: string;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  "/backend-api";

export async function fetchMaterials(): Promise<MaterialOption[]> {
  const response = await fetch(
    `${API_BASE}/api/materials`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `Failed to load materials: ${response.status} ${errorText}`,
    );
  }

  const data =
    await response.json();

  if (!Array.isArray(data)) {
    throw new Error(
      "Material API returned an invalid response.",
    );
  }

  return data as MaterialOption[];
}