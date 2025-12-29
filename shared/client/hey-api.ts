import { authRefreshTokens } from "@alliance/shared/client";
import { CreateClientConfig } from "./client.gen";

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

    const res = await originalFetch(req);

    if (
      res.status !== 401 ||
      req.url.includes("auth/refresh") ||
      window.location.pathname.includes("/login") ||
      window.location.pathname.includes("/signup")
    ) {
      return res;
    }

    const refreshRes = await authRefreshTokens();

    if (refreshRes.response.ok) {
      const retryRes = await originalFetch(retryReq);
      if (retryRes.status !== 401) {
        return retryRes;
      } else {
        console.error(retryRes);
      }
    }

    console.log("onUnauthorized");
    AuthEvents.onUnauthorized();
    return res;
  };
  const baseUrl = config?.baseUrl;

  return {
    baseUrl,
    credentials: "include",
    fetch: wrappedFetch,
    throwOnError: false,
  };
};
