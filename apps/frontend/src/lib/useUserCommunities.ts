import { useEffect, useState, useCallback } from "react";
import {
  CommunityDto,
  communityGetMyCommunities,
} from "@alliance/shared/client";

export function useUserCommunities() {
  const [communities, setCommunities] = useState<CommunityDto[] | null>(null);

  const refreshCommunities = useCallback(
    async (
      selectedCommunityId?: number | null
    ): Promise<CommunityDto | null> => {
      const resp = await communityGetMyCommunities();
      if (resp.data) {
        setCommunities(resp.data);
        // Atomically return the selected community if requested
        if (selectedCommunityId !== undefined && selectedCommunityId !== null) {
          return (
            resp.data.find(
              (community) =>
                community.id.toString() === selectedCommunityId.toString()
            ) ||
            resp.data[0] ||
            null
          );
        }
      }
      return null;
    },
    []
  );

  const deleteCommunity = useCallback((communityId: number) => {
    setCommunities((prev) => {
      if (!prev) return null;
      const filtered = prev.filter((c) => c.id !== communityId);
      return filtered.length > 0 ? filtered : null;
    });
  }, []);

  useEffect(() => {
    refreshCommunities();
  }, [refreshCommunities]);

  return {
    communities,
    refreshCommunities,
    deleteCommunity,
  };
}
