-- CreateTable
CREATE TABLE "Counter" (
    "table" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0
);

-- CreateIndex
CREATE UNIQUE INDEX "Counter_table_key" ON "Counter"("table");
