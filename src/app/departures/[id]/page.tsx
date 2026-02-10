import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { DepartureDetail } from "@/components/departure-detail";
import { COMPANY_LABELS } from "@/lib/constants";
import type { Metadata } from "next";
import Link from "next/link";

type Params = Promise<{ id: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const departure = await prisma.departure.findUnique({
    where: { id },
    select: { personName: true, role: true, company: true },
  });

  if (!departure) return { title: "Not Found" };

  return {
    title: `${departure.personName} - AI Safety Rage Quit Tracker`,
    description: `${departure.personName}, ${departure.role} at ${COMPANY_LABELS[departure.company]}`,
  };
}

export default async function DeparturePage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const departure = await prisma.departure.findUnique({
    where: { id },
    include: {
      tweets: { orderBy: { createdAt: "desc" } },
      newsArticles: { orderBy: { publishedAt: "desc" } },
    },
  });

  if (!departure) notFound();

  return (
    <div>
      <Link
        href="/"
        className="text-xs text-text-muted hover:text-neon-green transition-colors duration-150 mb-6 inline-block"
      >
        &larr; Back to all departures
      </Link>
      <DepartureDetail departure={departure} />
    </div>
  );
}
