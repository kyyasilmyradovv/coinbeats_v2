/*
  Warnings:

  - You are about to drop the `QuizTemplate` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `initialQuestionId` to the `AcademyQuestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quizQuestion` to the `AcademyQuestion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AcademyQuestion" ADD COLUMN     "answer" TEXT,
ADD COLUMN     "initialQuestionId" INTEGER NOT NULL,
ADD COLUMN     "quizQuestion" TEXT NOT NULL;

-- DropTable
DROP TABLE "QuizTemplate";

-- CreateTable
CREATE TABLE "InitialQuestion" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "InitialQuestion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AcademyQuestion" ADD CONSTRAINT "AcademyQuestion_initialQuestionId_fkey" FOREIGN KEY ("initialQuestionId") REFERENCES "InitialQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
