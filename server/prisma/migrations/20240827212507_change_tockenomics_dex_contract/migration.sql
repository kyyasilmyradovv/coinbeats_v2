/*
  Warnings:

  - The `tokenomics` column on the `Academy` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Academy" ADD COLUMN     "contractAddress" TEXT,
ADD COLUMN     "dexscreener" TEXT,
DROP COLUMN "tokenomics",
ADD COLUMN     "tokenomics" JSONB;
