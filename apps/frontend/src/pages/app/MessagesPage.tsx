import {
  conversationAcceptInvite,
  conversationCreateDirectConversation,
  conversationDeclineInvite,
  ConversationDto,
  conversationGetMyConversations,
  MessageDto,
  ProfileDto,
  userListFriends,
} from "@alliance/shared/client";
import Button, { ButtonColor } from "@alliance/shared/ui/Button";
import CreateIcon from "@alliance/shared/ui/icons/CreateIcon";
import ProfileImage from "@alliance/shared/ui/ProfileImage";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Spinner from "../../components/Spinner";
import DropdownIcon from "@alliance/shared/ui/icons/DropdownIcon";
import { useAuth } from "../../lib/AuthContext";
import useLiveConvoMessages from "./messages";
import { useSearchParams } from "react-router";
import ConversationDetailPanel from "../../components/ConversationDetailPanel";

const MessagesPage = () => {
  const [conversations, setConversations] = useState<ConversationDto[] | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    conversationGetMyConversations()
      .then((response) => {
        if (response.data) {
          setConversations(response.data);
        }
      })
      .catch((error) => {
        console.error("Failed to load conversations", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const [params, setParams] = useSearchParams();
  const selectedConvoId = useMemo(() => {
    const convoId = params.get("chat");
    return convoId ? parseInt(convoId) : null;
  }, [params]);

  const setSelectedConvoId = useCallback(
    (convoId: number) => {
      setParams({ chat: convoId.toString() });
    },
    [setParams]
  );

  const selectedConvo = useMemo(
    () => conversations?.find((convo) => convo.id === selectedConvoId),
    [conversations, selectedConvoId]
  );

  const { user } = useAuth();

  const setConvoLastMessage = useCallback((message: MessageDto) => {
    setConversations((prev) => {
      if (!prev) return null;
      const existing = prev.find(
        (convo) => convo.id === message.conversationId
      );
      if (!existing) {
        return prev;
      }
      const updated = { ...existing, lastMessage: message };
      return [updated, ...prev.filter((convo) => convo.id !== updated.id)];
    });
  }, []);

  const handleConversationUpdated = useCallback(
    (updatedConversation: ConversationDto) => {
      setConversations((prev) => {
        if (!prev) {
          return prev;
        }
        const existing = prev.find(
          (convo) => convo.id === updatedConversation.id
        );
        if (!existing) {
          return prev;
        }
        const merged = { ...existing, ...updatedConversation };
        return [merged, ...prev.filter((convo) => convo.id !== merged.id)];
      });
    },
    []
  );

  const [convoMessages] = useLiveConvoMessages(selectedConvoId, {
    onIncomingMessage: setConvoLastMessage,
    onConversationUpdated: handleConversationUpdated,
  });

  const [friends, setFriends] = useState<ProfileDto[] | null>(null);

  const [messagesOpen, setMessagesOpen] = useState(false);
  const [isSmall, setIsSmall] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      setIsSmall(document.body.clientWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef.current]);

  useEffect(() => {
    if (!user) return;
    userListFriends({ path: { id: user.id } }).then((response) => {
      if (response.data) {
        const notmessagedYet = response.data.filter(
          (friend) =>
            !conversations?.some(
              (convo) =>
                convo.type === "direct" &&
                convo.participants.some(
                  (participant) => participant.user.id === friend.id
                )
            )
        );
        setFriends(notmessagedYet);
      }
    });
  }, [user, conversations]);

  const [creatingNewConversation, setCreatingNewConversation] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [convoMessages]);

  const selectFriend = (friendId: number) => {
    setCreatingNewConversation(false);
    conversationCreateDirectConversation({
      body: {
        targetUserId: friendId,
      },
    }).then((response) => {
      if (response.data) {
        setConversations((prev) => [...(prev ?? []), response.data]);
        setSelectedConvoId(response.data.id);
      }
    });
  };

  const joinedConversations = useMemo(() => {
    return conversations?.filter((convo) =>
      convo.participants.some(
        (participant) =>
          participant.user.id === user?.id && participant.state === "joined"
      )
    );
  }, [conversations, user]);

  const pendingInvites = useMemo(() => {
    return conversations?.filter((convo) =>
      convo.participants.some(
        (participant) =>
          participant.user.id === user?.id && participant.state === "invited"
      )
    );
  }, [conversations, user]);

  const handleAcceptMessageRequest = useCallback(() => {
    if (!selectedConvo) return;
    conversationAcceptInvite({
      path: { conversationId: selectedConvo.id },
    }).then((response) => {
      if (response.data) {
        handleConversationUpdated(response.data);
      }
    });
  }, [selectedConvo, handleConversationUpdated]);

  const handleDeclineMessageRequest = useCallback(() => {
    if (!selectedConvo) return;
    conversationDeclineInvite({
      path: { conversationId: selectedConvo.id },
    }).then((response) => {
      if (response.data) {
        handleConversationUpdated(response.data);
      }
    });
  }, [selectedConvo, handleConversationUpdated]);

  const handleConversationClick = useCallback(
    (conversationId: number) => () => {
      setMessagesOpen(true);
      setSelectedConvoId(conversationId);
    },
    [setSelectedConvoId]
  );

  if (!conversations && loading) {
    return (
      <div>
        <Spinner size="large" />
      </div>
    );
  }

  if (!conversations) {
    return (
      <div>
        <p>No conversations found</p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-row w-full h-[calc(100vh-var(--mobile-nav-height))]"
      ref={containerRef}
    >
      <div
        className={` overflow-x-hidden flex flex-col bg-zinc-50 border-r border-zinc-200 transition-width duration-100 ease-in-out ${
          !isSmall ? "md:max-w-[300px]" : "max-w-full"
        }`}
        style={{ flex: isSmall && messagesOpen ? 0 : 1 }}
      >
        {creatingNewConversation ? (
          <>
            <div className="flex flex-row p-4 justify-start items-center gap-x-2">
              <Button
                color={ButtonColor.Transparent}
                size="small"
                onClick={() => setCreatingNewConversation(false)}
                className="!px-1 rotate-90"
              >
                <DropdownIcon size="small" fill="var(--color-gray-700)" />
              </Button>
              <p className="font-medium">Start a conversation...</p>
            </div>
            <div className="flex flex-col">
              {friends && friends.length > 0 ? (
                friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex flex-row items-center gap-x-2 hover:bg-zinc-100 p-4 rounded-md cursor-pointer"
                    onClick={() => selectFriend(friend.id)}
                  >
                    <ProfileImage pfp={friend.profilePicture} size="large" />
                    <span>{friend.displayName}</span>
                  </div>
                ))
              ) : (
                <p className="text-center text-zinc-500 p-4 text-sm">
                  No friends to message yet
                </p>
              )}
            </div>
          </>
        ) : (
          <div>
            <div className="p-4">
              <div className="flex flex-row items-center justify-between gap-x-2 mb-2">
                <p className="text-lg font-semibold">Chats</p>
                <Button
                  color={ButtonColor.Transparent}
                  size="small"
                  onClick={() => setCreatingNewConversation(true)}
                  className="!px-1"
                >
                  <CreateIcon size="large" fill="var(--color-gray-700)" />
                </Button>
              </div>
              <input
                placeholder="Search"
                className="w-full border border-zinc-200 rounded-md p-2 !bg-gray-200 text-black"
              />
            </div>
            <div className="border-t border-zinc-200">
              {joinedConversations?.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-4 hover:bg-zinc-100 cursor-pointer  border-b border-zinc-200 flex flex-row items-center gap-x-2 ${
                    selectedConvoId === conversation.id
                      ? "bg-zinc-100"
                      : "bg-white"
                  }`}
                  onClick={handleConversationClick(conversation.id)}
                >
                  <ProfileImage pfp={conversation.photo ?? null} size="large" />
                  <div className="flex flex-col">
                    <span className="font-medium">{conversation.title}</span>
                    <span className="text-sm text-zinc-500 line-clamp-1">
                      {!!conversation.lastMessage
                        ? conversation.type === "direct"
                          ? conversation.lastMessage.body
                          : conversation.lastMessage.author.displayName +
                            ": " +
                            conversation.lastMessage.body
                        : "No messages yet"}
                    </span>
                  </div>
                </div>
              ))}
              {pendingInvites && pendingInvites.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm text-zinc-500 font-medium px-4">
                    New message requests
                  </p>
                  <div className="flex flex-col border-t border-zinc-200 mt-2">
                    {pendingInvites?.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`p-4 hover:bg-zinc-100 cursor-pointer border-b border-zinc-200 flex flex-row items-center gap-x-2 ${
                          selectedConvoId === conversation.id
                            ? "bg-zinc-100"
                            : "bg-green/10"
                        }`}
                        onClick={() => setSelectedConvoId(conversation.id)}
                      >
                        <ProfileImage
                          pfp={conversation.photo ?? null}
                          size="large"
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {conversation.title}
                          </span>
                          <span className="text-sm text-zinc-500 line-clamp-1">
                            {!!conversation.lastMessage
                              ? conversation.type === "direct"
                                ? conversation.lastMessage.body
                                : conversation.lastMessage.author.displayName +
                                  ": " +
                                  conversation.lastMessage.body
                              : "Wants start a direct message"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <div
        className={`flex-1 ${
          isSmall && !messagesOpen ? "max-w-0" : "max-w-full"
        }`}
      >
        {selectedConvo && (
          <ConversationDetailPanel
            showCloseButton={isSmall}
            onClose={() => setMessagesOpen(false)}
            selectedConvo={selectedConvo}
            convoMessages={convoMessages}
            messagesContainerRef={messagesContainerRef}
            handleAcceptMessageRequest={handleAcceptMessageRequest}
            handleDeclineMessageRequest={handleDeclineMessageRequest}
            handleConversationUpdated={handleConversationUpdated}
          />
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
