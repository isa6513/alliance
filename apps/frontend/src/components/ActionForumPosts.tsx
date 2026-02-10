import { forumFindPostsByAction } from "@alliance/shared/client";
import Button from "@alliance/sharedweb/ui/Button";
import React from "react";
import { Link, href, useNavigate } from "react-router";
import { useAuth } from "../lib/AuthContext";
import ForumListPost from "./ForumListPost";
import { useQuery } from "@tanstack/react-query";

interface ActionForumPostsProps {
  actionId: number;
}

const ActionForumPosts: React.FC<ActionForumPostsProps> = ({
  actionId,
}: ActionForumPostsProps) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const { data: posts = [], error: queryError } = useQuery({
    queryKey: ["forumFindPostsByAction", actionId],
    queryFn: () => forumFindPostsByAction({ path: { actionId: actionId.toString() } }).then(res => res.data ?? []),
    enabled: !!actionId,
  });

  const error = queryError ? "Failed to load discussion posts" : null;

  const handleCreatePost = () => {
    navigate(
      `${href("/forum/edit/:postId", { postId: "new" })}?actionId=${actionId}`
    );
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
                to={`${href("/forum")}?actionId=${actionId}`}
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
