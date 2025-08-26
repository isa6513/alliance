import {
  ActionActivityDto,
  actionsUpdateActivity,
} from "@alliance/shared/client";
import Button, { ButtonColor } from "@alliance/shared/ui/Button";
import Card, { CardStyle } from "@alliance/shared/ui/Card";
import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../lib/AuthContext";
import { formatTime } from "../lib/utils";
import ActivityLikeButton from "./ActivityLikeButton";
import Comments from "./Comments";
import ProfileImage from "./ProfileImage";

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
  const [editDescription, setEditDescription] = useState(
    activity.description || ""
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleClick = useCallback(() => {
    navigate(`/actions/${activity.actionId}/activity/${activity.id}`);
  }, [activity.actionId, activity.id, navigate]);

  const timeSinceCompleted = formatTime(new Date(activity.createdAt), {
    addSuffix: true,
  });

  const handleEdit = useCallback(() => {
    setEditDescription(activity.description || "");
    setIsEditing(true);
  }, [activity.description]);

  const handleSave = useCallback(async () => {
    if (!self || isSaving) return;

    setIsSaving(true);
    try {
      const response = await actionsUpdateActivity({
        path: { id: activity.id },
        body: { description: editDescription },
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
  }, [self, activity.id, editDescription, onActivityUpdate, isSaving]);

  const handleCancel = useCallback(() => {
    setEditDescription(activity.description || "");
    setIsEditing(false);
  }, [activity.description]);

  return (
    <div className="flex flex-row justify-stretch items-center space-x-4">
      <Card
        className="block bg-page text-[11pt] flex-1 border-b"
        style={CardStyle.White}
      >
        <div className="flex flex-row gap-x-2 items-center">
          <div className="flex-shrink-0">
            <Link to={`/user/${activity.user.id}`}>
              <ProfileImage pfp={activity.user.profilePicture} size="medium" />
            </Link>
          </div>
          <p className="text-zinc-600">{activity.user.displayName}</p>
          <p className="text-zinc-500">completed {timeSinceCompleted}</p>
        </div>
        <div className="flex flex-row justify-between mt-2">
          <div className="flex flex-col space-y-3">
            <div>
              <p
                className="font-medium text-lg cursor-pointer hover:underline"
                onClick={handleClick}
              >
                {activity.action.name}
              </p>
              {isEditing ? (
                <div className="flex-1 space-y-2">
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Add a description..."
                    className="w-full border border-stone-300 rounded p-2 text-sm resize-none"
                    rows={2}
                  />
                  <div className="flex space-x-2">
                    <Button
                      color={ButtonColor.Light}
                      onClick={handleCancel}
                      className="text-xs py-1 px-2"
                    >
                      Cancel
                    </Button>
                    <Button
                      color={ButtonColor.Blue}
                      onClick={handleSave}
                      disabled={isSaving}
                      className="text-xs py-1 px-2"
                    >
                      {isSaving ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </div>
              ) : (
                activity.description && <p>{activity.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2 self-end">
            <ActivityLikeButton
              liked={activity.likes.some((like) => like.id === self?.id)}
              likes={activity.likes.length}
              handleLike={() => handleLike(activity.id)}
            />
            {canEdit && !isEditing && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit();
                }}
                className="flex flex-row gap-x-1 items-center border border-zinc-200 rounded-md px-3 p-2 hover:bg-zinc-100 cursor-pointer transition-colors duration-100"
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
              </button>
            )}
          </div>
        </div>

        <div className="mt-2">
          <Comments objectId={activity.id} type="activity" compact />
        </div>
      </Card>
    </div>
  );
};

export default UserActivityCard;
