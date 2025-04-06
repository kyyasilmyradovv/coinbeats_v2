-- CreateTable
CREATE TABLE "EmailVerifications" (
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerifications_email_key" ON "EmailVerifications"("email");
