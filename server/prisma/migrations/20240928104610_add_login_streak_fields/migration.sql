-- AlterTable
ALTER TABLE "UserVerification" ADD COLUMN     "lastLoginDate" TIMESTAMP(3),
ADD COLUMN     "streakCount" INTEGER NOT NULL DEFAULT 1;
