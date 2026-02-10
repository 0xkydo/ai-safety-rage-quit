export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { CompanyBreakdown } from "@/components/company-breakdown";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { COMPANY_LABELS } from "@/lib/constants";
import { getScoreLabel } from "@/lib/utils";
import type { Company } from "@/types";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Stats - AI Safety Rage Quit Tracker",
  description: "Statistics on AI safety researcher departures",
};

type DepartureEntry = {
  id: string;
  personName: string;
  company: string;
  departureDate: Date;
  publicityScore: number;
  role: string;
};

export default async function StatsPage() {
  const departures: DepartureEntry[] = await prisma.departure.findMany({
    orderBy: { publicityScore: "desc" },
    select: {
      id: true,
      personName: true,
      company: true,
      departureDate: true,
      publicityScore: true,
      role: true,
    },
  });

  // Company breakdown
  const companyMap = new Map<string, { count: number; totalScore: number }>();
  for (const d of departures) {
    const existing = companyMap.get(d.company) || { count: 0, totalScore: 0 };
    companyMap.set(d.company, {
      count: existing.count + 1,
      totalScore: existing.totalScore + d.publicityScore,
    });
  }
  const companyData = Array.from(companyMap.entries()).map(
    ([company, data]) => ({
      company: company as Company,
      count: data.count,
      avgScore: data.count > 0 ? data.totalScore / data.count : 0,
    })
  );

  // Monthly frequency
  const monthMap = new Map<string, number>();
  for (const d of departures) {
    const date = new Date(d.departureDate);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    monthMap.set(key, (monthMap.get(key) || 0) + 1);
  }
  const monthlyData = Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }));

  // Leaderboard (top 10 by publicity score)
  const leaderboard = departures.slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-neon-green">STATISTICS</h1>
        <p className="text-xs text-text-muted mt-1">
          Aggregate data on AI safety departures
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <div className="text-[10px] text-text-muted uppercase tracking-wider">
            Total Departures
          </div>
          <div className="text-2xl font-bold text-neon-green mt-1">
            {departures.length}
          </div>
        </Card>
        <Card>
          <div className="text-[10px] text-text-muted uppercase tracking-wider">
            Companies
          </div>
          <div className="text-2xl font-bold text-amber mt-1">
            {companyMap.size}
          </div>
        </Card>
        <Card>
          <div className="text-[10px] text-text-muted uppercase tracking-wider">
            Avg Score
          </div>
          <div className="text-2xl font-bold text-text-primary mt-1">
            {departures.length > 0
              ? (
                  departures.reduce((s: number, d: { publicityScore: number }) => s + d.publicityScore, 0) /
                  departures.length
                ).toFixed(1)
              : "0"}
          </div>
        </Card>
        <Card>
          <div className="text-[10px] text-text-muted uppercase tracking-wider">
            Peak Month
          </div>
          <div className="text-2xl font-bold text-text-primary mt-1">
            {monthlyData.length > 0
              ? monthlyData.reduce((max, m) =>
                  m.count > max.count ? m : max
                ).month
              : "N/A"}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Breakdown */}
        <Card>
          <CardHeader>
            <span className="text-[10px] text-text-muted uppercase tracking-wider">
              Departures by Company
            </span>
          </CardHeader>
          <CompanyBreakdown data={companyData} />
        </Card>

        {/* Monthly Frequency */}
        <Card>
          <CardHeader>
            <span className="text-[10px] text-text-muted uppercase tracking-wider">
              Monthly Departures
            </span>
          </CardHeader>
          <div className="space-y-2">
            {monthlyData.map(({ month, count }) => (
              <div key={month} className="flex items-center gap-3">
                <span className="text-xs text-text-muted w-20 tabular-nums">
                  {month}
                </span>
                <div className="flex-1 h-3 bg-bg-tertiary rounded-sm overflow-hidden">
                  <div
                    className="h-full bg-neon-green/50 rounded-sm"
                    style={{
                      width: `${(count / Math.max(...monthlyData.map((m) => m.count))) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-text-secondary w-6 text-right tabular-nums">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <span className="text-[10px] text-text-muted uppercase tracking-wider">
            Publicity Leaderboard
          </span>
        </CardHeader>
        <div className="space-y-1">
          {leaderboard.map((d, idx) => {
            const label = getScoreLabel(d.publicityScore);
            return (
              <Link
                key={d.id}
                href={`/departures/${d.id}`}
                className="flex items-center gap-4 px-3 py-2 rounded-sm hover:bg-bg-tertiary/50 transition-colors duration-150"
              >
                <span className="text-xs text-text-muted w-6 text-right tabular-nums">
                  #{idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-text-primary">
                    {d.personName}
                  </span>
                  <span className="text-[10px] text-text-muted ml-2">
                    {COMPANY_LABELS[d.company]}
                  </span>
                </div>
                <Badge
                  variant={d.publicityScore > 60 ? "green" : d.publicityScore > 30 ? "amber" : "muted"}
                >
                  {label.label}
                </Badge>
                <span
                  className="text-sm font-bold tabular-nums w-12 text-right"
                  style={{ color: label.color }}
                >
                  {d.publicityScore.toFixed(1)}
                </span>
              </Link>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
