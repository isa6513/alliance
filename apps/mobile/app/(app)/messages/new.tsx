import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import {
  ConversationDto,
  conversationCreateDirectConversation,
  conversationCreateGroupConversation,
  messageSendMessage,
  ProfileDto,
  userListMessageableUsers,
} from "@alliance/shared/client";
import Button, { ButtonColor } from "../../../components/system/Button";
import MessageComposer from "../../../components/messages/MessageComposer";
import MessageRecipientSelect from "../../../components/messages/MessageRecipientSelect";
import Text from "../../../components/system/Text";
import { useAuth } from "../../../lib/AuthContext";
import {
  buildGroupConversationTitle,
  findMatchingConversation,
  sortConversations,
  useConversations,
} from "../../../lib/messages";
import { colors } from "../../../lib/style/colors";
import { ChevronLeft } from "lucide-react-native";

export default function NewMessageScreen() {
  const { user } = useAuth();
  const { to } = useLocalSearchParams<{ to?: string }>();
  const { conversations, setConversations } = useConversations(null);

  const [messageableUsers, setMessageableUsers] = useState<ProfileDto[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    userListMessageableUsers()
      .then((response) => {
        if (cancelled) return;
        setMessageableUsers(response.data ?? []);
      })
      .catch((error) => {
        console.error("Failed to load messageable users", error);
      })
      .finally(() => {
        if (!cancelled) setLoadingUsers(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const target = Array.isArray(to) ? to[0] : to;
    if (!target) return;
    const userId = parseInt(target, 10);
    if (!Number.isNaN(userId)) {
      setSelectedUserIds([userId]);
    }
  }, [to]);

  const recipients = useMemo(
    () =>
      selectedUserIds
        .map((id) => messageableUsers.find((user) => user.id === id))
        .filter((user): user is ProfileDto => !!user),
    [selectedUserIds, messageableUsers]
  );

  const ensureConversation = useCallback(async () => {
    if (selectedUserIds.length === 0) return null;
    const existing = findMatchingConversation(
      conversations,
      user?.id,
      selectedUserIds
    );
    if (existing) return existing;

    if (selectedUserIds.length === 1) {
      const response = await conversationCreateDirectConversation({
        body: { targetUserId: selectedUserIds[0] },
      });
      if (response.data) {
        setConversations((prev) => {
          const ids = new Map<number, ConversationDto>();
          for (const convo of prev ?? []) {
            ids.set(convo.id, convo);
          }
          ids.set(response.data!.id, response.data!);
          return Array.from(ids.values()).sort(sortConversations);
        });
        return response.data;
      }
    } else {
      const names = recipients.map((recipient) => recipient.displayName);
      if (user && !user.anonymous) {
        names.push(user.name);
      }
      const title = buildGroupConversationTitle(names);
      const response = await conversationCreateGroupConversation({
        body: { participantIds: selectedUserIds, title },
      });
      if (response.data) {
        setConversations((prev) => {
          const ids = new Map<number, ConversationDto>();
          for (const convo of prev ?? []) {
            ids.set(convo.id, convo);
          }
          ids.set(response.data!.id, response.data!);
          return Array.from(ids.values()).sort(sortConversations);
        });
        return response.data;
      }
    }
    return null;
  }, [
    conversations,
    recipients,
    selectedUserIds,
    setConversations,
    user,
  ]);

  const handleSend = useCallback(async () => {
    if (isSending) return;
    if (selectedUserIds.length === 0) {
      Alert.alert("Select recipients", "Choose at least one person to message.");
      return;
    }

    const trimmed = message.trim();
    if (!trimmed && attachments.length === 0) {
      Alert.alert("Write a message", "Add a message or an attachment.");
      return;
    }

    setIsSending(true);
    try {
      const conversation = await ensureConversation();
      if (!conversation) {
        Alert.alert("Error", "Could not create conversation.");
        return;
      }
      const response = await messageSendMessage({
        body: {
          conversationId: conversation.id,
          body: trimmed || message,
          attachments,
        },
      });
      if (!response.data) {
        throw new Error("Failed to send message");
      }
      router.replace(`/messages/${conversation.id}`);
    } catch (error) {
      console.error("Failed to send message", error);
      Alert.alert("Error", "Failed to send message.");
    } finally {
      setIsSending(false);
    }
  }, [attachments, ensureConversation, isSending, message, selectedUserIds]);

  return (
    <View className="flex-1 bg-white pt-12">
      <View className="flex-row items-center justify-between px-4 pb-2">
        <Button
          color={ButtonColor.Transparent}
          onPress={() => router.back()}
        >
          <ChevronLeft size={20} color={colors.text.secondary} />
        </Button>
        <Text className="text-lg font-semibold text-zinc-900">
          New message
        </Text>
        <View className="w-20" />
      </View>
        <ScrollView className="flex-1 px-4">
          <View className="border border-zinc-200 rounded bg-white p-4 flex flex-row">
            <Text className="text-sm text-zinc-600 my-3 mr-2">To</Text>
            {loadingUsers ? (
              <ActivityIndicator size="small" color={colors.green} />
            ) : (
              <MessageRecipientSelect
                users={messageableUsers}
                selectedUserIds={selectedUserIds}
                onChange={setSelectedUserIds}
              />
            )}
          </View>
          <View className="h-4" />
        </ScrollView>
        <KeyboardAvoidingView
        behavior="position"
      >
        <MessageComposer
          message={message}
          setMessage={setMessage}
          attachments={attachments}
          setAttachments={setAttachments}
          onSend={handleSend}
          isSending={isSending}
          placeholder="Write a message..."
        />
      </KeyboardAvoidingView>
    </View>
  );
}
