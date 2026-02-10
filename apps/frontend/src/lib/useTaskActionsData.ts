import {
  ActionDto,
  actionsDismissAction,
  userGetAwayRanges,
} from "@alliance/shared/client";
import { useActionsQuery } from "@alliance/shared/lib/actionsListPage";
import {
  ActionWithAwayStatus,
  getAwayStatus,
} from "@alliance/shared/lib/actionUtils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

export function useTaskActionsData(): {
  actions: ActionWithAwayStatus[] | null;
  loading: boolean;
  handleDismissAction: (actionId: number) => Promise<void>;
} {
  const queryClient = useQueryClient();
  const {
    data: actionsData,
    isLoading: actionsLoading,
    isError: actionsError,
  } = useActionsQuery();
  const {
    data: awayRanges = [],
    isLoading: awayRangesLoading,
    isError: awayRangesError,
  } = useQuery({
    queryKey: ["userGetAwayRanges"],
    queryFn: () => userGetAwayRanges().then((response) => response.data ?? []),
  });

  const loading = actionsLoading || awayRangesLoading;

  const actions = useMemo<ActionWithAwayStatus[] | null>(() => {
    if (loading || actionsError || awayRangesError) {
      return null;
    }

    const now = new Date();
    return (actionsData ?? []).map((action) => ({
      ...action,
      awayStatus: getAwayStatus(action, awayRanges, now),
    }));
  }, [actionsData, awayRanges, loading, actionsError, awayRangesError]);

  const handleDismissAction = useCallback(
    async (actionId: number) => {
      await actionsDismissAction({
        path: { id: actionId },
      });

      queryClient.setQueryData<ActionDto[] | undefined>(["actions"], (prev) =>
        prev?.map((action) =>
          action.id === actionId
            ? { ...action, shouldParticipate: false }
            : action
        )
      );
    },
    [queryClient]
  );

  return { actions, loading, handleDismissAction };
}
