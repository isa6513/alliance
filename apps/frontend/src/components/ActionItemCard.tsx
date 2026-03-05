import React from "react";
import { Link, href } from "react-router";
import ActionCompletedBarWithInfo from "../pages/app/ActionCompletedBarWithInfo";
import CheckIcon from "@alliance/sharedweb/ui/icons/CheckIcon";
import {
  ActionItemCardPropsShared,
  showCompletedBar,
} from "@alliance/shared/lib/actionItemCard";
import { cn } from "@alliance/shared/styles/util";

export interface ActionItemCardProps extends ActionItemCardPropsShared {
  className?: string;
}

const ActionItemCard: React.FC<ActionItemCardProps> = ({
  action,
  className,
  friendCommitmentActivities,
}) => {
  return (
    <Link
      to={href("/actions/:id", { id: action.id.toString() })}
      className={cn("relative p-3 md:p-4 hover:bg-zinc-50", className)}
    >
      <div className="flex flex-row gap-x-3 md:gap-x-4">
        {/* <ActionSquareThumbnail
          imgSrc={action.squareThumbnailImage}
          imgAlt={action.squareThumbnailImageAlt}
          size="smallDynamic"
        /> */}
        <div className="flex flex-col justify-between flex-1">
          <div className="flex flex-row items-start gap-x-8">
            <div className="flex-1 flex flex-col">
              <div className="flex flex-row items-center justify-between gap-x-2">
                <p className="font-medium text-black">{action.name}</p>
                {action.userRelation === "completed" && (
                  <CheckIcon size="mini" />
                )}
              </div>
              <p className="text-zinc-500">{action.shortDescription}</p>
            </div>
          </div>
          {showCompletedBar(action) && (
            <ActionCompletedBarWithInfo
              action={action}
              friendActivities={friendCommitmentActivities ?? null}
              className="mt-4"
            />
          )}
        </div>
      </div>
    </Link>
  );
};

export default ActionItemCard;
