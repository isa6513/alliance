import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { PostDto } from "@alliance/shared/client";
import { useAuth } from "../../lib/AuthContext";
import { forumFindOnePost, forumRemovePost } from "@alliance/shared/client";
import Card, { CardStyle } from "../../components/system/Card";
import { formatTime } from "../../lib/utils";
import Comments from "../../components/Comments";
import AppMarkdownWrapper from "../../components/AppMarkdownWrapper";
import { setRevalidate } from "../../applayout";
import ProfileImage from "../../components/ProfileImage";
import PinnedIcon from "../../components/PinnedIcon";

const PostDetailPage: React.FC = () => {
  const { id: postId } = useParams<{ id: string }>();
  const [post, setPost] = useState<PostDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;

      try {
        setIsLoading(true);
        const response = await forumFindOnePost({
          path: { id: postId },
        });
        setPost(response.data ?? null);
        setError(null);
      } catch (err) {
        console.error("Error fetching post details:", err);
        setError("Failed to load post details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const handleDeletePost = async () => {
    if (!post || post.author.id !== user?.id) {
      return;
    }

    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await forumRemovePost({
          path: { id: post.id.toString() },
        });
        setRevalidate();
        navigate("/forum");
      } catch (err) {
        console.error("Error deleting post:", err);
        setError("Failed to delete post");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center py-10">
          <div className="loader">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-10 text-gray-500">
          <p>Post not found</p>
          <Link
            to="/forum"
            className="text-blue-600 hover:underline mt-2 inline-block"
          >
            Return to Forum
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-page">
      <div className="container mx-auto px-4 py-8 ">
        <div className="relative">
          <Link
            to="/forum"
            className="absolute -left-10 top-6 text-blue z-10 text-lg"
            title="Back to Forum"
          >
            &larr;
          </Link>
          <Card className="p-6 mb-3" style={CardStyle.White}>
            <div className="flex justify-between items-start">
              <div className="flex flex-row gap-x-2 items-center justify-between w-full">
                <h1 className="text-2xl font-semibold">{post.title}</h1>
                {post.pinned && <PinnedIcon size="large" />}
              </div>
              {post.author.id === user?.id && (
                <div className="space-x-2">
                  <Link
                    to={`/forum/edit/${post.id}`}
                    className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                  >
                    Edit
                  </Link>
                  <span
                    onClick={handleDeletePost}
                    className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition cursor-pointer"
                  >
                    Delete
                  </span>
                </div>
              )}
            </div>
            <div className=" flex flex-row gap-x-2 items-center">
              {post.author.profilePicture && (
                <ProfileImage pfp={post.author.profilePicture} size="small" />
              )}
              <span>
                <a
                  href={`/user/${post.author.id}`}
                  className="hover:underline text-black"
                >
                  {post.author.displayName}
                </a>
              </span>
              <span className="ml-4 text-zinc-500">
                {formatTime(new Date(post.createdAt), {
                  addSuffix: true,
                })}
              </span>
              {post.action && (
                <span className="ml-4">
                  <Link
                    to={`/actions/${post.action.id}`}
                    className="inline-block bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1 rounded-lg text-sm"
                  >
                    {post.action.name}
                  </Link>
                </span>
              )}
            </div>

            <div className="mt-4">
              <AppMarkdownWrapper markdownContent={post.content} />
            </div>
          </Card>
        </div>

        <Comments objectId={post.id} type={"post"} />
      </div>
    </div>
  );
};

export default PostDetailPage;
