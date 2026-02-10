export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { DepartureTable } from "@/components/departure-table";
import { DepartureFilters } from "@/components/departure-filters";
import { TimelineChart } from "@/components/timeline-chart";
import { Card } from "@/components/ui/card";
import { TableSkeleton, Skeleton } from "@/components/ui/skeleton";
import { COMPANY_LABELS } from "@/lib/constants";
import type { Company, DepartureStatus, SortField, SortDirection } from "@/types";

type SearchParams = Promise<{
  company?: string;
  status?: string;
  sort?: string;
  direction?: string;
  search?: string;
}>;

type DepartureEntry = {
  id: string;
  personName: string;
  role: string;
  company: string;
  departureDate: Date;
  publicityScore: number;
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const company = params.company as Company | undefined;
  const status = params.status as DepartureStatus | undefined;
  const sort = (params.sort as SortField) || "date";
  const direction = (params.direction as SortDirection) || "desc";
  const search = params.search;

  const orderBy = (() => {
    switch (sort) {
      case "score":
        return { publicityScore: direction } as const;
      case "name":
        return { personName: direction } as const;
      case "date":
      default:
        return { departureDate: direction } as const;
    }
  })();

  const where = {
    ...(company && { company }),
    ...(status && { status }),
    ...(search && {
      OR: [
        { personName: { contains: search, mode: "insensitive" as const } },
        { role: { contains: search, mode: "insensitive" as const } },
        { summary: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const departures = await prisma.departure.findMany({
    where,
    orderBy,
    include: {
      tweets: true,
      newsArticles: true,
    },
  });

  // Stats data: all departures (unfiltered)
  const allDepartures: DepartureEntry[] = await prisma.departure.findMany({
    orderBy: { departureDate: "asc" },
    select: {
      id: true,
      personName: true,
      role: true,
      company: true,
      departureDate: true,
      publicityScore: true,
    },
  });

  const totalCount = allDepartures.length;

  // Company count
  const companySet = new Set(allDepartures.map((d) => d.company));

  // Average score
  const avgScore =
    totalCount > 0
      ? allDepartures.reduce((s: number, d: DepartureEntry) => s + d.publicityScore, 0) / totalCount
      : 0;

  // Peak month
  const monthMap = new Map<string, number>();
  for (const d of allDepartures) {
    const date = new Date(d.departureDate);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    monthMap.set(key, (monthMap.get(key) || 0) + 1);
  }
  const peakMonth =
    monthMap.size > 0
      ? Array.from(monthMap.entries()).reduce((max, m) =>
          m[1] > max[1] ? m : max
        )[0]
      : "N/A";

  // Timeline data (serialize dates)
  const timelineData = allDepartures.map((d: DepartureEntry) => ({
    id: d.id,
    personName: d.personName,
    company: d.company as Company,
    departureDate: new Date(d.departureDate).toISOString(),
    publicityScore: d.publicityScore,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-neon-green">
          AI SAFETY RAGE QUIT TRACKER
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Tracking AI safety researchers publicly leaving major AI labs
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <div className="text-[10px] text-text-muted uppercase tracking-wider">
            Total Departures
          </div>
          <div className="text-2xl font-bold text-neon-green mt-1">
            {totalCount}
          </div>
        </Card>
        <Card>
          <div className="text-[10px] text-text-muted uppercase tracking-wider">
            Companies
          </div>
          <div className="text-2xl font-bold text-amber mt-1">
            {companySet.size}
          </div>
          <div className="text-[10px] text-text-muted mt-1">
            {Array.from(companySet).map((c) => COMPANY_LABELS[c]).join(", ")}
          </div>
        </Card>
        <Card>
          <div className="text-[10px] text-text-muted uppercase tracking-wider">
            Avg Publicity Score
          </div>
          <div className="text-2xl font-bold text-text-primary mt-1">
            {avgScore.toFixed(1)}
          </div>
        </Card>
        <Card>
          <div className="text-[10px] text-text-muted uppercase tracking-wider">
            Peak Month
          </div>
          <div className="text-2xl font-bold text-text-primary mt-1">
            {peakMonth}
          </div>
        </Card>
      </div>

      {/* Timeline Chart */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs text-text-muted uppercase tracking-wider">
            Departure Timeline vs NVDA
          </h2>
        </div>
        <div className="border border-border-primary bg-bg-secondary rounded-sm p-4">
          <Suspense
            fallback={<Skeleton className="h-[500px] w-full" />}
          >
            <TimelineChart departures={timelineData} />
          </Suspense>
        </div>
      </div>

      {/* Departures Table */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h2 className="text-xs text-text-muted uppercase tracking-wider">
            All Departures ({departures.length})
          </h2>
          <Suspense fallback={null}>
            <DepartureFilters />
          </Suspense>
        </div>

        <Suspense fallback={<TableSkeleton />}>
          <DepartureTable departures={departures} />
        </Suspense>
      </div>
    </div>
  );
}
