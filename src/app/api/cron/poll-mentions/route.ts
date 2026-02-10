import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  getBotUserId,
  getMentions,
  getTweet,
  extractParentTweetId,
  postReply,
} from "@/lib/x-api";

// Vercel cron: runs every 5 minutes
// Add to vercel.json: { "crons": [{ "path": "/api/cron/poll-mentions", "schedule": "*/5 * * * *" }] }

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if X API is configured
  if (!process.env.X_BEARER_TOKEN) {
    return NextResponse.json({ status: "skipped", reason: "X_BEARER_TOKEN not set" });
  }

  try {
    // Get or create bot state
    let botState = await prisma.botState.findUnique({
      where: { id: "singleton" },
    });
    if (!botState) {
      botState = await prisma.botState.create({
        data: { id: "singleton" },
      });
    }

    // Get bot user ID
    const botUserId = await getBotUserId();

    // Fetch new mentions since last poll
    const { mentions, newestId } = await getMentions(
      botUserId,
      botState.lastMentionId || undefined
    );

    let processed = 0;
    let skipped = 0;

    for (const mention of mentions) {
      // Skip if already processed
      const existing = await prisma.submission.findUnique({
        where: { mentionTweetId: mention.id },
      });
      if (existing) {
        skipped++;
        continue;
      }

      // Get the parent tweet (the resignation announcement)
      const parentTweetId = extractParentTweetId(mention);
      let parentData: {
        tweetId: string;
        url: string;
        author: string;
        authorName: string;
        text: string;
        likes: number;
        retweets: number;
        replies: number;
        views: number;
      } | null = null;

      if (parentTweetId) {
        const parent = await getTweet(parentTweetId);
        if (parent) {
          parentData = {
            tweetId: parent.tweet.id,
            url: `https://x.com/${parent.author.username}/status/${parent.tweet.id}`,
            author: parent.author.username,
            authorName: parent.author.name,
            text: parent.tweet.text,
            likes: parent.tweet.public_metrics?.like_count || 0,
            retweets: parent.tweet.public_metrics?.retweet_count || 0,
            replies: parent.tweet.public_metrics?.reply_count || 0,
            views: parent.tweet.public_metrics?.impression_count || 0,
          };
        }
      }

      // Check for duplicates by parent tweet ID
      if (parentData?.tweetId) {
        const duplicate = await prisma.submission.findFirst({
          where: {
            parentTweetId: parentData.tweetId,
            status: { not: "REJECTED" },
          },
        });
        if (duplicate) {
          await prisma.submission.create({
            data: {
              mentionTweetId: mention.id,
              mentionAuthor: mention.author.username,
              mentionText: mention.text,
              parentTweetId: parentData.tweetId,
              parentTweetUrl: parentData.url,
              parentAuthor: parentData.author,
              parentAuthorName: parentData.authorName,
              parentText: parentData.text,
              parentLikes: parentData.likes,
              parentRetweets: parentData.retweets,
              parentReplies: parentData.replies,
              parentViews: parentData.views,
              status: "DUPLICATE",
              reviewNote: `Duplicate of submission for tweet ${parentData.tweetId}`,
            },
          });
          skipped++;
          continue;
        }
      }

      // Create submission
      await prisma.submission.create({
        data: {
          mentionTweetId: mention.id,
          mentionAuthor: mention.author.username,
          mentionText: mention.text,
          parentTweetId: parentData?.tweetId,
          parentTweetUrl: parentData?.url,
          parentAuthor: parentData?.author,
          parentAuthorName: parentData?.authorName,
          parentText: parentData?.text,
          parentLikes: parentData?.likes || 0,
          parentRetweets: parentData?.retweets || 0,
          parentReplies: parentData?.replies || 0,
          parentViews: parentData?.views || 0,
        },
      });

      // Auto-reply to the mention
      const replyText = parentData
        ? `Thanks for the submission! We'll review "${parentData.authorName}" for the AI Safety Rage Quit Tracker. Track departures at aisafetyragequit.vercel.app`
        : `Thanks for the tag! To submit a departure, reply to the resignation tweet and tag us. We'll pull the data automatically.`;

      const replyId = await postReply(mention.id, replyText);

      if (replyId) {
        await prisma.submission.updateMany({
          where: { mentionTweetId: mention.id },
          data: { botReplyTweetId: replyId, botReplied: true },
        });
      }

      processed++;
    }

    // Update bot state
    if (newestId) {
      await prisma.botState.update({
        where: { id: "singleton" },
        data: { lastMentionId: newestId, lastPollAt: new Date() },
      });
    }

    return NextResponse.json({
      status: "ok",
      processed,
      skipped,
      total: mentions.length,
    });
  } catch (error) {
    console.error("Poll mentions error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
