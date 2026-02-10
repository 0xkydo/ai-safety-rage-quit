"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { COMPANY_COLORS, COMPANY_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { Company } from "@/types";
import { useRouter } from "next/navigation";

type TimelineEntry = {
  id: string;
  personName: string;
  company: Company;
  departureDate: string;
  publicityScore: number;
};

type TimelineChartProps = {
  departures: TimelineEntry[];
};

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: TimelineEntry }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-bg-secondary border border-border-primary rounded-sm p-3 text-xs">
      <div className="text-text-primary font-medium">{d.personName}</div>
      <div className="text-text-muted">
        {COMPANY_LABELS[d.company]}
      </div>
      <div className="text-text-muted">{formatDate(d.departureDate)}</div>
      <div className="text-neon-green mt-1">Score: {d.publicityScore.toFixed(1)}</div>
    </div>
  );
}

export function TimelineChart({ departures }: TimelineChartProps) {
  const router = useRouter();

  const data = departures.map((d) => ({
    ...d,
    x: new Date(d.departureDate).getTime(),
    y: d.publicityScore,
    size: Math.max(40, d.publicityScore * 3),
  }));

  return (
    <ResponsiveContainer width="100%" height={500}>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
        <XAxis
          dataKey="x"
          type="number"
          domain={["dataMin", "dataMax"]}
          tickFormatter={(v) => {
            const d = new Date(v);
            return `${d.getFullYear()}`;
          }}
          tick={{ fill: "#888888", fontSize: 10 }}
          stroke="#222222"
        />
        <YAxis
          dataKey="y"
          type="number"
          domain={[0, 100]}
          tick={{ fill: "#888888", fontSize: 10 }}
          stroke="#222222"
          label={{
            value: "Publicity Score",
            angle: -90,
            position: "insideLeft",
            fill: "#555555",
            fontSize: 10,
          }}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: "#333333" }}
        />
        <Scatter
          data={data}
          onClick={(entry) => {
            if (entry?.id) router.push(`/departures/${entry.id}`);
          }}
          cursor="pointer"
        >
          {data.map((entry, idx) => (
            <Cell
              key={idx}
              fill={COMPANY_COLORS[entry.company]}
              fillOpacity={0.7}
              r={Math.max(4, entry.publicityScore / 10)}
            />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}
