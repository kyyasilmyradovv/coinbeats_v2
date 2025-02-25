-- CreateTable
CREATE TABLE "AiChatMessages" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "chat_id" INTEGER NOT NULL,

    CONSTRAINT "AiChatMessages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AcademyToAiChatMessages" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AcademyToAiChatMessages_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_AcademyToAiChatMessages_B_index" ON "_AcademyToAiChatMessages"("B");

-- AddForeignKey
ALTER TABLE "AiChatMessages" ADD CONSTRAINT "AiChatMessages_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "AiChats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AcademyToAiChatMessages" ADD CONSTRAINT "_AcademyToAiChatMessages_A_fkey" FOREIGN KEY ("A") REFERENCES "Academy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AcademyToAiChatMessages" ADD CONSTRAINT "_AcademyToAiChatMessages_B_fkey" FOREIGN KEY ("B") REFERENCES "AiChatMessages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
