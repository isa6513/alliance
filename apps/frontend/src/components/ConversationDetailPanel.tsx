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
import { useMemo, useState } from "react";
import DropdownIcon from "@alliance/shared/ui/icons/DropdownIcon";

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

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-row gap-y-2 border-b border-zinc-200 p-4 px-8">
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
        className="overflow-y-auto px-8 justify-end mt-auto"
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
            {convoMessages.map((message) => (
              <Message key={message.id} message={message} className="my-2" />
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
                        participant.user.id === user?.id &&
                        participant.state === "invited"
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
    </div>
  );
};

export default ConversationDetailPanel;
