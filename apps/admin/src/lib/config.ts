import { getWebSocketUrl as getWebSocketUrlShared } from "@alliance/sharedweb/lib/config";

export const getWebSocketUrl = (): string => {
  return getWebSocketUrlShared(import.meta.env.MODE);
};
