import {
  ActionActivityDto,
  ActionDto,
} from "@alliance/shared/client/types.gen";
import CompletedBar from "../../components/CompletedBar";
import UserProfilePicRow from "../../components/UserProfilePicRow";

interface ActionCompletedBarWithInfoProps {
  friendActivities: ActionActivityDto[] | null;
  className?: string;
  action: Pick<
    ActionDto,
    | "commitmentThreshold"
    | "status"
    | "everyoneShouldComplete"
    | "usersCompleted"
    | "usersJoined"
  >;
}

const ActionCompletedBarWithInfo: React.FC<ActionCompletedBarWithInfoProps> = ({
  action,
  friendActivities,
  className,
}: ActionCompletedBarWithInfoProps) => {
  const value =
    action.status === "member_action"
      ? action.usersCompleted
      : action.usersJoined;

  const threshold =
    action.status === "gathering_commitments"
      ? action.commitmentThreshold
      : action.usersJoined;

  console.log(threshold);
  if (
    action.everyoneShouldComplete ||
    !threshold ||
    !(
      action.status === "gathering_commitments" ||
      action.status === "member_action"
    )
  ) {
    console.log("returning null");
    return null;
  }

  const safeThreshold = Math.max(threshold, value);
  return (
    <div className={`${className}`}>
      <div className="flex flex-row items-center justify-between w-full gap-x-2">
        <p className="text-zinc-500 text-sm mb-1">
          {value} / {safeThreshold}{" "}
          {status === "gathering_commitments"
            ? "members committed"
            : "members completed"}
        </p>
        {friendActivities !== null && (
          <UserProfilePicRow
            users={friendActivities.map((activity) => activity.user)}
          />
        )}
      </div>
      <CompletedBar percentage={(value / safeThreshold) * 100} />
    </div>
  );
};

export default ActionCompletedBarWithInfo;
