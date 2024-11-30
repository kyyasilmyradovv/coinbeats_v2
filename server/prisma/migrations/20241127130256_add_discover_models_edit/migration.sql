-- AlterTable
ALTER TABLE "Educator" ADD COLUMN     "coverPhotoUrl" TEXT,
ADD COLUMN     "logoUrl" TEXT;

-- AlterTable
ALTER TABLE "Podcast" ADD COLUMN     "coverPhotoUrl" TEXT,
ADD COLUMN     "logoUrl" TEXT;

-- AlterTable
ALTER TABLE "Tutorial" ADD COLUMN     "coverPhotoUrl" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "logoUrl" TEXT;
