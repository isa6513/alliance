import useHomeFeed from "@alliance/shared/lib/useHomeFeed";
import Spinner from "@alliance/sharedweb/ui/Spinner";
import { useCallback, useRef } from "react";
import ClusterForumCommentCard from "./ClusterForumCommentCard";
import UserActivityCard from "./UserActivityCard";

const LIMIT = 5;

const HomeFeed = () => {
  const {
    items,
    handleLikeActivity,
    handleLikeClusterForumComment,
    loading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useHomeFeed({
    comments: true,
    limit: LIMIT,
  });

  const observerRef = useRef<IntersectionObserver | null>(null);

  const paginationRef = useRef({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  });
  paginationRef.current = {
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };

  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    if (!node) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const p = paginationRef.current;
        for (const entry of entries) {
          if (entry.isIntersecting && p.hasNextPage && !p.isFetchingNextPage) {
            p.fetchNextPage();
          }
        }
      },
      { rootMargin: "200px" },
    );
    observerRef.current.observe(node);
  }, []);

  const handleLike = useCallback(
    (activityId: number) => {
      return handleLikeActivity(activityId);
    },
    [handleLikeActivity],
  );

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="medium" />
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col">
      <p className="text-title font-serif mb-4">Activity</p>
      <div className="flex flex-col gap-y-2 *:p-4">
        {items.map((item) => {
          switch (item.type) {
            case "activity":
              if (!item.activity) return null;
              return (
                <UserActivityCard
                  activity={item.activity}
                  key={`activity-${item.activity.id}`}
                  handleLike={() => handleLike(item.activity!.id)}
                />
              );
            case "cluster_forum_comment":
              if (!item.clusterForumComment) return null;
              return (
                <ClusterForumCommentCard
                  key={`comment-${item.clusterForumComment.comment.id}`}
                  comment={item.clusterForumComment.comment}
                  postId={item.clusterForumComment.postId}
                  postTitle={item.clusterForumComment.postTitle}
                  likedByMe={item.clusterForumComment.likedByMe}
                  likesCount={item.clusterForumComment.likesCount}
                  handleLike={() =>
                    handleLikeClusterForumComment(
                      item.clusterForumComment!.comment.id,
                    )
                  }
                />
              );
            default:
              throw new Error(
                `unknown home feed item type: ${item.type satisfies never}`,
              );
          }
        })}
      </div>
      {isFetchingNextPage && (
        <div className="flex justify-center py-4 text-zinc-400">
          Loading more...
        </div>
      )}
      <div ref={sentinelRef} className="h-1" />
    </div>
  );
};

export default HomeFeed;
