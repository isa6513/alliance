import {
  deadlineColor,
  formatDeadline,
  TaskTimeInfoPropsShared,
} from "@alliance/shared/lib/taskTimeInfo";
import { View } from "react-native";
import Text from "./system/Text";
import { ClockIcon, Calendar } from "lucide-react-native";
import { cn } from "@alliance/shared/styles/util";
import { colors } from "../lib/style/colors";
import { formatTime } from "@alliance/shared/lib/utils";

const TaskTimeInfo = ({
  action,
  nextEvent,
  lastEvent,
  absoluteDeadline,
  className,
  filled = false,
}: TaskTimeInfoPropsShared & { className?: string; filled?: boolean }) => {
  const color = deadlineColor(nextEvent, action);

  return (
    <View className={cn(className)}>
      {!!action.timeEstimate ? (
        <View
          className={cn(
            "flex-row items-center gap-x-1",
            filled
              ? "text-white bg-green rounded-full px-3 py-1"
              : "text-green",
          )}
        >
          <ClockIcon size={15} color={filled ? colors.white : colors.green} />
          <Text className={cn("text-sm", filled ? "text-white" : "text-green")}>
            {action.timeEstimate} minute{action.timeEstimate === 1 ? "" : "s"}
          </Text>
        </View>
      ) : null}
      {!!nextEvent ? (
        <View
          className={cn(
            "flex-row items-center gap-x-1",
            filled
              ? `text-white rounded-full px-3 py-1 bg-zinc-100`
              : "text-green",
          )}
        >
          <Calendar size={15} color={color} />
          <Text className="text-sm" style={{ color: color }}>
            {absoluteDeadline
              ? formatDeadline(nextEvent.date)
              : `${formatTime(new Date(nextEvent.date), { addSuffix: false })} left`}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

export default TaskTimeInfo;
