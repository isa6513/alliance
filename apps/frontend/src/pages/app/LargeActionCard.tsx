import { useCallback, useEffect, useState } from "react";
import { href, useNavigate } from "react-router";

import Button, { ButtonColor } from "@alliance/sharedweb/ui/Button";
import ActionTaskPanel from "../../components/ActionTaskPanel";
import ActionCompletedBarWithInfo from "./ActionCompletedBarWithInfo";
import TaskTimeInfo from "./TaskTimeInfo";
import { ChevronRight, X } from "lucide-react";
import {
  getLastAndNextEvent,
  LargeActionCardPropsShared,
} from "@alliance/shared/lib/largeActionCard";
import { TaskAwayStatus } from "@alliance/shared/lib/actionUtils";
import { CardStyle } from "@alliance/shared/styles/card";
import Card from "@alliance/sharedweb/ui/Card";
import {
  TASK_MESSAGE_CURRENTLY_AWAY,
  TASK_MESSAGE_WAS_AWAY,
  TASK_MESSAGE_WILL_BE_AWAY,
} from "@alliance/shared/lib/copy";

export interface LargeActionCardProps extends LargeActionCardPropsShared {
  showDetails?: boolean;
  className?: string;
}

enum LargeActionCardState {
  Minified = "minified",
  Default = "default",
  Confirming = "confirming",
  Completed = "completed",
  Committed = "committed",
  Closed = "closed",
  Declined = "declined",
}

const LargeActionCard: React.FC<LargeActionCardProps> = ({
  action,
  handleDismissAction = () => {},
  userRelation,
  friendActivities,
  onUpdateActionState,
  showDetails = true,
  className = "",
}: LargeActionCardProps) => {
  const navigate = useNavigate();

  const [state, setState] = useState<LargeActionCardState>(
    LargeActionCardState.Default
  );

  useEffect(() => {
    setState(LargeActionCardState.Default);
  }, [action]);

  const handleUpdateActionState = useCallback(() => {
    setState(LargeActionCardState.Closed);
    setTimeout(() => {
      onUpdateActionState();
    }, 200);
  }, [onUpdateActionState]);

  const goToActionPage = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      navigate(href("/actions/:id", { id: action.id.toString() }));
    },
    [navigate, action]
  );

  const { lastEvent, nextEvent } = getLastAndNextEvent(action);

  return (
    <>
      {action.awayStatus !== TaskAwayStatus.NOT_AWAY && (
        <Card
          style={CardStyle.Grey}
          className="gap-y-3 rounded-b-none border-b-0"
        >
          <div>
            {
              {
                [TaskAwayStatus.AWAY_CURRENTLY]: TASK_MESSAGE_CURRENTLY_AWAY,
                [TaskAwayStatus.AWAY_LATER]: TASK_MESSAGE_WILL_BE_AWAY,
                [TaskAwayStatus.AWAY_PREVIOUSLY]: TASK_MESSAGE_WAS_AWAY,
              }[action.awayStatus]
            }
          </div>
          <Button
            className="w-full gap-x-1"
            color={ButtonColor.Grey}
            onClick={handleDismissAction}
          >
            <X size={14} className="text-red-500" />
            Dismiss action
          </Button>
        </Card>
      )}
      <Card
        className={`p-6 border border-zinc-200 transition-all duration-300 ${
          state === LargeActionCardState.Closed
            ? "opacity-0 overflow-hidden"
            : "opacity-100"
        } ${className} w-full relative 
         ${state === LargeActionCardState.Minified ? "pb-4" : ""} ${
          action.awayStatus === TaskAwayStatus.NOT_AWAY ? "rounded" : "rounded-t-none"
        }`}
      >
        <div className="p-0 sm:p-2">
          <div className="flex sm:flex-row gap-4 items-start mb-4 flex-col-reverse">
            <div className="flex flex-col flex-1 gap-y-2">
              <p className="font-semibold text-2xl font-serif">{action.name}</p>
              <TaskTimeInfo
                action={action}
                nextEvent={nextEvent}
                lastEvent={lastEvent}
              />
            </div>
            {showDetails && (
              <Button
                color={ButtonColor.Transparent}
                onClick={goToActionPage}
                className="!px-4 flex gap-x-1 text-sm hover:bg-zinc-50 border border-zinc-200 text-black font-normal"
              >
                Details
                <ChevronRight size="15" className="-mr-1" />
              </Button>
            )}
          </div>
          <p className="mb-8">{action.shortDescription}</p>
          <ActionCompletedBarWithInfo
            friendActivities={friendActivities}
            action={action}
            textSize="base"
          />
          <div className="mt-6 border-t border-zinc-200 pt-6">
            <ActionTaskPanel
              action={action}
              userRelation={userRelation}
              onCompleteAction={handleUpdateActionState}
              onJoinAction={handleUpdateActionState}
              onDeclineAction={handleUpdateActionState}
              onOptOutAction={handleUpdateActionState}
            />
          </div>
        </div>
      </Card>
    </>
  );
};

export default LargeActionCard;
