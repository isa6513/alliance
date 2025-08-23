import { actionsComplete, actionsJoin } from "@alliance/shared/client";
import { Features } from "@alliance/shared/lib/features";
import { setRevalidate, useAppLoaderData } from "../../applayout";
import ActionActivityFeedItem from "../../components/ActionActivityFeedItem";
import ForumListPost from "../../components/ForumListPost";
import SingleActionCard from "../../components/SingleActionCard";
import Card from "../../components/system/Card";
import { isFeatureEnabled } from "../../lib/config";
import LargeActionCard from "./LargeActionCard";
import SmallActionCard from "./SmallActionCard";
import useActivities, { ActivityList } from "./useActivities";

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

  const getNewCurrentTask = () => {
    return newActions.shift() || todoActions.shift() || null;
  };

  const currentTask = getNewCurrentTask();

  const handleTaskComplete = (actionId: number) => {
    actionsComplete({ path: { id: actionId.toString() } }).then(() => {
      window.location.reload();
    });
  };

  const handleTaskJoin = (actionId: number) => {
    actionsJoin({ path: { id: actionId.toString() } }).then(() => {
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
          <div className="flex flex-col gap-y-6">
            <p className="font-adobe text-3xl font-semibold">Current task</p>
            {currentTask && (
              <LargeActionCard
                action={currentTask}
                userRelation={relations.get(currentTask.id) ?? null}
                friendActivities={[]}
                onComplete={handleTaskComplete}
                onJoin={handleTaskJoin}
              />
            )}
            <p className="mt-4 font-adobe text-3xl font-semibold">Up next</p>
            <div className="flex flex-col gap-y-2 w-full">
              {todoActions.slice(0, 2).map((action) => (
                // <TaskCard
                //   key={action.id}
                //   action={action}
                //   friendCompletionActivities={friendActivities.filter(
                //     (activity) =>
                //       activity.actionId === action.id &&
                //       activity.type === "user_completed"
                //   )}
                //   commitActivity={activities?.get(action.id)?.join ?? undefined}
                //   onComplete={handleTaskComplete}
                // />
                <SmallActionCard
                  key={action.id}
                  {...action}
                  showDescription={true}
                  friendActivities={friendActivities.filter(
                    (activity) =>
                      activity.actionId === action.id &&
                      activity.type === "user_completed"
                  )}
                  joinedCount={action.usersCompleted}
                  neededCount={action.usersJoined}
                  userRelation={relations.get(action.id)}
                />
              ))}
              {newActions.map((action) => (
                <SmallActionCard
                  key={action.id}
                  {...action}
                  showDescription={true}
                  userRelation={relations.get(action.id)}
                />
              ))}
              {committedActions.map((action) => (
                <SmallActionCard
                  key={action.id}
                  {...action}
                  joinedCount={action.usersJoined}
                  neededCount={action.commitmentThreshold}
                  friendActivities={friendActivities.filter(
                    (activity) =>
                      activity.actionId === action.id &&
                      activity.type === "user_joined"
                  )}
                  userRelation={relations.get(action.id)}
                  showDescription={false}
                  activity={activities?.get(action.id)?.join ?? undefined} //TODO: type this so that it always exists
                />
              ))}
            </div>

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
