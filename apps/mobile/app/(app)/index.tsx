import {
  View,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  actionsDismissAction,
  actionsDismissGeneralUpdate,
  actionsFindAllLoggedIn,
  actionsUnreadGeneralUpdates,
  userGetAwayRanges,
} from "@alliance/shared/client";
import { colors } from "../../lib/style/colors";
import Text from "../../components/system/Text";
import {
  ActionWithAwayStatus,
  TaskAwayStatus,
  deadlineHasPassed,
  getAwayStatus,
  isGeneralUpdate,
  homePagePriorityComparator,
} from "@alliance/shared/lib/actionUtils";
import { useHomePageActions } from "@alliance/shared/lib/homePage";
import LargeActionCard from "../../components/LargeActionCard";
import LargeGeneralUpdateCard from "../../components/LargeGeneralUpdateCard";
import { Check, User } from "lucide-react-native";
import {
  noTasksToDoRightNow,
  TASK_DISMISS_MESSAGE_AFTER_DEADLINE,
  TASK_DISMISS_MESSAGE_CURRENTLY_AWAY,
  TASK_DISMISS_MESSAGE_WAS_AWAY,
  TASK_DISMISS_MESSAGE_WILL_BE_AWAY,
} from "@alliance/shared/lib/copy";
import SuccessOverlay from "../../components/SuccessOverlay";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyboardAwareScrollViewRef } from "react-native-keyboard-controller";
import KeyboardAwareScrollView from "../../components/KeyboardAwareScrollView";
import type { GeneralUpdateDto } from "@alliance/shared/client";
import type { LargeActionCardPropsShared } from "@alliance/shared/lib/largeActionCard";
import { useAuth } from "../../lib/AuthContext";
import { useBoundedIndex } from "../../lib/useBoundedIndex";
import { SimplePageTitle } from "../../components/system/SimplePageTitle";
import { IndexStepper } from "../../components/system/IndexStepper";
import { router } from "expo-router";
import ProfileImage from "../../components/ProfileImage";

const GENERAL_UPDATES_QUERY_KEY = [
  "actions",
  "generalUpdates",
  "unread",
] as const;

