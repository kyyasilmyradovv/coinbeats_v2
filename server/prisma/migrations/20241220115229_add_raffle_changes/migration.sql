/*
  Warnings:

  - You are about to drop the column `academyId` on the `OverallRaffle` table. All the data in the column will be lost.
  - You are about to drop the column `creatorId` on the `OverallRaffle` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `OverallRaffle` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `OverallRaffle` table. All the data in the column will be lost.
  - The `winningAmount` column on the `RaffleWinners` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `overallRaffleId` on the `RafflesHistory` table. All the data in the column will be lost.
  - You are about to drop the `AcademyRaffleEntries` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AcademyRaffleEntries" DROP CONSTRAINT "AcademyRaffleEntries_userId_fkey";

-- DropIndex
DROP INDEX "OverallRaffle_academyId_key";

-- AlterTable
ALTER TABLE "OverallRaffle" DROP COLUMN "academyId",
DROP COLUMN "creatorId",
DROP COLUMN "isActive",
DROP COLUMN "type";

-- AlterTable
ALTER TABLE "RaffleWinners" DROP COLUMN "winningAmount",
ADD COLUMN     "winningAmount" INTEGER;

-- AlterTable
ALTER TABLE "RafflesHistory" DROP COLUMN "overallRaffleId";

-- DropTable
DROP TABLE "AcademyRaffleEntries";

-- DropEnum
DROP TYPE "OverallRaffleType";
