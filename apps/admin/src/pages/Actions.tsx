import {
  Action,
  ActionDto,
  actionsFindAllWithDrafts,
} from "@alliance/shared/client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import ActionTimeline from "../components/ActionTimeline";
import Button, { ButtonColor } from "@alliance/shared/ui/Button";
import ActionListCard from "../components/ActionListCard";

export const getLastPastEventDate = (
  action: Pick<ActionDto, "events">
): Date | null => {
  const now = Date.now();
  let latest: Date | null = null;

  for (const event of action.events) {
    if (!event?.date) {
      continue;
    }

    const eventDate = new Date(event.date);
    const eventTime = eventDate.getTime();

    if (Number.isNaN(eventTime) || eventTime > now) {
      continue;
    }

    if (!latest || eventDate > latest) {
      latest = eventDate;
    }
  }

  return latest;
};

type ActionSuiteGroup = {
  id: number | null;
  name: string;
  actions: Action[];
  sortDate: Date | null;
  isArchivedOnly: boolean;
};

const ActionsList: React.FC = () => {
  const [actions, setActions] = useState<Action[]>([]);
  const [actionsLoading, setActionsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadActions = useCallback(async () => {
    try {
      const response = await actionsFindAllWithDrafts();
      if (response.data) {
        setActions(response.data);
      }
      setActionsLoading(false);
    } catch (err) {
      setError("Failed to load actions");
      setActionsLoading(false);
      console.error(err);
    }
  }, []);

  useEffect(() => {
    loadActions();
  }, [loadActions]);

  const groupedActions = useMemo<ActionSuiteGroup[]>(() => {
    if (actions.length === 0) {
      return [];
    }

    const suites = new Map<
      string,
      {
        id: number | null;
        name: string;
        actions: Action[];
      }
    >();

    actions.forEach((action) => {
      const suiteId = action.suite?.id ?? null;
      const suiteKey =
        suiteId === null ? "suite-unspecified" : `suite-${suiteId}`;
      const suiteName = action.suite?.name ?? "No suite";
      const existing = suites.get(suiteKey);

      if (existing) {
        existing.actions.push(action);
        return;
      }

      suites.set(suiteKey, {
        id: suiteId,
        name: suiteName,
        actions: [action],
      });
    });

    return Array.from(suites.values())
      .map((suite) => {
        const suiteActions = suite.actions.slice();
        const nonArchivedActions = suiteActions.filter(
          (action) => !action.archived
        );
        const relevantActions =
          nonArchivedActions.length > 0 ? nonArchivedActions : suiteActions;

        const latestEventDate = relevantActions.reduce<Date | null>(
          (latest, action) => {
            const date = getLastPastEventDate(action);
            if (!date) {
              return latest;
            }

            if (!latest || date > latest) {
              return date;
            }

            return latest;
          },
          null
        );

        return {
          ...suite,
          actions: suiteActions,
          sortDate: latestEventDate,
          isArchivedOnly: suiteActions.every((action) => action.archived),
        };
      })
      .sort((a, b) => {
        if (a.isArchivedOnly && !b.isArchivedOnly) {
          return 1;
        }

        if (!a.isArchivedOnly && b.isArchivedOnly) {
          return -1;
        }

        const aDate = a.sortDate;
        const bDate = b.sortDate;

        if (!aDate || !bDate) {
          if (aDate && !bDate) {
            return -1;
          }
          if (!aDate && bDate) {
            return 1;
          }

          return 0;
        }

        return bDate.getTime() - aDate.getTime();
      });
  }, [actions]);

  if (actionsLoading) {
    return <p>Loading actions...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (actions.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="font-bold ml-2">Actions</p>
        </div>
        <p>No actions found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <title>Admin panel</title>
      <ActionTimeline
        actions={actions.filter(
          (a) =>
            !a.archived && !a.everyoneShouldComplete && a.status !== "completed"
        )}
        className="h-full"
      />
      <div className="flex items-center gap-x-2 px-5 my-4">
        <p className="font-bold ">All actions</p>
        <Button
          onClick={() => navigate("/actions/new")}
          className="hover:bg-green-2 text-white !px-3 !py-1 rounded-md text-sm"
          color={ButtonColor.Green}
        >
          New action
        </Button>
        <Button
          onClick={() => navigate("/new-suite")}
          className="bg-green-3 !px-3 !py-1 rounded-md text-sm"
          color={ButtonColor.White}
        >
          New suite
        </Button>
      </div>
      <p className="text-sm text-zinc-500 px-5">
        Grouped by suite and ordered by latest event (most recent first)
      </p>

      <div className="space-y-5 flex-1 overflow-y-auto p-5 pt-0">
        {groupedActions.map((suite) => (
          <div
            key={suite.id ?? "suite-unspecified"}
            className="border border-zinc-200 rounded-lg overflow-hidden"
          >
            <div className="px-4 py-2 border-b border-zinc-200 bg-zinc-50">
              {suite.id ? (
                <Link
                  to={`/suites/${suite.id}`}
                  className="text-sm font-semibold text-black hover:text-green"
                >
                  {suite.name}
                </Link>
              ) : (
                <p className="text-sm font-semibold text-black ">
                  {suite.name}
                </p>
              )}
            </div>
            <div className="space-y-3 p-4">
              {suite.actions.map((action) => (
                <ActionListCard key={action.id} action={action} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActionsList;
