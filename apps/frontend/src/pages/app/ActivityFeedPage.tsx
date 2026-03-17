import Button, { ButtonColor } from "@alliance/sharedweb/ui/Button";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@alliance/shared/styles/util";
import UserActivityCard from "../../components/UserActivityCard";
import { useAuth } from "../../lib/AuthContext";
import useActivities, {
  ActivityList,
} from "@alliance/shared/lib/useActivities";
import CenterLayout from "@alliance/sharedweb/ui/CenterLayout";
import { Link, href } from "react-router";
import { ActionActivityDto } from "@alliance/shared/client";

type Mode = "friends" | "everyone";

const ActivityFeedPage = () => {
  const modes: Mode[] = ["friends", "everyone"];
  const [mode, setMode] = useState<Mode>("friends");

  const { user } = useAuth();
  const {
    activities,
    handleLikeActivity: handleGlobalLikeActivity,
    updateActivity: updateGlobalActivity,
    loading,
    setActivities: setGlobalActivities,
    fetchNextPage: fetchNextGlobal,
    hasNextPage: hasNextGlobal,
    isFetchingNextPage: isFetchingNextGlobal,
  } = useActivities({
    list: ActivityList.Global,
    comments: true,
    limit: 30,
  });

  const {
    activities: friendActivities,
    handleLikeActivity: handleLikeFriendActivity,
    updateActivity: updateFriendActivity,
    loading: loadingFriend,
    setActivities: setFriendActivities,
    fetchNextPage: fetchNextFriends,
    hasNextPage: hasNextFriends,
    isFetchingNextPage: isFetchingNextFriends,
  } = useActivities({
    list: ActivityList.Friends,
    comments: true,
    limit: 30,
  });

  const handleLikeActivity = useCallback(
    async (activityId: number, mode: Mode) => {
      if (mode === "friends") {
        const liked = await handleLikeFriendActivity(activityId);
        if (liked) {
          setGlobalActivities((prev) =>
            prev.map((a) => (a.id === activityId ? liked : a))
          );
        }
      } else {
        const liked = await handleGlobalLikeActivity(activityId);
        if (liked) {
          setFriendActivities((prev) =>
            prev.map((a) => (a.id === activityId ? liked : a))
          );
        }
      }
    },
    [
      handleLikeFriendActivity,
      handleGlobalLikeActivity,
      setGlobalActivities,
      setFriendActivities,
    ]
  );

  const updateActivity = useCallback(
    (activity: ActionActivityDto, mode: Mode) => {
      if (mode === "friends") {
        updateFriendActivity(activity);
      } else {
        updateGlobalActivity(activity);
      }
    },
    [updateFriendActivity, updateGlobalActivity]
  );

  const friendsRef = useRef<HTMLDivElement>(null);
  const everyoneRef = useRef<HTMLDivElement>(null);
  const friendsSentinelRef = useRef<HTMLDivElement>(null);
  const everyoneSentinelRef = useRef<HTMLDivElement>(null);

  const [activeHeight, setActiveHeight] = useState<number | undefined>(
    undefined
  );

  const updateHeight = useCallback(() => {
    const el = mode === "friends" ? friendsRef.current : everyoneRef.current;
    if (el) setActiveHeight(el.offsetHeight);
  }, [mode]);

  useEffect(() => {
    const roFriends = new ResizeObserver(updateHeight);
    const roEveryone = new ResizeObserver(updateHeight);
    if (friendsRef.current) roFriends.observe(friendsRef.current);
    if (everyoneRef.current) roEveryone.observe(everyoneRef.current);

    window.addEventListener("resize", updateHeight);
    requestAnimationFrame(updateHeight);

    return () => {
      roFriends.disconnect();
      roEveryone.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, [mode, updateHeight]);

  // Store volatile pagination state in refs so the observer effect stays stable
  const paginationRef = useRef({
    fetchNextFriends,
    fetchNextGlobal,
    hasNextFriends,
    hasNextGlobal,
    isFetchingNextFriends,
    isFetchingNextGlobal,
  });
  paginationRef.current = {
    fetchNextFriends,
    fetchNextGlobal,
    hasNextFriends,
    hasNextGlobal,
    isFetchingNextFriends,
    isFetchingNextGlobal,
  };

  // Infinite scroll observer — no volatile deps, created once
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const p = paginationRef.current;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          if (entry.target === friendsSentinelRef.current) {
            if (p.hasNextFriends && !p.isFetchingNextFriends) {
              p.fetchNextFriends();
            }
          } else if (entry.target === everyoneSentinelRef.current) {
            if (p.hasNextGlobal && !p.isFetchingNextGlobal) {
              p.fetchNextGlobal();
            }
          }
        }
      },
      { rootMargin: "200px" }
    );

    if (friendsSentinelRef.current)
      observer.observe(friendsSentinelRef.current);
    if (everyoneSentinelRef.current)
      observer.observe(everyoneSentinelRef.current);

    return () => observer.disconnect();
  }, []);

  const renderActivityColumn = (mode: Mode) => {
    const list = mode === "friends" ? friendActivities : activities;
    const isFetchingNext =
      mode === "friends" ? isFetchingNextFriends : isFetchingNextGlobal;
    const sentinelRef =
      mode === "friends" ? friendsSentinelRef : everyoneSentinelRef;

    return (
      <div className="w-1/2">
        <div
          ref={mode === "friends" ? friendsRef : everyoneRef}
          className="flex flex-col"
        >
          <div className="flex flex-col divide-y divide-zinc-200 *:p-4">
            {list.map((activity) => (
              <UserActivityCard
                activity={activity}
                key={activity.id}
                handleLike={() => handleLikeActivity(activity.id, mode)}
                onActivityUpdate={(updatedActivity) =>
                  updateActivity(updatedActivity, mode)
                }
                canEdit={activity.user.id === user?.id}
              />
            ))}
            {list.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-zinc-500 p-8">
                <p>
                  {(mode === "friends" ? loadingFriend : loading)
                    ? "Loading..."
                    : `No ${mode === "friends" ? "friend " : ""}activity yet`}
                </p>
              </div>
            )}
          </div>
          {isFetchingNext && (
            <div className="flex justify-center py-4 text-zinc-400">
              Loading more...
            </div>
          )}
          <div ref={sentinelRef} className="h-1" />
        </div>
      </div>
    );
  };

  return (
    <CenterLayout width="3xl">
      <div className="mx-auto flex flex-row gap-x-2 mb-4 w-full justify-between items-center">
        <div className=" flex flex-row gap-x-2 justify-start">
          {modes.map((m) => (
            <Button
              color={ButtonColor.Transparent}
              key={m}
              onClick={() => setMode(m)}
              aria-pressed={m === mode}
              className={cn(
                "!border-b-[2px] rounded-none",
                m === mode
                  ? "!border-b-green text-black"
                  : "!border-b-transparent hover:!border-b-zinc-200 text-zinc-500"
              )}
            >
              <p className="capitalize text-base">{m}</p>
            </Button>
          ))}
        </div>
        <Link
          to={href("/members")}
          className="text-zinc-800 hover:underline rounded font-medium"
        >
          Member list
        </Link>
      </div>

      <div
        className="relative overflow-hidden bg-white"
        style={{ height: activeHeight }}
      >
        <div
          className="flex w-[200%] transition-transform duration-200 ease-out motion-reduce:transition-none"
          style={{
            transform:
              mode === "friends" ? "translateX(0%)" : "translateX(-50%)",
          }}
        >
          {renderActivityColumn("friends")}
          {renderActivityColumn("everyone")}
        </div>
      </div>
    </CenterLayout>
  );
};

export default ActivityFeedPage;
