-- AlterTable
ALTER TABLE "AcademyType" ADD COLUMN     "restricted" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "_UserAcademyTypes" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_UserAcademyTypes_AB_unique" ON "_UserAcademyTypes"("A", "B");

-- CreateIndex
CREATE INDEX "_UserAcademyTypes_B_index" ON "_UserAcademyTypes"("B");

-- AddForeignKey
ALTER TABLE "_UserAcademyTypes" ADD CONSTRAINT "_UserAcademyTypes_A_fkey" FOREIGN KEY ("A") REFERENCES "AcademyType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserAcademyTypes" ADD CONSTRAINT "_UserAcademyTypes_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
