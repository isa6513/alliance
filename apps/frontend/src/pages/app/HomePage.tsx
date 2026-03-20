import CheckIcon from "@alliance/sharedweb/ui/icons/CheckIcon";
import AggregateProgressBarBlock from "@alliance/sharedweb/ui/AggregateProgressBarBlock";
import { useEffect, useMemo, useRef, useState } from "react";
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
import LargeActionCard from "./LargeActionCard";
import { getTaskDismissInfo } from "@alliance/shared/lib/largeActionCard";
import LargeGeneralUpdateCard from "@alliance/sharedweb/ui/LargeGeneralUpdateCard";
import useGlobalFeed from "@alliance/shared/lib/useGlobalFeed";
import { useMediaQuery } from "../../lib/useMediaQuery";
import {
  isGeneralUpdate,
  homePagePriorityComparator,
  showActionInSidebarList,
  isFollowUpFormActive,
} from "@alliance/shared/lib/actionUtils";
import { useHomePageActions } from "@alliance/shared/lib/homePage";
import {
  noTasksContractSuspended,
  noTasksToDoRightNow,
} from "@alliance/shared/lib/copy";
import FollowUpFormPanel from "../../components/FollowUpFormPanel";
import { useTaskActionsData } from "../../lib/useTaskActionsData";
import HomeUpdatesRow from "../../components/HomeUpdatesRow";
import SeeAll from "../../components/SeeAll";
import HomeFeed from "../../components/HomeFeed";
import type { AggregateViewSchema } from "@alliance/shared/forms/formschema";
import { runAsync } from "@alliance/shared/lib/utils";
import {
  fetchTaskFormProgressViewsByFormId,
  mapFormViewsToActionIds,
  sidebarProgressActionCandidates,
} from "../../lib/fetchTaskFormProgressViews";
import { CircleChevronRight } from "lucide-react";

function followUpStartTimeMs(f: FollowUpForm): number {
  return f.startDate ? new Date(f.startDate).getTime() : Infinity;
}

function compareFollowUpFormsByStartDateDesc(
  a: FollowUpForm,
  b: FollowUpForm,
): number {
  return followUpStartTimeMs(b) - followUpStartTimeMs(a);
}

function FollowUpFormBulletRows({
  actionId,
  forms,
}: {
  actionId: number;
  forms: FollowUpForm[];
}) {
  return forms.map((followUpForm) => (
    <div
      key={followUpForm.id}
      className="flex flex-row items-center gap-x-2 pl-6"
    >
      <CircleChevronRight
        className="h-4 w-4 shrink-0 text-blue-400"
        aria-hidden
      />
      <Link
        to={href("/actions/:id", { id: actionId.toString() })}
        className="text-zinc-600 hover:text-zinc-900"
      >
        {followUpForm.name?.trim() ? followUpForm.name : "Follow-up form"}
      </Link>
    </div>
  ));
}

