-- CreateTable
CREATE TABLE "AiTopics" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiTopics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AiTopicAcademies" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AiTopicAcademies_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_AiTopicAcademies_B_index" ON "_AiTopicAcademies"("B");

-- AddForeignKey
ALTER TABLE "_AiTopicAcademies" ADD CONSTRAINT "_AiTopicAcademies_A_fkey" FOREIGN KEY ("A") REFERENCES "Academy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AiTopicAcademies" ADD CONSTRAINT "_AiTopicAcademies_B_fkey" FOREIGN KEY ("B") REFERENCES "AiTopics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
