/*
  Warnings:

  - A unique constraint covering the columns `[twitterUserId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "twitterAccessToken" TEXT,
ADD COLUMN     "twitterRefreshToken" TEXT,
ADD COLUMN     "twitterTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "twitterUserId" TEXT,
ADD COLUMN     "twitterUsername" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_twitterUserId_key" ON "User"("twitterUserId");
