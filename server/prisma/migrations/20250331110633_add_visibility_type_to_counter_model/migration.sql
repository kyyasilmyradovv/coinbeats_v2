/*
  Warnings:

  - Added the required column `visibility` to the `Counter` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CounterVisibilityTypes" AS ENUM ('public', 'private');

-- AlterTable
ALTER TABLE "Counter" ADD COLUMN     "visibility" "CounterVisibilityTypes" NOT NULL;
