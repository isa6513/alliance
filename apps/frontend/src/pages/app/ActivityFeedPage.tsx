import Button, { ButtonColor } from "@alliance/shared/ui/Button";
import { useState } from "react";
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

  console.log(activities);

  const friendsActivities = user
    ? activities.filter(
        (activity) =>
          activity.user.id === user?.id ||
          user.friends.some((friend) => friend.id === activity.user.id)
      )
    : [];

  const activitiesToShow = mode === "friends" ? friendsActivities : activities;

  const modeButtons = modes.map((m) => (
    <Button
      color={ButtonColor.Transparent}
      key={m}
      onClick={() => setMode(m)}
      className={`!border-b-[1.5px] rounded-none ${
        m === mode ? "!border-b-green" : "!border-b-transparent"
      }`}
    >
      <p className="capitalize">{m}</p>
    </Button>
  ));

  return (
    <div className="flex flex-col bg-white items-center min-h-[calc(100vh-var(--nav-height))]">
      <div className="w-full sm:w-xl md:w-3xl mx-auto pt-12 md:pt-8 px-3 pb-24 flex flex-row">
        <div className="space-y-2 w-full flex flex-col justify-stretch">
          <div className="mx-auto flex flex-row gap-x-2 mb-4 w-full justify-start">
            {modeButtons}
          </div>
          {activitiesToShow.length === 0 && (
            <div className="flex flex-col items-center justify-center h-screen text-zinc-500">
              <p className="pb-20">No activities found</p>
            </div>
          )}
          {activitiesToShow.map((activity) => (
            <UserActivityCard
              activity={activity}
              key={activity.id}
              handleLike={handleLikeActivity}
              onActivityUpdate={updateActivity}
              canEdit={activity.user.id === user?.id}
            />
          ))}
        </div>
        <div className="w-30 hidden md:flex"></div>
      </div>
    </div>
  );
};

export default ActivityFeedPage;
