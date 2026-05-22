import {
  ActionActivityDto,
  HomeFeedForumCommentDto,
  HomeFeedItemDto,
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

// TODO(forum-comment-rename): server currently emits the legacy
// 'cluster_forum_comment' type and 'clusterForumComment' field. Once all
// deployed clients ship reading 'forum_comment' / 'forumComment', flip the
// server, regenerate types.gen.ts, and drop the legacy branches below.
type HomeFeedItemWithForumComment = HomeFeedItemDto & {
  forumComment?: HomeFeedForumCommentDto;
};

export const getForumComment = (
  item: HomeFeedItemDto,
): HomeFeedForumCommentDto | undefined => {
  const extended = item as HomeFeedItemWithForumComment;
  return extended.clusterForumComment ?? extended.forumComment;
};

const isViewable = (item: HomeFeedItemDto): boolean => {
  switch (item.type) {
    case "activity":
      return item.activity ? actionActivityViewable[item.activity.type] : false;
    case "cluster_forum_comment":
    // @ts-expect-error: TODO(forum-comment-rename): drop the legacy 'cluster_forum_comment'
    case "forum_comment":
      return getForumComment(item) != null;
    default:
      // Drop unknown variants so older clients don't crash on new server types.
      item.type satisfies never;
      return false;
  }
};

export const processFeedItems = (
  data: HomeFeedItemDto[] | undefined,
): HomeFeedItemDto[] =>
  (data?.filter(isViewable) ?? []).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

export type FeedPage = {
  items: HomeFeedItemDto[];
  serverCount: number;
  oldestRawDate: string | undefined;
};

export const buildFeedPage = (raw: HomeFeedItemDto[]): FeedPage => ({
  items: processFeedItems(raw),
  serverCount: raw.length,
  oldestRawDate: raw.length ? raw[raw.length - 1].date : undefined,
});

export type InfiniteFeedData = InfiniteData<FeedPage>;

export const mapActivitiesInPages = (
  old: InfiniteFeedData | undefined,
  mapper: (activity: ActionActivityDto) => ActionActivityDto,
): InfiniteFeedData | undefined => {
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

export const mapForumCommentsInPages = (
  old: InfiniteFeedData | undefined,
  mapper: (comment: HomeFeedForumCommentDto) => HomeFeedForumCommentDto,
): InfiniteFeedData | undefined => {
  if (!old) return old;
  return {
    ...old,
    pages: old.pages.map((page) => ({
      ...page,
      items: page.items
        .map((item): HomeFeedItemDto | null => {
          switch (item.type) {
            case "activity":
              return item;
            case "cluster_forum_comment":
            // @ts-expect-error: TODO(forum-comment-rename): drop the legacy 'cluster_forum_comment'
            case "forum_comment": {
              const fc = getForumComment(item);
              if (!fc) return item;
              const mapped = mapper(fc);
              const extended = item as HomeFeedItemWithForumComment;
              if (extended.clusterForumComment) {
                return { ...item, clusterForumComment: mapped };
              }
              return { ...item, forumComment: mapped } as HomeFeedItemDto;
            }
            default: {
              // Drop unknown variants so older clients don't crash on new server types.
              item.type satisfies never;
              return null;
            }
          }
        })
        .filter((i): i is HomeFeedItemDto => i !== null),
    })),
  };
};

export const useFeedLikeMutations = (
  queryKeyRoot: string,
  items: HomeFeedItemDto[],
) => {
  const queryClient = useQueryClient();

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
      await queryClient.cancelQueries({ queryKey: [queryKeyRoot] });

      const previousQueries = queryClient.getQueriesData<InfiniteFeedData>({
        queryKey: [queryKeyRoot],
      });

      queryClient.setQueriesData<InfiniteFeedData>(
        { queryKey: [queryKeyRoot] },
        (old) =>
          mapActivitiesInPages(old, (a) =>
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
      queryClient.setQueriesData<InfiniteFeedData>(
        { queryKey: [queryKeyRoot] },
        (old) =>
          mapActivitiesInPages(old, (a) =>
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
      await queryClient.cancelQueries({ queryKey: [queryKeyRoot] });

      const previousQueries = queryClient.getQueriesData<InfiniteFeedData>({
        queryKey: [queryKeyRoot],
      });

      queryClient.setQueriesData<InfiniteFeedData>(
        { queryKey: [queryKeyRoot] },
        (old) =>
          mapForumCommentsInPages(old, (c) =>
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
        posthog.capture("forum_comment_liked", { commentId });
      }
    },
  });

  const handleLikeForumComment = useCallback(
    async (commentId: number) => {
      const forumComment = items
        .filter((i) => {
          switch (i.type) {
            case "cluster_forum_comment":
            // @ts-expect-error: TODO(forum-comment-rename): drop the legacy 'cluster_forum_comment'
            case "forum_comment":
              return true;
            case "activity":
              return false;
            default:
              i.type satisfies never;
              return false;
          }
        })
        .map(getForumComment)
        .find((fc) => fc?.comment.id === commentId);
      if (!forumComment) return;
      await commentLikeMutation.mutateAsync({
        commentId,
        isLiked: forumComment.likedByMe,
      });
    },
    [items, commentLikeMutation],
  );

  return { handleLikeActivity, handleLikeForumComment };
};

export const useFeedQuery = (params: {
  queryKeyRoot: string;
  queryKey: ReadonlyArray<unknown>;
  fetchPage: (before?: string) => Promise<FeedPage>;
  limit: number;
  enabled?: boolean;
}) => {
  const { queryKeyRoot, queryKey, fetchPage, limit, enabled } = params;

  const {
    data,
    isLoading: loading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => fetchPage(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      if (lastPage.serverCount < limit) return undefined;
      return lastPage.oldestRawDate;
    },
    enabled,
  });

  const items = useMemo(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data],
  );

  const { handleLikeActivity, handleLikeForumComment } = useFeedLikeMutations(
    queryKeyRoot,
    items,
  );

  return {
    loading,
    items,
    handleLikeActivity,
    handleLikeForumComment,
    fetchNextPage,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
  };
};
