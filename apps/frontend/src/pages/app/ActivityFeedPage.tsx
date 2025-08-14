import { useEffect, useState } from "react";
import {
  ActionActivityDto,
  actionsGetActivityFeed,
} from "@alliance/shared/client";
import { useActionActivityWebSocket } from "../../lib/useActionActivityWebSocket";
import ActivityFeedItem from "../../components/ActivityFeedItem";

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p>Loading feed...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="space-y-4 w-full flex flex-col justify-stretch">
        {allActivities.map((activity) => (
          <ActivityFeedItem
            key={activity.id}
            activity={activity}
            showAction={true}
            handleLike={() => {}} //TODO
          />
        ))}
      </div>
    </div>
  );
};

export default ActivityFeedPage;
