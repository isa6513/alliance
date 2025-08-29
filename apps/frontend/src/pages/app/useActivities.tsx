import {
  ActionActivityDto,
  actionsFindCompletedForUser,
  actionsFriendActivity,
  actionsGetActionActivities,
  actionsGetActivityFeed,
  actionsLikeActivity,
  actionsUnlikeActivity,
} from "@alliance/shared/client";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../lib/AuthContext";

export enum ActivityList {
  Friends = "friends",
  User = "user",
  Action = "action",
  Global = "global",
}

export type UseActivitiesProps =
  | {
      list: ActivityList.User | ActivityList.Action;
      objectId: number;
    }
  | {
      list: ActivityList.Global | ActivityList.Friends;
      objectId?: never;
    };

const useActivities = ({ list, objectId }: UseActivitiesProps) => {
  const [activities, setActivities] = useState<ActionActivityDto[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    let apiCall;
    switch (list) {
      case ActivityList.Friends:
        apiCall = actionsFriendActivity();
        break;
      case ActivityList.User:
        apiCall = actionsFindCompletedForUser({ path: { id: objectId } });
        break;
      case ActivityList.Action:
        apiCall = actionsGetActionActivities({ path: { id: objectId } });
        break;
      case ActivityList.Global:
        apiCall = actionsGetActivityFeed({
          query: { limit: "50", before: new Date().toISOString() },
        });
        break;
    }
    apiCall.then((resp) => {
      const respActivities = (resp.data ?? []).sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setActivities(respActivities);
    });
  }, [list, objectId]);

  const handleLikeActivity = useCallback(
    async (activityId: number) => {
      if (!user) return;

      const activity = activities.find((a) => a.id === activityId);
      if (!activity) return;

      const isLiked = activity.likes.some((like) => like.id === user.id);

      if (isLiked) {
        const response = await actionsUnlikeActivity({
          path: { id: activityId },
        });
        if (response.response.ok) {
          setActivities((prev) =>
            prev.map((a) =>
              a.id === activityId
                ? {
                    ...a,
                    likes: a.likes.filter((like) => like.id !== user.id),
                  }
                : a
            )
          );
        }
      } else {
        const response = await actionsLikeActivity({
          path: { id: activityId },
        });
        if (response.response.ok && response.data) {
          setActivities((prev) =>
            prev.map((a) =>
              a.id === activityId
                ? {
                    ...a,
                    likes: response.data.likes || [],
                  }
                : a
            )
          );
        }
      }
    },
    [user, activities]
  );

  const updateActivity = useCallback((updatedActivity: ActionActivityDto) => {
    setActivities((prev) =>
      prev.map((a) => (a.id === updatedActivity.id ? updatedActivity : a))
    );
  }, []);

  return {
    activities,
    handleLikeActivity,
    setActivities,
    updateActivity,
  };
};

export default useActivities;
