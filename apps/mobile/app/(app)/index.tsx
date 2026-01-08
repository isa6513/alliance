import { View, ScrollView, ActivityIndicator } from "react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  actionsFindAllLoggedIn,
  userGetAwayRanges,
} from "@alliance/shared/client";
import { colors, Text } from "../../components/system";
import { useHomePageActions } from "@alliance/shared/lib/homePage";
import LargeActionCard from "../../components/LargeActionCard";
import useActivities, {
  ActivityList,
} from "@alliance/shared/lib/useActivities";
import { Check } from "lucide-react-native";
import { noTasksToDoRightNow } from "@alliance/shared/lib/copy";
import {
  ActionWithAwayStatus,
  getAwayStatus,
} from "@alliance/shared/lib/actionUtils";

export default function HomeScreen() {
  const [actions, setActions] = useState<ActionWithAwayStatus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActions = useCallback(async () => {
    try {
      const [actionsResponse, awayRangesResponse] = await Promise.all([
        actionsFindAllLoggedIn({
          query: { sorted: true },
        }),
        userGetAwayRanges(),
      ]);

      if (actionsResponse.error || awayRangesResponse.error) {
        setError("Failed to fetch actions");
      }

      if (actionsResponse.data && awayRangesResponse.data) {
        const now = new Date();
        setActions(
          actionsResponse.data.map((action) => ({
            ...action,
            awayStatus: getAwayStatus(action, awayRangesResponse.data, now),
          }))
        );
        setError(null);
      }
      setLoading(false);
    } catch (err) {
      setError("Failed to load actions");
      setLoading(false);
      console.error("Error fetching actions:", err);
    }
  }, []);

  useEffect(() => {
    fetchActions();
  }, [fetchActions]);

  const { currentTask } = useHomePageActions(actions);

  const { activities: friendActivities } = useActivities({
    list: ActivityList.Friends,
    limit: 8,
  });

  const scrollViewRef = useRef<ScrollView>(null);

  const scrollPageTo = useCallback((y: number) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        y: y,
        animated: true,
      });
    }
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center py-16 px-5 bg-white">
        <ActivityIndicator size="large" color={colors.green} />
      </View>
    );
  }

  if (!currentTask) {
    return (
      <View className="flex-1 items-center justify-center py-16 px-5 bg-white">
        <View className="w-12 h-12 rounded-full bg-green items-center justify-center mb-4">
          <Check size={32} color="#fff" strokeWidth={3} />
        </View>
        <Text className="text-zinc-500 text-lg text-center">
          {noTasksToDoRightNow}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView ref={scrollViewRef} className="flex-1 bg-white">
      <Text className="text-green text-lg font-semibold p-6 mt-2 pb-0">
        Current task
      </Text>
      <View className="">
        {!currentTask ? (
          <Text className="text-red-500 text-center py-4">{error}</Text>
        ) : (
          <LargeActionCard
            action={currentTask}
            userRelation={currentTask.userRelation ?? "none"}
            friendActivities={friendActivities.filter(
              (activity) => activity.actionId === currentTask.id
            )}
            onUpdateActionState={fetchActions}
            scrollPageTo={scrollPageTo}
          />
        )}
      </View>
    </ScrollView>
  );
}
