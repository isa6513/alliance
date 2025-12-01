import {
  conversationAcceptInvite,
  conversationCreateDirectConversation,
  conversationCreateGroupConversation,
  conversationDeclineInvite,
  ConversationDto,
  conversationGetMyConversations,
  conversationMarkRead,
  MessageDto,
  ProfileDto,
  userListFriends,
} from "@alliance/shared/client";
import Button, { ButtonColor } from "@alliance/shared/ui/Button";
import ProfileImage from "@alliance/shared/ui/ProfileImage";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Spinner from "../../components/Spinner";
import { useAuth } from "../../lib/AuthContext";
import useLiveConvoMessages from "./messages";
import { useSearchParams } from "react-router";
import ConversationDetailPanel from "../../components/ConversationDetailPanel";
import { ChevronLeft, Plus } from "lucide-react";

function sortConversations(a: ConversationDto, b: ConversationDto) {
  return (
    new Date(b.lastMessage?.createdAt ?? b.createdAt).getTime() -
    new Date(a.lastMessage?.createdAt ?? a.createdAt).getTime()
  );
}

const MessagesPage = () => {
  const [conversations, setConversations] = useState<ConversationDto[] | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    conversationGetMyConversations()
      .then((response) => {
        if (response.data) {
          setConversations(response.data.sort(sortConversations));
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
    (convoId: number | null) => {
      if (!convoId) {
        setParams({});
        return;
      }
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
        return [merged, ...prev.filter((convo) => convo.id !== merged.id)].sort(
          sortConversations
        );
      });
    },
    []
  );

  const [convoMessages] = useLiveConvoMessages(selectedConvoId, {
    onIncomingMessage: setConvoLastMessage,
    onConversationUpdated: handleConversationUpdated,
  });

  const [friends, setFriends] = useState<ProfileDto[] | null>(null);

  const notmessagedFriends = useMemo(() => {
    return friends?.filter(
      (friend) =>
        !conversations?.some(
          (convo) =>
            convo.type === "direct" &&
            convo.participants.some(
              (participant) => participant.user.id === friend.id
            )
        )
    );
  }, [friends, conversations]);

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
        setFriends(response.data);
      }
    });
  }, [user, conversations]);

  const [creatingNewConversation, setCreatingNewConversation] = useState(false);

  const [search, setSearch] = useState("");
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [selectedFriendsForGroup, setSelectedFriendsForGroup] = useState<
    number[]
  >([]);

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const searchFilteredFriends = useMemo(() => {
    return friends?.filter((friend) =>
      friend.displayName.toLowerCase().includes(search.toLowerCase())
    );
  }, [friends, search]);

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

  const selectFriendForGroup = useCallback(
    (friendId: number) => {
      if (selectedFriendsForGroup.includes(friendId)) {
        setSelectedFriendsForGroup((prev) =>
          prev.filter((id) => id !== friendId)
        );
      } else {
        setSelectedFriendsForGroup((prev) => [...prev, friendId]);
      }
    },
    [selectedFriendsForGroup]
  );

  const handleCreateGroupForSelectedFriends = useCallback(async () => {
    if (selectedFriendsForGroup.length === 0) return;
    const response = await conversationCreateGroupConversation({
      body: {
        participantIds: selectedFriendsForGroup,
        title: "New group",
      },
    });
    if (response.data) {
      setConversations((prev) => [...(prev ?? []), response.data]);
      setSelectedConvoId(response.data.id);
      setCreatingGroup(false);
      setSelectedFriendsForGroup([]);
      setCreatingNewConversation(false);
    }
  }, [selectedFriendsForGroup, setSelectedConvoId]);

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
        setSelectedConvoId(null);
      }
    });
  }, [selectedConvo, handleConversationUpdated, setSelectedConvoId]);

  const handleConversationClick = useCallback(
    (conversationId: number) => () => {
      setMessagesOpen(true);
      setSelectedConvoId(conversationId);
    },
    [setSelectedConvoId]
  );

  const handleCreateNewConversation = useCallback(() => {
    setCreatingNewConversation(true);
    setCreatingGroup(false);
    setSelectedFriendsForGroup([]);
    setSearch("");
  }, []);

  const filteredConversations = useMemo(() => {
    return joinedConversations?.filter((convo) =>
      convo.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [joinedConversations, search]);

  const handleCreateGroup = useCallback(() => {
    setSelectedConvoId(0);
    setSearch("");
    setCreatingGroup(true);
  }, [setSelectedConvoId]);

  useEffect(() => {
    if (selectedConvoId) {
      conversationMarkRead({
        path: { conversationId: selectedConvoId },
      });
    }
  }, [selectedConvoId]);

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
            <div className="flex flex-col p-4 justify-start items-center gap-y-2 pt-6">
              <div className="flex flex-row gap-x-2 w-full items-center">
                <Button
                  color={ButtonColor.Transparent}
                  onClick={() => setCreatingNewConversation(false)}
                  className="!px-2 !py-2"
                >
                  <ChevronLeft size="20" />
                </Button>
                <p className="font-medium">Start a conversation...</p>
              </div>
              <input
                placeholder="Search"
                className="w-full border border-zinc-200 rounded-md p-2 !bg-gray-200 text-black"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {creatingGroup ? (
              <div className="flex flex-col px-4 gap-y-2">
                <p className="text-sm text-zinc-500 font-medium">
                  Select friends to add:
                </p>
                <div className="max-h-[300px] overflow-y-auto">
                  {searchFilteredFriends && searchFilteredFriends.length > 0 ? (
                    searchFilteredFriends.map((friend) => (
                      <div
                        key={friend.id}
                        className="flex flex-row items-center justify-between gap-x-2 hover:bg-zinc-100 p-4 rounded-md cursor-pointer"
                        onClick={() => selectFriendForGroup(friend.id)}
                      >
                        <div className="flex flex-row items-center gap-x-2">
                          <ProfileImage
                            pfp={friend.profilePicture}
                            size="large"
                          />
                          <span>{friend.displayName}</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedFriendsForGroup.includes(friend.id)}
                          className="w-4 h-4 mr-2"
                        />
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-zinc-500 p-4 text-sm">
                      No friends to add
                    </p>
                  )}
                </div>
                <Button
                  color={ButtonColor.Black}
                  onClick={handleCreateGroupForSelectedFriends}
                  disabled={selectedFriendsForGroup.length === 0}
                  className="self-end rounded-md"
                >
                  Create group
                </Button>
              </div>
            ) : (
              <div className="flex flex-col px-4">
                <Button
                  color={ButtonColor.Transparent}
                  onClick={handleCreateGroup}
                  className="w-full justify-start rounded-md !py-3 border border-zinc-300 mb-2"
                >
                  Create a group
                </Button>
                {notmessagedFriends && notmessagedFriends.length > 0 ? (
                  notmessagedFriends.map((friend) => (
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
            )}
          </>
        ) : (
          <div>
            <div className="p-4">
              <div className="flex flex-row items-center justify-between gap-x-2 mb-2">
                <p className="text-lg font-semibold">Chats</p>
                <Button
                  color={ButtonColor.Transparent}
                  size="small"
                  onClick={handleCreateNewConversation}
                  className="!px-2"
                >
                  <Plus size="18" />
                </Button>
              </div>
              <input
                placeholder="Search"
                className="w-full border border-zinc-200 rounded-md p-2 !bg-gray-200 text-black"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="border-t border-zinc-200">
              {filteredConversations?.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-4 hover:bg-zinc-100 cursor-pointer border-b border-zinc-200 flex flex-row justify-between items-center gap-x-3 ${
                    selectedConvoId === conversation.id
                      ? "bg-zinc-100"
                      : "bg-white"
                  }`}
                  onClick={handleConversationClick(conversation.id)}
                >
                  <div className="flex flex-row items-center gap-x-3">
                    <ProfileImage
                      pfp={conversation.photo ?? null}
                      size="large"
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{conversation.title}</span>
                      <span className="text-sm text-zinc-500 line-clamp-1">
                        {!!conversation.lastMessage
                          ? conversation.type === "direct"
                            ? conversation.lastMessage.author.id === user?.id
                              ? "you: " + conversation.lastMessage.body
                              : conversation.lastMessage.body
                            : conversation.lastMessage.author.displayName +
                              ": " +
                              conversation.lastMessage.body
                          : "No messages yet"}
                      </span>
                    </div>
                  </div>
                  <div>
                    {conversation.unreadCount > 0 && (
                      <div
                        className={`font-semibold text-xs text-white bg-red-500
                    } rounded-md flex justify-center items-center w-6 h-6`}
                      >
                        {conversation.unreadCount}
                      </div>
                    )}
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
                              : conversation.type === "direct"
                              ? "Wants to start a conversation"
                              : "You were invited to a group"}
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
            onLeave={() => {
              setSelectedConvoId(null);
              setMessagesOpen(false);
            }}
            selectedConvo={selectedConvo}
            convoMessages={convoMessages}
            messagesContainerRef={messagesContainerRef}
            handleAcceptMessageRequest={handleAcceptMessageRequest}
            handleDeclineMessageRequest={handleDeclineMessageRequest}
            handleConversationUpdated={handleConversationUpdated}
            friends={friends}
          />
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
