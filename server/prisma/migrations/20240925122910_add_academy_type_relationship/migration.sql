-- CreateTable
CREATE TABLE "_AcademyToAcademyType" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AcademyToAcademyType_AB_unique" ON "_AcademyToAcademyType"("A", "B");

-- CreateIndex
CREATE INDEX "_AcademyToAcademyType_B_index" ON "_AcademyToAcademyType"("B");

-- AddForeignKey
ALTER TABLE "_AcademyToAcademyType" ADD CONSTRAINT "_AcademyToAcademyType_A_fkey" FOREIGN KEY ("A") REFERENCES "Academy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AcademyToAcademyType" ADD CONSTRAINT "_AcademyToAcademyType_B_fkey" FOREIGN KEY ("B") REFERENCES "AcademyType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
