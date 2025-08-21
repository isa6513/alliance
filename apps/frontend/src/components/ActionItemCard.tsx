import React, { useCallback } from "react";
import Card, { CardStyle } from "./system/Card";
import { useNavigate } from "react-router";
import {
  ActionActivityDto,
  ActionDto,
  UserActionRelation,
} from "@alliance/shared/client/types.gen";
import ActionCardUserCount from "./ActionCardUserCount";
import ActivityLikesButtonRow from "./ActivityLikesButtonRow";
import Button, { ButtonColor } from "./system/Button";
import checkMark from "../assets/noun-check-mark-2181.svg";
import { formatTime } from "../lib/utils";

export interface ActionItemCardProps
  extends Pick<
    ActionDto,
    "name" | "shortDescription" | "category" | "id" | "status"
  > {
  className?: string;
  joinedCount?: number;
  completedCount?: number;
  showDescription?: boolean;
  userRelation?: UserActionRelation;
  activity?: ActionActivityDto;
}

const ActionItemCard: React.FC<ActionItemCardProps> = ({
  name,
  id,
  shortDescription,
  className,
  status,
  joinedCount,
  completedCount,
  userRelation,
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
          <div>
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
          </div>
        </div>
        {activity && (
          <div className="mt-4 flex flex-row border-t border-zinc-300 gap-y-2 -mx-4 -mb-4 p-4 bg-zinc-50 text-sm items-center justify-between">
            <p className="text-zinc-600 flex-shrink-0">
              {activity.type === "user_joined"
                ? `You committed ${formatTime(new Date(activity.createdAt), {
                    addSuffix: true,
                  })}`
                : `You completed ${formatTime(new Date(activity.createdAt), {
                    addSuffix: true,
                  })}`}
            </p>
            <div className="">
              {activity.likes.length > 0 && (
                <ActivityLikesButtonRow
                  isLiked={false}
                  likes={activity.likes}
                  handleLike={null}
                  labelText={true}
                />
              )}
            </div>
          </div>
        )}

        <div className="absolute bottom-5 right-5">
          <div className="flex flex-row justify-between items-start mr-0 gap-x-2">
            {userRelation === "joined" && !activity && (
              <img
                src={checkMark}
                alt="check mark"
                className="w-[13px] h-[13px] opacity-40 mt-[2px]"
                title="You've committed to this"
              />
            )}
            {joinedCount !== undefined && (
              <ActionCardUserCount
                joined={joinedCount}
                completed={completedCount}
              />
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ActionItemCard;
