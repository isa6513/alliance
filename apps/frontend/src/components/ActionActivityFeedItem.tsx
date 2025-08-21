import { useNavigate } from "react-router";
import { formatTime } from "../lib/utils";
import { ActionActivityDto } from "@alliance/shared/client";
import { useAuth } from "../lib/AuthContext";
import ActivityLikeButton from "./ActivityLikeButton";
import ActivityFeedItem from "./ActivityFeedItem";

export interface ActionActivityFeedItemProps {
  activity: ActionActivityDto;
  showTime?: boolean;
  card?: boolean;
  showAction: boolean;
  handleLike: (activity: ActionActivityDto) => void;
}

const ActionActivityFeedItem = ({
  activity,
  showTime = true,
  card = true,
  showAction,
  handleLike,
}: ActionActivityFeedItemProps) => {
  const navigate = useNavigate();
  const verb = activity.type === "user_joined" ? "committed to" : "completed";
  const { user } = useAuth();

  if (card) {
    return (
      <a href={`/user/${activity.user.id}`} className="text-black">
        <a
          className="hover:underline font-medium"
          href={`/user/${activity.user.id}`}
        >{`${activity.user.displayName}`}</a>
        <span className="text-gray-600"> {verb}</span>
        <span className="font-medium"> {activity.actionName}</span>
        {showTime && (
          <p className="text-gray-500 text-right text-nowrap">
            {formatTime(new Date(activity.createdAt), {
              addSuffix: true,
            })}{" "}
          </p>
        )}
      </a>
    );
  } else {
    return (
      <div
        key={activity.id}
        className="rounded-md border-gray-200"
        onClick={() => {
          navigate(`/actions/${activity.actionId}/activity/${activity.id}`);
        }}
      >
        <div className="flex flex-row gap-x-3 cursor-pointer items-start">
          <div className="flex-1">
            <ActivityFeedItem
              title={activity.actionName}
              content={`${
                activity.user.displayName
              } ${verb} this action ${formatTime(new Date(activity.createdAt), {
                addSuffix: true,
              })}`}
              user={activity.user}
              showTitle={showAction}
            />
          </div>

          <ActivityLikeButton
            liked={activity.likes.some((like) => like.id === user?.id)}
            likes={activity.likes.length}
            handleLike={() => handleLike(activity)}
            size="small"
          />
        </div>
      </div>
    );
  }
};

export default ActionActivityFeedItem;
