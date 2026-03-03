import { CreateClientConfig } from "../client/client.gen";
import { getAppVersion } from "./app-version";

export const AuthEvents = {
  onUnauthorized: () => {
    if (
      typeof navigator !== "undefined" &&
      navigator.product === "ReactNative"
    ) {
      return;
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }
  },
};

let versionMismatchFired = false;

function checkAppVersion(res: Response): void {
  if (typeof window === "undefined") return;
  const clientVersion = getAppVersion();
  if (clientVersion == undefined) return;
  const serverVersion = res.headers.get("X-App-Version");
  if (serverVersion == null) return;
  if (serverVersion === clientVersion) return;
  if (versionMismatchFired) return;
  versionMismatchFired = true;
  window.location.reload();
}

export const createClientConfig: CreateClientConfig = (config) => {
  const originalFetch = (config?.fetch ?? fetch).bind(globalThis);

  const wrappedFetch: typeof fetch = async (
    input: RequestInfo | URL,
    init?: RequestInit
  ) => {
    const req = new Request(input, init);
    const retryReq = req.clone();

    const res = await originalFetch(req);

    checkAppVersion(res);

    if (
      res.status !== 401 ||
      req.url.includes("auth/refresh") ||
      (typeof window !== "undefined" &&
        (window.location.pathname.includes("/login") ||
          window.location.pathname.includes("/signup")))
    ) {
      return res;
    }

    const { authRefreshTokens } = await import("../client/sdk.gen");
    const refreshRes = await authRefreshTokens();

    if (refreshRes.response.ok) {
      const retryRes = await originalFetch(retryReq);
      if (retryRes.status !== 401) {
        return retryRes;
      } else {
        console.error(retryRes);
      }
    }
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
