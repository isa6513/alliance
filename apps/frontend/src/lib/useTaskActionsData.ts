import type { GeneralUpdateDto } from "@alliance/shared/client";
import {
  ActionDto,
  actionsDismissAction,
  actionsDismissGeneralUpdate,
  actionsUnreadGeneralUpdates,
} from "@alliance/shared/client";
import { useActionsQuery } from "@alliance/shared/lib/actionsListPage";
import {
  ActionWithAwayStatus,
  getAwayStatusAt,
} from "@alliance/shared/lib/actionUtils";
import { useMyAwayRanges } from "@alliance/shared/lib/useMyAwayRanges";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

const GENERAL_UPDATES_QUERY_KEY = [
  "actions",
  "generalUpdates",
  "unread",
] as const;

export function useTaskActionsData(options?: {
  refetchInterval?: number | false;
}): {
  actions: ActionWithAwayStatus[] | null;
  generalUpdates: GeneralUpdateDto[] | null;
  loading: boolean;
  handleDismissAction: (actionId: number) => Promise<void>;
  handleDismissGeneralUpdate: (generalUpdateId: number) => Promise<void>;
} {
  const queryClient = useQueryClient();
  const {
    data: actionsData,
    isLoading: actionsLoading,
    isError: actionsError,
  } = useActionsQuery({ refetchInterval: options?.refetchInterval });
  const {
    awayRanges,
    isPending: awayRangesLoading,
    isError: awayRangesError,
  } = useMyAwayRanges();
  const {
    data: generalUpdatesData,
    isLoading: generalUpdatesLoading,
    isError: generalUpdatesError,
  } = useQuery({
    queryKey: GENERAL_UPDATES_QUERY_KEY,
    queryFn: () =>
      actionsUnreadGeneralUpdates().then((response) => response.data ?? []),
  });

  const loading = actionsLoading || awayRangesLoading || generalUpdatesLoading;

  const actions = useMemo<ActionWithAwayStatus[] | null>(() => {
    if (loading || actionsError || awayRangesError) {
      return null;
    }

    const now = new Date();
    return (actionsData ?? []).map((action) => ({
      ...action,
      awayStatus: getAwayStatusAt(action, awayRanges, now),
    }));
  }, [actionsData, awayRanges, loading, actionsError, awayRangesError]);

  const generalUpdates = useMemo<GeneralUpdateDto[] | null>(() => {
    if (loading || generalUpdatesError) {
      return null;
    }
    return generalUpdatesData ?? [];
  }, [generalUpdatesData, loading, generalUpdatesError]);

  const handleDismissAction = useCallback(
    async (actionId: number) => {
      await actionsDismissAction({
        path: { id: actionId },
      });

      queryClient.setQueryData<ActionDto[] | undefined>(["actions"], (prev) =>
        prev?.map((action) =>
          action.id === actionId
            ? { ...action, shouldParticipate: false }
            : action,
        ),
      );
    },
    [queryClient],
  );

  const handleDismissGeneralUpdate = useCallback(
    async (generalUpdateId: number) => {
      await actionsDismissGeneralUpdate({
        path: { generalUpdateId },
      });

      queryClient.setQueryData<GeneralUpdateDto[] | undefined>(
        GENERAL_UPDATES_QUERY_KEY,
        (prev) => prev?.filter((u) => u.id !== generalUpdateId) ?? [],
      );
    },
    [queryClient],
  );

  return {
    actions,
    generalUpdates,
    loading,
    handleDismissAction,
    handleDismissGeneralUpdate,
  };
}
