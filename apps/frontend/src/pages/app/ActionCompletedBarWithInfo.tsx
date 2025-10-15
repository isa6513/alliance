import {
  ActionActivityDto,
  ActionStatus,
} from "@alliance/shared/client/types.gen";
import CompletedBar from "../../components/CompletedBar";
import UserProfilePicRow from "../../components/UserProfilePicRow";

interface ActionCompletedBarWithInfoProps {
  threshold: number;
  friendActivities: ActionActivityDto[] | null;
  status: ActionStatus;
  value: number;
}

const ActionCompletedBarWithInfo: React.FC<ActionCompletedBarWithInfoProps> = ({
  threshold,
  friendActivities,
  value,
  status,
}: ActionCompletedBarWithInfoProps) => {
  return (
    <div>
      <div className="flex flex-row items-center justify-between w-full gap-x-2">
        <p className="text-zinc-500 text-sm mb-1">
          {value} / {threshold}{" "}
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
      <CompletedBar percentage={(value / threshold) * 100} />
    </div>
  );
};

export default ActionCompletedBarWithInfo;
