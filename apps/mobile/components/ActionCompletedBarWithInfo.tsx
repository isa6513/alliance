import { ActionActivityDto, ActionDto } from "@alliance/shared/client";
import React from "react";
import { View } from "react-native";
import { Text, ProgressBar } from "./system";
import { UserProfilePicRow } from "./UserProfilePicRow";

export const ActionCompletedBarWithInfo = ({
  action,
  friendActivities,
}: {
  action: Pick<
    ActionDto,
    | "commitmentThreshold"
    | "status"
    | "everyoneShouldComplete"
    | "usersCompleted"
    | "usersJoined"
  >;
  friendActivities: ActionActivityDto[] | null;
}) => {
  const value =
    action.status === "gathering_commitments"
      ? action.usersJoined
      : action.usersCompleted;

  const threshold =
    action.status === "gathering_commitments"
      ? action.commitmentThreshold
      : action.usersJoined;

  if (!threshold) {
    return null;
  }

  const safeThreshold = Math.max(threshold, value);

  const labelString = action.everyoneShouldComplete
    ? `${value}`
    : `${value} / ${safeThreshold}`;

  return (
    <View className="mt-3">
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-xs text-zinc-500">
          {labelString}{" "}
          {action.status === "gathering_commitments"
            ? "members committed"
            : "members completed"}
        </Text>
        {friendActivities !== null && friendActivities.length > 0 && (
          <UserProfilePicRow
            users={friendActivities.map((activity) => ({
              id: activity.user.id,
              profilePicture: activity.user.profilePicture ?? undefined,
              name: activity.user.displayName,
            }))}
          />
        )}
      </View>
      <ProgressBar progress={value} total={threshold} />
    </View>
  );
};
