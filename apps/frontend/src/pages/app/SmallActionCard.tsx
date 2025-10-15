import { ActionActivityDto } from "@alliance/shared/client/types.gen";
import Card, { CardStyle } from "@alliance/shared/ui/Card";
import React, { useCallback } from "react";
import { useNavigate } from "react-router";
import { ActionWithRelation } from "../../applayout";
import CompletedBar from "../../components/CompletedBar";
import Tag, { TagStyle } from "../../components/Tag";
import UserProfilePicRow from "../../components/UserProfilePicRow";

export interface SmallActionCardProps
  extends Pick<
    ActionWithRelation,
    | "name"
    | "shortDescription"
    | "commitmentless"
    | "category"
    | "id"
    | "status"
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

  console.log(joinedCount, neededCount);

  const waitingOnCompletion =
    status === "member_action" && (relation === "joined" || commitmentless);

  const waitingOnCommitment =
    status === "gathering_commitments" && relation === "none";

  const waitingForOffice = status === "office_action" && relation === "joined";

  const waitingOnOthers =
    status === "gathering_commitments" && relation === "joined";

  // const [toggleComments, setToggleComments] = useState(false);

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
          <div className="mt-2">
            <div className="flex flex-row items-center justify-between w-full gap-x-2">
              <p className="text-zinc-500 text-sm mb-0.5">
                {joinedCount} / {neededCount}{" "}
                {status === "member_action"
                  ? "members completed"
                  : "members committed"}
                {friendActivities.length > 0 && (
                  <>
                    , including {friendActivities.length} friend
                    {friendActivities.length === 1 ? "" : "s"}
                  </>
                )}
              </p>
              <UserProfilePicRow
                users={friendActivities.map((activity) => activity.user)}
              />
            </div>
            <CompletedBar percentage={(joinedCount / neededCount) * 100} />
          </div>
        )}
      </Card>
    </div>
  );
};

export default SmallActionCard;
