import { useActionLoaderData } from "../pages/app/ActionPage";
import chevronLeft from "../assets/icons8-expand-arrow-96.png";
import { useNavigate, useParams, useOutletContext } from "react-router";
import { formatTime } from "../lib/utils";
import { actionsUpdateActivity } from "@alliance/shared/client";
import Comments from "./Comments";
import { useAuth } from "../lib/AuthContext";
import { TaskPanelContext } from "./ActionTaskPanel";
import Button, { ButtonColor } from "./system/Button";
import { useEffect, useState } from "react";
import ProfileImage from "./ProfileImage";
import ActivityLikesButtonRow from "./ActivityLikesButtonRow";
import FormattedActionActivityMessage from "./FormattedActionActivityMessage";

export function ErrorBoundary(error: unknown) {
  console.error(error);
  const action = useActionLoaderData();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-y-3 flex-2 px-5 pl-10 pt-5">
      <h1 className="font-adobe w-full">{action.name}</h1>
      <div
        className="flex flex-row gap-x-3 items-center cursor-pointer border-b border-gray-300 pb-3 hover:underline"
        onClick={() => {
          navigate(`/actions/${action.id}`);
        }}
      >
        <img src={chevronLeft} className="w-4 h-4 rotate-90" />
        <p className="">Back to action</p>
      </div>
      <div className="flex flex-col items-center justify-center h-100 text-red-500">
        <p>Error loading user action</p>
      </div>
    </div>
  );
}

const ActionActivityDetail = () => {
  const navigate = useNavigate();
  const action = useActionLoaderData();
  const params = useParams();
  const activityId = parseInt(params.activityId!);
  const { user } = useAuth();
  const { activities, handleLikeActivity, setActivities } =
    useOutletContext<TaskPanelContext>();

  // Find the activity from the shared state
  const activity = activities.find((a) => a.id === activityId) || null;

  const handleLike = async () => {
    if (!user || !activity) {
      return;
    }
    await handleLikeActivity(activity.id);
  };

  const isLiked = activity?.likes.some((like) => like.id === user?.id) || false;

  const isOwner = activity?.user.id === user?.id;
  const [editing, setEditing] = useState(false);
  const [activityDescription, setActivityDescription] = useState(
    activity?.description || ""
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setActivityDescription(activity?.description || "");
  }, [activity]);

  const handleSave = async () => {
    if (!user || !activity || isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      const resp = await actionsUpdateActivity({
        path: {
          id: activity.id,
        },
        body: {
          description: activityDescription,
        },
      });
      if (resp.error) {
        console.error(resp.error);
        return;
      }
      const newActivity = resp.data!;
      setActivities(
        activities.map((a) => (a.id === activity.id ? newActivity : a))
      );
      setActivityDescription(newActivity.description || "");
      setEditing(false);
    } catch (error) {
      console.error("Error updating activity:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setActivityDescription(activity?.description || "");
    setEditing(false);
  };

  return (
    <>
      <div className="flex flex-col gap-y-3 flex-2 px-5 pl-10 pt-5">
        <h1 className="font-adobe w-full">{action.name}</h1>
        <div
          className="flex flex-row gap-x-3 items-center cursor-pointer border-b border-gray-300 pb-3 hover:underline"
          onClick={() => {
            navigate(`/actions/${action.id}`);
          }}
        >
          <img src={chevronLeft} className="w-4 h-4 rotate-90" />
          <p className="">Back to action</p>
        </div>
        {activity !== null && (
          <>
            <div className="flex flex-row items-center justify-between">
              <div className="flex flex-row items-center gap-x-4">
                {activity.user.profilePicture !== null && (
                  <ProfileImage
                    pfp={activity.user.profilePicture}
                    size="medium"
                  />
                )}
                <FormattedActionActivityMessage activity={activity} />
                {isOwner && !editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="text-blue-600 hover:text-blue-800 text-sm underline"
                  >
                    {activity.description ? "Edit details" : "Add details"}
                  </button>
                )}
              </div>
              <p className="text-gray-500 text-sm">
                {formatTime(new Date(activity?.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
            {editing ? (
              <div className="space-y-2">
                <textarea
                  value={activityDescription}
                  onChange={(e) => setActivityDescription(e.target.value)}
                  placeholder="Add any details you want to share about this activity..."
                  className="w-full border border-stone-300 focus:outline-none p-2 rounded"
                  rows={4}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      handleCancel();
                    }
                  }}
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
            {activity.attachments?.map((attachment) => (
              <img
                key={attachment}
                src={attachment}
                className="w-full h-auto rounded-md object-cover"
              />
            ))}
            <div className="flex flex-row items-center justify-between">
              <ActivityLikesButtonRow
                isLiked={isLiked}
                likes={activity.likes}
                handleLike={handleLike}
                labelText={true}
              />
            </div>
            <Comments objectId={activity.id} type={"activity"} />
          </>
        )}
      </div>
    </>
  );
};

export default ActionActivityDetail;
