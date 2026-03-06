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

export const getImageSource = (string: string) => {
  return `${getApiUrl()}/images/${string}`;
};

export const getWebSocketUrl = (): string => {
  const apiUrl = getApiUrl();
  const baseUrl = apiUrl.replace(/\/api\/?$/, "");
  if (baseUrl.startsWith("https://")) {
    return baseUrl.replace("https://", "wss://");
  }
  if (baseUrl.startsWith("http://")) {
    return baseUrl.replace("http://", "ws://");
  }
  return baseUrl;
};
