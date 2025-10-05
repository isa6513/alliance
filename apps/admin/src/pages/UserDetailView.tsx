import {
  analyticsGetTimeSpentPerUser,
  analyticsGetTimeSpentPerUserTotal,
  notifsNotifsForUser,
  userActionRelations as userGetActionRelations,
  userAddUserToGroup,
  userGetGroups,
  userList,
  userRemoveUserFromGroup,
} from "@alliance/shared/client";
import {
  ActionEventNotifDto,
  GroupDto,
  TimeSpentForUserDto,
  UserActionRelationDetailDto,
  UserActionRelationsResponseDto,
  UserActionSummaryDto,
} from "@alliance/shared/client/types.gen";
import { getApiUrl } from "@alliance/shared/lib/config";
import Badge from "@alliance/shared/ui/Badge";
import Card, { CardStyle } from "@alliance/shared/ui/Card";
import ProfileImage from "@alliance/shared/ui/ProfileImage";
import DatabaseIcon from "@alliance/shared/ui/icons/DatabaseIcon";
import { Duration, formatDuration, intervalToDuration } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLoaderData } from "react-router";
import { Route } from "../../.react-router/types/src/pages/+types/UserDetailView";
import EmailNotif from "../components/EmailNotif";
import TextNotif from "../components/TextNotif";
import CreateActivityControls from "../components/CreateActivityControls";

export async function clientLoader({ params }: Route.LoaderArgs) {
  const userIdParam = params.userId;
  if (!userIdParam) {
    throw new Error("Not found");
  }
  const userId = Number.parseInt(userIdParam, 10);
  if (Number.isNaN(userId)) {
    throw new Error("Not found");
  }

  const [
    usersRes,
    groupsRes,
    actionRelationsRes,
    timeSpentRes,
    timeSpentTotalRes,
    notifRes,
  ] = await Promise.all([
    userList(),
    userGetGroups(),
    userGetActionRelations(),
    analyticsGetTimeSpentPerUser(),
    analyticsGetTimeSpentPerUserTotal(),
    notifsNotifsForUser({ path: { id: userId } }),
  ]);

  const user = (usersRes.data ?? []).find(
    (candidate) => candidate.id === userId
  );
  if (!user) {
    throw new Error("Not found");
  }

  const timeSpent = findTimeForUser(timeSpentRes.data ?? [], userId);
  const timeSpentTotal = findTimeForUser(timeSpentTotalRes.data ?? [], userId);

  const actionData: UserActionRelationsResponseDto | undefined =
    actionRelationsRes.data;
  const actionSummaries: UserActionSummaryDto[] = actionData?.actions ?? [];
  const actionRelations: UserActionRelationDetailDto[] =
    actionData?.users?.find((entry) => entry.userId === userId)?.relations ??
    [];

  return {
    user,
    allGroups: groupsRes.data ?? [],
    actionSummaries,
    actionRelations,
    timeSpent,
    timeSpentTotal,
    notifs: notifRes.data ?? [],
  };
}

