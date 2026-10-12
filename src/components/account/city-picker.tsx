"use client";

import { useState, useRef, useEffect } from "react";
import { MapPin, X, Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

type Place = {
  display_name: string;
  city: string;
  country: string;
  country_code: string;
  lat: string;
  lon: string;
};

type Props = {
  value: { city: string; country: string; lat: number | null; lng: number | null } | null;
  onChange: (val: { city: string; country: string; lat: number; lng: number } | null) => void;
};

function flag(countryCode: string) {
  return countryCode
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(0x1f1e0 + c.charCodeAt(0) - 65))
    .join("");
}

export function CityPicker({ value, onChange }: Props) {
  const t = useTranslations("profile");
  // Photon has no Russian; English names read fine for ru users
  const lang = useLocale() === "it" ? "it" : "en";
  const [query, setQuery] = useState(value ? `${value.city}, ${value.country}` : "");
  const [results, setResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function search(q: string) {
    setQuery(q);
    if (timer.current) clearTimeout(timer.current);
    if (q.length < 2) { setResults([]); setOpen(false); return; }

    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        // Photon (OSM data) — unlike Nominatim, its usage policy allows
        // search-as-you-type
        const params = new URLSearchParams({ q, limit: "8", lang });
        for (const tag of ["place:city", "place:town", "place:village"]) params.append("osm_tag", tag);
        const res = await fetch(`https://photon.komoot.io/api/?${params}`);
        const data = await res.json();
        type Feature = {
          properties: { name?: string; country?: string; countrycode?: string; state?: string };
          geometry: { coordinates: [number, number] };
        };
        const places: Place[] = ((data?.features ?? []) as Feature[])
          .filter((f) => f.properties.name)
          .slice(0, 5)
          .map((f) => ({
            display_name: [f.properties.name, f.properties.state, f.properties.country].filter(Boolean).join(", "),
            city: f.properties.name!,
            country: f.properties.country ?? "",
            country_code: (f.properties.countrycode ?? "").toLowerCase(),
            lat: String(f.geometry.coordinates[1]),
            lon: String(f.geometry.coordinates[0]),
          }));
        setResults(places);
        setOpen(places.length > 0);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
  }

  function select(place: Place) {
    setQuery(`${place.city}, ${place.country}`);
    setOpen(false);
    setResults([]);
    onChange({ city: place.city, country: place.country, lat: parseFloat(place.lat), lng: parseFloat(place.lon) });
  }

  function clear() {
    setQuery("");
    setResults([]);
    setOpen(false);
    onChange(null);
  }

  const inputCls =
    "w-full h-10 pl-9 pr-8 rounded-xl border border-navy-200 bg-white text-sm text-navy-900 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition";

  return (
    <div ref={containerRef} className="relative">
      <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none" />
      <input
        value={query}
        onChange={(e) => search(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder={t("locationPlaceholder")}
        className={inputCls}
        autoComplete="off"
      />
      {loading && (
        <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 animate-spin" />
      )}
      {!loading && query && (
        <button
          type="button"
          onClick={clear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-300 hover:text-navy-600 transition-colors"
        >
          <X size={14} />
        </button>
      )}

      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-navy-100 rounded-xl shadow-lg overflow-hidden">
          {results.map((place, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => select(place)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left hover:bg-navy-50 transition-colors"
              >
                <span className="text-base leading-none shrink-0">
                  {place.country_code ? flag(place.country_code) : "🌍"}
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-navy-800 truncate">{place.city}</p>
                  <p className="text-xs text-navy-400 truncate">{place.display_name.split(", ").slice(1).join(", ")}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
