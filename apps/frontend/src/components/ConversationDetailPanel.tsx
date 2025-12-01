import {
  ConversationDto,
  CreateMessageDto,
  messageSendMessage,
  ProfileDto,
} from "@alliance/shared/client";
import Spinner from "./Spinner";
import Message from "./Message";
import Button, { ButtonColor } from "@alliance/shared/ui/Button";
import { useAuth } from "../lib/AuthContext";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ConversationInfoPanel from "./ConversationInfoPanel";
import ProfileImage from "@alliance/shared/ui/ProfileImage";
import { ChevronLeft, Users } from "lucide-react";
import MessageInput from "./MessageInput";
import type { MessageDto } from "@alliance/shared/client";

interface ConversationDetailPanelProps {
  selectedConvo: ConversationDto;
  convoMessages: MessageDto[] | null;
  messagesContainerRef: React.RefObject<HTMLDivElement | null>;
  handleAcceptMessageRequest: () => unknown;
  handleDeclineMessageRequest: () => unknown;
  handleConversationUpdated: (conversation: ConversationDto) => void;
  showCloseButton: boolean;
  onClose: () => void;
  onLeave: () => void;
  friends: ProfileDto[] | null;
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
  onLeave,
  friends,
}: ConversationDetailPanelProps) => {
  const { user } = useAuth();

  const [message, setMessage] = useState<string>("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [groupInfoOpen, setGroupInfoOpen] = useState(false);
  const [isDraggingPanel, setIsDraggingPanel] = useState(false);
  const panelDragCounterRef = useRef(0);

  const readImagesFromFiles = useCallback(async (files: File[]) => {
    const readers: Promise<string>[] = [];
    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      readers.push(
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
      );
    }
    return Promise.all(readers);
  }, []);

  const handleFilesSelected = useCallback(
    async (files: FileList | File[] | null) => {
      if (!files || files.length === 0) return;
      try {
        const base64s = await readImagesFromFiles(Array.from(files));
        if (base64s.length > 0) {
          setAttachments((prev) => [...prev, ...base64s]);
        }
      } catch (err) {
        console.error("Failed reading image file(s)", err);
      }
    },
    [readImagesFromFiles]
  );

  const onDragEnterCapture = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    panelDragCounterRef.current += 1;
    setIsDraggingPanel(true);
  };

  const onDragOverCapture = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDragLeaveCapture = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    panelDragCounterRef.current -= 1;
    if (panelDragCounterRef.current <= 0) {
      setIsDraggingPanel(false);
    }
  };

  const onDropCapture = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    panelDragCounterRef.current = 0;
    setIsDraggingPanel(false);
    await handleFilesSelected(e.dataTransfer?.files ?? null);
  };

  const amInvited = useMemo(() => {
    return selectedConvo.participants.some(
      (participant) =>
        participant.user.id === user?.id && participant.state === "invited"
    );
  }, [selectedConvo, user]);

  const handleSendMessage = useCallback(async () => {
    if (isSendingMessage || !selectedConvo) {
      return;
    }

    const trimmed = message.trim();
    if (!trimmed && attachments.length === 0) {
      return;
    }

    setIsSendingMessage(true);
    try {
      const payload: CreateMessageDto & { attachments?: string[] } = {
        conversationId: selectedConvo.id,
        body: message,
        attachments,
      };
      const response = await messageSendMessage({
        body: payload,
      });
      if (response.data) {
        setMessage("");
        setAttachments([]);
      }
      if (amInvited) {
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
  }, [
    amInvited,
    attachments,
    handleConversationUpdated,
    isSendingMessage,
    message,
    selectedConvo,
    user?.id,
  ]);

  useEffect(() => {
    if (selectedConvo.id !== null) setGroupInfoOpen(false);
  }, [selectedConvo.id]);

  useEffect(() => {
    setAttachments([]);
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
    <div
      className="flex flex-col h-full overflow-x-hidden relative"
      onDragEnterCapture={onDragEnterCapture}
      onDragOverCapture={onDragOverCapture}
      onDragLeaveCapture={onDragLeaveCapture}
      onDropCapture={onDropCapture}
    >
      {isDraggingPanel && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 text-white font-medium pointer-events-none">
          Drop images to attach
        </div>
      )}
      {groupInfoOpen ? (
        <ConversationInfoPanel
          selectedConvo={selectedConvo}
          isAdmin={isAdmin}
          handleConversationUpdated={handleConversationUpdated}
          friends={friends}
          onLeave={onLeave}
          onClose={() => setGroupInfoOpen(false)}
        />
      ) : (
        <>
          <div
            className="flex flex-row gap-y-2 border-b border-zinc-200 p-4 lg:px-8 hover:bg-zinc-100 cursor-pointer"
            onClick={() => setGroupInfoOpen(true)}
          >
            <div className="flex flex-row gap-x-3 items-center">
              {showCloseButton && (
                <Button
                  color={ButtonColor.Transparent}
                  size="medium"
                  onClick={onClose}
                  className="!px-2 !py-2"
                >
                  <ChevronLeft size="20" />
                </Button>
              )}
              {selectedConvo.photo && (
                <ProfileImage
                  pfp={selectedConvo.photo}
                  size="large"
                  className="mt-1"
                />
              )}
              <div className="flex flex-col justify-center">
                <p className="font-semibold text-lg">{selectedConvo.title}</p>
                {selectedConvo.type !== "direct" && (
                  <div className="flex flex-row items-center gap-x-1 text-zinc-500">
                    <Users size="17" />
                    <p className="text-sm">
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
          <MessageInput
            message={message}
            setMessage={setMessage}
            attachments={attachments}
            setAttachments={setAttachments}
            onSend={handleSendMessage}
            isSending={isSendingMessage}
          />
        </>
      )}
    </div>
  );
};

export default ConversationDetailPanel;
