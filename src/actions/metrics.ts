"use server";

import { prisma } from "@/lib/db";
import { computePublicityScore } from "@/lib/publicity-score";
import { revalidatePath } from "next/cache";

export async function recomputePublicityScore(departureId: string) {
  const departure = await prisma.departure.findUnique({
    where: { id: departureId },
    include: {
      tweets: { select: { likes: true, retweets: true, replies: true, views: true } },
      _count: { select: { newsArticles: true } },
    },
  });

  if (!departure) throw new Error("Departure not found");

  const score = computePublicityScore(
    departure.tweets,
    departure._count.newsArticles
  );

  await prisma.departure.update({
    where: { id: departureId },
    data: { publicityScore: score },
  });

  revalidatePath("/");
  revalidatePath(`/departures/${departureId}`);

  return score;
}

export async function recomputeAllScores() {
  const departures = await prisma.departure.findMany({
    include: {
      tweets: { select: { likes: true, retweets: true, replies: true, views: true } },
      _count: { select: { newsArticles: true } },
    },
  });

  for (const d of departures) {
    const score = computePublicityScore(d.tweets, d._count.newsArticles);
    await prisma.departure.update({
      where: { id: d.id },
      data: { publicityScore: score },
    });
  }

  revalidatePath("/");
}
