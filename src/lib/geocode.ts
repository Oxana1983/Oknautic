// Server-side city geocoding via Photon (OpenStreetMap data, autocomplete-friendly
// usage policy). Used for inventory locations typed as plain text.

const PHOTON = "https://photon.komoot.io/api/";
const PLACE_TAGS = ["place:city", "place:town", "place:village"];

export type GeoCity = { city: string; country: string; lat: number; lng: number };

export async function geocodeCity(city: string, country?: string | null): Promise<GeoCity | null> {
  const q = [city.trim(), country?.trim()].filter(Boolean).join(", ");
  if (!q) return null;
  const params = new URLSearchParams({ q, limit: "1", lang: "en" });
  for (const tag of PLACE_TAGS) params.append("osm_tag", tag);
  try {
    const res = await fetch(`${PHOTON}?${params}`, {
      headers: { "User-Agent": "OKnautic/1.0 (https://www.oknautic.com)" },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const f = data?.features?.[0];
    if (!f) return null;
    const [lng, lat] = f.geometry.coordinates as [number, number];
    return { city: f.properties.name, country: f.properties.country ?? "", lat, lng };
  } catch {
    return null;
  }
}

// Geocodes each distinct "city|country" once; caps lookups per call so a
// big upload with many cities can't stall the request
const MAX_LOOKUPS = 25;

export async function geocodeMany(
  places: { city?: string | null; country?: string | null }[]
): Promise<Map<string, GeoCity | null>> {
  const out = new Map<string, GeoCity | null>();
  for (const p of places) {
    if (!p.city?.trim()) continue;
    const key = placeKey(p.city, p.country);
    if (out.has(key)) continue;
    out.set(key, out.size < MAX_LOOKUPS ? await geocodeCity(p.city, p.country) : null);
  }
  return out;
}

export function placeKey(city?: string | null, country?: string | null) {
  return `${city?.trim().toLowerCase() ?? ""}|${country?.trim().toLowerCase() ?? ""}`;
}
