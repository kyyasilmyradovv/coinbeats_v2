/*
  Warnings:

  - The `type` column on the `OverallRaffle` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "OverallRaffleType" AS ENUM ('PLATFORM', 'ACADEMY');

-- AlterTable
ALTER TABLE "OverallRaffle" DROP COLUMN "type",
ADD COLUMN     "type" "OverallRaffleType";
