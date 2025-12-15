import { Check } from "lucide-react";
import * as React from "react";

type TimeZoneValue = string;

type Props = {
  value?: TimeZoneValue;
  defaultValue?: TimeZoneValue; // defaults to America/Los_Angeles
  onChange?: (tz: TimeZoneValue) => void;

  placeholder?: string;
  disabled?: boolean;
  className?: string;

  // optional: 12h vs 24h
  hour12?: boolean;
};

export type TzOption = {
  group: string;
  label: string; // what you show
  tz: string; // what you store (IANA)
};

export const TZ_OPTIONS: TzOption[] = [
  // US/Canada
  {
    group: "US/Canada",
    label: "Pacific Time - US & Canada",
    tz: "America/Los_Angeles",
  },
  {
    group: "US/Canada",
    label: "Mountain Time - US & Canada",
    tz: "America/Denver",
  },
  {
    group: "US/Canada",
    label: "Central Time - US & Canada",
    tz: "America/Chicago",
  },
  {
    group: "US/Canada",
    label: "Eastern Time - US & Canada",
    tz: "America/New_York",
  },
  { group: "US/Canada", label: "Alaska Time", tz: "America/Anchorage" },
  { group: "US/Canada", label: "Arizona, Yukon Time", tz: "America/Phoenix" }, // no DST (like Yukon most of the year)
  { group: "US/Canada", label: "Newfoundland Time", tz: "America/St_Johns" },
  { group: "US/Canada", label: "Hawaii Time", tz: "Pacific/Honolulu" },

  // America
  { group: "America", label: "Mexico City Time", tz: "America/Mexico_City" },
  {
    group: "America",
    label: "Bogota, Jamaica, Lima Time",
    tz: "America/Bogota",
  },
  { group: "America", label: "Caracas Time", tz: "America/Caracas" },
  { group: "America", label: "Santiago Time", tz: "America/Santiago" },
  {
    group: "America",
    label: "Buenos Aires Time",
    tz: "America/Argentina/Buenos_Aires",
  },
  { group: "America", label: "Brasilia Time", tz: "America/Sao_Paulo" },

  // Europe
  { group: "Europe", label: "UK, Ireland, Lisbon Time", tz: "Europe/London" },
  { group: "Europe", label: "Central European Time", tz: "Europe/Paris" },
  { group: "Europe", label: "Eastern European Time", tz: "Europe/Athens" },
  { group: "Europe", label: "Turkey Time", tz: "Europe/Istanbul" },
  { group: "Europe", label: "Moscow Time", tz: "Europe/Moscow" },

  // Africa
  { group: "Africa", label: "West Africa Time", tz: "Africa/Lagos" },
  { group: "Africa", label: "Central Africa Time", tz: "Africa/Kinshasa" },
  { group: "Africa", label: "South Africa Time", tz: "Africa/Johannesburg" },
  { group: "Africa", label: "East Africa Time", tz: "Africa/Nairobi" },
  { group: "Africa", label: "Egypt Time", tz: "Africa/Cairo" },

  // Asia
  { group: "Asia", label: "Dubai Time", tz: "Asia/Dubai" },
  { group: "Asia", label: "Tehran Time", tz: "Asia/Tehran" },
  { group: "Asia", label: "Pakistan, Maldives Time", tz: "Asia/Karachi" },
  { group: "Asia", label: "India, Sri Lanka Time", tz: "Asia/Kolkata" },
  { group: "Asia", label: "Kathmandu Time", tz: "Asia/Kathmandu" },
  { group: "Asia", label: "Bangladesh Time", tz: "Asia/Dhaka" },
  { group: "Asia", label: "Indochina Time", tz: "Asia/Bangkok" },
  { group: "Asia", label: "China, Singapore, Perth", tz: "Asia/Shanghai" },
  { group: "Asia", label: "Japan, Korea Time", tz: "Asia/Tokyo" },

  // Australia
  { group: "Australia", label: "Australia/Perth", tz: "Australia/Perth" },
  { group: "Australia", label: "Australia/Darwin", tz: "Australia/Darwin" },
  { group: "Australia", label: "Adelaide Time", tz: "Australia/Adelaide" },
  { group: "Australia", label: "Brisbane Time", tz: "Australia/Brisbane" },
  {
    group: "Australia",
    label: "Sydney, Melbourne Time",
    tz: "Australia/Sydney",
  },
  {
    group: "Australia",
    label: "Australia/Lord Howe",
    tz: "Australia/Lord_Howe",
  },

  // Pacific
  { group: "Pacific", label: "Auckland Time", tz: "Pacific/Auckland" },
  { group: "Pacific", label: "Pacific/Chatham", tz: "Pacific/Chatham" },
  { group: "Pacific", label: "Pacific/Fiji", tz: "Pacific/Fiji" },
  { group: "Pacific", label: "Pacific/Apia", tz: "Pacific/Apia" },
  { group: "Pacific", label: "Pacific/Kiritimati", tz: "Pacific/Kiritimati" },
];

