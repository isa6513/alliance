import {
  ActionDto,
  actionsFindOne,
  actionsMyStatus,
  notifsLinkClick,
  UserActionRelation,
} from "@alliance/shared/client";
import { useEffect, useMemo, useState } from "react";
import {
  data,
  Outlet,
  useLoaderData,
  useParams,
  useRouteLoaderData,
  useSearchParams,
} from "react-router";
import { Route } from "../../../.react-router/types/src/pages/app/+types/ActionPage";
import ActionActivityList from "../../components/ActionActivityList";
import ActionEventsPanel from "../../components/ActionEventsPanel";
import { TaskPanelContext } from "../../components/ActionPageTaskPanel";
import { useWhiteBackground } from "../../components/HtmlBackgroundManager";
import { useAuth } from "../../lib/AuthContext";
import { testActions } from "../../stories/testData";
import useActivities, { ActivityList } from "./useActivities";
import posthog from "posthog-js";

export async function loader({
  params,
}: Route.LoaderArgs): Promise<ActionDto | null> {
  if (!params.id || isNaN(parseInt(params.id))) {
    return null;
  }
  const action = await actionsFindOne({
    path: { id: parseInt(params.id) },
  });

  if (!action.data) {
    return null;
  }

  return { ...action.data };
}

export async function clientLoader({
  params,
  serverLoader,
}: Route.ClientLoaderArgs): Promise<ActionDto | undefined> {
  const serverData = await serverLoader();
  if (serverData) {
    return serverData;
  }

  if (!params.id || isNaN(parseInt(params.id))) {
    return undefined;
  }
  const action = await actionsFindOne({
    path: { id: parseInt(params.id) },
  });

  console.log(params);
  if (!action.data) {
    throw data("Record Not Found", { status: 404 });
  }

  return { ...action.data };
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

  const loaderData = useLoaderData<typeof loader>();

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

  const [searchParams, setSearchParams] = useSearchParams();
  const cid = searchParams.get("cid");

  useEffect(() => {
    if (cid) {
      posthog.register_for_session({ cid });

      notifsLinkClick({
        body: { cid },
      }).then((response) => {
        let platform = "unknown";
        if (response.data) {
          platform = response.data.mms ? "mms" : "email";
          setSearchParams({});
        }
        posthog.capture("notif_link_click", {
          cid,
          platform,
        });
        console.log("capturing for platform", platform);
      });
    }
  }, [cid, setSearchParams]);

  const actionId = action?.id || 0;

  //   const { activities: liveActivities } = useActionActivity(actionId);

  const { activities, handleLikeActivity, setActivities } = useActivities({
    list: ActivityList.Action,
    objectId: actionId,
  });

  useEffect(() => {
    if (isAuthenticated && id) {
      actionsMyStatus({
        path: { id },
      }).then((response) => {
        console.log("response", response);
        if (response.error) {
          console.error("Failed to fetch user status", response.error);
        }
        console.log("response", response);
        if (response.data) {
          setUserRelation(response.data.relation);
        }
      });
    }
  }, [isAuthenticated, id]);

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
        {action && (
          <>
            <ActionEventsPanel action={action} events={action.events} />
            <ActionActivityList
              actionId={action.id}
              activities={activities}
              loading={false}
              onLikeActivity={handleLikeActivity}
              setActivities={setActivities}
              maxN={5}
            />
          </>
        )}
      </div>
    </div>
  );
}

export function useActionLoaderData() {
  const action = useRouteLoaderData<typeof loader>("pages/app/ActionPage"); //TODO: why is this based on file path
  return action;
}
