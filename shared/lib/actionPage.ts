import { useCallback, useEffect, useState } from "react";
import { ActionDto, actionsFindOne } from "../client";

export function useActionHandlers(
  actionId: number,
  isAuthenticated: boolean,
  reloadTasks: () => unknown
) {
  const [action, setAction] = useState<ActionDto | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAction = useCallback(async () => {
    try {
      setLoading(true);
      const actionResponse = await actionsFindOne({
        path: { id: actionId },
      });
      if (actionResponse.data) {
        setAction(actionResponse.data);
      } else {
        setAction(null);
      }
    } finally {
      setLoading(false);
    }
  }, [actionId]);

  useEffect(() => {
    fetchAction();
  }, [fetchAction, isAuthenticated]);

  const onCompleteAction = useCallback(async () => {
    if (!action) return;
    setAction((action) => ({
      ...action!,
      userRelation: "completed",
      usersCompleted: action!.usersCompleted + 1,
    }));
    reloadTasks();
  }, [action, reloadTasks]);

  const onJoinAction = useCallback(async () => {
    if (!action) return;
    setAction((action) => ({
      ...action!,
      userRelation: "joined",
    }));
    reloadTasks();
  }, [action, reloadTasks]);

  const onDeclineAction = useCallback(async () => {
    if (!action) return;
    setAction((action) => ({
      ...action!,
      userRelation: "declined",
    }));
    reloadTasks();
  }, [action, reloadTasks]);

  const onOptOutAction = useCallback(async () => {
    if (!action) return;
    setAction((action) => ({
      ...action!,
      userRelation: "declined",
    }));
    reloadTasks();
  }, [action]);

  return {
    action,
    loading,
    onCompleteAction,
    onJoinAction,
    onDeclineAction,
    onOptOutAction,
  };
}
