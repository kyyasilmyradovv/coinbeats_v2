-- CreateTable
CREATE TABLE "_PodcastCategories" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_EducatorCategories" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_PodcastChains" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_EducatorChains" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_TutorialChains" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PodcastCategories_AB_unique" ON "_PodcastCategories"("A", "B");

-- CreateIndex
CREATE INDEX "_PodcastCategories_B_index" ON "_PodcastCategories"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_EducatorCategories_AB_unique" ON "_EducatorCategories"("A", "B");

-- CreateIndex
CREATE INDEX "_EducatorCategories_B_index" ON "_EducatorCategories"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PodcastChains_AB_unique" ON "_PodcastChains"("A", "B");

-- CreateIndex
CREATE INDEX "_PodcastChains_B_index" ON "_PodcastChains"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_EducatorChains_AB_unique" ON "_EducatorChains"("A", "B");

-- CreateIndex
CREATE INDEX "_EducatorChains_B_index" ON "_EducatorChains"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_TutorialChains_AB_unique" ON "_TutorialChains"("A", "B");

-- CreateIndex
CREATE INDEX "_TutorialChains_B_index" ON "_TutorialChains"("B");

-- AddForeignKey
ALTER TABLE "_PodcastCategories" ADD CONSTRAINT "_PodcastCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PodcastCategories" ADD CONSTRAINT "_PodcastCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "Podcast"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EducatorCategories" ADD CONSTRAINT "_EducatorCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EducatorCategories" ADD CONSTRAINT "_EducatorCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "Educator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PodcastChains" ADD CONSTRAINT "_PodcastChains_A_fkey" FOREIGN KEY ("A") REFERENCES "Chain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PodcastChains" ADD CONSTRAINT "_PodcastChains_B_fkey" FOREIGN KEY ("B") REFERENCES "Podcast"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EducatorChains" ADD CONSTRAINT "_EducatorChains_A_fkey" FOREIGN KEY ("A") REFERENCES "Chain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EducatorChains" ADD CONSTRAINT "_EducatorChains_B_fkey" FOREIGN KEY ("B") REFERENCES "Educator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TutorialChains" ADD CONSTRAINT "_TutorialChains_A_fkey" FOREIGN KEY ("A") REFERENCES "Chain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TutorialChains" ADD CONSTRAINT "_TutorialChains_B_fkey" FOREIGN KEY ("B") REFERENCES "Tutorial"("id") ON DELETE CASCADE ON UPDATE CASCADE;
