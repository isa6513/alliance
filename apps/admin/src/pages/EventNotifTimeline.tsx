import {
  actionsGetNotificationSchedule,
  NotificationScheduleEntryDto,
} from "@alliance/shared/client";
import Card from "@alliance/shared/ui/Card";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const TYPE_LABELS: Record<string, string> = {
  announcement: "Announcement",
  "3dayreminder": "3 Day Reminder",
  "1dayreminder": "1 Day Reminder",
  misseddeadline: "Missed Deadline",
  missedseconddeadline: "Second Missed Deadline",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  upcoming: "Upcoming",
  gathering_commitments: "Gathering Commitments",
  office_action: "Office Action",
  member_action: "Member Action",
  resolution: "Resolution",
  completed: "Completed",
  failed: "Failed",
  abandoned: "Abandoned",
};

const dateHeadingFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  weekday: "short",
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

const relativeFormatter = new Intl.RelativeTimeFormat("en", {
  numeric: "auto",
});

const formatRelative = (target: Date) => {
  const now = Date.now();
  const diffMs = target.getTime() - now;
  const diffMinutes = Math.round(diffMs / (60 * 1000));
  if (Math.abs(diffMinutes) < 60) {
    return relativeFormatter.format(diffMinutes, "minute");
  }
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 48) {
    return relativeFormatter.format(diffHours, "hour");
  }
  const diffDays = Math.round(diffHours / 24);
  return relativeFormatter.format(diffDays, "day");
};

const EventNotifTimeline: React.FC = () => {
  const [entries, setEntries] = useState<NotificationScheduleEntryDto[]>([]);
  const [rangeDays, setRangeDays] = useState<number>(30);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<number>(0);

  const loadSchedule = useCallback(async (days: number) => {
    setLoading(true);
    setError(null);
    const start = new Date();
    const end = new Date(start.getTime() + days * MS_PER_DAY);

    const response = await actionsGetNotificationSchedule({
      query: {
        windowStart: start.toISOString(),
        windowEnd: end.toISOString(),
      },
    });
    if (!response.data) {
      setError(`Request failed with error: ${response.error}`);
      setLoading(false);
      return;
    }

    setEntries(response.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadSchedule(rangeDays);
  }, [rangeDays, refreshToken, loadSchedule]);

  const sortedEntries = useMemo(() => {
    return [...entries].sort(
      (a, b) =>
        new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()
    );
  }, [entries]);

  const handleRefresh = useCallback(() => {
    setRefreshToken((token) => token + 1);
  }, []);

  return (
    <div className="p-6">
      <div className="flex flex-col gap-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-lg font-semibold">Action Messaging Schedule</h1>
          <div className="flex gap-2 items-center">
            <label className="text-sm text-gray-600">Show next</label>
            <select
              className="border border-gray-300 rounded-md px-2 py-1 text-sm"
              value={rangeDays}
              onChange={(event) => setRangeDays(Number(event.target.value))}
            >
              <option value={1}>24 hours</option>
              <option value={3}>3 days</option>
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
            </select>
            <button
              type="button"
              className="border border-gray-300 rounded-md px-3 py-1 text-sm hover:bg-gray-100"
              onClick={handleRefresh}
            >
              Refresh
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-600 max-w-3xl">
          Upcoming notifications across announcements, reminders, and deadline
          follow-ups. Recipient counts are estimates based on current member
          status and may change if users act before the scheduled time.
        </p>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-gray-500">Loading schedule…</p>
      ) : error ? (
        <p className="mt-6 text-sm text-red-600">{error}</p>
      ) : entries.length === 0 ? (
        <p className="mt-6 text-sm text-gray-500">
          No notifications scheduled in this window.
        </p>
      ) : (
        <div className="mt-6 relative">
          <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-200" />
          <div className="space-y-4">
            {sortedEntries.map((entry, index) => {
              const entryDate = new Date(entry.scheduledFor);
              const previousEntry = sortedEntries[index - 1];
              const prevDate = previousEntry
                ? new Date(previousEntry.scheduledFor)
                : null;
              const showDateHeading =
                !prevDate ||
                prevDate.toDateString() !== entryDate.toDateString();

              const typeLabel = TYPE_LABELS[entry.type] ?? entry.type;
              const statusLabel =
                STATUS_LABELS[entry.actionStatus] ?? entry.actionStatus;

              return (
                <div
                  key={`${entry.type}-${
                    entry.eventId
                  }-${entryDate.toISOString()}`}
                  className="relative pl-16"
                >
                  {showDateHeading && (
                    <div className="mb-2 pl-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <span className="absolute left-[12.5px] top-[3px] h-4 w-4 rounded-full border-2 border-white bg-zinc-400"></span>
                      {dateHeadingFormatter.format(entryDate)}
                    </div>
                  )}
                  <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                    <div className="grid gap-3 bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 sm:grid-cols-2 lg:grid-cols-[minmax(0,0.55fr)_minmax(0,0.9fr)_minmax(0,1.4fr)_minmax(0,0.8fr)]">
                      <div>Time</div>
                      <div>Type</div>
                      <div>Action</div>
                      <div className="hidden lg:block">
                        Estimated Recipients
                      </div>
                    </div>
                    <div className="grid gap-4 px-4 py-3 text-sm sm:grid-cols-2 lg:grid-cols-[minmax(0,0.55fr)_minmax(0,0.9fr)_minmax(0,1.4fr)_minmax(0,0.8fr)] lg:items-center">
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 lg:hidden">
                          Time
                        </span>
                        <div className="text-gray-900">
                          {timeFormatter.format(entryDate)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatRelative(entryDate)}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 lg:hidden">
                          Type
                        </span>
                        <div className="text-gray-900">{typeLabel}</div>
                        <div className="text-xs text-gray-500">
                          Status: {statusLabel}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 lg:hidden">
                          Action
                        </span>
                        <Link
                          to={`/actions/${entry.actionId}`}
                          className="text-blue-600 hover:underline"
                        >
                          {entry.actionName}
                        </Link>
                        {!!entry.metadata?.nextEventId && (
                          <p className="mt-1 text-xs text-gray-500">
                            Next event #{entry.metadata.nextEventId}
                          </p>
                        )}
                        {!!entry.metadata?.deadlineEventId && (
                          <p className="mt-1 text-xs text-gray-500">
                            Deadline event #{entry.metadata.deadlineEventId}
                          </p>
                        )}
                      </div>
                      <div className="lg:block group">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 lg:hidden">
                          Recipients
                        </span>
                        <div className="text-gray-900">
                          {entry.recipients.length.toLocaleString()}
                        </div>
                        <Card className="text-xs text-gray-500 group-hover:block hidden absolute z-10">
                          {entry.recipients.map((recipient) => (
                            <div
                              key={recipient.id}
                              className="text-zinc-800 text-sm"
                            >
                              {recipient.displayName}
                            </div>
                          ))}
                        </Card>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventNotifTimeline;
