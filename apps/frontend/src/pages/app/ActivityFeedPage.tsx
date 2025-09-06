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
      color={mode === m ? ButtonColor.Green : ButtonColor.White}
      key={m}
      onClick={() => setMode(m)}
    >
      {m}
    </Button>
  ));

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-row">
      <div className="w-30 *:w-20 gap-y-2 flex-col px-3 hidden md:flex">
        {modeButtons}
      </div>
      <div className="space-y-2 w-full flex flex-col justify-stretch">
        <div className="flex flex-row md:hidden gap-x-2 mb-4">
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
  );
};

export default ActivityFeedPage;
