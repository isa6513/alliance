import {
  ActionActivityDto,
  actionsUpdateActivity,
  CreateEditableContentDto,
  imagesUploadImage,
} from "@alliance/shared/client";
import Button, { ButtonColor } from "@alliance/shared/ui/Button";
import ProfileImage from "@alliance/shared/ui/ProfileImage";
import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../lib/AuthContext";
import { formatTime } from "@alliance/shared/lib/utils";
import ActivityLikeButton from "./ActivityLikeButton";
import Comments from "./Comments";
import EditableContentForm from "@alliance/shared/ui/EditableContentForm";
import EditableContentRenderer from "@alliance/shared/ui/EditableContentRenderer";

interface UserActivityCardProps {
  activity: ActionActivityDto;
  handleLike: (activityId: number) => void;
  onActivityUpdate?: (updatedActivity: ActionActivityDto) => void;
  canEdit?: boolean;
}

const UserActivityCard = ({
  activity,
  handleLike,
  onActivityUpdate,
  canEdit = false,
}: UserActivityCardProps) => {
  const navigate = useNavigate();
  const { user: self } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState<CreateEditableContentDto>(
    activity.editableContent ?? { body: "", attachments: [] }
  );

  const [isSaving, setIsSaving] = useState(false);

  const [showCommentForm, setShowCommentForm] = useState(false);

  const completed = activity.type === "user_completed";

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      navigate(`/actions/${activity.actionId}`);
    },
    [activity.actionId, navigate]
  );

  const handleActivityClick = useCallback(() => {
    if (isEditing || isSaving || showCommentForm) return;
    navigate(`/actions/${activity.actionId}/activity/${activity.id}`);
  }, [
    activity.actionId,
    activity.id,
    navigate,
    isEditing,
    isSaving,
    showCommentForm,
  ]);

  const timeSinceCompleted = formatTime(new Date(activity.createdAt), {
    addSuffix: true,
  });

  const handleEdit = useCallback(() => {
    setEditContent({
      body: activity.editableContent.body,
      attachments: activity.editableContent.attachments,
    });
    setIsEditing(true);
  }, [activity.editableContent]);

  const handleSave = useCallback(async () => {
    if (!self || isSaving) return;

    setIsSaving(true);
    try {
      const uploads = await Promise.all(
        (editContent.attachments || []).map(async (img) => {
          if (img.startsWith("data:")) {
            const res = await imagesUploadImage({ body: { file: img } });
            return res.data?.key;
          }
          return img;
        })
      );
      const attachmentKeys = uploads.filter((key) => key !== undefined);

      const response = await actionsUpdateActivity({
        path: { id: activity.id },
        body: {
          editableContent: {
            body: editContent.body,
            attachments: attachmentKeys,
          },
        },
      });

      if (response.error) {
        console.error("Error updating activity:", response.error);
        return;
      }

      if (response.data && onActivityUpdate) {
        onActivityUpdate(response.data);
      }

      setIsEditing(false);
    } catch (error) {
      console.error("Error updating activity:", error);
    } finally {
      setIsSaving(false);
    }
  }, [
    self,
    isSaving,
    editContent.attachments,
    editContent.body,
    activity.id,
    onActivityUpdate,
  ]);

  const handleCancel = useCallback(() => {
    setEditContent({
      body: activity.editableContent.body,
      attachments: activity.editableContent.attachments,
    });
    setIsEditing(false);
  }, [activity.editableContent]);

  return (
    <div className="flex flex-col">
      <div
        className={`block p-4 -m-4 text-[11pt] transition-colors duration-100 flex-1 gap-y-2 bg-white ${
          !(isEditing || isSaving || showCommentForm)
            ? "hover:bg-zinc-50 cursor-pointer"
            : ""
        }`}
        onClick={handleActivityClick}
      >
        <div className="*:inline">
          <div className="flex-shrink-0 inline">
            <Link
              to={`/user/${activity.user.id}`}
              className="mr-2"
              onClick={(e) => e.stopPropagation()}
            >
              <ProfileImage pfp={activity.user.profilePicture} size="small" />
            </Link>
          </div>
          <Link
            to={`/user/${activity.user.id}`}
            className="text-zinc-900 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {activity.user.displayName}
          </Link>
          <p className="text-zinc-900">
            {completed ? " completed " : " committed to "}
          </p>
          <p
            className="text-green cursor-pointer hover:underline font-medium"
            onClick={handleClick}
          >
            {activity.actionName}
          </p>
        </div>
        {isEditing ? (
          <div className="flex-1 space-y-2 -m-4 mt-4 mb-0 border-t border-zinc-200">
            <div className="rounded p-3 bg-zinc-100">
              <EditableContentForm
                value={editContent}
                restoreDraft={false}
                onChange={setEditContent}
                placeholder="Add a description..."
              />
              <div className="mt-2 flex justify-end items-center gap-2">
                <Button
                  color={ButtonColor.Blue}
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save"}
                </Button>
                <Button
                  color={ButtonColor.White}
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {(!!activity.editableContent.body ||
              activity.editableContent.attachments.length > 0) && (
              <div className="mt-3">
                <EditableContentRenderer content={activity.editableContent} />
              </div>
            )}

            <div className="flex flex-row justify-between w-full items-end">
              <p className="text-zinc-500 text-sm">{timeSinceCompleted}</p>
              <div
                className={`flex items-center space-x-2 self-end ${
                  !activity.editableContent.body ? "mt-2" : ""
                }`}
              >
                <ActivityLikeButton
                  liked={activity.likes.some((like) => like.id === self?.id)}
                  likes={activity.likes.length}
                  handleLike={() => handleLike(activity.id)}
                  backgroundColor="white"
                />
                {canEdit && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit();
                    }}
                    color={ButtonColor.White}
                    className="flex flex-row gap-x-1 items-center !px-3 !py-[6px] !h-full"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-5 h-5 text-zinc-600"
                    >
                      <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
                      <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
                    </svg>
                    <span className="text-sm text-zinc-800">Edit</span>
                  </Button>
                )}
                {completed && activity.comments.length === 0 && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCommentForm(true);
                    }}
                    color={ButtonColor.White}
                    className="flex flex-row gap-x-1 items-center !px-3 !py-[6px] !h-full"
                  >
                    <span className="text-sm text-zinc-800 text-nowrap">
                      Reply
                    </span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      {completed && (
        <Comments
          objectId={activity.id}
          type="activity"
          initialComments={activity.comments}
          compact
          showForm={showCommentForm}
          autofocus={showCommentForm}
        />
      )}
    </div>
  );
};

export default UserActivityCard;
