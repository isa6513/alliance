import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router";
import {
  CreatePostDto,
  ActionDto,
  PostDto,
  actionsFindAll,
} from "@alliance/shared/client";
import { useAuth } from "../../lib/AuthContext";
import Card from "../../components/system/Card";
import {
  forumCreatePost,
  forumFindOnePost,
  forumUpdatePost,
} from "@alliance/shared/client";
import Button, { ButtonColor } from "../../components/system/Button";
import { useAppLoaderData } from "../../applayout";
type FormMode = "create" | "edit";

const PostFormPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const [searchParams] = useSearchParams();
  const mode: FormMode = postId === "new" ? "create" : "edit";

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [actions, setActions] = useState<ActionDto[]>([]);
  const [isLoading, setIsLoading] = useState(mode === "edit");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<number | undefined>(
    searchParams.get("actionId")
      ? Number(searchParams.get("actionId"))
      : undefined
  );
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { revalidate } = useAppLoaderData();

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch available actions for the dropdown
        const actionsResponse = await actionsFindAll();
        setActions(actionsResponse.data ?? []);

        if (mode === "edit" && postId) {
          setIsLoading(true);
          const postResponse = await forumFindOnePost({
            path: { id: postId },
          });
          if (postResponse.data) {
            setTitle(postResponse.data.title);
            setContent(postResponse.data.content);
            setActionId(postResponse.data.actionId);
          } else {
            setError("Post not found");
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load required data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, mode, postId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      return;
    }

    try {
      setIsSubmitting(true);
      const postData: CreatePostDto = {
        title,
        content,
        actionId: actionId,
      };

      let response: { data: PostDto | undefined };

      if (mode === "create") {
        response = await forumCreatePost({
          body: postData,
        });
      } else {
        if (!postId) {
          setError("An error occurred while updating the post");
          console.error("no post id");
          return;
        }
        response = await forumUpdatePost({
          path: { id: postId },
          body: postData,
        });
      }
      console.log("revalidating");
      revalidate();

      if (response.data) {
        navigate(`/forum/post/${response.data.id}`);
      } else {
        setError("An error occurred while updating the post");
        console.error("no post id");
        return;
      }
    } catch (err) {
      console.error("Error saving post:", err);
      setError("Failed to save post");
      setIsSubmitting(false);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/forum" className="text-blue hover:underline">
          &larr; Back to Forum
        </Link>
      </div>

      <Card>
        <div className="p-6">
          <h1 className="!text-xl font-semibold mb-6">
            {mode === "create" ? "New Thread" : "Edit Thread"}
          </h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="title"
                className="block text-zinc-700 font-medium mb-2"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter title"
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="content"
                className="block text-zinc-700 font-medium mb-2"
              >
                Content
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Write your post content here..."
                rows={10}
                required
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="actionId"
                className="block text-zinc-700 font-medium mb-2 "
              >
                Associated Action (Optional)
              </label>
              <select
                id="actionId"
                value={actionId || ""}
                onChange={(e) =>
                  setActionId(
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                className="w-full p-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">None</option>
                {actions.map((action) => (
                  <option key={action.id} value={action.id}>
                    {action.name}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Associating your post with an action will make it visible on
                that action&apos;s page.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                onClick={() => navigate("/forum")}
                color={ButtonColor.Light}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                color={ButtonColor.Black}
                disabled={isSubmitting || !title.trim() || !content.trim()}
              >
                {isSubmitting
                  ? "Saving..."
                  : mode === "create"
                  ? "Create Post"
                  : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default PostFormPage;
