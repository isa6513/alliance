import { CreateClientConfig } from "@hey-api/client-fetch";
import { getApiUrl } from "./config";
import { authRefreshTokens } from "../client";

export const AuthEvents = {
  onUnauthorized: () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }
  },
};

export const createClientConfig: CreateClientConfig = (config) => {
  const originalFetch = (config?.fetch ?? fetch).bind(globalThis);

  const wrappedFetch: typeof fetch = async (
    input: RequestInfo | URL,
    init?: RequestInit
  ) => {
    const req = new Request(input, init);
    const retryReq = req.clone();

    let res: Response;

    try {
      res = await originalFetch(req);
    } catch (err) {
      console.error("Network error in fetch", err);
      throw err;
    }

    if (
      res.status !== 401 ||
      req.url.includes("auth/refresh") ||
      window.location.pathname.includes("/login") ||
      window.location.pathname.includes("/signup")
    ) {
      return res;
    }

    try {
      const refreshRes = await authRefreshTokens();
      if (refreshRes.response.ok) {
        const retryRes = await originalFetch(retryReq);
        if (retryRes.status !== 401) {
          return retryRes;
        }
      }
    } catch (err) {
      console.error("Error with refresh / retry", err);
      throw err;
    }

    console.log("onUnauthorized");
    AuthEvents.onUnauthorized();
    return res;
  };

  const baseUrl = getApiUrl();

  return {
    baseUrl,
    credentials: "include" as const,
    fetch: wrappedFetch,
    throwOnError: false,
  };
};
