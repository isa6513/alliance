import { User } from "@alliance/shared/client";
import { getApiUrl } from "@alliance/shared/lib/config";
import Card, { CardStyle } from "@alliance/shared/ui/Card";
import { useNavigate } from "react-router";

const UserCard = ({ user }: { user: User }) => {
  const navigate = useNavigate();

  return (
    <Card
      style={CardStyle.White}
      onClick={() => navigate(`/database/?table=user&id=${user.id}`)}
    >
      {user.profilePicture && (
        <img
          src={`${getApiUrl()}/images/${user.profilePicture}`}
          alt={user.name}
          className="w-10 h-10 rounded-sm object-cover"
        />
      )}
      <p>{user.name}</p>
    </Card>
  );
};

export default UserCard;
