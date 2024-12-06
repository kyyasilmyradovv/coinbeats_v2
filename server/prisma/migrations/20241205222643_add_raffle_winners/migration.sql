-- CreateTable
CREATE TABLE "RaffleWinners" (
    "id" SERIAL NOT NULL,
    "winningAmount" INTEGER,
    "raffleAmount" INTEGER,
    "userId" INTEGER NOT NULL,
    "historyId" INTEGER NOT NULL,

    CONSTRAINT "RaffleWinners_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RaffleWinners" ADD CONSTRAINT "RaffleWinners_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaffleWinners" ADD CONSTRAINT "RaffleWinners_historyId_fkey" FOREIGN KEY ("historyId") REFERENCES "RafflesHistory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
