import { useActionLoaderData } from "../pages/app/ActionPage";
import chevronLeft from "../assets/icons8-expand-arrow-96.png";
import { useNavigate, useParams } from "react-router";
import { formatTime } from "../lib/utils";
import { ActionActivityDto, actionsGetActivity } from "@alliance/shared/client";
import { useEffect, useState } from "react";

export function formatActivityMessage(activity: ActionActivityDto) {
  const userName = activity.user.displayName || "Someone";
  switch (activity.type) {
    case "user_joined":
      return `${userName} joined`;
    case "user_completed":
      return `${userName} completed this action`;
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
  const actionId = action.id;
  const params = useParams();
  const activityId = parseInt(params.activityId!);
  const [activity, setActivity] = useState<ActionActivityDto | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await actionsGetActivity({
          path: { id: activityId },
        });
        if (!response.data) {
          throw new Error();
        }
        setActivity(response.data);
      } catch (err) {
        console.error("Error fetching activities:", err);
      }
    };

    fetchActivities();
  }, [actionId, activityId]);

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
      {activity !== null && (
        <>
          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-row items-center gap-x-2">
              {activity.user.profilePicture !== null && (
                <img
                  src={activity.user.profilePicture}
                  className="w-8 h-8 rounded-md object-cover"
                />
              )}
              <p className="font-semibold text-lg">
                {formatActivityMessage(activity)}
              </p>
            </div>
            <p className="text-gray-500 text-sm">
              {formatTime(new Date(activity?.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
          <p className="text-gray-500">{activity.description}</p>
          {activity.attachments?.map((attachment) => (
            <img
              key={attachment}
              src={attachment}
              className="w-full h-auto rounded-md object-cover"
            />
          ))}
          <div className="flex flex-row items-center gap-x-2">
            <p className="">{activity.likes.length} likes</p>
            {activity.likes
              .filter((like) => like.profilePicture !== null)
              .map((like) => (
                <img
                  key={like.id}
                  src={like.profilePicture!}
                  className="w-6 h-6 rounded-md object-cover"
                />
              ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ActionActivityDetail;
