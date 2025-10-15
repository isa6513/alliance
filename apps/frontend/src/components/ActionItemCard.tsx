import { ActionActivityDto } from "@alliance/shared/client/types.gen";
import React from "react";
import { Link } from "react-router";
import { ActionWithRelation } from "../applayout";
import Tag, { TagStyle } from "./Tag";
import ActionCompletedBarWithInfo from "../pages/app/ActionCompletedBarWithInfo";

export interface ActionItemCardProps
  extends Pick<
    ActionWithRelation,
    | "name"
    | "shortDescription"
    | "category"
    | "id"
    | "status"
    | "relation"
    | "commitmentThreshold"
  > {
  className?: string;
  joinedCount?: number;
  completedCount?: number;
  friendCommitmentActivities?: ActionActivityDto[];
  showDescription?: boolean;
  activity?: ActionActivityDto;
}

const ActionItemCard: React.FC<ActionItemCardProps> = ({
  name,
  id,
  shortDescription,
  className,
  joinedCount,
  commitmentThreshold,
  status,
  completedCount,
  relation,
}) => {
  return (
    <Link
      to={`/actions/${id}`}
      className={`relative ${className} p-4 hover:bg-zinc-50 transition-colors duration-150`}
    >
      <div className="flex flex-row items-start gap-x-8">
        <div className="flex-1 flex flex-col">
          <div className="flex flex-row items-center justify-between gap-x-2 mb-2">
            <p className="font-medium text-black">{name}</p>
            {relation === "completed" && (
              <Tag style={TagStyle.Green} className="text-green font-medium">
                Completed
              </Tag>
            )}
          </div>
          <p className="text-zinc-500">{shortDescription}</p>
        </div>
      </div>
      {joinedCount !== undefined && completedCount !== undefined && (
        <ActionCompletedBarWithInfo
          threshold={
            status === "member_action" ? joinedCount : commitmentThreshold ?? 30
          }
          friendActivities={null}
          status={status}
          value={status === "member_action" ? completedCount : joinedCount}
        />
      )}
    </Link>
  );
};

export default ActionItemCard;
