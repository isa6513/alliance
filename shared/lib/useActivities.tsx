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
import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  props: UseActivitiesProps
): Promise<ActionActivityDto[]> => {
  const { list, objectId, limit = 50, comments = false } = props;

  let apiCall;
  switch (list) {
    case ActivityList.Friends:
      apiCall = actionsFriendActivity({
        query: { comments, limit: limit.toString() },
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
          before: new Date().toISOString(),
          comments,
          communityId: objectId!,
        },
      });
      break;
    case ActivityList.Global:
      apiCall = actionsGetActivityFeed({
        query: {
          limit: limit.toString(),
          before: new Date().toISOString(),
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

const useActivities = (props: UseActivitiesProps) => {
  const queryClient = useQueryClient();
  const queryKey = generateQueryKey(props);

  const { data: activities = [], isLoading: loading } = useQuery({
    queryKey,
    queryFn: () => fetchActivities(props),
  });

  const setActivities = useCallback(
    (updater: React.SetStateAction<ActionActivityDto[]>) => {
      queryClient.setQueryData<ActionActivityDto[]>(queryKey, (old) => {
        return typeof updater === "function" ? updater(old ?? []) : updater;
      });
    },
    [queryClient, queryKey]
  );

  const handleLikeActivity = useCallback(
    async (activityId: number) => {
      const activity = activities.find((a) => a.id === activityId);
      if (!activity) return;

      const isLiked = activity.likedByMe ?? false;

      if (isLiked) {
        const response = await actionsUnlikeActivity({
          path: { id: activityId },
        });
        if (response.response.ok && response.data) {
          queryClient.setQueryData<ActionActivityDto[]>(queryKey, (old) =>
            old
              ? old.map((a) =>
                  a.id === activityId
                    ? {
                        ...a,
                        likes: response.data.likes,
                        likesCount: response.data.likesCount,
                        likedByMe: response.data.likedByMe,
                      }
                    : a
                )
              : []
          );
          return response.data;
        }
        return null;
      } else {
        const response = await actionsLikeActivity({
          path: { id: activityId },
        });
        if (response.response.ok && response.data) {
          queryClient.setQueryData<ActionActivityDto[]>(queryKey, (old) =>
            old
              ? old.map((a) =>
                  a.id === activityId
                    ? {
                        ...a,
                        likes: response.data.likes,
                        likesCount: response.data.likesCount,
                        likedByMe: response.data.likedByMe,
                      }
                    : a
                )
              : []
          );

          posthog.capture("activity_liked", {
            activityId: activity.id,
            activityType: activity.type,
          });
          return response.data;
        }
      }
      return null;
    },
    [activities, queryClient, queryKey]
  );

  const updateActivity = useCallback(
    (updatedActivity: ActionActivityDto) => {
      queryClient.setQueryData<ActionActivityDto[]>(queryKey, (old) =>
        old
          ? old.map((a) =>
              a.id === updatedActivity.id ? { ...a, ...updatedActivity } : a
            )
          : []
      );
    },
    [queryClient, queryKey]
  );

  return {
    loading,
    activities,
    handleLikeActivity,
    setActivities,
    updateActivity,
  };
};

export default useActivities;
