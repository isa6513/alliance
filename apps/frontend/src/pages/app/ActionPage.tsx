import {
  ActionDto,
  actionsComplete,
  actionsFindOne,
  actionsJoin,
  actionsMyStatus,
  actionsUserLocations,
  LatLonDto,
  UserActionRelation,
} from "@alliance/shared/client";
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
import { TaskPanelContext } from "../../components/ActionTaskPanel";
import CompletedBar from "../../components/CompletedBar";
import StatusIcon from "../../components/icons/StatusIcon";
import Card, { CardStyle } from "../../components/system/Card";
import TwoColumnSplit from "../../components/system/TwoColumnSplit";
import { useAuth } from "../../lib/AuthContext";
import { useActionCount } from "../../lib/useActionWebSocket";
import { testActions } from "../../stories/testData";
import useActivities, { ActivityList } from "./useActivities";

const actionStatusColors: Record<ActionDto["status"], string> = {
  gathering_commitments: "bg-yellow-50 text-yellow-600 border-yellow-600",
  commitments_reached: "bg-green/10 text-green border-green",
  member_action: "bg-blue-50 text-blue-600 border-blue-600",
  resolution: "blue-500",
  completed: "gray-500",
  failed: "red-500",
  abandoned: "yellow-500",
  draft: "gray-500",
  upcoming: "blue-500",
};

const actionStatusDescriptions: Record<ActionDto["status"], string> = {
  gathering_commitments: "Gathering commitments",
  commitments_reached: "Sufficient commitments reached",
  member_action: "Members are now taking action",
  resolution: "Pending office resolution",
  completed: "Completed",
  failed: "Failed",
  abandoned: "Abandoned",
  draft: "Draft",
  upcoming: "Upcoming",
};

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
  const liveUserCount = useActionCount(actionId);
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
    if (!id) return;

    try {
      const response = await actionsJoin({
        path: { id },
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
  }, [id]);

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
                activities,
                handleLikeActivity,
                setActivities,
              } satisfies TaskPanelContext
            }
          />
        }
        right={
          <div className="flex flex-col gap-y-4 p-6 pt-2">
            <Card style={CardStyle.White}>
              <p className="text-base font-semibold">Status</p>
              {action && (
                <div className="mt-1">
                  <div
                    className={`px-3 py-1 flex flex-row items-center border ${
                      actionStatusColors[action.status]
                    } rounded-lg`}
                  >
                    {/* <img
                      src={actionStatusIcons[action.status]}
                      alt="Action Status Icon"
                      className="inline w-4 h-4 mr-1"
                    /> */}
                    <StatusIcon status={action.status} size="small" />
                    <p>{actionStatusDescriptions[action.status]}</p>
                  </div>

                  {action.status === "gathering_commitments" ||
                  action.status === "commitments_reached" ? (
                    <div className="mt-4">
                      <CompletedBar
                        percentage={
                          ((liveUserCount ?? action.usersJoined) /
                            (action.commitmentThreshold ?? 1)) *
                          100
                        }
                      />
                      <p className="mt-4 text-green-3 text-sm font-weight-450">
                        {(
                          liveUserCount ?? action.usersJoined
                        )?.toLocaleString() || 0}{" "}
                        commitments made
                      </p>
                      <p className="text-zinc-400 text-sm">
                        {(action.commitmentThreshold ?? 0).toLocaleString()}{" "}
                        commitments needed
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <CompletedBar
                        percentage={
                          ((action.usersCompleted ?? 0) /
                            (action.usersJoined ?? 1)) *
                          100
                        }
                      />
                      <p className="mt-4 text-green-3 text-sm font-weight-450">
                        {(action.usersCompleted ?? 0).toLocaleString()} members
                        completed
                      </p>
                      <p className="text-zinc-400 text-sm">
                        {(action.usersJoined ?? 0).toLocaleString()} members
                        committed
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* <div className="w-full border-t border-gray-300" />
            <UserBubbleRow />
            <p className="text-center pt-2 text-[11pt]">
              <b>6 friends</b> already joined this action!
            </p> */}
            </Card>
            {action !== undefined && (
              <Card style={CardStyle.White}>
                <ActionEventsPanel events={action.events} />
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
