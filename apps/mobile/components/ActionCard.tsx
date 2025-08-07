import React from "react";
import { View, StyleSheet } from "react-native";
import { ActionDto } from "../../../shared/client";
import Text, { TextStyle } from "./system/Text";
import { Card } from "./system";

interface ActionCardProps {
  action: ActionDto;
  onPress: () => void;
}

export default function ActionCard({ action, onPress }: ActionCardProps) {
  return (
    <Card style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <Text type={TextStyle.Bold}>{action.name}</Text>
      </View>
      <Text numberOfLines={2}>{action.shortDescription}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
});
