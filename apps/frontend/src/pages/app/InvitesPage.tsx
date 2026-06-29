import { OnetimeInviteDto } from "@alliance/shared/client";
import { MEMBER_GOAL } from "@alliance/shared/lib/constants";
import {
  deleteInviteConfirmation,
  inviteBuckets,
} from "@alliance/shared/lib/copy";
import { bucketOnetimeInvitesByActionability } from "@alliance/shared/lib/inviteUtils";
import { useAllianceMemberCount } from "@alliance/shared/lib/useAllianceMemberCount";
import { useAmbassadorInviteDashboard } from "@alliance/shared/lib/useAmbassadorInviteDashboard";
import { useOnetimeInvitesOverview } from "@alliance/shared/lib/useOnetimeInvitesOverview";
import { getLeaderCommunityIds } from "@alliance/shared/lib/userUtils";
import { CardStyle } from "@alliance/shared/styles/card";
import { getBaseUrl } from "@alliance/sharedweb/lib/config";
import Card from "@alliance/sharedweb/ui/Card";
import CenterLayout from "@alliance/sharedweb/ui/CenterLayout";
import InfoTooltip from "@alliance/sharedweb/ui/InfoTooltip";
import List from "@alliance/sharedweb/ui/List";
import Spinner from "@alliance/sharedweb/ui/Spinner";
import { useToast } from "@alliance/sharedweb/ui/ToastProvider";
import { ChevronLeft, ChevronRight, Trash2, UserCheck } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, MouseEvent } from "react";
import InviteForm from "../../components/InviteForm";
import InviteShareLink from "../../components/InviteShareLink";
import OnetimeInviteListItem from "../../components/OnetimeInviteListItem";
import PillTab from "../../components/PillTab";
import { useAuth } from "../../lib/AuthContext";

