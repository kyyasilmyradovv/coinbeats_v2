-- AlterTable
ALTER TABLE "Coins" ADD COLUMN     "academyId" INTEGER;

-- AddForeignKey
ALTER TABLE "Coins" ADD CONSTRAINT "Coins_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "Academy"("id") ON DELETE SET NULL ON UPDATE CASCADE;
