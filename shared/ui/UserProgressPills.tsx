import {
  UserActionRelationDetailDto,
  UserActionRelationStatus,
  UserActionSummaryDto,
} from "../client";

export const formatRelationStatus = (
  status: UserActionRelationStatus
): string => {
  switch (status) {
    case "completed":
      return "Completed";
    case "joined":
      return "Joined";
    case "declined":
      return "Declined";
    case "wont_complete":
      return "Won't complete";
    case "missed_deadline":
      return "Missed deadline";
    case "none":
      return "Not started";
    default:
      throw new Error(`Invalid filter mode: ${status satisfies never}`);
  }
};

export interface UserProgressPillsProps {
  actions: UserActionSummaryDto[];
  relationByActionId: Record<number, UserActionRelationDetailDto>;
}

const UserProgressPills = ({
  actions,
  relationByActionId,
}: UserProgressPillsProps) => {
  return (
    <div className="mt-2 flex flex-wrap gap-1 w-full">
      {actions.map((action) => {
        const relation = relationByActionId[action.id] ?? {
          status: "none",
        };
        const isCompleted = relation?.status === "completed";
        const className = isCompleted
          ? "bg-green"
          : relation?.status === "joined"
          ? "bg-green/40"
          : relation?.status === "wont_complete"
          ? "bg-yellow-400"
          : relation?.status === "missed_deadline"
          ? "bg-orange-600"
          : "bg-zinc-100 text-zinc-500 border border-zinc-200";
        return relation ? (
          <div key={action.id} className="relative group flex-1">
            <div
              className={`h-3 w-full rounded flex items-center justify-center text-xs font-semibold ${className}`}
              aria-label={`${action.name} – ${formatRelationStatus(
                relation.status
              )}`}
            ></div>
            <div className="pointer-events-none absolute -top-8 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded border border-zinc-200 bg-white px-2 py-1 text-[12px] font-medium text-zinc-700 opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100">
              {action.name}
            </div>
          </div>
        ) : null;
      })}
    </div>
  );
};

export default UserProgressPills;
