-- DropForeignKey
ALTER TABLE "Raffle" DROP CONSTRAINT "Raffle_academyId_fkey";

-- DropForeignKey
ALTER TABLE "Raffle" DROP CONSTRAINT "Raffle_taskId_fkey";

-- DropForeignKey
ALTER TABLE "Raffle" DROP CONSTRAINT "Raffle_userId_fkey";

-- AlterTable
ALTER TABLE "Raffle" ALTER COLUMN "academyId" DROP NOT NULL,
ALTER COLUMN "desc" DROP NOT NULL,
ALTER COLUMN "taskId" DROP NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Raffle" ADD CONSTRAINT "Raffle_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "VerificationTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Raffle" ADD CONSTRAINT "Raffle_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "Academy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Raffle" ADD CONSTRAINT "Raffle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
