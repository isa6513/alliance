import ActionCardUserCount from "./ActionCardUserCount";
import CompletedBar from "./CompletedBar";

export interface UsersCompletedBarProps {
  usersCompleted: number;
  totalUsers: number;
}

const UsersCompletedBar: React.FC<UsersCompletedBarProps> = ({
  usersCompleted,
  totalUsers,
}: UsersCompletedBarProps) => {
  const percentage = (usersCompleted / totalUsers) * 100;
  return (
    <div className="flex flex-col flex-1 relative items-end">
      <ActionCardUserCount joined={totalUsers} completed={usersCompleted} />
      <CompletedBar percentage={percentage} />
    </div>
  );
};

export default UsersCompletedBar;
