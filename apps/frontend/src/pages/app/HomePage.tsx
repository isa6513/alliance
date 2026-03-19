import CheckIcon from "@alliance/sharedweb/ui/icons/CheckIcon";
import { useEffect, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ActionDto, FollowUpForm } from "@alliance/shared/client";
import { Link, href } from "react-router";
import BasicErrorMessage from "../../components/BasicErrorMessage";
import GlobalFeed from "../../components/GlobalFeed";
import { useWhiteBackground } from "../../components/HtmlBackgroundManager";
import Spinner from "@alliance/sharedweb/ui/Spinner";
import TwoColumnLayout from "../../components/TwoColumnLayout";
import { useAuth } from "../../lib/AuthContext";
import { useCIDFromParams } from "../../lib/utils";
import LargeActionCard, { LargeActionCardProps } from "./LargeActionCard";
import LargeGeneralUpdateCard from "@alliance/sharedweb/ui/LargeGeneralUpdateCard";
import useGlobalFeed from "@alliance/shared/lib/useGlobalFeed";
import { useMediaQuery } from "../../lib/useMediaQuery";
import {
  isGeneralUpdate,
  homePagePriorityComparator,
} from "@alliance/shared/lib/actionUtils";
import { useHomePageActions } from "@alliance/shared/lib/homePage";
import {
  noTasksContractSuspended,
  noTasksToDoRightNow,
  TASK_DISMISS_MESSAGE_CURRENTLY_AWAY,
  TASK_DISMISS_MESSAGE_AFTER_DEADLINE,
  TASK_DISMISS_MESSAGE_WAS_AWAY,
  TASK_DISMISS_MESSAGE_WILL_BE_AWAY,
} from "@alliance/shared/lib/copy";
import {
  showActionInSidebarList,
  deadlineHasPassed,
  TaskAwayStatus,
  isFollowUpFormActive,
} from "@alliance/shared/lib/actionUtils";
import FollowUpFormPanel from "../../components/FollowUpFormPanel";
import { useTaskActionsData } from "../../lib/useTaskActionsData";
import HomeUpdatesRow from "../../components/HomeUpdatesRow";
import SeeAll from "../../components/SeeAll";

