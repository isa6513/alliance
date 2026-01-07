import { useCallback, useState } from "react";
import {
  ActionDto,
  actionsComplete,
  actionsDecline,
  actionsJoin,
  SubmitFormDto,
  tasksOptout,
  UserActionRelation,
} from "../client";

export interface ActionTaskPanelProps {
  action: ActionDto;
  userRelation: UserActionRelation;
  missedDeadline?: boolean;
  onCompleteAction: () => void;
  onJoinAction: () => void;
  onDeclineAction: () => void;
  onOptOutAction: () => void;
  card?: boolean;
  disabled?: boolean;
}

export const useTaskFormHandlers = ({
  action,
  onCompleteAction,
  onJoinAction,
  onDeclineAction,
  onOptOutAction,
}: Pick<
  ActionTaskPanelProps,
  | "action"
  | "onCompleteAction"
  | "onJoinAction"
  | "onDeclineAction"
  | "onOptOutAction"
>) => {
  const [actionError, setActionError] = useState<string | null>(null);

  const handleComplete = useCallback(
    async (sendComplete: boolean = true) => {
      if (sendComplete) {
        const req = await actionsComplete({
          path: { id: action.id },
        });
        if (req.error) {
          setActionError("Something went wrong. Please try again.");
          return;
        }
      }
      setActionError(null);
      onCompleteAction();
    },
    [action, onCompleteAction]
  );

  const handleJoinAction = useCallback(async () => {
    const req = await actionsJoin({
      path: { id: action.id },
    });
    if (req.error) {
      setActionError("Something went wrong. Please try again.");
      return;
    }
    setActionError(null);
    onJoinAction();
  }, [action, onJoinAction]);

  const handleDeclineAction = useCallback(
    async (moral: boolean, reason: string) => {
      const req = await actionsDecline({
        path: { id: action.id },
        body: { reason, moral },
      });
      if (req.error) {
        setActionError("Something went wrong. Please try again.");
        return;
      }
      setActionError(null);
      onDeclineAction();
    },
    [action, onDeclineAction]
  );

  const handleAbandonAction = useCallback(
    async (
      outOfTime: boolean,
      reason: string,
      partialFormData: SubmitFormDto
    ) => {
      const req = await tasksOptout({
        path: { id: action.taskFormId! },
        body: { actionId: action.id, reason, outOfTime, partialFormData },
      });
      if (req.error) {
        setActionError("Something went wrong. Please try again.");
        return;
      }
      setActionError(null);
      onOptOutAction();
    },
    [action, onOptOutAction]
  );

  return {
    handleCompleteWithTracking: handleComplete,
    handleJoinAction,
    handleDeclineAction,
    handleAbandonAction,
    actionError,
  };
};
