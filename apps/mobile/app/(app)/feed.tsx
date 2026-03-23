import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  View,
} from "react-native";
import { ActionActivityDto } from "@alliance/shared/client";
import useActivities, {
  ActivityList,
} from "@alliance/shared/lib/useActivities";
import { useAuth } from "../../lib/AuthContext";
import { colors } from "../../lib/style/colors";
import Text from "../../components/system/Text";
import UserActivityCard from "../../components/UserActivityCard";
import { LegendList } from "@legendapp/list";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { cn } from "@alliance/shared/styles/util";
import { SimplePageTitle } from "../../components/system/SimplePageTitle";
import { useHideOnScroll } from "../../lib/useHideOnScroll";

type Mode = "friends" | "everyone";

export default function FeedScreen() {
  const [mode, setMode] = useState<Mode>("friends");
  const { user } = useAuth();
  const {
    isVisible: isHeaderVisible,
    onScroll: onListScroll,
    scrollEventThrottle,
  } = useHideOnScroll();

  const {
    activities: globalActivities,
    handleLikeActivity: handleGlobalLikeActivity,
    updateActivity: updateGlobalActivity,
    loading: loadingGlobal,
    setActivities: setGlobalActivities,
    fetchNextPage: fetchNextGlobal,
    hasNextPage: hasNextGlobal,
    isFetchingNextPage: isFetchingNextGlobal,
  } = useActivities({
    list: ActivityList.Global,
    comments: true,
    limit: 30,
  });

  const {
    activities: friendActivities,
    handleLikeActivity: handleLikeFriendActivity,
    updateActivity: updateFriendActivity,
    loading: loadingFriend,
    setActivities: setFriendActivities,
    fetchNextPage: fetchNextFriends,
    hasNextPage: hasNextFriends,
    isFetchingNextPage: isFetchingNextFriends,
  } = useActivities({
    list: ActivityList.Friends,
    comments: true,
    limit: 30,
  });

  const handleLikeActivity = useCallback(
    async (activityId: number, activityMode: Mode) => {
      if (activityMode === "friends") {
        const liked = await handleLikeFriendActivity(activityId);
        if (liked) {
          setGlobalActivities((prev) =>
            prev.map((a) => (a.id === activityId ? liked : a)),
          );
        }
      } else {
        const liked = await handleGlobalLikeActivity(activityId);
        if (liked) {
          setFriendActivities((prev) =>
            prev.map((a) => (a.id === activityId ? liked : a)),
          );
        }
      }
    },
    [
      handleLikeFriendActivity,
      handleGlobalLikeActivity,
      setGlobalActivities,
      setFriendActivities,
    ],
  );

  const updateActivity = useCallback(
    (activity: ActionActivityDto, activityMode: Mode) => {
      if (activityMode === "friends") {
        updateFriendActivity(activity);
      } else {
        updateGlobalActivity(activity);
      }
    },
    [updateFriendActivity, updateGlobalActivity],
  );

  const activities = mode === "friends" ? friendActivities : globalActivities;
  const loading = mode === "friends" ? loadingFriend : loadingGlobal;
  const isFetchingNext =
    mode === "friends" ? isFetchingNextFriends : isFetchingNextGlobal;

  // Stable ref for onEndReached so the callback doesn't need volatile deps (per frontend pattern)
  const paginationRef = useRef({
    fetchNextFriends,
    fetchNextGlobal,
    hasNextFriends,
    hasNextGlobal,
    isFetchingNextFriends,
    isFetchingNextGlobal,
    mode,
  });
  paginationRef.current = {
    fetchNextFriends,
    fetchNextGlobal,
    hasNextFriends,
    hasNextGlobal,
    isFetchingNextFriends,
    isFetchingNextGlobal,
    mode,
  };

  const onEndReached = useCallback(() => {
    const p = paginationRef.current;
    if (p.mode === "friends") {
      if (p.hasNextFriends && !p.isFetchingNextFriends) p.fetchNextFriends();
    } else {
      if (p.hasNextGlobal && !p.isFetchingNextGlobal) p.fetchNextGlobal();
    }
  }, []);

  const renderActivity = useCallback(
    ({ item: activity }: { item: ActionActivityDto }) => {
      return (
        <View className="border-b-3 border-zinc-100">
          <UserActivityCard
            activity={activity}
            handleLike={() => handleLikeActivity(activity.id, mode)}
            onActivityUpdate={(updatedActivity) =>
              updateActivity(updatedActivity, mode)
            }
            canEdit={activity.user.id === user?.id}
          />
        </View>
      );
    },
    [handleLikeActivity, updateActivity, mode, user?.id],
  );

  const listHeader = (
    <SimplePageTitle title="Activity" isVisible={isHeaderVisible}>
      <View className="flex-row bg-white/20 rounded-lg p-1">
        <TouchableOpacity
          onPress={() => setMode("friends")}
          activeOpacity={0.7}
          className={cn(
            "px-3 py-1.5 rounded-md",
            mode === "friends" && "bg-white",
          )}
        >
          <Text
            className={cn(
              "text-sm font-medium",
              mode === "friends" ? "text-green" : "text-black",
            )}
          >
            Friends
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setMode("everyone")}
          activeOpacity={0.7}
          className={cn(
            "px-3 py-1.5 rounded-md",
            mode === "everyone" && "bg-white",
          )}
        >
          <Text
            className={cn(
              "text-sm font-medium",
              mode === "everyone" ? "text-green" : "text-black",
            )}
          >
            Everyone
          </Text>
        </TouchableOpacity>
      </View>
    </SimplePageTitle>
  );

  return (
    <View className="flex-1">
      {loading ? (
        <>
          {listHeader}
          <View className="flex-1 items-center justify-center bg-white">
            <ActivityIndicator size="large" color={colors.green} />
          </View>
        </>
      ) : activities.length === 0 ? (
        <>
          {listHeader}
          <View className="flex-1 items-center justify-center bg-white">
            <Text className="text-zinc-500">
              {mode === "friends"
                ? "No friend activity yet"
                : "No activity yet"}
            </Text>
          </View>
        </>
      ) : (
        <KeyboardAvoidingView
          behavior="position"
          className="flex-1"
          contentContainerStyle={{ flex: 1 }}
          testID="vr-feed-ready"
          keyboardVerticalOffset={100}
        >
          {listHeader}
          <LegendList
            key={mode}
            className="flex-1"
            data={activities}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderActivity}
            onScroll={onListScroll}
            scrollEventThrottle={scrollEventThrottle}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.3}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={() => {}} />
            }
            recycleItems
            contentContainerStyle={{
              paddingBottom: 40,
              backgroundColor: "white",
            }}
            ListFooterComponent={
              isFetchingNext ? (
                <View className="py-4 items-center">
                  <ActivityIndicator size="small" color={colors.green} />
                  <Text className="text-zinc-400 text-sm mt-2">
                    Loading more...
                  </Text>
                </View>
              ) : null
            }
          />
        </KeyboardAvoidingView>
      )}
    </View>
  );
}
