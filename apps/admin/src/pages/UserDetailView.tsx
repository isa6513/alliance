import {
  analyticsGetTimeSpentPerUser,
  analyticsGetTimeSpentPerUserTotal,
  notifsNotifsForUser,
  actionsActionRelations as userGetActionRelations,
  userAddUserToTag,
  userGetTags,
  userList,
  userRemoveUserFromTag,
  userGetAwayRangeForUser,
} from "@alliance/shared/client";
import { getApiUrl } from "@alliance/shared/lib/config";
import {
  ActionEventNotifDto,
  TagDto,
  TimeSpentForUserDto,
  UserActionRelationDetailDto,
  UserActionRelationsResponseDto,
  UserActionSummaryDto,
  UserAwayRangeDto,
} from "@alliance/shared/client/types.gen";
import Badge from "@alliance/shared/ui/Badge";
import Card, { CardStyle } from "@alliance/shared/ui/Card";
import ProfileImage from "@alliance/shared/ui/ProfileImage";
import DatabaseIcon from "@alliance/shared/ui/icons/DatabaseIcon";
import { Duration, formatDuration, intervalToDuration } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLoaderData, useNavigate } from "react-router";
import { Route } from "../../.react-router/types/src/pages/+types/UserDetailView";
import EmailNotif from "../components/EmailNotif";
import TextNotif from "../components/TextNotif";
import CreateActivityControls from "../components/CreateActivityControls";
import Button, { ButtonColor } from "@alliance/shared/ui/Button";

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
    awayRangesRes,
    tagsRes,
    actionRelationsRes,
    timeSpentRes,
    timeSpentTotalRes,
    notifRes,
  ] = await Promise.all([
    userList(),
    userGetAwayRangeForUser({ path: { id: userId } }),
    userGetTags(),
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

  const awayRanges = awayRangesRes.data ?? [];
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
    allTags: tagsRes.data ?? [],
    actionSummaries,
    actionRelations,
    timeSpent,
    timeSpentTotal,
    awayRanges,
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
    awayRanges,
    notifs,
  } = loaderData;

  const [actionRelationsState, setActionRelationsState] =
    useState<UserActionRelationDetailDto[]>(actionRelations);
  const [allTags, setAllTags] = useState<TagDto[]>(loaderData.allTags);
  const [pendingTagOps, setPendingTagOps] = useState<Set<string>>(
    () => new Set()
  );
  const [tagMutationError, setTagMutationError] = useState<string | null>(null);

  useEffect(() => {
    setActionRelationsState(actionRelations);
  }, [actionRelations]);

  const sortedAllTags = useMemo(() => {
    return [...allTags].sort((a, b) => a.name.localeCompare(b.name));
  }, [allTags]);

  const navigate = useNavigate();

  const upsertActionRelation = useCallback(() => {
    navigate(window.location.pathname);
  }, [navigate]);

  const userTags = useMemo(() => {
    return allTags.filter((tag) =>
      tag.users.some((profile) => profile.id === user.id)
    );
  }, [allTags, user.id]);

  const userTagIds = useMemo(() => {
    return new Set(userTags.map((tag) => tag.id));
  }, [userTags]);

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

  const sortedAwayRanges = useMemo(() => {
    return [...awayRanges].sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
  }, [awayRanges]);

  const currentAwayRange = useMemo(() => {
    const now = new Date();
    return (
      sortedAwayRanges.find((range) => {
        const start = new Date(range.startDate);
        const end = new Date(range.endDate);
        return start <= now && now <= end;
      }) ?? null
    );
  }, [sortedAwayRanges]);

  const latestEvent = user.contractEvents?.length
    ? user.contractEvents.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0]
    : null;

  const contractStatusColor =
    latestEvent === null
      ? "text-zinc-500"
      : latestEvent.type === "signed"
      ? "text-green"
      : "text-red-500";

  const contractStatus =
    latestEvent === null
      ? "Not signed"
      : latestEvent.type === "signed"
      ? "Signed"
      : "Suspended";
  const tagKey = useCallback(
    (tagId: number) => `${user.id}-${tagId}`,
    [user.id]
  );

  const updateTagInState = useCallback((updatedTag: TagDto) => {
    setAllTags((prev) => {
      const exists = prev.some((tag) => tag.id === updatedTag.id);
      if (exists) {
        return prev.map((tag) => (tag.id === updatedTag.id ? updatedTag : tag));
      }
      return [...prev, updatedTag];
    });
  }, []);

  const handleTagToggle = useCallback(
    async (tagId: number, nextChecked: boolean) => {
      const key = tagKey(tagId);
      setPendingTagOps((prev) => {
        const next = new Set(prev);
        next.add(key);
        return next;
      });
      setTagMutationError(null);
      try {
        if (nextChecked) {
          const res = await userAddUserToTag({
            path: { tagId },
            body: { userId: user.id },
          });
          if (res.data) {
            updateTagInState(res.data);
          }
        } else {
          const res = await userRemoveUserFromTag({
            path: { tagId },
            body: { userId: user.id },
          });
          if (res.data) {
            updateTagInState(res.data);
          }
        }
      } catch (error) {
        console.error("Failed to update tag membership", error);
        setTagMutationError("Failed to update tag membership. Try again.");
      } finally {
        setPendingTagOps((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }
    },
    [tagKey, updateTagInState, user.id]
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <Card style={CardStyle.WhiteSolid} className="p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col sm:flex-row sm:gap-4">
            <ProfileImage pfp={user.profilePicture} size="large" />
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
                <Button
                  color={ButtonColor.Stone}
                  onClick={() => {
                    const apiUrl = getApiUrl();
                    window.open(
                      `${apiUrl}/auth/impersonate/${user.id}`,
                      "_blank"
                    );
                  }}
                  size="small"
                >
                  Log in as user
                </Button>
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
            {latestEvent?.type === "signed" && (
              <p>Signed on {new Date(latestEvent.date).toLocaleDateString()}</p>
            )}
            {latestEvent?.type === "suspended" && (
              <p>
                Suspended on {new Date(latestEvent.date).toLocaleDateString()}
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
          <h2 className="text-lg font-semibold text-zinc-900">Away periods</h2>
          {currentAwayRange && (
            <span
              className={`rounded px-2 py-1 text-xs font-semibold ${"bg-amber-100 text-amber-800"}`}
            >
              Away until {formatAwayDate(currentAwayRange.endDate)}
            </span>
          )}
        </div>
        {sortedAwayRanges.length ? (
          <div className="space-y-3">
            {sortedAwayRanges.map((range) => {
              const status = awayRangeStatus(range);
              return (
                <div
                  key={range.id}
                  className={`flex items-start justify-between gap-3 rounded border p-3 ${
                    status === "current"
                      ? "border-amber-200 bg-amber-50"
                      : status === "upcoming"
                      ? "border-blue-200 bg-blue-50"
                      : "border-zinc-200 bg-zinc-50"
                  }`}
                >
                  <div className="space-y-1">
                    <p className="font-medium text-zinc-800">
                      {formatAwayRange(range)}
                    </p>
                    <p className="text-sm text-zinc-600">
                      {formatAwayReason(range.reason)}
                      {range.note ? ` - ${range.note}` : ""}
                    </p>
                  </div>
                  <span
                    className={`rounded px-2 py-1 text-xs font-semibold ${awayStatusTone(
                      status
                    )}`}
                  >
                    {status === "current"
                      ? "Current"
                      : status === "upcoming"
                      ? "Upcoming"
                      : "Past"}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">
            No away periods have been recorded for this user.
          </p>
        )}
      </Card>

      <Card style={CardStyle.WhiteSolid} className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">Groups</h2>
          <span className="text-sm text-zinc-500">
            {userTags.length} tag{userTags.length === 1 ? "" : "s"}
          </span>
        </div>
        {tagMutationError && (
          <p className="text-sm text-red-500">{tagMutationError}</p>
        )}
        {userTags.length ? (
          <div className="flex flex-wrap gap-2">
            {userTags.map((tag) => (
              <Badge key={tag.id}>{tag.name}</Badge>
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
            {sortedAllTags.map((tag) => {
              const checked = userTagIds.has(tag.id);
              const pending = pendingTagOps.has(tagKey(tag.id));
              return (
                <label
                  key={tag.id}
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
                      handleTagToggle(tag.id, event.target.checked)
                    }
                  />
                  <div>
                    <p className="font-medium text-zinc-800">{tag.name}</p>
                    {tag.description && (
                      <p className="text-xs text-zinc-500 mt-1">
                        {tag.description}
                      </p>
                    )}
                  </div>
                </label>
              );
            })}
            {sortedAllTags.length === 0 && (
              <p className="text-sm text-zinc-500">No tags available.</p>
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
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`text-sm font-semibold ${relationStatusColor(
                          relationStatus
                        )}`}
                      >
                        {statusLabel}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {relation?.latestActivityAt &&
                          new Date(
                            relation.latestActivityAt
                          ).toLocaleDateString()}
                      </span>
                    </div>
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

type AwayRangeStatus = "current" | "upcoming" | "past";

function formatAwayDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatAwayRange(range: UserAwayRangeDto) {
  return `${formatAwayDate(range.startDate)} to ${formatAwayDate(
    range.endDate
  )}`;
}

function formatAwayReason(reason: UserAwayRangeDto["reason"]) {
  return humanize(reason) ?? reason;
}

function awayRangeStatus(range: UserAwayRangeDto): AwayRangeStatus {
  const now = new Date();
  const start = new Date(range.startDate);
  const end = new Date(range.endDate);
  if (start <= now && now <= end) {
    return "current";
  }
  if (start > now) {
    return "upcoming";
  }
  return "past";
}

function awayStatusTone(status: AwayRangeStatus) {
  switch (status) {
    case "current":
      return "bg-amber-200 text-amber-900";
    case "upcoming":
      return "bg-blue-100 text-blue-800";
    case "past":
      return "bg-zinc-200 text-zinc-700";
    default:
      throw new Error(`Unknown away range status: ${status satisfies never}`);
  }
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
