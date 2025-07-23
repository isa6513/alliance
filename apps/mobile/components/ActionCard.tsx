import React from "react";
import { View, StyleSheet } from "react-native";
import { ActionDto } from "../../../shared/client";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons/faChevronRight";
import Text, { TextStyle } from "./system/Text";
import { Card, colors } from "./system";

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
      <View style={styles.footer}>
        <View style={styles.detailsButton}>
          <Text style={styles.detailsText}>Details</Text>
          <FontAwesomeIcon
            icon={faChevronRight}
            size={12}
            color={colors.text.primary}
            style={styles.icon}
          />
        </View>
      </View>
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
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailsText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0D1B2A",
  },
  icon: {
    marginLeft: 4,
  },
});
