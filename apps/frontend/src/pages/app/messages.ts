import { getWebSocketUrl } from "../../lib/config";
import { createMessagingHooks } from "@alliance/shared/lib/messages";

const { useConversations, useLiveConvoMessages, useMessagingUnread } =
  createMessagingHooks({ getWebSocketUrl });

export {
  useLiveConvoMessages,
  useMessagingUnread,
  useConversations,
};

export default useLiveConvoMessages;
