import { authRefreshTokens } from "../client";
import { CreateClientConfig } from "../client/client.gen";
import { getApiUrl } from "./config";

export const AuthEvents = {
  onUnauthorized: () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }
  },
};

export const createClientConfig: CreateClientConfig = (config) => {
  const originalFetch = (config?.fetch ?? fetch).bind(globalThis);

  const wrappedFetch: typeof fetch = async (input: RequestInfo | URL) => {
    const inputreq = input as Request;
    const res = await originalFetch(new Request(input));

    if (res.status !== 401 || inputreq.url.includes("auth/refresh")) return res;

    const refreshRes = await authRefreshTokens();

    if (refreshRes.response.ok) {
      const newRes = await fetch(
        new Request(inputreq.url, {
          headers: inputreq.headers,
          body: inputreq.body,
          credentials: "include",
          method: inputreq.method,
          mode: inputreq.mode,
          redirect: inputreq.redirect,
          referrer: inputreq.referrer,
          referrerPolicy: inputreq.referrerPolicy,
          integrity: inputreq.integrity,
          cache: inputreq.cache,
        })
      );
      if (newRes.status !== 401) {
        return newRes;
      } else {
        console.log(newRes);
      }
    }

    AuthEvents.onUnauthorized();
    return res;
  };

  const baseUrl = getApiUrl();

  return {
    baseUrl,
    credentials: "include",
    fetch: wrappedFetch,
    throwOnError: false,
  };
};
