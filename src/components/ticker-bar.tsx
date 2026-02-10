import { prisma } from "@/lib/db";
import { COMPANY_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

const MIN_SCORE = 30;

export async function TickerBar() {
  let departures: { personName: string; role: string; company: string; departureDate: Date; publicityScore: number }[] = [];

  try {
    departures = await prisma.departure.findMany({
      where: { publicityScore: { gte: MIN_SCORE } },
      orderBy: { publicityScore: "desc" },
      select: {
        id: true,
        personName: true,
        role: true,
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
      `${d.personName}, ${d.role} // ${COMPANY_LABELS[d.company]} // ${formatDate(d.departureDate)} // SCORE: ${d.publicityScore.toFixed(0)}`
  );

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
