import {
  CommentDto,
  CommentParentObject,
  CreateCommentDto,
  forumCreateComment,
  forumDeleteComment,
  forumFindCommentsForAction,
  forumFindCommentsForActivity,
  forumFindCommentsForPost,
} from "@alliance/shared/client";
import ReplyComponent from "./forum/ReplyComponent";
import ReplyForm from "./forum/ReplyForm";
import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useAuth } from "../lib/AuthContext";

export interface CommentsProps {
  objectId: number;
  type: CommentParentObject;
  compact?: boolean;
}

const Comments = ({ objectId, type, compact }: CommentsProps) => {
  const [replyContent, setReplyContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newlyAddedReplies, setNewlyAddedReplies] = useState<Set<number>>(
    new Set()
  );
  const [highlightedReplyId, setHighlightedReplyId] = useState<number | null>(
    null
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [comments, setComments] = useState<CommentDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    let response;
    if (type === "post") {
      response = await forumFindCommentsForPost({
        path: { id: objectId.toString() },
      });
    } else if (type === "activity") {
      response = await forumFindCommentsForActivity({
        path: { id: objectId.toString() },
      });
    } else {
      response = await forumFindCommentsForAction({
        path: { id: objectId.toString() },
      });
    }
    setComments(response.data ?? null);
  }, [objectId, type]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Handle highlighted reply from URL parameters
  useEffect(() => {
    const replyId = searchParams.get("replyId");
    if (replyId) {
      const replyIdNumber = parseInt(replyId, 10);
      if (!isNaN(replyIdNumber)) {
        setHighlightedReplyId(replyIdNumber);

        // Remove the replyId parameter from URL immediately to prevent re-highlighting
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete("replyId");
        setSearchParams(newSearchParams, { replace: true });

        // Scroll to the reply after a short delay to ensure it's rendered
        setTimeout(() => {
          const replyElement = document.getElementById(
            `reply-${replyIdNumber}`
          );
          if (replyElement) {
            replyElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }, 500);

        setTimeout(() => {
          setHighlightedReplyId(null);
        }, 5000);
      }
    }
  }, [searchParams, setSearchParams]);

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      const commentDto: CreateCommentDto = {
        content: replyContent,
        parentObjectId: Number(objectId),
        parentId: replyingTo ?? undefined,
        parentObjectType: type,
      };

      const response = await forumCreateComment({
        body: commentDto,
      });

      if (response.data) {
        const newReplyId = response.data.id;

        setNewlyAddedReplies((prev) => new Set(prev).add(newReplyId));

        setTimeout(() => {
          setNewlyAddedReplies((prev) => {
            const newSet = new Set(prev);
            newSet.delete(newReplyId);
            return newSet;
          });
        }, 3000);

        fetchComments();
      }

      setReplyContent("");
      setReplyingTo(null);
      setError(null);
    } catch (err) {
      console.error("Error posting reply:", err);
      setError("Failed to submit reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReply = async (replyId: number) => {
    if (window.confirm("Are you sure you want to delete this reply?")) {
      try {
        await forumDeleteComment({
          path: { id: replyId.toString() },
        });

        // Refresh the post to get updated reply hierarchy
        fetchComments();
      } catch (err) {
        console.error("Error deleting reply:", err);
        setError("Failed to delete reply");
      }
    }
  };

  return (
    <div>
      {error && <div className="text-red-500">{error}</div>}
      {comments && comments.length > 0 ? (
        <div className="space-y-3 mb-8">
          {compact && comments.length > 0 && (
            <p className="font-medium">Comments</p>
          )}
          {comments
            .filter((comment) => !comment.deleted || comment.children?.length)
            .map((reply) => (
              <ReplyComponent
                key={reply.id}
                reply={reply}
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
                compact={compact}
              />
            ))}
        </div>
      ) : null}

      {user && !replyingTo ? (
        <ReplyForm
          parentId={null}
          replyContent={replyContent}
          setReplyContent={setReplyContent}
          onSubmit={handleSubmitReply}
          isSubmitting={isSubmitting}
          setReplyingTo={setReplyingTo}
          compact={compact}
        />
      ) : !user ? (
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <p className="text-gray-600">
            Please{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              log in
            </Link>{" "}
            to post a reply.
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default Comments;
