/*
  Warnings:

  - You are about to drop the column `points` on the `VerificationTask` table. All the data in the column will be lost.
  - The `platform` column on the `VerificationTask` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `academyTypeId` to the `InitialQuestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `displayLocation` to the `VerificationTask` table without a default value. This is not possible if the table is not empty.
  - Added the required column `intervalType` to the `VerificationTask` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `VerificationTask` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taskType` to the `VerificationTask` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `VerificationTask` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('PLATFORM_SPECIFIC', 'ACADEMY_SPECIFIC');

-- CreateEnum
CREATE TYPE "IntervalType" AS ENUM ('ONETIME', 'REPEATED');

-- CreateEnum
CREATE TYPE "DisplayLocation" AS ENUM ('QUEST_TAB', 'END_OF_ACADEMY', 'OTHER');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('X', 'YOUTUBE', 'FACEBOOK', 'INSTAGRAM', 'TELEGRAM', 'DISCORD', 'EMAIL', 'NONE');

-- CreateEnum
CREATE TYPE "VerificationMethod" AS ENUM ('FOLLOW_USER', 'TWEET', 'RETWEET', 'LIKE_TWEET', 'ADD_TO_BIO', 'JOIN_TELEGRAM_CHANNEL', 'INVITE_TELEGRAM_FRIEND', 'INVITE_WITH_REFERRAL', 'SUBSCRIBE_YOUTUBE_CHANNEL', 'WATCH_YOUTUBE_VIDEO', 'FOLLOW_INSTAGRAM_USER', 'JOIN_DISCORD_CHANNEL', 'PROVIDE_EMAIL', 'SHORT_CIRCUIT');

-- AlterTable
ALTER TABLE "InitialQuestion" ADD COLUMN     "academyTypeId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "UserVerification" ADD COLUMN     "completedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "VerificationTask" DROP COLUMN "points",
ADD COLUMN     "academyId" INTEGER,
ADD COLUMN     "displayLocation" "DisplayLocation" NOT NULL,
ADD COLUMN     "intervalType" "IntervalType" NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "repeatInterval" INTEGER,
ADD COLUMN     "shortCircuit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shortCircuitTimer" INTEGER,
ADD COLUMN     "taskType" "TaskType" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "verificationMethod" "VerificationMethod",
ADD COLUMN     "xp" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "platform",
ADD COLUMN     "platform" "Platform",
ALTER COLUMN "description" DROP NOT NULL;

-- CreateTable
CREATE TABLE "AcademyType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AcademyType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AcademyType_name_key" ON "AcademyType"("name");

-- AddForeignKey
ALTER TABLE "InitialQuestion" ADD CONSTRAINT "InitialQuestion_academyTypeId_fkey" FOREIGN KEY ("academyTypeId") REFERENCES "AcademyType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationTask" ADD CONSTRAINT "VerificationTask_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "Academy"("id") ON DELETE SET NULL ON UPDATE CASCADE;
