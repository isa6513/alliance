import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import {
  OnetimeInviteDto,
  userApproveOnetimeInvite,
  userDeleteOnetimeInvite,
  userGetOnetimeInvitesOverview,
  userRejectOnetimeInvite,
} from "../client";
import { queryKeys } from "./queryKeys";

const QUERY_KEY = queryKeys.onetimeInvitesOverview();

/**
 * Single source of truth for the current user's one-time invites. Exposes
 * cache-aware helpers so handlers update the list without re-fetching.
 */
export function useOnetimeInvitesOverview(params?: { enabled?: boolean }) {
  const { enabled = true } = params ?? {};
  const queryClient = useQueryClient();

  const {
    data: invites = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const response = await userGetOnetimeInvitesOverview();
      if (!response.data) {
        throw new Error(
          response.response.statusText || "Failed to load invites",
        );
      }
      return response.data;
    },
    enabled,
  });

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
  }, [queryClient]);

  const upsertInvite = useCallback(
    (invite: OnetimeInviteDto) => {
      queryClient.setQueryData<OnetimeInviteDto[]>(QUERY_KEY, (old) => {
        if (old?.some((existing) => existing.id === invite.id)) {
          return old.map((existing) =>
            existing.id === invite.id ? invite : existing,
          );
        }
        return [invite, ...(old ?? [])];
      });
    },
    [queryClient],
  );

  const removeInvite = useCallback(
    (inviteId: number) => {
      queryClient.setQueryData<OnetimeInviteDto[]>(QUERY_KEY, (old) =>
        old ? old.filter((invite) => invite.id !== inviteId) : [],
      );
    },
    [queryClient],
  );

  const approveMutation = useMutation({
    mutationFn: async (inviteId: number) => {
      const response = await userApproveOnetimeInvite({ path: { inviteId } });
      if (!response.data) {
        throw new Error(response.response.statusText || "Failed to approve");
      }
      return response.data;
    },
    onSuccess: (invite) => upsertInvite(invite),
  });

  const rejectMutation = useMutation({
    mutationFn: async (inviteId: number) => {
      const response = await userRejectOnetimeInvite({ path: { inviteId } });
      if (response.error) {
        throw new Error(response.response.statusText || "Failed to reject");
      }
      return inviteId;
    },
    onSuccess: (inviteId) => removeInvite(inviteId),
  });

  const deleteMutation = useMutation({
    mutationFn: async (inviteId: number) => {
      const response = await userDeleteOnetimeInvite({ path: { inviteId } });
      if (response.error) {
        throw new Error(response.response.statusText || "Failed to delete");
      }
      return inviteId;
    },
    onSuccess: (inviteId) => removeInvite(inviteId),
  });

  return {
    invites,
    isLoading,
    isFetching,
    isError,
    refetch,
    refresh,
    upsertInvite,
    removeInvite,
    approveInvite: approveMutation.mutateAsync,
    rejectInvite: rejectMutation.mutateAsync,
    deleteInvite: deleteMutation.mutateAsync,
  };
}
