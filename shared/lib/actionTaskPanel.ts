import { useCallback, useState } from "react";
import {
  ActionDto,
  actionsComplete,
  FormResponseDto,
  SubmitFormDto,
  tasksOptout,
} from "../client";

export interface ActionTaskPanelPropsShared {
  action: ActionDto;
  onCompleteAction: () => boolean | void | Promise<boolean | void>;
  onOptOutAction: () => void;
  disabled?: boolean;
  formResponse?: FormResponseDto;
  guestMode?: boolean;
}

/** A member's withdrawal from an action, as collected by the task form UI. */
export type ActionWithdrawal = {
  outOfTime: boolean;
  isMoral: boolean;
  reason: string;
  partialFormData: SubmitFormDto;
};

/** Options offered in the withdrawal UI, in display order. */
export const WITHDRAWAL_OPTION_LABELS = {
  out_of_time: "Took more than 15 minutes",
  moral: "Moral objection",
  other: "Other reason",
} as const;
export type WithdrawalOption = keyof typeof WITHDRAWAL_OPTION_LABELS;
export const WITHDRAWAL_OPTIONS = Object.keys(
  WITHDRAWAL_OPTION_LABELS,
) as WithdrawalOption[];

export const useTaskFormHandlers = ({
  action,
  onCompleteAction,
  onOptOutAction,
  guestMode = false,
}: Pick<
  ActionTaskPanelPropsShared,
  "action" | "onCompleteAction" | "onOptOutAction" | "guestMode"
>) => {
  const [actionError, setActionError] = useState<string | null>(null);

  const handleComplete = useCallback(
    async (sendComplete: boolean = true) => {
      if (sendComplete && !guestMode) {
        const req = await actionsComplete({
          path: { id: action.id },
        });
        if (req.error) {
          setActionError("Something went wrong. Please try again.");
          return false;
        }
      }
      setActionError(null);
      return onCompleteAction();
    },
    [action, guestMode, onCompleteAction],
  );

  const handleAbandonAction = useCallback(
    async (withdrawal: ActionWithdrawal) => {
      const { outOfTime, isMoral, reason, partialFormData } = withdrawal;
      const req = await tasksOptout({
        path: { id: action.taskFormId! },
        body: {
          actionId: action.id,
          reason,
          outOfTime,
          isMoral,
          partialFormData,
        },
      });
      if (req.error) {
        setActionError("Something went wrong. Please try again.");
        return;
      }
      setActionError(null);
      onOptOutAction();
    },
    [action, onOptOutAction],
  );

  return {
    handleCompleteWithTracking: handleComplete,
    handleAbandonAction,
    actionError,
  };
};
