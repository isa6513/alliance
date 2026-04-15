import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  CommentDto,
  ProfileDto,
  forumLikeComment,
  forumUnlikeComment,
} from "@alliance/shared/client";

interface UseCommentLikeMutationOptions {
  userId: number | undefined;
  setComments: (fn: (prev: CommentDto[] | null) => CommentDto[] | null) => void;
  fetchComments: () => void;
}

export function useCommentLikeMutation({
  userId,
  setComments,
  fetchComments,
}: UseCommentLikeMutationOptions) {
  const mutation = useMutation({
    mutationFn: async ({
      replyId,
      unlike,
    }: {
      replyId: number;
      unlike: boolean;
    }) => {
      if (unlike) {
        await forumUnlikeComment({ path: { id: replyId } });
      } else {
        await forumLikeComment({ path: { id: replyId } });
      }
    },
    onMutate: ({ replyId, unlike }) => {
      if (!userId) return;

      const updateRecursively = (items: CommentDto[]): CommentDto[] =>
        items.map((item) => {
          if (item.id === replyId) {
            return {
              ...item,
              likes: unlike
                ? item.likes.filter((l) => l.id !== userId)
                : [...item.likes, { id: userId } as ProfileDto],
            };
          }
          if (item.children?.length) {
            return { ...item, children: updateRecursively(item.children) };
          }
          return item;
        });

      let previousComments: CommentDto[] | null = null;
      setComments((prev) => {
        previousComments = prev;
        return prev ? updateRecursively(prev) : prev;
      });
      return { previousComments };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousComments)
        setComments(() => context.previousComments);
    },
    onSettled: () => {
      fetchComments();
    },
  });

  const handleLikeReply = useCallback(
    (replyId: number, unlike = false) => {
      return mutation.mutateAsync({ replyId, unlike });
    },
    [mutation],
  );

  return handleLikeReply;
}
