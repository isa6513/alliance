import { View } from "react-native";

import {
  getLastAndNextEvent,
  LargeActionCardPropsShared,
} from "@alliance/shared/lib/largeActionCard";
import { ActionCompletedBarWithInfo } from "./ActionCompletedBarWithInfo";
import Button, { ButtonColor, ButtonSize } from "./system/Button";
import Card from "./system/Card";
import Text from "./system/Text";
import TaskTimeInfo from "./TaskTimeInfo";
import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import ActionTaskPanel from "./ActionTaskPanel";
import useActivities, {
  ActivityList,
} from "@alliance/shared/lib/useActivities";

export interface LargeActionCardProps extends LargeActionCardPropsShared {
  scrollPageTo: (y: number, animated?: boolean) => void;
  scrollToEnd: (animated?: boolean) => void;
  onSubmitSuccess: () => void;
}

function OptionalStyleBanner({
  title,
  message,
  onDismiss,
}: {
  title: string;
  message: string;
  onDismiss: () => void;
}) {
  return (
    <View className="-mx-4 -mt-4 mb-3 bg-sky-100 border-b border-sky-300 px-4 py-3">
      <Text className="text-sky-800 font-semibold">{title}</Text>
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
  handleDismiss,
  userRelation,
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
        {dismissProps ? (
          <OptionalStyleBanner
            title={dismissProps.header}
            message={dismissProps.message}
            onDismiss={handleDismiss}
          />
        ) : null}
        {action.optional && !dismissProps ? (
          <OptionalStyleBanner
            title="This action is optional."
            message="You can complete the task as usual or dismiss it."
            onDismiss={handleDismiss}
          />
        ) : null}
        <Text className="font-semibold text-2xl font-serif">{action.name}</Text>
        <View className="flex flex-row items-center justify-between mt-2">
          <TaskTimeInfo
            action={action}
            nextEvent={nextEvent}
            lastEvent={lastEvent}
          />
          <Button
            color={ButtonColor.White}
            size={ButtonSize.Small}
            onPress={() => {
              router.push(`/actions/${action.id}`);
            }}
            className="mr-2 flex flex-row items-center gap-x-1"
          >
            <Text className="text-sm">Details</Text>
            <ChevronRight size={15} color="black" />
          </Button>
        </View>
      </View>
      <Text className="text-base mt-2">{action.shortDescription}</Text>
      <ActionCompletedBarWithInfo
        action={action}
        friendActivities={friendActivities}
      />
      <View className="mt-6 border-t border-zinc-200 pt-6">
        <ActionTaskPanel
          action={action}
          userRelation={userRelation}
          onCompleteAction={onUpdateActionState}
          onJoinAction={onUpdateActionState}
          onDeclineAction={onUpdateActionState}
          onOptOutAction={onUpdateActionState}
          scrollPageTo={scrollPageTo}
          scrollToEnd={scrollToEnd}
          onSubmitSuccess={onSubmitSuccess}
        />
      </View>
    </Card>
  );
}
