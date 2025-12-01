import {
  ConversationDto,
  conversationMarkRead,
  MessageDto,
  messageGetMessages,
} from "@alliance/shared/client";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { getWebSocketUrl } from "../../lib/config";

interface UseLiveConvoMessagesOptions {
  onIncomingMessage?: (message: MessageDto) => void;
  onConversationUpdated?: (conversation: ConversationDto) => void;
}

const useLiveConvoMessages = (
  conversationId: number | null,
  options?: UseLiveConvoMessagesOptions
): [MessageDto[] | null, Dispatch<SetStateAction<MessageDto[] | null>>] => {
  const [convoMessages, setConvoMessages] = useState<MessageDto[] | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const joinedConversationRef = useRef<number | null>(null);
  const activeConversationRef = useRef<number | null>(conversationId);
  const pendingMessagesRef = useRef<MessageDto[]>([]);
  const messageIdsRef = useRef<Set<string>>(new Set());
  const handlersRef = useRef<UseLiveConvoMessagesOptions | undefined>(options);

  useEffect(() => {
    handlersRef.current = options;
  }, [options]);

  useEffect(() => {
    const socket = io(`${getWebSocketUrl()}/messaging`, {
      transports: ["websocket"],
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on("message:new", (incoming: MessageDto) => {
      if (incoming.conversationId !== activeConversationRef.current) {
        return;
      }

      if (messageIdsRef.current.has(incoming.id)) {
        return;
      }

      messageIdsRef.current.add(incoming.id);

      handlersRef.current?.onIncomingMessage?.(incoming);

      setConvoMessages((prev) => {
        if (!prev) {
          pendingMessagesRef.current.push(incoming);
          return prev;
        }
        return [...prev, incoming];
      });

      conversationMarkRead({
        path: { conversationId: incoming.conversationId },
      });
    });

    socket.on("conversation:updated", (conversation: ConversationDto) => {
      handlersRef.current?.onConversationUpdated?.(conversation);
    });

    socket.on("connect", () => {
      if (activeConversationRef.current) {
        socket.emit("join-conversation", {
          conversationId: activeConversationRef.current,
        });
        joinedConversationRef.current = activeConversationRef.current;
      }
    });

    socket.on("messaging:error", (error) => {
      console.error("Messaging socket error", error);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      joinedConversationRef.current = null;
    };
  }, []);

  useEffect(() => {
    activeConversationRef.current = conversationId;

    if (!conversationId) {
      setConvoMessages(null);
      if (socketRef.current && joinedConversationRef.current) {
        socketRef.current.emit("leave-conversation", {
          conversationId: joinedConversationRef.current,
        });
      }
      joinedConversationRef.current = null;
      return;
    }

    pendingMessagesRef.current = [];
    messageIdsRef.current = new Set();
    setConvoMessages(null);

    const socket = socketRef.current;
    if (socket) {
      if (
        joinedConversationRef.current &&
        joinedConversationRef.current !== conversationId
      ) {
        socket.emit("leave-conversation", {
          conversationId: joinedConversationRef.current,
        });
      }
      socket.emit("join-conversation", { conversationId });
      joinedConversationRef.current = conversationId;
    }

    let cancelled = false;
    messageGetMessages({
      path: {
        conversationId,
      },
    })
      .then((response) => {
        if (cancelled) return;
        let initialMessages = response.data;
        if (!initialMessages) {
          console.error("Failed to load messages", response.error);
          initialMessages = [];
        }
        const ids = new Set(initialMessages.map((msg) => msg.id));
        messageIdsRef.current = ids;
        const pending = pendingMessagesRef.current.filter(
          (msg) => msg.conversationId === conversationId && !ids.has(msg.id)
        );
        pendingMessagesRef.current = [];
        setConvoMessages([...initialMessages, ...pending]);
      })
      .catch((error) => {
        console.error("Failed to load messages", error);
        setConvoMessages([]);
      });

    return () => {
      cancelled = true;
      if (
        socketRef.current &&
        joinedConversationRef.current === conversationId
      ) {
        socketRef.current.emit("leave-conversation", { conversationId });
        joinedConversationRef.current = null;
      }
    };
  }, [conversationId]);

  return [convoMessages, setConvoMessages];
};

export default useLiveConvoMessages;