function SidebarCompletedActionRow({
  action,
  followUpForms,
}: {
  action: ActionDto;
  followUpForms: FollowUpForm[];
}) {
  return (
    <div className="text-zinc-600 flex flex-col gap-y-1">
      <div className="flex gap-x-2">
        <CheckIcon size="line" />
        <Link
          to={href("/actions/:id", { id: action.id.toString() })}
          className="text-zinc-400 line-through"
        >
          {action.optional && "(Optional) "}
          {action.name}
        </Link>
      </div>
      <FollowUpFormBulletRows actionId={action.id} forms={followUpForms} />
    </div>
  );
}

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
  const [actionProgressViews, setActionProgressViews] = useState<
    Record<number, AggregateViewSchema[]>
  >({});

  const { items: globalFeedItems, loading: globalFeedLoading } = useGlobalFeed({
    limit: 10,
  });

  useCIDFromParams();

  const {
    todoActions,
    newActions,
    currentWeekTodoActions,
    nextWeekTodoActions,
    remainingTasksEstimatedTimeCurrentWeek,
    completedActions,
  } = useHomePageActions(actions);

  const numTodo = todoActions.filter(showActionInSidebarList).length;

  const hasOnboardingTasks = useMemo(
    () =>
      todoActions.some((a) => a.onboarding) ||
      newActions.some((a) => a.onboarding),
    [todoActions, newActions],
  );

  const isLargeScreen = useMediaQuery("(min-width: 1150px)");

  useEffect(() => {
    if (!actions) {
      setActionProgressViews({});
      return;
    }

    const candidates = sidebarProgressActionCandidates(actions);
    if (candidates.length === 0) {
      setActionProgressViews({});
      return;
    }

    let cancelled = false;
    const formIds = candidates.map((c) => c.formId);

    runAsync(async () => {
      const viewsByFormId = await fetchTaskFormProgressViewsByFormId(formIds);
      if (cancelled) {
        return;
      }
      setActionProgressViews(
        mapFormViewsToActionIds(candidates, viewsByFormId),
      );
    });

    return () => {
      cancelled = true;
    };
  }, [actions]);

  const sidebarProgressActions = useMemo(() => {
    if (!actions) {
      return [];
    }
    return actions
      .filter(
        (action) =>
          action.status === "member_action" &&
          action.shouldParticipate &&
          (actionProgressViews[action.id]?.some(
            (v) => v.kind === "progressbar",
          ) ??
            false),
      )
      .sort(homePagePriorityComparator);
  }, [actionProgressViews, actions]);

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
      for (const f of action.followUpForms) {
        if (isFollowUpFormActive(f)) {
          list.push({ followUpForm: f, actionId: action.id });
        }
      }
    }
    return list.sort(
      (a, b) =>
        followUpStartTimeMs(b.followUpForm) -
        followUpStartTimeMs(a.followUpForm),
    );
  }, [actions]);

  const followUpFormsByActionId = useMemo(() => {
    const map: Record<number, FollowUpForm[]> = {};
    for (const { followUpForm, actionId } of activeCompletableFollowUpForms) {
      (map[actionId] ??= []).push(followUpForm);
    }
    for (const forms of Object.values(map)) {
      forms.sort(compareFollowUpFormsByStartDateDesc);
    }
    return map;
  }, [activeCompletableFollowUpForms]);

  const followUpParentActionsNotInCompletedList = useMemo(() => {
    if (!actions) {
      return [];
    }
    const completedIds = new Set(completedActions.map((a) => a.id));
    const orphanIds = new Set<number>();
    for (const { actionId } of activeCompletableFollowUpForms) {
      if (!completedIds.has(actionId)) {
        orphanIds.add(actionId);
      }
    }
    return actions
      .filter((a) => orphanIds.has(a.id))
      .sort(homePagePriorityComparator);
  }, [actions, activeCompletableFollowUpForms, completedActions]);

  const tasksListContent = useMemo(() => {
    const currentWeekSidebarActions = currentWeekTodoActions.filter(
      showActionInSidebarList,
    );

    return (
      <>
        {(currentWeekSidebarActions.length > 0 ||
          completedActions.length > 0 ||
          followUpParentActionsNotInCompletedList.length > 0) && (
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
              {[
                ...completedActions,
                ...followUpParentActionsNotInCompletedList,
              ].map((action) => (
                <SidebarCompletedActionRow
                  key={action.id}
                  action={action}
                  followUpForms={followUpFormsByActionId[action.id] ?? []}
                />
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
    followUpFormsByActionId,
    followUpParentActionsNotInCompletedList,
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

  const sidebarProgressActionProgressBars = useMemo(() => {
    if (sidebarProgressActions.length === 0) {
      return <></>;
    }
    return (
      <>
        <div className="flex flex-col gap-y-3">
          <div className="flex flex-col gap-y-2">
            {sidebarProgressActions.map((action) => (
              <Link
                key={action.id}
                to={href("/actions/:id", { id: action.id.toString() })}
                className="block p-4 rounded bg-white hover:bg-grey-1 transition-colors"
              >
                <p className="text-xs font-medium text-green mb-2">
                  {action.name}
                </p>
                <div className="flex flex-col gap-y-2">
                  {(actionProgressViews[action.id] ?? [])
                    .filter((v) => v.kind === "progressbar")
                    .map((view) => (
                      <AggregateProgressBarBlock
                        key={view.id}
                        view={view}
                        titleClassName="text-base font-medium text-black"
                        captionClassName="text-xs text-zinc-600"
                        className="flex flex-col gap-y-1"
                      />
                    ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </>
    );
  }, [sidebarProgressActions, actionProgressViews]);

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

    const taskDismissInfo =
      currentTaskOrGeneralUpdate &&
      !isGeneralUpdate(currentTaskOrGeneralUpdate)
        ? getTaskDismissInfo(currentTaskOrGeneralUpdate)
        : undefined;

    return (
      <div
        className={
          "flex flex-col gap-y-8 sm:gap-y-12 lg:gap-y-16 py-4 sm:py-8 px-4 xl:px-0 max-w-3xl mx-auto relative"
        }
      >
        {!hasOnboardingTasks && (
          <div>
            <div className="flex flex-row justify-between items-center mb-4 px-1">
              <p className="text-title">Action updates</p>
              <SeeAll link="/action-updates" size="lg" />
            </div>
            <HomeUpdatesRow />

            {!isLargeScreen && (
              <div className="mt-4">{sidebarProgressActionProgressBars}</div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-6 flex-1">
          <div className="flex flex-col gap-y-1">
            <p className="text-title">Tasks</p>
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
              dismissProps={
                taskDismissInfo
                  ? {
                      ...taskDismissInfo,
                      onDismiss: () =>
                        handleDismissAction(currentTaskOrGeneralUpdate.id),
                    }
                  : undefined
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
                      <div className="flex flex-col items-center gap-y-4 rounded border border-grey-2 w-full py-8 lg:py-12 px-8">
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

        <HomeFeed />
      </div>
    );
  }, [
    actions,
    loading,
    currentTaskOrGeneralUpdate,
    user,
    handleDismissAction,
    handleDismissGeneralUpdate,
    tasksListContent,
    queryClient,
    activeCompletableFollowUpForms,
    hasOnboardingTasks,
    isLargeScreen,
    sidebarProgressActionProgressBars,
  ]);

  const sidebarContent = useMemo(() => {
    return (
      <div className="pt-6 px-4 flex flex-col *:pb-4 *:px-2 h-[calc(100vh-var(--navbar-top-bar-height))]">
        {sidebarProgressActionProgressBars}
        <div className="flex-1 min-h-0 flex flex-col">
          <GlobalFeed
            items={globalFeedItems}
            loading={globalFeedLoading}
            fitToHeight
          />
        </div>
      </div>
    );
  }, [
    actionProgressViews,
    globalFeedItems,
    globalFeedLoading,
    sidebarProgressActions,
  ]);

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
