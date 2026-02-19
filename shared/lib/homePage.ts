import { useCallback, useMemo } from "react";
import { ActionDto } from "../client";
import {
  ActionWithAwayStatus,
  canJoinAction,
  isCurrentlyCompletedAction,
  priorityComparator,
  shouldCompleteAction,
  showActionInSidebarList,
} from "./actionUtils";

export function useHomePageActions(actions: ActionWithAwayStatus[] | null) {
  const todoActions = useMemo(() => {
    return actions?.filter(shouldCompleteAction).sort(priorityComparator) ?? [];
  }, [actions]);

  const newActions =
    actions
      ?.filter((action) => canJoinAction(action))
      .sort((a, b) => {
        return b.priority - a.priority;
      }) || [];

  const isActionDeadlineWithinDays = useCallback(
    (action: ActionDto, days: number) => {
      const deadlineEvent = action.events.find(
        (event) => event.newStatus === "office_action"
      );
      if (!deadlineEvent) {
        return true;
      }
      return (
        new Date(deadlineEvent.date) <
        new Date(new Date().setDate(new Date().getDate() + days))
      );
    },
    []
  );

  const doesCurrentWeekHaveActions = useMemo(
    () =>
      todoActions.some((action) => {
        return isActionDeadlineWithinDays(action, 7);
      }),
    [todoActions, isActionDeadlineWithinDays]
  );

  const isActionInCurrentWeek = useCallback(
    (action: ActionDto) => {
      if (doesCurrentWeekHaveActions) {
        return isActionDeadlineWithinDays(action, 7);
      } else {
        return isActionDeadlineWithinDays(action, 14);
      }
    },
    [doesCurrentWeekHaveActions, isActionDeadlineWithinDays]
  );

  const currentTask: ActionWithAwayStatus | null =
    (newActions.length > 0 && newActions[0]) ||
    (todoActions.length > 0 && todoActions[0]) ||
    null;

  const currentWeekTodoActions = todoActions.filter((action) => {
    return showActionInSidebarList(action) && isActionInCurrentWeek(action);
  });
  const nextWeekTodoActions = todoActions.filter((action) => {
    return showActionInSidebarList(action) && !isActionInCurrentWeek(action);
  });

  const remainingTasksEstimatedTimeCurrentWeek = currentWeekTodoActions.reduce(
    (sum, action) => {
      if (
        showActionInSidebarList(action) &&
        !action.optional &&
        action.timeEstimate
      ) {
        return sum + action.timeEstimate;
      }
      return sum;
    },
    0
  );

  const completedActions = useMemo(() => {
    return (
      actions?.filter((action) => isCurrentlyCompletedAction(action)) || []
    );
  }, [actions]);

  return {
    todoActions,
    newActions,
    currentTask,
    currentWeekTodoActions,
    nextWeekTodoActions,
    remainingTasksEstimatedTimeCurrentWeek,
    completedActions,
  };
}
