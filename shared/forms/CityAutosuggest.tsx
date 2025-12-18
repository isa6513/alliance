import React, { useState, useEffect, useRef, useCallback } from "react";
import type { CitySearchDto } from "../client";
import { geoSearchCity } from "../client";

export interface CityAutosuggestProps {
  value?: string;
  onSelect(city: CitySearchDto | string): void;
  placeholder?: string;
  minLength?: number;
  debounceMs?: number;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  allowCustomValue?: boolean;
}

const CityAutosuggest: React.FC<CityAutosuggestProps> = ({
  value = "",
  onSelect,
  placeholder = "Search a city …",
  minLength = 1,
  debounceMs = 100,
  className = "",
  inputClassName = "",
  disabled = false,
  allowCustomValue = true,
}) => {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<CitySearchDto[]>([]);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const [didSelect, setDidSelect] = useState(false);
  const ctrl = useRef<AbortController | null>(null);
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [geoFetched, setGeoFetched] = useState(false);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const fetchGeolocation = useCallback(async () => {
    if (geoFetched) return;
    try {
      const res = await fetch("https://ipapi.co/json/");
      const data = await res.json();
      if (data.latitude && data.longitude) {
        setLatitude(data.latitude);
        setLongitude(data.longitude);
      }
    } catch (err) {
      console.error("Failed to fetch geolocation:", err);
    }
    setGeoFetched(true);
  }, [geoFetched]);

  const fetchCities = useCallback(
    async (name: string) => {
      if (name.length < minLength) {
        setResults([]);
        return;
      }
      ctrl.current?.abort();
      ctrl.current = new AbortController();
      try {
        const res = await geoSearchCity({
          query: { query: name, latitude, longitude },
        });
        if (!res.data) {
          console.log(res.error);
          throw new Error("Geo search failed");
        }
        const data: CitySearchDto[] = res.data;
        setResults(data);
        setOpen(true);
        setHighlighted(-1);
      } catch (err) {
        if ((err as Error)?.name !== "AbortError") console.error(err);
      }
    },
    [minLength, latitude, longitude]
  );

  useEffect(() => {
    if (didSelect) return;
    const id = window.setTimeout(() => fetchCities(query), debounceMs);
    return () => window.clearTimeout(id);
  }, [query, fetchCities, debounceMs, didSelect]);

  const wrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, []);

  const commitCustomValue = useCallback(() => {
    if (!allowCustomValue || didSelect) return;
    const trimmed = query.trim();
    onSelect(trimmed);
    setDidSelect(true);
    setResults([]);
    setOpen(false);
    setHighlighted(-1);
    setQuery(trimmed);
  }, [allowCustomValue, didSelect, onSelect, query]);

  const select = useCallback(
    (city: CitySearchDto) => {
      onSelect(city);
      setDidSelect(true);
      setQuery(`${city.name}, ${city.countryName}`);
      setResults([]);
      setOpen(false);
    },
    [onSelect]
  );

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> =
    useCallback(
      (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          if (open && results[highlighted]) {
            select(results[highlighted]);
          } else {
            commitCustomValue();
          }
          return;
        }
        if (!open) return;
        setDidSelect(false);
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setHighlighted((i) => Math.min(i + 1, results.length - 1));
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setHighlighted((i) => Math.max(i - 1, 0));
        } else if (e.key === "Escape") {
          setOpen(false);
        }
      },
      [open, results, highlighted, select, commitCustomValue]
    );

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <input
        type="text"
        value={query}
        placeholder={placeholder}
        onChange={(e) => {
          setQuery(e.target.value);
          setDidSelect(false);
        }}
        onFocus={() => {
          fetchGeolocation();
          if (query.length >= minLength && results.length) setOpen(true);
        }}
        onBlur={commitCustomValue}
        onKeyDown={handleKeyDown}
        aria-autocomplete="list"
        autoComplete="off"
        disabled={disabled}
        className={`w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:border-gray-600 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500 ${inputClassName}`}
      />

      {open && results.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-gray-300 bg-white">
          {results.map((city: CitySearchDto, idx: number) => (
            <div
              key={`${city.name}-${city.admin1}-${city.countryCode}`}
              onMouseDown={() => select(city)}
              className={`cursor-pointer px-3 py-2 gap-2 flex flex-row ${
                idx === highlighted ? "bg-gray-200 " : "hover:bg-gray-100"
              }`}
            >
              <p>{city.name}</p>
              <p className="text-gray-500">
                {city.admin1 ? `${city.admin1}, ` : ""}
                {city.countryName}
              </p>
            </div>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CityAutosuggest;
