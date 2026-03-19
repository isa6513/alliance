import { useCallback, useRef } from "react";
import { ActionActivityDto } from "@alliance/shared/client";
import useActivities, {
  ActivityList,
} from "@alliance/shared/lib/useActivities";
import { useAuth } from "../lib/AuthContext";
import UserActivityCard from "./UserActivityCard";
import Spinner from "@alliance/sharedweb/ui/Spinner";

const LIMIT = 5;

const HomeFeed = () => {
  const { user } = useAuth();

  const {
    activities,
    handleLikeActivity,
    updateActivity,
    loading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useActivities({
    list: ActivityList.HomeFeed,
    comments: true,
    limit: LIMIT,
  });

  const observerRef = useRef<IntersectionObserver | null>(null);

  const paginationRef = useRef({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  });
  paginationRef.current = {
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };

  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    if (!node) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const p = paginationRef.current;
        for (const entry of entries) {
          if (entry.isIntersecting && p.hasNextPage && !p.isFetchingNextPage) {
            p.fetchNextPage();
          }
        }
      },
      { rootMargin: "200px" },
    );
    observerRef.current.observe(node);
  }, []);

  const handleLike = useCallback(
    async (activityId: number) => {
      await handleLikeActivity(activityId);
    },
    [handleLikeActivity],
  );

  const handleUpdate = useCallback(
    (updatedActivity: ActionActivityDto) => {
      updateActivity(updatedActivity);
    },
    [updateActivity],
  );

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="medium" />
      </div>
    );
  }

  if (activities.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col">
      <p className="text-title-small font-serif mb-4">Activity</p>
      <div className="flex flex-col gap-y-2 *:p-4">
        {activities.map((activity) => (
          <UserActivityCard
            activity={activity}
            key={activity.id}
            handleLike={() => handleLike(activity.id)}
            onActivityUpdate={handleUpdate}
            canEdit={activity.user.id === user?.id}
          />
        ))}
      </div>
      {isFetchingNextPage && (
        <div className="flex justify-center py-4 text-zinc-400">
          Loading more...
        </div>
      )}
      <div ref={sentinelRef} className="h-1" />
    </div>
  );
};

export default HomeFeed;
