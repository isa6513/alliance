export type ScreenshotTarget = {
  name: string;
  path: string;
  waitForSelector?: string;
  waitForTimeoutMs?: number;
};

export const screenshotTargets: ScreenshotTarget[] = [
  { name: "home", path: "/" },
  { name: "guide", path: "/guide" },
  { name: "people", path: "/people" },
  { name: "foundation", path: "/foundation" },
  { name: "governance", path: "/governance" },
  { name: "faq", path: "/faq" },
  { name: "progress", path: "/progress" },
];
