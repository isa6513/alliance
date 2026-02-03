import { Platform } from "react-native";
import {
  buildGroupConversationTitle,
  createMessagingHooks,
  findMatchingConversation,
  getConversationPreview,
  getConversationTimestamp,
  getJoinedConversations,
  getMessageRequestPreview,
  getPendingInvites,
  mergeConversationUpdate,
  sortConversations,
  updateConversationsForLastMessage,
} from "@alliance/shared/lib/messages";
import { ACCESS_TOKEN_KEY } from "./AuthContext";
import { getWebSocketUrl } from "./config";
import SecureStorage from "./SecureStorage";
import WebTokenStore from "./ExpoWebTokenStore";

const tokenStore = Platform.OS === "web" ? WebTokenStore : SecureStorage;
const getAuthToken = () => tokenStore.getItem(ACCESS_TOKEN_KEY);

const { useConversations, useLiveConvoMessages, useMessagingUnread } =
  createMessagingHooks({
    getWebSocketUrl,
    getAuthToken,
  });

export {
  buildGroupConversationTitle,
  findMatchingConversation,
  getConversationPreview,
  getConversationTimestamp,
  getJoinedConversations,
  getMessageRequestPreview,
  getPendingInvites,
  mergeConversationUpdate,
  sortConversations,
  updateConversationsForLastMessage,
  useConversations,
  useLiveConvoMessages,
  useMessagingUnread,
};
