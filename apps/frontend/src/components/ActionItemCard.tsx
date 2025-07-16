import React, { useCallback } from "react";
import Card, { CardStyle } from "./system/Card";
import { useNavigate } from "react-router";
import { ActionDto, UserActionDto } from "@alliance/shared/client/types.gen";
import ActionCardUserCount from "./ActionCardUserCount";
import Button, { ButtonColor } from "./system/Button";
import checkMark from "../assets/noun-check-mark-2181.svg";

export interface ActionItemCardProps
  extends Pick<
    ActionDto,
    "name" | "shortDescription" | "category" | "id" | "status"
  > {
  className?: string;
  joinedCount?: number;
  completedCount?: number;
  showDescription?: boolean;
  userRelation?: UserActionDto["status"];
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
        className="block shadow"
        style={CardStyle.White}
        onClick={goToActionPage}
      >
        <div className="flex flex-row items-start gap-x-8">
          <div className="flex-1 flex flex-col">
            <p className="font-medium text-black">{name}</p>
            <p className="text-zinc-400">{shortDescription}</p>
          </div>
          <div>
            <div className="w-24 flex flex-col gap-y-2">
              {userRelation === "none" &&
                status === "gathering_commitments" && (
                  <Button
                    color={ButtonColor.Transparent}
                    onClick={goToActionPage}
                    className="w-full text-sm rounded-md text-white font-medium bg-cardbutton hover:brightness-90 font-regular"
                  >
                    Commit
                  </Button>
                )}
            </div>
          </div>
        </div>

        <div className="absolute bottom-5 right-6">
          <div className="flex flex-row justify-between items-start mr-0 gap-x-2">
            {userRelation === "joined" && (
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
