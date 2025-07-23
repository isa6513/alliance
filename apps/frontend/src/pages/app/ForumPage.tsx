import React from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../lib/AuthContext";
import Button, { ButtonColor } from "../../components/system/Button";
import ForumListPost from "../../components/ForumListPost";
import TwoColumnSplit from "../../components/system/TwoColumnSplit";
import { useAppLoaderData } from "../../applayout";

const ForumPage: React.FC = () => {
  const { posts } = useAppLoaderData();

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCreatePost = () => {
    navigate("/forum/edit/new");
  };

  return (
    <TwoColumnSplit
      left={
        <div className="gap-y-2 flex flex-col p-3">
          {posts.map((post) => (
            <ForumListPost key={post.id} post={post} />
          ))}
        </div>
      }
      border={false}
      collapseRight={false}
      right={
        <div className="flex flex-col p-3 items-end w-fit">
          {isAuthenticated && (
            <Button onClick={handleCreatePost} color={ButtonColor.Black}>
              New Thread
            </Button>
          )}
        </div>
      }
    />
  );
};

export default ForumPage;
