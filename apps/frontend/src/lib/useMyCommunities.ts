import { CommunityDto, userGetMyCommunities } from "@alliance/shared/client";
import { useCallback, useEffect, useMemo, useState } from "react";

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

export function useMyCommunities(
  props: UseMyCommunitiesProps
): UseMyCommunitiesReturn {
  const { selectedCommunityId } = props;

  const [communities, setCommunities] = useState<CommunityDto[]>([]);
  const [selectedCommunity, setSelectedCommunity] =
    useState<CommunityDto | null>(null);

  const communityIds = useMemo(() => {
    return new Set(communities.map((community) => community.id));
  }, [communities]);

  const refreshCommunities = useCallback(async () => {
    const resp = await userGetMyCommunities();
    if (resp.data) {
      setCommunities(resp.data);
    } else {
      setCommunities([]);
    }
  }, []);

  useEffect(() => {
    void refreshCommunities();
  }, [refreshCommunities]);

  const removeCommunity = useCallback((communityId: number) => {
    setCommunities((prev) =>
      prev.filter((community) => community.id !== communityId)
    );
  }, []);

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
      setCommunities((prev) =>
        prev.map((community) =>
          community.id === communityId
            ? {
                ...community,
                users: community.users.filter((user) => user.id !== memberId),
              }
            : community
        )
      );
    },
    []
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
