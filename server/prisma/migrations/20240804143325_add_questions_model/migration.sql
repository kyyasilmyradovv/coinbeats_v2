/*
  Warnings:

  - You are about to drop the column `content` on the `Question` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Academy" ADD COLUMN     "coverPhoto" TEXT,
ADD COLUMN     "logo" TEXT,
ADD COLUMN     "webpageUrl" TEXT;

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "content",
ADD COLUMN     "quizText" TEXT;

-- CreateTable
CREATE TABLE "QuizTemplate" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "QuizTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_QuestionToQuizTemplate" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_QuestionToQuizTemplate_AB_unique" ON "_QuestionToQuizTemplate"("A", "B");

-- CreateIndex
CREATE INDEX "_QuestionToQuizTemplate_B_index" ON "_QuestionToQuizTemplate"("B");

-- AddForeignKey
ALTER TABLE "_QuestionToQuizTemplate" ADD CONSTRAINT "_QuestionToQuizTemplate_A_fkey" FOREIGN KEY ("A") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QuestionToQuizTemplate" ADD CONSTRAINT "_QuestionToQuizTemplate_B_fkey" FOREIGN KEY ("B") REFERENCES "QuizTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
