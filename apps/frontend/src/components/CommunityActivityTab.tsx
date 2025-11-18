import useActivities, { ActivityList } from "../pages/app/useActivities";
import UserActivityCard from "./UserActivityCard";

export interface CommunityActivityTabProps {
  communityId: number;
  userId?: number;
}

const CommunityActivityTab = ({
  communityId,
  userId,
}: CommunityActivityTabProps) => {
  const { activities, handleLikeActivity, updateActivity, loading } =
    useActivities({
      list: ActivityList.Community,
      objectId: communityId,
      comments: true,
    });

  return (
    <div className="flex flex-col divide-y divide-zinc-200 *:p-4">
      {activities.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-zinc-500 p-8">
          <p>{loading ? "Loading..." : `No activities yet`}</p>
        </div>
      )}
      {activities.map((activity) => (
        <UserActivityCard
          activity={activity}
          key={activity.id}
          handleLike={handleLikeActivity}
          onActivityUpdate={updateActivity}
          canEdit={activity.user.id === userId}
        />
      ))}
    </div>
  );
};

export default CommunityActivityTab;