export default function HomeScreen() {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmitSuccess = useCallback(() => {
    setShowSuccess(true);
  }, []);

  const handleSuccessComplete = useCallback(() => {
    setShowSuccess(false);
  }, []);
  const {
    data: actions,
    isPending,
    refetch,
  } = useQuery({
    queryKey: ["actions"],
    queryFn: () =>
      actionsFindAllLoggedIn({ query: { sorted: true } }).then(
        (response) => response.data ?? [],
      ),
  });

  const { user } = useAuth();

  const {
    data: generalUpdates,
    isPending: generalUpdatesPending,
    refetch: refetchGeneralUpdates,
  } = useQuery({
    queryKey: GENERAL_UPDATES_QUERY_KEY,
    queryFn: () =>
      actionsUnreadGeneralUpdates().then((response) => response.data ?? []),
  });

  const handleDismissAction = useCallback(
    async (actionId: number) => {
      const action = actions?.find((a) => a.id === actionId);
      if (!action) {
        return;
      }

      await actionsDismissAction({
        path: { id: action.id },
      });

      refetch();
    },
    [actions, refetch],
  );

  const {
    data: awayRanges,
    isPending: awayRangesPending,
    refetch: refetchAwayRanges,
  } = useQuery({
    queryKey: ["awayRanges"],
    queryFn: () => userGetAwayRanges().then((response) => response.data ?? []),
  });

  const handleDismissGeneralUpdate = useCallback(
    async (generalUpdateId: number) => {
      await actionsDismissGeneralUpdate({
        path: { generalUpdateId },
      });
      queryClient.setQueryData<GeneralUpdateDto[]>(
        GENERAL_UPDATES_QUERY_KEY,
        (prev) => prev?.filter((u) => u.id !== generalUpdateId) ?? [],
      );
    },
    [queryClient],
  );

  const loading = isPending || awayRangesPending || generalUpdatesPending;

  const actionsWithAwayStatus = useMemo((): ActionWithAwayStatus[] => {
    if (!actions || !awayRanges) return [];
    return actions.map((action) => ({
      ...action,
      awayStatus: getAwayStatus(action, awayRanges, new Date()),
    }));
  }, [actions, awayRanges]);

  const { todoActions } = useHomePageActions(actionsWithAwayStatus);

  const allItems = useMemo(() => {
    return [...todoActions, ...(generalUpdates ?? [])].sort(
      homePagePriorityComparator,
    );
  }, [todoActions, generalUpdates]);

  const {
    index: safeIndex,
    goNext,
    goPrev,
    canGoNext,
    canGoPrev,
    hasMultiple: showTaskNav,
  } = useBoundedIndex(allItems.length);
  const currentTaskOrGeneralUpdate = allItems[safeIndex] ?? null;

  const scrollViewRef = useRef<KeyboardAwareScrollViewRef>(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetch(),
        refetchGeneralUpdates(),
        refetchAwayRanges(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [refetch, refetchGeneralUpdates, refetchAwayRanges]);

  const scrollPageTo = useCallback((y: number, animated = true) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        y,
        animated,
      });
    }
  }, []);

  const scrollToEnd = useCallback((animated = true) => {
    scrollViewRef.current?.scrollToEnd({ animated });
  }, []);

  const dismissProps: LargeActionCardPropsShared["dismissProps"] = useMemo(
    () => {
      const task = currentTaskOrGeneralUpdate;
      if (!task || isGeneralUpdate(task) || task.onboarding) {
        return undefined;
      }
      if (task.awayStatus !== TaskAwayStatus.NOT_AWAY) {
        return {
          header: "Away",
          message: {
            [TaskAwayStatus.AWAY_CURRENTLY]:
              TASK_DISMISS_MESSAGE_CURRENTLY_AWAY,
            [TaskAwayStatus.AWAY_LATER]: TASK_DISMISS_MESSAGE_WILL_BE_AWAY,
            [TaskAwayStatus.AWAY_PREVIOUSLY]: TASK_DISMISS_MESSAGE_WAS_AWAY,
          }[task.awayStatus],
        };
      }
      if (deadlineHasPassed(task, new Date())) {
        return {
          header: "Deadline passed",
          message: TASK_DISMISS_MESSAGE_AFTER_DEADLINE,
        };
      }
      return undefined;
    },
    [currentTaskOrGeneralUpdate],
  );

  const { title, body, fullScreen } = useMemo(() => {
    if (!currentTaskOrGeneralUpdate) {
      return {
        title: "Alliance",
        body: (
          <View className="flex-1 items-center justify-center py-16 px-5">
            <View className="w-12 h-12 rounded-full bg-green items-center justify-center mb-4">
              <Check size={32} color="#fff" strokeWidth={3} />
            </View>
            <Text className="text-zinc-500 text-lg text-center">
              {noTasksToDoRightNow}
            </Text>
          </View>
        ),
        fullScreen: true,
      };
    }

    if (isGeneralUpdate(currentTaskOrGeneralUpdate)) {
      return {
        title: "General update",
        body: (
          <View className="p-4">
            <LargeGeneralUpdateCard
              key={currentTaskOrGeneralUpdate.id}
              generalUpdate={currentTaskOrGeneralUpdate}
              onDismiss={() =>
                handleDismissGeneralUpdate(currentTaskOrGeneralUpdate.id)
              }
              userId={user?.id}
              user={user}
            />
          </View>
        ),
        fullScreen: false,
      };
    }

    return {
      title: "Current task",
      body: (
        <LargeActionCard
          action={currentTaskOrGeneralUpdate}
          dismissProps={dismissProps}
          userRelation={currentTaskOrGeneralUpdate.userRelation ?? "none"}
          onUpdateActionState={refetch}
          scrollPageTo={scrollPageTo}
          scrollToEnd={scrollToEnd}
          handleDismiss={() =>
            handleDismissAction(currentTaskOrGeneralUpdate.id)
          }
          onSubmitSuccess={handleSubmitSuccess}
        />
      ),
      fullScreen: false,
    };
  }, [
    currentTaskOrGeneralUpdate,
    dismissProps,
    user,
    handleDismissGeneralUpdate,
    handleDismissAction,
    refetch,
    scrollPageTo,
    scrollToEnd,
    handleSubmitSuccess,
  ]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center py-16 px-5 bg-white">
        <ActivityIndicator size="large" color={colors.green} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <SimplePageTitle title={title}>
        {showTaskNav ? (
          <IndexStepper
            index={safeIndex}
            totalCount={allItems.length}
            onPrev={goPrev}
            onNext={goNext}
            canGoPrev={canGoPrev}
            canGoNext={canGoNext}
            previousLabel="Previous task"
            nextLabel="Next task"
          />
        ) : (
          <TouchableOpacity
            onPress={() => router.push("/profile")}
            className="px-2"
            accessibilityLabel="View profile"
          >
            <ProfileImage pfp={user?.profilePicture ?? null} size="medium" />
          </TouchableOpacity>
        )}
      </SimplePageTitle>
      <KeyboardAwareScrollView
        key={fullScreen ? "fullscreen" : "scroll"}
        ref={scrollViewRef}
        contentContainerStyle={fullScreen ? { flex: 1 } : undefined}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        testID="vr-home-ready"
      >
        {body}
      </KeyboardAwareScrollView>
      <SuccessOverlay
        visible={showSuccess}
        onFadeInComplete={refetch}
        onComplete={handleSuccessComplete}
      />
    </View>
  );
}
