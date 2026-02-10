-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'DUPLICATE');

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "mentionTweetId" TEXT NOT NULL,
    "mentionAuthor" TEXT NOT NULL,
    "mentionText" TEXT,
    "parentTweetId" TEXT,
    "parentTweetUrl" TEXT,
    "parentAuthor" TEXT,
    "parentAuthorName" TEXT,
    "parentText" TEXT,
    "parentLikes" INTEGER NOT NULL DEFAULT 0,
    "parentRetweets" INTEGER NOT NULL DEFAULT 0,
    "parentReplies" INTEGER NOT NULL DEFAULT 0,
    "parentViews" INTEGER NOT NULL DEFAULT 0,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "reviewNote" TEXT,
    "departureId" TEXT,
    "botReplyTweetId" TEXT,
    "botReplied" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BotState" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "lastMentionId" TEXT,
    "lastPollAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BotState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Submission_mentionTweetId_key" ON "Submission"("mentionTweetId");

-- CreateIndex
CREATE INDEX "Submission_status_idx" ON "Submission"("status");

-- CreateIndex
CREATE INDEX "Submission_parentTweetId_idx" ON "Submission"("parentTweetId");
