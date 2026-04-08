import { ActionDto } from "@alliance/shared/client";
import Tag, { TagStyle } from "../../components/Tag";

const actionStatusStyles: Record<ActionDto["status"], TagStyle> = {
  office_action: TagStyle.GreenOutline,
  member_action: TagStyle.GreenOutline,
  resolution: TagStyle.GreyOutline,
  completed: TagStyle.Green,
  failed: TagStyle.GreyOutline,
  abandoned: TagStyle.GreyOutline,
  draft: TagStyle.GreyOutline,
  planned: TagStyle.GreyOutline,
};

const actionStatusDescriptions: Record<ActionDto["status"], string> = {
  office_action: "Pending office launch",
  member_action: "Members are now taking action",
  resolution: "Pending office resolution",
  completed: "Completed",
  failed: "Failed",
  abandoned: "Abandoned",
  draft: "Draft",
  planned: "Planned",
};

interface StatusTagProps {
  status: ActionDto["status"];
  compact?: boolean;
}

const StatusTag = ({ status }: StatusTagProps) => {
  return (
    // <div
    //   className={cn("px-3 py-1 flex flex-row items-center border rounded-lg", actionStatusStyles[status])}
    // >
    <Tag
      style={actionStatusStyles[status]}
      size="large"
      className="flex flex-row items-center shadow"
    >
      {/* <StatusIcon status={status} size="small" /> */}
      <p>{actionStatusDescriptions[status]}</p>
    </Tag>
  );
};

export default StatusTag;
