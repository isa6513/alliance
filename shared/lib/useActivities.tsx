import {
  ActionActivityDto,
  actionsFindCompletedForUser,
  actionsFriendActivity,
  actionsGetActionActivities,
  actionsGetActivityFeed,
  actionsCommunityActivity,
  actionsLikeActivity,
  actionsUnlikeActivity,
  actionsFriendActivityForAction,
} from "@alliance/shared/client";
import { useCallback, useMemo } from "react";
import {
  useQuery,
  useInfiniteQuery,
  useQueryClient,
  InfiniteData,
} from "@tanstack/react-query";
import posthog from "posthog-js";

export enum ActivityList {
  Friends = "friends",
  FriendsForAction = "friendsForAction",
  User = "user",
  Action = "action",
  Global = "global",
  Community = "community",
}

export type UseActivitiesProps = {
  comments?: boolean;
} & (
  | {
      list:
        | ActivityList.User
        | ActivityList.Action
        | ActivityList.Community
        | ActivityList.FriendsForAction;
      objectId: number;
      limit?: number;
    }
  | {
      list: ActivityList.Global | ActivityList.Friends;
      objectId?: never;
      limit?: number;
    }
);

const supportsCursor = (list: ActivityList) =>
  list === ActivityList.Global ||
  list === ActivityList.Friends ||
  list === ActivityList.Community;

const generateQueryKey = (props: UseActivitiesProps) => {
  return [
    "useActivities",
    props.list,
    props.objectId ?? "none",
    props.limit ?? 50,
    props.comments ?? false,
  ];
};

const fetchActivities = async (
  props: UseActivitiesProps,
  before?: string
): Promise<ActionActivityDto[]> => {
  const { list, objectId, limit = 50, comments = false } = props;
  const beforeStr = before ?? new Date().toISOString();

  let apiCall;
  switch (list) {
    case ActivityList.Friends:
      apiCall = actionsFriendActivity({
        query: { comments, limit: limit.toString(), before: beforeStr },
      });
      break;
    case ActivityList.User:
      apiCall = actionsFindCompletedForUser({
        path: { id: objectId! },
        query: { comments },
      });
      break;
    case ActivityList.Action:
      apiCall = actionsGetActionActivities({
        path: { id: objectId! },
        query: { limit: limit, comments },
      });
      break;
    case ActivityList.FriendsForAction:
      if (!objectId) {
        throw new Error("objectId is required for FriendsForAction");
      }
      apiCall = actionsFriendActivityForAction({
        path: { actionId: objectId },
        query: { comments, limit: limit.toString() },
      });
      break;
    case ActivityList.Community:
      apiCall = actionsCommunityActivity({
        query: {
          limit: limit.toString(),
          before: beforeStr,
          comments,
          communityId: objectId!,
        },
      });
      break;
    case ActivityList.Global:
      apiCall = actionsGetActivityFeed({
        query: {
          limit: limit.toString(),
          before: beforeStr,
          comments,
        },
      });
      break;
  }

  const resp = await apiCall;
  const data = resp.data?.filter((a) => a.type === "user_completed") ?? [];

  const respActivities = data.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return respActivities;
};

type InfiniteActivityData = InfiniteData<ActionActivityDto[]>;

/** Map over all activities across pages in an infinite query cache entry */
const mapInfiniteActivities = (
  old: InfiniteActivityData | undefined,
  mapper: (activity: ActionActivityDto) => ActionActivityDto
): InfiniteActivityData | undefined => {
  if (!old) return old;
  return {
    ...old,
    pages: old.pages.map((page) => page.map(mapper)),
  };
};

