import { getWebSocketUrl as getWebSocketUrlShared } from "@alliance/shared/lib/config";

export const getWebSocketUrl = (): string => {
  return getWebSocketUrlShared(import.meta.env.MODE);
};
