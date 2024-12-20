-- CreateEnum
CREATE TYPE "ContentOrigin" AS ENUM ('PLATFORM_BASED', 'CREATOR_BASED');

-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('PLATFORM_SPECIFIC', 'ACADEMY_SPECIFIC');

-- CreateEnum
CREATE TYPE "IntervalType" AS ENUM ('ONETIME', 'REPEATED');

-- CreateEnum
CREATE TYPE "DisplayLocation" AS ENUM ('QUEST_TAB', 'END_OF_ACADEMY', 'OTHER', 'GAMES_PAGE', 'HOME_PAGE', 'POINTS_PAGE');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('X', 'YOUTUBE', 'FACEBOOK', 'INSTAGRAM', 'TELEGRAM', 'DISCORD', 'EMAIL', 'NONE', 'LINKEDIN');

-- CreateEnum
CREATE TYPE "VerificationMethod" AS ENUM ('FOLLOW_USER', 'TWEET', 'RETWEET', 'LIKE_TWEET', 'ADD_TO_BIO', 'JOIN_TELEGRAM_CHANNEL', 'INVITE_TELEGRAM_FRIEND', 'INVITE_WITH_REFERRAL', 'SUBSCRIBE_YOUTUBE_CHANNEL', 'WATCH_YOUTUBE_VIDEO', 'FOLLOW_INSTAGRAM_USER', 'JOIN_DISCORD_CHANNEL', 'PROVIDE_EMAIL', 'SHORT_CIRCUIT', 'COMMENT_ON_TWEET', 'LEAVE_FEEDBACK', 'MEME_TWEET', 'FOLLOW_LINKEDIN_USER');

-- CreateEnum
CREATE TYPE "LessonType" AS ENUM ('YOUTUBE_VIDEO', 'TWITTER_THREAD', 'ARTICLE');

-- CreateEnum
CREATE TYPE "TutorialType" AS ENUM ('WALLET_SETUP', 'CEX_TUTORIAL', 'APP_TUTORIAL', 'RESEARCH_TUTORIAL', 'OTHER');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'CREATOR', 'ADMIN', 'SUPERADMIN');

