import type { AggregateViewSchema } from "../forms/formschema";

export const isAggregateViewSchema = (
  value: unknown,
): value is AggregateViewSchema => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as {
    kind?: unknown;
    id?: unknown;
    title?: unknown;
    caption?: unknown;
    numerator?: { value?: unknown };
    denominator?: { value?: unknown };
    displayType?: unknown;
  };

  return (
    candidate.kind === "progressbar" &&
    typeof candidate.id === "string" &&
    (candidate.title === undefined || typeof candidate.title === "string") &&
    (candidate.caption === undefined ||
      typeof candidate.caption === "string") &&
    typeof candidate.numerator === "object" &&
    candidate.numerator !== null &&
    typeof candidate.denominator === "object" &&
    candidate.denominator !== null &&
    (candidate.displayType === "number" || candidate.displayType === "dollars")
  );
};

export function parseAggregateViewsPayload(
  aggregateViews: unknown,
): AggregateViewSchema[] {
  if (!Array.isArray(aggregateViews)) {
    return [];
  }
  return aggregateViews.filter(isAggregateViewSchema);
}

const numberFormatter = new Intl.NumberFormat("en-US");
const decimalFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});
const dollarsFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatAggregateValue(
  value: number,
  displayType: AggregateViewSchema["displayType"],
): string {
  if (displayType === "dollars") {
    return dollarsFormatter.format(value);
  }
  return Number.isInteger(value)
    ? numberFormatter.format(value)
    : decimalFormatter.format(value);
}
