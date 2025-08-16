import { useActionLoaderData } from "../pages/app/ActionPage";
import chevronLeft from "../assets/icons8-expand-arrow-96.png";
import { useNavigate, useParams, useOutletContext } from "react-router";
import { formatTime } from "../lib/utils";
import {
  ActionActivityDto,
  actionsUpdateActivity,
} from "@alliance/shared/client";
import Comments from "./Comments";
import heart from "../assets/icons8-heart-90.png";
import { useAuth } from "../lib/AuthContext";
import { TaskPanelContext } from "./ActionTaskPanel";
import Button, { ButtonColor } from "./system/Button";
import { useEffect, useState } from "react";
import ProfileImage from "./ProfileImage";
import ActivityLikeButton from "./ActivityLikeButton";
import ActivityLikesButtonRow from "./ActivityLikesButtonRow";

export function formatActivityMessage(
  activity: ActionActivityDto,
  showAction: boolean = false
) {
  const userName = activity.user.displayName || "Someone";
  switch (activity.type) {
    case "user_joined":
      return showAction
        ? `${userName} joined ${activity.actionName}`
        : `${userName} joined`;
    case "user_completed":
      return showAction
        ? `${userName} completed ${activity.actionName}`
        : `${userName} completed this action`;
    default:
      return "Unknown activity";
  }
}

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

  useEffect(() => {
    setActivityDescription(activity?.description || "");
  }, [activity]);

  const checkForEscape = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setEditing(false);
    }
  };

  const handleSave = async () => {
    if (!user || !activity) {
      return;
    }
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
  };

  return (
    <>
      <div
        className="flex flex-col gap-y-3 flex-2 px-5 pl-10 pt-5"
        onKeyDown={checkForEscape}
      >
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
                    src={activity.user.profilePicture}
                    size="medium"
                  />
                )}
                <p className="font-bold">{formatActivityMessage(activity)}</p>
                {isOwner && (
                  <Button
                    color={ButtonColor.Light}
                    onClick={() => {
                      setEditing(true);
                    }}
                  >
                    Add details
                  </Button>
                )}
              </div>
              <p className="text-gray-500 text-sm">
                {formatTime(new Date(activity?.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
            <p>{activity.description}</p>
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
      {editing && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/20 z-50 flex items-center justify-center">
          <div className="bg-white shadow-lg p-6 rounded-lg flex flex-col gap-y-3">
            <p className="font-medium">
              Add any details you want to share about this activity
            </p>
            <textarea
              className="w-full h-24 border border-gray-300 rounded-md p-2"
              value={activityDescription}
              onChange={(e) => setActivityDescription(e.target.value)}
            />
            <div className="flex flex-row gap-x-2">
              <Button
                color={ButtonColor.Light}
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
              <Button color={ButtonColor.Blue} onClick={handleSave}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ActionActivityDetail;
