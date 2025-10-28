import type { ColumnMetadataDto } from "@alliance/shared/client/types.gen";
import {
  formatTimeForDisplay,
  parseTimeInput,
} from "@alliance/shared/forms/timeUtils";

const TIME_RAW_TYPE_PREFIX = "time";
const TIME_PART_PATTERN = /(\d{1,2}):(\d{2})(?::(\d{2})(?:\.\d{1,6})?)?/i;

const pad = (value: number): string => String(value).padStart(2, "0");

const addSecondsIfMissing = (value: string): string =>
  value.length === 5 ? `${value}:00` : value;

const normalizeParts = (
  hourSegment: string,
  minuteSegment: string,
  secondSegment?: string
): string | null => {
  const hours = Number(hourSegment);
  const minutes = Number(minuteSegment);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  const hh = pad(hours);
  const mm = pad(minutes);

  if (secondSegment === undefined) {
    return `${hh}:${mm}`;
  }

  const seconds = Number(secondSegment);
  if (Number.isNaN(seconds) || seconds < 0 || seconds > 59) {
    return null;
  }

  if (seconds === 0) {
    return `${hh}:${mm}`;
  }

  const ss = pad(seconds);
  return `${hh}:${mm}:${ss}`;
};

export const isTimeOnlyColumn = (column: ColumnMetadataDto): boolean => {
  const rawType = column.rawType?.toLowerCase() ?? "";
  if (!rawType) return false;
  if (!rawType.startsWith(TIME_RAW_TYPE_PREFIX)) return false;
  return !rawType.includes("stamp");
};

export const parseTimeInputValue = (input: string): string | null => {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  const literalMatch = trimmed.match(
    /^(\d{1,2}):(\d{2})(?::(\d{2})(?:\.\d{1,6})?)?$/
  );
  if (literalMatch) {
    return normalizeParts(literalMatch[1], literalMatch[2], literalMatch[3]);
  }

  const parsed12Hour = parseTimeInput(trimmed);
  if (parsed12Hour) {
    return parsed12Hour.normalized;
  }

  const embeddedMatch = trimmed.match(TIME_PART_PATTERN);
  if (embeddedMatch) {
    return normalizeParts(embeddedMatch[1], embeddedMatch[2], embeddedMatch[3]);
  }

  return null;
};

export const normalizeTimeValue = (value: unknown): string | null => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string") {
    const parsed = parseTimeInputValue(value);
    return parsed;
  }

  if (value instanceof Date) {
    return normalizeParts(
      pad(value.getHours()),
      pad(value.getMinutes()),
      value.getSeconds() ? pad(value.getSeconds()) : undefined
    );
  }

  if (typeof value === "object") {
    const candidate =
      typeof (value as { toString?: () => string }).toString === "function"
        ? (value as { toString: () => string }).toString()
        : null;

    if (candidate && candidate !== "[object Object]") {
      const parsed = parseTimeInputValue(candidate);
      if (parsed) {
        return parsed;
      }
    }
  }

  return null;
};

export const formatTimeForDisplayValue = (value: unknown): string => {
  const normalized = normalizeTimeValue(value);
  if (!normalized) {
    if (value === null || value === undefined) {
      return "";
    }
    return String(value);
  }

  const base = formatTimeForDisplay(normalized.slice(0, 5));
  if (!base) {
    return normalized;
  }

  if (normalized.length > 5) {
    const seconds = normalized.slice(6);
    if (seconds && seconds !== "00") {
      return base.replace(" ", `:${seconds} `);
    }
  }

  return base;
};

export const toDatabaseTimeString = (value: unknown): string | null => {
  const normalized = normalizeTimeValue(value);
  if (!normalized) {
    return null;
  }

  return addSecondsIfMissing(normalized);
};
