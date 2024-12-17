-- CreateTable
CREATE TABLE "AcademyRaffleEntries" (
    "id" SERIAL NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "raffleId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "AcademyRaffleEntries_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AcademyRaffleEntries" ADD CONSTRAINT "AcademyRaffleEntries_raffleId_fkey" FOREIGN KEY ("raffleId") REFERENCES "OverallRaffle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademyRaffleEntries" ADD CONSTRAINT "AcademyRaffleEntries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
