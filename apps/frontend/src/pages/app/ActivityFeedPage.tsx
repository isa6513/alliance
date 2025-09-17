import { ActionActivityDto } from "@alliance/shared/client";
import Button, { ButtonColor } from "@alliance/shared/ui/Button";
import { useCallback, useEffect, useRef, useState } from "react";
import UserActivityCard from "../../components/UserActivityCard";
import { useAuth } from "../../lib/AuthContext";
import useActivities, { ActivityList } from "./useActivities";

type Mode = "friends" | "everyone";

const ActivityFeedPage = () => {
  const modes: Mode[] = ["friends", "everyone"];
  const [mode, setMode] = useState<Mode>("friends");

  const { user } = useAuth();
  const { activities, handleLikeActivity, updateActivity } = useActivities({
    list: ActivityList.Global,
  });

  const [friendsActivities, setFriendsActivities] = useState<
    ActionActivityDto[]
  >([]);

  useEffect(() => {
    setFriendsActivities(
      activities.filter(
        (activity) =>
          activity.user.id === user?.id ||
          user?.friends.some((friend) => friend.id === activity.user.id)
      )
    );
  }, [activities, user]);

  const friendsRef = useRef<HTMLDivElement>(null);
  const everyoneRef = useRef<HTMLDivElement>(null);
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

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-var(--nav-height))]">
      <div className="w-full sm:w-xl md:w-3xl mx-auto pt-12 md:pt-8 px-3 pb-24 flex flex-row">
        <div className="space-y-2 w-full flex flex-col justify-stretch px-5">
          <div className="mx-auto flex flex-row gap-x-2 mb-4 w-full justify-start">
            {modes.map((m) => (
              <Button
                color={ButtonColor.Transparent}
                key={m}
                onClick={() => setMode(m)}
                aria-pressed={m === mode}
                className={`!border-b-[1.5px] rounded-none ${
                  m === mode ? "!border-b-green" : "!border-b-transparent"
                }`}
              >
                <p className="capitalize">{m}</p>
              </Button>
            ))}
          </div>
          <div
            className="relative overflow-hidden border border-zinc-200 rounded transition-[height] duration-100 ease-out bg-white"
            style={{
              height: activeHeight ?? "auto",
            }}
          >
            <div
              className="flex w-[200%] transition-transform duration-200 ease-out motion-reduce:transition-none"
              style={{
                transform:
                  mode === "friends" ? "translateX(0%)" : "translateX(-50%)",
              }}
            >
              <div className="w-1/2">
                <div
                  ref={friendsRef}
                  className="flex flex-col divide-y divide-zinc-200 *:p-4"
                >
                  {friendsActivities.map((activity) => (
                    <UserActivityCard
                      activity={activity}
                      key={activity.id}
                      handleLike={handleLikeActivity}
                      onActivityUpdate={updateActivity}
                      canEdit={activity.user.id === user?.id}
                    />
                  ))}
                  {friendsActivities.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-64 text-zinc-500 p-8">
                      <p>No activities from friends yet</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="w-1/2">
                <div
                  ref={everyoneRef}
                  className="flex flex-col divide-y divide-zinc-200 *:p-4"
                >
                  {activities.map((activity) => (
                    <UserActivityCard
                      activity={activity}
                      key={activity.id}
                      handleLike={handleLikeActivity}
                      onActivityUpdate={updateActivity}
                      canEdit={activity.user?.id === user?.id}
                    />
                  ))}
                  {activities.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-64 text-zinc-500 p-8">
                      <p>No activities found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityFeedPage;
