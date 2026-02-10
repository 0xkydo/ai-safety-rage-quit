import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { DepartureForm } from "@/components/admin/departure-form";
import { updateDeparture } from "@/actions/departures";
import Link from "next/link";

type Params = Promise<{ id: string }>;

export default async function EditDeparturePage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const departure = await prisma.departure.findUnique({
    where: { id },
    include: {
      tweets: true,
      newsArticles: true,
    },
  });

  if (!departure) notFound();

  const boundUpdate = updateDeparture.bind(null, id);

  return (
    <div>
      <Link
        href="/admin"
        className="text-xs text-text-muted hover:text-amber transition-colors duration-150 mb-4 inline-block"
      >
        &larr; Back to admin
      </Link>
      <h2 className="text-sm font-bold text-text-primary mb-6">
        EDIT: {departure.personName}
      </h2>
      <DepartureForm action={boundUpdate} departure={departure} />
    </div>
  );
}
