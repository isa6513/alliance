import { View } from "react-native";
import Text from "./Text";
import { cn } from "@alliance/shared/styles/util";

export function SectionHeader({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <View
      className={cn(
        "px-4 pb-2 pt-2 bg-white",
        className,
      )}
    >
      <Text className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
        {label}
      </Text>
    </View>
  );
}
