import { CommentDto } from "@alliance/shared/client";
import { formatTime } from "@alliance/shared/lib/utils";
import { AvatarProfile } from "@alliance/sharedweb/ui/Avatar";
import Button, { ButtonColor } from "@alliance/sharedweb/ui/Button";
import EditableContentRenderer from "@alliance/sharedweb/ui/EditableContentRenderer";
import { useCallback } from "react";
import { Link, href, useNavigate } from "react-router";
import ActivityLikeButton from "./ActivityLikeButton";

interface ClusterForumCommentCardProps {
  comment: CommentDto;
  postId: number;
  postTitle: string;
  likedByMe: boolean;
  likesCount: number;
  handleLike: () => Promise<unknown>;
}

const ClusterForumCommentCard = ({
  comment,
  postId,
  postTitle,
  likedByMe,
  likesCount,
  handleLike,
}: ClusterForumCommentCardProps) => {
  const navigate = useNavigate();

  const postUrlWithReply = `${href("/forum/post/:id", { id: postId.toString() })}?replyId=${comment.id}`;

  const handleCardClick = useCallback(() => {
    navigate(postUrlWithReply);
  }, [navigate, postUrlWithReply]);

  const handleReplyClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      navigate(postUrlWithReply);
    },
    [navigate, postUrlWithReply],
  );

  const timeSinceCommented = formatTime(new Date(comment.createdAt), {
    addSuffix: true,
  });

  const hasBody =
    !!comment.editableContent.body ||
    comment.editableContent.attachments.length > 0;

  return (
    <div className="flex flex-col bg-white">
      <div
        className="block p-4 -m-4 text-[11pt] transition-colors duration-100 flex-1 gap-y-2 bg-white hover:bg-grey-1 cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="flex flex-wrap items-center">
          <Link
            to={href("/member/:id", { id: comment.author.id.toString() })}
            className="inline-flex items-center text-zinc-900 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <AvatarProfile
              pfp={comment.author.profilePicture}
              size="small"
              className="mr-2 shrink-0"
            />
            <span>{comment.author.displayName}</span>
          </Link>
          <span className="whitespace-pre text-zinc-900">{` commented on `}</span>
          <Link
            to={href("/forum/post/:id", { id: postId.toString() })}
            className="text-green hover:underline font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            {postTitle}
          </Link>
        </div>
        <div>
          {hasBody && (
            <div className="my-3 rounded bg-grey-0 p-4">
              <EditableContentRenderer content={comment.editableContent} />
            </div>
          )}
          <div className="flex flex-row justify-between w-full items-end">
            <p className="text-zinc-500">{timeSinceCommented}</p>
            <div className="flex items-center space-x-2 self-end mt-2">
              <ActivityLikeButton
                liked={likedByMe}
                likes={likesCount}
                handleLike={handleLike}
                backgroundColor="white"
              />
              <Button
                onClick={handleReplyClick}
                color={ButtonColor.White}
                className="flex flex-row gap-x-1 items-center !px-3 !py-[6px] !h-full"
              >
                <span className="text-sm text-zinc-800 text-nowrap">Reply</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClusterForumCommentCard;
