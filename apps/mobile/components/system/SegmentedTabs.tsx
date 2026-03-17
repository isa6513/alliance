import React from "react";
import { View, TouchableOpacity } from "react-native";
import Text from "./Text";
import { cn } from "@alliance/shared/styles/util";

export type SegmentedTabsProps<T extends string> = {
  tabs: readonly T[];
  selectedTab: T;
  onSelect: (tab: T) => void;
  labels: Record<T, string>;
  className?: string;
};

export function SegmentedTabs<T extends string>({
  tabs,
  selectedTab,
  onSelect,
  labels,
  className,
}: SegmentedTabsProps<T>) {
  return (
    <View className={cn("flex-row bg-zinc-100 rounded-lg p-1", className)}>
      {tabs.map((tab) => {
        const isSelected = selectedTab === tab;
        return (
          <TouchableOpacity
            key={tab}
            onPress={() => onSelect(tab)}
            activeOpacity={0.7}
            className={cn(
              "flex-1 px-3 py-2 rounded-md items-center",
              isSelected && "bg-white",
            )}
          >
            <Text
              className={cn(
                "text-sm font-medium",
                isSelected ? "text-zinc-900" : "text-zinc-500",
              )}
            >
              {labels[tab]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
