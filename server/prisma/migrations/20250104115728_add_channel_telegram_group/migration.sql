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
CREATE TABLE "YoutubeChannel" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "youtubeUrl" TEXT,
    "coverPhotoUrl" TEXT,
    "logoUrl" TEXT,
    "contentOrigin" "ContentOrigin" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "YoutubeChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TelegramGroup" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "telegramUrl" TEXT,
    "coverPhotoUrl" TEXT,
    "logoUrl" TEXT,
    "contentOrigin" "ContentOrigin" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TelegramGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_YoutubeChannelCategories" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_YoutubeChannelCategories_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_TelegramGroupCategories" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_TelegramGroupCategories_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_YoutubeChannelChains" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_YoutubeChannelChains_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_TelegramGroupChains" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_TelegramGroupChains_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_YoutubeChannelCategories_B_index" ON "_YoutubeChannelCategories"("B");

-- CreateIndex
CREATE INDEX "_TelegramGroupCategories_B_index" ON "_TelegramGroupCategories"("B");

-- CreateIndex
CREATE INDEX "_YoutubeChannelChains_B_index" ON "_YoutubeChannelChains"("B");

-- CreateIndex
CREATE INDEX "_TelegramGroupChains_B_index" ON "_TelegramGroupChains"("B");

-- AddForeignKey
ALTER TABLE "_YoutubeChannelCategories" ADD CONSTRAINT "_YoutubeChannelCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_YoutubeChannelCategories" ADD CONSTRAINT "_YoutubeChannelCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "YoutubeChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TelegramGroupCategories" ADD CONSTRAINT "_TelegramGroupCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TelegramGroupCategories" ADD CONSTRAINT "_TelegramGroupCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "TelegramGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_YoutubeChannelChains" ADD CONSTRAINT "_YoutubeChannelChains_A_fkey" FOREIGN KEY ("A") REFERENCES "Chain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_YoutubeChannelChains" ADD CONSTRAINT "_YoutubeChannelChains_B_fkey" FOREIGN KEY ("B") REFERENCES "YoutubeChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TelegramGroupChains" ADD CONSTRAINT "_TelegramGroupChains_A_fkey" FOREIGN KEY ("A") REFERENCES "Chain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TelegramGroupChains" ADD CONSTRAINT "_TelegramGroupChains_B_fkey" FOREIGN KEY ("B") REFERENCES "TelegramGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
