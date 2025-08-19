import {
  ActionActivityDto,
  ActionDto,
  UserActionRelation,
} from "@alliance/shared/client";
import TaskCard from "./TaskCard";

export interface SingleActionCardProps {
  action: ActionDto;
  relations: UserActionRelation;
  activity: ActionActivityDto | null;
}

const SingleActionCard = ({
  action,
  relations,
  activity,
}: SingleActionCardProps) => {
  return (
    <TaskCard action={action} onComplete={() => {}}>
      <div className="flex flex-col p-6">
        <p>Single action</p>
      </div>
    </TaskCard>
  );
};

export default SingleActionCard;
