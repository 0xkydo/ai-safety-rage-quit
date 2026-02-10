-- CreateEnum
CREATE TYPE "Company" AS ENUM ('OPENAI', 'ANTHROPIC', 'GOOGLE_DEEPMIND');

-- CreateEnum
CREATE TYPE "DepartureStatus" AS ENUM ('CONFIRMED', 'RUMORED');

-- CreateTable
CREATE TABLE "Departure" (
    "id" TEXT NOT NULL,
    "personName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "company" "Company" NOT NULL,
    "departureDate" TIMESTAMP(3) NOT NULL,
    "summary" TEXT NOT NULL,
    "profileImageUrl" TEXT,
    "status" "DepartureStatus" NOT NULL DEFAULT 'CONFIRMED',
    "publicityScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Departure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tweet" (
    "id" TEXT NOT NULL,
    "tweetId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "text" TEXT,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "retweets" INTEGER NOT NULL DEFAULT 0,
    "replies" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "metricsUpdatedAt" TIMESTAMP(3),
    "departureId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tweet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsArticle" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "departureId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsArticle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Departure_company_idx" ON "Departure"("company");

-- CreateIndex
CREATE INDEX "Departure_departureDate_idx" ON "Departure"("departureDate");

-- CreateIndex
CREATE INDEX "Departure_publicityScore_idx" ON "Departure"("publicityScore");

-- CreateIndex
CREATE UNIQUE INDEX "Tweet_tweetId_key" ON "Tweet"("tweetId");

-- CreateIndex
CREATE INDEX "Tweet_departureId_idx" ON "Tweet"("departureId");

-- CreateIndex
CREATE INDEX "NewsArticle_departureId_idx" ON "NewsArticle"("departureId");

-- AddForeignKey
ALTER TABLE "Tweet" ADD CONSTRAINT "Tweet_departureId_fkey" FOREIGN KEY ("departureId") REFERENCES "Departure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsArticle" ADD CONSTRAINT "NewsArticle_departureId_fkey" FOREIGN KEY ("departureId") REFERENCES "Departure"("id") ON DELETE CASCADE ON UPDATE CASCADE;
