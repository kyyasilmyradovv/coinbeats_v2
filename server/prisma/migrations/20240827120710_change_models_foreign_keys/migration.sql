-- DropForeignKey
ALTER TABLE "Choice" DROP CONSTRAINT "Choice_academyQuestionId_fkey";

-- AddForeignKey
ALTER TABLE "Choice" ADD CONSTRAINT "Choice_academyQuestionId_fkey" FOREIGN KEY ("academyQuestionId") REFERENCES "AcademyQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
