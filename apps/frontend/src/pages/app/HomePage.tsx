import CheckIcon from "@alliance/shared/ui/icons/CheckIcon";
import { Link, useNavigate, useOutletContext } from "react-router";
import { ActionWithRelation, AppLayoutOutletContext } from "../../applayout";
import ActionActivityFeedItem from "../../components/ActionActivityFeedItem";
import ForumListPost from "../../components/ForumListPost";
import { useWhiteBackground } from "../../components/HtmlBackgroundManager";
import LargeActionCard from "./LargeActionCard";
import useActivities, { ActivityList } from "./useActivities";
import BasicErrorMessage from "../../components/BasicErrorMessage";
import { useAuth } from "../../lib/AuthContext";
import Spinner from "../../components/Spinner";
import { getPastEvents } from "@alliance/shared/lib/actionUtils";
import { useCIDFromParams } from "../../lib/utils";
import TwoColumnLayout from "../../components/TwoColumnLayout";

export function canCompleteAction(action: ActionWithRelation) {
  return (
    getPastEvents(action).some(
      (event) => event.newStatus === "member_action"
    ) &&
    (action.relation === "joined" ||
      (action.commitmentless && action.relation !== "completed")) &&
    action.relation !== "declined" &&
    action.canParticipate
  );
}

export function shouldCompleteAction(action: ActionWithRelation) {
  return (
    canCompleteAction(action) &&
    action.shouldParticipate &&
    (action.status === "member_action" ||
      action.status === "gathering_commitments")
  );
}

export function isCurrentlyCompletedAction(action: ActionWithRelation) {
  return (
    action.shouldParticipate &&
    (action.status === "member_action" ||
      action.status === "gathering_commitments") &&
    !action.everyoneShouldComplete &&
    action.relation === "completed"
  );
}

export function canJoinAction(action: ActionWithRelation) {
  return (
    action.status === "gathering_commitments" &&
    action.relation === "none" &&
    action.canParticipate
  );
}

export function isActionInCurrentWeek(action: ActionWithRelation) {
  const deadlineEvent = action.events.find(
    (event) => event.newStatus === "office_action"
  );
  if (!deadlineEvent) {
    return true;
  }
  return (
    new Date(deadlineEvent.date) <
    new Date(new Date().setDate(new Date().getDate() + 7))
  );
}

