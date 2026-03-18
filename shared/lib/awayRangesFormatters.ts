import type { UserAwayRangeDto } from "../client";
import { formatShortDate } from "./dateFormatters";

export function formatAwayRange(range: UserAwayRangeDto): string {
  const start = new Date(range.startDate);
  const end = new Date(range.endDate);
  return `${formatShortDate(start)} - ${formatShortDate(end)}`;
}

export function formatAwayReason(reason?: string): string {
  return reason ? reason.charAt(0).toUpperCase() + reason.slice(1) : "";
}
