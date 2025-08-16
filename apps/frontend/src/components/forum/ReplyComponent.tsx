import React, { useState, useRef, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import Card from "../system/Card";
import {
  CommentDto,
  UserDto,
  forumUpdateComment,
} from "@alliance/shared/client";
import ReplyForm from "./ReplyForm";
import AppMarkdownWrapper from "../AppMarkdownWrapper";

const countAllReplies = (replies: CommentDto[]): number => {
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
  if (!collapsed) return <AppMarkdownWrapper markdownContent={content} />;
  const firstLine = content.split("\n")[0];
  return content.includes("\n") ? (
    <div className={`${sharedClasses} text-gray-500`}>{firstLine} ...</div>
  ) : (
    <div className={`${sharedClasses}`}>{firstLine}</div>
  );
};

interface ReplyComponentProps {
  reply: CommentDto;
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
  compact?: boolean;
  onUpdateReply?: (id: number, content: string) => void;
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
  onUpdateReply: (id: number, content: string) => void;
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
  onUpdateReply,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(reply.content);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDropdown]);

  const handleSaveEdit = async () => {
    if (editContent.trim() === reply.content.trim()) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdateReply(reply.id, editContent.trim());
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update reply:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditContent(reply.content);
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    setEditContent(reply.content);
    setIsEditing(true);
    setShowDropdown(false);
  };
  return (
    <div className="flex items-start gap-2 relative">
      {/* Blue highlight indicator */}
      {isHighlighted && (
        <div className="absolute -left-4 top-0 bottom-0 w-[3px] bg-blue-500 rounded transition-all duration-1000" />
      )}
      <div className="flex-1 min-w-0">
        {!isEditing &&
          getDisplayContent(reply.content, isCollapsed, reply.deleted)}

        {isEditing ? (
          <div className="">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              disabled={isUpdating}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleSaveEdit}
                disabled={isUpdating || !editContent.trim()}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? "Saving..." : "Save"}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={isUpdating}
                className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
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
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="text-gray-500 hover:text-gray-700 p-1"
                    aria-label="More options"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                  {showDropdown && (
                    <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                      <button
                        onClick={handleStartEdit}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          handleDeleteReply(reply.id);
                          setShowDropdown(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
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
  compact,
  onUpdateReply,
}: ReplyComponentProps) => {
  const handleUpdateReply = async (id: number, content: string) => {
    if (onUpdateReply) {
      await onUpdateReply(id, content);
    } else {
      // Default implementation using forumUpdateComment
      try {
        await forumUpdateComment({
          path: { id: id.toString() },
          body: { content },
        });
        // Update the reply content in place
        reply.content = content;
      } catch (error) {
        console.error("Failed to update comment:", error);
        throw error;
      }
    }
  };
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
            className={`absolute  top-6 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer z-10 ${
              compact ? "left-0" : "-left-6"
            }`}
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

        <div
          className={`border-transparent duration-1000 rounded-lg ${
            compact ? "pl-6" : ""
          }`}
        >
          <Card
            key={reply.id}
            className={`!display-block transition-colors duration-1000 ${newReplyClass} ${
              compact && "!p-1 !border-none"
            } ${user && isReplyingToThis && !isCollapsed && "rounded-b-none"}`}
            flex={false}
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
                onUpdateReply={handleUpdateReply}
              />
            </div>

            {/* Render nested replies within the same card */}
            {hasChildren && !isCollapsed && reply.children !== undefined && (
              <div>
                {reply.children
                  .filter(
                    (childReply) =>
                      !childReply.deleted || childReply.children?.length
                  )
                  .map((childReply) => (
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
                          onUpdateReply={handleUpdateReply}
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
            className="rounded-t-none"
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
          onUpdateReply={handleUpdateReply}
        />
      </div>

      {/* Reply form for nested reply */}
      {user && isReplyingToThis && (
        <div style={indentStyle}>
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
                onUpdateReply={handleUpdateReply}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReplyComponent;