const useActivities = (props: UseActivitiesProps) => {
  const queryClient = useQueryClient();
  const queryKey = generateQueryKey(props);
  const infinite = supportsCursor(props.list);
  const limit = props.limit ?? 50;

  // --- infinite query path (Global, Friends, Community) ---
  const infiniteResult = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => fetchActivities(props, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      if (lastPage.length < limit) return undefined;
      return lastPage[lastPage.length - 1]?.createdAt;
    },
    enabled: infinite,
  });

  // --- simple query path (User, Action, FriendsForAction) ---
  const simpleResult = useQuery({
    queryKey,
    queryFn: () => fetchActivities(props),
    enabled: !infinite,
  });

  const activities = useMemo(() => {
    if (infinite) {
      return infiniteResult.data?.pages.flat() ?? [];
    }
    return simpleResult.data ?? [];
  }, [infinite, infiniteResult.data, simpleResult.data]);

  const loading = infinite ? infiniteResult.isLoading : simpleResult.isLoading;

  const setActivities = useCallback(
    (updater: React.SetStateAction<ActionActivityDto[]>) => {
      if (infinite) {
        queryClient.setQueryData<InfiniteActivityData>(queryKey, (old) => {
          if (!old) return old;
          const flat =
            typeof updater === "function"
              ? updater(old.pages.flat())
              : updater;
          // Put all updated items into the first page, clear the rest
          return { ...old, pages: [flat, ...old.pages.slice(old.pages.length)] };
        });
      } else {
        queryClient.setQueryData<ActionActivityDto[]>(queryKey, (old) => {
          return typeof updater === "function" ? updater(old ?? []) : updater;
        });
      }
    },
    [queryClient, queryKey, infinite]
  );

  const handleLikeActivity = useCallback(
    async (activityId: number) => {
      const activity = activities.find((a) => a.id === activityId);
      if (!activity) return;

      const isLiked = activity.likedByMe ?? false;

      const updateLikeInCache = (responseData: ActionActivityDto) => {
        const mapper = (a: ActionActivityDto) =>
          a.id === activityId
            ? {
                ...a,
                likes: responseData.likes,
                likesCount: responseData.likesCount,
                likedByMe: responseData.likedByMe,
              }
            : a;

        if (infinite) {
          queryClient.setQueryData<InfiniteActivityData>(
            queryKey,
            (old) => mapInfiniteActivities(old, mapper)
          );
        } else {
          queryClient.setQueryData<ActionActivityDto[]>(queryKey, (old) =>
            old ? old.map(mapper) : []
          );
        }
      };

      if (isLiked) {
        const response = await actionsUnlikeActivity({
          path: { id: activityId },
        });
        if (response.response.ok && response.data) {
          updateLikeInCache(response.data);
          return response.data;
        }
        return null;
      } else {
        const response = await actionsLikeActivity({
          path: { id: activityId },
        });
        if (response.response.ok && response.data) {
          updateLikeInCache(response.data);
          posthog.capture("activity_liked", {
            activityId: activity.id,
            activityType: activity.type,
          });
          return response.data;
        }
      }
      return null;
    },
    [activities, queryClient, queryKey, infinite]
  );

  const updateActivity = useCallback(
    (updatedActivity: ActionActivityDto) => {
      const mapper = (a: ActionActivityDto) =>
        a.id === updatedActivity.id ? { ...a, ...updatedActivity } : a;

      if (infinite) {
        queryClient.setQueryData<InfiniteActivityData>(
          queryKey,
          (old) => mapInfiniteActivities(old, mapper)
        );
      } else {
        queryClient.setQueryData<ActionActivityDto[]>(queryKey, (old) =>
          old ? old.map(mapper) : []
        );
      }
    },
    [queryClient, queryKey, infinite]
  );

  const noop = useCallback(() => {}, []);

  return {
    loading,
    activities,
    handleLikeActivity,
    setActivities,
    updateActivity,
    fetchNextPage: infinite ? infiniteResult.fetchNextPage : noop,
    hasNextPage: infinite ? (infiniteResult.hasNextPage ?? false) : false,
    isFetchingNextPage: infinite ? infiniteResult.isFetchingNextPage : false,
  };
};

export default useActivities;
