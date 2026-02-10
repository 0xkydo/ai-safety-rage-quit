"use server";

import { prisma } from "@/lib/db";
import { computePublicityScore } from "@/lib/publicity-score";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (token !== process.env.ADMIN_SECRET) {
    throw new Error("Unauthorized");
  }
}

export async function approveSubmission(
  submissionId: string,
  formData: FormData
) {
  await requireAdmin();

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
  });
  if (!submission) throw new Error("Submission not found");
  if (submission.status !== "PENDING") throw new Error("Already processed");

  const personName = formData.get("personName") as string;
  const role = formData.get("role") as string;
  const company = formData.get("company") as string;
  const departureDate = formData.get("departureDate") as string;
  const summary = formData.get("summary") as string;

  if (!personName || !role || !company || !departureDate || !summary) {
    throw new Error("All fields required");
  }

  // Build tweet data from the parent tweet
  const tweets = submission.parentTweetId
    ? [
        {
          tweetId: submission.parentTweetId,
          url: submission.parentTweetUrl || "",
          text: submission.parentText || "",
          likes: submission.parentLikes,
          retweets: submission.parentRetweets,
          replies: submission.parentReplies,
          views: submission.parentViews,
          metricsUpdatedAt: new Date(),
        },
      ]
    : [];

  const score = computePublicityScore(tweets, 0);

  // Create the departure
  const departure = await prisma.departure.create({
    data: {
      personName,
      role,
      company: company as "OPENAI" | "ANTHROPIC" | "GOOGLE_DEEPMIND",
      departureDate: new Date(departureDate),
      summary,
      status: "CONFIRMED",
      publicityScore: score,
      tweets: { create: tweets },
    },
  });

  // Update submission status
  await prisma.submission.update({
    where: { id: submissionId },
    data: {
      status: "APPROVED",
      departureId: departure.id,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/submissions");
}

export async function rejectSubmission(submissionId: string) {
  await requireAdmin();

  await prisma.submission.update({
    where: { id: submissionId },
    data: {
      status: "REJECTED",
      reviewNote: "Rejected by admin",
    },
  });

  revalidatePath("/admin/submissions");
}
