import { analyticsGetDailyStats } from "@alliance/shared/client";
import { DailyStatsRecord } from "@alliance/shared/client/types.gen";
import * as d3 from "d3";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type ParsedDailyStats = DailyStatsRecord & { parsedDate: Date };
type MetricKey =
  | "actionsCompleted"
  | "anonFormSubmissions"
  | "signedMembers"
  | "invitesAccepted"
  | "invitesCreated"
  | "suspendedMembers";

type MetricDefinition = {
  key: MetricKey;
  label: string;
  color: string;
};

const metricDefinitions: MetricDefinition[] = [
  {
    key: "actionsCompleted",
    label: "Actions completed",
    color: "#0891b2",
  },
  {
    key: "anonFormSubmissions",
    label: "Anon form submissions",
    color: "#8b5cf6",
  },
  {
    key: "signedMembers",
    label: "Members signed",
    color: "#16a34a",
  },
  {
    key: "invitesAccepted",
    label: "Invites accepted",
    color: "#f97316",
  },
  {
    key: "invitesCreated",
    label: "Invites created",
    color: "#2563eb",
  },
  {
    key: "suspendedMembers",
    label: "Members suspended",
    color: "#111827",
  },
];

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const fullDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

const formatDateAsLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDefaultRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 29);
  return {
    start: formatDateAsLocal(start),
    end: formatDateAsLocal(end),
  };
};

