import { PostDto } from "@alliance/shared/client";
import Card, { CardStyle } from "@alliance/shared/ui/Card";
import { useNavigate } from "react-router";
import { formatTime } from "../lib/utils";
import ActivityFeedItem from "./ActivityFeedItem";
import ProfileImage from "./ProfileImage";
import PinnedIcon from "./icons/PinnedIcon";

export interface ForumListPostProps {
  post: PostDto;
  card?: boolean;
  showAction?: boolean;
}

const ForumListPost = ({
  post,
  card = true,
  showAction = true,
}: ForumListPostProps) => {
  const navigate = useNavigate();

  const authorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/user/${post.author?.id}`);
  };

  const actionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/actions/${post.action?.id}`);
  };

  if (card) {
    return (
      <Card
        key={post.id}
        className={`w-full mb-0 !gap-y-1`}
        onClick={() => navigate(`/forum/post/${post.id}`)}
        style={CardStyle.White}
      >
        <div className="flex flex-row gap-1">
          {post.pinned && <PinnedIcon size="small" />}
          <p className="font-medium text-base">{post.title}</p>
        </div>
        <div className="flex justify-between items-end text-sm text-gray-500">
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
            <span>
              {formatTime(new Date(post.updatedAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>
      </Card>
    );
  } else {
    return (
      <div
        key={post.id}
        className="flex items-start space-x-3 rounded-md border-gray-200 cursor-pointer"
        onClick={() => {
          navigate(`/forum/post/${post.id}`);
        }}
      >
        <ActivityFeedItem
          title={post.title}
          content={`posted ${formatTime(new Date(post.updatedAt), {
            addSuffix: true,
          })}`}
          user={post.author}
        />
      </div>
    );
  }
};

export default ForumListPost;
