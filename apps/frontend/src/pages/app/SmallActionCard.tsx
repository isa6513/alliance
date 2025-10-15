import { ActionActivityDto } from "@alliance/shared/client/types.gen";
import Card, { CardStyle } from "@alliance/shared/ui/Card";
import React, { useCallback } from "react";
import { useNavigate } from "react-router";
import { ActionWithRelation } from "../../applayout";
import Tag, { TagStyle } from "../../components/Tag";
import ActionCompletedBarWithInfo from "./ActionCompletedBarWithInfo";

export interface SmallActionCardProps
  extends Pick<
    ActionWithRelation,
    | "name"
    | "shortDescription"
    | "commitmentless"
    | "category"
    | "id"
    | "status"
    | "everyoneShouldComplete"
    | "relation"
  > {
  className?: string;
  joinedCount?: number;
  neededCount?: number;
  friendActivities?: ActionActivityDto[];
  showDescription?: boolean;
}

const SmallActionCard: React.FC<SmallActionCardProps> = ({
  name,
  id,
  shortDescription,
  className,
  status,
  commitmentless,
  everyoneShouldComplete,
  joinedCount,
  neededCount,
  friendActivities = [],
  relation,
}) => {
  const navigate = useNavigate();

  const goToActionPage = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      navigate(`/actions/${id}`);
    },
    [navigate, id]
  );

  const waitingOnCompletion =
    status === "member_action" && (relation === "joined" || commitmentless);

  const waitingOnCommitment =
    status === "gathering_commitments" && relation === "none";

  const waitingForOffice = status === "office_action" && relation === "joined";

  const waitingOnOthers =
    status === "gathering_commitments" && relation === "joined";

  return (
    <div className={`relative ${className}`}>
      <Card
        className="block overflow-hidden rounded-none"
        style={CardStyle.White}
        onClick={goToActionPage}
      >
        <div className="flex flex-row items-start gap-x-8">
          <div className="flex-1 flex flex-col">
            <div className="self-start *:mb-2">
              {waitingOnCompletion && (
                <Tag style={TagStyle.GreyOutline}>Needs your completion</Tag>
              )}
              {waitingOnCommitment && (
                <Tag style={TagStyle.GreyOutline}>Gathering commitments</Tag>
              )}
              {waitingForOffice && (
                <Tag style={TagStyle.GreyOutline}>Pending office action</Tag>
              )}
              {waitingOnOthers && (
                <Tag style={TagStyle.GreyOutline}>
                  Waiting for commitments from others
                </Tag>
              )}
            </div>

            <p className="font-medium text-black">{name}</p>
            <p className="text-zinc-500">{shortDescription}</p>
          </div>
        </div>
        {joinedCount !== undefined && neededCount !== undefined && (
          <ActionCompletedBarWithInfo
            threshold={neededCount}
            friendActivities={friendActivities}
            status={status}
            value={joinedCount}
            everyoneShouldComplete={everyoneShouldComplete}
          />
        )}
      </Card>
    </div>
  );
};

export default SmallActionCard;
