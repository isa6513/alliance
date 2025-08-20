import Card, { CardStyle } from "./system/Card";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router";
import { ActionActivityDto } from "@alliance/shared/client";
import { formatTime } from "../lib/utils";
import { formatActivityMessage } from "./ActionActivityDetail";
import { useAuth } from "../lib/AuthContext";
import ActivityLikeButton from "./ActivityLikeButton";
import ProfileImage from "./ProfileImage";

export interface ActivityFeedItemProps {
  activity: ActionActivityDto;
  showTime?: boolean;
  card?: boolean;
  showAction: boolean;
  handleLike: (activity: ActionActivityDto) => void;
}

const ActivityFeedItem = ({
  activity,
  showTime = true,
  card = true,
  showAction,
  handleLike,
}: ActivityFeedItemProps) => {
  const navigate = useNavigate();
  const verb = activity.type === "user_joined" ? "committed to" : "completed";
  const { user } = useAuth();

  if (card) {
    return (
      <div className="flex flex-row items-center gap-x-4 w-full">
        <Card
          style={CardStyle.White}
          className="flex-1 flex-row justify-between"
          onClick={() => {
            navigate(`/actions/${activity.actionId}`);
          }}
        >
          <p className="text-black">
            <a
              className="hover:underline font-medium"
              href={`/user/${activity.user.id}`}
            >{`${activity.user.displayName}`}</a>
            <span className="text-gray-600"> {verb}</span>
            <span className="font-medium"> {activity.actionName}</span>
          </p>
          {showTime && (
            <p className="text-gray-500 text-right text-nowrap">
              {formatDistanceToNow(new Date(activity.createdAt), {
                addSuffix: true,
              })}{" "}
            </p>
          )}
        </Card>
      </div>
    );
  } else {
    return (
      <div
        key={activity.id}
        className="flex items-start space-x-3 rounded-md border-gray-200"
        onClick={() => {
          navigate(`/actions/${activity.actionId}/activity/${activity.id}`);
        }}
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-row justify-between items-center">
            <div className="flex flex-row gap-x-2 hover:underline cursor-pointer">
              <div>
                {activity.user.profilePicture !== null && (
                  <ProfileImage
                    pfp={activity.user.profilePicture}
                    size="small"
                    className="mr-2"
                  />
                )}
                <span className="text-gray-900">
                  {formatActivityMessage(activity, showAction)}
                </span>
              </div>
            </div>
            <div className="flex flex-row gap-x-1 items-center"></div>
          </div>
          <div className="flex flex-row gap-x-1 items-center pt-1 justify-between">
            <p className="text-sm text-gray-500">
              {formatTime(new Date(activity.createdAt), {
                addSuffix: true,
              })}
            </p>
            <ActivityLikeButton
              liked={activity.likes.some((like) => like.id === user?.id)}
              likes={activity.likes.length}
              handleLike={() => handleLike(activity)}
            />
          </div>
        </div>
      </div>
    );
  }
};

export default ActivityFeedItem;
