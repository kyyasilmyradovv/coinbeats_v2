-- CreateTable
CREATE TABLE "_BookmarkedAcademies" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_BookmarkedAcademies_AB_unique" ON "_BookmarkedAcademies"("A", "B");

-- CreateIndex
CREATE INDEX "_BookmarkedAcademies_B_index" ON "_BookmarkedAcademies"("B");

-- AddForeignKey
ALTER TABLE "_BookmarkedAcademies" ADD CONSTRAINT "_BookmarkedAcademies_A_fkey" FOREIGN KEY ("A") REFERENCES "Academy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BookmarkedAcademies" ADD CONSTRAINT "_BookmarkedAcademies_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
