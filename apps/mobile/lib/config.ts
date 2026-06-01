import { NativeModules } from "react-native";
import { getVisualTestApiUrl } from "./visualTest";

export const getApiUrl = (): string => {
  const visualTestApiUrl = getVisualTestApiUrl();
  if (visualTestApiUrl) {
    return visualTestApiUrl;
  }

  if (__DEV__) {
    const url = NativeModules.SourceCode.getConstants().scriptURL;
    const ip = !!url ? url.split(":")[1].substring(2) : undefined;
    const addr = ip ?? process.env.EXPO_PUBLIC_DEV_API_URL ?? "localhost";
    return "http://" + addr + ":3005";
  } else {
    return "https://worldalliance.org/api";
  }
};

export const getBaseUrl = (): string => {
  const apiUrl = getApiUrl();
  return apiUrl.replace(/\/api\/?$/, "") || "https://worldalliance.org";
};

export const getImageSource = (string: string) => {
  return `${getApiUrl()}/images/${string}`;
};

export const getTurnstileSiteKey = (): string | undefined => {
  const key = process.env.EXPO_PUBLIC_TURNSTILE_SITE_KEY;
  return key ? key : undefined;
};

export const getWebSocketUrl = (): string => {
  const baseUrl = getBaseUrl();
  if (baseUrl.startsWith("https://")) {
    return baseUrl.replace("https://", "wss://");
  }
  if (baseUrl.startsWith("http://")) {
    return baseUrl.replace("http://", "ws://");
  }
  return baseUrl;
};
