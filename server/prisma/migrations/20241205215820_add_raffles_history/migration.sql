-- CreateTable
CREATE TABLE "RafflesHistory" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "winnersCount" INTEGER,
    "minPoints" INTEGER,
    "minRaffles" INTEGER,

    CONSTRAINT "RafflesHistory_pkey" PRIMARY KEY ("id")
);
