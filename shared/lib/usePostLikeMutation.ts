import { forumLikePost, forumUnlikePost } from "@alliance/shared/client";
import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";

interface PostLike {
  likedByMe?: boolean;
  likeCount?: number;
}

interface UsePostLikeMutationOptions {
  postId: number;
  userId: number | undefined;
  getPost: () => PostLike | null | undefined;
  setPost: (updater: (prev: PostLike) => PostLike) => void;
  onSettled: () => void;
}

export function usePostLikeMutation({
  postId,
  userId,
  getPost,
  setPost,
  onSettled,
}: UsePostLikeMutationOptions) {
  const mutation = useMutation({
    mutationFn: async (isLiked: boolean) => {
      if (isLiked) {
        await forumUnlikePost({ path: { id: postId } });
      } else {
        await forumLikePost({ path: { id: postId } });
      }
    },
    onMutate: (isLiked: boolean) => {
      const post = getPost();
      if (!post || !userId) return;
      setPost((prev) => ({
        ...prev,
        likedByMe: !isLiked,
        likeCount: Math.max(0, (prev.likeCount ?? 0) + (isLiked ? -1 : 1)),
      }));
      return { previousPost: post };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousPost)
        setPost(() => context.previousPost as PostLike);
    },
    onSettled,
  });

  const handleLike = useCallback(async () => {
    const post = getPost();
    if (!post || !userId) return;
    const isLiked = post.likedByMe ?? false;
    await mutation.mutateAsync(isLiked);
  }, [getPost, userId, mutation]);

  return handleLike;
}
