import useHomeFeed, { getForumComment } from "@alliance/shared/lib/useHomeFeed";
import Spinner from "@alliance/sharedweb/ui/Spinner";
import { useCallback, useRef } from "react";
import ForumCommentCard from "./ForumCommentCard";
import UserActivityCard from "./UserActivityCard";

const LIMIT = 5;

const HomeFeed = () => {
  const {
    items,
    handleLikeActivity,
    handleLikeForumComment,
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
            case "activity": {
              if (!item.activity) return null;
              return (
                <UserActivityCard
                  activity={item.activity}
                  key={`activity-${item.activity.id}`}
                  handleLike={() => handleLike(item.activity!.id)}
                />
              );
            }
            case "cluster_forum_comment":
            // @ts-expect-error: TODO(forum-comment-rename): drop the legacy 'cluster_forum_comment'
            case "forum_comment": {
              const fc = getForumComment(item);
              if (!fc) return null;
              return (
                <ForumCommentCard
                  key={`comment-${fc.comment.id}`}
                  comment={fc.comment}
                  postId={fc.postId}
                  postTitle={fc.postTitle}
                  likedByMe={fc.likedByMe}
                  likesCount={fc.likesCount}
                  handleLike={() => handleLikeForumComment(fc.comment.id)}
                />
              );
            }
            default: {
              // Drop unknown variants so older clients don't crash on new server types.
              item.type satisfies never;
              return null;
            }
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
