import {
  UserActionRelationDetailDto,
  UserActionRelationPillStatus,
  UserActionSummaryDto,
} from "@alliance/shared/client";

export type PillStatusData = {
  pillLabel: string;
  pillStyle: string;
  pillSubtitleText: string;
  pillTextStyle: string;
};
export const PILL_STATUS_DATA = Object.freeze({
  completed: Object.freeze({
    pillLabel: "Completed",
    pillStyle: "bg-green",
    pillSubtitleText: "Completed",
    pillTextStyle: "text-green",
  }) satisfies PillStatusData,
  missed_deadline: Object.freeze({
    pillLabel: "Missed deadline",
    pillStyle: "bg-zinc-700",
    pillSubtitleText: "Missed deadline",
    pillTextStyle: "text-black",
  }) satisfies PillStatusData,
  not_required: Object.freeze({
    pillLabel: "Not required",
    pillStyle: "bg-zinc-100 border border-zinc-200",
    pillSubtitleText: "Member not expected to complete",
    pillTextStyle: "text-zinc-500",
  }) satisfies PillStatusData,
  todo: Object.freeze({
    pillLabel: "Not started",
    pillStyle: "bg-white text-zinc-500 border border-green",
    pillSubtitleText: "Not yet completed",
    pillTextStyle: "text-zinc-500",
  }) satisfies PillStatusData,
  wont_complete: Object.freeze({
    pillLabel: "Won't complete",
    pillStyle: "bg-yellow-400",
    pillSubtitleText: "Won't complete",
    pillTextStyle: "text-yellow-500",
  }) satisfies PillStatusData,
}) satisfies Record<UserActionRelationPillStatus, PillStatusData>;

export interface UserProgressPillsProps {
  actions: UserActionSummaryDto[];
  relationByActionId: Record<number, UserActionRelationDetailDto>;
  pillHeight?: string;
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
          const relation = relationByActionId[action.id];
          const { pillLabel, pillStyle, pillSubtitleText, pillTextStyle } =
            PILL_STATUS_DATA[relation.status];
          const isWontComplete = relation.status === "wont_complete";
          return (
            <div key={action.id} className="relative group flex-1">
              <div
                className={`rounded flex items-center justify-center text-xs font-semibold min-w-2 ${pillStyle} ${pillHeight}`}
                aria-label={`${action.name} – ${pillLabel}`}
              ></div>
              <div className="pointer-events-none absolute bottom-full mb-1 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded border border-zinc-200 bg-white px-2 py-1 text-[12px] font-medium text-zinc-700 opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100">
                <div className="flex flex-col items-center justify-center">
                  {action.name}
                  <span className={pillTextStyle}>
                    {pillSubtitleText}
                    {isWontComplete
                      ? relation.outOfTime
                        ? ": Out of time"
                        : relation.isMoral
                        ? ": Moral objection"
                        : ": Other reason"
                      : null}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default UserProgressPills;