const HomePage = () => {
  const navigate = useNavigate();
  const { actions, posts, loading } =
    useOutletContext<AppLayoutOutletContext>();

  const { activities: friendActivities, handleLikeActivity } = useActivities({
    list: ActivityList.Friends,
  });

  useCIDFromParams();

  const { user } = useAuth();

  const todoActions =
    actions
      ?.filter((action) => shouldCompleteAction(action))
      .sort((a, b) => {
        return b.priority - a.priority;
      }) || [];

  const newActions =
    actions
      ?.filter((action) => canJoinAction(action))
      .sort((a, b) => {
        return b.priority - a.priority;
      }) || [];

  const currentTask = newActions[0] || todoActions[0] || null;
  const currentWeekTodoActions = todoActions.filter((action) => {
    return isActionInCurrentWeek(action);
  });
  const nextWeekTodoActions = todoActions.filter((action) => {
    return !isActionInCurrentWeek(action);
  });

  const remainingTasksEstimatedTimeCurrentWeek = currentWeekTodoActions.reduce(
    (sum, action) => {
      if (action.timeEstimate) {
        return sum + action.timeEstimate;
      }
      return sum;
    },
    0
  );

  const completedActions =
    actions?.filter((action) => isCurrentlyCompletedAction(action)) || [];

  const mainContent = () => {
    if (actions === null) {
      return loading ? (
        <div className="flex justify-center items-center h-screen">
          <Spinner size="large" />
        </div>
      ) : (
        <BasicErrorMessage>Error loading actions</BasicErrorMessage>
      );
    }

    return (
      <div
        className={
          "flex flex-col py-8 sm:py-18 px-4 max-w-3xl mx-auto min-h-full justify-center"
        }
      >
        {currentTask && currentTask.relation ? (
          <LargeActionCard
            action={currentTask}
            userRelation={currentTask.relation as "joined" | "none"}
            friendActivities={friendActivities.filter(
              (activity) => activity.actionId === currentTask.id
            )}
            onUpdateActionState={() => navigate(window.location.pathname)}
          />
        ) : (
          <div className="mt-4 px-2 py-2 mx-auto flex flex-col items-center gap-y-4 h-full justify-center">
            {user?.contractDateSuspended ? (
              <p className="text-center text-zinc-500">
                You will not be given new tasks while your contract is
                suspended.
              </p>
            ) : (
              <>
                <CheckIcon size="large" />
                <p className="text-center text-zinc-500 text-lg lg:text-xl">
                  No tasks to do right now
                </p>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  const sidebarContent = () => {
    return (
      <div className="px-4 py-12 flex flex-col divide-y *:py-6 *:px-2 divide-zinc-200">
        {todoActions.length + newActions.length > 0 && (
          <div className="flex flex-col gap-y-2">
            <p className="font-semibold text-xl font-serif text-black">
              Progress
            </p>
            {currentWeekTodoActions.length + newActions.length > 0 && (
              <p className="text-zinc-600 mb-2">
                <span className="text-green font-medium mr-0.5">
                  {currentWeekTodoActions.length} task
                  {currentWeekTodoActions.length !== 1 ? "s" : ""} left{" "}
                </span>
                {todoActions.length > 0 &&
                  `for a total of ${remainingTasksEstimatedTimeCurrentWeek} minutes`}
              </p>
            )}
            <ul className="space-y-2 list-disc">
              {completedActions.map((action) => (
                <div key={action.id} className="text-zinc-600 flex gap-x-2">
                  <CheckIcon size="line" />
                  <Link
                    to={`/actions/${action.id}`}
                    className="text-zinc-400 line-through"
                  >
                    {action.name}
                  </Link>
                </div>
              ))}
              {currentWeekTodoActions.map((action) => (
                <div key={action.id} className="text-zinc-600 flex gap-x-2">
                  <div className="!w-4 !h-4 shrink-0 border-2 border-zinc-200 rounded-full mt-[4px]"></div>
                  <Link to={`/actions/${action.id}`} className="text-zinc-600">
                    {action.name}
                  </Link>
                </div>
              ))}
              {nextWeekTodoActions.length > 0 && (
                <>
                  <p className="text-zinc-500 mt-3 font-medium">Next week</p>
                  {nextWeekTodoActions.map((action) => (
                    <div key={action.id} className="text-zinc-600 flex gap-x-2">
                      <div className="!w-4 !h-4 shrink-0 border-2 border-zinc-200 rounded-full mt-[4px]"></div>
                      <Link
                        to={`/actions/${action.id}`}
                        className="text-zinc-600"
                      >
                        {action.name}
                      </Link>
                    </div>
                  ))}
                </>
              )}
            </ul>
          </div>
        )}

        <div className="flex">{bulletinCard}</div>
        <div>
          <p className="font-semibold text-xl font-serif text-black">
            Forum activity
          </p>
          {posts && posts.length === 0 && (
            <p className="text-zinc-400 mt-3">No activity yet.</p>
          )}
          {posts && posts.length > 0 && (
            <div className="flex flex-col *:py-3 -mb-3">
              {posts
                .filter(
                  (post) =>
                    !post.visibleAt || new Date(post.visibleAt) < new Date()
                )
                .slice(0, 2)
                .map((post) => (
                  <ForumListPost
                    key={post.id}
                    post={post}
                    card={false}
                    showAction={false}
                  />
                ))}
            </div>
          )}
        </div>
        <div className="">
          <div className="flex flex-row justify-between items-center mb-3">
            <p className="font-semibold text-xl font-serif text-black">
              Friend activity
            </p>
            {friendActivities.length > 0 && (
              <Link
                to="/feed"
                className="text-zinc-800 font-medium hover:underline text-sm mt-0"
              >
                See all
              </Link>
            )}
          </div>
          <div className="flex flex-col *:py-3 -my-3">
            {friendActivities.length === 0 && (
              <div className="space-x-1">
                <span className="text-zinc-400 mb-3">No activity yet.</span>
                <a href="/members" className="text-link">
                  Find friends
                </a>
              </div>
            )}
            {friendActivities.slice(0, 2).map((activity) => (
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
        </div>
      </div>
    );
  };

  useWhiteBackground();

  const bulletinCard = (
    <div>
      <p className="font-semibold text-xl text-black mb-2 font-serif">
        Bulletin
      </p>
      <p className="text-black mb-2">
        Right now, we are focused on small-scale experiments that test
        collective action strategies. Learn more about our current{" "}
        <Link to="/priorities" className="text-link">
          priorities
        </Link>
        .
      </p>
    </div>
  );

  return (
    <>
      <div className="hidden lg:block">
        <TwoColumnLayout main={mainContent()} sidebar={sidebarContent()} />
      </div>

      <div className="lg:hidden">{mainContent()}</div>
    </>
  );
};

export default HomePage;
