import {
  ActionDto,
  actionsComplete,
  actionsDecline,
  actionsFindOne,
  actionsJoin,
  actionsMyStatus,
  actionsOptout,
  actionsUserLocations,
  LatLonDto,
  UserActionRelation,
} from "@alliance/shared/client";
import Card, { CardStyle } from "@alliance/shared/ui/Card";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  data,
  isRouteErrorResponse,
  Outlet,
  useLoaderData,
  useParams,
  useRouteLoaderData,
} from "react-router";
import { Route } from "../../../.react-router/types/src/pages/app/+types/ActionPage";
import { setRevalidate } from "../../applayout";
import ActionActivityList from "../../components/ActionActivityList";
import ActionEventsPanel from "../../components/ActionEventsPanel";
import { TaskPanelContext } from "../../components/ActionPageTaskPanel";
import TwoColumnSplit from "../../components/system/TwoColumnSplit";
import { useAuth } from "../../lib/AuthContext";
import { testActions } from "../../stories/testData";
import useActivities, { ActivityList } from "./useActivities";

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  console.error(error);
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div>
        <p className="font-bold pb-2">Could not load action</p>
        <p>
          {isRouteErrorResponse(error) && error.status === 404
            ? "Not found"
            : "API server is not responding. Please try again later."}
        </p>
      </div>
    </div>
  );
}

export async function loader({
  params,
}: Route.LoaderArgs): Promise<
  (ActionDto & { locations: LatLonDto[] }) | undefined
> {
  if (!params.id || isNaN(parseInt(params.id))) {
    return undefined;
  }
  const action = await actionsFindOne({
    path: { id: parseInt(params.id) },
  });

  const locations = await actionsUserLocations({
    path: { id: parseInt(params.id) },
  });
  if (!action.data) {
    throw data("Record Not Found", { status: 404 });
  }

  return { ...action.data, locations: locations.data || [] };
}

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

  const actionId = action?.id || 0;

  //   const { activities: liveActivities } = useActionActivity(actionId);

  const { activities, handleLikeActivity, setActivities } = useActivities({
    list: ActivityList.Action,
    objectId: actionId,
  });

  const handleDeclineAction = useCallback(
    async (moral: boolean, reason: string) => {
      await actionsDecline({
        path: { id: actionId },
        body: { reason, moral },
      });
      setUserRelation("declined");
      setRevalidate();
    },
    [actionId]
  );

  const handleOptOutAction = useCallback(
    async (reason: string) => {
      await actionsOptout({
        path: { id: actionId },
        body: { reason },
      });
      setUserRelation("declined");
      setRevalidate();
    },
    [actionId]
  );

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

  const handleCompleteAction = useCallback(async () => {
    setUserRelation("completed");
    actionsComplete({
      path: { id },
    });
    setRevalidate();
  }, [id]);

  const onJoinAction = useCallback(async () => {
    if (!actionId) return;

    try {
      const response = await actionsJoin({
        path: { id: actionId },
      });

      if (response.error) {
        throw new Error("Failed to join action");
      } else {
        setUserRelation("joined");
      }
    } catch (err) {
      console.error("Error joining action:", err);
    } finally {
      setRevalidate();
    }
  }, [actionId]);

  return (
    <div className="w-full h-full bg-white min-h-[calc(100vh-50px)]">
      <TwoColumnSplit
        left={
          <Outlet
            context={
              {
                userRelation,
                handleCompleteAction,
                handleJoinAction: onJoinAction,
                handleDeclineAction,
                handleOptOutAction,
              } satisfies TaskPanelContext
            }
          />
        }
        right={
          <div className="flex flex-col gap-y-4 pt-2 pr-4">
            {action !== undefined && (
              <Card style={CardStyle.White}>
                <ActionEventsPanel action={action} events={action.events} />
              </Card>
            )}
            {action && (
              <ActionActivityList
                actionId={action.id}
                activities={activities}
                loading={false}
                onLikeActivity={handleLikeActivity}
                setActivities={setActivities}
              />
            )}
          </div>
        }
        bg="bg-white"
        border={false}
      />
    </div>
  );
}

export function useActionLoaderData() {
  const action = useRouteLoaderData<typeof loader>("pages/app/ActionPage"); //TODO: why is this based on file path
  if (!action) {
    throw new Error("No data - applayout loader not found");
  }
  return action;
}
