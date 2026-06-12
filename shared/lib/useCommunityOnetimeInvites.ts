import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import {
  CreateOnetimeInviteDto,
  OnetimeInviteDto,
  userApproveOnetimeInvite,
  userCreateOnetimeInvite,
  userDeleteOnetimeInvite,
  userGetOnetimeInvitesByCommunity,
  userRejectOnetimeInvite,
} from "../client";
import { queryKeys } from "./queryKeys";

/**
 * Single source of truth for a community's one-time invites — the leader-facing
 * counterpart to {@link useOnetimeInvitesOverview}. Wraps
 * `userGetOnetimeInvitesByCommunity` plus the create/approve/reject/delete
 * endpoints in react-query, sharing one cache key (scoped by `communityId`) and
 * exposing cache-aware helpers so handlers update the list without re-fetching.
 */
export function useCommunityOnetimeInvites(
  communityId: number,
  params?: { enabled?: boolean },
) {
  const { enabled = true } = params ?? {};
  const queryClient = useQueryClient();
  const queryKey = queryKeys.communityOnetimeInvites(communityId);

  const {
    data: invites = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () =>
      userGetOnetimeInvitesByCommunity({
        path: { communityId },
        throwOnError: true,
      }).then((r) => r.data),
    enabled,
  });

  const upsertInvite = useCallback(
    (invite: OnetimeInviteDto) => {
      queryClient.setQueryData<OnetimeInviteDto[]>(queryKey, (old) => {
        if (old?.some((existing) => existing.id === invite.id)) {
          return old.map((existing) =>
            existing.id === invite.id ? invite : existing,
          );
        }
        return [invite, ...(old ?? [])];
      });
    },
    [queryClient, queryKey],
  );

  const removeInvite = useCallback(
    (inviteId: number) => {
      queryClient.setQueryData<OnetimeInviteDto[]>(queryKey, (old) =>
        old ? old.filter((invite) => invite.id !== inviteId) : [],
      );
    },
    [queryClient, queryKey],
  );

  const createMutation = useMutation({
    mutationFn: (body: CreateOnetimeInviteDto) =>
      userCreateOnetimeInvite({ body, throwOnError: true }).then((r) => r.data),
    onSuccess: (invite) => upsertInvite(invite),
  });

  const approveMutation = useMutation({
    mutationFn: (inviteId: number) =>
      userApproveOnetimeInvite({ path: { inviteId }, throwOnError: true }).then(
        (r) => r.data,
      ),
    onSuccess: (invite) => upsertInvite(invite),
  });

  const rejectMutation = useMutation({
    mutationFn: async (inviteId: number) => {
      await userRejectOnetimeInvite({ path: { inviteId }, throwOnError: true });
      return inviteId;
    },
    onSuccess: (inviteId) => removeInvite(inviteId),
  });

  const deleteMutation = useMutation({
    mutationFn: async (inviteId: number) => {
      await userDeleteOnetimeInvite({ path: { inviteId }, throwOnError: true });
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
    upsertInvite,
    removeInvite,
    createInvite: createMutation.mutateAsync,
    approveInvite: approveMutation.mutateAsync,
    rejectInvite: rejectMutation.mutateAsync,
    deleteInvite: deleteMutation.mutateAsync,
  };
}