const UserDetailView: React.FC = () => {
  const loaderData = useLoaderData<typeof clientLoader>();
  const {
    user,
    actionSummaries,
    actionRelations,
    timeSpent,
    timeSpentTotal,
    notifs,
  } = loaderData;

  const [actionRelationsState, setActionRelationsState] =
    useState<UserActionRelationDetailDto[]>(actionRelations);
  const [allGroups, setAllGroups] = useState<GroupDto[]>(loaderData.allGroups);
  const [pendingGroupOps, setPendingGroupOps] = useState<Set<string>>(
    () => new Set()
  );
  const [groupMutationError, setGroupMutationError] = useState<string | null>(
    null
  );

  useEffect(() => {
    setActionRelationsState(actionRelations);
  }, [actionRelations]);

  const sortedAllGroups = useMemo(() => {
    return [...allGroups].sort((a, b) => a.name.localeCompare(b.name));
  }, [allGroups]);

  const upsertActionRelation = useCallback(
    (newRelation: UserActionRelationDetailDto) => {
      setActionRelationsState((prev) => {
        const remaining = prev.filter(
          (relation) => relation.actionId !== newRelation.actionId
        );
        return [...remaining, newRelation];
      });
    },
    []
  );

  const userGroups = useMemo(() => {
    return allGroups.filter((group) =>
      group.users.some((profile) => profile.id === user.id)
    );
  }, [allGroups, user.id]);

  const userGroupIds = useMemo(() => {
    return new Set(userGroups.map((group) => group.id));
  }, [userGroups]);

  const relationByActionId = useMemo(() => {
    return actionRelationsState.reduce((acc, relation) => {
      acc[relation.actionId] = relation;
      return acc;
    }, {} as Record<number, UserActionRelationDetailDto>);
  }, [actionRelationsState]);

  const { emailNotifs, textNotifs, otherNotifs } = useMemo(() => {
    const email: ActionEventNotifDto[] = [];
    const text: ActionEventNotifDto[] = [];
    const other: ActionEventNotifDto[] = [];
    notifs.forEach((notif) => {
      if (notif.channel === "email") {
        email.push(notif);
      } else if (notif.channel === "text") {
        text.push(notif);
      } else {
        other.push(notif);
      }
    });
    const sortDesc = (arr: ActionEventNotifDto[]) =>
      [...arr].sort((a, b) => notifTimestamp(b) - notifTimestamp(a));
    return {
      emailNotifs: sortDesc(email),
      textNotifs: sortDesc(text),
      otherNotifs: sortDesc(other),
    };
  }, [notifs]);

  const formatTimeSpent = useMemo(() => formatTime(timeSpent), [timeSpent]);
  const formatTimeSpentTotal = useMemo(
    () => formatTime(timeSpentTotal),
    [timeSpentTotal]
  );

  const contractStatusColor = user.contractDateSuspended
    ? "text-red-500"
    : user.contractDateSigned
    ? "text-green"
    : "text-zinc-500";

  const contractStatus = user.contractDateSuspended
    ? "Suspended"
    : user.contractDateSigned
    ? "Signed"
    : "Not signed";

  const groupKey = useCallback(
    (groupId: number) => `${user.id}-${groupId}`,
    [user.id]
  );

  const updateGroupInState = useCallback((updatedGroup: GroupDto) => {
    setAllGroups((prev) => {
      const exists = prev.some((group) => group.id === updatedGroup.id);
      if (exists) {
        return prev.map((group) =>
          group.id === updatedGroup.id ? updatedGroup : group
        );
      }
      return [...prev, updatedGroup];
    });
  }, []);

  const handleGroupToggle = useCallback(
    async (groupId: number, nextChecked: boolean) => {
      const key = groupKey(groupId);
      setPendingGroupOps((prev) => {
        const next = new Set(prev);
        next.add(key);
        return next;
      });
      setGroupMutationError(null);
      try {
        if (nextChecked) {
          const res = await userAddUserToGroup({
            path: { groupId },
            body: { userId: user.id },
          });
          if (res.data) {
            updateGroupInState(res.data);
          }
        } else {
          const res = await userRemoveUserFromGroup({
            path: { groupId },
            body: { userId: user.id },
          });
          if (res.data) {
            updateGroupInState(res.data);
          }
        }
      } catch (error) {
        console.error("Failed to update group membership", error);
        setGroupMutationError("Failed to update group membership. Try again.");
      } finally {
        setPendingGroupOps((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }
    },
    [groupKey, updateGroupInState, user.id]
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <Card style={CardStyle.WhiteSolid} className="p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col sm:flex-row sm:gap-4">
            <ProfileImage
              pfp={
                user.profilePicture
                  ? `${getApiUrl()}/images/${user.profilePicture}`
                  : null
              }
              size="large"
            />
            <div className="mt-4 sm:mt-0">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-zinc-900">
                  {user.name}
                </h1>
                <Link
                  to={`/database/?table=user&id=${user.id}`}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  <DatabaseIcon size="mini" />
                </Link>
              </div>
              <div className="mt-2 space-y-1 text-sm text-zinc-600">
                <p>{user.email}</p>
                {user.phoneNumber && <p>{user.phoneNumber}</p>}
                <p>ID: {user.id}</p>
              </div>
            </div>
          </div>
          <div className="space-y-2 text-sm text-zinc-700">
            <p>
              <span className="font-medium text-zinc-900">
                Contract status:{" "}
              </span>
              <span className={`font-semibold ${contractStatusColor}`}>
                {contractStatus}
              </span>
            </p>
            {user.contractDateSigned && (
              <p>
                Signed on{" "}
                {new Date(user.contractDateSigned).toLocaleDateString()}
              </p>
            )}
            {user.contractDateSuspended && (
              <p>
                Suspended on{" "}
                {new Date(user.contractDateSuspended).toLocaleDateString()}
              </p>
            )}
            <div className="flex flex-wrap gap-2 text-xs text-zinc-500">
              <PreferenceBadge
                label="Email"
                enabled={user.emailNotifsEnabled}
              />
              <PreferenceBadge label="Text" enabled={user.textNotifsEnabled} />
              <PreferenceBadge label="Push" enabled={user.pushNotifsEnabled} />
              <PreferenceBadge
                label="All notifs off"
                enabled={user.turnedOffAllNotifs}
              />
            </div>
          </div>
        </div>
      </Card>

      <Card style={CardStyle.WhiteSolid} className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">Groups</h2>
          <span className="text-sm text-zinc-500">
            {userGroups.length} group{userGroups.length === 1 ? "" : "s"}
          </span>
        </div>
        {groupMutationError && (
          <p className="text-sm text-red-500">{groupMutationError}</p>
        )}
        {userGroups.length ? (
          <div className="flex flex-wrap gap-2">
            {userGroups.map((group) => (
              <Badge key={group.id}>{group.name}</Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">No group memberships yet.</p>
        )}
        <div className="border-t border-zinc-200 pt-4">
          <p className="text-sm font-medium text-zinc-700 mb-3">
            Update membership
          </p>
          <div className="grid gap-2 md:grid-cols-2">
            {sortedAllGroups.map((group) => {
              const checked = userGroupIds.has(group.id);
              const pending = pendingGroupOps.has(groupKey(group.id));
              return (
                <label
                  key={group.id}
                  className={`flex items-start gap-3 rounded border border-zinc-200 p-3 text-sm ${
                    pending ? "opacity-60" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={checked}
                    disabled={pending}
                    onChange={(event) =>
                      handleGroupToggle(group.id, event.target.checked)
                    }
                  />
                  <div>
                    <p className="font-medium text-zinc-800">{group.name}</p>
                    {group.description && (
                      <p className="text-xs text-zinc-500 mt-1">
                        {group.description}
                      </p>
                    )}
                  </div>
                </label>
              );
            })}
            {sortedAllGroups.length === 0 && (
              <p className="text-sm text-zinc-500">No groups available.</p>
            )}
          </div>
        </div>
      </Card>

      <Card style={CardStyle.WhiteSolid} className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">Actions</h2>
          <span className="text-sm text-zinc-500">
            {actionSummaries.length} tracked action
            {actionSummaries.length === 1 ? "" : "s"}
          </span>
        </div>
        {actionSummaries.length ? (
          <div className="grid gap-3">
            {actionSummaries.map((action) => {
              const relation = relationByActionId[action.id];
              const relationStatus = relation?.status ?? "none";
              const statusLabel = formatRelationStatus(relationStatus);
              return (
                <div
                  key={action.id}
                  className="rounded border border-zinc-200 bg-zinc-50 p-3"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <Link
                        to={`/actions/${action.id}`}
                        className="font-medium text-zinc-800 hover:text-blue-600"
                      >
                        {action.name}
                      </Link>
                      <p className="text-xs text-zinc-500">
                        Action status:{" "}
                        {humanize(action.status) ?? action.status}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-semibold ${relationStatusColor(
                        relationStatus
                      )}`}
                    >
                      {statusLabel}
                    </span>
                  </div>
                  {!relation && (
                    <CreateActivityControls
                      actionId={action.id}
                      userId={user.id}
                      onCreated={upsertActionRelation}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">
            No actions are currently tracked for this user.
          </p>
        )}
      </Card>

      <Card style={CardStyle.WhiteSolid} className="p-6 space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">Activity</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
          <ActivityStat label="Last 7 days" value={formatTimeSpent || "0"} />
          <ActivityStat label="Total" value={formatTimeSpentTotal || "0"} />
        </div>
      </Card>

      <Card style={CardStyle.WhiteSolid} className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">Notifications</h2>
          <span className="text-sm text-zinc-500">{notifs.length} total</span>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-zinc-700">Texts</h3>
            {textNotifs.length ? (
              textNotifs.map((notif) => (
                <TextNotif key={keyForNotif(notif)} notif={notif} />
              ))
            ) : (
              <p className="text-sm text-zinc-500">
                No texts have been sent to this user.
              </p>
            )}
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-zinc-700">Emails</h3>
            {emailNotifs.length ? (
              emailNotifs.map((notif) => (
                <EmailNotif key={keyForNotif(notif)} notif={notif} />
              ))
            ) : (
              <p className="text-sm text-zinc-500">
                No emails have been sent to this user.
              </p>
            )}
          </div>
        </div>
        {otherNotifs.length ? (
          <div className="rounded border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-600">
            {otherNotifs.length} push notification
            {otherNotifs.length === 1 ? "" : "s"} not shown here.
          </div>
        ) : null}
      </Card>
    </div>
  );
};

function findTimeForUser(times: TimeSpentForUserDto[], userId: number) {
  return times.find((entry) => entry.userId === userId)?.timeSpent ?? 0;
}

function humanize(value?: string) {
  if (!value) {
    return undefined;
  }
  return value
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function formatRelationStatus(status: UserActionRelationDetailDto["status"]) {
  switch (status) {
    case "completed":
      return "Completed";
    case "joined":
      return "Joined";
    case "declined":
      return "Declined";
    case "wont_complete":
      return "Won't complete";
    case "missed_deadline":
      return "Missed deadline";
    case "none":
      return "Not started";
    default:
      throw new Error(`Unknown relation status: ${status satisfies never}`);
  }
}

function relationStatusColor(status: UserActionRelationDetailDto["status"]) {
  switch (status) {
    case "completed":
      return "text-green";
    case "joined":
      return "text-blue-600";
    case "declined":
      return "text-amber-600";
    case "missed_deadline":
    case "wont_complete":
      return "text-red-600";
    case "none":
      return "text-zinc-500";
    default:
      throw new Error(`Unknown relation status: ${status satisfies never}`);
  }
}

function formatTime(time: number) {
  const interval = intervalToDuration({ start: 0, end: time * 1000 });
  const formatUnits: (keyof Duration)[] =
    interval.minutes || interval.hours || interval.days
      ? ["hours", "minutes"]
      : ["hours", "minutes", "seconds"];
  return formatDuration(interval, {
    format: formatUnits,
  })
    .replace(" hours", "h")
    .replace(" minutes", "m")
    .replace(" seconds", "s");
}

function notifTimestamp(notif: ActionEventNotifDto) {
  const source = notif.channel === "email" ? notif.mail : notif.mms;
  const createdAt = source?.createdAt;
  return createdAt ? new Date(createdAt).getTime() : 0;
}

function keyForNotif(notif: ActionEventNotifDto) {
  const mailId = notif.mail?.id;
  const mmsId = notif.mms?.id;
  return `${notif.user.id}-${notif.channel}-${
    mailId ?? mmsId ?? Math.random()
  }`;
}

interface PreferenceBadgeProps {
  label: string;
  enabled: boolean;
}

const PreferenceBadge = ({ label, enabled }: PreferenceBadgeProps) => {
  const tone = enabled
    ? "bg-green-100 text-green-700"
    : "bg-zinc-200 text-zinc-600";
  return (
    <span className={`rounded px-2 py-1 font-medium ${tone}`}>
      {label}: {enabled ? "Enabled" : "Disabled"}
    </span>
  );
};

interface ActivityStatProps {
  label: string;
  value: string;
}

const ActivityStat = ({ label, value }: ActivityStatProps) => {
  return (
    <div className="flex flex-col rounded border border-zinc-200 bg-zinc-50 px-4 py-3">
      <span className="text-xs uppercase text-zinc-500">{label}</span>
      <span className="text-lg font-semibold text-zinc-800">{value}</span>
    </div>
  );
};

export default UserDetailView;
