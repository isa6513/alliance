import {
  ActionActivityDto,
  ActionDto,
  UserActionRelation,
} from "@alliance/shared/client/types.gen";
import React, { useCallback } from "react";
import { useNavigate } from "react-router";
import CompletedBar from "./CompletedBar";
import Card, { CardStyle } from "./system/Card";
import UserProfilePicRow from "./UserProfilePicRow";

export interface ActionItemCardProps
  extends Pick<
    ActionDto,
    "name" | "shortDescription" | "category" | "id" | "status"
  > {
  className?: string;
  joinedCount?: number;
  neededCount?: number;
  friendCommitmentActivities?: ActionActivityDto[];
  showDescription?: boolean;
  userRelation?: UserActionRelation;
  activity?: ActionActivityDto;
}

const ActionItemCard: React.FC<ActionItemCardProps> = ({
  name,
  id,
  shortDescription,
  className,
  joinedCount,
  neededCount,
  friendCommitmentActivities = [],
  activity,
}) => {
  const navigate = useNavigate();

  const goToActionPage = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      navigate(`/actions/${id}`);
    },
    [navigate, id]
  );

  // const [toggleComments, setToggleComments] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <Card
        className="block overflow-hidden"
        style={CardStyle.White}
        onClick={goToActionPage}
      >
        <div className="flex flex-row items-start gap-x-8">
          <div className="flex-1 flex flex-col">
            <p className="font-medium text-black">{name}</p>
            <p className="text-zinc-500">{shortDescription}</p>
          </div>
          {/* <div>
            <div className="w-24 flex flex-col gap-y-2">
              {userRelation === "none" &&
                status === "gathering_commitments" && (
                  <Button
                    color={ButtonColor.Green}
                    onClick={goToActionPage}
                    className="w-full"
                  >
                    Commit
                  </Button>
                )}
            </div>
          </div> */}
        </div>
        {activity && joinedCount && neededCount && (
          <div className="mt-6">
            <div className="flex flex-row items-center justify-between w-full gap-x-2">
              <p className="text-zinc-500 text-base mb-0.5">
                {joinedCount} / {neededCount} committed
                {friendCommitmentActivities.length > 0 && (
                  <>
                    , including {friendCommitmentActivities.length} friend
                    {friendCommitmentActivities.length === 1 ? "" : "s"}
                  </>
                )}
              </p>
              <UserProfilePicRow
                users={friendCommitmentActivities.map(
                  (activity) => activity.user
                )}
              />
            </div>
            <CompletedBar percentage={(joinedCount / neededCount) * 100} />
          </div>
        )}
      </Card>

      {/* {activity && (
        <div className="flex flex-col border-x border-b rounded-b-md border-zinc-300 bg-zinc-50 p-4">
          <div className="flex flex-row gap-y-2 bg-zinc-50 text-sm items-center gap-x-4">
            <p className="text-zinc-600 flex-1">
              {activity.type === "user_joined"
                ? `You committed ${formatTime(new Date(activity.createdAt), {
                    addSuffix: true,
                  })}`
                : `You completed ${formatTime(new Date(activity.createdAt), {
                    addSuffix: true,
                  })}`}
            </p>
            <p className="text-zinc-600">{activity.likes.length} likes</p>
            <p
              className="text-zinc-600 cursor-pointer"
              onClick={() => setToggleComments(!toggleComments)}
            >
              Reply
            </p>
          </div>
          {toggleComments && (
            <div className="mt-2">
              <Comments objectId={activity.id} type={"activity"} homeStyle />
            </div>
          )}
        </div>
      )} */}
    </div>
  );
};

export default ActionItemCard;
