import {
  ActionActivityDto,
  actionsGetActivityFeed,
  actionsLikeActivity,
  actionsUnlikeActivity,
} from "@alliance/shared/client";

import { useCallback, useEffect, useState } from "react";
import UserActivityCard from "../../components/UserActivityCard";
import { useAuth } from "../../lib/AuthContext";
import { useActionActivityWebSocket } from "../../lib/useActionActivityWebSocket";

const ActivityFeedPage = () => {
  const [initialActivities, setInitialActivities] = useState<
    ActionActivityDto[]
  >([]);
  const [liveActivities, setLiveActivities] = useState<ActionActivityDto[]>([]);
  const [loading, setLoading] = useState(true);
  const {
    subscribeToFeed,
    unsubscribeFromFeed,
    onFeedActivity,
    offFeedActivity,
  } = useActionActivityWebSocket();

  const { user } = useAuth();

  useEffect(() => {
    const fetchInitialActivities = async () => {
      try {
        setLoading(true);
        const response = await actionsGetActivityFeed({
          query: { limit: "50" },
        });
        if (response.data) {
          setInitialActivities(response.data as ActionActivityDto[]);
        }
      } catch (err) {
        console.error("Error fetching initial activities:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialActivities();
    subscribeToFeed();

    const handleFeedActivity = (event: {
      actionId: number;
      activity: ActionActivityDto;
    }) => {
      setLiveActivities((prev) => [event.activity, ...prev]);
    };

    onFeedActivity(handleFeedActivity);

    return () => {
      unsubscribeFromFeed();
      offFeedActivity(handleFeedActivity);
    };
  }, [subscribeToFeed, unsubscribeFromFeed, onFeedActivity, offFeedActivity]);

  // Combine initial activities with live activities, avoiding duplicates
  const allActivities = [...liveActivities, ...initialActivities]
    .filter(
      (activity, index, self) =>
        self.findIndex((a) => a.id === activity.id) === index
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const handleLikeActivity = useCallback(
    async (activityId: number) => {
      if (!user) return;

      const activity = allActivities.find((a) => a.id === activityId);
      if (!activity) return;

      const isLiked = activity.likes.some((like) => like.id === user.id);

      if (isLiked) {
        const response = await actionsUnlikeActivity({
          path: { id: activityId },
        });
        if (response.response.ok) {
          setLiveActivities((prev) =>
            prev.map((a) =>
              a.id === activityId
                ? {
                    ...a,
                    likes: a.likes.filter((like) => like.id !== user.id),
                  }
                : a
            )
          );
          setInitialActivities((prev) =>
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
          setLiveActivities((prev) =>
            prev.map((a) =>
              a.id === activityId
                ? {
                    ...a,
                    likes: response.data.likes || [],
                  }
                : a
            )
          );
          setInitialActivities((prev) =>
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
    [user, allActivities]
  );

  const updateActivity = useCallback((updatedActivity: ActionActivityDto) => {
    setLiveActivities((prev) =>
      prev.map((a) => (a.id === updatedActivity.id ? updatedActivity : a))
    );
    setInitialActivities((prev) =>
      prev.map((a) => (a.id === updatedActivity.id ? updatedActivity : a))
    );
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p>Loading feed...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="space-y-2 w-full flex flex-col justify-stretch">
        {allActivities.map((activity) => (
          // <ActionActivityFeedItem
          //   key={activity.id}
          //   activity={activity}
          //   showAction={true}
          //   handleLike={() => handleLikeActivity(activity.id)}
          // />
          <UserActivityCard
            activity={activity}
            key={activity.id}
            handleLike={handleLikeActivity}
            onActivityUpdate={updateActivity}
            canEdit={activity.user.id === user?.id}
          />
        ))}
      </div>
    </div>
  );
};

export default ActivityFeedPage;
