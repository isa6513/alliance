import { Check } from "lucide-react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useCallback } from "react";
import { ActivityIndicator, Image, ScrollView, View } from "react-native";
import AppMarkdownWrapper from "../../../components/AppMarkdownWrapper";
import { UserActionRelation } from "@alliance/shared/client";
import {
  Button,
  ButtonColor,
  Card,
  CardStyle,
  Text,
} from "../../../components/system";
import ActionEventsPanel from "../../../components/ActionEventsPanel";
import TaskTimeInfo from "../../../components/TaskTimeInfo";
import { getLastAndNextEvent } from "@alliance/shared/lib/largeActionCard";
import ActionPageTaskPanel from "../../../components/ActionPageTaskPanel";
import { useActionHandlers } from "@alliance/shared/lib/actionPage";

export default function ActionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const reloadTasks = useCallback(() => {
    router.reload();
  }, []);

  const {
    action,
    loading,
    onCompleteAction,
    onJoinAction,
    onDeclineAction,
    onOptOutAction,
  } = useActionHandlers(parseInt(id), true, reloadTasks);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center p-5 bg-white">
        <ActivityIndicator size="large" color="#333" />
        <Text className="mt-3 text-zinc-500">Loading action details...</Text>
      </View>
    );
  }

  if (!action) {
    return (
      <View className="flex-1 justify-center items-center p-5 bg-white">
        <Text className="text-red-500 mb-5 text-center">
          Could not load action
        </Text>
        <Button
          color={ButtonColor.Black}
          onPress={() => router.back()}
          title="Go Back"
        />
      </View>
    );
  }

  const userRelation = action.userRelation as UserActionRelation | undefined;
  const { nextEvent, lastEvent } = getLastAndNextEvent(action);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <ScrollView className="flex-1 bg-white">
        {action.image && (
          <Image
            source={{ uri: action.image }}
            className="w-full h-48 bg-zinc-200"
            resizeMode="cover"
          />
        )}
        <View className="p-5 py-10">
          <Text className="text-[24px] font-bold text-zinc-900 mb-4 font-serif-bold">
            {action.name}
          </Text>
          {action.shortDescription && (
            <Text className="mb-1">{action.shortDescription}</Text>
          )}
          {action.authors && action.authors.length > 0 && (
            <Text className="mb-4">
              By{" "}
              {action.authors.map((author, i) => (
                <Text key={author.id}>
                  <Text className="text-zinc-500 underline">
                    {author.displayName}
                  </Text>
                  {i < action.authors!.length - 2 && ", "}
                  {i === action.authors!.length - 2 &&
                    `${action.authors!.length > 2 ? "," : ""} and `}
                </Text>
              ))}
            </Text>
          )}
          {action.events && action.events.length > 0 && (
            <View className="mb-4">
              <ActionEventsPanel action={action} />
            </View>
          )}
          {action.status !== "planned" && (
            <View>
              <View className="mb-2 flex flex-row items-center gap-2 w-full">
                <View className="flex-1">
                  <Text className="text-xl font-semibold text-zinc-900">
                    Task
                  </Text>
                </View>
                <TaskTimeInfo
                  action={action}
                  nextEvent={nextEvent}
                  lastEvent={lastEvent}
                />
              </View>
              <ActionPageTaskPanel
                action={action}
                userRelation={userRelation ?? null}
                onCompleteAction={onCompleteAction}
                onJoinAction={onJoinAction}
                onDeclineAction={onDeclineAction}
                onOptOutAction={onOptOutAction}
              />
            </View>
          )}
          {userRelation === "joined" &&
            action.status === "gathering_commitments" && (
              <Card cardStyle={CardStyle.Green} className="mb-6">
                <View className="flex-row items-center gap-2">
                  <Check size={18} color="#166534" />
                  <Text className="text-green-800 font-medium flex-1">
                    You&apos;ve committed to participate. We&apos;ll notify you
                    when it&apos;s time to act.
                  </Text>
                </View>
              </Card>
            )}

          <View className="mb-6 mt-3">
            <Text className="text-xl font-semibold text-zinc-900">
              Description
            </Text>
            <AppMarkdownWrapper>{action.body}</AppMarkdownWrapper>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
