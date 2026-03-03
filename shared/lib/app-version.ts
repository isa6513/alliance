declare global {
  interface Window {
    __APP_VERSION__?: string;
  }
}

export function setAppVersion(version: string): void {
  if (typeof window !== "undefined") {
    window.__APP_VERSION__ = version;
  }
}

export function getAppVersion(): string | undefined {
  return window?.__APP_VERSION__;
}
