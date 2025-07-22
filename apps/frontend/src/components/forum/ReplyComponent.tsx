import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import Card from "../system/Card";
import { ReplyDto, UserDto } from "@alliance/shared/client";
import ReplyForm from "./ReplyForm";

const countAllReplies = (replies: ReplyDto[]): number => {
  let count = 0;
  for (const reply of replies) {
    count += 1;
    if (reply.children && reply.children.length > 0) {
      count += countAllReplies(reply.children);
    }
  }
  return count;
};

const getDisplayContent = (
  content: string,
  collapsed: boolean,
  deleted: boolean
): React.ReactNode => {
  const sharedClasses = "mb-1 whitespace-pre-wrap";
  if (deleted)
    return (
      <div className={`${sharedClasses} text-gray-400 text-sm`}>
        This reply has been deleted
      </div>
    );
  if (!collapsed) return content;
  const firstLine = content.split("\n")[0];
  return content.includes("\n") ? (
    <div className={`${sharedClasses} text-gray-500`}>{firstLine} ...</div>
  ) : (
    <div className={`${sharedClasses}`}>{firstLine}</div>
  );
};

interface ReplyComponentProps {
  reply: ReplyDto;
  depth?: number;
  user?: UserDto;
  replyingTo: number | null;
  setReplyingTo: (id: number | null) => void;
  replyContent: string;
  setReplyContent: (content: string) => void;
  handleSubmitReply: (e: React.FormEvent) => void;
  handleDeleteReply: (id: number) => void;
  isSubmitting: boolean;
  newlyAddedReplies: Set<number>;
  highlightedReplyId: number | null;
}

interface ReplyContentProps
  extends Pick<
    ReplyComponentProps,
    "reply" | "user" | "setReplyingTo" | "setReplyContent" | "handleDeleteReply"
  > {
  canNest: boolean;
  isReplyingToThis: boolean;
  hasChildren: boolean;
  isCollapsed?: boolean;
  isHighlighted: boolean;
}

