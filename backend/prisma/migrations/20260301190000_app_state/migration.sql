-- CreateEnum
CREATE TYPE "RecommendationMode" AS ENUM ('focus', 'relax');

-- CreateEnum
CREATE TYPE "DayLoad" AS ENUM ('light', 'medium', 'heavy');

-- CreateTable
CREATE TABLE "DailyScan" (
    "id" TEXT NOT NULL,
    "dateKey" TEXT NOT NULL,
    "emotion" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "DailyScan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyEntry" (
    "id" TEXT NOT NULL,
    "dateKey" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "recommendationMode" "RecommendationMode" NOT NULL,
    "stressScore" INTEGER NOT NULL,
    "reasons" TEXT[],
    "signals" JSONB NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "DailyEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "dueDate" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimetableDay" (
    "id" TEXT NOT NULL,
    "dateKey" TEXT NOT NULL,
    "load" "DayLoad" NOT NULL DEFAULT 'medium',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "TimetableDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FocusSession" (
    "id" TEXT NOT NULL,
    "dateKey" TEXT NOT NULL,
    "minutes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "FocusSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RelaxSession" (
    "id" TEXT NOT NULL,
    "dateKey" TEXT NOT NULL,
    "minutes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "RelaxSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyScan_userId_dateKey_key" ON "DailyScan"("userId", "dateKey");

-- CreateIndex
CREATE INDEX "DailyScan_userId_dateKey_idx" ON "DailyScan"("userId", "dateKey");

-- CreateIndex
CREATE UNIQUE INDEX "DailyEntry_userId_dateKey_key" ON "DailyEntry"("userId", "dateKey");

-- CreateIndex
CREATE INDEX "DailyEntry_userId_dateKey_idx" ON "DailyEntry"("userId", "dateKey");

-- CreateIndex
CREATE INDEX "Task_userId_createdAt_idx" ON "Task"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "TimetableDay_userId_dateKey_key" ON "TimetableDay"("userId", "dateKey");

-- CreateIndex
CREATE INDEX "TimetableDay_userId_dateKey_idx" ON "TimetableDay"("userId", "dateKey");

-- CreateIndex
CREATE INDEX "FocusSession_userId_dateKey_idx" ON "FocusSession"("userId", "dateKey");

-- CreateIndex
CREATE INDEX "RelaxSession_userId_dateKey_idx" ON "RelaxSession"("userId", "dateKey");

-- AddForeignKey
ALTER TABLE "DailyScan" ADD CONSTRAINT "DailyScan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyEntry" ADD CONSTRAINT "DailyEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableDay" ADD CONSTRAINT "TimetableDay_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FocusSession" ADD CONSTRAINT "FocusSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelaxSession" ADD CONSTRAINT "RelaxSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
