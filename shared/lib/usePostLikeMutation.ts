import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  forumLikePost,
  forumUnlikePost,
  ProfileDto,
} from "@alliance/shared/client";

interface PostLike {
  likes?: ProfileDto[];
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
        likes: isLiked
          ? (prev.likes ?? []).filter((l) => l.id !== userId)
          : [...(prev.likes ?? []), { id: userId } as ProfileDto],
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
    const isLiked = post.likes?.some((like) => like.id === userId) ?? false;
    await mutation.mutateAsync(isLiked);
  }, [getPost, userId, mutation]);

  return handleLike;
}
