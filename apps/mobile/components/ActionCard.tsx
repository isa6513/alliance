import React from "react";
import { View, Text } from "react-native";
import { ActionDto } from "@alliance/shared/client";
import { Card } from "./system";

interface ActionCardProps {
  action: ActionDto;
  onPress: () => void;
}

export default function ActionCard({ action, onPress }: ActionCardProps) {
  return (
    <Card onPress={onPress}>
      <View>
        <Text className="font-bold font-sans">{action.name}</Text>
      </View>
      <Text numberOfLines={2} className="text-sm text-gray-500">
        {action.shortDescription}
      </Text>
    </Card>
  );
}
