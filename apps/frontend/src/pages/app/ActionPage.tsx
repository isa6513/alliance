import {
  ActionDto,
  actionsFindOne,
  actionsMyStatus,
  UserActionRelation,
} from "@alliance/shared/client";
import { Outlet, useParams } from "react-router";
import { Route } from "../../../.react-router/types/src/pages/app/+types/ActionPage";
import ActionActivityList from "../../components/ActionActivityList";
import ActionEventsPanel from "../../components/ActionEventsPanel";
import { TaskPanelContext } from "../../components/ActionPageTaskPanel";
import { useWhiteBackground } from "../../components/HtmlBackgroundManager";
import useActivities, { ActivityList } from "./useActivities";
import { useCIDFromParams } from "../../lib/utils";
import { useApiCall } from "@alliance/shared/lib/apiCall";
import { useEffect, useState } from "react";
import { useAuth } from "../../lib/AuthContext";
import Spinner from "../../components/Spinner";

export default function ActionPage() {
  const { id: idParam } = useParams();

  const actionId = parseInt(idParam!);

  useWhiteBackground();

  const { data: action, loading } = useApiCall(actionsFindOne, {
    path: { id: actionId },
  });

  const [userRelation, setUserRelation] = useState<UserActionRelation | null>(
    null
  );
  const { isAuthenticated } = useAuth();

  useCIDFromParams();

  const { activities, handleLikeActivity, setActivities } = useActivities({
    list: ActivityList.Action,
    objectId: actionId,
  });

  useEffect(() => {
    if (isAuthenticated && actionId) {
      actionsMyStatus({
        path: { id: actionId },
      }).then((response) => {
        if (response.data) {
          setUserRelation(response.data.relation);
        }
      });
    }
  }, [isAuthenticated, actionId]);

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
              userRelation,
              onCompleteAction: () => setUserRelation("completed"),
              onJoinAction: () => setUserRelation("joined"),
              onDeclineAction: () => setUserRelation("declined"),
              onOptOutAction: () => setUserRelation("declined"),
              activities,
              handleLikeActivity,
              setActivities,
            } satisfies TaskPanelContext
          }
        />
      </div>
      <div
        className="w-[360px] shrink-0 sticky top-[var(--nav-height)] self-start divide-y divide-zinc-200 hidden md:flex flex-col *:py-5 p-10 pt-14 border-l border-zinc-200 overflow-auto"
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
  );
}
