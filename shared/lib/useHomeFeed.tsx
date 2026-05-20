import {
  ActionActivityDto,
  HomeFeedClusterForumCommentDto,
  HomeFeedItemDto,
  actionsHomeFeed,
  actionsLikeActivity,
  actionsUnlikeActivity,
  forumLikeComment,
  forumUnlikeComment,
} from "@alliance/shared/client";
import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import posthog from "posthog-js";
import { useCallback, useMemo } from "react";
import { actionActivityViewable } from "./actionActivityConstants";

export type UseHomeFeedProps = {
  comments?: boolean;
  limit?: number;
};

const QUERY_KEY_ROOT = "useHomeFeed";

const generateQueryKey = (props: UseHomeFeedProps) => [
  QUERY_KEY_ROOT,
  props.limit ?? 20,
  props.comments ?? false,
];

const isViewable = (item: HomeFeedItemDto): boolean => {
  switch (item.type) {
    case "activity":
      return item.activity ? actionActivityViewable[item.activity.type] : false;
    case "cluster_forum_comment":
      return item.clusterForumComment != null;
    default:
      throw new Error(
        `unknown home feed item type: ${item.type satisfies never}`,
      );
  }
};

const processItems = (data: HomeFeedItemDto[] | undefined): HomeFeedItemDto[] =>
  (data?.filter(isViewable) ?? []).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

type HomeFeedPage = {
  items: HomeFeedItemDto[];
  serverCount: number;
  oldestRawDate: string | undefined;
};

const fetchPage = async (
  props: UseHomeFeedProps,
  before?: string,
): Promise<HomeFeedPage> => {
  const limit = props.limit ?? 20;
  const beforeStr = before ?? new Date().toISOString();
  const resp = await actionsHomeFeed({
    query: {
      limit: limit.toString(),
      before: beforeStr,
      comments: props.comments ?? false,
    },
  });
  const raw = resp.data ?? [];
  const oldestRawDate = raw.length ? raw[raw.length - 1].date : undefined;
  return { items: processItems(raw), serverCount: raw.length, oldestRawDate };
};

export type InfiniteHomeFeedData = InfiniteData<HomeFeedPage>;

const mapActivities = (
  old: InfiniteHomeFeedData | undefined,
  mapper: (activity: ActionActivityDto) => ActionActivityDto,
): InfiniteHomeFeedData | undefined => {
  if (!old) return old;
  return {
    ...old,
    pages: old.pages.map((page) => ({
      ...page,
      items: page.items.map((item) =>
        item.type === "activity" && item.activity
          ? { ...item, activity: mapper(item.activity) }
          : item,
      ),
    })),
  };
};

const mapClusterComments = (
  old: InfiniteHomeFeedData | undefined,
  mapper: (
    comment: HomeFeedClusterForumCommentDto,
  ) => HomeFeedClusterForumCommentDto,
): InfiniteHomeFeedData | undefined => {
  if (!old) return old;
  return {
    ...old,
    pages: old.pages.map((page) => ({
      ...page,
      items: page.items.map((item) =>
        item.type === "cluster_forum_comment" && item.clusterForumComment
          ? { ...item, clusterForumComment: mapper(item.clusterForumComment) }
          : item,
      ),
    })),
  };
};

