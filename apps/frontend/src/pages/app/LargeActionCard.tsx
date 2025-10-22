import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { ActionDto, UserActionRelation } from "@alliance/shared/client";
import { ActionActivityDto } from "@alliance/shared/client/types.gen";
import Button, { ButtonColor } from "@alliance/shared/ui/Button";
import Card, { CardStyle } from "@alliance/shared/ui/Card";
import ActionTaskPanel from "../../components/ActionTaskPanel";
import ActionCompletedBarWithInfo from "./ActionCompletedBarWithInfo";
import TaskTimeInfo from "./TaskTimeInfo";

export interface LargeActionCardProps {
  action: ActionDto;
  userRelation: Extract<UserActionRelation, "joined" | "none">;
  friendActivities: ActionActivityDto[];
  onUpdateActionState: () => void;
  showDetails?: boolean;
  className?: string;
}

export function getLastAndNextEvent(action: ActionDto) {
  const pastEvents = action.events.filter(
    (event) => new Date(event.date) <= new Date(),
  );

  const futureEvents = action.events.filter(
    (event) => new Date(event.date) > new Date(),
  );

  const lastEvent = pastEvents[pastEvents.length - 1];
  const nextEvent = futureEvents.length > 0 ? futureEvents[0] : null;

  return { lastEvent, nextEvent };
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
  userRelation,
  friendActivities,
  onUpdateActionState,
  showDetails = true,
  className = "",
}: LargeActionCardProps) => {
  const navigate = useNavigate();

  const [state, setState] = useState<LargeActionCardState>(
    LargeActionCardState.Default,
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
      navigate(`/actions/${action.id}`);
    },
    [navigate, action],
  );

  const { lastEvent, nextEvent } = getLastAndNextEvent(action);

  return (
    <Card
      style={CardStyle.White}
      className={`transition-all duration-300 ${
        state === LargeActionCardState.Closed
          ? "opacity-0 overflow-hidden"
          : "opacity-100"
      } ${className} w-full relative p-6
         ${state === LargeActionCardState.Minified ? "pb-4" : ""}`}
    >
      <div className="p-0 sm:p-2">
        <div className="flex flex-col sm:flex-row gap-x-2 items-start mb-1">
          {showDetails && (
            <Button
              color={ButtonColor.Transparent}
              onClick={goToActionPage}
              className="!px-6 block mb-4 sm:hidden text-sm hover:bg-zinc-50 border border-zinc-200 text-black font-normal"
            >
              Details
            </Button>
          )}
          <div className="flex flex-col flex-1">
            <TaskTimeInfo
              action={action}
              nextEvent={nextEvent}
              lastEvent={lastEvent}
            />
            <p className="font-medium text-lg">{action.name}</p>
          </div>
          {showDetails && (
            <Button
              color={ButtonColor.Transparent}
              onClick={goToActionPage}
              className="!px-6 hidden sm:block text-sm hover:bg-zinc-50 border border-zinc-200 text-black font-normal"
            >
              Details
            </Button>
          )}
        </div>
        <p className="mb-4">{action.shortDescription}</p>
        <ActionCompletedBarWithInfo
          friendActivities={friendActivities}
          action={action}
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
  );
};

export default LargeActionCard;
