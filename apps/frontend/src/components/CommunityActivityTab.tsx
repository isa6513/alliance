import useActivities, {
  ActivityList,
} from "@alliance/shared/lib/useActivities";
import UserActivityCard from "./UserActivityCard";
import { useAuth } from "../lib/AuthContext";

export interface CommunityActivityTabProps {
  communityId: number;
  userId?: number;
}

const CommunityActivityTab = ({
  communityId,
  userId,
}: CommunityActivityTabProps) => {
  const { isAuthenticated, user } = useAuth();

  const { activities, handleLikeActivity, updateActivity, loading } =
    useActivities({
      list: ActivityList.Community,
      objectId: communityId,
      comments: true,
      isAuthenticated,
      user,
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
