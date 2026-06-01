import { Features, isEnabled } from "@alliance/shared/lib/features";
import {
  getApiUrl,
  getWebSocketUrl as getWebSocketUrlShared,
} from "@alliance/sharedweb/lib/config";

export const getWebSocketUrl = (): string => {
  return getWebSocketUrlShared(import.meta.env.MODE);
};

export const getSingleActionSSEUrl = (actionId: number) => {
  return `${getApiUrl()}/actions/live/${actionId}`;
};

export const getBulkActionSSEUrl = (actionIds: number[]) => {
  return `${getApiUrl()}/actions/live-list?ids=${actionIds.join(",")}`;
};

export const isFeatureEnabled = (feature: Features) => {
  return isEnabled(feature, import.meta.env.MODE);
};

export const getTurnstileSiteKey = (): string | undefined => {
  const key = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;
  return key ? key : undefined;
};
