import { ActionActivityDto } from "@alliance/shared/client";
import { Link, href, useNavigate } from "react-router";
import { formatTime } from "@alliance/shared/lib/utils";
import ActivityLikeButton from "./ActivityLikeButton";
import ProfileImage from "@alliance/shared/ui/ProfileImage";

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
  handleLike,
}: ActionActivityFeedItemProps) => {
  const navigate = useNavigate();
  const verb = activity.type === "user_joined" ? "committed to" : "completed";

  if (
    !(activity.type === "user_joined" || activity.type === "user_completed")
  ) {
    return null;
  }

  if (card) {
    return (
      <Link
        to={href("/member/:id", { id: activity.user.id.toString() })}
        className="text-black"
      >
        <span className="hover:underline font-medium">
          {`${activity.user.displayName}`}
        </span>
        <span className="text-gray-600"> {verb}</span>
        <span className="font-medium"> {activity.actionName}</span>
        {showTime && (
          <p className="text-gray-500 text-right text-nowrap">
            {formatTime(new Date(activity.createdAt), {
              addSuffix: true,
            })}{" "}
          </p>
        )}
      </Link>
    );
  } else {
    return (
      <div
        key={activity.id}
        className={`rounded-md border-gray-200 ${
          activity.type === "user_joined" ? "cursor-default" : "cursor-pointer"
        }`}
        onClick={() => {
          // no detail pages for commitments right now
          if (activity.type === "user_joined") {
            return;
          }

          navigate(
            href("/actions/:id/activity/:activityId", {
              id: activity.actionId.toString(),
              activityId: activity.id.toString(),
            })
          );
        }}
      >
        <div className="flex flex-row gap-x-3 items-center flex-1">
          <ProfileImage pfp={activity.user.profilePicture} size="medium" />
          <div className="flex-1">
            <p className="font-medium">{activity.user.displayName}</p>
            <p className="text-sm text-gray-500">
              {formatTime(new Date(activity.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
          <ActivityLikeButton
            liked={activity.likedByMe ?? false}
            likes={activity.likesCount}
            handleLike={() => handleLike(activity)}
          />
        </div>
      </div>
    );
  }
};

export default ActionActivityFeedItem;
