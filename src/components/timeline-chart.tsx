"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import { COMPANY_COLORS, COMPANY_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { Company } from "@/types";
import { useRouter } from "next/navigation";

// --- Types ---

type TimelineEntry = {
  id: string;
  personName: string;
  company: Company;
  departureDate: string;
  publicityScore: number;
};

type StockDataPoint = {
  date: string;
  close: number;
};

type StockData = {
  nvda: StockDataPoint[];
  gspc: StockDataPoint[];
};

type MergedDataPoint = {
  timestamp: number;
  dateLabel: string;
  nvda: number | null;
  gspc: number | null;
};

type DepartureScatterPoint = {
  id: string;
  personName: string;
  company: Company;
  departureDate: string;
  publicityScore: number;
  timestamp: number;
  y: number;
  size: number;
};

type TimelineChartProps = {
  departures: TimelineEntry[];
};

// --- Constants ---

const NVDA_COLOR = "#76B900";
const SP500_COLOR = "#FF6B6B";
const GRID_COLOR = "#222222";
const TICK_COLOR = "#888888";
const TICK_FONT_SIZE = 10;

// --- Helpers ---

function normalizeStockData(
  data: StockDataPoint[]
): { date: string; timestamp: number; normalized: number }[] {
  if (data.length === 0) return [];
  const base = data[0].close;
  return data.map((d) => ({
    date: d.date,
    timestamp: new Date(d.date).getTime(),
    normalized: (d.close / base) * 100,
  }));
}

function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

// --- Tooltip ---

type TooltipPayloadItem = {
  dataKey: string;
  value: number;
  color: string;
  name: string;
  payload: MergedDataPoint | DepartureScatterPoint;
};

function isDeparturePayload(
  payload: MergedDataPoint | DepartureScatterPoint
): payload is DepartureScatterPoint {
  return "personName" in payload;
}

