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
import posthog from "posthog-js";

export interface ActionTaskPanelProps {
  action: ActionDto;
  userRelation: Extract<UserActionRelation, "joined" | "none">;
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
}: ActionTaskPanelProps) => {
  const [actionError, setActionError] = useState<string | null>(null);

  const handleCompleteWithTracking = useCallback(
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
      posthog.capture("action_completed", {
        actionId: action.id,
        actionType: action.type,
        actionName: action.name,
      });
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

  const handleFormStarted = useCallback(() => {
    posthog.capture("form_started", {
      actionId: action.id,
      actionType: action.type,
      actionName: action.name,
    });
  }, [action]);

  return {
    handleCompleteWithTracking,
    handleJoinAction,
    handleDeclineAction,
    handleAbandonAction,
    handleFormStarted,
    actionError,
  };
};