const ReplyContent: React.FC<ReplyContentProps> = ({
  reply,
  user,
  canNest,
  isReplyingToThis,
  hasChildren,
  isCollapsed = false,
  isHighlighted,
  setReplyingTo,
  setReplyContent,
  handleDeleteReply,
}) => {
  return (
    <div className="flex items-start gap-2 relative">
      {/* Blue highlight indicator */}
      {isHighlighted && (
        <div className="absolute -left-4 top-0 bottom-0 w-[3px] bg-blue-500 rounded transition-all duration-1000" />
      )}
      <div className="flex-1 min-w-0">
        {getDisplayContent(reply.content, isCollapsed, reply.deleted)}

        <div className="flex justify-between items-center text-sm text-gray-500">
          <div className="gap-x-4 flex">
            {reply.author?.name !== undefined && (
              <p>
                By{" "}
                <a
                  href={`/user/${reply.author.id}`}
                  className="hover:underline"
                >
                  {reply.author?.name}
                </a>
              </p>
            )}
            <span>
              {formatDistanceToNow(new Date(reply.createdAt), {
                addSuffix: true,
              })}
            </span>
            {hasChildren && isCollapsed && reply.children !== undefined && (
              <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                {countAllReplies(reply.children)}{" "}
                {countAllReplies(reply.children) === 1 ? "reply" : "replies"}{" "}
                hidden
              </span>
            )}
          </div>

          <div className="flex space-x-2">
            {user && canNest && (
              <button
                onClick={() => {
                  setReplyingTo(isReplyingToThis ? null : reply.id);
                  if (!isReplyingToThis) {
                    setReplyContent("");
                  }
                }}
                className="text-gray-800 hover:underline"
              >
                {!isReplyingToThis && "Reply"}
              </button>
            )}
            {user && reply.author.email === user.email && !reply.deleted && (
              <button
                onClick={() => handleDeleteReply(reply.id)}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ReplyComponent = ({
  reply,
  depth = 0,
  user,
  replyingTo,
  setReplyingTo,
  replyContent,
  setReplyContent,
  handleSubmitReply,
  handleDeleteReply,
  isSubmitting,
  newlyAddedReplies,
  highlightedReplyId,
}: ReplyComponentProps) => {
  const maxDepth = 10;
  const canNest = depth < maxDepth;
  const isReplyingToThis = replyingTo === reply.id;
  const hasChildren = reply.children ? reply.children.length > 0 : false;
  const isNewlyAdded = newlyAddedReplies.has(reply.id);
  const isHighlighted = highlightedReplyId === reply.id;

  const [isCollapsed, setIsCollapsed] = useState(false);

  // Common styling classes
  const newReplyClass = isNewlyAdded
    ? depth === 0
      ? "border-1 !border-green-600/80 bg-green-50"
      : "border-l-2 border-green-600/80 bg-green-50/30 pl-3"
    : "";

  // For top-level replies only, render the entire thread in a card
  if (depth === 0) {
    return (
      <div className="relative">
        {/* Collapse/Expand Arrow - absolutely positioned to the left of the card */}
        {hasChildren && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -left-6 top-6 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer z-10"
            aria-label={isCollapsed ? "Expand replies" : "Collapse replies"}
          >
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${
                isCollapsed ? "-rotate-90" : "rotate-0"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        )}

        <div className="border-transparent duration-1000 rounded-lg">
          <Card
            key={reply.id}
            className={`transition-all duration-1000 ${newReplyClass}`}
          >
            <div id={`reply-${reply.id}`}>
              <ReplyContent
                reply={reply}
                user={user}
                canNest={canNest}
                isReplyingToThis={isReplyingToThis}
                hasChildren={hasChildren}
                isCollapsed={isCollapsed}
                isHighlighted={isHighlighted}
                setReplyingTo={setReplyingTo}
                setReplyContent={setReplyContent}
                handleDeleteReply={handleDeleteReply}
              />
            </div>

            {/* Render nested replies within the same card */}
            {hasChildren && !isCollapsed && reply.children !== undefined && (
              <div>
                {reply.children.map((childReply) => (
                  <div key={childReply.id}>
                    <div className="border-t border-gray-200 -mx-4 my-4"></div>
                    <div>
                      <ReplyComponent
                        reply={childReply}
                        depth={1}
                        user={user}
                        replyingTo={replyingTo}
                        setReplyingTo={setReplyingTo}
                        replyContent={replyContent}
                        setReplyContent={setReplyContent}
                        handleSubmitReply={handleSubmitReply}
                        handleDeleteReply={handleDeleteReply}
                        isSubmitting={isSubmitting}
                        newlyAddedReplies={newlyAddedReplies}
                        highlightedReplyId={highlightedReplyId}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Reply form for top-level reply */}
        {user && isReplyingToThis && !isCollapsed && (
          <ReplyForm
            parentId={reply.id}
            onCancel={() => setReplyingTo(null)}
            replyContent={replyContent}
            setReplyContent={setReplyContent}
            onSubmit={handleSubmitReply}
            isSubmitting={isSubmitting}
            setReplyingTo={setReplyingTo}
          />
        )}
      </div>
    );
  }

  const indentStyle = {
    marginLeft: `${depth * 30}px`,
  };

  return (
    <div>
      <div
        className={`rounded border-transparent ${newReplyClass} duration-1000`}
        id={`reply-${reply.id}`}
        style={indentStyle}
      >
        <ReplyContent
          reply={reply}
          user={user}
          canNest={canNest}
          isReplyingToThis={isReplyingToThis}
          hasChildren={hasChildren}
          isHighlighted={isHighlighted}
          setReplyingTo={setReplyingTo}
          setReplyContent={setReplyContent}
          handleDeleteReply={handleDeleteReply}
        />
      </div>

      {/* Reply form for nested reply */}
      {user && isReplyingToThis && (
        <div className={`mt-2`} style={indentStyle}>
          <ReplyForm
            parentId={reply.id}
            onCancel={() => setReplyingTo(null)}
            replyContent={replyContent}
            setReplyContent={setReplyContent}
            onSubmit={handleSubmitReply}
            isSubmitting={isSubmitting}
            setReplyingTo={setReplyingTo}
          />
        </div>
      )}

      {/* Render children */}
      {hasChildren && reply.children !== undefined && (
        <div>
          {reply.children.map((childReply) => (
            <div key={childReply.id}>
              <div className="border-t border-gray-200 my-4"></div>
              <ReplyComponent
                reply={childReply}
                depth={depth + 1}
                user={user}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                replyContent={replyContent}
                setReplyContent={setReplyContent}
                handleSubmitReply={handleSubmitReply}
                handleDeleteReply={handleDeleteReply}
                isSubmitting={isSubmitting}
                newlyAddedReplies={newlyAddedReplies}
                highlightedReplyId={highlightedReplyId}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReplyComponent;
