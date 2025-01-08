-- CreateTable
CREATE TABLE "Coins" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "image" TEXT,
    "price" TEXT,
    "price_date" TIMESTAMP(3),
    "market_cap" TEXT,
    "market_cup_rank" INTEGER,
    "ath" TEXT,
    "ath_date" TIMESTAMP(3),
    "atl" TEXT,
    "atl_date" TIMESTAMP(3),
    "listed_date" TEXT,
    "price_change_24h" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "gecko_id" TEXT,
    "coinranking_uuid" TEXT,
    "contract_addresses" TEXT[],
    "view_count" DOUBLE PRECISION DEFAULT 0,

    CONSTRAINT "Coins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Coins_name_key" ON "Coins"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Coins_gecko_id_key" ON "Coins"("gecko_id");

-- CreateIndex
CREATE UNIQUE INDEX "Coins_coinranking_uuid_key" ON "Coins"("coinranking_uuid");
