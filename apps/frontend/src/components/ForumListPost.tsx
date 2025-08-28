import {
  CommentDto,
  forumFindLastCommentForPost,
  PostDto,
} from "@alliance/shared/client";
import Card, { CardStyle } from "@alliance/shared/ui/Card";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { formatTime } from "../lib/utils";
import ActivityFeedItem from "./ActivityFeedItem";
import PinnedIcon from "./icons/PinnedIcon";
import ProfileImage from "./ProfileImage";
import UserDisplayName from "./UserDisplayName";

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

  const [lastComment, setLastComment] = useState<CommentDto | undefined>(
    undefined
  );

  useEffect(() => {
    forumFindLastCommentForPost({
      path: { id: post.id },
    }).then((res) => {
      if (res.data && res.data.author) {
        setLastComment(res.data);
      }
    });
  }, [post.id]);

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
          <div className="flex flex-row gap-x-1.5 items-center">
            <ProfileImage pfp={post.author.profilePicture} size="small" />
            <p>
              <span onClick={authorClick}>
                <UserDisplayName staff={post.author.staff}>
                  {post.author.displayName}
                </UserDisplayName>
                {` posted ${formatTime(new Date(post.createdAt), {
                  addSuffix: true,
                })}`}
              </span>
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

          {lastComment && (
            <div className="flex items-center gap-x-1">
              <ProfileImage pfp={post.author.profilePicture} size="mini" />
              <span onClick={authorClick}>
                <UserDisplayName
                  staff={
                    lastComment ? lastComment.author.staff : post.author.staff
                  }
                >
                  {lastComment.author.displayName}
                </UserDisplayName>
                {` replied ${formatTime(new Date(lastComment.createdAt), {
                  addSuffix: true,
                })}`}
              </span>
            </div>
          )}
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
          content={`${lastComment ? "replied" : "posted"} ${formatTime(
            new Date(post.updatedAt),
            {
              addSuffix: true,
            }
          )}`}
          user={lastComment ? lastComment.author : post.author}
        />
      </div>
    );
  }
};

export default ForumListPost;
