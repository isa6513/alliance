import { useCallback, useMemo } from "react";
import { ActionDto } from "../client";
import {
  ActionWithAwayStatus,
  getPastEvents,
  TaskAwayStatus,
} from "./actionUtils";

export function canCompleteAction(action: ActionDto) {
  return (
    getPastEvents(action).some(
      (event) => event.newStatus === "member_action"
    ) &&
    (action.userRelation === "joined" ||
      (action.commitmentless && action.userRelation !== "completed")) &&
    action.userRelation !== "declined" &&
    (action.canParticipate || action.publicOnly)
  );
}

export function shouldCompleteAction(action: ActionDto) {
  return (
    canCompleteAction(action) &&
    action.shouldParticipate &&
    (action.status === "member_action" ||
      action.status === "gathering_commitments") &&
    !action.publicOnly
  );
}

export function isCurrentlyCompletedAction(action: ActionDto) {
  return (
    action.shouldParticipate &&
    (action.status === "member_action" ||
      action.status === "gathering_commitments") &&
    !action.everyoneShouldComplete &&
    action.userRelation === "completed"
  );
}

export function canJoinAction(action: ActionDto) {
  return (
    action.status === "gathering_commitments" &&
    action.userRelation === "none" &&
    action.canParticipate
  );
}

function getDeadlineTimestamp(action: ActionDto): number {
  let i = 0;
  // Find first 'member_action' or 'gathering_commitments' event
  while (
    action.events[i] &&
    action.events[i].newStatus !== "member_action" &&
    action.events[i].newStatus !== "gathering_commitments"
  ) {
    i++;
  }

  // Find next non-'member_action' or 'gathering_commitments' event
  while (
    action.events[i] &&
    (action.events[i].newStatus === "member_action" ||
      action.events[i].newStatus === "gathering_commitments")
  ) {
    i++;
  }

  const nextEvent = action.events[i];
  if (!nextEvent) {
    return Infinity;
  }

  return new Date(nextEvent.date).getTime();
}

export function actionPriorityComparator(
  actionA: ActionDto,
  actionB: ActionDto
): number {
  // Sort by priority
  if (actionA.priority !== actionB.priority) {
    return actionB.priority - actionA.priority;
  }

  // Sort by earliest deadline first
  const deadlineA = getDeadlineTimestamp(actionA);
  const deadlineB = getDeadlineTimestamp(actionB);
  if (deadlineA !== Infinity || deadlineB !== Infinity) {
    return deadlineA - deadlineB;
  }

  // Both do not have deadlines: sort by earliest member action
  const memberActionA = actionA.events.find(
    (event) =>
      event.newStatus === "member_action" ||
      event.newStatus === "gathering_commitments"
  );
  if (!memberActionA) {
    return 1;
  }
  const memberActionB = actionB.events.find(
    (event) =>
      event.newStatus === "member_action" ||
      event.newStatus === "gathering_commitments"
  );
  if (!memberActionB) {
    return -1;
  }
  return (
    new Date(memberActionA.date).getTime() -
    new Date(memberActionB.date).getTime()
  );
}

export function useHomePageActions(actions: ActionWithAwayStatus[] | null) {
  const todoActions = useMemo(() => {
    return (
      actions
        ?.filter((action) => shouldCompleteAction(action))
        .sort(actionPriorityComparator) || []
    );
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
    newActions[0] || todoActions[0] || null;

  const currentWeekTodoActions = todoActions.filter((action) => {
    return isActionInCurrentWeek(action);
  });
  const nextWeekTodoActions = todoActions.filter((action) => {
    return !isActionInCurrentWeek(action);
  });

  const remainingTasksEstimatedTimeCurrentWeek = currentWeekTodoActions.reduce(
    (sum, action) => {
      if (
        action.awayStatus === TaskAwayStatus.NOT_AWAY &&
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
