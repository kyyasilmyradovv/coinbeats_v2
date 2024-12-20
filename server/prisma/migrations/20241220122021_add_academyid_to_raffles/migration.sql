/*
  Warnings:

  - A unique constraint covering the columns `[academyId]` on the table `OverallRaffle` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "OverallRaffleType" AS ENUM ('PLATFORM', 'ACADEMY');

-- AlterTable
ALTER TABLE "OverallRaffle" ADD COLUMN     "academyId" INTEGER,
ADD COLUMN     "creatorId" INTEGER,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "type" "OverallRaffleType";

-- AlterTable
ALTER TABLE "RaffleWinners" ALTER COLUMN "winningAmount" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "RafflesHistory" ADD COLUMN     "overallRaffleId" INTEGER;

-- CreateTable
CREATE TABLE "AcademyRaffleEntries" (
    "id" SERIAL NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "academyId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "AcademyRaffleEntries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AcademyRaffleEntries_userId_academyId_key" ON "AcademyRaffleEntries"("userId", "academyId");

-- CreateIndex
CREATE UNIQUE INDEX "OverallRaffle_academyId_key" ON "OverallRaffle"("academyId");

-- AddForeignKey
ALTER TABLE "AcademyRaffleEntries" ADD CONSTRAINT "AcademyRaffleEntries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
