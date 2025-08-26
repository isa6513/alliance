import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { ActionDto, UserActionRelation } from "@alliance/shared/client";
import { ActionActivityDto } from "@alliance/shared/client/types.gen";
import Button, { ButtonColor } from "@alliance/shared/ui/Button";
import Card, { CardStyle } from "@alliance/shared/ui/Card";
import ActionTaskPanel from "../../components/ActionTaskPanel";
import CompletedBar from "../../components/CompletedBar";
import ClockIcon from "../../components/icons/ClockIcon";
import UserProfilePicRow from "../../components/UserProfilePicRow";
import { useActionCount } from "../../lib/useActionWebSocket";

export interface LargeActionCardProps {
  action: ActionDto;
  userRelation: Extract<UserActionRelation, "joined" | "none">;
  friendActivities: ActionActivityDto[];
  onComplete: (actionId: number) => void;
  onJoin: (actionId: number) => void;
}

enum TaskCardState {
  Minified = "minified",
  Default = "default",
  Confirming = "confirming",
  Completed = "completed",
  Closed = "closed",
}

const LargeActionCard: React.FC<LargeActionCardProps> = ({
  action,
  userRelation,
  friendActivities = [],
  onComplete,
  onJoin,
}: LargeActionCardProps) => {
  const navigate = useNavigate();

  const [state, setState] = useState<TaskCardState>(TaskCardState.Default);

  const liveUserCount = useActionCount(action.id);

  const goToActionPage = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      navigate(`/actions/${action.id}`);
    },
    [navigate, action]
  );

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

  const handleCompleteAction = () => {
    onComplete(action.id);
  };

  const handleJoinAction = () => {
    console.log("join action", action.id);
    onJoin(action.id);
  };

  const threshold =
    action.status === "gathering_commitments"
      ? action.commitmentThreshold ?? 10
      : action.usersJoined;

  return (
    <Card
      style={CardStyle.White}
      className={`shadow-lg transition-all duration-500 w-full relative
         ${state === TaskCardState.Minified ? "pb-4" : ""}
          ${state === TaskCardState.Closed ? "py-0 border-0" : ""}`}
      closed={state === TaskCardState.Closed}
    >
      <div className="p-2">
        {!!action.timeEstimate && (
          <div className="flex flex-row items-center gap-x-2 text-base text-zinc-500 mb-1">
            <ClockIcon />
            <p className="text-green">{`${action.timeEstimate} minute${
              action.timeEstimate === 1 ? "" : "s"
            }`}</p>
          </div>
        )}
        <div className="flex flex-row items-start gap-x-8">
          <div className="flex-1 flex flex-col">
            <p className="font-medium text-lg text-black">{action.name}</p>
            <p className="text-zinc-500">{action.shortDescription}</p>

            {/* {action.type === "Funding" && <Badge>$5</Badge>}
          {action.type === "Activity" && !!action.timeEstimate && (
            <Badge>takes {action.timeEstimate}</Badge>
          )}
          {action.type === "Ongoing" && <Badge>3 week commitment</Badge>} */}
          </div>
          <div className="w-24 flex flex-col gap-y-2">
            <Button
              color={ButtonColor.Transparent}
              onClick={goToActionPage}
              className="w-full text-sm hover:bg-zinc-50 border border-zinc-200 text-black font-normal"
            >
              Details
            </Button>
          </div>
        </div>
        <div className="mt-6">
          <div>
            <div className="flex flex-row items-center justify-between w-full gap-x-2">
              <p className="text-zinc-500 text-base mb-1">
                {liveUserCount ?? 0} / {threshold}{" "}
                {action.status === "gathering_commitments"
                  ? "committed"
                  : "completed"}
                {friendActivities.length > 0 && (
                  <>
                    , including {friendActivities.length} friend
                    {friendActivities.length === 1 ? "" : "s"}
                  </>
                )}
              </p>
              <UserProfilePicRow
                users={friendActivities.map((activity) => activity.user)}
              />
            </div>
            <CompletedBar percentage={(liveUserCount ?? 0 / threshold) * 100} />
          </div>
        </div>
        <div className="mt-4">
          <ActionTaskPanel
            action={action}
            userRelation={userRelation}
            handleCompleteAction={handleCompleteAction}
            handleJoinAction={handleJoinAction}
          />
        </div>
      </div>
    </Card>
  );
};

export default LargeActionCard;
