import Card, { CardStyle } from "./system/Card";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router";
import { ActionActivityDto } from "@alliance/shared/client";

export interface ActivityFeedItemProps {
  activity: ActionActivityDto;
  showTime?: boolean;
}

const ActivityFeedItem = ({
  activity,
  showTime = true,
}: ActivityFeedItemProps) => {
  const navigate = useNavigate();
  const verb = activity.type === "user_joined" ? "joined" : "completed";
  return (
    <div className="flex flex-row items-center gap-x-4 w-full">
      <Card
        style={CardStyle.White}
        className="flex-1 flex-row justify-between"
        onClick={() => {
          navigate(`/actions/${activity.actionId}`);
        }}
      >
        <p className="text-black">
          <a
            className="hover:underline font-medium"
            href={`/user/${activity.user.id}`}
          >{`${activity.user.displayName}`}</a>
          <span className="text-gray-600"> {verb}</span>
          <span className="font-medium"> {activity.actionName}</span>
        </p>
        {showTime && (
          <p className="text-gray-500 text-right text-nowrap">
            {formatDistanceToNow(new Date(activity.createdAt), {
              addSuffix: true,
            })}{" "}
          </p>
        )}
      </Card>
    </div>
  );
};

export default ActivityFeedItem;
