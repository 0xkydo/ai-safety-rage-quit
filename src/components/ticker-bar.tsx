import { prisma } from "@/lib/db";
import { COMPANY_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export async function TickerBar() {
  let departures: { personName: string; company: string; departureDate: Date; publicityScore: number }[] = [];

  try {
    departures = await prisma.departure.findMany({
      orderBy: { departureDate: "desc" },
      take: 20,
      select: {
        id: true,
        personName: true,
        company: true,
        departureDate: true,
        publicityScore: true,
      },
    });
  } catch {
    return null;
  }

  if (departures.length === 0) return null;

  const items = departures.map(
    (d) =>
      `${d.personName} // ${COMPANY_LABELS[d.company]} // ${formatDate(d.departureDate)} // SCORE: ${d.publicityScore.toFixed(0)}`
  );

  // Duplicate for seamless loop
  const tickerContent = [...items, ...items].join("   ///   ");

  return (
    <div className="border-b border-border-primary bg-bg-primary overflow-hidden h-7 flex items-center">
      <div className="flex-shrink-0 px-2 bg-amber text-bg-primary text-xs font-bold h-full flex items-center">
        LIVE
      </div>
      <div className="overflow-hidden flex-1 relative">
        <div className="animate-ticker whitespace-nowrap text-xs text-amber-dim">
          {tickerContent}
        </div>
      </div>
    </div>
  );
}
