// Tremor Raw cx [v0.0.0]

import { notifsLinkClick } from "@alliance/shared/client";
import clsx, { type ClassValue } from "clsx";
import { formatDistanceToNow } from "date-fns";
import { posthog } from "posthog-js";
import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { twMerge } from "tailwind-merge";

export function cx(...args: ClassValue[]) {
  return twMerge(clsx(...args));
}

// Tremor focusInput [v0.0.2]

export const focusInput = [
  // base
  "focus:ring-2",
  // ring color
  "focus:ring-blue-200 dark:focus:ring-blue-700/30",
  // border color
  "focus:border-blue-500 dark:focus:border-blue-700",
];

// Tremor Raw focusRing [v0.0.1]

export const focusRing = [
  // base
  "outline outline-offset-2 outline-0 focus-visible:outline-2",
  // outline color
  "outline-blue-500 dark:outline-blue-500",
];

// Tremor Raw hasErrorInput [v0.0.1]

export const hasErrorInput = [
  // base
  "ring-2",
  // border color
  "border-red-500 dark:border-red-700",
  // ring color
  "ring-red-200 dark:ring-red-700/30",
];

export const formatTime = (time: Date, { addSuffix = true }) => {
  return formatDistanceToNow(time, {
    addSuffix,
  }).replace("about ", "");
};

export const useCIDFromParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const cid = searchParams.get("cid");

  useEffect(() => {
    if (cid) {
      posthog.register_for_session({ cid });

      notifsLinkClick({
        body: { cid },
      }).then((response) => {
        let platform = "unknown";
        if (response.data) {
          platform = response.data.mms ? "mms" : "email";
          setSearchParams({});
        }
        posthog.capture("notif_link_click", {
          cid,
          platform,
        });
      });
    }
  }, [cid, setSearchParams]);
};
