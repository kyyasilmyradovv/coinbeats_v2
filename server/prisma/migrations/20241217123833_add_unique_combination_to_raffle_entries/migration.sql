/*
  Warnings:

  - A unique constraint covering the columns `[userId,academyId]` on the table `AcademyRaffleEntries` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AcademyRaffleEntries_userId_academyId_key" ON "AcademyRaffleEntries"("userId", "academyId");
