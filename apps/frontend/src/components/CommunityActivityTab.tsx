import useActivities, {
  ActivityList,
} from "@alliance/shared/lib/useActivities";
import UserActivityCard from "./UserActivityCard";

export interface CommunityActivityTabProps {
  communityId: number;
  userId?: number;
}

const CommunityActivityTab = ({ communityId }: CommunityActivityTabProps) => {
  const { activities, handleLikeActivity, loading } = useActivities({
    list: ActivityList.Community,
    objectId: communityId,
    comments: true,
  });

  return (
    <div className="mt-4 flex flex-col gap-y-2 *:p-4">
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
        />
      ))}
    </div>
  );
};

export default CommunityActivityTab;
