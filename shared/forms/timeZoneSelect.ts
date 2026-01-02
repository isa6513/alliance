import { useEffect, useMemo, useState } from "react";
import {
  TZ_OPTIONS,
  formatNowTimeInTz,
  getGenericLabelFromIntl,
  getOffsetMinutes,
  prettyCityFromIana,
} from "@alliance/shared/lib/timezones";

export type TimeZoneValue = string;

export type TimeZoneSelectItem = {
  tz: TimeZoneValue;
  labelLeft: string;
  searchText: string;
  offsetMins: number | null;
  timeLabel: string;
};

export const DEFAULT_TIMEZONE = "America/Los_Angeles";

const OBSERVER_REFRESH_MS = 30_000;

function baseItems(): Omit<TimeZoneSelectItem, "timeLabel">[] {
  const tzs = TZ_OPTIONS.map((tz) => tz.tz);

  const items = tzs.map((tz) => {
    const generic = getGenericLabelFromIntl(tz);
    const city = prettyCityFromIana(tz);
    const left = generic ? `${generic} — ${city}` : city;

    const offsetMins = getOffsetMinutes(tz);

    return {
      tz,
      labelLeft: `${left}`.trim(),
      searchText: `${left} ${tz}`.toLowerCase(),
      offsetMins,
    };
  });

  items.sort(
    (a, b) =>
      (a.offsetMins ?? 0) - (b.offsetMins ?? 0) ||
      a.labelLeft.localeCompare(b.labelLeft)
  );

  return items;
}

export type UseTimeZoneSelectParams = {
  value?: TimeZoneValue;
  defaultValue?: TimeZoneValue;
  onChange?: (tz: TimeZoneValue) => void;
  hour12?: boolean;
  disabled?: boolean;
};

export function useTimeZoneSelect({
  value,
  defaultValue = DEFAULT_TIMEZONE,
  onChange,
  hour12 = true,
  disabled,
}: UseTimeZoneSelectParams) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [internalValue, setInternalValue] = useState<TimeZoneValue>(
    value ?? defaultValue
  );

  const [tick, forceTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => forceTick((x) => x + 1), OBSERVER_REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (value != null) setInternalValue(value);
  }, [value]);

  const items = useMemo<TimeZoneSelectItem[]>(() => {
    const base = baseItems();
    return base.map((item) => ({
      ...item,
      timeLabel: formatNowTimeInTz(item.tz, hour12),
    }));
  }, [hour12, tick]);

  const selected = useMemo<TimeZoneSelectItem>(() => {
    return (
      items.find((i) => i.tz === internalValue) ?? {
        tz: internalValue,
        labelLeft: internalValue,
        searchText: internalValue.toLowerCase(),
        offsetMins: getOffsetMinutes(internalValue),
        timeLabel: formatNowTimeInTz(internalValue, hour12),
      }
    );
  }, [items, internalValue, hour12]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? items.filter((i) => i.searchText.includes(q)) : items;
    return list;
  }, [items, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  const commit = (tz: string) => {
    if (disabled) return;
    if (value == null) setInternalValue(tz);
    onChange?.(tz);
    setOpen(false);
  };

  return {
    items,
    filtered,
    selected,
    query,
    setQuery,
    activeIndex,
    setActiveIndex,
    commit,
    open,
    setOpen,
    disabled,
  };
}
