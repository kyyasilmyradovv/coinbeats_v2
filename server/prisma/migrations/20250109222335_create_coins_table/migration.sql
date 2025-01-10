-- CreateTable
CREATE TABLE "Coins" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "image" TEXT,
    "price" DOUBLE PRECISION,
    "price_date" TIMESTAMP(3),
    "market_cap" DOUBLE PRECISION,
    "market_cap_rank" INTEGER,
    "ath" DOUBLE PRECISION,
    "ath_date" TIMESTAMP(3),
    "atl" DOUBLE PRECISION,
    "atl_date" TIMESTAMP(3),
    "listed_date" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "gecko_id" TEXT,
    "coinranking_uuid" TEXT,
    "contract_addresses" TEXT[],
    "view_count" INTEGER DEFAULT 0,
    "homepage_links" TEXT[],
    "official_forum_urls" TEXT[],
    "twitter_screen_name" TEXT,
    "price_change_1h" DOUBLE PRECISION,
    "price_change_24h" DOUBLE PRECISION,
    "price_change_7d" DOUBLE PRECISION,
    "price_change_14d" DOUBLE PRECISION,
    "price_change_30d" DOUBLE PRECISION,
    "price_change_1y" DOUBLE PRECISION,

    CONSTRAINT "Coins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Coins_name_key" ON "Coins"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Coins_gecko_id_key" ON "Coins"("gecko_id");

-- CreateIndex
CREATE UNIQUE INDEX "Coins_coinranking_uuid_key" ON "Coins"("coinranking_uuid");
