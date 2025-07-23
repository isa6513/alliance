import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { ActionDto } from "../../../shared/client";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons/faChevronRight";
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
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{action.category}</Text>
        </View>
      </View>
      <Text style={styles.description} numberOfLines={2}>
        {action.shortDescription}
      </Text>
      <View style={styles.footer}>
        <View style={styles.detailsButton}>
          <Text style={styles.detailsText}>Details</Text>
          <FontAwesomeIcon
            icon={faChevronRight}
            size={12}
            color="#0D1B2A"
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
  badge: {
    backgroundColor: "#E0E0E0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#333",
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    lineHeight: 20,
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
