import {
  UserActionRelationDetailDto,
  UserActionRelationPillStatus,
  UserActionSummaryDto,
} from "@alliance/shared/client";
import { formatDateTime } from "@alliance/shared/lib/dateFormatters";
import React, { Fragment } from "react";
import { JSX, ReactNode, useEffect, useMemo, useRef, useState } from "react";

export type PillStatusData = {
  pillLabel: string;
  pillTextStyle: string;
} & (
  | {
      pillStyle: string;
      pillSubtitleText: string;
    }
  | {
      pillStyle: null;
      pillSubtitleText: null;
    }
);
export const PILL_STATUS_DATA = Object.freeze({
  away: Object.freeze({
    pillLabel: "Away",
    pillStyle: "bg-zinc-100 border border-zinc-200",
    pillSubtitleText: "Member away",
    pillTextStyle: "text-zinc-400",
  }) satisfies PillStatusData,
  completed: Object.freeze({
    pillLabel: "Completed",
    pillStyle: "bg-green",
    pillSubtitleText: "Completed",
    pillTextStyle: "text-green",
  }) satisfies PillStatusData,
  missed_deadline: Object.freeze({
    pillLabel: "Missed deadline",
    pillStyle: "bg-orange-600",
    pillSubtitleText: "Missed deadline",
    pillTextStyle: "text-red-400",
  }) satisfies PillStatusData,
  not_required: Object.freeze({
    pillLabel: "Not required",
    pillStyle: null,
    pillSubtitleText: null,
    pillTextStyle: "text-zinc-400",
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
  optional_task: Object.freeze({
    pillLabel: "Optional",
    pillStyle: "bg-white border border-blue",
    pillSubtitleText: "Optional",
    pillTextStyle: "text-blue-500",
  }) satisfies PillStatusData,
}) satisfies Record<UserActionRelationPillStatus, PillStatusData>;

export function useMaxActionsPerWeek(params: {
  actionSummaries: UserActionSummaryDto[] | null;
  userActionRelations: Record<number, UserActionRelationDetailDto[]> | null;
}): Record<number, number> | null {
  const { actionSummaries, userActionRelations } = params;

  return useMemo(() => {
    if (!actionSummaries || !userActionRelations) {
      return null;
    }
    const weekNumberByActionId = new Map(
      actionSummaries.map((action) => [action.id, action.weekNumber])
    );

    const maxActionsPerWeek: Record<number, number> = {};
    for (const relations of Object.values(userActionRelations)) {
      const counts = relations.reduce((acc, relation) => {
        if (PILL_STATUS_DATA[relation.status].pillStyle) {
          const weekNumber = weekNumberByActionId.get(relation.actionId);
          if (weekNumber === null || weekNumber === undefined) {
            return acc;
          }
          acc[weekNumber] = (acc[weekNumber] ?? 0) + 1;
        }
        return acc;
      }, {} as Record<number, number>);

      for (const [weekNumberKey, count] of Object.entries(counts)) {
        const weekNumber = Number(weekNumberKey);
        maxActionsPerWeek[weekNumber] = Math.max(
          maxActionsPerWeek[weekNumber] ?? 0,
          count
        );
      }
    }
    return maxActionsPerWeek;
  }, [actionSummaries, userActionRelations]);
}

export interface UserProgressPillsProps {
  actions: UserActionSummaryDto[];
  maxActionsPerWeek: Record<number, number> | null;
  relationByActionId: Record<number, UserActionRelationDetailDto>;
  pillHeight?: string;
}

function EmptyPill() {
  return <div className="relative group flex-1 min-w-4" />;
}
function Pill({
  action,
  additionalSubtitleText,
  pillStatusData,
  pillHeight,
}: {
  action: UserActionSummaryDto;
  additionalSubtitleText?: ReactNode;
  pillStatusData: PillStatusData & { pillStyle: string };
  pillHeight: string;
}) {
  const { pillLabel, pillStyle, pillSubtitleText, pillTextStyle } =
    pillStatusData;
  return (
    <div key={action.id} className="relative group flex-1 min-w-4">
      <div
        className={`rounded flex items-center justify-center text-xs font-semibold min-w-4 ${pillStyle} ${pillHeight}`}
        aria-label={`${action.name} – ${pillLabel}`}
      ></div>
      {pillStyle && (
        <div className="pointer-events-none absolute bottom-full mb-1 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded border border-zinc-200 bg-white px-2 py-1 text-[12px] font-medium text-zinc-700 opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100">
          <div className="flex flex-col items-center justify-center">
            <p>{action.name}</p>
            <p className="text-zinc-500">
              {action.latestMemberActionDeadline === null
                ? "No deadline"
                : `Due ${formatDateTime(new Date(action.latestMemberActionDeadline))}`}
            </p>
            <p className={pillTextStyle}>
              {pillSubtitleText}
              {additionalSubtitleText}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

const UserProgressPills = ({
  actions,
  maxActionsPerWeek,
  relationByActionId,
  pillHeight = "h-3",
}: UserProgressPillsProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [maxVisiblePills, setMaxVisiblePills] = useState<number | null>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    const minPillWidthPx = 24;
    const pillGapPx = 4;
    const updateMaxVisible = () => {
      setMaxVisiblePills(
        Math.max(
          1,
          Math.floor(
            (element.clientWidth + pillGapPx) / (minPillWidthPx + pillGapPx)
          )
        )
      );
    };

    updateMaxVisible();
    const observer = new ResizeObserver(updateMaxVisible);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const pills: ReactNode[] = useMemo(() => {
    if (!maxActionsPerWeek) {
      return actions.map((action) => {
        const relation = relationByActionId[action.id];
        if (!relation) {
          return null;
        }
        const pillStatusData = PILL_STATUS_DATA[relation.status];
        if (!pillStatusData.pillStyle) {
          return null;
        }
        return (
          <Pill
            action={action}
            additionalSubtitleText={
              relation.status === "wont_complete"
                ? relation.outOfTime
                  ? ": Out of time"
                  : relation.isMoral
                  ? ": Moral objection"
                  : ": Other reason"
                : null
            }
            pillStatusData={pillStatusData}
            pillHeight={pillHeight}
          />
        );
      });
    }

    const actionMap = actions.reduce((acc, action) => {
      acc.set(action.id, action);
      return acc;
    }, new Map<number, UserActionSummaryDto>());

    const weekNumbers = Object.keys(maxActionsPerWeek).map(Number).sort();
    const relationsPerWeek = actions.reduce((acc, action) => {
      if (action.weekNumber) {
        const relation = relationByActionId[action.id];
        if (relation) {
          acc.set(action.weekNumber, [
            ...(acc.get(action.weekNumber) ?? []),
            relation,
          ]);
        }
      }
      return acc;
    }, new Map<number, UserActionRelationDetailDto[]>());

    const pills: JSX.Element[] = [];
    for (const weekNumber of weekNumbers) {
      const pillsForWeek: JSX.Element[] = [];
      const relations = relationsPerWeek.get(weekNumber);
      if (relations) {
        for (const relation of relations) {
          const action = actionMap.get(relation.actionId);
          const pillStatusData = PILL_STATUS_DATA[relation.status];
          if (!action || !pillStatusData.pillStyle) {
            continue;
          }
          pillsForWeek.push(
            <Pill
              action={action}
              pillStatusData={pillStatusData}
              pillHeight={pillHeight}
            />
          );
        }
      }

      // fill rest of pills with empty pills
      pills.push(
        ...pillsForWeek,
        ...Array(maxActionsPerWeek[weekNumber] - pillsForWeek.length).fill(
          <EmptyPill />
        )
      );
    }

    return pills;
  }, [actions, maxActionsPerWeek, relationByActionId]);

  const visiblePills = useMemo(() => {
    const definedPills = pills.filter(Boolean);
    if (maxVisiblePills && definedPills.length > maxVisiblePills) {
      return definedPills.slice(-maxVisiblePills);
    }
    return definedPills;
  }, [pills, maxVisiblePills]);

  return (
    <div ref={containerRef} className="flex gap-1 w-full">
      {visiblePills.map((pill, i) => (
        <Fragment key={i}>{pill}</Fragment>
      ))}
    </div>
  );
};

export default UserProgressPills;
