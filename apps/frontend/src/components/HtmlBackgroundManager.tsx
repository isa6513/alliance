import { type ReactNode, useEffect } from "react";

export function HtmlBackgroundManager({ children }: { children: ReactNode }) {
  return children;
}

export const useWhiteBackground = () => {
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.add("white");
  }, []);
};

export const useGrayBackground = () => {
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.remove("white");
  }, []);
};
