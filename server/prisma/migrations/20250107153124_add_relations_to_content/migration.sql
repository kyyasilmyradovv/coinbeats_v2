-- AlterEnum
ALTER TYPE "DisplayLocation" ADD VALUE 'CONTENT_PAGE';

-- AlterEnum
ALTER TYPE "TaskType" ADD VALUE 'CONTENT_SPECIFIC';

-- AlterTable
ALTER TABLE "VerificationTask" ADD COLUMN     "educatorId" INTEGER,
ADD COLUMN     "podcastId" INTEGER,
ADD COLUMN     "telegramGroupId" INTEGER,
ADD COLUMN     "tutorialId" INTEGER,
ADD COLUMN     "youtubeChannelId" INTEGER;

-- AddForeignKey
ALTER TABLE "VerificationTask" ADD CONSTRAINT "VerificationTask_educatorId_fkey" FOREIGN KEY ("educatorId") REFERENCES "Educator"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationTask" ADD CONSTRAINT "VerificationTask_tutorialId_fkey" FOREIGN KEY ("tutorialId") REFERENCES "Tutorial"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationTask" ADD CONSTRAINT "VerificationTask_podcastId_fkey" FOREIGN KEY ("podcastId") REFERENCES "Podcast"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationTask" ADD CONSTRAINT "VerificationTask_youtubeChannelId_fkey" FOREIGN KEY ("youtubeChannelId") REFERENCES "YoutubeChannel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationTask" ADD CONSTRAINT "VerificationTask_telegramGroupId_fkey" FOREIGN KEY ("telegramGroupId") REFERENCES "TelegramGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
