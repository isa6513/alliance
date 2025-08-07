import { User } from "@alliance/shared/client";
import Card from "../Card";
import { CardStyle } from "../Card";
import { useNavigate } from "react-router-dom";

const UserCard = ({ user }: { user: User }) => {
  const navigate = useNavigate();

  return (
    <Card
      style={CardStyle.White}
      onClick={() => navigate(`/database/?table=user&id=${user.id}`)}
    >
      {user.profilePicture && (
        <img
          src={user.profilePicture}
          alt={user.name}
          className="w-10 h-10 rounded-sm object-cover"
        />
      )}
      <p>{user.name}</p>
    </Card>
  );
};

export default UserCard;
