import { analyticsGetDailyStats } from "@alliance/shared/client";
import { DailyStatsRecord } from "@alliance/shared/client/types.gen";
import Card, { CardStyle } from "@alliance/shared/ui/Card";
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

const getDefaultRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 29);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
};

const formatNumber = (value: number) =>
  value.toLocaleString("en-US", { maximumFractionDigits: 0 });

const StatsPage: React.FC = () => {
  const defaultRange = useMemo(() => getDefaultRange(), []);
  const [startInput, setStartInput] = useState<string>(defaultRange.start);
  const [endInput, setEndInput] = useState<string>(defaultRange.end);
  const [queryRange, setQueryRange] = useState(defaultRange);
  const [stats, setStats] = useState<DailyStatsRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredDay, setHoveredDay] = useState<ParsedDailyStats | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);

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
      return;
    }
    setHoveredDay(parsedStats[parsedStats.length - 1]);
  }, [parsedStats]);

  const chartGeometry = useMemo(() => {
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
      d3.max(metricDefinitions, (metric) =>
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

    const area = d3
      .area<ParsedDailyStats>()
      .x((d) => xScale(d.parsedDate))
      .y0(height - margin.bottom)
      .y1((d) => yScale(d.actionsCompleted ?? 0))
      .curve(d3.curveMonotoneX);

    const lines = metricDefinitions.map((metric) => {
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

    return {
      width,
      height,
      margin,
      xScale,
      yScale,
      xTicks,
      yTicks,
      lines,
      areaPath: area(parsedStats) ?? "",
      bisectDate,
    };
  }, [parsedStats]);

  const totals = useMemo(() => {
    return parsedStats.reduce((acc, record) => {
      metricDefinitions.forEach((metric) => {
        acc[metric.key] = (acc[metric.key] ?? 0) + (record[metric.key] ?? 0);
      });
      return acc;
    }, {} as Record<MetricKey, number>);
  }, [parsedStats]);

  const activeDay = hoveredDay ?? parsedStats[parsedStats.length - 1];
  const previousDay =
    parsedStats.length > 1 ? parsedStats[parsedStats.length - 2] : undefined;

  const handleApplyRange = useCallback(() => {
    setQueryRange({ start: startInput, end: endInput });
  }, [endInput, startInput]);

  const handleQuickRange = useCallback((days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (days - 1));
    const startValue = start.toISOString().slice(0, 10);
    const endValue = end.toISOString().slice(0, 10);
    setStartInput(startValue);
    setEndInput(endValue);
    setQueryRange({ start: startValue, end: endValue });
  }, []);

  const handleHover = useCallback(
    (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
      if (!chartGeometry || parsedStats.length === 0 || !svgRef.current) {
        return;
      }

      const rect = svgRef.current.getBoundingClientRect();
      const relativeX = event.clientX - rect.left;
      const relativeY = event.clientY - rect.top;
      if (relativeX < 0 || relativeY < 0) {
        return;
      }

      const scaleX = chartGeometry.width / rect.width;
      const pointerX = relativeX * scaleX;

      const hoveredDate = chartGeometry.xScale.invert(pointerX);
      const index = chartGeometry.bisectDate(parsedStats, hoveredDate);
      const clampedIndex = Math.max(0, Math.min(parsedStats.length - 1, index));

      setHoveredDay(parsedStats[clampedIndex]);
    },
    [chartGeometry, parsedStats]
  );

  return (
    <div className="p-6 md:p-8 space-y-6 text-gray-900">
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
              className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
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
              className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
            />
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
          <button
            onClick={handleApplyRange}
            className="px-4 py-2 rounded-md text-sm bg-green-600 text-white shadow hover:bg-green-500"
          >
            Update
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
      {!loading && parsedStats.length > 0 && chartGeometry && (
        <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-inner">
          <div className="relative p-4">
            <div className="flex flex-wrap items-center gap-4 pb-4">
              {metricDefinitions.map((metric) => {
                const currentValue = activeDay?.[metric.key] ?? 0;
                const previousValue = previousDay?.[metric.key] ?? null;
                const delta =
                  previousValue === null ? null : currentValue - previousValue;
                return (
                  <div
                    key={metric.key}
                    className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm"
                  >
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: metric.color }}
                    />
                    <div className="flex flex-col leading-tight">
                      <span className="text-xs text-gray-600">
                        {metric.label}
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-lg">
                          {formatNumber(currentValue)}
                        </span>
                        {delta !== null && (
                          <span
                            className={`text-xs ${
                              delta > 0
                                ? "text-green-600"
                                : delta < 0
                                ? "text-red-500"
                                : "text-gray-500"
                            }`}
                          >
                            {delta > 0 ? "+" : ""}
                            {delta}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <svg
              ref={svgRef}
              viewBox={`0 0 ${chartGeometry.width} ${chartGeometry.height}`}
              className="w-full h-[380px]"
              onMouseMove={handleHover}
              onMouseLeave={() =>
                setHoveredDay(parsedStats[parsedStats.length - 1])
              }
            >
              <g>
                {chartGeometry.yTicks.map((tick) => (
                  <g key={`y-${tick}`}>
                    <line
                      x1={chartGeometry.margin.left}
                      x2={chartGeometry.width - chartGeometry.margin.right}
                      y1={chartGeometry.yScale(tick)}
                      y2={chartGeometry.yScale(tick)}
                      stroke="#e5e7eb"
                      strokeDasharray="4 6"
                    />
                    <text
                      x={chartGeometry.margin.left - 12}
                      y={chartGeometry.yScale(tick)}
                      textAnchor="end"
                      dominantBaseline="middle"
                      className="fill-gray-500 text-xs"
                    >
                      {tick}
                    </text>
                  </g>
                ))}
                {chartGeometry.xTicks.map((tick) => (
                  <g key={`x-${tick.toISOString()}`}>
                    <line
                      x1={chartGeometry.xScale(tick)}
                      x2={chartGeometry.xScale(tick)}
                      y1={chartGeometry.margin.top}
                      y2={chartGeometry.height - chartGeometry.margin.bottom}
                      stroke="#f3f4f6"
                    />
                    <text
                      x={chartGeometry.xScale(tick)}
                      y={
                        chartGeometry.height - chartGeometry.margin.bottom + 24
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
                d={chartGeometry.areaPath}
                fill="rgba(8,145,178,0.12)"
                stroke="none"
              />
              {chartGeometry.lines.map(({ metric, path }) => (
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
                    x1={chartGeometry.xScale(activeDay.parsedDate)}
                    x2={chartGeometry.xScale(activeDay.parsedDate)}
                    y1={chartGeometry.margin.top}
                    y2={chartGeometry.height - chartGeometry.margin.bottom}
                    stroke="#6b7280"
                    strokeWidth={1}
                    strokeDasharray="4 4"
                  />
                  {metricDefinitions.map((metric) => (
                    <circle
                      key={`point-${metric.key}`}
                      cx={chartGeometry.xScale(activeDay.parsedDate)}
                      cy={chartGeometry.yScale(activeDay[metric.key] ?? 0)}
                      r={4}
                      fill="white"
                      stroke={metric.color}
                      strokeWidth={2}
                    />
                  ))}
                  <rect
                    x={Math.min(
                      chartGeometry.xScale(activeDay.parsedDate) + 12,
                      chartGeometry.width - 210
                    )}
                    y={chartGeometry.margin.top + 12}
                    width={196}
                    height={metricDefinitions.length * 24 + 42}
                    rx={10}
                    fill="white"
                    stroke="#e5e7eb"
                    className="shadow-lg"
                  />
                  <text
                    x={Math.min(
                      chartGeometry.xScale(activeDay.parsedDate) + 24,
                      chartGeometry.width - 196
                    )}
                    y={chartGeometry.margin.top + 32}
                    className="fill-gray-900 text-sm font-semibold"
                  >
                    {fullDateFormatter.format(activeDay.parsedDate)}
                  </text>
                  {metricDefinitions.map((metric, idx) => (
                    <g
                      key={`label-${metric.key}`}
                      transform={`translate(${Math.min(
                        chartGeometry.xScale(activeDay.parsedDate) + 24,
                        chartGeometry.width - 196
                      )}, ${chartGeometry.margin.top + 52 + idx * 24})`}
                    >
                      <rect
                        x={-6}
                        y={-10}
                        width={12}
                        height={12}
                        rx={3}
                        fill={metric.color}
                      />
                      <text x={10} y={0} className="fill-gray-700 text-xs">
                        {metric.label}
                      </text>
                      <text
                        x={148}
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
      )}

      <div className="grid md:grid-cols-3 gap-4">
        {metricDefinitions.slice(0, 3).map((metric) => {
          const average =
            parsedStats.length === 0
              ? 0
              : Math.round((totals[metric.key] ?? 0) / parsedStats.length);
          const latestValue = activeDay?.[metric.key] ?? 0;
          return (
            <Card
              key={metric.key}
              className="gap-2 relative overflow-hidden"
              style={CardStyle.White}
            >
              <p className="text-sm text-gray-500">{metric.label}</p>
              <h2 className="text-3xl font-semibold">
                {formatNumber(latestValue)}
              </h2>
              <p className="text-sm text-gray-600">
                Avg/day:{" "}
                <span className="font-semibold text-gray-800">
                  {formatNumber(average)}
                </span>{" "}
                • Total window:{" "}
                <span className="font-semibold text-gray-800">
                  {formatNumber(totals[metric.key] ?? 0)}
                </span>
              </p>
            </Card>
          );
        })}
      </div>

      <Card className="gap-4" style={CardStyle.White}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
              Table log
            </p>
            <h2 className="text-xl font-semibold">Daily breakdown</h2>
          </div>
          <div className="text-sm text-gray-600">
            Range: {queryRange.start} → {queryRange.end}
          </div>
        </div>
        <div className="overflow-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr className="text-gray-600">
                <th className="px-4 py-3 text-left font-semibold">Date</th>
                <th className="px-4 py-3 text-left font-semibold">
                  Actions completed
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
                  <td className="px-4 py-3">{day.signedMembers}</td>
                  <td className="px-4 py-3">{day.invitesCreated}</td>
                  <td className="px-4 py-3">{day.invitesAccepted}</td>
                  <td className="px-4 py-3">{day.suspendedMembers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default StatsPage;
