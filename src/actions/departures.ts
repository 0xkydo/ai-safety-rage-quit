"use server";

import { prisma } from "@/lib/db";
import { computePublicityScore } from "@/lib/publicity-score";
import {
  createDepartureSchema,
  updateDepartureSchema,
  tweetSchema,
  newsArticleSchema,
} from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (token !== process.env.ADMIN_SECRET) {
    throw new Error("Unauthorized");
  }
}

export async function createDeparture(formData: FormData) {
  await requireAdmin();

  const raw = Object.fromEntries(formData.entries());
  const parsed = createDepartureSchema.parse(raw);

  // Parse tweets
  const tweetEntries: { url: string; tweetId: string; text?: string; likes: number; retweets: number; replies: number; views: number }[] = [];
  let i = 0;
  while (formData.has(`tweet_url_${i}`)) {
    const tweetData = {
      url: formData.get(`tweet_url_${i}`) as string,
      tweetId: formData.get(`tweet_id_${i}`) as string,
      text: (formData.get(`tweet_text_${i}`) as string) || undefined,
      likes: Number(formData.get(`tweet_likes_${i}`) || 0),
      retweets: Number(formData.get(`tweet_retweets_${i}`) || 0),
      replies: Number(formData.get(`tweet_replies_${i}`) || 0),
      views: Number(formData.get(`tweet_views_${i}`) || 0),
    };
    const tweet = tweetSchema.parse(tweetData);
    tweetEntries.push(tweet);
    i++;
  }

  // Parse news articles
  const articleEntries: { url: string; title: string; source: string; publishedAt?: string }[] = [];
  let j = 0;
  while (formData.has(`article_url_${j}`)) {
    const articleData = {
      url: formData.get(`article_url_${j}`) as string,
      title: formData.get(`article_title_${j}`) as string,
      source: formData.get(`article_source_${j}`) as string,
      publishedAt: (formData.get(`article_published_${j}`) as string) || undefined,
    };
    const article = newsArticleSchema.parse(articleData);
    articleEntries.push(article);
    j++;
  }

  const score = computePublicityScore(tweetEntries, articleEntries.length);

  const departure = await prisma.departure.create({
    data: {
      personName: parsed.personName,
      role: parsed.role,
      company: parsed.company,
      departureDate: new Date(parsed.departureDate),
      summary: parsed.summary,
      profileImageUrl: parsed.profileImageUrl || null,
      status: parsed.status,
      publicityScore: score,
      tweets: {
        create: tweetEntries.map((t) => ({
          tweetId: t.tweetId,
          url: t.url,
          text: t.text,
          likes: t.likes,
          retweets: t.retweets,
          replies: t.replies,
          views: t.views,
          metricsUpdatedAt: new Date(),
        })),
      },
      newsArticles: {
        create: articleEntries.map((a) => ({
          url: a.url,
          title: a.title,
          source: a.source,
          publishedAt: a.publishedAt ? new Date(a.publishedAt) : null,
        })),
      },
    },
  });

  revalidatePath("/");
  redirect(`/departures/${departure.id}`);
}

export async function updateDeparture(id: string, formData: FormData) {
  await requireAdmin();

  const raw = Object.fromEntries(formData.entries());
  const parsed = updateDepartureSchema.parse(raw);

  // Delete existing tweets and articles, replace with new ones
  await prisma.tweet.deleteMany({ where: { departureId: id } });
  await prisma.newsArticle.deleteMany({ where: { departureId: id } });

  // Parse tweets
  const tweetEntries: { url: string; tweetId: string; text?: string; likes: number; retweets: number; replies: number; views: number }[] = [];
  let i = 0;
  while (formData.has(`tweet_url_${i}`)) {
    const tweetData = {
      url: formData.get(`tweet_url_${i}`) as string,
      tweetId: formData.get(`tweet_id_${i}`) as string,
      text: (formData.get(`tweet_text_${i}`) as string) || undefined,
      likes: Number(formData.get(`tweet_likes_${i}`) || 0),
      retweets: Number(formData.get(`tweet_retweets_${i}`) || 0),
      replies: Number(formData.get(`tweet_replies_${i}`) || 0),
      views: Number(formData.get(`tweet_views_${i}`) || 0),
    };
    const tweet = tweetSchema.parse(tweetData);
    tweetEntries.push(tweet);
    i++;
  }

  // Parse news articles
  const articleEntries: { url: string; title: string; source: string; publishedAt?: string }[] = [];
  let j = 0;
  while (formData.has(`article_url_${j}`)) {
    const articleData = {
      url: formData.get(`article_url_${j}`) as string,
      title: formData.get(`article_title_${j}`) as string,
      source: formData.get(`article_source_${j}`) as string,
      publishedAt: (formData.get(`article_published_${j}`) as string) || undefined,
    };
    const article = newsArticleSchema.parse(articleData);
    articleEntries.push(article);
    j++;
  }

  const score = computePublicityScore(tweetEntries, articleEntries.length);

  await prisma.departure.update({
    where: { id },
    data: {
      ...(parsed.personName && { personName: parsed.personName }),
      ...(parsed.role && { role: parsed.role }),
      ...(parsed.company && { company: parsed.company }),
      ...(parsed.departureDate && {
        departureDate: new Date(parsed.departureDate),
      }),
      ...(parsed.summary && { summary: parsed.summary }),
      ...(parsed.profileImageUrl !== undefined && {
        profileImageUrl: parsed.profileImageUrl || null,
      }),
      ...(parsed.status && { status: parsed.status }),
      publicityScore: score,
      tweets: {
        create: tweetEntries.map((t) => ({
          tweetId: t.tweetId,
          url: t.url,
          text: t.text,
          likes: t.likes,
          retweets: t.retweets,
          replies: t.replies,
          views: t.views,
          metricsUpdatedAt: new Date(),
        })),
      },
      newsArticles: {
        create: articleEntries.map((a) => ({
          url: a.url,
          title: a.title,
          source: a.source,
          publishedAt: a.publishedAt ? new Date(a.publishedAt) : null,
        })),
      },
    },
  });

  revalidatePath("/");
  revalidatePath(`/departures/${id}`);
  redirect(`/admin`);
}

export async function deleteDeparture(id: string) {
  await requireAdmin();

  await prisma.departure.delete({ where: { id } });

  revalidatePath("/");
  redirect("/admin");
}

export async function loginAdmin(formData: FormData): Promise<void> {
  const secret = formData.get("secret") as string;
  if (secret !== process.env.ADMIN_SECRET) {
    throw new Error("Invalid secret");
  }

  const cookieStore = await cookies();
  cookieStore.set("admin_token", secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  redirect("/admin");
}
