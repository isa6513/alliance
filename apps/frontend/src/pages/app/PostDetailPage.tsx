import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router";
import {
  PostDto,
  CreateReplyDto,
  forumDeleteReply,
} from "@alliance/shared/client";
import { useAuth } from "../../lib/AuthContext";
import ReplyForm from "../../components/forum/ReplyForm";
import ReplyComponent from "../../components/forum/ReplyComponent";
import {
  forumCreateReply,
  forumFindOnePost,
  forumRemovePost,
} from "@alliance/shared/client";
import Card, { CardStyle } from "../../components/system/Card";
import { formatTime } from "../../lib/utils";

const PostDetailPage: React.FC = () => {
  const { id: postId } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [post, setPost] = useState<PostDto | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newlyAddedReplies, setNewlyAddedReplies] = useState<Set<number>>(
    new Set()
  );
  const [highlightedReplyId, setHighlightedReplyId] = useState<number | null>(
    null
  );
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

  // Handle highlighted reply from URL parameters
  useEffect(() => {
    const replyId = searchParams.get("replyId");
    if (replyId && post) {
      const replyIdNumber = parseInt(replyId, 10);
      if (!isNaN(replyIdNumber)) {
        setHighlightedReplyId(replyIdNumber);

        // Remove the replyId parameter from URL immediately to prevent re-highlighting
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete("replyId");
        setSearchParams(newSearchParams, { replace: true });

        // Scroll to the reply after a short delay to ensure it's rendered
        setTimeout(() => {
          const replyElement = document.getElementById(
            `reply-${replyIdNumber}`
          );
          if (replyElement) {
            replyElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }, 500);

        // Remove highlight after 15 seconds
        setTimeout(() => {
          setHighlightedReplyId(null);
        }, 5000);
      }
    }
  }, [searchParams, post, setSearchParams]);

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!postId) {
      return;
    }

    try {
      setIsSubmitting(true);
      const replyDto: CreateReplyDto = {
        content: replyContent,
        postId: Number(postId),
        parentId: replyingTo ?? undefined,
      };

      console.log("replyDto", replyDto);

      const response = await forumCreateReply({
        body: replyDto,
      });

      // Refresh the post to get updated reply hierarchy
      if (response.data) {
        const newReplyId = response.data.id;

        // Add to newly added replies set
        setNewlyAddedReplies((prev) => new Set(prev).add(newReplyId));

        // Remove from newly added set after 10 seconds
        setTimeout(() => {
          setNewlyAddedReplies((prev) => {
            const newSet = new Set(prev);
            newSet.delete(newReplyId);
            return newSet;
          });
        }, 10000);

        const refreshedPost = await forumFindOnePost({
          path: { id: postId },
        });
        setPost(refreshedPost.data ?? null);
      }

      setReplyContent("");
      setReplyingTo(null);
      setError(null);
    } catch (err) {
      console.error("Error posting reply:", err);
      setError("Failed to submit reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!post || post.author.email !== user?.email) {
      return;
    }

    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await forumRemovePost({
          path: { id: post.id.toString() },
        });
        navigate("/forum");
      } catch (err) {
        console.error("Error deleting post:", err);
        setError("Failed to delete post");
      }
    }
  };

  const handleDeleteReply = async (replyId: number) => {
    if (!post || !postId) {
      return;
    }

    if (window.confirm("Are you sure you want to delete this reply?")) {
      try {
        await forumDeleteReply({
          path: { id: replyId.toString() },
        });

        // Refresh the post to get updated reply hierarchy
        const refreshedPost = await forumFindOnePost({
          path: { id: postId },
        });
        setPost(refreshedPost.data ?? null);
      } catch (err) {
        console.error("Error deleting reply:", err);
        setError("Failed to delete reply");
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

  console.log(post.replies);

  return (
    <div className="w-full min-h-screen bg-page">
      <div className="container mx-auto px-4 py-8 ">
        {/* Post */}
        <div className="relative">
          <Link
            to="/forum"
            className="absolute -left-10 top-6 text-blue z-10 text-lg"
            title="Back to Forum"
          >
            &larr;
          </Link>
          <Card className="p-6 mb-5" style={CardStyle.White}>
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold">{post.title}</h1>
              {post.author.email === user?.email && (
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
            <div className="text-sm text-gray-500">
              <span>
                By{" "}
                <a
                  href={`/user/${post.author.id}`}
                  className="font-semibold hover:underline"
                >
                  {post.author.name}
                </a>
              </span>
              <span className="ml-4">
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

            <div className="my-8 whitespace-pre-wrap">{post.content}</div>
          </Card>
        </div>

        {post.replies.length > 0 ? (
          <div className="space-y-2 mb-8">
            {post.replies.map((reply) => (
              <ReplyComponent
                key={reply.id}
                reply={reply}
                user={user}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                replyContent={replyContent}
                setReplyContent={setReplyContent}
                handleSubmitReply={handleSubmitReply}
                handleDeleteReply={handleDeleteReply}
                isSubmitting={isSubmitting}
                newlyAddedReplies={newlyAddedReplies}
                highlightedReplyId={highlightedReplyId}
              />
            ))}
          </div>
        ) : null}

        {user && !replyingTo ? (
          <ReplyForm
            parentId={null}
            replyContent={replyContent}
            setReplyContent={setReplyContent}
            onSubmit={handleSubmitReply}
            isSubmitting={isSubmitting}
            setReplyingTo={setReplyingTo}
          />
        ) : !user ? (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <p className="text-gray-600">
              Please{" "}
              <Link to="/login" className="text-blue-600 hover:underline">
                log in
              </Link>{" "}
              to post a reply.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PostDetailPage;
