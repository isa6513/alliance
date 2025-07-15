import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import Card from "../system/Card";
import { ReplyDto, UserDto } from "@alliance/shared/client";
import ReplyForm from "./ReplyForm";

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
  const isNested = depth > 0;
  const canNest = depth < maxDepth;
  const isReplyingToThis = replyingTo === reply.id;
  const hasChildren = reply.children && reply.children.length > 0;
  const isNewlyAdded = newlyAddedReplies.has(reply.id);
  const isHighlighted = highlightedReplyId === reply.id;

  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`${isNested && "ml-6 mt-3"}`} id={`reply-${reply.id}`}>
      <Card
        key={reply.id}
        className={`transition-all duration-1000 ${
          isNewlyAdded ? "border-1 !border-green-600/80 bg-green-50" : ""
        } ${isHighlighted ? "border-1 !border-blue-500 !bg-blue-50" : ""}`}
      >
        <div className="flex items-start gap-2">
          {/* Collapse/Expand Arrow */}
          {hasChildren && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex-shrink-0 mt-1 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
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

          {/* Reply Content */}
          <div className="flex-1 min-w-0">
            <div className="mb-1 whitespace-pre-wrap">{reply.content}</div>

            <div className="flex justify-between items-center text-sm text-gray-500">
              <div className="gap-x-2 flex">
                {reply.author?.name !== undefined && (
                  <p>
                    Reply by{" "}
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
                    {reply.children.length}{" "}
                    {reply.children.length === 1 ? "reply" : "replies"} hidden
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
                    className="text-black hover:underline"
                  >
                    {!isReplyingToThis && "Reply"}
                  </button>
                )}
                {user && reply.author.email === user.email && (
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
      </Card>
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

      {hasChildren && !isCollapsed && reply.children !== undefined && (
        <div className="mt-2">
          {reply.children.map((childReply) => (
            <ReplyComponent
              key={childReply.id}
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
          ))}
        </div>
      )}
    </div>
  );
};

export default ReplyComponent;
