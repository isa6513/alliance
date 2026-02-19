import {
  CommentDto,
  CommentParentObject,
  communityGetMyCommunities,
  userListFriends,
} from "@alliance/shared/client";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Link, href } from "react-router";
import { useAuth } from "../lib/AuthContext";
import ReplyComponent from "./forum/ReplyComponent";
import ReplyForm from "./forum/ReplyForm";
import { CommentsProvider, useCommentTree } from "./forum/CommentsContext";

export type CommentFilter =
  | "all"
  | "mine"
  | "answered"
  | "unanswered"
  | "friends"
  | "groupMembers";

export interface CommentsProps {
  objectId: number;
  type: CommentParentObject;
  compact?: boolean;
  autofocus?: boolean;
  showForm?: boolean;
  initialComments?: CommentDto[];
  expertIds?: number[];
  expertLabel?: string;
  qaMode?: boolean;
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
  qaMode = false,
}: CommentsProps) => {
  const { user } = useAuth();
  const [commentFilter, setCommentFilter] = useState<CommentFilter>("all");

  const tree = useCommentTree(objectId, type, initialComments);
  const isPostComments = type === "post";
  const activeQaMode = isPostComments && qaMode;

  const { data: friendIds = [] } = useQuery({
    queryKey: ["userListFriends", user?.id],
    queryFn: () =>
      userListFriends({ path: { id: user!.id } }).then((res) =>
        (res.data ?? []).map((friend) => friend.id)
      ),
    enabled: !!user && type === "post",
  });

  const { data: groupMemberIds = [] } = useQuery({
    queryKey: ["communityGetMyCommunities"],
    queryFn: () =>
      communityGetMyCommunities().then((res) => {
        const ids = new Set<number>();
        for (const community of res.data ?? []) {
          for (const member of community.users ?? []) {
            ids.add(member.id);
          }
        }
        return Array.from(ids);
      }),
    enabled: !!user && type === "post",
  });

  const friendIdSet = useMemo(() => new Set(friendIds), [friendIds]);
  const groupMemberIdSet = useMemo(
    () => new Set(groupMemberIds),
    [groupMemberIds]
  );

  const topLevelComments = useMemo(
    () =>
      (tree.comments ?? []).filter(
        (comment) => !comment.deleted || comment.children?.length
      ),
    [tree.comments]
  );

  const hasMineComments = useMemo(
    () =>
      !!user &&
      topLevelComments.some((comment) => comment.author.id === user.id),
    [topLevelComments, user]
  );

  const filterOptions = useMemo(() => {
    const base = activeQaMode
      ? (["all", "answered", "unanswered"] as CommentFilter[])
      : (["all", "friends", "groupMembers"] as CommentFilter[]);
    if (hasMineComments) {
      base.splice(1, 0, "mine");
    }
    return base;
  }, [activeQaMode, hasMineComments]);

  useEffect(() => {
    if (!filterOptions.includes(commentFilter)) {
      setCommentFilter("all");
    }
  }, [filterOptions, commentFilter]);

  const commentFilterLabels: Record<CommentFilter, string> = {
    all: "All",
    mine: "Mine",
    answered: "Answered",
    unanswered: "Unanswered",
    friends: "Friends",
    groupMembers: "Group",
  };

  const matchesFilter = useMemo(
    () => (comment: CommentDto, filter: CommentFilter) => {
      if (filter === "all") {
        return true;
      }

      if (filter === "mine") {
        return !!user && comment.author.id === user.id;
      }

      if (activeQaMode && (filter === "answered" || filter === "unanswered")) {
        const isAnswered = hasExpertReply(comment, expertIds);
        return filter === "answered" ? isAnswered : !isAnswered;
      }

      if (
        !activeQaMode &&
        (filter === "friends" || filter === "groupMembers")
      ) {
        if (!user) {
          return false;
        }

        if (comment.author.id === user.id) {
          return true;
        }

        if (filter === "friends") {
          return friendIdSet.has(comment.author.id);
        }

        return groupMemberIdSet.has(comment.author.id);
      }

      return true;
    },
    [activeQaMode, expertIds, user, friendIdSet, groupMemberIdSet]
  );

  const commentCounts = useMemo(() => {
    const counts = {} as Record<CommentFilter, number>;
    for (const filter of filterOptions) {
      counts[filter] = topLevelComments.filter((comment) =>
        matchesFilter(comment, filter)
      ).length;
    }
    return counts;
  }, [filterOptions, topLevelComments, matchesFilter]);

  const filteredComments = useMemo(() => {
    return topLevelComments
      .filter((comment) => matchesFilter(comment, commentFilter))
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
  }, [topLevelComments, commentFilter, matchesFilter]);

  const ctxValue = {
    user,
    replyingTo: tree.replyingTo,
    setReplyingTo: tree.setReplyingTo,
    handleSubmitReply: tree.handleSubmitReply,
    handleDeleteReply: tree.handleDeleteReply,
    onUpdateReply: tree.handleUpdateReply,
    onLikeReply: tree.handleLikeReply,
    onPinReply: tree.handlePinReply,
    isSubmitting: tree.isSubmitting,
    newlyAddedReplies: tree.newlyAddedReplies,
    highlightedReplyId: tree.highlightedReplyId,
    expertIds,
    expertLabel,
    compact,
  };

  return (
    <CommentsProvider value={ctxValue}>
      <div className="px-2 md:px-4">
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
        {isPostComments && topLevelComments.length > 0 && (
          <div className="flex items-center gap-3 mt-3 mb-2">
            <span className="text-sm font-medium text-zinc-700">
              {activeQaMode ? "Q&A mode" : "Comments"}
            </span>
            <div className="flex gap-1 bg-zinc-100 p-px rounded">
              {filterOptions.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setCommentFilter(filter)}
                  className={`px-3 py-1 text-sm rounded border border-transparent ${
                    commentFilter === filter
                      ? "bg-white border-zinc-300 text-black"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  {commentFilterLabels[filter]} ({commentCounts[filter] ?? 0})
                </button>
              ))}
            </div>
          </div>
        )}
        {tree.error && <div className="text-red-500">{tree.error}</div>}
        {topLevelComments.length > 0 ? (
          <div className="mt-3">
            {filteredComments.map((reply) => (
              <ReplyComponent key={reply.id} reply={reply} />
            ))}
          </div>
        ) : null}
      </div>
    </CommentsProvider>
  );
};

export default Comments;
