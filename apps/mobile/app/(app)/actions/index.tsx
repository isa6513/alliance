import {
  View,
  TouchableOpacity,
  Modal,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useCallback, useMemo, useState } from "react";
import { router } from "expo-router";
import { FilterMode } from "@alliance/shared/lib/actionUtils";
import {
  filterActions,
  useActionsQuery,
} from "@alliance/shared/lib/actionsListPage";
import Text from "../../../components/system/Text";
import GreenHeader from "../../../components/GreenHeader";
import ListHeader from "../../../components/ListHeader";
import { ChevronDown } from "lucide-react-native";
import ActionItemCard from "../../../components/ActionItemCard";
import { LegendList } from "@legendapp/list";
import { colors } from "../../../lib/style/colors";

export default function ActionsScreen() {
  const [filterMode, setFilterMode] = useState<FilterMode>(FilterMode.All);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { data: actions, isPending, isRefetching, refetch } = useActionsQuery();

  const counts = useMemo(() => {
    const result: Record<FilterMode, number> = {} as any;
    for (const mode of Object.values(FilterMode) as FilterMode[]) {
      result[mode] = filterActions(actions ?? [], mode).length;
    }
    return result;
  }, [actions]);

  const filteredActions = actions ? filterActions(actions, filterMode) : [];

  const navigateToAction = useCallback((actionId: number) => {
    router.push(`/actions/${actionId}`);
  }, []);

  return (
    <GreenHeader>
        {isPending ? (
        <View className="flex-1">
          <ListHeader className="pt-12">
            <Text className="text-white font-bold">All Actions</Text>
          </ListHeader>
          <View className="flex-1 items-center justify-center bg-white">
            <ActivityIndicator size="large" color={colors.green} />
          </View>
        </View>
      ) : (
        <LegendList
          contentContainerStyle={{ backgroundColor: "white", minHeight: "80%" }}
          ListHeaderComponent={
            <ListHeader>
              <Text className="text-white font-bold">All Actions</Text>
              <View className="flex-row items-center gap-x-2">
                <Text className="text-sm text-white font-medium">
                  Filter by:
                </Text>
                <View className="relative">
                  <TouchableOpacity
                    onPress={() => setDropdownOpen(!dropdownOpen)}
                    className="flex-row items-center gap-x-2 px-3 py-2 bg-white rounded"
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
                        {(Object.values(FilterMode) as FilterMode[]).map(
                          (mode) => (
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
                                {counts[mode]}
                              </Text>
                            </TouchableOpacity>
                          )
                        )}
                      </View>
                    </Pressable>
                  </Modal>
                </View>
              </View>
            </ListHeader>
          }
          data={filteredActions}
          keyExtractor={(item) => item.id.toString()}
          recycleItems
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
          renderItem={({ item }) => (
            <View key={item.id} className="border-b border-zinc-200">
              <ActionItemCard
                action={item}
                onPress={() => navigateToAction(item.id)}
              />
            </View>
            )}
          />
        )}
    </GreenHeader>
  );
}
