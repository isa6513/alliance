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
  const [feedActivities, setFeedActivities] = useState<ActionActivityDto[]>([]);
  const [liveActivities, setLiveActivities] = useState<ActionActivityDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 10;
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
          query: { limit: String(PAGE_SIZE), before: new Date().toISOString() },
        });
        const data = (response.data || []) as ActionActivityDto[];
        setFeedActivities(data);
        setHasMore(data.length === PAGE_SIZE);
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

  // Combine paged activities with live activities, avoiding duplicates
  const allActivities = [...liveActivities, ...feedActivities]
    .filter(
      (activity, index, self) =>
        self.findIndex((a) => a.id === activity.id) === index
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || feedActivities.length === 0) return;
    try {
      setLoadingMore(true);
      const last = feedActivities[feedActivities.length - 1];
      const before = last.createdAt;
      const resp = await actionsGetActivityFeed({
        query: { limit: String(PAGE_SIZE), before },
      });
      const more = (resp.data || []) as ActionActivityDto[];
      setFeedActivities((prev) => [...prev, ...more]);
      setHasMore(more.length === PAGE_SIZE);
    } catch (e) {
      console.error("Failed to load more feed items", e);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, feedActivities, PAGE_SIZE]);

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
          setFeedActivities((prev) =>
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
          setFeedActivities((prev) =>
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
    setFeedActivities((prev) =>
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
        {allActivities.length === 0 && (
          <div className="flex flex-col items-center justify-center h-screen text-zinc-500">
            <p className="pb-20">No friend activity yet</p>
          </div>
        )}
        {allActivities.map((activity) => (
          <UserActivityCard
            activity={activity}
            key={activity.id}
            handleLike={handleLikeActivity}
            onActivityUpdate={updateActivity}
            canEdit={activity.user.id === user?.id}
          />
        ))}
        {hasMore && (
          <button
            className="mt-4 self-center px-4 py-2 rounded-md bg-transparent border border-zinc-300 hover:bg-zinc-50 text-zinc-900"
            onClick={loadMore}
            disabled={loadingMore}
          >
            {loadingMore ? "Loading..." : "Load more"}
          </button>
        )}
      </div>
    </div>
  );
};

export default ActivityFeedPage;
