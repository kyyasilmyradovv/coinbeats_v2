-- CreateTable
CREATE TABLE "SurpriseBox" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "completedAcademies" INTEGER NOT NULL DEFAULT 0,
    "lastBox" INTEGER NOT NULL DEFAULT 0,
    "nextBox" INTEGER NOT NULL DEFAULT 3,

    CONSTRAINT "SurpriseBox_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SurpriseBox" ADD CONSTRAINT "SurpriseBox_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
