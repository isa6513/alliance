import {
  ActionDto,
  actionsFindOne,
  actionsMyStatus,
  UserActionRelation,
} from "@alliance/shared/client";
import { useEffect, useMemo, useState } from "react";
import {
  Outlet,
  useLoaderData,
  useParams,
  useRouteLoaderData,
} from "react-router";
import { Route } from "../../../.react-router/types/src/pages/app/+types/ActionPage";
import ActionActivityList from "../../components/ActionActivityList";
import ActionEventsPanel from "../../components/ActionEventsPanel";
import { TaskPanelContext } from "../../components/ActionPageTaskPanel";
import { useWhiteBackground } from "../../components/HtmlBackgroundManager";
import { useAuth } from "../../lib/AuthContext";
import { testActions } from "../../stories/testData";
import useActivities, { ActivityList } from "./useActivities";
import { useCIDFromParams } from "../../lib/utils";

// export async function loader({
//   params,
// }: Route.LoaderArgs): Promise<ActionDto | null> {
//   return action.data ?? null;
// }

export async function clientLoader({
  params,
}: Route.ClientLoaderArgs): Promise<ActionDto | null> {
  if (!params.id || isNaN(parseInt(params.id))) {
    return null;
  }
  const action = await actionsFindOne({
    path: { id: parseInt(params.id) },
  });

  return action.data ?? null;
}
clientLoader.hydrate = true as const; // (3)

export function meta({ data }: Route.MetaArgs) {
  const action = data as ActionDto | undefined;
  if (!action) {
    return [{ title: "Alliance" }];
  }
  return [
    { title: action.name },
    { name: "description", content: action.shortDescription },
  ];
}

export default function ActionPage() {
  const { id: idParam } = useParams();

  useWhiteBackground();

  const loaderData = useLoaderData<typeof clientLoader>();

  const action = useMemo(() => {
    if (import.meta.env.STORYBOOK) {
      return { ...testActions[0], locations: [] };
    }
    return loaderData;
  }, [loaderData]);
  const id = idParam || String(action?.id);

  const [userRelation, setUserRelation] = useState<UserActionRelation | null>(
    null
  );
  const { isAuthenticated } = useAuth();

  useCIDFromParams();

  const actionId = action?.id || 0;

  const { activities, handleLikeActivity, setActivities } = useActivities({
    list: ActivityList.Action,
    objectId: actionId,
  });

  useEffect(() => {
    if (isAuthenticated && id) {
      actionsMyStatus({
        path: { id: parseInt(id) },
      }).then((response) => {
        if (response.data) {
          setUserRelation(response.data.relation);
        }
      });
    }
  }, [isAuthenticated, id]);

  if (!action) {
    return (
      <div className="bg-page pt-20 px-8 md:px-16">
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-center text-zinc-500">not found</p>
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

export function useActionLoaderData() {
  const action = useRouteLoaderData<typeof clientLoader>(
    "pages/app/ActionPage"
  ); //TODO: why is this based on file path
  return action;
}
