/*
  Warnings:

  - Added the required column `telegramUserId` to the `SessionLog` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "SessionLog" DROP CONSTRAINT "SessionLog_userId_fkey";

-- AlterTable
ALTER TABLE "SessionLog" ADD COLUMN     "telegramUserId" INTEGER NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "SessionLog" ADD CONSTRAINT "SessionLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