const useHomeFeed = (props: UseHomeFeedProps = {}) => {
  const queryClient = useQueryClient();
  const queryKey = generateQueryKey(props);
  const limit = props.limit ?? 20;

  const {
    data,
    isLoading: loading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => fetchPage(props, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      if (lastPage.serverCount < limit) return undefined;
      return lastPage.oldestRawDate;
    },
  });

  const items = useMemo(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data],
  );

  const likeMutation = useMutation({
    mutationFn: async ({
      activityId,
      isLiked,
    }: {
      activityId: number;
      isLiked: boolean;
      activityType: string;
    }) => {
      const response = isLiked
        ? await actionsUnlikeActivity({ path: { id: activityId } })
        : await actionsLikeActivity({ path: { id: activityId } });
      if (response.response.ok && response.data) return response.data;
      throw new Error("Like request failed");
    },
    onMutate: async ({ activityId, isLiked }) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY_ROOT] });

      const previousQueries = queryClient.getQueriesData<InfiniteHomeFeedData>({
        queryKey: [QUERY_KEY_ROOT],
      });

      queryClient.setQueriesData<InfiniteHomeFeedData>(
        { queryKey: [QUERY_KEY_ROOT] },
        (old) =>
          mapActivities(old, (a) =>
            a.id === activityId
              ? {
                  ...a,
                  likedByMe: !isLiked,
                  likesCount: isLiked ? a.likesCount - 1 : a.likesCount + 1,
                }
              : a,
          ),
      );

      return { previousQueries };
    },
    onError: (_err, _vars, context) => {
      context?.previousQueries?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSuccess: (data, { activityId, isLiked, activityType }) => {
      queryClient.setQueriesData<InfiniteHomeFeedData>(
        { queryKey: [QUERY_KEY_ROOT] },
        (old) =>
          mapActivities(old, (a) =>
            a.id === activityId
              ? {
                  ...a,
                  likes: data.likes,
                  likesCount: data.likesCount,
                  likedByMe: data.likedByMe,
                }
              : a,
          ),
      );

      if (!isLiked) {
        posthog.capture("activity_liked", { activityId, activityType });
      }
    },
  });

  const handleLikeActivity = useCallback(
    async (activityId: number) => {
      const activity = items.find(
        (i) => i.type === "activity" && i.activity?.id === activityId,
      )?.activity;
      if (!activity) return;
      await likeMutation.mutateAsync({
        activityId,
        isLiked: activity.likedByMe ?? false,
        activityType: activity.type,
      });
    },
    [items, likeMutation],
  );

  const commentLikeMutation = useMutation({
    mutationFn: async ({
      commentId,
      isLiked,
    }: {
      commentId: number;
      isLiked: boolean;
    }) => {
      const response = isLiked
        ? await forumUnlikeComment({ path: { id: commentId } })
        : await forumLikeComment({ path: { id: commentId } });
      if (!response.response.ok) throw new Error("Like request failed");
    },
    onMutate: async ({ commentId, isLiked }) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY_ROOT] });

      const previousQueries = queryClient.getQueriesData<InfiniteHomeFeedData>({
        queryKey: [QUERY_KEY_ROOT],
      });

      queryClient.setQueriesData<InfiniteHomeFeedData>(
        { queryKey: [QUERY_KEY_ROOT] },
        (old) =>
          mapClusterComments(old, (c) =>
            c.comment.id === commentId
              ? {
                  ...c,
                  likedByMe: !isLiked,
                  likesCount: isLiked ? c.likesCount - 1 : c.likesCount + 1,
                }
              : c,
          ),
      );

      return { previousQueries };
    },
    onError: (_err, _vars, context) => {
      context?.previousQueries?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSuccess: (_data, { commentId, isLiked }) => {
      if (!isLiked) {
        posthog.capture("cluster_forum_comment_liked", { commentId });
      }
    },
  });

  const handleLikeClusterForumComment = useCallback(
    async (commentId: number) => {
      const clusterComment = items.find(
        (i) =>
          i.type === "cluster_forum_comment" &&
          i.clusterForumComment?.comment.id === commentId,
      )?.clusterForumComment;
      if (!clusterComment) return;
      await commentLikeMutation.mutateAsync({
        commentId,
        isLiked: clusterComment.likedByMe,
      });
    },
    [items, commentLikeMutation],
  );

  return {
    loading,
    items,
    handleLikeActivity,
    handleLikeClusterForumComment,
    fetchNextPage,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
  };
};

export default useHomeFeed;
