-- AlterTable
ALTER TABLE "OverallRaffle" ADD COLUMN     "academyId" INTEGER,
ADD COLUMN     "creatorId" INTEGER,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "type" TEXT;
