import {
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import { useEffect, useMemo, useState } from "react";
import { ActionDto, actionsFindAllLoggedIn } from "@alliance/shared/client";
import { router } from "expo-router";
import { FilterMode } from "@alliance/shared/lib/actionUtils";
import { filterActions } from "@alliance/shared/lib/actionsListPage";
import { Text } from "../../../components/system";
import { ChevronDown } from "lucide-react-native";
import ActionItemCard from "../../../components/ActionItemCard";

export default function ActionsScreen() {
  const [actions, setActions] = useState<ActionDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<FilterMode>(FilterMode.All);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchActions = async () => {
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
    };

    fetchActions();
  }, []);

  const modeToActions: Record<FilterMode, ActionDto[]> = useMemo(() => {
    return (Object.values(FilterMode) as FilterMode[]).reduce((acc, mode) => {
      acc[mode] = filterActions(actions, mode);
      return acc;
    }, {} as Record<FilterMode, ActionDto[]>);
  }, [actions]);

  const filteredActions = useMemo(
    () => [...modeToActions[filterMode]],
    [modeToActions, filterMode]
  );

  const navigateToAction = (actionId: number) => {
    router.push(`/actions/${actionId}`);
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-4 py-10 gap-y-4">
        {/* Filter dropdown row */}
        <View className="flex-row items-center gap-x-3">
          <Text className="text-sm text-black">Filter by:</Text>
          <View className="relative">
            <TouchableOpacity
              onPress={() => setDropdownOpen(!dropdownOpen)}
              className="flex-row items-center gap-x-2 px-3 py-2 bg-white border border-zinc-200 rounded"
            >
              <Text className="text-sm text-black">{filterMode}</Text>
              <ChevronDown size={15} color="black" />
            </TouchableOpacity>

            <Modal
              visible={dropdownOpen}
              transparent
              animationType="fade"
              onRequestClose={() => setDropdownOpen(false)}
            >
              <Pressable
                className="flex-1 bg-black/20"
                onPress={() => setDropdownOpen(false)}
              >
                <View className="mx-4 mt-32 bg-white border border-zinc-200 rounded overflow-hidden">
                  {(Object.values(FilterMode) as FilterMode[]).map((mode) => (
                    <TouchableOpacity
                      key={mode}
                      onPress={() => {
                        setFilterMode(mode);
                        setDropdownOpen(false);
                      }}
                      className="px-4 py-3 border-b border-zinc-100 flex-row justify-between items-center"
                    >
                      <Text className="text-sm text-black">{mode}</Text>
                      <Text className="text-sm text-zinc-500 font-mono">
                        {modeToActions[mode].length}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Pressable>
            </Modal>
          </View>
        </View>

        {/* Actions list */}
        <View className="bg-white rounded overflow-hidden">
          {loading ? (
            <View className="py-5 items-center justify-center">
              <ActivityIndicator size="large" color="#0D1B2A" />
            </View>
          ) : error ? (
            <Text className="text-center text-red-500 py-4">{error}</Text>
          ) : filteredActions.length === 0 ? (
            <Text className="text-center text-zinc-500 py-5">
              No matching actions
            </Text>
          ) : (
            filteredActions.map((action, index) => (
              <View key={action.id} className="border-t border-zinc-200">
                <ActionItemCard
                  action={action}
                  onPress={() => navigateToAction(action.id)}
                />
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}
