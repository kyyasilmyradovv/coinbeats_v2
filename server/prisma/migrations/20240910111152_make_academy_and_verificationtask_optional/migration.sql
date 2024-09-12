-- DropForeignKey
ALTER TABLE "Point" DROP CONSTRAINT "Point_academyId_fkey";

-- AlterTable
ALTER TABLE "Point" ADD COLUMN     "verificationTaskId" INTEGER,
ALTER COLUMN "academyId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Point" ADD CONSTRAINT "Point_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "Academy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Point" ADD CONSTRAINT "Point_verificationTaskId_fkey" FOREIGN KEY ("verificationTaskId") REFERENCES "VerificationTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;
