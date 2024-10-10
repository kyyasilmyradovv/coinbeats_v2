-- CreateTable
CREATE TABLE "UserTaskSubmission" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "taskId" INTEGER NOT NULL,
    "submissionText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserTaskSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserTaskSubmission_userId_idx" ON "UserTaskSubmission"("userId");

-- CreateIndex
CREATE INDEX "UserTaskSubmission_taskId_idx" ON "UserTaskSubmission"("taskId");

-- AddForeignKey
ALTER TABLE "UserTaskSubmission" ADD CONSTRAINT "UserTaskSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTaskSubmission" ADD CONSTRAINT "UserTaskSubmission_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "VerificationTask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