-- CreateEnum
CREATE TYPE "OverallRaffleType" AS ENUM ('PLATFORM', 'ACADEMY');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "telegramUserId" BIGINT NOT NULL,
    "emailConfirmationToken" TEXT,
    "emailConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "referralCode" TEXT,
    "referredByUserId" INTEGER,
    "roles" "Role"[] DEFAULT ARRAY['USER']::"Role"[],
    "referralCompletionChecked" BOOLEAN NOT NULL DEFAULT true,
    "erc20WalletAddress" TEXT,
    "solanaWalletAddress" TEXT,
    "tonWalletAddress" TEXT,
    "characterLevelId" INTEGER,
    "raffleAmount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TwitterAccount" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "twitterUserId" TEXT NOT NULL,
    "twitterUsername" TEXT NOT NULL,
    "twitterAccessToken" TEXT,
    "twitterAccessTokenSecret" TEXT,
    "twitterRefreshToken" TEXT,
    "twitterTokenExpiresAt" TIMESTAMP(3),
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disconnectedAt" TIMESTAMP(3),

    CONSTRAINT "TwitterAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Academy" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "creatorId" INTEGER NOT NULL,
    "coingecko" TEXT,
    "congratsVideo" TEXT,
    "discord" TEXT,
    "getStarted" TEXT,
    "status" TEXT NOT NULL,
    "teamBackground" TEXT,
    "telegram" TEXT,
    "ticker" TEXT,
    "twitter" TEXT,
    "webpageUrl" TEXT,
    "coverPhotoUrl" TEXT,
    "logoUrl" TEXT,
    "xp" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sponsored" BOOLEAN NOT NULL DEFAULT false,
    "contractAddress" TEXT,
    "tokenomics" JSONB,
    "dexScreener" TEXT,
    "academyTypeId" INTEGER,

    CONSTRAINT "Academy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" SERIAL NOT NULL,
    "academyId" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT false,
    "monthlyFee" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionSettings" (
    "id" SERIAL NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "monthlyFee" DOUBLE PRECISION NOT NULL DEFAULT 0.0,

    CONSTRAINT "SubscriptionSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademyType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "restricted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AcademyType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InitialQuestion" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "academyTypeId" INTEGER NOT NULL,

    CONSTRAINT "InitialQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Choice" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "academyQuestionId" INTEGER NOT NULL,

    CONSTRAINT "Choice_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "AcademyQuestion" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "academyId" INTEGER NOT NULL,
    "answer" TEXT,
    "initialQuestionId" INTEGER NOT NULL,
    "quizQuestion" TEXT NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "video" TEXT,

    CONSTRAINT "AcademyQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Raffle" (
    "id" SERIAL NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "academyId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "desc" TEXT,
    "taskId" INTEGER,
    "userId" INTEGER,

    CONSTRAINT "Raffle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quest" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "academyId" INTEGER NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Quest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Point" (
    "id" SERIAL NOT NULL,
    "value" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "academyId" INTEGER,
    "verificationTaskId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,

    CONSTRAINT "Point_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "sessionStart" TIMESTAMP(3) NOT NULL,
    "sessionEnd" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "routeDurations" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "telegramUserId" BIGINT NOT NULL,

    CONSTRAINT "SessionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Educator" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "youtubeUrl" TEXT,
    "twitterUrl" TEXT,
    "telegramUrl" TEXT,
    "discordUrl" TEXT,
    "coverPhotoUrl" TEXT,
    "logoUrl" TEXT,
    "contentOrigin" "ContentOrigin" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Educator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "contentUrl" TEXT NOT NULL,
    "type" "LessonType" NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "educatorId" INTEGER NOT NULL,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Podcast" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "spotifyUrl" TEXT,
    "appleUrl" TEXT,
    "youtubeUrl" TEXT,
    "coverPhotoUrl" TEXT,
    "logoUrl" TEXT,
    "contentOrigin" "ContentOrigin" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Podcast_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tutorial" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "contentUrl" TEXT NOT NULL,
    "type" "TutorialType" NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "coverPhotoUrl" TEXT,
    "description" TEXT,
    "logoUrl" TEXT,
    "contentOrigin" "ContentOrigin" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tutorial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chain" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Chain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationTask" (
    "id" SERIAL NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "academyId" INTEGER,
    "displayLocation" "DisplayLocation" NOT NULL,
    "intervalType" "IntervalType" NOT NULL,
    "name" TEXT NOT NULL,
    "repeatInterval" INTEGER,
    "shortCircuit" BOOLEAN NOT NULL DEFAULT false,
    "shortCircuitTimer" INTEGER,
    "taskType" "TaskType" NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "verificationMethod" "VerificationMethod",
    "xp" INTEGER NOT NULL DEFAULT 0,
    "platform" "Platform",
    "parameters" JSONB,

    CONSTRAINT "VerificationTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserVerification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "verificationTaskId" INTEGER NOT NULL,
    "academyId" INTEGER,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pointsAwarded" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "lastLoginDate" TIMESTAMP(3),
    "streakCount" INTEGER NOT NULL DEFAULT 1,
    "parameters" JSONB,
    "shortCircuit" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTaskSubmission" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "taskId" INTEGER NOT NULL,
    "submissionText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserTaskSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterLevel" (
    "id" SERIAL NOT NULL,
    "levelName" TEXT NOT NULL,
    "minPoints" INTEGER NOT NULL,
    "maxPoints" INTEGER NOT NULL,
    "rewardPoints" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lottieFileUrl" TEXT,

    CONSTRAINT "CharacterLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurpriseBox" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "completedAcademies" INTEGER NOT NULL DEFAULT 0,
    "lastBox" INTEGER NOT NULL DEFAULT 0,
    "nextBox" INTEGER NOT NULL DEFAULT 3,

    CONSTRAINT "SurpriseBox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OverallRaffle" (
    "id" SERIAL NOT NULL,
    "minAmount" INTEGER NOT NULL DEFAULT 0,
    "winnersCount" INTEGER NOT NULL DEFAULT 0,
    "deadline" TIMESTAMP(3),
    "minPoints" INTEGER,
    "reward" TEXT,
    "academyId" INTEGER,
    "creatorId" INTEGER,
    "isActive" BOOLEAN DEFAULT false,
    "type" "OverallRaffleType",

    CONSTRAINT "OverallRaffle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RafflesHistory" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "startDate" DATE,
    "endDate" DATE,
    "winnersCount" INTEGER,
    "minPoints" INTEGER,
    "minRaffles" INTEGER,
    "overallRaffleId" INTEGER,

    CONSTRAINT "RafflesHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RaffleWinners" (
    "id" SERIAL NOT NULL,
    "winningAmount" TEXT,
    "raffleAmount" INTEGER,
    "userId" INTEGER NOT NULL,
    "historyId" INTEGER NOT NULL,

    CONSTRAINT "RaffleWinners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademyRaffleEntries" (
    "id" SERIAL NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "userId" INTEGER NOT NULL,
    "academyId" INTEGER NOT NULL,

    CONSTRAINT "AcademyRaffleEntries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AcademyToCategory" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AcademyToChain" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_BookmarkedAcademies" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_UserAcademyTypes" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_EducatorCategories" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_PodcastCategories" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_TutorialCategories" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_EducatorChains" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_PodcastChains" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_TutorialChains" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_telegramUserId_key" ON "User"("telegramUserId");

-- CreateIndex
CREATE UNIQUE INDEX "User_emailConfirmationToken_key" ON "User"("emailConfirmationToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_academyId_key" ON "Subscription"("academyId");

-- CreateIndex
CREATE UNIQUE INDEX "AcademyType_name_key" ON "AcademyType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Chain_name_key" ON "Chain"("name");

-- CreateIndex
CREATE INDEX "UserTaskSubmission_userId_idx" ON "UserTaskSubmission"("userId");

-- CreateIndex
CREATE INDEX "UserTaskSubmission_taskId_idx" ON "UserTaskSubmission"("taskId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_key_key" ON "Setting"("key");

-- CreateIndex
CREATE UNIQUE INDEX "OverallRaffle_academyId_key" ON "OverallRaffle"("academyId");

-- CreateIndex
CREATE UNIQUE INDEX "AcademyRaffleEntries_userId_academyId_key" ON "AcademyRaffleEntries"("userId", "academyId");

-- CreateIndex
CREATE UNIQUE INDEX "_AcademyToCategory_AB_unique" ON "_AcademyToCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_AcademyToCategory_B_index" ON "_AcademyToCategory"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AcademyToChain_AB_unique" ON "_AcademyToChain"("A", "B");

-- CreateIndex
CREATE INDEX "_AcademyToChain_B_index" ON "_AcademyToChain"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_BookmarkedAcademies_AB_unique" ON "_BookmarkedAcademies"("A", "B");

-- CreateIndex
CREATE INDEX "_BookmarkedAcademies_B_index" ON "_BookmarkedAcademies"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_UserAcademyTypes_AB_unique" ON "_UserAcademyTypes"("A", "B");

-- CreateIndex
CREATE INDEX "_UserAcademyTypes_B_index" ON "_UserAcademyTypes"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_EducatorCategories_AB_unique" ON "_EducatorCategories"("A", "B");

-- CreateIndex
CREATE INDEX "_EducatorCategories_B_index" ON "_EducatorCategories"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PodcastCategories_AB_unique" ON "_PodcastCategories"("A", "B");

-- CreateIndex
CREATE INDEX "_PodcastCategories_B_index" ON "_PodcastCategories"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_TutorialCategories_AB_unique" ON "_TutorialCategories"("A", "B");

-- CreateIndex
CREATE INDEX "_TutorialCategories_B_index" ON "_TutorialCategories"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_EducatorChains_AB_unique" ON "_EducatorChains"("A", "B");

-- CreateIndex
CREATE INDEX "_EducatorChains_B_index" ON "_EducatorChains"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PodcastChains_AB_unique" ON "_PodcastChains"("A", "B");

-- CreateIndex
CREATE INDEX "_PodcastChains_B_index" ON "_PodcastChains"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_TutorialChains_AB_unique" ON "_TutorialChains"("A", "B");

-- CreateIndex
CREATE INDEX "_TutorialChains_B_index" ON "_TutorialChains"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_characterLevelId_fkey" FOREIGN KEY ("characterLevelId") REFERENCES "CharacterLevel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_referredByUserId_fkey" FOREIGN KEY ("referredByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TwitterAccount" ADD CONSTRAINT "TwitterAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Academy" ADD CONSTRAINT "Academy_academyTypeId_fkey" FOREIGN KEY ("academyTypeId") REFERENCES "AcademyType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Academy" ADD CONSTRAINT "Academy_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "Academy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InitialQuestion" ADD CONSTRAINT "InitialQuestion_academyTypeId_fkey" FOREIGN KEY ("academyTypeId") REFERENCES "AcademyType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Choice" ADD CONSTRAINT "Choice_academyQuestionId_fkey" FOREIGN KEY ("academyQuestionId") REFERENCES "AcademyQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserResponse" ADD CONSTRAINT "UserResponse_choiceId_fkey" FOREIGN KEY ("choiceId") REFERENCES "Choice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserResponse" ADD CONSTRAINT "UserResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademyQuestion" ADD CONSTRAINT "AcademyQuestion_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "Academy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademyQuestion" ADD CONSTRAINT "AcademyQuestion_initialQuestionId_fkey" FOREIGN KEY ("initialQuestionId") REFERENCES "InitialQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Raffle" ADD CONSTRAINT "Raffle_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "Academy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Raffle" ADD CONSTRAINT "Raffle_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "VerificationTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Raffle" ADD CONSTRAINT "Raffle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quest" ADD CONSTRAINT "Quest_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "Academy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Point" ADD CONSTRAINT "Point_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "Academy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Point" ADD CONSTRAINT "Point_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Point" ADD CONSTRAINT "Point_verificationTaskId_fkey" FOREIGN KEY ("verificationTaskId") REFERENCES "VerificationTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionLog" ADD CONSTRAINT "SessionLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_educatorId_fkey" FOREIGN KEY ("educatorId") REFERENCES "Educator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationTask" ADD CONSTRAINT "VerificationTask_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "Academy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserVerification" ADD CONSTRAINT "UserVerification_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "Academy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserVerification" ADD CONSTRAINT "UserVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserVerification" ADD CONSTRAINT "UserVerification_verificationTaskId_fkey" FOREIGN KEY ("verificationTaskId") REFERENCES "VerificationTask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTaskSubmission" ADD CONSTRAINT "UserTaskSubmission_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "VerificationTask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTaskSubmission" ADD CONSTRAINT "UserTaskSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurpriseBox" ADD CONSTRAINT "SurpriseBox_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaffleWinners" ADD CONSTRAINT "RaffleWinners_historyId_fkey" FOREIGN KEY ("historyId") REFERENCES "RafflesHistory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaffleWinners" ADD CONSTRAINT "RaffleWinners_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademyRaffleEntries" ADD CONSTRAINT "AcademyRaffleEntries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AcademyToCategory" ADD CONSTRAINT "_AcademyToCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "Academy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AcademyToCategory" ADD CONSTRAINT "_AcademyToCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AcademyToChain" ADD CONSTRAINT "_AcademyToChain_A_fkey" FOREIGN KEY ("A") REFERENCES "Academy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AcademyToChain" ADD CONSTRAINT "_AcademyToChain_B_fkey" FOREIGN KEY ("B") REFERENCES "Chain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BookmarkedAcademies" ADD CONSTRAINT "_BookmarkedAcademies_A_fkey" FOREIGN KEY ("A") REFERENCES "Academy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BookmarkedAcademies" ADD CONSTRAINT "_BookmarkedAcademies_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserAcademyTypes" ADD CONSTRAINT "_UserAcademyTypes_A_fkey" FOREIGN KEY ("A") REFERENCES "AcademyType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserAcademyTypes" ADD CONSTRAINT "_UserAcademyTypes_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EducatorCategories" ADD CONSTRAINT "_EducatorCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EducatorCategories" ADD CONSTRAINT "_EducatorCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "Educator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PodcastCategories" ADD CONSTRAINT "_PodcastCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PodcastCategories" ADD CONSTRAINT "_PodcastCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "Podcast"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TutorialCategories" ADD CONSTRAINT "_TutorialCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TutorialCategories" ADD CONSTRAINT "_TutorialCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "Tutorial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EducatorChains" ADD CONSTRAINT "_EducatorChains_A_fkey" FOREIGN KEY ("A") REFERENCES "Chain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EducatorChains" ADD CONSTRAINT "_EducatorChains_B_fkey" FOREIGN KEY ("B") REFERENCES "Educator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PodcastChains" ADD CONSTRAINT "_PodcastChains_A_fkey" FOREIGN KEY ("A") REFERENCES "Chain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PodcastChains" ADD CONSTRAINT "_PodcastChains_B_fkey" FOREIGN KEY ("B") REFERENCES "Podcast"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TutorialChains" ADD CONSTRAINT "_TutorialChains_A_fkey" FOREIGN KEY ("A") REFERENCES "Chain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TutorialChains" ADD CONSTRAINT "_TutorialChains_B_fkey" FOREIGN KEY ("B") REFERENCES "Tutorial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

