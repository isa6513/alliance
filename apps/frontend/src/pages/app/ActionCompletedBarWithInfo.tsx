import CompletedBar from "../../components/CompletedBar";
import UserProfilePicRow from "../../components/UserProfilePicRow";
import {
  ActionCompletedBarWithInfoPropsShared,
  getCompletedPercentage,
} from "@alliance/shared/lib/actionCompletedBarWithInfo";

interface ActionCompletedBarWithInfoProps
  extends ActionCompletedBarWithInfoPropsShared {
  className?: string;
  textSize?: "sm" | "base";
  textColor?: string;
}

const ActionCompletedBarWithInfo: React.FC<ActionCompletedBarWithInfoProps> = ({
  action,
  friendActivities,
  className,
  textSize = "sm",
  textColor = "zinc-500",
}: ActionCompletedBarWithInfoProps) => {
  const { labelString, percentage } = getCompletedPercentage(action);

  if (percentage === null) {
    return null;
  }

  return (
    <div className={`${className}`}>
      <div className="flex flex-row items-center justify-between w-full gap-x-2">
        <p className={`mb-1 text-${textSize} text-${textColor}`}>
          {labelString}{" "}
          {action.status === "gathering_commitments"
            ? "members committed"
            : "members completed"}
        </p>
        {friendActivities !== null && (
          <UserProfilePicRow
            users={friendActivities.map((activity) => activity.user)}
          />
        )}
      </div>
      <CompletedBar percentage={percentage} />
    </div>
  );
};

export default ActionCompletedBarWithInfo;
