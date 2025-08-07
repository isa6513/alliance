import { CardStyle } from "./system/Card";
import Card from "./system/Card";
import Badge from "./system/Badge";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router";
import { useCallback } from "react";
import { ActionDto, UserActionDto } from "@alliance/shared/client";

interface UserActivityCardProps {
  action: ActionDto;
  relation: UserActionDto | undefined;
}

const UserActivityCard = ({ action, relation }: UserActivityCardProps) => {
  const navigate = useNavigate();

  const handleClick = useCallback(() => {
    navigate(`/actions/${action.id}`);
  }, [action.id, navigate]);

  const timeSinceCompleted = relation
    ? formatDistanceToNow(new Date(relation.dateCompleted), {
        addSuffix: true,
      })
    : "";

  console.log(relation);

  return (
    <div className="flex flex-row justify-stretch items-center space-x-4">
      <Card
        className="block bg-page text-[11pt]  flex-1 border-b"
        style={CardStyle.White}
        onClick={handleClick}
      >
        <div className="flex items-center justify-start w-[100%] space-x-3">
          <Badge className="!bg-[#5d9c2d] text-white">
            Completed {relation?.dateCompleted ? timeSinceCompleted : ""}
          </Badge>
          <p className="font-medium">{action.name}</p>
        </div>
        <div className="flex items-center justify-between ">
          <p>{action.shortDescription}</p>
        </div>
      </Card>
    </div>
  );
};

export default UserActivityCard;
