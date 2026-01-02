import {
  deadlineColor,
  formatDeadline,
  TaskTimeInfoPropsShared,
} from "@alliance/shared/lib/taskTimeInfo";
import { View } from "react-native";
import { Text } from "./system";
import { ClockIcon, Calendar1 } from "lucide-react-native";

const TaskTimeInfo = ({
  action,
  nextEvent,
  lastEvent,
  absoluteDeadline,
}: TaskTimeInfoPropsShared) => {
  const color = deadlineColor(nextEvent);

  return (
    <View>
      {!!action.timeEstimate && action.status !== "gathering_commitments" ? (
        <View className="flex-row items-center gap-x-1">
          <View className="relative w-4 h-4">
            <View className="absolute w-4 h-4 bg-green rounded-full top-0 left-0 right-0 bottom-0 m-auto" />
            <ClockIcon
              size={19}
              color="white"
              className="absolute top-0 -left-px right-0 bottom-0 m-auto"
            />
          </View>
          <Text className="text-green text-base">
            {action.timeEstimate} minute{action.timeEstimate === 1 ? "" : "s"}
          </Text>
        </View>
      ) : null}
      {!!nextEvent ? (
        <View>
          <Calendar1 size={16} color={color} />
          <Text style={{ color: color }}>{formatDeadline(nextEvent.date)}</Text>
        </View>
      ) : null}
    </View>
  );
};

export default TaskTimeInfo;
