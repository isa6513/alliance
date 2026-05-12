import { useQuery } from "@tanstack/react-query";
import { shareUrlsGetShareLink } from "../client";

export enum ShareLinkTargetKind {
  Action = "action",
  ExternalTarget = "externalTarget",
}

export type ShareLinkTarget =
  | { kind: ShareLinkTargetKind.Action; actionId: number }
  | { kind: ShareLinkTargetKind.ExternalTarget; externalTargetId: number };

export function shareLinkTargetFromConfig(
  config: Record<string, unknown> | undefined,
): ShareLinkTarget | null {
  const actionId = config?.["actionId"];
  if (typeof actionId === "number") {
    return { kind: ShareLinkTargetKind.Action, actionId };
  }
  const externalTargetId = config?.["externalTargetId"];
  if (typeof externalTargetId === "number") {
    return { kind: ShareLinkTargetKind.ExternalTarget, externalTargetId };
  }
  return null;
}

export function useShareLink(target: ShareLinkTarget | null | undefined) {
  return useQuery({
    queryKey: ["shareUrlsGetShareLink", target],
    queryFn: async () => {
      if (!target) throw new Error("useShareLink: missing target");
      const body = (() => {
        switch (target.kind) {
          case ShareLinkTargetKind.Action:
            return { actionId: target.actionId };
          case ShareLinkTargetKind.ExternalTarget:
            return { externalTargetId: target.externalTargetId };
          default:
            throw new Error(
              `useShareLink: unknown target kind: ${target satisfies never}`,
            );
        }
      })();
      const res = await shareUrlsGetShareLink({ body });
      if (res.error || !res.data) {
        throw res.error ?? new Error("Failed to load share link");
      }
      return res.data.url;
    },
    enabled: !!target,
  });
}
