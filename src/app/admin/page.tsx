export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { AdminTable } from "@/components/admin/admin-table";

export default async function AdminPage() {
  const departures = await prisma.departure.findMany({
    orderBy: { departureDate: "desc" },
    include: {
      tweets: true,
      newsArticles: true,
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm text-text-secondary">
          {departures.length} departure{departures.length !== 1 ? "s" : ""}
        </h2>
      </div>
      <AdminTable departures={departures} />
    </div>
  );
}
