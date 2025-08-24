import { ActionActivityDto } from "@alliance/shared/client/types.gen";
import React, { useCallback } from "react";
import { useNavigate } from "react-router";
import { ActionWithRelation } from "../../applayout";
import CompletedBar from "../../components/CompletedBar";
import Card, { CardStyle } from "../../components/system/Card";
import UserProfilePicRow from "../../components/UserProfilePicRow";

export interface SmallActionCardProps
  extends Pick<
    ActionWithRelation,
    "name" | "shortDescription" | "category" | "id" | "status" | "relation"
  > {
  className?: string;
  joinedCount?: number;
  neededCount?: number;
  friendActivities?: ActionActivityDto[];
  showDescription?: boolean;
  activity?: ActionActivityDto;
}

const SmallActionCard: React.FC<SmallActionCardProps> = ({
  name,
  id,
  shortDescription,
  className,
  status,
  joinedCount,
  neededCount,
  friendActivities = [],
  relation,
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

  const waitingOnCompletion =
    status === "member_action" && relation === "joined";

  const waitingOnCommitment =
    status === "gathering_commitments" && relation === "none";

  const waitingForOffice =
    status === "commitments_reached" && relation === "joined";

  const waitingOnOthers =
    status === "gathering_commitments" && relation === "joined";

  // const [toggleComments, setToggleComments] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <Card
        className="block overflow-hidden"
        style={
          waitingOnOthers || waitingForOffice
            ? CardStyle.LightGrey
            : CardStyle.White
        }
        onClick={goToActionPage}
      >
        <div className="flex flex-row items-start gap-x-8">
          <div className="flex-1 flex flex-col">
            {waitingOnCompletion && (
              <div className="px-2 py-1 bg-blue-400/20 self-start rounded-md text-sm text-blue-600 mb-2">
                Needs your completion
              </div>
            )}
            {waitingOnCommitment && (
              <div className="px-2 py-1 bg-yellow-400/20 self-start rounded-md text-sm text-yellow-600 mb-2">
                Needs your commitment
              </div>
            )}
            {waitingForOffice && (
              <div className="px-2 py-1 bg-zinc-400/20 self-start rounded-md text-sm text-zinc-500 mb-2">
                Needs office to launch
              </div>
            )}
            {waitingOnOthers && (
              <div className="px-2 py-1 bg-zinc-400/20 self-start rounded-md text-sm text-zinc-500 mb-2">
                Needs commitments from others
              </div>
            )}

            <p className="font-medium text-black">{name}</p>
            <p className="text-zinc-500">{shortDescription}</p>
          </div>
        </div>
        {activity && joinedCount && neededCount && (
          <div className="mt-6">
            <div className="flex flex-row items-center justify-between w-full gap-x-2">
              <p className="text-zinc-500 text-base mb-0.5">
                {joinedCount} / {neededCount}{" "}
                {status === "member_action" ? "completed" : "committed"}
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
