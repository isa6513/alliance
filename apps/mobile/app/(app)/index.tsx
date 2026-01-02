import { View, ScrollView, ActivityIndicator } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { ActionDto, actionsFindAllLoggedIn } from "@alliance/shared/client";
import { colors, Text } from "../../components/system";
import { useHomePageActions } from "@alliance/shared/lib/homePage";
import LargeActionCard from "../../components/LargeActionCard";
import useActivities, {
  ActivityList,
} from "@alliance/shared/lib/useActivities";
import { Check } from "lucide-react-native";
import { noTasksToDoRightNow } from "@alliance/shared/lib/copy";

export default function HomeScreen() {
  const [actions, setActions] = useState<ActionDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActions = useCallback(async () => {
    try {
      const response = await actionsFindAllLoggedIn({
        query: { sorted: true },
      });
      if (response.error) {
        throw new Error("Failed to fetch actions");
      }
      setActions(response.data || []);
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

  const {
    currentTask,
    todoActions,
    newActions,
    currentWeekTodoActions,
    nextWeekTodoActions,
    remainingTasksEstimatedTimeCurrentWeek,
    completedActions,
  } = useHomePageActions(actions);

  const { activities: friendActivities, handleLikeActivity } = useActivities({
    list: ActivityList.Friends,
    limit: 8,
  });

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="mt-4">
        {loading ? (
          <ActivityIndicator
            size="large"
            color={colors.green}
            className="self-center mx-auto"
          />
        ) : error ? (
          <Text className="text-red-500 text-center py-4">{error}</Text>
        ) : currentTask ? (
          <LargeActionCard
            action={currentTask}
            userRelation={currentTask.userRelation as "joined" | "none"}
            friendActivities={friendActivities.filter(
              (activity) => activity.actionId === currentTask.id
            )}
            onUpdateActionState={fetchActions}
          />
        ) : (
          <View className="items-center justify-center py-16 px-5">
            <View className="w-12 h-12 rounded-full bg-green items-center justify-center mb-4">
              <Check size={32} color="#fff" strokeWidth={3} />
            </View>
            <Text className="text-zinc-500 text-lg text-center">
              {noTasksToDoRightNow}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
