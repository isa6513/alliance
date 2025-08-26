import { CardStyle } from "@alliance/shared/ui/Card";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { ActionDto } from "@alliance/shared/client";
import { ActionActivityDto } from "@alliance/shared/client/types.gen";
import Button, { ButtonColor } from "@alliance/shared/ui/Button";
import Card from "@alliance/shared/ui/Card";
import { useActionCount } from "../lib/useActionWebSocket";
import CompletedBar from "./CompletedBar";
import UserProfilePicRow from "./UserProfilePicRow";

export interface TaskCardProps {
  action: ActionDto;
  friendCompletionActivities: ActionActivityDto[];
  commitActivity?: ActionActivityDto;
  onComplete: (actionId: number) => void;
}

enum TaskCardState {
  Minified = "minified",
  Default = "default",
  Confirming = "confirming",
  Completed = "completed",
  Closed = "closed",
}

const TaskCard: React.FC<TaskCardProps> = ({
  action,
  friendCompletionActivities = [],
  commitActivity,
  onComplete,
}: TaskCardProps) => {
  const navigate = useNavigate();

  const [state, setState] = useState<TaskCardState>(TaskCardState.Default);
  const [toggleComments, setToggleComments] = useState(false);

  const liveUserCount = useActionCount(action.id);

  const goToActionPage = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      navigate(`/actions/${action.id}`);
    },
    [navigate, action]
  );

  const handleConfirmComplete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setState(TaskCardState.Completed);
  }, []);

  const handleCancelConfirm = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setState(TaskCardState.Default);
  }, []);

  useEffect(() => {
    if (state === TaskCardState.Completed) {
      setTimeout(() => {
        setState(TaskCardState.Closed);
        setTimeout(() => {
          onComplete(action.id);
        }, 500);
      }, 1000);
    }
  }, [state, action, onComplete]);

  //   const timeRemaining = useMemo(() => {
  //     if (!action.myRelation?.deadline) return null;
  //     return (
  //       formatDistanceToNow(new Date(action.myRelation.deadline), {}) +
  //       " to complete"
  //     );
  //   }, [action.myRelation?.deadline]);

  const formattedDonationAmount = useMemo(() => {
    return action.donationAmount ? `$${action.donationAmount / 100}` : null;
  }, [action.donationAmount]);

  const givePressed = useCallback(() => {
    setState(TaskCardState.Confirming);
  }, []);

  const actionButton = useMemo(() => {
    const text =
      action.type === "Funding"
        ? `Give ${formattedDonationAmount}`
        : "See steps";
    return (
      <Button
        color={ButtonColor.Green}
        onClick={action.type === "Funding" ? givePressed : goToActionPage}
        className="w-full"
      >
        {text}
      </Button>
    );
  }, [action, formattedDonationAmount, goToActionPage, givePressed]);

  return (
    <div>
      <Card
        style={CardStyle.White}
        className={` transition-all duration-500 w-full relative
         ${state === TaskCardState.Minified ? "pb-4" : ""}
          ${state === TaskCardState.Closed ? "py-0 border-0" : ""}`}
        closed={state === TaskCardState.Closed}
      >
        <div className="flex flex-row items-start gap-x-8">
          <div className="flex-1 flex flex-col">
            <p className="font-medium text-black">{action.name}</p>
            <p className="text-zinc-500">{action.shortDescription}</p>
            {/* {action.type === "Funding" && <Badge>$5</Badge>}
          {action.type === "Activity" && !!action.timeEstimate && (
            <Badge>takes {action.timeEstimate}</Badge>
          )}
          {action.type === "Ongoing" && <Badge>3 week commitment</Badge>} */}
          </div>
          <div className="w-24 flex flex-col gap-y-2">
            {actionButton}
            <Button
              color={ButtonColor.Transparent}
              onClick={goToActionPage}
              className="w-full text-sm hover:bg-zinc-50 border border-zinc-200 text-black font-normal"
            >
              Details
            </Button>
          </div>
        </div>

        {state === TaskCardState.Confirming && (
          <div className="absolute top-0 left-0 bottom-0 right-0 bg-white flex justify-center items-center rounded-xl">
            <div className="bg-white p-4 rounded-md">
              <p className="mb-4 font-medium">
                This will charge {formattedDonationAmount} to your card on file
                and mark the action as completed. Continue?
              </p>
              <div className="flex flex-row gap-x-2">
                <Button
                  color={ButtonColor.Blue}
                  onClick={handleConfirmComplete}
                >
                  Yes
                </Button>
                <Button color={ButtonColor.Light} onClick={handleCancelConfirm}>
                  Back
                </Button>
              </div>
            </div>
          </div>
        )}
        {(state === TaskCardState.Completed ||
          state === TaskCardState.Closed) && (
          <div
            className={`absolute top-0 left-0 bottom-0 right-0 bg-[#bfe6a1] flex justify-center items-center gap-x-3 transition-colors duration-500 ${
              state === TaskCardState.Closed ? "text-[#bfe6a1]" : "text-black"
            }`}
          >
            <p className={`font-bold text-[14pt]`}>Great work!</p>
            <p className="text-[12pt] ">
              We&apos;ll let you know when we have results
            </p>
          </div>
        )}

        {action.commitmentThreshold && (
          <div className="mt-6">
            <div className="flex flex-row items-center justify-between w-full gap-x-2">
              <p className="text-zinc-500 text-base mb-1">
                {liveUserCount ?? 0} / {action.usersJoined} completed
                {friendCompletionActivities.length > 0 && (
                  <>
                    , including {friendCompletionActivities.length} friend
                    {friendCompletionActivities.length === 1 ? "" : "s"}
                  </>
                )}
              </p>
              <UserProfilePicRow
                users={friendCompletionActivities.map(
                  (activity) => activity.user
                )}
              />
            </div>
            <CompletedBar
              percentage={(liveUserCount ?? 0 / action.usersJoined) * 100}
            />
          </div>
        )}
      </Card>

      {/* {commitActivity && (
        <div className="flex flex-col border-x border-b rounded-b-md border-zinc-300 bg-zinc-50 p-4">
          <div className="flex flex-row gap-y-2 bg-zinc-50 text-sm items-center gap-x-4">
            <p className="text-zinc-600 flex-1">
              {commitActivity.type === "user_joined"
                ? `You committed ${formatTime(
                    new Date(commitActivity.createdAt),
                    {
                      addSuffix: true,
                    }
                  )}`
                : `You completed ${formatTime(
                    new Date(commitActivity.createdAt),
                    {
                      addSuffix: true,
                    }
                  )}`}
            </p>
            <p className="text-zinc-600">{commitActivity.likes.length} likes</p>
            <p
              className="text-zinc-600 cursor-pointer"
              onClick={() => setToggleComments(!toggleComments)}
            >
              Reply
            </p>
          </div>
          {toggleComments && (
            <div className="mt-2">
              <Comments
                objectId={commitActivity.id}
                type={"activity"}
                homeStyle
              />
            </div>
          )}
        </div>
      )} */}
    </div>
  );
};

export default TaskCard;
