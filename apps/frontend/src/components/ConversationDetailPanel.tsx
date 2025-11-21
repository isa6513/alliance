import StatusIcon from "@alliance/shared/ui/icons/StatusIcon";
import {
  ConversationDto,
  MessageDto,
  messageSendMessage,
} from "@alliance/shared/client";
import Spinner from "./Spinner";
import Message from "./Message";
import Button, { ButtonColor } from "@alliance/shared/ui/Button";
import { useAuth } from "../lib/AuthContext";
import { useEffect, useMemo, useState } from "react";
import DropdownIcon from "@alliance/shared/ui/icons/DropdownIcon";
import ProfileImage from "@alliance/shared/ui/ProfileImage";
import { Link } from "react-router";
import List from "@alliance/shared/ui/List";
import DeleteIcon from "@alliance/shared/ui/icons/DeleteIcon";

interface ConversationDetailPanelProps {
  selectedConvo: ConversationDto;
  convoMessages: MessageDto[] | null;
  messagesContainerRef: React.RefObject<HTMLDivElement | null>;
  handleAcceptMessageRequest: () => unknown;
  handleDeclineMessageRequest: () => unknown;
  handleConversationUpdated: (conversation: ConversationDto) => void;
  showCloseButton: boolean;
  onClose: () => void;
}
const ConversationDetailPanel = ({
  selectedConvo,
  convoMessages,
  messagesContainerRef,
  handleAcceptMessageRequest,
  handleDeclineMessageRequest,
  handleConversationUpdated,
  showCloseButton,
  onClose,
}: ConversationDetailPanelProps) => {
  const { user } = useAuth();

  const [message, setMessage] = useState<string>("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [groupInfoOpen, setGroupInfoOpen] = useState(false);

  const amInvited = useMemo(() => {
    return selectedConvo.participants.some(
      (participant) =>
        participant.user.id === user?.id && participant.state === "invited"
    );
  }, [selectedConvo, user]);

  const handleMessageKeyDown = async (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter" && !isSendingMessage && selectedConvo) {
      setIsSendingMessage(true);
      try {
        const response = await messageSendMessage({
          body: {
            conversationId: selectedConvo?.id ?? 0,
            body: message,
          },
        });
        if (response.data) {
          setMessage("");
        }
        if (selectedConvo.type === "direct" && amInvited) {
          handleConversationUpdated({
            ...selectedConvo,
            participants: selectedConvo.participants.map((participant) => {
              if (participant.user.id === user?.id) {
                return { ...participant, state: "joined" };
              }
              return participant;
            }),
          });
        }
      } catch (err) {
        console.error("Failed to send message", err);
      } finally {
        setIsSendingMessage(false);
      }
    }
  };

  useEffect(() => {
    if (selectedConvo.id !== null) setGroupInfoOpen(false);
  }, [selectedConvo.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setGroupInfoOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const isAdmin = useMemo(() => {
    return selectedConvo.participants.some(
      (participant) =>
        participant.user.id === user?.id && participant.role === "admin"
    );
  }, [selectedConvo, user]);

  return (
    <div className="flex flex-col h-full overflow-x-hidden">
      {groupInfoOpen ? (
        <div className="flex-1 relative flex flex-col items-center">
          <div className="flex flex-col items-center px-8 pt-20 w-full gap-y-2">
            <ProfileImage
              pfp={selectedConvo.photo ?? null}
              size="huge"
              className="mb-2"
            />
            {selectedConvo.type === "direct" ? (
              <>
                <Link
                  to={`/user/${
                    selectedConvo.participants.find(
                      (participant) => participant.user.id !== user?.id
                    )?.user.id
                  }`}
                  className="flex flex-row p-2 gap-4 hover:bg-zinc-100 rounded-md pl-4"
                >
                  <p className="font-semibold text-xl text-center">
                    {selectedConvo.title}
                  </p>
                  <div className="rotate-270">
                    <DropdownIcon size="small" fill="var(--color-zinc-700)" />
                  </div>
                </Link>
                <p className="text-sm text-zinc-500">Direct message</p>
              </>
            ) : (
              <p className="font-semibold text-xl text-center">
                {selectedConvo.title}
              </p>
            )}
          </div>
          {selectedConvo.type !== "direct" && (
            <div className="flex flex-col p-2 px-5 gap-4 w-full items-center">
              <p className="text-center">
                {selectedConvo.participants.length} members
              </p>
              <List className="max-h-[300px] overflow-y-auto w-full max-w-[500px]">
                {selectedConvo.participants.map((participant) => (
                  <Link
                    key={participant.user.id}
                    to={`/user/${participant.user.id}`}
                    className="p-4 hover:bg-zinc-100 flex flex-row items-center gap-x-3 justify-between"
                  >
                    <div className="flex flex-row items-center gap-x-3">
                      <ProfileImage
                        pfp={participant.user.profilePicture}
                        size="large"
                      />
                      <p>{participant.user.displayName}</p>
                    </div>
                    {isAdmin && participant.user.id !== user?.id && (
                      <Button
                        color={ButtonColor.Transparent}
                        onClick={() =>
                          handleRemoveParticipant(participant.user.id)
                        }
                      >
                        <DeleteIcon size="large" fill="var(--color-red-400)" />
                      </Button>
                    )}
                  </Link>
                ))}
              </List>
            </div>
          )}
          <Button
            color={ButtonColor.Transparent}
            onClick={() => setGroupInfoOpen(false)}
            className="!px-2 !py-2 mx-auto absolute top-5 left-5 rotate-90"
          >
            <DropdownIcon size="medium" fill="var(--color-zinc-700)" />
          </Button>
        </div>
      ) : (
        <>
          <div
            className="flex flex-row gap-y-2 border-b border-zinc-200 p-4 px-8 hover:bg-zinc-100 cursor-pointer"
            onClick={() => setGroupInfoOpen(true)}
          >
            <div className="flex flex-row gap-x-2">
              {showCloseButton && (
                <Button
                  color={ButtonColor.Transparent}
                  size="medium"
                  onClick={onClose}
                  className="!px-2 !py-2 rotate-90"
                >
                  <DropdownIcon size="small" fill="var(--color-zinc-700)" />
                </Button>
              )}
              <div className="flex flex-col justify-center">
                <p className="font-semibold text-lg">{selectedConvo.title}</p>
                {selectedConvo.type !== "direct" && (
                  <div className="flex flex-row items-center">
                    <StatusIcon
                      status={"gathering_commitments"}
                      fill="var(--color-zinc-400)"
                      size="large"
                    />
                    <p className="text-sm text-zinc-500">
                      {selectedConvo.participants.length} members
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div
            className="overflow-y-auto px-8 justify-end mt-auto py-3"
            ref={messagesContainerRef}
          >
            {selectedConvo.type === "direct" &&
              selectedConvo.participants.some(
                (participant) =>
                  participant.user.id !== user?.id &&
                  participant.state === "invited"
              ) && (
                <div className="flex flex-row items-center gap-x-2 w-full p-5">
                  <p className="text-sm text-zinc-500 mx-auto">
                    {
                      selectedConvo.participants.find(
                        (participant) =>
                          participant.user.id !== user?.id &&
                          participant.state === "invited"
                      )?.user.displayName
                    }{" "}
                    has received a message request.
                  </p>
                </div>
              )}

            {convoMessages === null ? (
              <div className="flex justify-center items-center h-full">
                <Spinner size="large" color="fill-zinc-200" />
              </div>
            ) : (
              <div>
                {convoMessages.map((message, idx, arr) => (
                  <Message
                    key={message.id}
                    message={message}
                    isFirstInGroup={
                      idx === 0 || arr[idx - 1].author.id !== message.author.id
                    }
                  />
                ))}
              </div>
            )}
            {selectedConvo.type === "direct" &&
              selectedConvo.participants.some(
                (participant) =>
                  participant.user.id === user?.id &&
                  participant.state === "invited"
              ) && (
                <div className="flex flex-row items-center gap-x-2 w-full p-5">
                  <div className="flex flex-col lg:flex-row items-center mx-auto gap-3">
                    <p className="text-zinc-800">
                      You have received a message request from{" "}
                      {
                        selectedConvo.participants.find(
                          (participant) =>
                            participant.user.id !== user?.id &&
                            participant.state === "joined"
                        )?.user.displayName
                      }
                    </p>
                    <div className="flex flex-row gap-x-2">
                      <Button
                        color={ButtonColor.Black}
                        onClick={handleAcceptMessageRequest}
                      >
                        Accept
                      </Button>
                      <Button
                        color={ButtonColor.Light}
                        onClick={handleDeclineMessageRequest}
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                </div>
              )}
          </div>
          <div className="flex flex-row gap-x-2 px-8 bg-white pt-1 pb-17 md:pb-6">
            <input
              placeholder="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleMessageKeyDown}
              className="w-full border border-zinc-200 rounded-md p-3 !bg-gray-200/80 text-black"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ConversationDetailPanel;
