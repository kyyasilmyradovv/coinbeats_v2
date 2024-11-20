-- AlterTable
ALTER TABLE "User" ADD COLUMN     "characterLevelId" INTEGER;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_characterLevelId_fkey" FOREIGN KEY ("characterLevelId") REFERENCES "CharacterLevel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
