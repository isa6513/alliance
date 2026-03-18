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
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "./AuthContext";
import { getApiUrl, getWebSocketUrl } from "./config";
import SecureStorage from "./SecureStorage";
import WebTokenStore from "./ExpoWebTokenStore";
import { client } from "@alliance/shared/client/client.gen";
import { authRefreshTokens } from "@alliance/shared/client";

const tokenStore = Platform.OS === "web" ? WebTokenStore : SecureStorage;
const getAuthToken = () => tokenStore.getItem(ACCESS_TOKEN_KEY);

const onRefreshToken = async (): Promise<string | null> => {
  const refreshToken = await tokenStore.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) return null;

  const response = await authRefreshTokens({
    query: { mode: "header" },
    headers: { Authorization: `Bearer ${refreshToken}` }, //TODO: mobile shouldnt have to manually set this - fix non-cookie mode somehow. or maybe use auth context?
  });
  if (!response.response.ok) return null;

  const token = response.data?.access_token;
  if (token) {
    await tokenStore.setItem(ACCESS_TOKEN_KEY, token);
    client.setConfig({
      baseUrl: getApiUrl(),
      headers: { Authorization: `Bearer ${token}` },
    });
    return token;
  }
  return null;
};

const { useConversations, useLiveConvoMessages, useMessagingUnread } =
  createMessagingHooks({
    getWebSocketUrl,
    getAuthToken,
    onRefreshToken,
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
