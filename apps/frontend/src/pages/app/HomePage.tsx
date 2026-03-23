import CheckIcon from "@alliance/sharedweb/ui/icons/CheckIcon";
import AggregateProgressBarBlock from "@alliance/sharedweb/ui/AggregateProgressBarBlock";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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
  ActionWithAwayStatus,
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
import { useBoundedIndex } from "@alliance/shared/lib/useBoundedIndex";
import {
  fetchTaskFormProgressViewsByFormId,
  mapFormViewsToActionIds,
  sidebarProgressActionCandidates,
} from "../../lib/fetchTaskFormProgressViews";
import { CircleChevronRight } from "lucide-react";
import { cn } from "@alliance/shared/styles/util";

function followUpStartTimeMs(f: FollowUpForm): number {
  return f.startDate ? new Date(f.startDate).getTime() : Infinity;
}

function compareFollowUpFormsByStartDateDesc(
  a: FollowUpForm,
  b: FollowUpForm,
): number {
  return followUpStartTimeMs(b) - followUpStartTimeMs(a);
}

/** Ordered queue of main-column cards (action or follow-up) driven by the task navigator list. */
type TaskNavigatorItem =
  | { kind: "action"; action: ActionWithAwayStatus }
  | { kind: "followUpForm"; followUpForm: FollowUpForm; actionId: number };

function TaskNavigatorListShell({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden">
      <div className="flex flex-col gap-y-2">{children}</div>
    </div>
  );
}

function TaskNavigatorFollowUpRows({
  forms,
  activeFollowUpFormId,
  onSelectFollowUp,
}: {
  forms: FollowUpForm[];
  activeFollowUpFormId: number | null;
  onSelectFollowUp: (formId: number) => void;
}) {
  return forms.map((followUpForm) => {
    const isActive = activeFollowUpFormId === followUpForm.id;
    return (
      <button
        key={followUpForm.id}
        type="button"
        onClick={() => onSelectFollowUp(followUpForm.id)}
        aria-pressed={isActive}
        className={cn(
          "flex flex-row items-center gap-x-2 pl-6 rounded-md py-1 -mr-1 pr-1 w-full text-left border-0 bg-transparent cursor-pointer font-inherit",
          isActive ? "bg-green/10" : "hover:bg-grey-2",
        )}
      >
        <CircleChevronRight
          className={cn(
            "h-4 w-4 shrink-0",
            isActive ? "text-green" : "text-blue-400",
          )}
          aria-hidden
        />
        <span
          className={cn(
            isActive ? "text-zinc-900 font-semibold" : "text-zinc-600",
          )}
        >
          {followUpForm.name?.trim() ? followUpForm.name : "Follow-up form"}
        </span>
      </button>
    );
  });
}

function TaskNavigatorTodoActionRow({
  action,
  isActive,
  onSelect,
  showOptionalPrefix,
}: {
  action: ActionWithAwayStatus;
  isActive: boolean;
  onSelect: () => void;
  showOptionalPrefix: boolean;
}) {
  return (
    <li
      className={cn(
        "rounded-lg px-2 py-1.5 -mx-0.5 transition-colors",
        isActive ? "bg-green/10" : "hover:bg-grey-2",
      )}
      aria-current={isActive ? "true" : undefined}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={isActive}
        className={
          "text-zinc-600 flex gap-x-2 items-start w-full text-left border-0 bg-transparent p-0 cursor-pointer font-inherit"
        }
      >
        <div
          className={cn(
            "w-4! h-4! shrink-0 border-2 rounded-full mt-[4px]",
            isActive ? "border-green bg-green/20" : "border-zinc-200",
          )}
        />
        <span
          className={cn(
            isActive ? "text-zinc-900 font-semibold" : "text-zinc-600",
          )}
        >
          {showOptionalPrefix && action.optional && "(Optional) "}
          {action.name}
        </span>
      </button>
    </li>
  );
}

