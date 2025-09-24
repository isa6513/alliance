import { UserCommentDto } from "@alliance/shared/client";
import { Link, useNavigate } from "react-router";
import EditableContentRenderer from "./forum/EditableContentRenderer";
import ProfileImage from "@alliance/shared/ui/ProfileImage";
import UserDisplayName from "./UserDisplayName";
import { formatTime } from "../lib/utils";

export interface ForumActivityCommentCardProps {
  comment: UserCommentDto;
}

const ForumActivityCommentCard = ({
  comment,
}: ForumActivityCommentCardProps) => {
  const url =
    comment.parentObjectType === "post"
      ? `/forum/post/${comment.parentObjectId}?replyId=${comment.id}`
      : comment.parentObjectType === "action"
      ? `/actions/${comment.parentObjectId}?replyId=${comment.id}`
      : null;

  const navigate = useNavigate();

  if (!url) {
    return null;
  }

  return (
    <Link
      to={url}
      className="w-full mb-0 p-4 hover:bg-zinc-50 bg-white space-y-2"
    >
      <EditableContentRenderer
        content={comment.editableContent}
        charLimit={140}
      />
      <div className="flex flex-row items-center gap-x-2 text-sm text-zinc-500">
        <ProfileImage pfp={comment.author.profilePicture} size="small" />
        <span>
          <UserDisplayName staff={comment.author.staff}>
            {comment.author.displayName}
          </UserDisplayName>{" "}
          {`commented ${formatTime(new Date(comment.createdAt), {
            addSuffix: true,
          })} in `}
          <span
            className="!text-green font-medium"
            onClick={() => {
              navigate(`/forum/post/${comment.parentObjectId}`);
            }}
          >
            {comment.parentTitle}
          </span>
        </span>
      </div>
    </Link>
  );
};

export default ForumActivityCommentCard;
