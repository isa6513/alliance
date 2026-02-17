import { CommentDto } from "@alliance/shared/client";
import Card from "@alliance/sharedweb/ui/Card";
import { CardStyle } from "@alliance/shared/styles/card";
import PinnedIcon from "@alliance/sharedweb/ui/icons/PinnedIcon";
import ProfileImage from "@alliance/sharedweb/ui/ProfileImage";
import { formatDistanceToNow } from "date-fns";
import React, { useState } from "react";
import CommentLikeButton from "../CommentLikeButton";
import UserDisplayName from "@alliance/sharedweb/ui/UserDisplayName";
import EditableContentForm from "@alliance/sharedweb/ui/EditableContentForm";
import EditableContentRenderer from "@alliance/sharedweb/ui/EditableContentRenderer";
import ReplyForm from "./ReplyForm";
import CommentActionsMenu from "./CommentActionsMenu";
import { useCommentsContext } from "./CommentsContext";
import { useCommentEditing } from "../../hooks/useCommentEditing";
import { Link, href } from "react-router";

const INDENT_PX = 24;

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

export interface ReplyComponentProps {
  reply: CommentDto;
  depth?: number;
}

interface ReplyContentProps {
  reply: CommentDto;
  canNest: boolean;
  isReplyingToThis: boolean;
  hasChildren: boolean;
  isCollapsed?: boolean;
  isHighlighted: boolean;
}

