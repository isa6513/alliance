import {
  View,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { router } from "expo-router";
import { Settings } from "lucide-react-native";
import { communityGetMyCommunities } from "@alliance/shared/client";
import type { CommunityDto } from "@alliance/shared/client/types.gen";
import { getMemberCount } from "@alliance/shared/lib/communityUtils";
import { LegendList } from "@legendapp/list";
import Text from "../../../components/system/Text";
import { SimplePageTitle } from "../../../components/system/SimplePageTitle";
import { colors } from "../../../lib/style/colors";

export default function GroupsScreen() {
  const [communities, setCommunities] = useState<CommunityDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCommunities = useCallback(async () => {
    try {
      const response = await communityGetMyCommunities();
      setCommunities(response.data ?? []);
    } catch (err) {
      console.error("Failed to load communities", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadCommunities();
  }, [loadCommunities]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void loadCommunities();
  }, [loadCommunities]);

  const sortedCommunities = useMemo(
    () =>
      [...communities].sort((a, b) =>
        a.name
          .trim()
          .localeCompare(b.name.trim(), undefined, { sensitivity: "base" })
      ),
    [communities]
  );

  return (
    <View className="flex-1 bg-white">
      {loading ? (
        <View className="flex-1">
          <SimplePageTitle title="Groups" />
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.green} />
          </View>
        </View>
      ) : (
        <LegendList
          contentContainerStyle={{ backgroundColor: "white", minHeight: "80%" }}
          ListHeaderComponent={
            <SimplePageTitle title="Groups">
              <TouchableOpacity
                onPress={() => router.push("/groups/manage")}
                className="p-2"
                accessibilityLabel="Manage groups"
              >
                <Settings size={22} color="#71717a" strokeWidth={2} />
              </TouchableOpacity>
            </SimplePageTitle>
          }
          ListEmptyComponent={
            <View className="px-4 py-8 items-center">
              <Text className="text-sm text-zinc-500">
                You are not in any groups yet.
              </Text>
            </View>
          }
          data={sortedCommunities}
          keyExtractor={(item) => item.id.toString()}
          recycleItems
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
            <CommunityCard community={item} />
          )}
        />
      )}
    </View>
  );
}

function CommunityCard({ community }: { community: CommunityDto }) {
  const memberCount = getMemberCount(community);
  const leaderCount = community.leaders.length;

  return (
    <View className="border-b border-zinc-100 px-4 py-4 gap-y-2">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-y-1">
          <Text className="font-semibold text-zinc-900">{community.name}</Text>
          <Text className="text-sm text-zinc-500" numberOfLines={2}>
            {community.description || "No description yet."}
          </Text>
        </View>
        <View className="items-end gap-y-1">
          <Text
            className={`text-xs font-medium ${community.public ? "text-green-600" : "text-zinc-400"}`}
          >
            {community.public ? "Public" : "Private"}
          </Text>
          <Text className="text-sm text-zinc-600">
            {memberCount} member{memberCount === 1 ? "" : "s"}
          </Text>
          {leaderCount > 0 && (
            <Text className="text-xs text-zinc-400">
              {leaderCount} leader{leaderCount === 1 ? "" : "s"}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}
