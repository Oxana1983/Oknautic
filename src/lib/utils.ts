import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// For interpolating user input into HTML email templates
export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type GeoPoint = { lat: number | null; lng: number | null };

// Great-circle distance in km (same formula as public.distance_km)
export function distanceKm(a: GeoPoint, b: GeoPoint): number | null {
  if (a.lat == null || a.lng == null || b.lat == null || b.lng == null) return null;
  const rad = (d: number) => (d * Math.PI) / 180;
  const h =
    Math.sin(rad(b.lat - a.lat) / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

export function formatDistance(km: number | null | undefined, locale: string): string | null {
  if (km == null) return null;
  if (km < 1) return "< 1 km";
  return `${Math.round(km).toLocaleString(locale)} km`;
}

// "TBD" was the placeholder before delivery cities were collected
export function isRealDeliveryArea(area: string | null | undefined): area is string {
  return !!area && area !== "TBD";
}
