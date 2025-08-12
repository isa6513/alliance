import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { PostDto } from "@alliance/shared/client";
import { useAuth } from "../lib/AuthContext";
import Button from "./system/Button";
import { forumFindPostsByAction } from "@alliance/shared/client";
import ForumListPost from "./ForumListPost";

interface ActionForumPostsProps {
  actionId: number;
}

const ActionForumPosts: React.FC<ActionForumPostsProps> = ({
  actionId,
}: ActionForumPostsProps) => {
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActionPosts = async () => {
      if (!actionId) return;

      try {
        const response = await forumFindPostsByAction({
          path: { actionId: actionId.toString() },
        });
        setPosts(response.data ?? []);
        setError(null);
      } catch (err) {
        console.error("Error fetching action forum posts:", err);
        setError("Failed to load discussion posts");
      }
    };

    fetchActionPosts();
  }, [actionId]);

  const handleCreatePost = () => {
    navigate(`/forum/edit/new?actionId=${actionId}`);
  };

  if (error) {
    return <div className="text-red-500 text-sm py-2">{error}</div>;
  }

  return (
    <div className="space-y-4 my-4">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-xl">Discussion</h2>
        <div>
          {isAuthenticated && (
            <Button onClick={handleCreatePost}>
              {posts.length === 0 ? "Start Discussion" : "Create Post"}
            </Button>
          )}
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-5 text-gray-500">
          <p>No discussions yet for this action.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.slice(0, 3).map((post) => (
            <ForumListPost key={post.id} post={post} showAction={false} />
          ))}

          {posts.length > 3 && (
            <div className="text-center pt-2">
              <Link
                to={`/forum?actionId=${actionId}`}
                className="text-blue-600 hover:underline text-sm"
              >
                View all {posts.length} discussions
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActionForumPosts;
