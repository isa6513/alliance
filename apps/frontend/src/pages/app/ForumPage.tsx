import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { PostDto } from "@alliance/shared/client";
import { useAuth } from "../../lib/AuthContext";
import { forumFindAllPosts } from "@alliance/shared/client";
import Button, { ButtonColor } from "../../components/system/Button";
import ForumListPost from "../../components/ForumListPost";
import TwoColumnSplit from "../../components/system/TwoColumnSplit";

const ForumPage: React.FC = () => {
  const [posts, setPosts] = useState<PostDto[]>([]);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await forumFindAllPosts();
        setPosts(response.data ?? []);
      } catch (err) {
        console.error("Error fetching forum posts:", err);
      }
    };

    fetchPosts();
  }, []);

  const handleCreatePost = () => {
    navigate("/forum/edit/new");
  };

  const handleViewPost = (postId: number) => {
    navigate(`/forum/post/${postId}`);
  };

  return (
    <TwoColumnSplit
      left={
        <div className="gap-y-2 flex flex-col p-3">
          {posts.map((post) => (
            <ForumListPost
              key={post.id}
              post={post}
              handleViewPost={handleViewPost}
            />
          ))}
        </div>
      }
      border={false}
      collapseRight={false}
      right={
        <div className="flex flex-col p-3 items-end w-fit">
          {isAuthenticated && (
            <Button onClick={handleCreatePost} color={ButtonColor.Blue}>
              New Thread
            </Button>
          )}
        </div>
      }
    />
  );
};

export default ForumPage;
