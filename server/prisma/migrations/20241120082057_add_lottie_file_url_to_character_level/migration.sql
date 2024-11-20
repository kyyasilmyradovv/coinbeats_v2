/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `CharacterLevel` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CharacterLevel" DROP COLUMN "imageUrl",
ADD COLUMN     "lottieFileUrl" TEXT;
