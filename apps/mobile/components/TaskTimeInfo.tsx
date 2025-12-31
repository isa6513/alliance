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
          <View className="bg-green rounded-full">
            <ClockIcon size={16} color="white" />
          </View>
          <Text className="text-green">
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
