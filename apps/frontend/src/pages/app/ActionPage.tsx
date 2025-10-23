import {
  ActionDto,
  actionsFindOne,
  UserActionRelation,
} from "@alliance/shared/client";
import { Outlet, useParams } from "react-router";
import ActionActivityList from "../../components/ActionActivityList";
import ActionEventsPanel from "../../components/ActionEventsPanel";
import { TaskPanelContext } from "../../components/ActionPageTaskPanel";
import { useWhiteBackground } from "../../components/HtmlBackgroundManager";
import useActivities, { ActivityList } from "./useActivities";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../lib/AuthContext";
import Spinner from "../../components/Spinner";
import { useCIDFromParams } from "../../lib/utils";

export default function ActionPage() {
  const { id: idParam } = useParams();

  const actionId = parseInt(idParam!);

  useWhiteBackground();

  const { isAuthenticated } = useAuth();

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

  useCIDFromParams();

  const { activities, handleLikeActivity, setActivities } = useActivities({
    list: ActivityList.Action,
    objectId: actionId,
  });

  if (!action) {
    return (
      <div className="bg-page pt-20 px-8 md:px-16">
        <div className="absolute inset-0 flex items-center justify-center">
          {loading ? (
            <Spinner />
          ) : (
            <p className="text-center text-zinc-500">Action not found</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="max-w-[1250px] mx-auto flex bg-white min-h-[calc(100vh-var(--nav-height))]"
      style={{ boxSizing: "border-box" }}
    >
      <div className="flex-1 p-3 sm:p-10">
        <Outlet
          context={
            {
              action,
              userRelation:
                (action.userRelation as UserActionRelation | undefined) ?? null,
              onCompleteAction: () =>
                setAction((action) => ({
                  ...action!,
                  userRelation: "completed",
                })),
              onJoinAction: () =>
                setAction((action) => ({ ...action!, userRelation: "joined" })),
              onDeclineAction: () =>
                setAction((action) => ({
                  ...action!,
                  userRelation: "declined",
                })),
              onOptOutAction: () =>
                setAction((action) => ({
                  ...action!,
                  userRelation: "declined",
                })),
              activities,
              handleLikeActivity,
              setActivities,
            } satisfies TaskPanelContext
          }
        />
      </div>
      <div
        className="sticky w-[360px] shrink-0 top-[var(--nav-height)] self-start divide-y divide-zinc-200 hidden md:flex flex-col"
        style={{ height: `calc(100vh - var(--nav-height))` }}
      >
        <div
          className="fixed w-[360px] shrink-0 top-[var(--nav-height)] self-start divide-y divide-zinc-200 hidden md:flex flex-col *:py-5 p-10 pt-14 border-l border-zinc-200 overflow-auto"
          style={{ height: `calc(100vh - var(--nav-height))` }}
        >
          <ActionEventsPanel action={action} events={action.events} />
          <ActionActivityList
            actionId={action.id}
            activities={activities}
            loading={false}
            onLikeActivity={handleLikeActivity}
            setActivities={setActivities}
            maxN={5}
          />
        </div>
      </div>
    </div>
  );
}
