import { CommunityDto, userGetMyCommunities } from "@alliance/shared/client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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
  setSelectedCommunity: (community: CommunityDto | null) => void;
};

const QUERY_KEY = ["userGetMyCommunities"];

export function useMyCommunities(
  props: UseMyCommunitiesProps
): UseMyCommunitiesReturn {
  const { selectedCommunityId } = props;
  const queryClient = useQueryClient();

  const { data: communities = [] } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () =>
      userGetMyCommunities().then((response) => {
        return response.data ?? [];
      }),
  });

  const [selectedCommunity, setSelectedCommunity] =
    useState<CommunityDto | null>(communities[0] ?? null);

  const communityIds = useMemo(() => {
    return new Set(communities.map((community) => community.id));
  }, [communities]);

  const refreshCommunities = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
  }, [queryClient]);

  const removeCommunity = useCallback(
    (communityId: number) => {
      queryClient.setQueryData<CommunityDto[]>(QUERY_KEY, (old) =>
        old ? old.filter((community) => community.id !== communityId) : []
      );
    },
    [queryClient]
  );

  useEffect(() => {
    if (selectedCommunityId === null) {
      setSelectedCommunity(communities[0] ?? null);
    } else {
      setSelectedCommunity(
        communities.find((community) => community.id === selectedCommunityId) ??
          null
      );
    }
  }, [communities, selectedCommunityId]);

  const removeMemberFromCommunity = useCallback(
    (communityId: number, memberId: number) => {
      queryClient.setQueryData<CommunityDto[]>(QUERY_KEY, (old) =>
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
    [queryClient]
  );

  return {
    communities,
    communityIds,
    refreshCommunities,
    removeCommunity,
    selectedCommunity,
    removeMemberFromCommunity,
    setSelectedCommunity,
  };
}
