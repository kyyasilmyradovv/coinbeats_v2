-- AlterTable
ALTER TABLE "_AcademyToCategory" ADD CONSTRAINT "_AcademyToCategory_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_AcademyToCategory_AB_unique";

-- AlterTable
ALTER TABLE "_AcademyToChain" ADD CONSTRAINT "_AcademyToChain_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_AcademyToChain_AB_unique";

-- AlterTable
ALTER TABLE "_BookmarkedAcademies" ADD CONSTRAINT "_BookmarkedAcademies_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_BookmarkedAcademies_AB_unique";

-- AlterTable
ALTER TABLE "_EducatorCategories" ADD CONSTRAINT "_EducatorCategories_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_EducatorCategories_AB_unique";

-- AlterTable
ALTER TABLE "_EducatorChains" ADD CONSTRAINT "_EducatorChains_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_EducatorChains_AB_unique";

-- AlterTable
ALTER TABLE "_PodcastCategories" ADD CONSTRAINT "_PodcastCategories_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_PodcastCategories_AB_unique";

-- AlterTable
ALTER TABLE "_PodcastChains" ADD CONSTRAINT "_PodcastChains_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_PodcastChains_AB_unique";

-- AlterTable
ALTER TABLE "_TutorialCategories" ADD CONSTRAINT "_TutorialCategories_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_TutorialCategories_AB_unique";

-- AlterTable
ALTER TABLE "_TutorialChains" ADD CONSTRAINT "_TutorialChains_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_TutorialChains_AB_unique";

-- AlterTable
ALTER TABLE "_UserAcademyTypes" ADD CONSTRAINT "_UserAcademyTypes_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_UserAcademyTypes_AB_unique";

-- CreateTable
CREATE TABLE "RaffleWinner" (
    "id" SERIAL NOT NULL,
    "minAmount" INTEGER NOT NULL DEFAULT 0,
    "winnersCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "RaffleWinner_pkey" PRIMARY KEY ("id")
);
