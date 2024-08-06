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

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_academyId_key" ON "Subscription"("academyId");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "Academy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
