import { CommunityDto, userGetMyCommunities } from "@alliance/shared/client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./AuthContext";

type UseMyCommunitiesProps = {
  selectedCommunityId: number | null;
};

type UseMyCommunitiesReturn = {
  communities: CommunityDto[];
  communityIds: Set<number>;
  refreshCommunities: () => Promise<void>;
  removeCommunity: (communityId: number) => void;

  selectedCommunity: CommunityDto | null;
  removeMemberFromCommunity: (communityId: number, memberId: number) => void;
  updateSelectedCommunity: (community: CommunityDto) => void;
};

function getQueryKey(userId: number | null) {
  return ["userGetMyCommunities", userId];
}

function findCommunityById(
  communities: CommunityDto[],
  communityId: number | null
): CommunityDto | null {
  if (communityId === null) {
    return communities[0] ?? null;
  }

  return communities.find((community) => community.id === communityId) ?? null;
}

export function useMyCommunities(
  props: UseMyCommunitiesProps
): UseMyCommunitiesReturn {
  const { selectedCommunityId } = props;
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const queryKey = useMemo(() => getQueryKey(user?.id ?? null), [user?.id]);

  const { data: communities = [] } = useQuery({
    queryKey,
    queryFn: () =>
      userGetMyCommunities().then((response) => {
        return response.data ?? [];
      }),
  });

  const [selectedCommunity, setSelectedCommunity] =
    useState<CommunityDto | null>(
      findCommunityById(communities, selectedCommunityId)
    );
  useEffect(() => {
    setSelectedCommunity(findCommunityById(communities, selectedCommunityId));
  }, [communities, selectedCommunityId]);

  const communityIds = useMemo(() => {
    return new Set(communities.map((community) => community.id));
  }, [communities]);

  const refreshCommunities = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  const removeCommunity = useCallback(
    (communityId: number) => {
      queryClient.setQueryData<CommunityDto[]>(queryKey, (old) =>
        old ? old.filter((community) => community.id !== communityId) : []
      );
    },
    [queryClient, queryKey]
  );

  const removeMemberFromCommunity = useCallback(
    (communityId: number, memberId: number) => {
      queryClient.setQueryData<CommunityDto[]>(queryKey, (old) =>
        old
          ? old.map((community) =>
              community.id === communityId
                ? {
                    ...community,
                    users: community.users.filter(
                      (user) => user.id !== memberId
                    ),
                  }
                : community
            )
          : []
      );
    },
    [queryClient, queryKey]
  );

  const updateSelectedCommunity = useCallback(
    (community: CommunityDto) => {
      queryClient.setQueryData<CommunityDto[]>(queryKey, (old) => {
        if (old && old.some((c) => c.id === community.id)) {
          return old.map((c) => (c.id === community.id ? community : c));
        }
        return [...(old ?? []), community];
      });
      setSelectedCommunity(findCommunityById(communities, community.id));
    },
    [queryClient, communities, queryKey]
  );

  return {
    communities,
    communityIds,
    refreshCommunities,
    removeCommunity,
    selectedCommunity,
    removeMemberFromCommunity,
    updateSelectedCommunity,
  };
}