const StatsPage: React.FC = () => {
  const defaultRange = useMemo(() => getDefaultRange(), []);
  const [startInput, setStartInput] = useState<string>(defaultRange.start);
  const [endInput, setEndInput] = useState<string>(defaultRange.end);
  const [queryRange, setQueryRange] = useState(defaultRange);
  const [stats, setStats] = useState<DailyStatsRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredDay, setHoveredDay] = useState<ParsedDailyStats | null>(null);
  const [hoveredActionsDay, setHoveredActionsDay] =
    useState<ParsedDailyStats | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const actionsSvgRef = useRef<SVGSVGElement | null>(null);

  const loadStats = useCallback(async (startDate: string, endDate: string) => {
    setLoading(true);
    setError(null);

    const parsedStart = new Date(startDate);
    const parsedEnd = new Date(endDate);

    if (
      Number.isNaN(parsedStart.getTime()) ||
      Number.isNaN(parsedEnd.getTime())
    ) {
      setError("Please provide valid start and end dates.");
      setLoading(false);
      return;
    }

    if (parsedStart > parsedEnd) {
      setError("Start date must be before the end date.");
      setLoading(false);
      return;
    }

    try {
      const response = await analyticsGetDailyStats({
        query: {
          date: parsedStart.toISOString(),
          endDate: parsedEnd.toISOString(),
        },
      });

      const orderedData = (response.data ?? []).slice().sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });

      setStats(orderedData);
    } catch (err) {
      console.error("Failed to load daily stats", err);
      setError("Unable to load analytics right now. Please try again soon.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStats(queryRange.start, queryRange.end);
  }, [loadStats, queryRange.end, queryRange.start]);

  const parsedStats = useMemo<ParsedDailyStats[]>(() => {
    return stats
      .map((record) => ({
        ...record,
        parsedDate: new Date(record.date),
      }))
      .filter((record) => !Number.isNaN(record.parsedDate.getTime()));
  }, [stats]);

  useEffect(() => {
    if (parsedStats.length === 0) {
      setHoveredDay(null);
      setHoveredActionsDay(null);
      return;
    }
    setHoveredDay(parsedStats[parsedStats.length - 1]);
    setHoveredActionsDay(parsedStats[parsedStats.length - 1]);
  }, [parsedStats]);

  const createChartGeometry = useCallback(
    (metrics: MetricDefinition[], includeArea: boolean = false) => {
      if (parsedStats.length === 0) {
        return null;
      }

      const width = 1000;
      const height = 420;
      const margin = { top: 28, right: 32, bottom: 64, left: 72 };

      const dateExtent = d3.extent(parsedStats, (d) => d.parsedDate);
      if (!dateExtent[0] || !dateExtent[1]) {
        return null;
      }

      const xScale = d3
        .scaleTime()
        .domain(dateExtent)
        .range([margin.left, width - margin.right]);

      const maxMetricValue =
        d3.max(metrics, (metric) =>
          d3.max(parsedStats, (d) => d[metric.key] ?? 0)
        ) ?? 0;

      const yScale = d3
        .scaleLinear()
        .domain([0, Math.max(maxMetricValue * 1.1, 10)])
        .nice()
        .range([height - margin.bottom, margin.top]);

      const line = d3
        .line<{ parsedDate: Date; value: number }>()
        .x((d) => xScale(d.parsedDate))
        .y((d) => yScale(d.value))
        .curve(d3.curveMonotoneX);

      const lines = metrics.map((metric) => {
        const values = parsedStats.map((record) => ({
          parsedDate: record.parsedDate,
          value: record[metric.key] ?? 0,
        }));

        return {
          metric,
          path: line(values) ?? "",
        };
      });

      const xTicks = xScale.ticks(Math.min(8, parsedStats.length));
      const yTicks = yScale.ticks(6);

      const bisectDate = d3.bisector<ParsedDailyStats, Date>(
        (d) => d.parsedDate
      ).center;

      let areaPath = "";
      if (includeArea && metrics.length > 0) {
        const area = d3
          .area<ParsedDailyStats>()
          .x((d) => xScale(d.parsedDate))
          .y0(height - margin.bottom)
          .y1((d) => yScale(d[metrics[0].key] ?? 0))
          .curve(d3.curveMonotoneX);
        areaPath = area(parsedStats) ?? "";
      }

      return {
        width,
        height,
        margin,
        xScale,
        yScale,
        xTicks,
        yTicks,
        lines,
        areaPath,
        bisectDate,
        metrics,
      };
    },
    [parsedStats]
  );

  const mainMetrics = useMemo(
    () => metricDefinitions.filter((m) => m.key !== "actionsCompleted" && m.key !== "anonFormSubmissions"),
    []
  );
  const actionsMetric = useMemo(
    () => metricDefinitions.filter((m) => m.key === "actionsCompleted" || m.key === "anonFormSubmissions"),
    []
  );

  const mainChartGeometry = useMemo(
    () => createChartGeometry(mainMetrics, false),
    [createChartGeometry, mainMetrics]
  );

  const actionsChartGeometry = useMemo(
    () => createChartGeometry(actionsMetric, true),
    [createChartGeometry, actionsMetric]
  );

  const activeDay = hoveredDay ?? parsedStats[parsedStats.length - 1];
  const activeActionsDay =
    hoveredActionsDay ?? parsedStats[parsedStats.length - 1];

  const handleApplyRange = useCallback(() => {
    setQueryRange({ start: startInput, end: endInput });
  }, [endInput, startInput]);

  const handleQuickRange = useCallback((days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - (days - 1));
    const startValue = formatDateAsLocal(start);
    const endValue = formatDateAsLocal(end);
    setStartInput(startValue);
    setEndInput(endValue);
    setQueryRange({ start: startValue, end: endValue });
  }, []);

  const handleHover = useCallback(
    (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
      if (!mainChartGeometry || parsedStats.length === 0 || !svgRef.current) {
        return;
      }

      const rect = svgRef.current.getBoundingClientRect();
      const relativeX = event.clientX - rect.left;
      const relativeY = event.clientY - rect.top;
      if (relativeX < 0 || relativeY < 0) {
        return;
      }

      const scaleX = mainChartGeometry.width / rect.width;
      const pointerX = relativeX * scaleX;

      const hoveredDate = mainChartGeometry.xScale.invert(pointerX);
      const index = mainChartGeometry.bisectDate(parsedStats, hoveredDate);
      const clampedIndex = Math.max(0, Math.min(parsedStats.length - 1, index));

      setHoveredDay(parsedStats[clampedIndex]);
    },
    [mainChartGeometry, parsedStats]
  );

  const handleActionsHover = useCallback(
    (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
      if (
        !actionsChartGeometry ||
        parsedStats.length === 0 ||
        !actionsSvgRef.current
      ) {
        return;
      }

      const rect = actionsSvgRef.current.getBoundingClientRect();
      const relativeX = event.clientX - rect.left;
      const relativeY = event.clientY - rect.top;
      if (relativeX < 0 || relativeY < 0) {
        return;
      }

      const scaleX = actionsChartGeometry.width / rect.width;
      const pointerX = relativeX * scaleX;

      const hoveredDate = actionsChartGeometry.xScale.invert(pointerX);
      const index = actionsChartGeometry.bisectDate(parsedStats, hoveredDate);
      const clampedIndex = Math.max(0, Math.min(parsedStats.length - 1, index));

      setHoveredActionsDay(parsedStats[clampedIndex]);
    },
    [actionsChartGeometry, parsedStats]
  );

  return (
    <div className="p-6 md:p-8 space-y-6 text-gray-900 mx-auto">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">
              Start date
            </label>
            <input
              type="date"
              value={startInput}
              onChange={(e) => setStartInput(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">
              End date
            </label>
            <input
              type="date"
              value={endInput}
              onChange={(e) => setEndInput(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600 opacity-0">
              Update
            </label>
            <button
              onClick={handleApplyRange}
              className="px-4 py-2 rounded-md text-sm bg-green text-white shadow hover:bg-green-500"
            >
              Update
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleQuickRange(7)}
            className="px-4 py-2 rounded-md text-sm border border-gray-300 bg-white hover:border-gray-400"
          >
            Last 7 days
          </button>
          <button
            onClick={() => handleQuickRange(30)}
            className="px-4 py-2 rounded-md text-sm border border-gray-300 bg-white hover:border-gray-400"
          >
            Last 30 days
          </button>
        </div>
      </div>
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {loading && <p className="text-sm text-gray-600">Loading daily stats…</p>}
      {!loading && parsedStats.length === 0 && (
        <p className="text-sm text-gray-600">No daily stats for this range.</p>
      )}
      {!loading && parsedStats.length > 0 && mainChartGeometry && (
        <>
          <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="relative p-4">
              <svg
                ref={svgRef}
                viewBox={`0 0 ${mainChartGeometry.width} ${mainChartGeometry.height}`}
                onMouseMove={handleHover}
                onMouseLeave={() =>
                  setHoveredDay(parsedStats[parsedStats.length - 1])
                }
              >
                <g>
                  {mainChartGeometry.yTicks.map((tick) => (
                    <g key={`y-${tick}`}>
                      <line
                        x1={mainChartGeometry.margin.left}
                        x2={
                          mainChartGeometry.width -
                          mainChartGeometry.margin.right
                        }
                        y1={mainChartGeometry.yScale(tick)}
                        y2={mainChartGeometry.yScale(tick)}
                        stroke="#e5e7eb"
                        strokeDasharray="4 6"
                      />
                      <text
                        x={mainChartGeometry.margin.left - 12}
                        y={mainChartGeometry.yScale(tick)}
                        textAnchor="end"
                        dominantBaseline="middle"
                        className="fill-gray-500 text-xs"
                      >
                        {tick}
                      </text>
                    </g>
                  ))}
                  {mainChartGeometry.xTicks.map((tick) => (
                    <g key={`x-${tick.toISOString()}`}>
                      <line
                        x1={mainChartGeometry.xScale(tick)}
                        x2={mainChartGeometry.xScale(tick)}
                        y1={mainChartGeometry.margin.top}
                        y2={
                          mainChartGeometry.height -
                          mainChartGeometry.margin.bottom
                        }
                        stroke="#f3f4f6"
                      />
                      <text
                        x={mainChartGeometry.xScale(tick)}
                        y={
                          mainChartGeometry.height -
                          mainChartGeometry.margin.bottom +
                          24
                        }
                        textAnchor="middle"
                        className="fill-gray-600 text-xs"
                      >
                        {dateFormatter.format(tick)}
                      </text>
                    </g>
                  ))}
                </g>
                {mainChartGeometry.lines.map(({ metric, path }) => (
                  <path
                    key={metric.key}
                    d={path}
                    fill="none"
                    stroke={metric.color}
                    strokeWidth={2.4}
                  />
                ))}
                {activeDay && (
                  <>
                    <line
                      x1={mainChartGeometry.xScale(activeDay.parsedDate)}
                      x2={mainChartGeometry.xScale(activeDay.parsedDate)}
                      y1={mainChartGeometry.margin.top}
                      y2={
                        mainChartGeometry.height -
                        mainChartGeometry.margin.bottom
                      }
                      stroke="#6b7280"
                      strokeWidth={1}
                      strokeDasharray="4 4"
                    />
                    {mainChartGeometry.metrics.map((metric) => (
                      <circle
                        key={`point-${metric.key}`}
                        cx={mainChartGeometry.xScale(activeDay.parsedDate)}
                        cy={mainChartGeometry.yScale(
                          activeDay[metric.key] ?? 0
                        )}
                        r={4}
                        fill="white"
                        stroke={metric.color}
                        strokeWidth={2}
                      />
                    ))}
                    <rect
                      x={Math.min(
                        mainChartGeometry.xScale(activeDay.parsedDate) + 12,
                        mainChartGeometry.width - 210
                      )}
                      y={mainChartGeometry.margin.top + 12}
                      width={196}
                      height={mainChartGeometry.metrics.length * 24 + 42}
                      rx={10}
                      fill="white"
                      stroke="#e5e7eb"
                      className="shadow-lg"
                    />
                    <text
                      x={Math.min(
                        mainChartGeometry.xScale(activeDay.parsedDate) + 24,
                        mainChartGeometry.width - 196
                      )}
                      y={mainChartGeometry.margin.top + 32}
                      className="fill-gray-900 text-sm font-semibold"
                    >
                      {fullDateFormatter.format(activeDay.parsedDate)}
                    </text>
                    {mainChartGeometry.metrics.map((metric, idx) => (
                      <g
                        key={`label-${metric.key}`}
                        transform={`translate(${Math.min(
                          mainChartGeometry.xScale(activeDay.parsedDate) + 24,
                          mainChartGeometry.width - 196
                        )}, ${mainChartGeometry.margin.top + 52 + idx * 24})`}
                      >
                        <rect
                          x={0}
                          y={-10}
                          width={12}
                          height={12}
                          rx={3}
                          fill={metric.color}
                        />
                        <text x={16} y={0} className="fill-gray-700 text-xs">
                          {metric.label}
                        </text>
                        <text
                          x={164}
                          y={0}
                          textAnchor="end"
                          className="fill-gray-900 text-xs font-semibold"
                        >
                          {activeDay[metric.key] ?? 0}
                        </text>
                      </g>
                    ))}
                  </>
                )}
              </svg>
            </div>
          </div>
          {actionsChartGeometry && (
            <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="relative p-4">
                <svg
                  ref={actionsSvgRef}
                  viewBox={`0 0 ${actionsChartGeometry.width} ${actionsChartGeometry.height}`}
                  className="w-full"
                  onMouseMove={handleActionsHover}
                  onMouseLeave={() =>
                    setHoveredActionsDay(parsedStats[parsedStats.length - 1])
                  }
                >
                  <g>
                    {actionsChartGeometry.yTicks.map((tick) => (
                      <g key={`y-${tick}`}>
                        <line
                          x1={actionsChartGeometry.margin.left}
                          x2={
                            actionsChartGeometry.width -
                            actionsChartGeometry.margin.right
                          }
                          y1={actionsChartGeometry.yScale(tick)}
                          y2={actionsChartGeometry.yScale(tick)}
                          stroke="#e5e7eb"
                          strokeDasharray="4 6"
                        />
                        <text
                          x={actionsChartGeometry.margin.left - 12}
                          y={actionsChartGeometry.yScale(tick)}
                          textAnchor="end"
                          dominantBaseline="middle"
                          className="fill-gray-500 text-xs"
                        >
                          {tick}
                        </text>
                      </g>
                    ))}
                    {actionsChartGeometry.xTicks.map((tick) => (
                      <g key={`x-${tick.toISOString()}`}>
                        <line
                          x1={actionsChartGeometry.xScale(tick)}
                          x2={actionsChartGeometry.xScale(tick)}
                          y1={actionsChartGeometry.margin.top}
                          y2={
                            actionsChartGeometry.height -
                            actionsChartGeometry.margin.bottom
                          }
                          stroke="#f3f4f6"
                        />
                        <text
                          x={actionsChartGeometry.xScale(tick)}
                          y={
                            actionsChartGeometry.height -
                            actionsChartGeometry.margin.bottom +
                            24
                          }
                          textAnchor="middle"
                          className="fill-gray-600 text-xs"
                        >
                          {dateFormatter.format(tick)}
                        </text>
                      </g>
                    ))}
                  </g>
                  <path
                    d={actionsChartGeometry.areaPath}
                    fill="rgba(8,145,178,0.12)"
                    stroke="none"
                  />
                  {actionsChartGeometry.lines.map(({ metric, path }) => (
                    <path
                      key={metric.key}
                      d={path}
                      fill="none"
                      stroke={metric.color}
                      strokeWidth={2.4}
                    />
                  ))}
                  {activeActionsDay && (
                    <>
                      <line
                        x1={actionsChartGeometry.xScale(
                          activeActionsDay.parsedDate
                        )}
                        x2={actionsChartGeometry.xScale(
                          activeActionsDay.parsedDate
                        )}
                        y1={actionsChartGeometry.margin.top}
                        y2={
                          actionsChartGeometry.height -
                          actionsChartGeometry.margin.bottom
                        }
                        stroke="#6b7280"
                        strokeWidth={1}
                        strokeDasharray="4 4"
                      />
                      {actionsChartGeometry.metrics.map((metric) => (
                        <circle
                          key={`point-actions-${metric.key}`}
                          cx={actionsChartGeometry.xScale(
                            activeActionsDay.parsedDate
                          )}
                          cy={actionsChartGeometry.yScale(
                            activeActionsDay[metric.key] ?? 0
                          )}
                          r={4}
                          fill="white"
                          stroke={metric.color}
                          strokeWidth={2}
                        />
                      ))}
                      <rect
                        x={Math.min(
                          actionsChartGeometry.xScale(
                            activeActionsDay.parsedDate
                          ) + 12,
                          actionsChartGeometry.width - 210
                        )}
                        y={actionsChartGeometry.margin.top + 12}
                        width={196}
                        height={actionsChartGeometry.metrics.length * 24 + 42}
                        rx={10}
                        fill="white"
                        stroke="#e5e7eb"
                        className="shadow-lg"
                      />
                      <text
                        x={Math.min(
                          actionsChartGeometry.xScale(
                            activeActionsDay.parsedDate
                          ) + 24,
                          actionsChartGeometry.width - 196
                        )}
                        y={actionsChartGeometry.margin.top + 32}
                        className="fill-gray-900 text-sm font-semibold"
                      >
                        {fullDateFormatter.format(activeActionsDay.parsedDate)}
                      </text>
                      {actionsChartGeometry.metrics.map((metric, idx) => (
                        <g
                          key={`label-actions-${metric.key}`}
                          transform={`translate(${Math.min(
                            actionsChartGeometry.xScale(
                              activeActionsDay.parsedDate
                            ) + 24,
                            actionsChartGeometry.width - 196
                          )}, ${
                            actionsChartGeometry.margin.top + 52 + idx * 24
                          })`}
                        >
                          <rect
                            x={0}
                            y={-10}
                            width={12}
                            height={12}
                            rx={3}
                            fill={metric.color}
                          />
                          <text x={16} y={0} className="fill-gray-700 text-xs">
                            {metric.label}
                          </text>
                          <text
                            x={164}
                            y={0}
                            textAnchor="end"
                            className="fill-gray-900 text-xs font-semibold"
                          >
                            {activeActionsDay[metric.key] ?? 0}
                          </text>
                        </g>
                      ))}
                    </>
                  )}
                </svg>
              </div>
            </div>
          )}
        </>
      )}

      <div className="overflow-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr className="text-gray-600">
              <th className="px-4 py-3 text-left font-semibold">Date</th>
              <th className="px-4 py-3 text-left font-semibold">
                Actions completed
              </th>
              <th className="px-4 py-3 text-left font-semibold">
                Anon forms
              </th>
              <th className="px-4 py-3 text-left font-semibold">
                Members signed
              </th>
              <th className="px-4 py-3 text-left font-semibold">
                Invites created
              </th>
              <th className="px-4 py-3 text-left font-semibold">
                Invites accepted
              </th>
              <th className="px-4 py-3 text-left font-semibold">Suspended</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {[...parsedStats].reverse().map((day) => (
              <tr
                key={day.dayId}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                  {fullDateFormatter.format(day.parsedDate)}
                </td>
                <td className="px-4 py-3">{day.actionsCompleted}</td>
                <td className="px-4 py-3">{day.anonFormSubmissions}</td>
                <td className="px-4 py-3">{day.signedMembers}</td>
                <td className="px-4 py-3">{day.invitesCreated}</td>
                <td className="px-4 py-3">{day.invitesAccepted}</td>
                <td className="px-4 py-3">{day.suspendedMembers}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StatsPage;
