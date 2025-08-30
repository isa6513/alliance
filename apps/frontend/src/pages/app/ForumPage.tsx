import React, { useCallback } from "react";
import { useNavigate } from "react-router";
import { useAppLoaderData } from "../../applayout";
import ForumListPost from "../../components/ForumListPost";
import { useAuth } from "../../lib/AuthContext";

const ForumPage: React.FC = () => {
  const { posts } = useAppLoaderData();

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCreatePost = useCallback(() => {
    navigate("/forum/edit/new");
  }, [navigate]);

  const sorted = posts.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  return (
    <div className="flex flex-col max-w-4xl mx-auto p-3 pt-16 md:pt-12">
      <div className="gap-y-2 flex flex-col">
        {isAuthenticated && (
          <div
            onClick={handleCreatePost}
            className="text-gray-500 hover:bg-zinc-100 p-4 rounded-md flex cursor-pointer flex-col border border-zinc-200"
          >
            Create a new thread...
          </div>
        )}
        {sorted.map((post) => (
          <ForumListPost key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default ForumPage;
