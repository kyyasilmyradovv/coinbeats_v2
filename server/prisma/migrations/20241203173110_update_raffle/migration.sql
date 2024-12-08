/*
  Warnings:

  - You are about to drop the column `chain` on the `Raffle` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `Raffle` table. All the data in the column will be lost.
  - You are about to drop the column `dates` on the `Raffle` table. All the data in the column will be lost.
  - You are about to drop the column `reward` on the `Raffle` table. All the data in the column will be lost.
  - You are about to drop the column `totalPool` on the `Raffle` table. All the data in the column will be lost.
  - Added the required column `desc` to the `Raffle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taskId` to the `Raffle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Raffle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Raffle" DROP COLUMN "chain",
DROP COLUMN "currency",
DROP COLUMN "dates",
DROP COLUMN "reward",
DROP COLUMN "totalPool",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "desc" TEXT NOT NULL,
ADD COLUMN     "taskId" INTEGER NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL,
ALTER COLUMN "amount" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "raffleAmount" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Raffle" ADD CONSTRAINT "Raffle_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "VerificationTask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Raffle" ADD CONSTRAINT "Raffle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
