import { CardStyle } from "./system/Card";
import Card from "./system/Card";
import Badge from "./system/Badge";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router";
import { useCallback } from "react";
import { ActionActivityDto, UserActionDto } from "@alliance/shared/client";
import Comments from "./Comments";
import ActivityLikeButton from "./ActivityLikeButton";
import { useAuth } from "../lib/AuthContext";

interface UserActivityCardProps {
  activity: ActionActivityDto;
  relation: UserActionDto | undefined;
  handleLike: (activityId: number) => void;
}

const UserActivityCard = ({
  activity,
  relation,
  handleLike,
}: UserActivityCardProps) => {
  const navigate = useNavigate();

  const handleClick = useCallback(() => {
    navigate(`/actions/${activity.actionId}/activity/${activity.id}`);
  }, [activity.actionId, activity.id, navigate]);

  const timeSinceCompleted =
    relation && relation.dateCompleted
      ? formatDistanceToNow(new Date(relation.dateCompleted), {
          addSuffix: true,
        })
      : "";

  const { user } = useAuth();

  return (
    <div className="flex flex-row justify-stretch items-center space-x-4">
      <Card
        className="block bg-page text-[11pt]  flex-1 border-b"
        style={CardStyle.White}
      >
        <div className="flex flex-row justify-between">
          <div className="flex items-center justify-start w-[100%] space-x-3">
            <Badge className="!bg-green text-white" size="lg">
              Completed {relation?.dateCompleted ? timeSinceCompleted : ""}
            </Badge>
            <p
              className="font-medium cursor-pointer hover:underline"
              onClick={handleClick}
            >
              {activity.action.name}
            </p>
          </div>
          <ActivityLikeButton
            liked={activity.likes.some((like) => like.id === user?.id)}
            likes={activity.likes.length}
            handleLike={() => handleLike(activity.id)}
            className="mr-2"
          />
        </div>
        <div className="flex items-center justify-between ">
          <p>{activity.description}</p>
        </div>
        <Comments objectId={activity.id} type="activity" compact />
      </Card>
    </div>
  );
};

export default UserActivityCard;
