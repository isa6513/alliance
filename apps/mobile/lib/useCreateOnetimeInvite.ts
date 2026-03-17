import { useCallback, useState } from "react";
import type { CreateOnetimeInviteDto, OnetimeInviteDto } from "@alliance/shared/client";
import { userCreateOnetimeInvite } from "@alliance/shared/client";

export type ResponsibilityChoice = "responsible" | "not_responsible" | null;

export type UseCreateOnetimeInviteOptions = {
  onInviteCreated: (invite: OnetimeInviteDto) => void;
  onError?: (message: string) => void;
};

export function useCreateOnetimeInvite({
  onInviteCreated,
  onError,
}: UseCreateOnetimeInviteOptions) {
  const [inviteeName, setInviteeName] = useState("");
  const [info, setInfo] = useState("");
  const [responsibilityChoice, setResponsibilityChoice] =
    useState<ResponsibilityChoice>("responsible");
  const [creatingInvite, setCreatingInvite] = useState(false);

  const createInvite = useCallback(
    async (communityId: number | null) => {
      if (!inviteeName.trim()) {
        onError?.("Please enter the invitee's name.");
        return;
      }
      if (responsibilityChoice === "responsible" && communityId === null) {
        onError?.("Please select a group for the new member.");
        return;
      }

      setCreatingInvite(true);
      try {
        const body: CreateOnetimeInviteDto = {
          invitee: inviteeName.trim(),
          ...(info.trim() && { info: info.trim() }),
          ...(responsibilityChoice === "responsible" &&
            communityId !== null && { communityId }),
        };
        const response = await userCreateOnetimeInvite({ body });
        if (response.data) {
          setInviteeName("");
          setInfo("");
          onInviteCreated(response.data);
        } else {
          onError?.(
            `Failed to create invite: ${response.response?.statusText ?? "Unknown error"}`,
          );
        }
      } catch {
        onError?.("Failed to create invite.");
      } finally {
        setCreatingInvite(false);
      }
    },
    [inviteeName, info, responsibilityChoice, onInviteCreated, onError],
  );

  const resetForm = useCallback(() => {
    setInviteeName("");
    setInfo("");
  }, []);

  return {
    inviteeName,
    setInviteeName,
    info,
    setInfo,
    responsibilityChoice,
    setResponsibilityChoice,
    creatingInvite,
    createInvite,
    resetForm,
  };
}
