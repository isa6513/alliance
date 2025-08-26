import {
  base_url,
  getWebSocketUrl as getWebSocketUrlShared,
} from "@alliance/shared/lib/config";

export const getWebSocketUrl = (): string => {
  return getWebSocketUrlShared(import.meta.env.MODE);
};

export const getApiUrl = (): string => {
  if (import.meta.env.REACT_APP_API_URL) {
    return import.meta.env.REACT_APP_API_URL;
  }

  if (import.meta.env.MODE === "development") {
    return "http://localhost:3005";
  } else {
    return base_url + "/adminapi";
  }
};
