import { useQuery } from "@tanstack/react-query";
import { shareUrlsGetShareLink } from "../client";

export enum ShareLinkTargetKind {
  Action = "action",
  ExternalTarget = "externalTarget",
  Invite = "invite",
}

export type ShareLinkTarget =
  | { kind: ShareLinkTargetKind.Action; actionId: number }
  | { kind: ShareLinkTargetKind.ExternalTarget; externalTargetId: number }
  | { kind: ShareLinkTargetKind.Invite };

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
  if (config?.["invite"] === true) {
    return { kind: ShareLinkTargetKind.Invite };
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
          case ShareLinkTargetKind.Invite:
            return { invite: true };
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