function TaskNavigatorCompletedRow({
  action,
  followUpForms,
  activeFollowUpFormId,
  onSelectCompletedTitle,
  onSelectFollowUp,
}: {
  action: ActionDto;
  followUpForms: FollowUpForm[];
  activeFollowUpFormId: number | null;
  onSelectCompletedTitle: () => void;
  onSelectFollowUp: (formId: number) => void;
}) {
  return (
    <div className="text-zinc-600 flex flex-col gap-y-1">
      <div className="flex gap-x-2 items-start">
        <CheckIcon size="line" />
        <button
          type="button"
          onClick={onSelectCompletedTitle}
          className="text-zinc-400 line-through text-left border-0 bg-transparent p-0 cursor-pointer font-inherit hover:text-zinc-500"
        >
          {action.optional && "(Optional) "}
          {action.name}
        </button>
      </div>
      <TaskNavigatorFollowUpRows
        forms={followUpForms}
        activeFollowUpFormId={activeFollowUpFormId}
        onSelectFollowUp={onSelectFollowUp}
      />
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

  const taskNavigatorItems = useMemo<TaskNavigatorItem[]>(() => {
    const actionCards: TaskNavigatorItem[] = [...todoActions]
      .sort(homePagePriorityComparator)
      .map((action) => ({ kind: "action", action }) as const);

    // Follow-up forms come after the todo actions; order within follow-ups is
    // already handled by `activeCompletableFollowUpForms`.
    const followUpCards: TaskNavigatorItem[] =
      activeCompletableFollowUpForms.map(({ followUpForm, actionId }) => ({
        kind: "followUpForm" as const,
        followUpForm,
        actionId,
      }));

    return [...actionCards, ...followUpCards];
  }, [todoActions, activeCompletableFollowUpForms]);

  const { index: taskNavigatorIndex, setIndex: setTaskNavigatorIndex } =
    useBoundedIndex(taskNavigatorItems.length);

  const sortedGeneralUpdates = useMemo(
    () => [...(generalUpdates ?? [])].sort(homePagePriorityComparator),
    [generalUpdates],
  );

  const selectedTaskNavigatorItem =
    taskNavigatorItems.length > 0
      ? taskNavigatorItems[taskNavigatorIndex]
      : undefined;

  const taskNavigatorListContent = useMemo(() => {
    const taskNavigatorCurrentWeekSidebarActions =
      currentWeekTodoActions.filter(showActionInSidebarList);
    const activeActionId =
      selectedTaskNavigatorItem?.kind === "action"
        ? selectedTaskNavigatorItem.action.id
        : null;
    const activeFollowUpFormId =
      selectedTaskNavigatorItem?.kind === "followUpForm"
        ? selectedTaskNavigatorItem.followUpForm.id
        : null;
    const hasTaskSectionContent =
      taskNavigatorCurrentWeekSidebarActions.length > 0 ||
      completedActions.length > 0 ||
      followUpParentActionsNotInCompletedList.length > 0;
    return (
      <>
        {hasTaskSectionContent && (
          <TaskNavigatorListShell>
            {taskNavigatorCurrentWeekSidebarActions.length + newActions.length >
              0 && (
              <p className="text-zinc-600 mb-1">
                <span className="text-green font-medium mr-0.5">
                  {taskNavigatorCurrentWeekSidebarActions.length} left
                </span>
                {numTodo > 0 &&
                  remainingTasksEstimatedTimeCurrentWeek > 0 &&
                  ` for a total of ${remainingTasksEstimatedTimeCurrentWeek} minutes`}
              </p>
            )}

            {/* Completed actions */}
            <ul className="list-none space-y-1 m-0 p-0">
              {[
                ...completedActions,
                ...followUpParentActionsNotInCompletedList,
              ].map((action) => (
                <li key={action.id}>
                  <TaskNavigatorCompletedRow
                    action={action}
                    followUpForms={followUpFormsByActionId[action.id] ?? []}
                    activeFollowUpFormId={activeFollowUpFormId}
                    onSelectCompletedTitle={() => {
                      const actionIdx = taskNavigatorItems.findIndex(
                        (c) => c.kind === "action" && c.action.id === action.id,
                      );
                      if (actionIdx >= 0) {
                        setTaskNavigatorIndex(actionIdx);
                        return;
                      }
                      const fuIdx = taskNavigatorItems.findIndex(
                        (c) =>
                          c.kind === "followUpForm" && c.actionId === action.id,
                      );
                      if (fuIdx >= 0) {
                        setTaskNavigatorIndex(fuIdx);
                      }
                    }}
                    onSelectFollowUp={(formId) => {
                      const idx = taskNavigatorItems.findIndex(
                        (c) =>
                          c.kind === "followUpForm" &&
                          c.actionId === action.id &&
                          c.followUpForm.id === formId,
                      );
                      if (idx >= 0) {
                        setTaskNavigatorIndex(idx);
                      }
                    }}
                  />
                </li>
              ))}

              {/* Actions in the current week */}
              {currentWeekTodoActions.map((action) => {
                const isActive = action.id === activeActionId;
                return (
                  <TaskNavigatorTodoActionRow
                    key={action.id}
                    action={action}
                    isActive={isActive}
                    showOptionalPrefix
                    onSelect={() => {
                      const idx = taskNavigatorItems.findIndex(
                        (c) => c.kind === "action" && c.action.id === action.id,
                      );
                      if (idx >= 0) {
                        setTaskNavigatorIndex(idx);
                      }
                    }}
                  />
                );
              })}
              {nextWeekTodoActions.length > 0 && (
                <>
                  <li className="list-none pt-2">
                    <p className="text-zinc-500 font-medium">Upcoming</p>
                  </li>
                  {nextWeekTodoActions.map((action) => {
                    const isActive = action.id === activeActionId;
                    return (
                      <TaskNavigatorTodoActionRow
                        key={action.id}
                        action={action}
                        isActive={isActive}
                        showOptionalPrefix={false}
                        onSelect={() => {
                          const idx = taskNavigatorItems.findIndex(
                            (c) =>
                              c.kind === "action" && c.action.id === action.id,
                          );
                          if (idx >= 0) {
                            setTaskNavigatorIndex(idx);
                          }
                        }}
                      />
                    );
                  })}
                </>
              )}
            </ul>
          </TaskNavigatorListShell>
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
    selectedTaskNavigatorItem,
    setTaskNavigatorIndex,
    taskNavigatorItems,
    remainingTasksEstimatedTimeCurrentWeek,
  ]);

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
                <p className="text-sm font-medium text-green mb-2">
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
                        captionClassName="text-sm text-zinc-600"
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
      selectedTaskNavigatorItem?.kind === "action"
        ? getTaskDismissInfo(selectedTaskNavigatorItem.action)
        : undefined;

    return (
      <div
        className={
          "flex flex-col gap-y-8 sm:gap-y-12 lg:gap-y-16 py-4 sm:py-8 px-4 xl:px-0 max-w-3xl mx-auto relative"
        }
      >
        {!hasOnboardingTasks && (
          <div className="flex flex-col gap-4">
            {isLargeScreen && (
              <>
                <div className="flex flex-row justify-between items-center px-1">
                  <p className="text-title">Updates</p>
                  <SeeAll link="/action-updates" size="lg" />
                </div>
                <HomeUpdatesRow />
                {sortedGeneralUpdates.length > 0 && (
                  <div className="flex flex-col gap-3">
                    {sortedGeneralUpdates.map((generalUpdate) => (
                      <LargeGeneralUpdateCard
                        key={generalUpdate.id}
                        id={generalUpdate.id}
                        title={generalUpdate.name}
                        schema={generalUpdate.schema}
                        onDismiss={() =>
                          handleDismissGeneralUpdate(generalUpdate.id)
                        }
                        userId={user?.id}
                        user={user}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {!isLargeScreen && <div>{sidebarProgressActionProgressBars}</div>}
          </div>
        )}

        <div className="flex flex-col gap-4 flex-1">
          <p className="text-title">Tasks</p>
          {taskNavigatorListContent}

          {selectedTaskNavigatorItem?.kind === "action" &&
          selectedTaskNavigatorItem.action.userRelation ? (
            <LargeActionCard
              action={selectedTaskNavigatorItem.action}
              dismissProps={
                taskDismissInfo
                  ? {
                      ...taskDismissInfo,
                      onDismiss: () =>
                        handleDismissAction(
                          selectedTaskNavigatorItem.action.id,
                        ),
                    }
                  : undefined
              }
              userRelation={selectedTaskNavigatorItem.action.userRelation}
              onCompleteAction={() => {
                queryClient.setQueryData<ActionDto[] | undefined>(
                  ["actions"],
                  (prev) =>
                    prev?.map((action) =>
                      action.id === selectedTaskNavigatorItem.action.id
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
          ) : selectedTaskNavigatorItem?.kind === "followUpForm" ? (
            <div className="w-full mx-auto">
              <FollowUpFormPanel
                key={selectedTaskNavigatorItem.followUpForm.id}
                followUpForm={selectedTaskNavigatorItem.followUpForm}
                actionId={selectedTaskNavigatorItem.actionId}
                onSubmitted={() => {
                  queryClient.invalidateQueries({
                    queryKey: ["actions"],
                  });
                }}
              />
            </div>
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

        {!isLargeScreen && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-row justify-between items-center px-1">
              <p className="text-title">Updates</p>
              <SeeAll link="/action-updates" size="lg" />
            </div>
            <HomeUpdatesRow />
            {sortedGeneralUpdates.length > 0 && (
              <div className="flex flex-col gap-3">
                {sortedGeneralUpdates.map((generalUpdate) => (
                  <LargeGeneralUpdateCard
                    key={generalUpdate.id}
                    id={generalUpdate.id}
                    title={generalUpdate.name}
                    schema={generalUpdate.schema}
                    onDismiss={() =>
                      handleDismissGeneralUpdate(generalUpdate.id)
                    }
                    userId={user?.id}
                    user={user}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <HomeFeed />
      </div>
    );
  }, [
    actions,
    loading,
    selectedTaskNavigatorItem,
    user,
    handleDismissAction,
    handleDismissGeneralUpdate,
    sortedGeneralUpdates,
    taskNavigatorListContent,
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
  }, [globalFeedItems, globalFeedLoading, sidebarProgressActionProgressBars]);

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
