import { ActionDto } from "@alliance/shared/client";
import StatusIcon from "../../components/icons/StatusIcon";

const actionStatusColors: Record<ActionDto["status"], string> = {
  gathering_commitments: "bg-yellow-50 text-yellow-600 border-yellow-600",
  commitments_reached: "bg-green/10 text-green border-green",
  member_action: "bg-blue-50 text-blue-600 border-blue-600",
  resolution: "blue-500",
  completed: "gray-500",
  failed: "red-500",
  abandoned: "yellow-500",
  draft: "gray-500",
  upcoming: "blue-500",
};

const actionStatusDescriptions: Record<ActionDto["status"], string> = {
  gathering_commitments: "Gathering commitments",
  commitments_reached: "Sufficient commitments reached",
  member_action: "Members are now taking action",
  resolution: "Pending office resolution",
  completed: "Completed",
  failed: "Failed",
  abandoned: "Abandoned",
  draft: "Draft",
  upcoming: "Upcoming",
};

interface StatusTagProps {
  status: ActionDto["status"];
  compact?: boolean;
}

const StatusTag = ({ status }: StatusTagProps) => {
  return (
    <div
      className={`px-3 py-1 flex flex-row items-center border ${actionStatusColors[status]} rounded-lg`}
    >
      <StatusIcon status={status} size="small" />
      <p>{actionStatusDescriptions[status]}</p>
    </div>
  );
};

export default StatusTag;
