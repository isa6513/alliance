import {
  ActionActivityDto,
  actionsComplete,
  actionsFriendActivity,
} from "@alliance/shared/client";
import { useAppLoaderData } from "../../applayout";
import TaskCard from "../../components/TaskCard";
import ActionItemCard from "../../components/ActionItemCard";
import Card from "../../components/system/Card";
import ForumListPost from "../../components/ForumListPost";
import { useEffect, useState } from "react";
import ActivityFeedItem from "../../components/ActivityFeedItem";

const HomePage = () => {
  const { actions, relations, posts } = useAppLoaderData();

  const [friendActivity, setFriendActivity] = useState<ActionActivityDto[]>([]);

  const { revalidate } = useAppLoaderData();

  useEffect(() => {
    actionsFriendActivity().then((resp) => {
      setFriendActivity(resp.data ?? []);
    });
  }, []);

  if (!relations) {
    revalidate();
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
      (!relations.get(action.id) || relations.get(action.id) === "none") &&
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
                    Awaiting commitment
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
              <p className="font-semibold mb-1">Forum activity</p>
              {posts.length === 0 && (
                <p className="text-zinc-400">No forum activity yet</p>
              )}

              {posts.slice(0, 3).map((post) => (
                <ForumListPost key={post.id} post={post} showAction={false} />
              ))}
            </Card>
            <Card>
              <p className="font-semibold mb-1">What your friends are up to</p>
              {friendActivity.length === 0 && (
                <p className="text-zinc-400">No friend activity yet</p>
              )}
              {friendActivity.map((activity) => (
                <ActivityFeedItem
                  key={activity.id}
                  activity={activity}
                  showTime={false}
                  card={false}
                />
              ))}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
