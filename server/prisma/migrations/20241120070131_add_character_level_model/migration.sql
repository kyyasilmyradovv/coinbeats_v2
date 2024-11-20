-- CreateTable
CREATE TABLE "CharacterLevel" (
    "id" SERIAL NOT NULL,
    "levelName" TEXT NOT NULL,
    "minPoints" INTEGER NOT NULL,
    "maxPoints" INTEGER NOT NULL,
    "rewardPoints" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CharacterLevel_pkey" PRIMARY KEY ("id")
);