const formatPercent = (numerator: number, denominator: number) => {
  if (denominator === 0) {
    return "0%";
  }
  return `${Math.round((numerator / denominator) * 100)}%`;
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const dateInputToEndOfDayIso = (value: string) =>
  new Date(`${value}T23:59:59`).toISOString();

const dateInputToStartOfDayIso = (value: string) =>
  new Date(`${value}T00:00:00`).toISOString();

const padDatePart = (value: number) => String(value).padStart(2, "0");

const dateToInputValue = (value: string | Date) => {
  const date = new Date(value);
  return [
    date.getFullYear(),
    padDatePart(date.getMonth() + 1),
    padDatePart(date.getDate()),
  ].join("-");
};

const todayDateInputValue = () => dateToInputValue(new Date());

const oneMonthFromTodayDateInputValue = () => {
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  return dateToInputValue(nextMonth);
};

const inviteGoalErrorMessage = (err: Error) => {
  if (err.message.toLowerCase().includes("overlap")) {
    return "Those dates overlap with an existing invite goal.";
  }
  return err.message;
};

const inviteStatsMetrics = (stats: {
  totalInvitesSent: number;
  totalAcceptedInvites: number;
  totalSuccessfulRecruits: number;
}) => [
  {
    label: "Invites",
    value: stats.totalInvitesSent,
  },
  {
    label: "Accepted",
    value: stats.totalAcceptedInvites,
  },
  {
    label: "Successful",
    value: stats.totalSuccessfulRecruits,
  },
  {
    label: "Accepted %",
    value: formatPercent(stats.totalAcceptedInvites, stats.totalInvitesSent),
  },
  {
    label: "Success %",
    value: formatPercent(stats.totalSuccessfulRecruits, stats.totalInvitesSent),
  },
];

const InvitesPage = () => {
  const { user } = useAuth();
  const { error: errorToast, confirm } = useToast();
  const {
    invites,
    isLoading: loadingInvites,
    isError,
    upsertInvite,
    approveInvite,
    rejectInvite,
    deleteInvite,
  } = useOnetimeInvitesOverview({ enabled: Boolean(user) });
  const [copiedInviteId, setCopiedInviteId] = useState<number | null>(null);
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activeTab, setActiveTab] = useState<"onetime" | "reusable">("onetime");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalStartDate, setGoalStartDate] = useState(todayDateInputValue);
  const [goalDueDate, setGoalDueDate] = useState(
    oneMonthFromTodayDateInputValue,
  );
  const [selectedGoalIndex, setSelectedGoalIndex] = useState(0);
  const [editGoalStartDate, setEditGoalStartDate] = useState("");
  const [editGoalDueDate, setEditGoalDueDate] = useState("");
  const [goalFormMessage, setGoalFormMessage] = useState<string | null>(null);
  const [goalEditMessage, setGoalEditMessage] = useState<string | null>(null);
  const previousGoalCountRef = useRef(0);
  const {
    data: ambassadorDashboard,
    isLoading: loadingAmbassadorDashboard,
    isError: ambassadorDashboardError,
    createGoal,
    isCreatingGoal,
    updateGoal,
    isUpdatingGoal,
    deleteGoal,
    isDeletingGoal,
    refetch: refetchAmbassadorDashboard,
  } = useAmbassadorInviteDashboard({ enabled: Boolean(user?.ambassador) });

  const selectedGoal = ambassadorDashboard?.goals[selectedGoalIndex];
  const goalCount = ambassadorDashboard?.goals.length ?? 0;

  useEffect(() => {
    const previousGoalCount = previousGoalCountRef.current;
    if (goalCount !== previousGoalCount) {
      previousGoalCountRef.current = goalCount;
      setSelectedGoalIndex(Math.max(0, goalCount - 1));
      return;
    }
    if (selectedGoalIndex >= goalCount) {
      setSelectedGoalIndex(Math.max(0, goalCount - 1));
    }
  }, [goalCount, selectedGoalIndex]);

  useEffect(() => {
    if (!selectedGoal) {
      setEditGoalStartDate("");
      setEditGoalDueDate("");
      return;
    }
    setEditGoalStartDate(dateToInputValue(selectedGoal.goal.startAt));
    setEditGoalDueDate(dateToInputValue(selectedGoal.goal.dueAt));
    setGoalEditMessage(null);
  }, [selectedGoal]);

  const leaderCommunityIds = useMemo(
    () => getLeaderCommunityIds(user ?? undefined),
    [user],
  );

  const { actionable, unverifiableActionable, waitingForResponse, settled } =
    useMemo(() => {
      if (!user) {
        return {
          actionable: [],
          unverifiableActionable: [],
          waitingForResponse: [],
          settled: [],
        };
      }
      return bucketOnetimeInvitesByActionability({
        invites,
        leaderCommunityIds,
        userId: user.id,
      });
    }, [invites, leaderCommunityIds, user]);

  const acceptedInvites = useMemo(() => {
    return invites.filter((invite) => invite.status === "link_used");
  }, [invites]);

  const copyToClipboard = useCallback((text: string) => {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/signup?ref=${text}`;
    navigator.clipboard.writeText(url);
  }, []);

  const handleCopied = useCallback((inviteId: number) => {
    if (copiedTimeoutRef.current) {
      clearTimeout(copiedTimeoutRef.current);
    }
    setCopiedInviteId(inviteId);
    copiedTimeoutRef.current = setTimeout(() => {
      setCopiedInviteId(null);
      copiedTimeoutRef.current = null;
    }, 2000);
  }, []);

  const handleApproveInvite = useCallback(
    (inviteId: number) => {
      void approveInvite(inviteId).catch((err: Error) => {
        errorToast(`Failed to approve invite: ${err.message}`);
      });
    },
    [approveInvite, errorToast],
  );

  const handleRejectInvite = useCallback(
    (inviteId: number) => {
      void rejectInvite(inviteId).catch((err: Error) => {
        errorToast(`Failed to reject invite: ${err.message}`);
      });
    },
    [rejectInvite, errorToast],
  );

  const handleDeleteInvite = useCallback(
    (inviteId: number, event: MouseEvent<HTMLElement>) => {
      void (async () => {
        const ok = await confirm({
          message: deleteInviteConfirmation.message,
          confirmLabel: deleteInviteConfirmation.confirmLabel,
          cancelLabel: deleteInviteConfirmation.cancelLabel,
          anchorEl: event.currentTarget,
          placement: "topleft",
        });
        if (!ok) {
          return;
        }

        await deleteInvite(inviteId).catch(() => {});
      })();
    },
    [confirm, deleteInvite],
  );

  const handleDeleteRequest = useCallback(
    (inviteId: number) => {
      void deleteInvite(inviteId).catch(() => {});
    },
    [deleteInvite],
  );

  const handleInviteCreated = useCallback(
    (invite: OnetimeInviteDto) => {
      upsertInvite(invite);
      if (user?.ambassador) {
        void refetchAmbassadorDashboard();
      }
    },
    [refetchAmbassadorDashboard, upsertInvite, user?.ambassador],
  );

  const handleDeleteGoal = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      if (!selectedGoal) {
        return;
      }

      const goalId = selectedGoal.goal.id;
      void (async () => {
        const ok = await confirm({
          title: "Delete recruit goal?",
          message: "Are you sure you want to do this?",
          confirmLabel: "Delete goal",
          cancelLabel: "Cancel",
          anchorEl: event.currentTarget,
          placement: "topleft",
        });
        if (!ok) {
          return;
        }

        await deleteGoal(goalId).catch((err: Error) => {
          errorToast(`Failed to delete goal: ${err.message}`);
        });
      })();
    },
    [confirm, deleteGoal, errorToast, selectedGoal],
  );

  const handleSetGoal = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const target = Number(goalTarget);
      if (!Number.isInteger(target) || target < 1) {
        errorToast("Goal must be at least 1 successful recruit.");
        return;
      }

      void createGoal({
        targetSuccessfulRecruits: target,
        startAt: dateInputToStartOfDayIso(goalStartDate),
        dueAt: dateInputToEndOfDayIso(goalDueDate),
      })
        .then(() => {
          setGoalTarget("");
          setGoalFormMessage(null);
        })
        .catch((err: Error) => {
          setGoalFormMessage(inviteGoalErrorMessage(err));
        });
    },
    [createGoal, errorToast, goalDueDate, goalStartDate, goalTarget],
  );

  const updateSelectedGoalDates = useCallback(
    (startDate: string, dueDate: string) => {
      if (!selectedGoal) {
        return;
      }

      void updateGoal({
        goalId: selectedGoal.goal.id,
        body: {
          startAt: dateInputToStartOfDayIso(startDate),
          dueAt: dateInputToEndOfDayIso(dueDate),
        },
      })
        .then(() => {
          setGoalEditMessage(null);
        })
        .catch((err: Error) => {
          setGoalEditMessage(inviteGoalErrorMessage(err));
        });
    },
    [selectedGoal, updateGoal],
  );

  const handleEditGoalStartDateChange = useCallback(
    (value: string) => {
      setEditGoalStartDate(value);
      updateSelectedGoalDates(value, editGoalDueDate);
    },
    [editGoalDueDate, updateSelectedGoalDates],
  );

  const handleEditGoalDueDateChange = useCallback(
    (value: string) => {
      setEditGoalDueDate(value);
      updateSelectedGoalDates(editGoalStartDate, value);
    },
    [editGoalStartDate, updateSelectedGoalDates],
  );

  const selectedGoalProgressPercent = useMemo(() => {
    if (!selectedGoal) {
      return 0;
    }
    return Math.min(
      100,
      (selectedGoal.stats.goalSuccessfulRecruits /
        selectedGoal.goal.targetSuccessfulRecruits) *
        100,
    );
  }, [selectedGoal]);

  const goalPositionLabel = selectedGoal
    ? `${selectedGoalIndex + 1} of ${goalCount}`
    : "No goals yet";

  const canShowOlderGoal = selectedGoalIndex > 0;
  const canShowNewerGoal = selectedGoalIndex < goalCount - 1;

  const { data: allianceMemberCount, isPending: allianceMemberCountPending } =
    useAllianceMemberCount({ enabled: Boolean(user) });

  const allianceProgressPercent = useMemo(() => {
    const n = allianceMemberCount ?? 0;
    return Math.min(100, (n / MEMBER_GOAL) * 100);
  }, [allianceMemberCount]);

  if (!user || loadingInvites) {
    return <Spinner />;
  }

  return (
    <CenterLayout>
      <div className="flex flex-col gap-y-2">
        {user.ambassador && activeTab === "onetime" && (
          <Card style={CardStyle.White} className="p-6 gap-y-5 order-3">
            <div className="flex flex-col gap-y-1">
              <p className="text-sm font-semibold text-green">Ambassador</p>
              <h1 className="text-title">Recruiting dashboard</h1>
            </div>

            {ambassadorDashboardError ? (
              <p className="text-sm text-red-500">
                Failed to load ambassador invite stats.
              </p>
            ) : loadingAmbassadorDashboard || !ambassadorDashboard ? (
              <Spinner />
            ) : (
              <div className="flex flex-col gap-y-5">
                <div className="rounded border border-zinc-200 p-4 sm:p-5 flex flex-col gap-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <p className="font-semibold text-lg">
                        Successful recruit goal
                      </p>
                      <p className="text-sm text-zinc-500">
                        {selectedGoal
                          ? `${formatDate(selectedGoal.goal.startAt)} - ${formatDate(selectedGoal.goal.dueAt)}`
                          : "Set a goal with a date range."}
                      </p>
                    </div>
                    <div className="flex flex-row items-center gap-x-2 shrink-0">
                      {selectedGoal && (
                        <button
                          className="border border-red-100 text-red-600 rounded p-2 disabled:opacity-40 h-10 w-10 flex items-center justify-center"
                          type="button"
                          aria-label="Delete recruit goal"
                          disabled={isDeletingGoal}
                          onClick={handleDeleteGoal}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        className="border border-zinc-200 rounded p-2 disabled:opacity-40 h-10 w-10 flex items-center justify-center"
                        type="button"
                        aria-label="Show older invite goal"
                        disabled={!canShowOlderGoal}
                        onClick={() =>
                          setSelectedGoalIndex((index) =>
                            Math.max(0, index - 1),
                          )
                        }
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <p className="text-sm text-zinc-500 tabular-nums min-w-12 text-center">
                        {goalPositionLabel}
                      </p>
                      <button
                        className="border border-zinc-200 rounded p-2 disabled:opacity-40 h-10 w-10 flex items-center justify-center"
                        type="button"
                        aria-label="Show newer invite goal"
                        disabled={!canShowNewerGoal}
                        onClick={() =>
                          setSelectedGoalIndex((index) =>
                            Math.min(goalCount - 1, index + 1),
                          )
                        }
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-y-1">
                    <div className="w-full h-4 bg-grey-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green rounded-full transition-[width] duration-300 ease-out"
                        style={{ width: `${selectedGoalProgressPercent}%` }}
                        role="progressbar"
                        aria-valuenow={
                          selectedGoal?.stats.goalSuccessfulRecruits ?? 0
                        }
                        aria-valuemin={0}
                        aria-valuemax={
                          selectedGoal?.goal.targetSuccessfulRecruits ?? 0
                        }
                        aria-label="Successful recruits toward ambassador goal"
                      />
                    </div>
                    <p className="text-sm sm:text-base tabular-nums">
                      <span className="font-semibold text-green">
                        {selectedGoal?.stats.goalSuccessfulRecruits ?? 0}
                      </span>
                      <span className="text-zinc-500">
                        {" "}
                        / {selectedGoal?.goal.targetSuccessfulRecruits ?? 0}{" "}
                        successful recruits
                      </span>
                    </p>
                  </div>

                  {selectedGoal && (
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
                      {inviteStatsMetrics(selectedGoal.stats).map((metric) => (
                        <div
                          key={metric.label}
                          className="rounded border border-zinc-200 bg-zinc-100 px-3 py-2 min-w-0"
                        >
                          <p className="text-sm text-zinc-500 leading-tight">
                            {metric.label}
                          </p>
                          <p className="mt-1 text-base font-semibold tabular-nums break-words">
                            {metric.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedGoal && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
                      <label className="flex flex-col gap-y-1 min-w-0">
                        <span className="text-xs font-semibold text-zinc-500">
                          Goal start
                        </span>
                        <input
                          className="border border-zinc-200 rounded px-3 py-2 h-11 w-full min-w-0"
                          type="date"
                          value={editGoalStartDate}
                          disabled={isUpdatingGoal}
                          onChange={(event) =>
                            handleEditGoalStartDateChange(event.target.value)
                          }
                        />
                      </label>
                      <label className="flex flex-col gap-y-1 min-w-0">
                        <span className="text-xs font-semibold text-zinc-500">
                          Goal end
                        </span>
                        <input
                          className="border border-zinc-200 rounded px-3 py-2 h-11 w-full min-w-0"
                          type="date"
                          value={editGoalDueDate}
                          disabled={isUpdatingGoal}
                          onChange={(event) =>
                            handleEditGoalDueDateChange(event.target.value)
                          }
                        />
                      </label>
                      {isUpdatingGoal && !goalEditMessage && (
                        <p className="md:col-span-2 text-sm text-zinc-500">
                          Saving...
                        </p>
                      )}
                      {goalEditMessage && (
                        <p className="md:col-span-2 text-sm text-red-500">
                          {goalEditMessage}
                        </p>
                      )}
                    </div>
                  )}

                </div>

                <div className="rounded border border-zinc-200 bg-zinc-100 p-4 sm:p-5 flex flex-col gap-y-3">
                  <div>
                    <p className="font-semibold text-lg">Set a new goal</p>
                    <p className="text-sm text-zinc-500">
                      New goals can start in the past, but they cannot overlap
                      another invite goal.
                    </p>
                  </div>

                  <form
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-3 items-end"
                    onSubmit={handleSetGoal}
                  >
                    <label className="flex flex-col gap-y-1 min-w-0">
                      <span className="text-xs font-semibold text-zinc-500">
                        Target successful recruits
                      </span>
                      <input
                        className="border border-zinc-200 rounded px-3 py-2 h-11 w-full min-w-0 bg-white"
                        type="number"
                        min={1}
                        inputMode="numeric"
                        placeholder="10"
                        value={goalTarget}
                        onChange={(event) => setGoalTarget(event.target.value)}
                      />
                    </label>
                    <label className="flex flex-col gap-y-1 min-w-0">
                      <span className="text-xs font-semibold text-zinc-500">
                        Start date
                      </span>
                      <input
                        className="border border-zinc-200 rounded px-3 py-2 h-11 w-full min-w-0 bg-white"
                        type="date"
                        value={goalStartDate}
                        onChange={(event) =>
                          setGoalStartDate(event.target.value)
                        }
                      />
                    </label>
                    <label className="flex flex-col gap-y-1 min-w-0">
                      <span className="text-xs font-semibold text-zinc-500">
                        End date
                      </span>
                      <input
                        className="border border-zinc-200 rounded px-3 py-2 h-11 w-full min-w-0 bg-white"
                        type="date"
                        value={goalDueDate}
                        onChange={(event) => setGoalDueDate(event.target.value)}
                      />
                    </label>
                    <button
                      className="bg-black text-white rounded px-5 py-2 h-11 disabled:opacity-50 whitespace-nowrap w-full sm:col-span-2 lg:col-span-1 lg:w-auto lg:min-w-32"
                      type="submit"
                      disabled={isCreatingGoal}
                    >
                      Set goal
                    </button>
                    {goalFormMessage && (
                      <p className="sm:col-span-2 lg:col-span-3 text-sm text-red-500">
                        {goalFormMessage}
                      </p>
                    )}
                  </form>
                </div>

                <details className="rounded border border-zinc-200 px-4 py-3 text-sm">
                  <summary className="cursor-pointer font-medium text-zinc-600">
                    Total invite stats
                  </summary>
                  <div className="mt-3 grid grid-cols-2 lg:grid-cols-5 gap-2">
                    {inviteStatsMetrics(ambassadorDashboard.stats).map(
                      (metric) => (
                        <div key={metric.label} className="min-w-0">
                          <p className="text-sm text-zinc-500 leading-tight">
                            {metric.label}
                          </p>
                          <p className="mt-1 text-base font-semibold tabular-nums break-words">
                            {metric.value}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </details>

                <p className="text-sm text-zinc-500 leading-snug">
                  Successful recruits are counted when someone you invited
                  completes their first assigned action.
                </p>
              </div>
            )}
          </Card>
        )}

        <Card style={CardStyle.White} className="p-6 gap-y-6 order-1">
          <div className="flex flex-col gap-y-4">
            <h1 className="text-title">Invites</h1>
            <div className="w-full flex flex-row items-center gap-x-6">
              <div className="flex-1 rounded flex flex-col gap-y-1 min-w-0">
                <p className="leading-snug text-zinc-500 text-sm flex flex-row items-center gap-x-1">
                  Help the Alliance reach its current growth goal
                  <InfoTooltip
                    content="The office sets regular growth goals so that the Alliance can test processes and actions at progressively larger scales."
                    size={12}
                  />
                </p>
                <div className="flex flex-col gap-y-1">
                  <div className="w-full h-4 bg-grey-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green rounded-full transition-[width] duration-300 ease-out"
                      style={{ width: `${allianceProgressPercent}%` }}
                      role="progressbar"
                      aria-valuenow={allianceMemberCount ?? 0}
                      aria-valuemin={0}
                      aria-valuemax={MEMBER_GOAL}
                      aria-label="Alliance members toward growth goal"
                    />
                  </div>
                  <p className="text-sm sm:text-base tabular-nums">
                    <span className="font-semibold text-green">
                      {allianceMemberCountPending
                        ? "…"
                        : (allianceMemberCount ?? 0).toLocaleString()}
                    </span>
                    <span className="text-zinc-500">
                      {" "}
                      / {MEMBER_GOAL.toLocaleString()} members
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex flex-row items-center gap-x-2 bg-zinc-50 rounded p-4">
                <UserCheck className="w-10 h-10 bg-green/10 rounded p-2 text-green" />
                <div>
                  <p className="font-semibold text-black text-lg sm:text-xl">
                    {acceptedInvites.length}
                  </p>
                  <p className="leading-none text-zinc-500 text-sm sm:text-base">
                    Accepted invites
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-row gap-x-2">
            <PillTab
              label="Invite an individual"
              selected={activeTab === "onetime"}
              onClick={() => setActiveTab("onetime")}
            />
            <PillTab
              label="Invite multiple people"
              selected={activeTab === "reusable"}
              onClick={() => setActiveTab("reusable")}
            />
          </div>
        </Card>

        {activeTab === "reusable" ? (
          <div className="flex flex-col gap-y-12 order-2">
            <InviteShareLink />
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-y-12 order-2">
              <InviteForm onInviteCreated={handleInviteCreated} />
            </div>
            <div className="flex flex-col gap-y-12 order-4 pt-5">
              {isError && (
                <p className="text-red-500 text-sm">Failed to load invites</p>
              )}

              {actionable.length === 0 &&
                unverifiableActionable.length === 0 &&
                waitingForResponse.length === 0 &&
                settled.length === 0 && (
                  <p className="text-zinc-500 text-center text-base sm:text-lg">
                    Your invites will appear here once you create them.
                  </p>
                )}

              {actionable.length > 0 && (
                <div className="flex flex-col gap-y-4">
                  <p className="font-semibold text-2xl">
                    {inviteBuckets.actionable.title}
                  </p>
                  <List>
                    {actionable.map((request) => (
                      <OnetimeInviteListItem
                        key={request.id}
                        invite={request}
                        showCommunityLabel={true}
                        communityLabel={request.community?.name}
                        selfInvited={user.id === request.invitingUser?.id}
                        onApprove={handleApproveInvite}
                        onReject={handleRejectInvite}
                      />
                    ))}
                  </List>
                </div>
              )}

              {unverifiableActionable.length > 0 && (
                <div className="flex flex-col gap-y-4">
                  <div className="flex flex-col gap-y-1">
                    <p className="font-semibold text-2xl">
                      {inviteBuckets.unverifiableActionable.title}
                    </p>
                    <p className="text-zinc-500">
                      {inviteBuckets.unverifiableActionable.description}
                    </p>
                  </div>
                  <List>
                    {unverifiableActionable.map((invite) => (
                      <OnetimeInviteListItem
                        key={invite.id}
                        invite={invite}
                        showCommunityLabel={true}
                        communityLabel={invite.community?.name}
                        selfInvited={user.id === invite.invitingUser?.id}
                        copied={copiedInviteId === invite.id}
                        onDelete={handleDeleteInvite}
                        onCopy={copyToClipboard}
                        onCopied={handleCopied}
                      />
                    ))}
                  </List>
                </div>
              )}

              {waitingForResponse.length > 0 && (
                <div className="flex flex-col gap-y-4">
                  <div className="flex flex-col gap-y-1">
                    <p className="font-semibold text-2xl">
                      {inviteBuckets.waitingForResponse.title}
                    </p>
                    <p className="text-zinc-500">
                      {inviteBuckets.waitingForResponse.description}
                    </p>
                  </div>
                  <List>
                    {waitingForResponse.map((request) => (
                      <OnetimeInviteListItem
                        key={request.id}
                        invite={request}
                        showCommunityLabel={true}
                        communityLabel={request.community?.name}
                        selfInvited={user.id === request.invitingUser?.id}
                        onDelete={(inviteId) => handleDeleteRequest(inviteId)}
                      />
                    ))}
                  </List>
                </div>
              )}

              {settled.length > 0 && (
                <div className="flex flex-col gap-y-4">
                  <div className="flex flex-col gap-y-1">
                    <p className="font-semibold text-2xl">
                      {inviteBuckets.settled.title}
                    </p>
                    <p className="text-zinc-500">
                      {inviteBuckets.settled.description}
                    </p>
                  </div>
                  <List>
                    {settled.map((invite) => (
                      <OnetimeInviteListItem
                        key={invite.id}
                        invite={invite}
                        showCommunityLabel={true}
                        communityLabel={invite.community?.name}
                        selfInvited={user.id === invite.invitingUser?.id}
                        copied={copiedInviteId === invite.id}
                        onCopy={copyToClipboard}
                        onCopied={handleCopied}
                      />
                    ))}
                  </List>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </CenterLayout>
  );
};

export default InvitesPage;