function UnifiedTooltipContent({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: number;
}) {
  if (!active || !payload?.length) return null;

  // Check if the first payload item is a departure scatter point
  const firstPayload = payload[0].payload;
  if (isDeparturePayload(firstPayload)) {
    return (
      <div className="bg-bg-secondary border border-border-primary rounded-sm p-3 text-xs min-w-[180px]">
        <div className="text-text-primary font-medium">
          {firstPayload.personName}
        </div>
        <div className="text-text-muted">
          {COMPANY_LABELS[firstPayload.company]}
        </div>
        <div className="text-text-muted">
          {formatDate(firstPayload.departureDate)}
        </div>
        <div className="text-neon-green mt-1">
          Publicity Score: {firstPayload.publicityScore.toFixed(1)}
        </div>
      </div>
    );
  }

  // Stock data tooltip
  if (label == null) return null;

  // Filter to only stock line entries (not scatter)
  const stockEntries = payload.filter(
    (entry) => entry.dataKey === "nvda" || entry.dataKey === "gspc"
  );
  if (stockEntries.length === 0) return null;

  return (
    <div className="bg-bg-secondary border border-border-primary rounded-sm p-3 text-xs min-w-[160px]">
      <div className="text-text-primary font-medium mb-2">
        {formatTimestamp(label)}
      </div>
      {stockEntries.map((entry) => {
        if (entry.value == null) return null;
        const labelText =
          entry.dataKey === "nvda" ? "NVDA" : "S&P 500";
        return (
          <div
            key={entry.dataKey}
            className="flex items-center justify-between gap-4"
          >
            <span style={{ color: entry.color }}>{labelText}</span>
            <span className="text-text-primary">
              {entry.value.toFixed(1)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// --- Custom Legend ---

type LegendEntry = {
  color: string;
  label: string;
  type: "line" | "dot";
};

function ChartLegend({ entries }: { entries: LegendEntry[] }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-3">
      {entries.map((entry) => (
        <div key={entry.label} className="flex items-center gap-2">
          {entry.type === "line" ? (
            <div
              className="w-5 h-[2px]"
              style={{ backgroundColor: entry.color }}
            />
          ) : (
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
          )}
          <span className="text-xs text-text-secondary">{entry.label}</span>
        </div>
      ))}
    </div>
  );
}

// --- Main Component ---

export function TimelineChart({ departures }: TimelineChartProps) {
  const router = useRouter();
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [stockError, setStockError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/stock-data.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<StockData>;
      })
      .then((data) => {
        if (!cancelled) setStockData(data);
      })
      .catch(() => {
        if (!cancelled) setStockError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Normalize stock data to index=100 at first data point
  const normalizedNvda = useMemo(
    () => (stockData ? normalizeStockData(stockData.nvda) : []),
    [stockData]
  );
  const normalizedGspc = useMemo(
    () => (stockData ? normalizeStockData(stockData.gspc) : []),
    [stockData]
  );

  // Merge stock data into a single array keyed by timestamp
  const mergedStockData: MergedDataPoint[] = useMemo(() => {
    const map = new Map<
      number,
      { nvda: number | null; gspc: number | null; dateLabel: string }
    >();

    for (const point of normalizedNvda) {
      const existing = map.get(point.timestamp);
      if (existing) {
        existing.nvda = point.normalized;
      } else {
        map.set(point.timestamp, {
          nvda: point.normalized,
          gspc: null,
          dateLabel: point.date,
        });
      }
    }

    for (const point of normalizedGspc) {
      const existing = map.get(point.timestamp);
      if (existing) {
        existing.gspc = point.normalized;
      } else {
        map.set(point.timestamp, {
          nvda: null,
          gspc: point.normalized,
          dateLabel: point.date,
        });
      }
    }

    return Array.from(map.entries())
      .sort(([a], [b]) => a - b)
      .map(([timestamp, values]) => ({
        timestamp,
        dateLabel: values.dateLabel,
        nvda: values.nvda,
        gspc: values.gspc,
      }));
  }, [normalizedNvda, normalizedGspc]);

  // Max normalized value for right Y axis domain
  const maxNormalized = useMemo(() => {
    let max = 100;
    for (const point of mergedStockData) {
      if (point.nvda != null && point.nvda > max) max = point.nvda;
      if (point.gspc != null && point.gspc > max) max = point.gspc;
    }
    return Math.ceil(max / 100) * 100; // round up to nearest 100
  }, [mergedStockData]);

  // Departure scatter points
  const departurePoints: DepartureScatterPoint[] = useMemo(
    () =>
      departures.map((d) => ({
        ...d,
        timestamp: new Date(d.departureDate).getTime(),
        y: d.publicityScore,
        size: Math.max(60, d.publicityScore * 4),
      })),
    [departures]
  );

  // X axis domain: union of stock + departure timestamps
  const xDomain: [number, number] = useMemo(() => {
    const allTimestamps = [
      ...mergedStockData.map((d) => d.timestamp),
      ...departurePoints.map((d) => d.timestamp),
    ];
    if (allTimestamps.length === 0) return [0, 1];
    return [Math.min(...allTimestamps), Math.max(...allTimestamps)];
  }, [mergedStockData, departurePoints]);

  const handleScatterClick = useCallback(
    (entry: DepartureScatterPoint) => {
      if (entry?.id) router.push(`/departures/${entry.id}`);
    },
    [router]
  );

  // Legend entries
  const legendEntries: LegendEntry[] = useMemo(() => {
    const entries: LegendEntry[] = [
      { color: NVDA_COLOR, label: "NVDA (normalized)", type: "line" },
      { color: SP500_COLOR, label: "S&P 500 (normalized)", type: "line" },
    ];
    const companySet = new Set(departures.map((d) => d.company));
    for (const company of companySet) {
      entries.push({
        color: COMPANY_COLORS[company],
        label: COMPANY_LABELS[company],
        type: "dot",
      });
    }
    return entries;
  }, [departures]);

  if (stockError) {
    return (
      <div className="h-[500px] flex items-center justify-center">
        <p className="text-text-muted text-xs">
          Failed to load stock data. Showing departures only.
        </p>
      </div>
    );
  }

  const isLoading = !stockData;

  return (
    <div>
      {isLoading && (
        <div className="h-[500px] flex items-center justify-center">
          <p className="text-text-muted text-xs animate-pulse">
            Loading stock data...
          </p>
        </div>
      )}
      <div style={{ opacity: isLoading ? 0 : 1, transition: "opacity 300ms ease-out" }}>
        <ResponsiveContainer width="100%" height={500}>
          <ComposedChart
            margin={{ top: 20, right: 60, bottom: 20, left: 60 }}
            data={mergedStockData}
          >
            {/* X Axis - shared timeline */}
            <XAxis
              dataKey="timestamp"
              type="number"
              scale="time"
              domain={xDomain}
              tickFormatter={formatTimestamp}
              tick={{ fill: TICK_COLOR, fontSize: TICK_FONT_SIZE }}
              stroke={GRID_COLOR}
              allowDuplicatedCategory={false}
            />

            {/* Left Y Axis - Publicity Score (departures) */}
            <YAxis
              yAxisId="left"
              orientation="left"
              domain={[0, 100]}
              tick={{ fill: TICK_COLOR, fontSize: TICK_FONT_SIZE }}
              stroke={GRID_COLOR}
              label={{
                value: "Publicity Score",
                angle: -90,
                position: "insideLeft",
                fill: "#555555",
                fontSize: 10,
                offset: -10,
              }}
            />

            {/* Right Y Axis - Normalized stock price */}
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, maxNormalized]}
              tick={{ fill: TICK_COLOR, fontSize: TICK_FONT_SIZE }}
              stroke={GRID_COLOR}
              label={{
                value: "Stock Index (100 = Jan 2020)",
                angle: 90,
                position: "insideRight",
                fill: "#555555",
                fontSize: 10,
                offset: -10,
              }}
            />

            <Tooltip
              content={<UnifiedTooltipContent />}
              cursor={{ stroke: "#333333", strokeDasharray: "3 3" }}
            />

            {/* NVDA line */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="nvda"
              stroke={NVDA_COLOR}
              strokeWidth={2}
              dot={false}
              connectNulls
              name="NVDA"
              activeDot={{ r: 4, fill: NVDA_COLOR }}
            />

            {/* S&P 500 line */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="gspc"
              stroke={SP500_COLOR}
              strokeWidth={2}
              dot={false}
              connectNulls
              name="S&P 500"
              activeDot={{ r: 4, fill: SP500_COLOR }}
            />

            {/* Departure scatter points */}
            <Scatter
              yAxisId="left"
              data={departurePoints}
              dataKey="y"
              name="Departures"
              onClick={(entry: DepartureScatterPoint) =>
                handleScatterClick(entry)
              }
              cursor="pointer"
            >
              {departurePoints.map((entry, idx) => (
                <Cell
                  key={`departure-${entry.id}-${idx}`}
                  fill={COMPANY_COLORS[entry.company]}
                  fillOpacity={0.85}
                  r={Math.max(5, entry.publicityScore / 8)}
                />
              ))}
            </Scatter>

            {/* Hide default recharts legend, we render our own */}
            <Legend content={() => null} />
          </ComposedChart>
        </ResponsiveContainer>

        <ChartLegend entries={legendEntries} />
      </div>
    </div>
  );
}
