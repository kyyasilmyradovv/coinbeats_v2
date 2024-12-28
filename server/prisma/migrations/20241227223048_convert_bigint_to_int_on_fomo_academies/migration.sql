/*
  Warnings:

  - You are about to alter the column `fomoNumber` on the `Academy` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `fomoXp` on the `Academy` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Academy" ALTER COLUMN "fomoNumber" SET DATA TYPE INTEGER,
ALTER COLUMN "fomoXp" SET DATA TYPE INTEGER;
