import { useQuery } from "@tanstack/react-query";
import { communityGetPublicCommunities } from "../client";
import { queryKeys } from "./queryKeys";

const QUERY_KEY = queryKeys.publicCommunities();

/**
 * Single source of truth for public communities a user can join. Wraps
 * `communityGetPublicCommunities` in react-query so requests are deduplicated
 * and cached across screens. Prefer this over the generated client directly.
 */
export function usePublicCommunities(params?: { enabled?: boolean }) {
  const { enabled = true } = params ?? {};

  const {
    data: publicCommunities = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const response = await communityGetPublicCommunities();
      if (!response.data) {
        throw new Error(
          response.response.statusText || "Unable to load public groups.",
        );
      }
      return response.data;
    },
    enabled,
  });

  return {
    publicCommunities,
    isLoading,
    isFetching,
    isError,
    refetch,
  };
}
