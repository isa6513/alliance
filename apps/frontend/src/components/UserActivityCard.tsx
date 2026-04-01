import { ActionActivityDto } from "@alliance/shared/client";
import Button, { ButtonColor } from "@alliance/sharedweb/ui/Button";
import { AvatarProfile } from "@alliance/sharedweb/ui/Avatar";
import { useCallback, useState } from "react";
import { Link, href, useNavigate } from "react-router";
import { formatTime } from "@alliance/shared/lib/utils";
import ActivityLikeButton from "./ActivityLikeButton";
import Comments from "./Comments";
import EditableContentRenderer from "@alliance/sharedweb/ui/EditableContentRenderer";
import OutputRenderer from "@alliance/sharedweb/forms/OutputRenderer";
import { cn } from "@alliance/shared/styles/util";
import {
  actionActivityCommentable,
  actionActivityTransitiveVerb,
} from "@alliance/shared/lib/actionActivityConstants";
import { FormSchema } from "@alliance/common/forms/form-schema";

interface UserActivityCardProps {
  activity: ActionActivityDto;
  handleLike: (activityId: number) => void;
}

const UserActivityCard = ({ activity, handleLike }: UserActivityCardProps) => {
  const navigate = useNavigate();
  const [showCommentForm, setShowCommentForm] = useState(false);

  const verb = actionActivityTransitiveVerb[activity.type];
  const commentable = actionActivityCommentable[activity.type];

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      navigate(href("/actions/:id", { id: activity.actionId.toString() }));
    },
    [activity.actionId, navigate],
  );

  const handleActivityClick = useCallback(() => {
    if (showCommentForm) return;
    navigate(
      href("/actions/:id/activity/:activityId", {
        id: activity.actionId.toString(),
        activityId: activity.id.toString(),
      }),
    );
  }, [activity.actionId, activity.id, navigate, showCommentForm]);

  const timeSinceCompleted = formatTime(new Date(activity.createdAt), {
    addSuffix: true,
  });

  return (
    <div className="flex flex-col bg-white">
      <div
        className={cn(
          "block p-4 -m-4 text-[11pt] transition-colors duration-100 flex-1 gap-y-2 bg-white",
          !showCommentForm && "hover:bg-grey-1 cursor-pointer",
        )}
        onClick={handleActivityClick}
      >
        <div className="flex flex-wrap items-center">
          <Link
            to={href("/member/:id", { id: activity.user.id.toString() })}
            className="inline-flex items-center text-zinc-900 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <AvatarProfile
              pfp={activity.user.profilePicture}
              size="small"
              className="mr-2 shrink-0"
            />
            <span>{activity.user.displayName}</span>
          </Link>
          <span className="whitespace-pre text-zinc-900">{` ${verb} `}</span>

          {activity.actionName ? (
            <span
              className="text-green cursor-pointer hover:underline font-medium"
              onClick={handleClick}
            >
              {activity.actionName}
            </span>
          ) : (
            <span>this action</span>
          )}
        </div>
        <div>
          {(!!activity.editableContent.body ||
            activity.editableContent.attachments.length > 0) && (
            <div className="mt-3">
              <EditableContentRenderer content={activity.editableContent} />
            </div>
          )}
          {activity.formResponseOutput &&
            Object.keys(activity.formResponseOutput.publicAnswers ?? {})
              .length > 0 &&
            !!(
              activity.formResponseOutput
                .schemaSnapshot as unknown as FormSchema
            ).outputViews?.length && (
              <div className="my-3">
                <OutputRenderer submission={activity.formResponseOutput} />
              </div>
            )}
          <div className="flex flex-row justify-between w-full items-end">
            <p className="text-zinc-500">{timeSinceCompleted}</p>
            <div
              className={cn(
                "flex items-center space-x-2 self-end",
                !activity.editableContent.body && "mt-2",
              )}
            >
              <ActivityLikeButton
                liked={activity.likedByMe ?? false}
                likes={activity.likesCount}
                handleLike={() => handleLike(activity.id)}
                backgroundColor="white"
              />
              {commentable && (
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
      </div>
      {commentable && (
        <Comments
          objectId={activity.id}
          type="activity"
          initialComments={activity.comments}
          compact
          showForm={showCommentForm}
          autofocus={showCommentForm}
          showUserBadges={false}
        />
      )}
    </div>
  );
};

export default UserActivityCard;
