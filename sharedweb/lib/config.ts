const mode = (import.meta as unknown as { env: { MODE: string } }).env.MODE;

const prod_url = (import.meta as unknown as { env: { VITE_API_URL: string } })
  .env.VITE_API_URL;

export const getWebSocketUrl = (mode: string): string => {
  if (mode === "development") {
    return "http://localhost:3005";
  } else {
    return prod_url;
  }
};

export const isProduction = (): boolean => {
  return mode === "production";
};

export const isStaging = (): boolean => {
  return mode === "staging";
};

export const getBaseUrl = (): string => {
  if (mode === "development") {
    return "http://localhost:5173";
  } else {
    return prod_url;
  }
};

export const memberProfileUrl = (id: number | string): string =>
  `${getBaseUrl()}/member/${id}`;

export const getApiUrl = (): string => {
  if (mode === "development") {
    return "http://localhost:3005";
  } else {
    return prod_url + "/api";
  }
};

export const sharp_allowed_mime_types = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/svg",
  "image/tiff",
];
