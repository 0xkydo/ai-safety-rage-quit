export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { TimelineChart } from "@/components/timeline-chart";
import type { Company } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Timeline - AI Safety Rage Quit Tracker",
  description:
    "Timeline of AI safety researcher departures overlaid with stock market performance",
};

type TimelineDeparture = {
  id: string;
  personName: string;
  company: Company;
  departureDate: Date;
  publicityScore: number;
};

export default async function TimelinePage() {
  const departures: TimelineDeparture[] = await prisma.departure.findMany({
    orderBy: { departureDate: "asc" },
    select: {
      id: true,
      personName: true,
      company: true,
      departureDate: true,
      publicityScore: true,
    },
  });

  const timelineData = departures.map((d: TimelineDeparture) => ({
    ...d,
    departureDate: d.departureDate.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-neon-green">
          DEPARTURE TIMELINE
        </h1>
        <p className="text-xs text-text-muted mt-1">
          AI safety departures overlaid with NVDA and S&P 500 performance.
          Dot size reflects publicity score. Click a departure to view details.
        </p>
      </div>

      <div className="border border-border-primary bg-bg-secondary rounded-sm p-4">
        <TimelineChart departures={timelineData} />
      </div>
    </div>
  );
}
