import { User } from "@alliance/shared/client";
import { getApiUrl } from "@alliance/shared/lib/config";
import Card, { CardStyle } from "@alliance/shared/ui/Card";
import ProfileImage from "@alliance/shared/ui/ProfileImage";
import { formatDuration, intervalToDuration } from "date-fns";
import { useNavigate } from "react-router";

const UserCard = ({ user, timeSpent }: { user: User; timeSpent: number }) => {
  const navigate = useNavigate();

  const time = timeSpent
    ? formatDuration(intervalToDuration({ start: 0, end: timeSpent }), {
        format: ["hours", "minutes", "seconds"],
      })
    : "0 seconds";

  return (
    <Card
      style={CardStyle.White}
      className="min-w-[400px]"
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
        <p>Active for {time} in the last 7 days</p>
      </div>
    </Card>
  );
};

export default UserCard;
