import { View, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useAuth } from "../../../lib/AuthContext";
import { useEffect, useMemo, useState } from "react";
import { ActionDto, actionsFindAll } from "../../../../../shared/client";
import ActionCard from "../../../components/ActionCard";
import { router } from "expo-router";
import {
  FilterMode,
  filterActions,
} from "../../../../../shared/lib/actionUtils";
import { colors, Text, TextStyle } from "../../../components/system";

export default function HomeScreen() {
  const { user } = useAuth();
  const [actions, setActions] = useState<ActionDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<FilterMode>(FilterMode.All);

  useEffect(() => {
    const fetchActions = async () => {
      try {
        const response = await actionsFindAll();
        if (response.error) {
          throw new Error("Failed to fetch actions");
        }
        setActions(response.data || []);
        setLoading(false);
      } catch (err) {
        setError("Failed to load actions");
        setLoading(false);
        console.error("Error fetching actions:", err);
      }
    };

    fetchActions();
  }, []);

  const filteredActions = useMemo(
    () => filterActions(actions, filterMode),
    [actions, filterMode]
  );

  const navigateToAction = (actionId: number) => {
    router.push(`/action/${actionId}`);
  };

  return (
    <ScrollView style={styles.container}>
      <Text type={TextStyle.Header}>Your Tasks</Text>
      <View style={styles.actionsListContainer}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#0D1B2A"
            style={styles.loader}
          />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : filteredActions.length === 0 ? (
          <Text style={styles.noActionsText}>No actions available</Text>
        ) : (
          filteredActions.map((action) => (
            <ActionCard
              key={action.id}
              action={action}
              onPress={() => navigateToAction(action.id)}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: colors.page,
    paddingTop: 24,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: colors.text.tertiary,
    marginBottom: 8,
  },
  card: {
    margin: 16,
    marginTop: 8,
    padding: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: colors.text.tertiary,
    lineHeight: 22,
  },
  actionsContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  actionButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  actionsListContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  actionsTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 4,
  },
  filterButton: {
    flex: 1,
    padding: 12,
  },
  viewAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "600",
  },
  loader: {
    marginVertical: 20,
  },
  errorText: {
    color: colors.error,
    textAlign: "center",
    padding: 16,
  },
  noActionsText: {
    color: colors.text.tertiary,
    fontSize: 16,
    textAlign: "center",
    padding: 20,
  },
  statsCard: {
    margin: 16,
    marginTop: 8,
    padding: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
});
