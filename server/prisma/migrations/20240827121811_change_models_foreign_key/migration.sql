-- DropForeignKey
ALTER TABLE "UserResponse" DROP CONSTRAINT "UserResponse_choiceId_fkey";

-- AddForeignKey
ALTER TABLE "UserResponse" ADD CONSTRAINT "UserResponse_choiceId_fkey" FOREIGN KEY ("choiceId") REFERENCES "Choice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
