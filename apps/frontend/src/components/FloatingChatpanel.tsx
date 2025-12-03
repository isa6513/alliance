import {
  ConversationDto,
  conversationGetCommunityConversations,
} from "@alliance/shared/client";
import { useEffect, useRef, useState } from "react";
import Spinner from "./Spinner";
import ConversationDetailPanel from "./ConversationDetailPanel";
import useLiveConvoMessages from "../pages/app/messages";
import { MessageCircleMore, Minus } from "lucide-react";
import { href, Link } from "react-router";
import Button, { ButtonColor } from "@alliance/shared/ui/Button";

const FloatingChatPanel = ({
  communityId,
  onClose,
}: {
  communityId: number;
  onClose: () => void;
}) => {
  const [conversation, setConversation] = useState<ConversationDto | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const [convoMessages] = useLiveConvoMessages(conversation?.id ?? null, {
    onIncomingMessage: () => {},
    onConversationUpdated: (conversation: ConversationDto) => {
      setConversation(conversation);
    },
  });

  useEffect(() => {
    conversationGetCommunityConversations({ path: { communityId } })
      .then((response) => {
        if (response.data) {
          setConversation(response.data);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [communityId]);

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="h-full relative">
      {conversation ? (
        <ConversationDetailPanel
          mode="existing"
          selectedConvo={conversation}
          convoMessages={convoMessages}
          messagesContainerRef={messagesContainerRef}
          showCloseButton={false}
          onClose={() => {}}
          onLeave={() => {}}
          friends={[]}
          handleConversationUpdated={setConversation}
          handleAcceptMessageRequest={() => {}}
          handleDeclineMessageRequest={() => {}}
          sendingNewMessageToIds={null}
          setSendingNewMessageToIds={null}
          handleCreateConversation={null}
          compact={true}
        />
      ) : (
        <p>Could not load conversation</p>
      )}
      <div className="absolute right-5 top-5 flex flex-row gap-x-2">
        <Button
          color={ButtonColor.Transparent}
          onClick={onClose}
          title="Close Chat"
        >
          <Minus size="20" />
        </Button>
        <Link
          to={
            href("/messages") +
            (!!conversation ? "?chat=" + conversation.id : "")
          }
          className="hover:bg-black/5 rounded-md p-2 flex items-center justify-center"
          title="Open Messages"
        >
          <MessageCircleMore size="20" />
        </Link>
      </div>
    </div>
  );
};

export default FloatingChatPanel;
