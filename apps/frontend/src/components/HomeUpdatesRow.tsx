import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { actionsRecentUpdates } from "@alliance/shared/client";
import type { ActionsRecentUpdatesResponse } from "@alliance/shared/client";
import { formatTime } from "@alliance/shared/lib/utils";
import { cn } from "@alliance/shared/styles/util";

import { href, useNavigate } from "react-router";
import { useNotifications } from "@alliance/shared/lib/useNotifications";

import SeeAll from "./SeeAll";

const UPDATES_LIMIT = 3;

const HomeUpdatesRow = () => {
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery<ActionsRecentUpdatesResponse>({
    queryKey: ["recent-action-updates", UPDATES_LIMIT],
    queryFn: async () => {
      const res = await actionsRecentUpdates({
        query: { limit: UPDATES_LIMIT },
      });
      if (res.data) {
        return res.data;
      }
      throw res.error;
    },
  });

  const { notifications, handleNotifClick } = useNotifications();

  const actionUpdateNotifications = useMemo(
    () =>
      notifications.filter(
        (notification) => notification.contentType === "action_update",
      ),
    [notifications],
  );

  const unreadActionUpdateIds = useMemo(
    () =>
      new Set(
        actionUpdateNotifications
          .filter(
            (notification) =>
              !notification.readAt && notification.contentId !== undefined,
          )
          .map((notification) => notification.contentId as number),
      ),
    [actionUpdateNotifications],
  );

  const actionUpdateNotificationsByContentId = useMemo(() => {
    const map = new Map<number, (typeof actionUpdateNotifications)[number]>();

    for (const notification of actionUpdateNotifications) {
      if (notification.contentId !== undefined) {
        map.set(notification.contentId as number, notification);
      }
    }

    return map;
  }, [actionUpdateNotifications]);

  const updates = useMemo(() => {
    if (Array.isArray(data)) {
      return data;
    }
    // Fallback in case the client wraps the array in a `data` property
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const maybeWrapped = (data as any)?.data;
    if (Array.isArray(maybeWrapped)) {
      return maybeWrapped;
    }
    return [];
  }, [data]);

  return (
    <div>
      {isLoading && (
        <p className="text-xs text-zinc-400 col-span-full">Loading updates…</p>
      )}
      {isError && !isLoading && (
        <p className="text-xs text-red-400 col-span-full">
          Could not load updates.
        </p>
      )}
      {!isLoading && !isError && updates.length === 0 && (
        <p className="text-xs text-zinc-400 col-span-full">
          No recent updates yet.
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
        {!isLoading &&
          !isError &&
          updates.map((update) => {
            const isUnread = unreadActionUpdateIds.has(update.id);

            const handleClick = (e: React.MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();

              // If it's a notification, handle the notification click, otherwise navigate to the action update
              const correspondingNotification =
                actionUpdateNotificationsByContentId.get(update.id);

              if (correspondingNotification) {
                handleNotifClick(correspondingNotification)();
              } else {
                navigate(
                  href("/actions/:id", { id: update.actionId.toString() }),
                );
              }
            };

            return (
              <div
                key={update.id}
                className="hover:cursor-pointer"
                onClick={handleClick}
              >
                <div
                  className={cn(
                    "rounded px-4 py-3 h-full ",
                    isUnread
                      ? "border border-green bg-green/5 hover:bg-green/10"
                      : "bg-white hover:bg-green/5",
                  )}
                >
                  <p className="text-sm md:text-base font-medium text-green mb-0.5 truncate">
                    {update.actionName}
                  </p>
                  {update.title && (
                    <p className="text-sm md:text-base leading-snug text-zinc-800">
                      {update.title}
                    </p>
                  )}
                  <p className="text-sm md:text-base text-zinc-400 mt-1">
                    {formatTime(new Date(update.date), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default HomeUpdatesRow;
