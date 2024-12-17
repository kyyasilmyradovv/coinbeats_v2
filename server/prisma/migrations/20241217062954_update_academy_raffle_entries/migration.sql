/*
  Warnings:

  - You are about to drop the column `raffleId` on the `AcademyRaffleEntries` table. All the data in the column will be lost.
  - Added the required column `academyId` to the `AcademyRaffleEntries` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AcademyRaffleEntries" DROP CONSTRAINT "AcademyRaffleEntries_raffleId_fkey";

-- AlterTable
ALTER TABLE "AcademyRaffleEntries" DROP COLUMN "raffleId",
ADD COLUMN     "academyId" INTEGER NOT NULL;