const ReplyContent: React.FC<ReplyContentProps> = ({
  reply,
  canNest,
  isReplyingToThis,
  hasChildren,
  isCollapsed = false,
  isHighlighted,
}) => {
  const ctx = useCommentsContext();
  const { user, compact = false, expertIds = [], expertLabel } = ctx;
  const isExpert = expertIds.includes(reply.author.id);
  const editing = useCommentEditing(reply, ctx.onUpdateReply);

  return (
    <div className={`flex ${compact ? "gap-x-2" : "gap-x-2.5"} relative`}>
      {isHighlighted && (
        <div className="absolute -left-4 top-0 bottom-0 w-[3px] bg-blue-500 rounded transition-all duration-1000" />
      )}

      <div className="flex-shrink-0">
        <Link to={href("/member/:id", { id: reply.author.id.toString() })}>
          <div className="hidden sm:inline">
            <ProfileImage
              pfp={reply.author.profilePicture}
              size={compact ? "small" : "medium"}
            />
          </div>
          <div className="inline sm:hidden">
            <ProfileImage
              pfp={reply.author.profilePicture}
              size={compact ? "mini" : "small"}
            />
          </div>
        </Link>
      </div>

      <div className="flex-1">
        <div className="flex justify-between items-center overflow-visible">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
            <Link
              to={href("/member/:id", { id: reply.author.id.toString() })}
              className="text-zinc-800 font-medium"
            >
              <UserDisplayName
                staff={reply.author.staff}
                expert={isExpert}
                expertLabel={expertLabel}
              >
                {reply.author.displayName}
              </UserDisplayName>
            </Link>
            <span className="text-zinc-500 text-xs sm:text-sm">
              {formatDistanceToNow(new Date(reply.createdAt), {
                addSuffix: true,
              })}
            </span>
            {hasChildren && isCollapsed && reply.children !== undefined && (
              <span className="text-xs bg-zinc-200 px-2 py-1 -my-1 rounded">
                {countAllReplies(reply.children)}{" "}
                {countAllReplies(reply.children) === 1 ? "reply" : "replies"}{" "}
                hidden
              </span>
            )}
          </div>
          {reply.pinned && <PinnedIcon size="small" />}
        </div>

        <div className="text-sm sm:text-base mb-1">
          {!editing.isEditing && (
            <EditableContentRenderer
              content={reply.editableContent}
              collapsed={isCollapsed}
              deleted={reply.deleted}
            />
          )}
        </div>

        {editing.isEditing ? (
          <div className="rounded p-3 bg-zinc-100">
            <EditableContentForm
              value={{
                body: editing.editContent,
                attachments: editing.editAttachments,
              }}
              onChange={(val) => {
                editing.setEditContent(val.body);
                editing.setEditAttachments(val.attachments);
              }}
              placeholder="Edit your reply..."
            />
            <div className="flex gap-2 mt-2 justify-end items-center">
              <span className="text-sm text-zinc-500">
                Drag an image to attach
              </span>
              <button
                onClick={editing.saveEdit}
                disabled={editing.isUpdating || !editing.editContent.trim()}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editing.isUpdating ? "Saving..." : "Save"}
              </button>
              <button
                onClick={editing.cancelEdit}
                disabled={editing.isUpdating}
                className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-1.5 sm:gap-3">
              <CommentLikeButton
                liked={reply.likes.some((like) => like.id === user?.id)}
                likes={reply.likes.length}
                handleLike={() =>
                  ctx.onLikeReply(
                    reply.id,
                    reply.likes.some((like) => like.id === user?.id)
                  )
                }
              />
              {user && canNest && (
                <button
                  onClick={() => {
                    ctx.setReplyingTo(isReplyingToThis ? null : reply.id);
                  }}
                  className="text-zinc-500 hover:text-zinc-700 hover:underline text-xs sm:text-sm"
                >
                  {!isReplyingToThis && "Reply"}
                </button>
              )}
            </div>
            {!reply.deleted && (
              <CommentActionsMenu
                replyId={reply.id}
                isOwner={!!user && reply.author.id === user.id}
                onEdit={editing.startEdit}
                onDelete={ctx.handleDeleteReply}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const ReplyComponent = ({ reply, depth = 0 }: ReplyComponentProps) => {
  const ctx = useCommentsContext();
  const maxDepth = 10;
  const canNest = depth < maxDepth;
  const isReplyingToThis = ctx.replyingTo === reply.id;
  const hasChildren = reply.children ? reply.children.length > 0 : false;
  const isNewlyAdded = ctx.newlyAddedReplies.has(reply.id);
  const isHighlighted = ctx.highlightedReplyId === reply.id;
  const isTopLevel = depth === 0;

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [nestedDraft, setNestedDraft] = useState<{
    body: string;
    attachments: string[];
  }>({ body: "", attachments: [] });

  const newReplyClass = isNewlyAdded ? "!bg-green/10" : "";

  const filteredChildren = (reply.children ?? []).filter(
    (child) => !child.deleted || child.children?.length
  );

  const renderChildren = () => {
    if (!hasChildren || (isTopLevel && isCollapsed)) return null;
    if (reply.children === undefined) return null;

    return (
      <div>
        {filteredChildren.map((childReply) => (
          <div key={childReply.id}>
            <div
              className={`${
                ctx.compact ? "my-3" : "border-t border-zinc-200 my-3 sm:my-4"
              } -mx-2 sm:-mx-4`}
            />
            <ReplyComponent reply={childReply} depth={depth + 1} />
          </div>
        ))}
      </div>
    );
  };

  const replyForm =
    ctx.user && isReplyingToThis && !(isTopLevel && isCollapsed) ? (
      <ReplyForm
        parentId={reply.id}
        onCancel={() => ctx.setReplyingTo(null)}
        editableContent={nestedDraft}
        setEditableContent={setNestedDraft}
        onSubmit={ctx.handleSubmitReply}
        isSubmitting={ctx.isSubmitting}
        className={isTopLevel ? "mt-3" : undefined}
        setReplyingTo={ctx.setReplyingTo}
        compact={ctx.compact}
        startExpanded={true}
      />
    ) : null;

  const replyContent = (
    <ReplyContent
      reply={reply}
      canNest={canNest}
      isReplyingToThis={isReplyingToThis}
      hasChildren={hasChildren}
      isCollapsed={isTopLevel ? isCollapsed : undefined}
      isHighlighted={isHighlighted}
    />
  );

  if (isTopLevel) {
    return (
      <div className="relative">
        {hasChildren && !ctx.compact && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`absolute top-6 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer ${
              ctx.compact ? "left-0" : "-left-6"
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

        <div className="border-transparent duration-1000 rounded">
          <Card
            key={reply.id}
            className={`!display-block transition-colors duration-1000 ${newReplyClass} ${
              ctx.compact ? "!p-1 !border-none" : "!p-2 sm:!p-4"
            } ${
              ctx.user && isReplyingToThis && !isCollapsed && "rounded-b-none"
            }`}
            flex={false}
            style={CardStyle.White}
          >
            <div id={`reply-${reply.id}`}>{replyContent}</div>
            {replyForm}
            {renderChildren()}
          </Card>
        </div>
      </div>
    );
  }

  const indent = depth * INDENT_PX;

  return (
    <div>
      <div
        className={`rounded border-transparent ${newReplyClass} duration-1000`}
        id={`reply-${reply.id}`}
        style={{ marginLeft: indent }}
      >
        {replyContent}
      </div>
      {replyForm && <div style={{ marginLeft: indent }}>{replyForm}</div>}
      {renderChildren()}
    </div>
  );
};

export default ReplyComponent;