const HomePage = () => {
  const queryClient = useQueryClient();
  const {
    actions,
    generalUpdates,
    loading,
    handleDismissAction,
    handleDismissGeneralUpdate,
  } = useTaskActionsData();

  const { user, refreshUser } = useAuth();
  const hasRefreshedForNoContract = useRef(false);

  useEffect(() => {
    if (user && !user.hasActiveContract && !hasRefreshedForNoContract.current) {
      hasRefreshedForNoContract.current = true;
      refreshUser();
    }
  }, [user, refreshUser]);

  const mainScrollRef = useRef<HTMLDivElement | null>(null);

  const { items: globalFeedItems, loading: globalFeedLoading } = useGlobalFeed({
    limit: 10,
  });

  useCIDFromParams();

  const {
    currentTask,
    todoActions,
    newActions,
    currentWeekTodoActions,
    nextWeekTodoActions,
    remainingTasksEstimatedTimeCurrentWeek,
    completedActions,
  } = useHomePageActions(actions);

  const numTodo = todoActions.filter(showActionInSidebarList).length;

  const isLargeScreen = useMediaQuery("(min-width: 1150px)");

  const tasksListContent = useMemo(() => {
    const currentWeekSidebarActions = currentWeekTodoActions.filter(
      showActionInSidebarList,
    );

    return (
      <>
        {(currentWeekSidebarActions.length > 0 ||
          completedActions.length > 0) && (
          <div className="flex flex-col gap-y-2">
            {currentWeekSidebarActions.length + newActions.length > 0 && (
              <p className="text-zinc-600 mb-2">
                <span className="text-green font-medium mr-0.5">
                  {currentWeekSidebarActions.length} left
                </span>
                {numTodo > 0 &&
                  remainingTasksEstimatedTimeCurrentWeek > 0 &&
                  `for a total of ${remainingTasksEstimatedTimeCurrentWeek} minutes`}
              </p>
            )}
            <ul className="space-y-2 list-disc">
              {completedActions.map((action) => (
                <div key={action.id} className="text-zinc-600 flex gap-x-2">
                  <CheckIcon size="line" />
                  <Link
                    to={href("/actions/:id", { id: action.id.toString() })}
                    className="text-zinc-400 line-through"
                  >
                    {action.optional && "(Optional) "}
                    {action.name}
                  </Link>
                </div>
              ))}
              {currentWeekTodoActions.map((action) => (
                <div key={action.id} className="text-zinc-600 flex gap-x-2">
                  <div className="w-4! h-4! shrink-0 border-2 border-zinc-200 rounded-full mt-[4px]"></div>
                  <Link
                    to={href("/actions/:id", { id: action.id.toString() })}
                    className="text-zinc-600"
                  >
                    {action.optional && "(Optional) "}
                    {action.name}
                  </Link>
                </div>
              ))}
              {nextWeekTodoActions.length > 0 && (
                <>
                  <p className="text-zinc-500 mt-3 font-medium">Upcoming</p>
                  {nextWeekTodoActions.map((action) => (
                    <div key={action.id} className="text-zinc-600 flex gap-x-2">
                      <div className="w-4! h-4! shrink-0 border-2 border-zinc-200 rounded-full mt-[4px]"></div>
                      <Link
                        to={href("/actions/:id", { id: action.id.toString() })}
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
      </>
    );
  }, [
    completedActions,
    currentWeekTodoActions,
    newActions,
    nextWeekTodoActions,
    numTodo,
    remainingTasksEstimatedTimeCurrentWeek,
  ]);

  const currentTaskOrGeneralUpdate = useMemo(() => {
    return [...todoActions, ...(generalUpdates ?? [])].sort(
      homePagePriorityComparator,
    )[0];
  }, [todoActions, generalUpdates]);

  const activeCompletableFollowUpForms = useMemo(() => {
    if (!actions) {
      return [];
    }
    const list: {
      followUpForm: FollowUpForm;
      actionId: number;
    }[] = [];
    for (const action of actions) {
      if (action.userRelation !== "completed") {
        continue;
      }
      const forms = action.followUpForms;
      for (const f of forms) {
        if (isFollowUpFormActive(f))
          list.push({ followUpForm: f, actionId: action.id });
      }
    }
    return list;
  }, [actions]);

  const mainContent = useMemo(() => {
    if (actions === null) {
      return loading ? (
        <div className="flex justify-center items-center h-screen">
          <Spinner size="large" />
        </div>
      ) : (
        <BasicErrorMessage>Error loading actions</BasicErrorMessage>
      );
    }

    const dismissProps: LargeActionCardProps["dismissProps"] =
      !currentTask || currentTask.onboarding
        ? undefined
        : currentTask.awayStatus !== TaskAwayStatus.NOT_AWAY
          ? {
              header: "Away",
              message: {
                [TaskAwayStatus.AWAY_CURRENTLY]:
                  TASK_DISMISS_MESSAGE_CURRENTLY_AWAY,
                [TaskAwayStatus.AWAY_LATER]: TASK_DISMISS_MESSAGE_WILL_BE_AWAY,
                [TaskAwayStatus.AWAY_PREVIOUSLY]: TASK_DISMISS_MESSAGE_WAS_AWAY,
              }[currentTask?.awayStatus],
            }
          : deadlineHasPassed(currentTask, new Date())
            ? {
                header: "Deadline passed",
                message: TASK_DISMISS_MESSAGE_AFTER_DEADLINE,
              }
            : undefined;

    return (
      <div
        className={
          "flex flex-col gap-y-8 sm:gap-y-12 lg:gap-y-16 py-4 sm:py-8 px-4 xl:px-0 max-w-3xl mx-auto relative"
        }
      >
        <div>
          <div className="flex flex-row justify-between items-center mb-4 px-1">
            <p className="text-title-small font-serif">Action updates</p>
            <SeeAll link="/action-updates" size="lg" />
          </div>
          <HomeUpdatesRow />
        </div>

        <div className="flex flex-col gap-6 flex-1">
          <div className="flex flex-col gap-y-1">
            <p className="text-title-small font-serif">Tasks</p>
            {tasksListContent}
          </div>

          {currentTaskOrGeneralUpdate &&
          isGeneralUpdate(currentTaskOrGeneralUpdate) ? (
            <LargeGeneralUpdateCard
              key={currentTaskOrGeneralUpdate.id}
              id={currentTaskOrGeneralUpdate.id}
              title={currentTaskOrGeneralUpdate.name}
              schema={currentTaskOrGeneralUpdate.schema}
              onDismiss={() =>
                handleDismissGeneralUpdate(currentTaskOrGeneralUpdate.id)
              }
              userId={user?.id}
              user={user}
            />
          ) : currentTaskOrGeneralUpdate &&
            currentTaskOrGeneralUpdate.userRelation ? (
            <LargeActionCard
              action={currentTaskOrGeneralUpdate}
              dismissProps={dismissProps}
              handleDismiss={() =>
                handleDismissAction(currentTaskOrGeneralUpdate.id)
              }
              userRelation={currentTaskOrGeneralUpdate.userRelation}
              onCompleteAction={() => {
                queryClient.setQueryData<ActionDto[] | undefined>(
                  ["actions"],
                  (prev) =>
                    prev?.map((action) =>
                      action.id === currentTaskOrGeneralUpdate.id
                        ? { ...action, userRelation: "completed" as const }
                        : action,
                    ),
                );
                queryClient.invalidateQueries({ queryKey: ["actions"] });
              }}
              onUpdateActionState={() => {
                queryClient.invalidateQueries({ queryKey: ["actions"] });
                mainScrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
                document.scrollingElement?.scrollTo({
                  top: 0,
                  behavior: "auto",
                });
                window.scrollTo({ top: 0, behavior: "auto" });
              }}
            />
          ) : (
            <div className="w-full flex flex-col items-center">
              {user && !user.hasActiveContract ? (
                <p className="text-center text-zinc-500">
                  {noTasksContractSuspended}
                </p>
              ) : (
                <>
                  <div className="flex flex-col items-center w-full flex-8 gap-y-4">
                    {activeCompletableFollowUpForms.length > 0 ? (
                      <div className="flex flex-col gap-y-4 w-full max-w-2xl">
                        {activeCompletableFollowUpForms.map(
                          ({ followUpForm, actionId }) => (
                            <FollowUpFormPanel
                              key={followUpForm.id}
                              followUpForm={followUpForm}
                              actionId={actionId}
                              onSubmitted={() => {
                                queryClient.invalidateQueries({
                                  queryKey: ["actions"],
                                });
                              }}
                            />
                          ),
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-y-4 rounded bg-grey-1 w-full py-8 lg:py-12 px-8">
                        <CheckIcon size="large" />
                        <p className="text-center text-zinc-500 text-lg lg:text-xl">
                          {noTasksToDoRightNow}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }, [
    actions,
    loading,
    currentTask,
    currentTaskOrGeneralUpdate,
    user,
    handleDismissAction,
    handleDismissGeneralUpdate,
    tasksListContent,
    queryClient,
    activeCompletableFollowUpForms,
  ]);

  const sidebarContent = useMemo(() => {
    return (
      <div className="px-4 flex flex-col *:py-6 *:px-2 divide-y divide-zinc-200 h-[calc(100vh-var(--navbar-top-bar-height))]">
        <div className="flex-1 min-h-0 flex flex-col">
          <GlobalFeed
            items={globalFeedItems}
            loading={globalFeedLoading}
            fitToHeight
          />
        </div>
      </div>
    );
  }, [globalFeedItems, globalFeedLoading]);

  useWhiteBackground();

  return isLargeScreen ? (
    <TwoColumnLayout
      main={mainContent}
      sidebar={sidebarContent}
      noSidebarOverflow
      mainScrollRef={mainScrollRef}
    />
  ) : (
    <div
      ref={mainScrollRef}
      className="w-full h-[calc(100vh-var(--navbar-top-bar-height))] bg-page overflow-y-auto [scrollbar-gutter:stable]"
    >
      {mainContent}
    </div>
  );
};

export default HomePage;
