import { User } from "@alliance/shared/client";
import { getApiUrl } from "@alliance/shared/lib/config";
import Card, { CardStyle } from "@alliance/shared/ui/Card";
import ProfileImage from "@alliance/shared/ui/ProfileImage";
import { Duration, formatDuration, intervalToDuration } from "date-fns";
import { useNavigate } from "react-router";

const UserCard = ({
  user,
  timeSpent,
  timeSpentTotal,
}: {
  user: User;
  timeSpent: number;
  timeSpentTotal: number;
}) => {
  const navigate = useNavigate();

  const formatTime = (time: number) => {
    const interval = intervalToDuration({ start: 0, end: time });
    const formatUnits: (keyof Duration)[] =
      interval.minutes || interval.hours || interval.days
        ? ["hours", "minutes"]
        : ["hours", "minutes", "seconds"];
    return formatDuration(interval, {
      format: formatUnits,
    });
  };

  const time = formatTime(timeSpent);
  const timeTotal = formatTime(timeSpentTotal);

  return (
    <Card
      style={CardStyle.White}
      className="min-w-[300px]"
      onClick={() => navigate(`/database/?table=user&id=${user.id}`)}
    >
      <div className="flex flex-row items-center gap-x-3 border-b pb-2 mb-2 border-zinc-200">
        <ProfileImage
          pfp={
            user.profilePicture
              ? getApiUrl() + "/images/" + user.profilePicture
              : null
          }
          size="large"
        />
        <p>{user.name}</p>
      </div>
      <div>
        <p className="font-semibold text-sm">Activity</p>
        <div className="flex flex-row text-sm justify-between ">
          <p className="text-zinc-500">Last 7 days</p>
          <p>{time || "0"}</p>
        </div>
        <div className="flex flex-row text-sm justify-between ">
          <p className="text-zinc-500">Total</p>
          <p>{timeTotal || "0"}</p>
        </div>
      </div>
    </Card>
  );
};

export default UserCard;
