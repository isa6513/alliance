import { actionsComplete, actionsJoin } from "@alliance/shared/client";
import { useNavigate } from "react-router";
import { setRevalidate, useAppLoaderData } from "../../applayout";
import ActionActivityFeedItem from "../../components/ActionActivityFeedItem";
import ForumListPost from "../../components/ForumListPost";
import CheckIcon from "../../components/icons/CheckIcon";
import Card, { CardStyle } from "../../components/system/Card";
import LargeActionCard from "./LargeActionCard";
import SmallActionCard from "./SmallActionCard";
import useActivities, { ActivityList } from "./useActivities";

const HomePage = () => {
  const navigate = useNavigate();
  const { actions, posts, activities } = useAppLoaderData();

  const { activities: friendActivities, handleLikeActivity } = useActivities({
    list: ActivityList.Friends,
  });

  const todoActions = actions.filter(
    (action) =>
      action.relation === "joined" && action.status === "member_action"
  );

  const newActions = actions.filter(
    (action) =>
      action.relation === "none" && action.status === "gathering_commitments"
  );

  const committedActions = actions.filter(
    (action) =>
      action.relation === "joined" && action.status === "gathering_commitments"
  );

  const commitmentsReachedActions = actions.filter(
    (action) =>
      action.relation === "joined" && action.status === "commitments_reached"
  );

  const currentTask = newActions.shift() || todoActions.shift() || null;

  const handleTaskComplete = (actionId: number) => {
    actionsComplete({ path: { id: actionId.toString() } }).then(() => {
      setRevalidate();
      navigate(window.location.pathname);
    });
  };

  const handleTaskJoin = (actionId: number) => {
    actionsJoin({ path: { id: actionId.toString() } }).then(() => {
      setRevalidate();
      navigate(window.location.pathname);
    });
  };

  return (
    <div className="flex flex-col w-full h-full items-center bg-page min-h-[calc(100vh-50px)]">
      <div className="flex flex-row px-6 md:gap-x-6">
        <div className="hidden md:flex md:w-[200px]"></div>
        <div className="flex flex-col py-16 max-w-[728px] md:min-w-[300px] gap-y-5 overflow-y-auto !overflow-visible">
          <div className="flex flex-col gap-y-6 ">
            <p className="font-adobe text-3xl font-semibold">Current task</p>
            {currentTask && currentTask.relation ? (
              <LargeActionCard
                action={currentTask}
                userRelation={currentTask.relation as "joined" | "none"}
                friendActivities={[]}
                onComplete={handleTaskComplete}
                onJoin={handleTaskJoin}
              />
            ) : (
              <Card style={CardStyle.White}>
                <div className="px-2 py-24 flex flex-col items-center gap-y-4">
                  <CheckIcon size="large" />
                  <p className="text-center text-zinc-500 text-xl">
                    Nothing to do right now!
                  </p>
                </div>
              </Card>
            )}

            {(todoActions.length > 0 ||
              newActions.length > 0 ||
              committedActions.length > 0 ||
              commitmentsReachedActions.length > 0) && (
              <>
                <p className="mt-4 font-adobe text-3xl font-semibold">
                  Up next
                </p>
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
                    />
                  ))}
                  {newActions.map((action) => (
                    <SmallActionCard
                      key={action.id}
                      {...action}
                      showDescription={true}
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
                      showDescription={false}
                      activity={activities?.get(action.id)?.join ?? undefined} //TODO: type this so that it always exists
                    />
                  ))}
                  {commitmentsReachedActions.map((action) => (
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
                      showDescription={false}
                      activity={activities?.get(action.id)?.join ?? undefined} //TODO: type this so that it always exists
                    />
                  ))}
                </div>
              </>
            )}

            {/* <InviteMemberCard /> */}
          </div>
        </div>
        <div className="hidden md:flex flex-col py-16 gap-y-5 overflow-y-auto items-stretch w-[375px]">
          <div className="flex flex-col gap-y-3">
            <Card style={CardStyle.White}>
              <p className="font-semibold mb-3">Forum activity</p>
              {posts?.length === 0 && (
                <p className="text-zinc-400">No forum activity yet</p>
              )}

              {posts?.length > 0 && (
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
              )}
            </Card>
            <Card style={CardStyle.White}>
              <p className="font-semibold mb-3">What your friends are up to</p>
              {friendActivities.length === 0 && (
                <p className="text-zinc-400">No friend activity yet</p>
              )}
              {friendActivities.length > 0 && (
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
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
