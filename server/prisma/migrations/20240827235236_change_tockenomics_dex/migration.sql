/*
  Warnings:

  - You are about to drop the column `dexscreener` on the `Academy` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Academy" DROP COLUMN "dexscreener",
ADD COLUMN     "dexScreener" TEXT;