function formatNowTimeInTz(tz: string, hour12: boolean) {
  return new Intl.DateTimeFormat(undefined, {
    timeZone: tz,
    hour: "numeric",
    minute: "2-digit",
    hour12,
  }).format(new Date());
}

function getOffsetMinutes(tz: string): number | null {
  // Uses "shortOffset" (e.g., "GMT-8") where supported
  try {
    const parts = new Intl.DateTimeFormat("en", {
      timeZone: tz,
      timeZoneName: "shortOffset",
      hour: "2-digit",
    }).formatToParts(new Date());

    const off = parts.find((p) => p.type === "timeZoneName")?.value ?? "";
    // Examples: "GMT-08:00", "GMT-8", "UTC+05:30"
    const m = off.match(/([+-])(\d{1,2})(?::?(\d{2}))?/i);
    if (!m) return null;
    const sign = m[1] === "-" ? -1 : 1;
    const hh = parseInt(m[2], 10);
    const mm = m[3] ? parseInt(m[3], 10) : 0;
    return sign * (hh * 60 + mm);
  } catch {
    return null;
  }
}

export default function TimeZoneSelectPretty({
  value,
  defaultValue = "America/Los_Angeles",
  onChange,
  placeholder = "Select time zone…",
  disabled,
  className,
  hour12 = true,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);

  const [internalValue, setInternalValue] = React.useState<TimeZoneValue>(
    value ?? defaultValue
  );

  // keep internal in sync with controlled value
  React.useEffect(() => {
    if (value != null) setInternalValue(value);
  }, [value]);

  // tick every 30s so displayed times stay fresh
  const [, forceTick] = React.useState(0);
  React.useEffect(() => {
    const id = window.setInterval(() => forceTick((x) => x + 1), 30_000);
    return () => window.clearInterval(id);
  }, []);
  type Item = {
    tz: string;
    labelLeft: string;
    searchText: string;
    offsetMins: number | null;
    observesDst?: boolean;
  };

  function observesDst(tz: string) {
    // crude but effective: compare offsets in winter vs summer (UTC dates)
    const jan = getOffsetMinutes(tz);
    const jul = getOffsetMinutes(tz);
    if (jan == null || jul == null) return false;
    return jan !== jul;
  }

  function prettyCityFromIana(tz: string) {
    // last segment, underscore -> space
    const seg = tz.split("/").pop() ?? tz;
    return seg.replace(/_/g, " ");
  }

  function getGenericLabelFromIntl(tz: string) {
    // "Pacific Time", "Central European Time", etc.
    const now = new Date();
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "longGeneric",
    }).formatToParts(now);
    return parts.find((p) => p.type === "timeZoneName")?.value ?? null;
  }

  const allItems = React.useMemo<Item[]>(() => {
    const tzs = TZ_OPTIONS.map((tz) => tz.tz);

    const items: Item[] = tzs.map((tz) => {
      const generic = getGenericLabelFromIntl(tz);
      const city = prettyCityFromIana(tz);
      const left = generic ? `${generic} — ${city}` : city;

      const offsetMins = getOffsetMinutes(tz);
      const dst = observesDst(tz);

      return {
        tz,
        labelLeft: `${left}`.trim(),
        searchText: `${left} ${tz}`.toLowerCase(),
        offsetMins,
        observesDst: dst,
      };
    });

    items.sort(
      (a, b) =>
        a.offsetMins! - b.offsetMins! || a.labelLeft.localeCompare(b.labelLeft)
    );

    return items;
  }, []);

  const selected = React.useMemo(() => {
    return (
      allItems.find((i) => i.tz === internalValue) ?? {
        tz: internalValue,
        labelLeft: internalValue,
        searchText: internalValue.toLowerCase(),
        offsetMins: getOffsetMinutes(internalValue),
      }
    );
  }, [allItems, internalValue]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? allItems.filter((i) => i.searchText.includes(q))
      : allItems;
    return list;
  }, [allItems, query]);

  React.useEffect(() => {
    // reset highlight when filtering
    setActiveIndex(0);
  }, [query, open]);

  function commit(tz: string) {
    if (disabled) return;
    if (value == null) setInternalValue(tz);
    onChange?.(tz);
    setOpen(false);
  }

  function onTriggerKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen((v) => !v);
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex(0);
    }
  }

  function onListKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const item = filtered[activeIndex];
      if (item) commit(item.tz);
      return;
    }
  }

  return (
    <div className={className ?? ""}>
      <div className="relative max-w-[700px]">
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setOpen((v) => !v)}
          onKeyDown={onTriggerKeyDown}
          className={[
            "w-full rounded border border-zinc-300 bg-white px-3 py-3 text-left",
            "hover:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300",
            "disabled:opacity-50 disabled:cursor-not-allowed",
          ].join(" ")}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-zinc-900">
                {selected.labelLeft || placeholder}
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-sm">
                {formatNowTimeInTz(selected.tz, hour12)}
              </div>
              <svg
                width="16"
                height="16"
                viewBox="0 0 20 20"
                className="opacity-70"
              >
                <path
                  d="M5.5 7.5L10 12l4.5-4.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </button>

        {open && !disabled && (
          <div
            className="absolute z-50 w-full rounded border border-zinc-200 bg-white shadow-lg overflow-hidden"
            onKeyDown={onListKeyDown}
          >
            <div className="p-2 border-b border-zinc-100">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search time zones…"
                className="w-full rounded-lg px-3 py-2 focus:outline-none"
              />
            </div>

            <div className="max-h-[320px] overflow-auto">
              {filtered.length === 0 ? (
                <div className="p-3 text-zinc-500">No matches</div>
              ) : (
                filtered.map((item, idx) => {
                  const isActive = idx === activeIndex;
                  const isSelected = item.tz === selected.tz;
                  const time = formatNowTimeInTz(item.tz, hour12);

                  return (
                    <button
                      key={item.tz}
                      type="button"
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => commit(item.tz)}
                      className={[
                        "w-full px-3 py-3 text-left",
                        "flex items-center justify-between gap-3",
                        isActive ? "bg-zinc-100" : "bg-white",
                        selected.tz === item.tz
                          ? "!bg-green/10 text-white"
                          : "",
                      ].join(" ")}
                    >
                      <div className="truncate text-zinc-900">
                        {item.labelLeft}
                      </div>
                      <div className="shrink-0 flex items-center gap-2">
                        <div className="text-[14px] tabular-nums text-zinc-800">
                          {time}
                        </div>
                        {isSelected && (
                          <Check
                            className="w-4 h-4 text-green"
                            strokeWidth={3}
                          />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* click-away close */}
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 cursor-default"
          onClick={() => setOpen(false)}
          aria-label="Close"
          tabIndex={-1}
          style={{ background: "transparent" }}
        />
      )}
    </div>
  );
}
