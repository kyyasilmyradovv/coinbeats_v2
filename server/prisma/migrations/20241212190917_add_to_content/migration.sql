/*
  Warnings:

  - Added the required column `contentOrigin` to the `Educator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Educator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contentOrigin` to the `Podcast` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Podcast` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contentOrigin` to the `Tutorial` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Tutorial` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ContentOrigin" AS ENUM ('PLATFORM_BASED', 'CREATOR_BASED');

-- AlterTable
ALTER TABLE "Educator" ADD COLUMN     "contentOrigin" "ContentOrigin" NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Podcast" ADD COLUMN     "contentOrigin" "ContentOrigin" NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Tutorial" ADD COLUMN     "contentOrigin" "ContentOrigin" NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
