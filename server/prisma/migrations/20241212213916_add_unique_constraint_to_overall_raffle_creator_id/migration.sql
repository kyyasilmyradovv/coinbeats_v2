/*
  Warnings:

  - A unique constraint covering the columns `[creatorId]` on the table `OverallRaffle` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[academyId]` on the table `OverallRaffle` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "OverallRaffle_creatorId_key" ON "OverallRaffle"("creatorId");

-- CreateIndex
CREATE UNIQUE INDEX "OverallRaffle_academyId_key" ON "OverallRaffle"("academyId");
