/*
  Warnings:

  - You are about to drop the column `category` on the `Academy` table. All the data in the column will be lost.
  - You are about to drop the column `chain` on the `Academy` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `Academy` table. All the data in the column will be lost.
  - You are about to drop the column `link` on the `Academy` table. All the data in the column will be lost.
  - You are about to drop the column `xp` on the `Academy` table. All the data in the column will be lost.
  - You are about to drop the `SocialQuest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Video` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `status` to the `Academy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ticker` to the `Academy` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "SocialQuest" DROP CONSTRAINT "SocialQuest_academyId_fkey";

-- DropForeignKey
ALTER TABLE "Video" DROP CONSTRAINT "Video_academyId_fkey";

-- AlterTable
ALTER TABLE "Academy" DROP COLUMN "category",
DROP COLUMN "chain",
DROP COLUMN "image",
DROP COLUMN "link",
DROP COLUMN "xp",
ADD COLUMN     "coingecko" TEXT,
ADD COLUMN     "congratsVideo" TEXT,
ADD COLUMN     "discord" TEXT,
ADD COLUMN     "getStarted" TEXT,
ADD COLUMN     "status" TEXT NOT NULL,
ADD COLUMN     "teamBackground" TEXT,
ADD COLUMN     "telegram" TEXT,
ADD COLUMN     "ticker" TEXT NOT NULL,
ADD COLUMN     "tokenomics" TEXT,
ADD COLUMN     "twitter" TEXT;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "content" TEXT,
ADD COLUMN     "video" TEXT;

-- DropTable
DROP TABLE "SocialQuest";

-- DropTable
DROP TABLE "Video";

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chain" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Chain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Raffle" (
    "id" SERIAL NOT NULL,
    "amount" INTEGER NOT NULL,
    "reward" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "chain" TEXT NOT NULL,
    "dates" TEXT NOT NULL,
    "totalPool" INTEGER NOT NULL,
    "academyId" INTEGER NOT NULL,

    CONSTRAINT "Raffle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quest" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "academyId" INTEGER NOT NULL,

    CONSTRAINT "Quest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AcademyToCategory" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AcademyToChain" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Chain_name_key" ON "Chain"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_AcademyToCategory_AB_unique" ON "_AcademyToCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_AcademyToCategory_B_index" ON "_AcademyToCategory"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AcademyToChain_AB_unique" ON "_AcademyToChain"("A", "B");

-- CreateIndex
CREATE INDEX "_AcademyToChain_B_index" ON "_AcademyToChain"("B");

-- AddForeignKey
ALTER TABLE "Raffle" ADD CONSTRAINT "Raffle_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "Academy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quest" ADD CONSTRAINT "Quest_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "Academy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AcademyToCategory" ADD CONSTRAINT "_AcademyToCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "Academy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AcademyToCategory" ADD CONSTRAINT "_AcademyToCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AcademyToChain" ADD CONSTRAINT "_AcademyToChain_A_fkey" FOREIGN KEY ("A") REFERENCES "Academy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AcademyToChain" ADD CONSTRAINT "_AcademyToChain_B_fkey" FOREIGN KEY ("B") REFERENCES "Chain"("id") ON DELETE CASCADE ON UPDATE CASCADE;
