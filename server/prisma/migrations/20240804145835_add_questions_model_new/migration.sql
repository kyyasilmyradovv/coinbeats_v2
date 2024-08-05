/*
  Warnings:

  - You are about to drop the column `coverPhoto` on the `Academy` table. All the data in the column will be lost.
  - You are about to drop the column `logo` on the `Academy` table. All the data in the column will be lost.
  - You are about to drop the column `questionId` on the `Choice` table. All the data in the column will be lost.
  - You are about to drop the `Question` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_QuestionToQuizTemplate` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `academyQuestionId` to the `Choice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `question` to the `QuizTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Choice" DROP CONSTRAINT "Choice_questionId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_academyId_fkey";

-- DropForeignKey
ALTER TABLE "_QuestionToQuizTemplate" DROP CONSTRAINT "_QuestionToQuizTemplate_A_fkey";

-- DropForeignKey
ALTER TABLE "_QuestionToQuizTemplate" DROP CONSTRAINT "_QuestionToQuizTemplate_B_fkey";

-- AlterTable
ALTER TABLE "Academy" DROP COLUMN "coverPhoto",
DROP COLUMN "logo",
ADD COLUMN     "coverPhotoUrl" TEXT,
ADD COLUMN     "logoUrl" TEXT;

-- AlterTable
ALTER TABLE "Choice" DROP COLUMN "questionId",
ADD COLUMN     "academyQuestionId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "QuizTemplate" ADD COLUMN     "content" TEXT,
ADD COLUMN     "question" TEXT NOT NULL;

-- DropTable
DROP TABLE "Question";

-- DropTable
DROP TABLE "_QuestionToQuizTemplate";

-- CreateTable
CREATE TABLE "AcademyQuestion" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "academyId" INTEGER NOT NULL,

    CONSTRAINT "AcademyQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserResponse" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "choiceId" INTEGER NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "pointsAwarded" INTEGER NOT NULL,

    CONSTRAINT "UserResponse_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AcademyQuestion" ADD CONSTRAINT "AcademyQuestion_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "Academy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Choice" ADD CONSTRAINT "Choice_academyQuestionId_fkey" FOREIGN KEY ("academyQuestionId") REFERENCES "AcademyQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserResponse" ADD CONSTRAINT "UserResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserResponse" ADD CONSTRAINT "UserResponse_choiceId_fkey" FOREIGN KEY ("choiceId") REFERENCES "Choice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
