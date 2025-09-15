import React, { useCallback } from "react";
import { useNavigate } from "react-router";
import { useAppLoaderData } from "../../applayout";
import ForumListPost from "../../components/ForumListPost";
import { useGrayBackground } from "../../components/HtmlBackgroundManager";
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

  useGrayBackground();

  return (
    <div className="flex flex-col max-w-4xl mx-auto px-3 pt-16 md:pt-12">
      {isAuthenticated && (
        <div
          onClick={handleCreatePost}
          className="text-zinc-500 hover:bg-zinc-100 p-4 flex cursor-pointer flex-col border border-zinc-200 mb-3 rounded-sm"
        >
          Create a new thread...
        </div>
      )}
      <div className="flex flex-col divide-y divide-zinc-200 mb-10 border border-zinc-200 rounded overflow-hidden">
        {sorted.map((post) => (
          <ForumListPost key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default ForumPage;
