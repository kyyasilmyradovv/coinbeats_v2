/*
  Warnings:

  - You are about to drop the `RaffleWinner` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "RaffleWinner";

-- CreateTable
CREATE TABLE "OverallRaffle" (
    "id" SERIAL NOT NULL,
    "minAmount" INTEGER NOT NULL DEFAULT 0,
    "winnersCount" INTEGER NOT NULL DEFAULT 0,
    "deadline" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OverallRaffle_pkey" PRIMARY KEY ("id")
);
