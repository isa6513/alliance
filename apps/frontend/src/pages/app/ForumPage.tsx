import React from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../lib/AuthContext";
import ForumListPost from "../../components/ForumListPost";
import { useAppLoaderData } from "../../applayout";

const ForumPage: React.FC = () => {
  const { posts } = useAppLoaderData();

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCreatePost = () => {
    navigate("/forum/edit/new");
  };

  console.log(posts);

  return (
    <div className="flex flex-col max-w-[800px] mx-auto p-3 pt-8">
      <div className="gap-y-2 flex flex-col">
        {isAuthenticated && (
          <div
            onClick={handleCreatePost}
            className="text-gray-500 text-sm hover:bg-zinc-100 p-4 rounded-md flex cursor-pointer flex-col border border-zinc-200"
          >
            Create a new thread...
          </div>
        )}
        {posts.map((post) => (
          <ForumListPost key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default ForumPage;
