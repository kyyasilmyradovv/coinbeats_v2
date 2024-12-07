/*
  Warnings:

  - The primary key for the `_AcademyToCategory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_AcademyToChain` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_BookmarkedAcademies` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_EducatorCategories` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_EducatorChains` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_PodcastCategories` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_PodcastChains` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_TutorialCategories` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_TutorialChains` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_UserAcademyTypes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[A,B]` on the table `_AcademyToCategory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_AcademyToChain` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_BookmarkedAcademies` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_EducatorCategories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_EducatorChains` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_PodcastCategories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_PodcastChains` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_TutorialCategories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_TutorialChains` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_UserAcademyTypes` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "OverallRaffle" ADD COLUMN     "reward" TEXT;

-- AlterTable
ALTER TABLE "_AcademyToCategory" DROP CONSTRAINT "_AcademyToCategory_AB_pkey";

-- AlterTable
ALTER TABLE "_AcademyToChain" DROP CONSTRAINT "_AcademyToChain_AB_pkey";

-- AlterTable
ALTER TABLE "_BookmarkedAcademies" DROP CONSTRAINT "_BookmarkedAcademies_AB_pkey";

-- AlterTable
ALTER TABLE "_EducatorCategories" DROP CONSTRAINT "_EducatorCategories_AB_pkey";

-- AlterTable
ALTER TABLE "_EducatorChains" DROP CONSTRAINT "_EducatorChains_AB_pkey";

-- AlterTable
ALTER TABLE "_PodcastCategories" DROP CONSTRAINT "_PodcastCategories_AB_pkey";

-- AlterTable
ALTER TABLE "_PodcastChains" DROP CONSTRAINT "_PodcastChains_AB_pkey";

-- AlterTable
ALTER TABLE "_TutorialCategories" DROP CONSTRAINT "_TutorialCategories_AB_pkey";

-- AlterTable
ALTER TABLE "_TutorialChains" DROP CONSTRAINT "_TutorialChains_AB_pkey";

-- AlterTable
ALTER TABLE "_UserAcademyTypes" DROP CONSTRAINT "_UserAcademyTypes_AB_pkey";

-- CreateIndex
CREATE UNIQUE INDEX "_AcademyToCategory_AB_unique" ON "_AcademyToCategory"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "_AcademyToChain_AB_unique" ON "_AcademyToChain"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "_BookmarkedAcademies_AB_unique" ON "_BookmarkedAcademies"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "_EducatorCategories_AB_unique" ON "_EducatorCategories"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "_EducatorChains_AB_unique" ON "_EducatorChains"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "_PodcastCategories_AB_unique" ON "_PodcastCategories"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "_PodcastChains_AB_unique" ON "_PodcastChains"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "_TutorialCategories_AB_unique" ON "_TutorialCategories"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "_TutorialChains_AB_unique" ON "_TutorialChains"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "_UserAcademyTypes_AB_unique" ON "_UserAcademyTypes"("A", "B");
