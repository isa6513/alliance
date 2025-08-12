import { useEffect, useState } from "react";
import {
  ActionActivityDto,
  actionsLikeActivity,
  actionsUnlikeActivity,
} from "@alliance/shared/client";
import { actionsGetActionActivities } from "@alliance/shared/client";
import { CardStyle } from "./system/Card";
import Card from "./system/Card";
import { useActionActivity } from "../lib/useActionActivityWebSocket";
import { formatTime } from "../lib/utils";
import { useNavigate } from "react-router";
import { formatActivityMessage } from "./ActionActivityDetail";
import heart from "../assets/icons8-heart-90.png";
import { useAuth } from "../lib/AuthContext";

interface ActionActivityListProps {
  actionId: number;
}

const ActionActivityList = ({ actionId }: ActionActivityListProps) => {
  const [initialActivities, setInitialActivities] = useState<
    ActionActivityDto[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const { activities: liveActivities } = useActionActivity(actionId);
  const { user } = useAuth();

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const response = await actionsGetActionActivities({
          path: { id: actionId },
        });
        if (!response.data) {
          throw new Error();
        }
        setInitialActivities(response.data);
      } catch (err) {
        console.error("Error fetching activities:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [actionId]);

  // Combine initial activities with live activities, avoiding duplicates
  const allActivities = [...liveActivities, ...initialActivities]
    .filter(
      (activity, index, self) =>
        self.findIndex((a) => a.id === activity.id) === index
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="animate-pulse flex items-center space-x-3">
          <div className="rounded-full bg-gray-200 h-8 w-8"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  const handleLike = async (activity: ActionActivityDto) => {
    if (!user) {
      return;
    }
    if (activity.likes.some((like) => like.id === user.id)) {
      const response = await actionsUnlikeActivity({
        path: { id: activity.id },
      });
      if (response.response.ok) {
        setInitialActivities(
          initialActivities.map((a) =>
            a.id === activity.id
              ? {
                  ...a,
                  likes: a.likes.filter((like) => like.id !== user.id),
                }
              : a
          )
        );
      }
    } else {
      const response = await actionsLikeActivity({
        path: { id: activity.id },
      });
      if (response.response.ok) {
        setInitialActivities(
          initialActivities.map((a) =>
            a.id === activity.id
              ? {
                  ...a,
                  likes: response.data?.likes || [],
                }
              : a
          )
        );
      }
    }
  };

  if (!allActivities.length) {
    return null;
  }
  const defaultMaxActivities = 8;

  const displayedActivities = showAll
    ? allActivities
    : allActivities.slice(0, defaultMaxActivities);
  const hasMore = allActivities.length > defaultMaxActivities;

  return (
    <Card style={CardStyle.White} className="p-7">
      <div className="space-y-3 w-full">
        <h3 className="text-lg font-bold">Recent Activity</h3>
        <div>
          {displayedActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start space-x-3  cursor-pointer hover:bg-gray-100 rounded-md p-2"
              onClick={() => {
                navigate(
                  `/actions/${activity.actionId}/activity/${activity.id}`
                );
              }}
            >
              <div className="flex-shrink-0">
                <div
                  className={`w-2 h-2 rounded-full mt-[9px] ${
                    activity.type === "user_joined"
                      ? "bg-green-2"
                      : "bg-[#318dde]"
                  }`}
                ></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-row justify-between items-center">
                  <div className="flex flex-row gap-x-2">
                    {activity.user.profilePicture !== null && (
                      <img
                        src={activity.user.profilePicture}
                        alt={activity.user.displayName}
                        className="w-6 h-6 rounded-md object-cover"
                      />
                    )}
                    <p className="text-gray-900">
                      {formatActivityMessage(activity)}
                    </p>
                  </div>
                  <div className="flex flex-row gap-x-1 items-center">
                    <p className="text-xs text-gray-500">
                      {activity.likes.length}
                    </p>
                    <img
                      src={heart}
                      alt="Like"
                      className={`w-4 h-4 ${
                        activity.likes.some((like) => like.id === user?.id)
                          ? "opacity-60"
                          : "opacity-20"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(activity);
                      }}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 pt-1">
                  {formatTime(new Date(activity.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
        {hasMore && !showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="text-[#318dde] hover:text-blue-800 text-sm font-medium"
          >
            See all ({allActivities.length})
          </button>
        )}
      </div>
    </Card>
  );
};

export default ActionActivityList;
