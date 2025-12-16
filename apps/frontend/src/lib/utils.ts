import { notifsLinkClick } from "@alliance/shared/client";
import { posthog } from "posthog-js";
import { useEffect } from "react";
import { useSearchParams } from "react-router";

export const useCIDFromParams = (actionId?: number) => {
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
          searchParams.delete("cid");
          setSearchParams(searchParams);
        }
        posthog.capture("notif_link_click", {
          cid,
          platform,
          actionId,
        });
      });
    }
  }, [cid, setSearchParams, searchParams, actionId]);

  const sid = searchParams.get("sid");
  useEffect(() => {
    if (sid) {
      posthog.register_for_session({ sid });
      posthog.capture("sid_load", {
        sid,
        actionId,
      });
    }
  }, [sid, actionId]);
};

export const generateBarcodeUrl = (url: string, size: number) => {
  return (
    "https://api.qrserver.com/v1/create-qr-code/?data=" +
    encodeURIComponent(url) +
    "&size=" +
    size +
    "x" +
    size
  );
};

const mulberry32 = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const hashStringToSeed = (input: string): number => {
  const FNV_OFFSET = 0x811c9dc5;
  const FNV_PRIME = 0x01000193;

  let hash = FNV_OFFSET;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, FNV_PRIME);
  }
  return hash >>> 0;
};

export const shuffleWithSeed = <T>(array: T[], seed: string): T[] => {
  const res = [...array];
  const random = mulberry32(hashStringToSeed(seed));
  for (let i = res.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [res[i], res[j]] = [res[j], res[i]];
  }
  return res;
};
