/*
  Warnings:

  - You are about to drop the `_AcademyToAcademyType` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_AcademyToAcademyType" DROP CONSTRAINT "_AcademyToAcademyType_A_fkey";

-- DropForeignKey
ALTER TABLE "_AcademyToAcademyType" DROP CONSTRAINT "_AcademyToAcademyType_B_fkey";

-- AlterTable
ALTER TABLE "Academy" ADD COLUMN     "academyTypeId" INTEGER;

-- DropTable
DROP TABLE "_AcademyToAcademyType";

-- AddForeignKey
ALTER TABLE "Academy" ADD CONSTRAINT "Academy_academyTypeId_fkey" FOREIGN KEY ("academyTypeId") REFERENCES "AcademyType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
