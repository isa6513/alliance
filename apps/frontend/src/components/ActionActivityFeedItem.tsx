import { ActionActivityDto, ActionActivityType } from "@alliance/shared/client";
import {
  actionActivityTransitiveVerb,
  type ViewableActionActivity,
} from "@alliance/shared/lib/actionActivityConstants";
import { formatTime } from "@alliance/shared/lib/utils";
import { cn } from "@alliance/shared/styles/util";
import { AvatarProfile } from "@alliance/sharedweb/ui/Avatar";
import { MessageCircle } from "lucide-react";
import { Link, href, useNavigate } from "react-router";
import LikeFooter, { LikeBarButton } from "./LikeFooter";

export interface ActionActivityFeedItemProps {
  activity: ActionActivityDto;
  showTime?: boolean;
  card?: boolean;
  showAction: boolean;
  handleLike: (activity: ActionActivityDto) => Promise<unknown>;
}

const ACTIVITY_TYPE_CLICKABLE = {
  user_completed: true,
  user_submitted_follow_up_form: true,

  // no rendered activity
  user_wont_complete: null,
  user_dismissed: null,
} as const satisfies {
  [K in ActionActivityType]: K extends ViewableActionActivity ? boolean : null;
};

const ActionActivityFeedItem = ({
  activity,
  showTime = true,
  card = true,
  showAction = true,
  handleLike,
}: ActionActivityFeedItemProps) => {
  const navigate = useNavigate();
  const verb = actionActivityTransitiveVerb[activity.type];

  if (verb === null) {
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
        <span className="text-zinc-600"> {verb}</span>
        <span className="font-medium"> {activity.actionName}</span>
        {showTime && (
          <p className="text-zinc-500 text-right text-nowrap">
            {formatTime(new Date(activity.createdAt), {
              addSuffix: true,
            })}{" "}
          </p>
        )}
      </Link>
    );
  } else {
    const clickable = ACTIVITY_TYPE_CLICKABLE[activity.type];
    return (
      <div
        key={activity.id}
        className={cn(
          "rounded-md border-zinc-200",
          clickable ? "cursor-pointer" : "cursor-default",
        )}
        onClick={() => {
          if (!clickable) {
            return;
          }

          navigate(
            href("/actions/:id/activity/:activityId", {
              id: activity.actionId.toString(),
              activityId: activity.id.toString(),
            }),
          );
        }}
      >
        <div className="flex flex-row gap-x-2 items-center flex-1 rounded">
          <AvatarProfile
            pfp={activity.user.profilePicture}
            size="medium"
            className="self-start mt-1.5"
          />
          <div className="flex-1 text-zinc-700">
            <p className="font-medium">{activity.user.displayName}</p>
            {showAction ? (
              <p className="">
                <span className="text-zinc-500 text-nowrap">{verb} </span>
                <span className="text-green">{activity.actionName}</span>
                <span className="text-zinc-500 text-nowrap">
                  {" "}
                  {formatTime(new Date(activity.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </p>
            ) : (
              <p className="text-zinc-500">
                {formatTime(new Date(activity.createdAt), {
                  addSuffix: true,
                })}
              </p>
            )}
          </div>
        </div>
        <LikeFooter
          likeTargetType="activity"
          likeTargetId={activity.id}
          liked={activity.likedByMe ?? false}
          likesCount={activity.likesCount}
          likers={activity.likes}
          onLike={() => handleLike(activity)}
        >
          <LikeBarButton
            icon={MessageCircle}
            label="Comment"
            onPress={() =>
              navigate(
                href("/actions/:id/activity/:activityId", {
                  id: activity.actionId.toString(),
                  activityId: activity.id.toString(),
                }),
              )
            }
          />
        </LikeFooter>
      </div>
    );
  }
};

export default ActionActivityFeedItem;
