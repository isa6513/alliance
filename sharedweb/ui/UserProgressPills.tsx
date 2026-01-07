import {
  UserActionRelationDetailDto,
  UserActionRelationPillStatus,
  UserActionSummaryDto,
} from "@alliance/shared/client";
import { JSX } from "react";

export const formatRelationStatus = (
  status: UserActionRelationPillStatus
): string => {
  switch (status) {
    case "completed":
      return "Completed";
    case "not_required":
      return "Not required";
    case "wont_complete":
      return "Won't complete";
    case "missed_deadline":
      return "Missed deadline";
    case "todo":
      return "Not started";
    default:
      throw new Error(`Invalid filter mode: ${status satisfies never}`);
  }
};

export interface UserProgressPillsProps {
  actions: UserActionSummaryDto[];
  relationByActionId: Record<number, UserActionRelationDetailDto>;
  pillHeight?: string;
}

function pillBgStyle(status: UserActionRelationPillStatus): string {
  switch (status) {
    case "completed":
      return "bg-green";
    case "wont_complete":
      return "bg-yellow-400";
    case "missed_deadline":
      return "bg-orange-600";
    case "not_required":
      return "bg-zinc-100 border border-zinc-200";
    case "todo":
      return "bg-white text-zinc-500 border border-green";
    default:
      throw new Error(`Invalid filter mode: ${status satisfies never}`);
  }
}

function pillText(status: UserActionRelationPillStatus): JSX.Element {
  switch (status) {
    case "completed":
      return <span className="text-green">Completed</span>;
    case "wont_complete":
      return <span className="text-yellow">Won't complete</span>;
    case "missed_deadline":
      return <span className="text-orange">Missed deadline</span>;
    case "not_required":
      return (
        <span className="text-zinc-500">Member not expected to complete</span>
      );
    case "todo":
      return <span className="text-zinc-500">Not yet completed</span>;
    default:
      throw new Error(`Invalid filter mode: ${status satisfies never}`);
  }
}

const UserProgressPills = ({
  actions,
  relationByActionId,
  pillHeight = "h-3",
}: UserProgressPillsProps) => {
  return (
    <div className="flex gap-1 w-full">
      {actions
        .filter((action) => action.status !== "planned")
        .map((action) => {
          const relation = relationByActionId[action.id] ?? {
            status: "none",
          };
          const className = pillBgStyle(relation.status);
          return relation ? (
            <div key={action.id} className="relative group flex-1">
              <div
                className={`rounded flex items-center justify-center text-xs font-semibold min-w-2 ${className} ${pillHeight}`}
                aria-label={`${action.name} – ${formatRelationStatus(
                  relation.status
                )}`}
              ></div>
              <div className="pointer-events-none absolute bottom-full mb-1 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded border border-zinc-200 bg-white px-2 py-1 text-[12px] font-medium text-zinc-700 opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100">
                <div className="flex flex-col items-center justify-center">
                  {action.name}
                  {pillText(relation.status)}
                </div>
              </div>
            </div>
          ) : null;
        })}
    </div>
  );
};

export default UserProgressPills;
