import isURL, { type IsURLOptions } from "validator/lib/isURL";

export const HTTP_URL_VALIDATOR_OPTIONS: IsURLOptions = {
  require_protocol: true,
  protocols: ["http", "https"],
};

export const isValidHttpUrl = (value: string): boolean =>
  isURL(value.trim(), HTTP_URL_VALIDATOR_OPTIONS);

export function appendQueryParam(
  url: string,
  paramName: string,
  value: string,
): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.append(paramName, value);
    return parsed.toString();
  } catch {
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}${encodeURIComponent(paramName)}=${encodeURIComponent(value)}`;
  }
}
