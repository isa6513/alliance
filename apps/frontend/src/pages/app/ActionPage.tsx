import { useCallback, useEffect, useMemo, useState } from "react";
import {
  data,
  isRouteErrorResponse,
  Outlet,
  useLoaderData,
  useParams,
} from "react-router";
import Card, { CardStyle } from "../../components/system/Card";
import {
  actionsComplete,
  actionsFindOne,
  actionsJoin,
  actionsMyStatus,
  actionsUserLocations,
  LatLonDto,
} from "@alliance/shared/client";
import { ActionDto, UserActionDto } from "@alliance/shared/client";
import { getImageSource, isFeatureEnabled } from "../../lib/config";
import { useActionCount } from "../../lib/useActionWebSocket";
import ActionForumPosts from "../../components/ActionForumPosts";
import TwoColumnSplit from "../../components/system/TwoColumnSplit";
import { Features } from "@alliance/shared/lib/features";
import ActionEventsPanel from "../../components/ActionEventsPanel";
import CompletedBar from "../../components/CompletedBar";
import { Route } from "../../../.react-router/types/src/pages/app/+types/ActionPage";
import { useAuth } from "../../lib/AuthContext";
import { ParentContext as ActionTaskPanelParentContext } from "../../components/ActionTaskPanel";
import ActionActivityList from "../../components/ActionActivityList";
import ReactMarkdown from "react-markdown";
import { testActions } from "../../stories/testData";

const actionStatusDescriptions: Record<ActionDto["status"], string> = {
  gathering_commitments: "Collecting commitments",
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

  const [error, setError] = useState<string | null>(null);

  const [userRelation, setUserRelation] = useState<
    UserActionDto["status"] | null
  >(null);

  const { isAuthenticated } = useAuth();

  const actionId = action?.id || 0;
  const liveUserCount = useActionCount(actionId);

  useEffect(() => {
    if (isAuthenticated && id) {
      actionsMyStatus({
        path: { id },
      }).then((response) => {
        console.log("response", response);
        if (response.error) {
          console.error("Failed to fetch user status", response.error);
          setError("Failed to fetch user status");
        }
        if (response.data) {
          setUserRelation(response.data.status);
        }
      });
    }
  }, [isAuthenticated, id]);

  const handleCompleteAction = useCallback(async () => {
    setUserRelation("completed");
    actionsComplete({
      path: { id },
    });
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
      setError("Failed to join this action. Please try again later.");
    }
  }, [id]);

  const mainContent = useMemo(
    () => (
      <div className="flex flex-col gap-y-3 flex-2 px-5">
        {action?.image && (
          <img
            src={getImageSource(action.image)}
            className="w-full h-auto rounded-md border border-gray-300 max-h-[200px] object-cover"
          />
        )}
        <div className="flex flex-row justify-between items-start my-3">
          <div className="flex flex-col gap-y-3">
            {action !== undefined && (
              <div>
                <h1 className="font-adobe">{action.name}</h1>
                {/* <p className="text-zinc-700 mt-3">{action.shortDescription}</p> */}
              </div>
            )}
          </div>
        </div>
        {error && <div className="text-red-500">{error}</div>}
        {/* {userRelation === "joined" && <PokePanel />} */}
        {/* {userRelation === "none" && (
          <Card style={CardStyle.Grey} className="mb-5">
            <h2>Why Join?</h2>
            <p>
              {action?.whyJoin ||
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}
            </p>
          </Card>
        )} */}
        <Outlet
          context={
            {
              handleCompleteAction,
              action,
              userRelation,
              handleJoinAction: onJoinAction,
            } satisfies ActionTaskPanelParentContext
          }
        />
        <div className="my-2">
          <ReactMarkdown>{action?.body}</ReactMarkdown>
        </div>

        <hr className="border-zinc-200" />

        {isFeatureEnabled(Features.Forum) && <ActionForumPosts actionId={id} />}
      </div>
    ),
    [action, userRelation, id, onJoinAction, error, handleCompleteAction]
  );

  return (
    <>
      <meta name="og:title" content={action?.name} />
      <meta name="og:description" content={action?.shortDescription} />
      <TwoColumnSplit
        left={mainContent}
        right={
          <div className="flex flex-col gap-y-4 p-6">
            <Card style={CardStyle.White}>
              <div className="p-2">
                <p className="text-lg font-semibold">Status</p>
                {action && (
                  <div className="mt-1">
                    <p>{actionStatusDescriptions[action.status]}</p>

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
                        <p className="mt-4 text-green-600 text-sm">
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
                        <p className="mt-4 text-greentext text-sm">
                          {(action.usersCompleted ?? 0).toLocaleString()}{" "}
                          members completed
                        </p>
                        <p className="text-zinc-400 text-sm">
                          {(action.usersJoined ?? 0).toLocaleString()} members
                          committed
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

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
            {action && <ActionActivityList actionId={action.id} />}
          </div>
        }
        bg="bg-white"
        border={false}
      />
    </>
  );
}
