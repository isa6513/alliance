import { actionsComplete } from "@alliance/shared/client";
import { setRevalidate, useAppLoaderData } from "../../applayout";
import TaskCard from "../../components/TaskCard";
import ActionItemCard from "../../components/ActionItemCard";
import Card from "../../components/system/Card";
import ForumListPost from "../../components/ForumListPost";
import ActionActivityFeedItem from "../../components/ActionActivityFeedItem";
import useActivities, { ActivityList } from "./useActivities";
import { isFeatureEnabled } from "../../lib/config";
import { Features } from "@alliance/shared/lib/features";
import SingleActionCard from "../../components/SingleActionCard";

const HomePage = () => {
  const { actions, relations, posts, activities } = useAppLoaderData();

  const { activities: friendActivities, handleLikeActivity } = useActivities({
    list: ActivityList.Friends,
  });

  if (!relations) {
    setRevalidate();
    return (
      <div className="text-zinc-400 w-full h-80 flex items-center justify-center">
        Failed to load user data.
      </div>
    );
  }

  const todoActions = actions.filter(
    (action) =>
      relations.get(action.id) === "joined" && action.status === "member_action"
  );

  const newActions = actions.filter(
    (action) =>
      relations.get(action.id) === "none" &&
      action.status === "gathering_commitments"
  );

  const committedActions = actions.filter(
    (action) =>
      relations.get(action.id) === "joined" &&
      action.status === "gathering_commitments"
  );

  const handleTaskComplete = (actionId: number) => {
    actionsComplete({ path: { id: actionId.toString() } }).then(() => {
      window.location.reload();
    });
  };

  if (isFeatureEnabled(Features.SingleAction)) {
    return (
      <div className="flex flex-col w-full h-full items-center bg-page">
        <div className="flex flex-row px-6 gap-x-3 w-full">
          <div className="flex flex-col py-20 gap-y-5 overflow-y-auto mx-auto flex-1 max-w-[850px]">
            <SingleActionCard
              action={actions[0]}
              relations={relations.get(actions[0].id) ?? "none"}
              activity={activities?.get(actions[0].id)?.join ?? null}
            />
          </div>
          <div className="hidden md:flex flex-col py-16 gap-y-5 overflow-y-auto items-stretch w-[350px]">
            <div className="flex flex-col gap-y-3">
              <Card>
                <p className="font-semibold mb-1">Forum activity</p>
                {posts?.length === 0 && (
                  <p className="text-zinc-400">No forum activity yet</p>
                )}

                {posts?.slice(0, 3).map((post) => (
                  <ForumListPost
                    key={post.id}
                    post={post}
                    card={false}
                    showAction={false}
                  />
                ))}
              </Card>
              <Card className="!gap-y-0">
                <p className="font-semibold mb-3">
                  What your friends are up to
                </p>
                {friendActivities.length === 0 && (
                  <p className="text-zinc-400">No friend activity yet</p>
                )}
                <div className="flex flex-col gap-y-2 ">
                  {friendActivities.map((activity) => (
                    <ActionActivityFeedItem
                      key={activity.id}
                      activity={activity}
                      showTime={false}
                      card={false}
                      showAction={true}
                      handleLike={() => handleLikeActivity(activity.id)}
                    />
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full items-center bg-page">
      <div className="flex flex-row px-6 gap-x-3">
        <div className="flex flex-col py-16 max-w-[728px] md:min-w-[300px] gap-y-5 overflow-y-auto ">
          <div className="flex flex-col gap-y-8">
            <p className="font-adobe text-3xl">Your tasks</p>
            {todoActions.length > 0 && (
              <div className="flex flex-col gap-y-4">
                <div className="flex flex-row items-center gap-x-2">
                  <p className="font-medium text-zinc-800">
                    Awaiting completion
                  </p>
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-zinc-500 bg-zinc-200 rounded-full">
                    {todoActions.slice(0, 2).length}
                  </span>
                </div>
                <div className="flex flex-col gap-y-2 w-full">
                  {todoActions.slice(0, 2).map((action) => (
                    <TaskCard
                      key={action.id}
                      action={action}
                      onComplete={handleTaskComplete}
                    />
                  ))}
                </div>
              </div>
            )}
            {newActions.length > 0 && (
              <div className="flex flex-col gap-y-4">
                <div className="flex flex-row items-center gap-x-2">
                  <p className="font-medium text-zinc-800">
                    Awaiting your commitment
                  </p>
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-zinc-500 bg-zinc-200 rounded-full">
                    {newActions.length}
                  </span>
                </div>
                <div className="flex flex-col gap-y-2 w-full">
                  {newActions.map((action) => (
                    <ActionItemCard
                      key={action.id}
                      {...action}
                      showDescription={true}
                    />
                  ))}
                </div>
              </div>
            )}
            {committedActions.length > 0 && (
              <div className="flex flex-col gap-y-4">
                <div className="flex flex-row items-center gap-x-2">
                  <p className="font-medium text-zinc-800">
                    Still gathering commitments
                  </p>
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-zinc-500 bg-zinc-200 rounded-full mt-[1px]">
                    {committedActions.length}
                  </span>
                </div>
                <div className="flex flex-col gap-y-2 w-full">
                  {committedActions.map((action) => (
                    <ActionItemCard
                      key={action.id}
                      {...action}
                      userRelation={relations.get(action.id)}
                      showDescription={false}
                      activity={activities?.get(action.id)?.join ?? undefined} //TODO: type this so that it always exists
                    />
                  ))}
                </div>
              </div>
            )}
            {/* <InviteMemberCard /> */}
          </div>
        </div>
        <div className="hidden md:flex flex-col py-16 gap-y-5 overflow-y-auto items-stretch w-[350px]">
          <div className="flex flex-col gap-y-3">
            <Card>
              <p className="font-semibold mb-3">Forum activity</p>
              {posts?.length === 0 && (
                <p className="text-zinc-400">No forum activity yet</p>
              )}

              <div className="flex flex-col divide-y *:py-3 -my-3">
                {posts?.slice(0, 3).map((post) => (
                  <ForumListPost
                    key={post.id}
                    post={post}
                    card={false}
                    showAction={false}
                  />
                ))}
              </div>
            </Card>
            <Card>
              <p className="font-semibold mb-3">What your friends are up to</p>
              {friendActivities.length === 0 && (
                <p className="text-zinc-400">No friend activity yet</p>
              )}
              <div className="flex flex-col divide-y *:py-3 -my-3">
                {friendActivities.map((activity) => (
                  <ActionActivityFeedItem
                    key={activity.id}
                    activity={activity}
                    showTime={false}
                    card={false}
                    showAction={true}
                    handleLike={() => handleLikeActivity(activity.id)}
                  />
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
