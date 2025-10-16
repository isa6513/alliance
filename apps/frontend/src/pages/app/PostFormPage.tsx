import {
  CreateEditableContentDto,
  CreatePostDto,
  PostDto,
  forumCreatePost,
  forumFindOnePost,
  forumUpdatePost,
  imagesUploadImage,
} from "@alliance/shared/client";
import Button, { ButtonColor } from "@alliance/shared/ui/Button";
import Card from "@alliance/shared/ui/Card";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { setRevalidate } from "../../applayout";
import EditableContentForm from "../../components/forum/EditableContentForm";
import { useAuth } from "../../lib/AuthContext";
import LargeCheckbox from "../../components/LargeCheckbox";
type FormMode = "create" | "edit";

function formatDateToInputValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());

  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

function toUtcISOString(localDateTime: string | null | undefined) {
  if (!localDateTime) {
    return null;
  }
  const parsed = new Date(localDateTime);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toISOString();
}

const FUTURE_SCHEDULE_THRESHOLD_MS = 60 * 1000;

const PostFormPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const [searchParams] = useSearchParams();
  const mode: FormMode = postId === "new" ? "create" : "edit";

  const [title, setTitle] = useState("");
  const [content, setContent] = useState<CreateEditableContentDto>({
    body: "",
    attachments: [],
  });
  const [schedulePostDate, setSchedulePostDate] = useState<string>(
    formatDateToInputValue(new Date())
  );
  const [useSchedulePost, setUseSchedulePost] = useState<boolean>(false);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (mode === "edit" && postId) {
          setIsLoading(true);
          const postResponse = await forumFindOnePost({
            path: { id: postId },
          });
          if (postResponse.data) {
            setTitle(postResponse.data.title);
            setContent(postResponse.data.editableContent);
            setActionId(postResponse.data.actionId);
            const visibleAtDate = new Date(postResponse.data.visibleAt);
            const now = new Date();
            const isScheduled =
              visibleAtDate.getTime() - now.getTime() >
              FUTURE_SCHEDULE_THRESHOLD_MS;
            setUseSchedulePost(isScheduled);
            setSchedulePostDate(
              formatDateToInputValue(isScheduled ? visibleAtDate : now)
            );
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
  }, [mode, postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      return;
    }

    try {
      setIsSubmitting(true);
      // Upload any new image attachments to get keys
      let attachmentKeys: string[] = [];
      if (content.attachments.length > 0) {
        const uploads = await Promise.all(
          content.attachments.map(async (fileB64) => {
            if (fileB64.startsWith("data:")) {
              const res = await imagesUploadImage({ body: { file: fileB64 } });
              return res.data as unknown as string; // returns image key
            }
            return fileB64;
          })
        );
        attachmentKeys = uploads.filter(Boolean) as string[];
      }

      let visibleAt = new Date().toISOString();
      if (useSchedulePost) {
        const scheduledIso = toUtcISOString(schedulePostDate);
        if (!scheduledIso) {
          setError("Please select a valid date and time to schedule the post.");
          setIsSubmitting(false);
          return;
        }
        visibleAt = scheduledIso;
      }

      const postData: CreatePostDto = {
        title,
        actionId: actionId,
        editableContent: { body: content.body, attachments: attachmentKeys },
        visibleAt,
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
          path: { id: parseInt(postId) },
          body: postData,
        });
      }
      setRevalidate();

      if (response.data) {
        navigate(`/forum/post/${response.data.id}`);
      } else {
        setError("An error occurred while updating the post");
        console.error(response);
      }
    } catch (err) {
      console.error("Error saving post:", err);
      setError("Failed to save post");
    } finally {
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
    <div className="container max-w-4xl mx-auto px-4 py-8 mt-4">
      <div className="mb-6">
        <Link to="/forum" className="text-blue hover:underline">
          &larr; Back to Forum
        </Link>
      </div>

      <Card>
        <div className="p-2">
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

            <div className="mb-6">
              <label className="block text-zinc-700 font-medium mb-2">
                Content
              </label>
              <div className="rounded-lg p-4 bg-zinc-100">
                <EditableContentForm
                  value={content}
                  onChange={setContent}
                  expanded={true}
                  placeholder="Write your post content here..."
                />
                <div className="mt-3 flex justify-end text-sm text-zinc-500">
                  Drag an image to attach
                </div>
              </div>
            </div>

            <div className="flex justify-between space-x-3 items-center">
              <div className="flex space-x-3 items-center">
                <LargeCheckbox
                  label="Schedule post for later"
                  checked={useSchedulePost}
                  onChange={() => {
                    setUseSchedulePost(!useSchedulePost);
                    if (error) {
                      setError(null);
                    }
                  }}
                />
                {useSchedulePost && (
                  <div className="flex space-x-3">
                    <input
                      type="datetime-local"
                      id="schedulePostDate"
                      name="schedulePostDate"
                      value={schedulePostDate}
                      onChange={(e) => {
                        setSchedulePostDate(e.target.value);
                        if (error) {
                          setError(null);
                        }
                      }}
                      className="w-full p-3 py-2 -my-3 border border-zinc-300 rounded-lg focus:outline-none"
                    />
                  </div>
                )}
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={() => navigate("/forum")}
                  color={ButtonColor.Light}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  color={ButtonColor.Black}
                  disabled={
                    isSubmitting || !title.trim() || !content.body.trim()
                  }
                >
                  {isSubmitting
                    ? "Saving..."
                    : mode === "create"
                    ? "Create Post"
                    : "Save Changes"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default PostFormPage;
