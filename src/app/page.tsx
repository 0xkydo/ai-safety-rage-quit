export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { DepartureTable } from "@/components/departure-table";
import { DepartureFilters } from "@/components/departure-filters";
import { TableSkeleton } from "@/components/ui/skeleton";
import type { Company, DepartureStatus, SortField, SortDirection } from "@/types";

type SearchParams = Promise<{
  company?: string;
  status?: string;
  sort?: string;
  direction?: string;
  search?: string;
}>;

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

  const totalCount = await prisma.departure.count();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-neon-green">
            AI SAFETY DEPARTURES
          </h1>
          <p className="text-xs text-text-muted mt-1">
            {totalCount} tracked departure{totalCount !== 1 ? "s" : ""} from
            major AI labs
          </p>
        </div>
        <Suspense fallback={null}>
          <DepartureFilters />
        </Suspense>
      </div>

      <Suspense fallback={<TableSkeleton />}>
        <DepartureTable departures={departures} />
      </Suspense>
    </div>
  );
}
