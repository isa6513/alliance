import { View } from "react-native";

import {
  getLastAndNextEvent,
  LargeActionCardPropsShared,
} from "@alliance/shared/lib/largeActionCard";
import { ActionCompletedBarWithInfo } from "./ActionCompletedBarWithInfo";
import { Card, Text } from "./system";
import TaskTimeInfo from "./TaskTimeInfo";

export default function LargeActionCard({
  action,
  userRelation,
  friendActivities,
  onUpdateActionState,
}: LargeActionCardPropsShared) {
  const { nextEvent, lastEvent } = getLastAndNextEvent(action);
  return (
    <Card>
      <View>
        <Text className="font-semibold text-2xl font-serif">{action.name}</Text>
        <TaskTimeInfo
          action={action}
          nextEvent={nextEvent}
          lastEvent={lastEvent}
        />
      </View>
      <ActionCompletedBarWithInfo
        action={action}
        friendActivities={friendActivities}
      />
    </Card>
  );
}
