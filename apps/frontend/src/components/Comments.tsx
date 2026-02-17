import {
  CommentDto,
  CommentParentObject,
} from "@alliance/shared/client";
import { Link, href } from "react-router";
import { useAuth } from "../lib/AuthContext";
import ReplyComponent from "./forum/ReplyComponent";
import ReplyForm from "./forum/ReplyForm";
import { CommentsProvider, useCommentTree } from "./forum/CommentsContext";

type CommentFilter = "all" | "answered" | "unanswered";

export interface CommentsProps {
  objectId: number;
  type: CommentParentObject;
  compact?: boolean;
  autofocus?: boolean;
  showForm?: boolean;
  initialComments?: CommentDto[];
  expertIds?: number[];
  expertLabel?: string;
  commentFilter?: CommentFilter;
}

const hasExpertReply = (comment: CommentDto, expertIds: number[]): boolean => {
  if (expertIds.includes(comment.author.id)) {
    return true;
  }
  if (comment.children) {
    return comment.children.some((child) => hasExpertReply(child, expertIds));
  }
  return false;
};

const Comments = ({
  objectId,
  type,
  compact,
  autofocus,
  showForm = true,
  initialComments,
  expertIds = [],
  expertLabel,
  commentFilter = "all",
}: CommentsProps) => {
  const { user } = useAuth();

  const tree = useCommentTree(objectId, type, initialComments);

  const ctxValue = {
    user,
    replyingTo: tree.replyingTo,
    setReplyingTo: tree.setReplyingTo,
    handleSubmitReply: tree.handleSubmitReply,
    handleDeleteReply: tree.handleDeleteReply,
    onUpdateReply: tree.handleUpdateReply,
    onLikeReply: tree.handleLikeReply,
    isSubmitting: tree.isSubmitting,
    newlyAddedReplies: tree.newlyAddedReplies,
    highlightedReplyId: tree.highlightedReplyId,
    expertIds,
    expertLabel,
    compact,
  };

  return (
    <CommentsProvider value={ctxValue}>
      <div>
        {user && !tree.replyingTo && showForm ? (
          <ReplyForm
            parentId={null}
            editableContent={tree.editableContent}
            setEditableContent={tree.setEditableContent}
            onSubmit={tree.handleSubmitReply}
            isSubmitting={tree.isSubmitting}
            setReplyingTo={tree.setReplyingTo}
            compact={compact}
            startExpanded={autofocus}
          />
        ) : !user && !compact ? (
          <div className="text-center py-6 bg-zinc-50 rounded border border-zinc-200">
            <p className="text-zinc-600">
              Please{" "}
              <Link to={href("/login")} className="text-green hover:underline">
                log in
              </Link>{" "}
              to post a reply.
            </p>
          </div>
        ) : null}
        {tree.error && <div className="text-red-500">{tree.error}</div>}
        {tree.comments && tree.comments.length > 0 ? (
          <div className="space-y-2 mt-3">
            {tree.comments
              .filter(
                (comment) => !comment.deleted || comment.children?.length
              )
              .filter((comment) => {
                if (commentFilter === "all") return true;
                const isAnswered = hasExpertReply(comment, expertIds);
                return commentFilter === "answered" ? isAnswered : !isAnswered;
              })
              .sort((a, b) => {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                return dateB - dateA;
              })
              .map((reply) => (
                <ReplyComponent key={reply.id} reply={reply} />
              ))}
          </div>
        ) : null}
      </div>
    </CommentsProvider>
  );
};

export default Comments;
