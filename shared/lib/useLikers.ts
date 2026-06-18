import {
  likesGetActivityUsers,
  likesGetCommentUsers,
  likesGetPostUsers,
  type ProfileDto,
} from "@alliance/shared/client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export type LikeTargetType = "post" | "comment" | "activity";

type LikersQuery = { limit: number; afterId?: number };
type LikersFetcher = (
  id: number,
  query: LikersQuery,
) => Promise<{ data?: ProfileDto[] }>;

const LIKERS_FETCHERS: Record<LikeTargetType, LikersFetcher> = {
  post: (id, query) => likesGetPostUsers({ path: { id }, query }),
  comment: (id, query) => likesGetCommentUsers({ path: { id }, query }),
  activity: (id, query) => likesGetActivityUsers({ path: { id }, query }),
};

const QUERY_KEY_ROOT = "useLikers";
const DEFAULT_LIMIT = 30;

export type UseLikersProps = {
  targetType: LikeTargetType;
  targetId: number;
  limit?: number;
  enabled?: boolean;
};

/**
 * Paginated likers for post/comment/activity. `afterId` is the last user id
 * from the previous server-ordered page.
 */
export const useLikers = ({
  targetType,
  targetId,
  limit = DEFAULT_LIMIT,
  enabled = true,
}: UseLikersProps) => {
  const {
    data,
    isLoading: loading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: [QUERY_KEY_ROOT, targetType, targetId, limit],
    initialPageParam: undefined as number | undefined,
    queryFn: async ({ pageParam }) => {
      const resp = await LIKERS_FETCHERS[targetType](targetId, {
        limit,
        afterId: pageParam,
      });
      return resp.data ?? [];
    },
    getNextPageParam: (lastPage) =>
      lastPage.length < limit ? undefined : lastPage[lastPage.length - 1]?.id,
    enabled,
  });

  const users = useMemo(() => data?.pages.flat() ?? [], [data]);

  return {
    users,
    loading,
    fetchNextPage,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
  };
};

export default useLikers;
