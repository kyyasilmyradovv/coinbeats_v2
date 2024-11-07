/*
  Warnings:

  - You are about to drop the column `twitterAccessToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `twitterAccessTokenSecret` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `twitterRefreshToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `twitterTokenExpiresAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `twitterUserId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `twitterUsername` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_twitterUserId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "twitterAccessToken",
DROP COLUMN "twitterAccessTokenSecret",
DROP COLUMN "twitterRefreshToken",
DROP COLUMN "twitterTokenExpiresAt",
DROP COLUMN "twitterUserId",
DROP COLUMN "twitterUsername";
