import { Check } from "lucide-react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  View,
} from "react-native";
import Markdown from "react-native-markdown-display";
import {
  ActionDto,
  UserActionRelation,
  actionsFindOne,
  actionsJoin,
} from "../../../../../shared/client";
import {
  Button,
  ButtonColor,
  ButtonSize,
  Card,
  CardStyle,
  Text,
} from "../../../components/system";
import ActionEventsPanel from "../../../components/ActionEventsPanel";

export default function ActionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [action, setAction] = useState<ActionDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActionDetails = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);

      const actionResponse = await actionsFindOne({
        path: { id: parseInt(id) },
      });

      if (actionResponse.error || !actionResponse.data) {
        throw new Error("Failed to load action details");
      }

      setAction(actionResponse.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching action details:", err);
      setError("Failed to load action details. Please try again.");
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchActionDetails();
  }, [id, fetchActionDetails]);

  const handleJoinAction = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await actionsJoin({
        path: { id: parseInt(id) },
      });

      if (response.error) {
        throw new Error("Failed to join action");
      }

      setAction((prev: ActionDto | null) =>
        prev ? { ...prev, userRelation: "joined" } : null
      );
      setLoading(false);
      Alert.alert("Success", "You've committed to this action!");
    } catch (err) {
      console.error("Error joining action:", err);
      setError("Failed to join this action. Please try again.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center p-5 bg-white">
        <ActivityIndicator size="large" color="#333" />
        <Text className="mt-3 text-zinc-500">Loading action details...</Text>
      </View>
    );
  }

  if (error || !action) {
    return (
      <View className="flex-1 justify-center items-center p-5 bg-white">
        <Text className="text-red-500 mb-5 text-center">
          {error || "Action not found"}
        </Text>
        <Button
          color={ButtonColor.Black}
          onPress={() => router.back()}
          title="Go Back"
        />
      </View>
    );
  }

  const userRelation = action.userRelation as UserActionRelation | undefined;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <ScrollView className="flex-1 bg-white">
        {action.image && (
          <Image
            source={{ uri: action.image }}
            className="w-full h-48 bg-zinc-200"
            resizeMode="cover"
          />
        )}

        <View className="p-5 py-10">
          <Text className="text-[24px] font-semibold text-zinc-900 mb-4 font-serif">
            {action.name}
          </Text>
          {action.shortDescription && (
            <Text className="mb-1">{action.shortDescription}</Text>
          )}
          {action.authors && action.authors.length > 0 && (
            <Text className="mb-4">
              By{" "}
              {action.authors.map((author, i) => (
                <Text key={author.id}>
                  <Text className="text-zinc-500 underline">
                    {author.displayName}
                  </Text>
                  {i < action.authors!.length - 2 && ", "}
                  {i === action.authors!.length - 2 &&
                    `${action.authors!.length > 2 ? "," : ""} and `}
                </Text>
              ))}
            </Text>
          )}
          {action.events && action.events.length > 0 && (
            <View className="mb-6">
              <Text className="text-xl font-semibold text-zinc-900 mb-4">
                Timeline
              </Text>
              <ActionEventsPanel action={action} />
            </View>
          )}
          {userRelation === "joined" &&
            action.status === "gathering_commitments" && (
              <Card cardStyle={CardStyle.Green} className="mb-6">
                <View className="flex-row items-center gap-2">
                  <Check size={18} color="#166534" />
                  <Text className="text-green-800 font-medium flex-1">
                    You&apos;ve committed to participate. We&apos;ll notify you
                    when it&apos;s time to act.
                  </Text>
                </View>
              </Card>
            )}

          {userRelation === "completed" && (
            <Card cardStyle={CardStyle.Green} className="mb-6">
              <View className="flex-row items-center gap-2 text-green">
                <Check size={18} />
                <Text className="font-medium">
                  You&apos;ve completed this action!
                </Text>
              </View>
            </Card>
          )}

          <View className="mb-6">
            <Text className="text-xl font-semibold text-zinc-900 mb-4">
              Description
            </Text>
            <Markdown
              style={{
                body: {
                  fontFamily: "SourceSans3",
                  fontSize: 15,
                  lineHeight: 24,
                  color: "#333",
                },
                paragraph: {
                  marginBottom: 12,
                },
                heading1: {
                  fontSize: 24,
                  fontWeight: "600",
                  marginTop: 16,
                  marginBottom: 8,
                },
                heading2: {
                  fontSize: 20,
                  fontWeight: "600",
                  marginTop: 14,
                  marginBottom: 6,
                },
                heading3: {
                  fontSize: 18,
                  fontWeight: "600",
                  marginTop: 12,
                  marginBottom: 4,
                },
                link: {
                  color: "#318dde",
                },
                bullet_list: {
                  marginBottom: 12,
                },
                ordered_list: {
                  marginBottom: 12,
                },
                list_item: {
                  marginBottom: 4,
                },
              }}
            >
              {action.body}
            </Markdown>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Button */}
      {(!userRelation || userRelation === "none") &&
        action.status === "gathering_commitments" && (
          <View className="absolute bottom-0 left-0 right-0 p-5 pb-8 bg-white border-t border-zinc-200">
            <Button
              color={ButtonColor.Black}
              size={ButtonSize.Large}
              onPress={handleJoinAction}
              title="Confirm participation"
              className="w-full"
            />
          </View>
        )}
    </>
  );
}
