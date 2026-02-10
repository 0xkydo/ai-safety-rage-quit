"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { COMPANY_COLORS, COMPANY_LABELS } from "@/lib/constants";
import type { Company } from "@/types";

type CompanyData = {
  company: Company;
  count: number;
  avgScore: number;
};

type CompanyBreakdownProps = {
  data: CompanyData[];
};

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: CompanyData }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-bg-secondary border border-border-primary rounded-sm p-3 text-xs">
      <div className="text-text-primary font-medium">
        {COMPANY_LABELS[d.company]}
      </div>
      <div className="text-text-muted">Departures: {d.count}</div>
      <div className="text-neon-green">Avg Score: {d.avgScore.toFixed(1)}</div>
    </div>
  );
}

export function CompanyBreakdown({ data }: CompanyBreakdownProps) {
  const chartData = data.map((d) => ({
    ...d,
    name: COMPANY_LABELS[d.company],
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
        <XAxis
          dataKey="name"
          tick={{ fill: "#888888", fontSize: 10 }}
          stroke="#222222"
        />
        <YAxis
          tick={{ fill: "#888888", fontSize: 10 }}
          stroke="#222222"
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
        <Bar dataKey="count" radius={[2, 2, 0, 0]}>
          {chartData.map((entry, idx) => (
            <Cell
              key={idx}
              fill={COMPANY_COLORS[entry.company]}
              fillOpacity={0.8}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
