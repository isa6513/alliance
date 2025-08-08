import Card, { CardStyle } from "./system/Card";
import { PostDto } from "@alliance/shared/client";
import { useNavigate } from "react-router";
import { formatTime } from "../lib/utils";

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
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <div className="flex flex-row gap-x-2">
          <p onClick={authorClick} className="hover:underline">
            {post.author?.displayName || "Unknown user"}
          </p>
          {post.action?.name !== undefined && showAction && (
            <a onClick={actionClick} className="text-blue ml-1 hover:underline">
              {post.action.name}
            </a>
          )}
        </div>
        <div className="flex space-x-3">
          {post.replyCount !== undefined && (
            <span>{post.replyCount} replies</span>
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
