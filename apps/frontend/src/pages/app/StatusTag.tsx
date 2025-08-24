import { ActionDto } from "@alliance/shared/client";
import StatusIcon from "../../components/icons/StatusIcon";
import Tag, { TagStyle } from "../../components/Tag";

const actionStatusStyles: Record<ActionDto["status"], TagStyle> = {
  gathering_commitments: TagStyle.Yellow,
  commitments_reached: TagStyle.Green,
  member_action: TagStyle.Blue,
  resolution: TagStyle.Blue,
  completed: TagStyle.Green,
  failed: TagStyle.Grey,
  abandoned: TagStyle.Grey,
  draft: TagStyle.Grey,
  upcoming: TagStyle.Grey,
};

const actionStatusDescriptions: Record<ActionDto["status"], string> = {
  gathering_commitments: "Gathering commitments",
  commitments_reached: "Pending office launch",
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
    // <div
    //   className={`px-3 py-1 flex flex-row items-center border ${actionStatusStyles[status]} rounded-lg`}
    // >
    <Tag
      style={actionStatusStyles[status]}
      size="large"
      className="flex flex-row items-center"
    >
      <StatusIcon status={status} size="small" />
      <p>{actionStatusDescriptions[status]}</p>
    </Tag>
  );
};

export default StatusTag;
