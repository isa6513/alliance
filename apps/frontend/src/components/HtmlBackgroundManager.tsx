import { useEffect } from "react";
import { useLocation } from "react-router";

export function HtmlBackgroundManager() {
  const location = useLocation();

  useEffect(() => {
    const html = document.documentElement;

    if (
      location.pathname.endsWith("tasks") ||
      location.pathname.endsWith("priorities")
    ) {
      html.classList.add("white");
    } else {
      html.classList.remove("white");
    }

    return () => {
      html.classList.remove("white");
    };
  }, [location]);

  return null;
}
