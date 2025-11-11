const prod_url = (import.meta as unknown as { env: { VITE_API_URL: string } })
  .env.VITE_API_URL;

export const getWebSocketUrl = (mode: string): string => {
  if (mode === "development") {
    return "http://localhost:3005";
  } else {
    return prod_url;
  }
};

export const getBaseUrl = (): string => {
  if (
    (import.meta as unknown as { env: { MODE: string } }).env.MODE ===
    "development"
  ) {
    return "http://localhost:5173";
  } else {
    return prod_url;
  }
};

export const getApiUrl = (): string => {
  if (
    (import.meta as unknown as { env: { MODE: string } }).env.MODE ===
    "development"
  ) {
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
