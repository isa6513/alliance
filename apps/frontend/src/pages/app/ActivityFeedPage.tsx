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
      color={mode === m ? ButtonColor.Black : ButtonColor.White}
      key={m}
      onClick={() => setMode(m)}
    >
      <p className="capitalize">{m}</p>
    </Button>
  ));

  return (
    <div className="max-w-4xl mx-auto pt-16 md:pt-12 px-3 pb-24 flex flex-row">
      <div className="space-y-2 w-full flex flex-col justify-stretch">
        <div className="mx-auto flex flex-row gap-x-2 mb-4">{modeButtons}</div>
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
  );
};

export default ActivityFeedPage;
