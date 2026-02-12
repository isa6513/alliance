import chroma from "chroma-js";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { analyticsGetActionCompletionCurves } from "@alliance/shared/client";
import { ActionCompletionCurveDto } from "@alliance/shared/client/types.gen";
import {
  TimeSeriesChart,
  type DataPoint,
  type MultiLineSeries,
} from "./TimeSeriesChart";

type ActionCompletionCurveChartProps = {
  title?: string;
  actionId?: number;
  showSelector?: boolean;
  refreshKey?: number;
};

const LOCKED_MAX_DAY = 7;

const ActionCompletionCurveChart: React.FC<ActionCompletionCurveChartProps> = ({
  title = "Completions throughout week",
  actionId,
  showSelector = true,
  refreshKey,
}) => {
  const [actionCompletionCurves, setActionCompletionCurves] = useState<
    ActionCompletionCurveDto[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedActionId, setSelectedActionId] = useState<string>(
    actionId !== undefined ? String(actionId) : "all"
  );

  useEffect(() => {
    if (actionId === undefined) return;
    setSelectedActionId(String(actionId));
  }, [actionId]);

  const loadActionCompletionCurves = useCallback(async () => {
    setLoading(true);
    try {
      // Always fetch all curves - needed to compute the average line
      const response = await analyticsGetActionCompletionCurves();
      setActionCompletionCurves(response.data ?? []);
    } catch (err) {
      console.error("Failed to load action completion curves", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadActionCompletionCurves();
  }, [loadActionCompletionCurves, refreshKey]);

  const completionCurveActionOptions = useMemo(() => {
    return actionCompletionCurves
      .slice()
      .sort((a, b) => {
        const dateA = a.memberActionStartDate
          ? new Date(a.memberActionStartDate).getTime()
          : Number.NEGATIVE_INFINITY;
        const dateB = b.memberActionStartDate
          ? new Date(b.memberActionStartDate).getTime()
          : Number.NEGATIVE_INFINITY;
        if (dateA !== dateB) {
          return dateB - dateA;
        }
        return a.actionName.localeCompare(b.actionName);
      })
      .map((curve) => ({
        id: String(curve.actionId),
        name: curve.actionName,
      }));
  }, [actionCompletionCurves]);

  const completionCurveActionOrder = useMemo(
    () => ["all", ...completionCurveActionOptions.map((option) => option.id)],
    [completionCurveActionOptions]
  );

  const stepCompletionAction = useCallback(
    (direction: -1 | 1) => {
      if (completionCurveActionOrder.length === 0) return;
      const currentIndex = completionCurveActionOrder.indexOf(
        selectedActionId
      );
      const startIndex = currentIndex >= 0 ? currentIndex : 0;
      const nextIndex =
        (startIndex + direction + completionCurveActionOrder.length) %
        completionCurveActionOrder.length;
      setSelectedActionId(completionCurveActionOrder[nextIndex]);
    },
    [completionCurveActionOrder, selectedActionId]
  );

  useEffect(() => {
    if (actionId !== undefined) return;
    if (selectedActionId === "all") return;
    const exists = completionCurveActionOptions.some(
      (option) => option.id === selectedActionId
    );
    if (!exists) {
      setSelectedActionId("all");
    }
  }, [actionId, completionCurveActionOptions, selectedActionId]);

  const actionCompletionCurveChartData = useMemo(() => {
    const eligibleCurves = actionCompletionCurves.filter(
      (curve) =>
        (curve.dayOffsets?.length ?? 0) > 0 &&
        (curve.completionFractions?.length ?? 0) ===
        (curve.dayOffsets?.length ?? 0)
    );

    if (eligibleCurves.length === 0) {
      return {
        multiLineData: [] as MultiLineSeries[],
        maxDay: 0,
        yDomain: undefined as [number, number] | undefined,
      };
    }

    const colorScale = chroma
      .scale(["#0ea5e9", "#6366f1", "#14b8a6"])
      .mode("lch")
      .domain([0, Math.max(1, eligibleCurves.length - 1)]);

    const sumByDay = new Array<number>(LOCKED_MAX_DAY + 1).fill(0);
    const countByDay = new Array<number>(LOCKED_MAX_DAY + 1).fill(0);

    const actionSeries: MultiLineSeries[] = eligibleCurves
      .slice()
      .sort((a, b) => a.actionName.localeCompare(b.actionName))
      .map((curve, index) => {
        const data: DataPoint[] = [];
        let cumulativeFraction = 0;
        let cumulativeCount = 0;
        curve.dayOffsets.forEach((offset, idx) => {
          if (!Number.isFinite(offset) || offset < 0 || offset > LOCKED_MAX_DAY) {
            return;
          }
          const completionFraction = curve.completionFractions[idx] ?? 0;
          const completionCount = curve.completedCounts[idx] ?? 0;
          if (Number.isFinite(completionFraction)) {
            sumByDay[offset] += completionFraction;
            countByDay[offset] += 1;
            cumulativeFraction += completionFraction;
            cumulativeCount += completionCount;
          }
          data.push({
            x: offset,
            completionFraction,
            completionCount,
            cumulativeCompletionFraction: cumulativeFraction,
            cumulativeCompletionCount: cumulativeCount,
            usersJoined: curve.usersJoined,
            actionId: curve.actionId,
            actionName: curve.actionName,
          });
        });

        return {
          key: `action-${curve.actionId}`,
          label: curve.actionName,
          color: chroma(colorScale(index)).alpha(0.45).css(),
          data,
        };
      });

    type AveragePoint = {
      x: number;
      completionFraction: number;
      cumulativeCompletionFraction: number;
      actionCount: number;
    };

    let avgCumulativeFraction = 0;
    const averageData = sumByDay
      .map((sum, offset) => {
        const count = countByDay[offset];
        if (!count) return null;
        const fraction = sum / count;
        avgCumulativeFraction += fraction;
        return {
          x: offset,
          completionFraction: fraction,
          cumulativeCompletionFraction: avgCumulativeFraction,
          actionCount: count,
        };
      })
      .filter((point): point is AveragePoint => point !== null);

    const averageSeries: MultiLineSeries = {
      key: "average",
      label: "Average trend",
      color: "#111827",
      data: averageData,
    };

    const selectionId = actionId !== undefined ? String(actionId) : null;
    const filteredActionSeries = selectionId
      ? actionSeries.filter((series) => series.key === `action-${selectionId}`)
      : selectedActionId === "all"
        ? actionSeries
        : actionSeries.filter(
          (series) => series.key === `action-${selectedActionId}`
        );

    const displayedSeries = [...filteredActionSeries, averageSeries];
    const allSeries = [...actionSeries, averageSeries];
    const allValues = allSeries.flatMap((series) =>
      series.data
        .map((point) => point.completionFraction as number)
        .filter((value) => Number.isFinite(value))
    );
    const maxValue = allValues.length ? Math.max(...allValues) : 0;
    const paddedMax =
      maxValue > 0 ? Math.min(1, Math.max(0.05, maxValue * 1.1)) : 0.1;

    return {
      multiLineData: displayedSeries,
      maxDay: LOCKED_MAX_DAY,
      yDomain: [0, paddedMax] as [number, number],
    };
  }, [actionCompletionCurves, actionId, selectedActionId]);

  const showDropdown = showSelector && actionId === undefined;

  return (
    <TimeSeriesChart
      title={title}
      xType="number"
      loading={loading}
      emptyMessage="No action completion curves available."
      multiLineData={actionCompletionCurveChartData.multiLineData}
      getXValue={(d) => (d.x as number) ?? 0}
      getYValue={(d) => (d.completionFraction as number) ?? 0}
      xAxisFormat={(v) => `${Math.round(v)}d`}
      xRange={{ min: 0, max: LOCKED_MAX_DAY }}
      yDomain={actionCompletionCurveChartData.yDomain}
      yAxisFormat={(v) => `${Math.round(v * 100)}%`}
      height={360}
      headerContent={
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 md:ml-auto">
          {showDropdown && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-600">
                Action
              </label>
              <select
                value={selectedActionId}
                onChange={(event) =>
                  setSelectedActionId(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "ArrowLeft") {
                    event.preventDefault();
                    stepCompletionAction(-1);
                  }
                  if (event.key === "ArrowRight") {
                    event.preventDefault();
                    stepCompletionAction(1);
                  }
                }}
                className="rounded-md border border-gray-300 px-2 py-1 text-xs bg-white"
              >
                <option value="all">All actions</option>
                {completionCurveActionOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      }
      getHoverContent={(point, series) => {
        const completionRate =
          typeof point.completionFraction === "number"
            ? point.completionFraction
            : 0;
        const cumulativeRate =
          typeof point.cumulativeCompletionFraction === "number"
            ? point.cumulativeCompletionFraction
            : 0;
        const items = [
          { label: "Day", value: point.x as number },
          {
            label: "Completions today",
            value: `${(completionRate * 100).toFixed(2)}%`,
            color: series.color,
          },
          {
            label: "Total completed",
            value: `${(cumulativeRate * 100).toFixed(2)}%`,
          },
        ];

        if (series.key === "average") {
          items.push({
            label: "Actions",
            value: point.actionCount as number,
          });
        } else {
          items.push(
            {
              label: "Completed",
              value: point.completionCount as number,
            },
            {
              label: "Joined",
              value: point.usersJoined as number,
            }
          );
        }

        return {
          title: series.label,
          items,
        };
      }}
    />
  );
};

export default ActionCompletionCurveChart;
