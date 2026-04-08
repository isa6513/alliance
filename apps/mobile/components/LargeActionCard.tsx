import { TouchableOpacity, View } from "react-native";

import {
  getLastAndNextEvent,
  LargeActionCardPropsShared,
} from "@alliance/shared/lib/largeActionCard";
import { ActionCompletedBarWithInfo } from "./ActionCompletedBarWithInfo";
import Button, { ButtonColor } from "./system/Button";
import Card from "./system/Card";
import Text, { FontFamily, FontWeight } from "./system/Text";
import TaskTimeInfo from "./TaskTimeInfo";
import { router } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import ActionTaskPanel from "./ActionTaskPanel";
import useActivities, {
  ActivityList,
} from "@alliance/shared/lib/useActivities";

export interface LargeActionCardProps extends LargeActionCardPropsShared {
  scrollPageTo: (y: number, animated?: boolean) => void;
  scrollToEnd: (animated?: boolean) => void;
  onSubmitSuccess: () => void;
}

function DismissBanner({
  header,
  message,
  onDismiss,
}: {
  header: string;
  message: string;
  onDismiss: () => void;
}) {
  return (
    <View className="-mx-4 -mt-4 mb-3 bg-sky-100 border-b border-sky-300 px-4 py-3">
      <Text className="text-sky-800" weight={FontWeight.Semibold}>
        {header}
      </Text>
      <Text className="text-sky-700 mt-1 mb-3">{message}</Text>
      <Button
        color={ButtonColor.White}
        onPress={onDismiss}
        className="w-full"
        title="Dismiss"
      />
    </View>
  );
}

export default function LargeActionCard({
  action,
  dismissProps,
  onUpdateActionState,
  scrollPageTo,
  scrollToEnd,
  onSubmitSuccess,
}: LargeActionCardProps) {
  const { nextEvent, lastEvent } = getLastAndNextEvent(action);
  const { activities: friendActivities } = useActivities({
    list: ActivityList.FriendsForAction,
    objectId: action.id,
    comments: false,
    limit: 8,
  });
  return (
    <Card className="p-4!">
      <View>
        {dismissProps && (
          <DismissBanner
            header={dismissProps.header}
            message={dismissProps.message}
            onDismiss={dismissProps.onDismiss}
          />
        )}
        <View className="flex flex-row items-center justify-between mb-4">
          <TaskTimeInfo
            action={action}
            nextEvent={nextEvent}
            lastEvent={lastEvent}
            className="flex-row items-center gap-x-1"
            filled={true}
          />
          <TouchableOpacity
            onPress={() => {
              router.push(`/actions/${action.id}`);
            }}
            className="mr-2 flex flex-row items-center gap-x-1"
          >
            <ArrowRight size={20} />
          </TouchableOpacity>
        </View>
        <Text
          className="text-xl mb-2"
          family={FontFamily.Serif}
          weight={FontWeight.Bold}
        >
          {action.name}
        </Text>
      </View>
      <Text className="text-base mb-4">{action.shortDescription}</Text>
      <ActionCompletedBarWithInfo
        action={action}
        friendActivities={friendActivities}
      />
      <View className="mt-6 border-t border-zinc-200 pt-6">
        <ActionTaskPanel
          action={action}
          onCompleteAction={onUpdateActionState}
          onOptOutAction={onUpdateActionState}
          scrollPageTo={scrollPageTo}
          scrollToEnd={scrollToEnd}
          onSubmitSuccess={onSubmitSuccess}
        />
      </View>
    </Card>
  );
}
