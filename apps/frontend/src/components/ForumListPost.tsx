import Card, { CardStyle } from "./system/Card";
import { PostDto } from "@alliance/shared/client";
import { useNavigate } from "react-router";
import { formatTime } from "../lib/utils";
import ProfileImage from "./ProfileImage";
import PinnedIcon from "./PinnedIcon";

export interface ForumListPostProps {
  post: PostDto;
  showAction?: boolean;
}

const ForumListPost = ({ post, showAction = true }: ForumListPostProps) => {
  const navigate = useNavigate();

  const authorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/user/${post.author?.id}`);
  };

  const actionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/actions/${post.action?.id}`);
  };

  return (
    <Card
      key={post.id}
      className={`w-full mb-0 !gap-y-1`}
      onClick={() => navigate(`/forum/post/${post.id}`)}
      style={CardStyle.White}
    >
      <div className="flex flex-row justify-between gap-2">
        <p className="font-medium text-base">{post.title}</p>
        {post.pinned && <PinnedIcon size="small" />}
      </div>
      <div className="flex justify-between text-sm text-gray-500">
        <div className="flex flex-row gap-x-2 items-center">
          <ProfileImage pfp={post.author.profilePicture} size="small" />
          <p onClick={authorClick} className="hover:underline">
            {post.author.displayName}
          </p>
          {post.action?.name !== undefined && showAction && (
            <a
              onClick={actionClick}
              className="inline-block bg-green-1/20 text-green hover:bg-green-1/40 px-3 py-1 rounded-lg text-sm"
            >
              {post.action.name}
            </a>
          )}
        </div>
        <div className="flex space-x-3">
          {post.commentCount !== undefined && (
            <span>{post.commentCount} replies</span>
          )}
          <span>
            {formatTime(new Date(post.updatedAt), {
              addSuffix: true,
            })}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default ForumListPost;
