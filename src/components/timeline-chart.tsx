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
};

type NvdaDataPoint = {
  timestamp: number;
  dateLabel: string;
  nvda: number | null;
};

type DepartureScatterPoint = {
  id: string;
  personName: string;
  company: Company;
  departureDate: string;
  publicityScore: number;
  timestamp: number;
  y: number;
};

type TimelineChartProps = {
  departures: TimelineEntry[];
};

// --- Constants ---

const NVDA_COLOR = "#76B900";
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
  payload: NvdaDataPoint | DepartureScatterPoint;
};

function isDeparturePayload(
  payload: NvdaDataPoint | DepartureScatterPoint
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

  // NVDA tooltip
  if (label == null) return null;
  const nvdaEntry = payload.find((entry) => entry.dataKey === "nvda");
  if (!nvdaEntry || nvdaEntry.value == null) return null;

  return (
    <div className="bg-bg-secondary border border-border-primary rounded-sm p-3 text-xs min-w-[160px]">
      <div className="text-text-primary font-medium mb-1">
        {formatTimestamp(label)}
      </div>
      <div className="flex items-center justify-between gap-4">
        <span style={{ color: NVDA_COLOR }}>NVDA</span>
        <span className="text-text-primary">
          {nvdaEntry.value.toFixed(0)}% of Jan 2020
        </span>
      </div>
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

  // Normalize NVDA to index=100 at first data point
  const normalizedNvda = useMemo(
    () => (stockData ? normalizeStockData(stockData.nvda) : []),
    [stockData]
  );

  // Build chart data from NVDA only
  const chartData: NvdaDataPoint[] = useMemo(() => {
    return normalizedNvda.map((point) => ({
      timestamp: point.timestamp,
      dateLabel: point.date,
      nvda: point.normalized,
    }));
  }, [normalizedNvda]);

  // Max normalized value for right Y axis domain
  const maxNormalized = useMemo(() => {
    let max = 100;
    for (const point of chartData) {
      if (point.nvda != null && point.nvda > max) max = point.nvda;
    }
    return Math.ceil(max / 100) * 100;
  }, [chartData]);

  // Departure scatter points
  const departurePoints: DepartureScatterPoint[] = useMemo(
    () =>
      departures.map((d) => ({
        ...d,
        timestamp: new Date(d.departureDate).getTime(),
        y: d.publicityScore,
      })),
    [departures]
  );

  // X axis domain
  const xDomain: [number, number] = useMemo(() => {
    const allTimestamps = [
      ...chartData.map((d) => d.timestamp),
      ...departurePoints.map((d) => d.timestamp),
    ];
    if (allTimestamps.length === 0) return [0, 1];
    return [Math.min(...allTimestamps), Math.max(...allTimestamps)];
  }, [chartData, departurePoints]);

  const handleScatterClick = useCallback(
    (entry: DepartureScatterPoint) => {
      if (entry?.id) router.push(`/departures/${entry.id}`);
    },
    [router]
  );

  // Legend entries
  const legendEntries: LegendEntry[] = useMemo(() => {
    const entries: LegendEntry[] = [
      { color: NVDA_COLOR, label: "NVDA (indexed to 100)", type: "line" },
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
          Failed to load stock data.
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
            data={chartData}
          >
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

            {/* Left Y Axis - Publicity Score */}
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

            {/* Right Y Axis - NVDA normalized */}
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, maxNormalized]}
              tick={{ fill: TICK_COLOR, fontSize: TICK_FONT_SIZE }}
              stroke={GRID_COLOR}
              label={{
                value: "NVDA (100 = Jan 2020)",
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

            <Legend content={() => null} />
          </ComposedChart>
        </ResponsiveContainer>

        <ChartLegend entries={legendEntries} />
      </div>
    </div>
  );
}
