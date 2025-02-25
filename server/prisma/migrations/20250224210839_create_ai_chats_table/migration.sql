-- CreateTable
CREATE TABLE "AiChats" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiChats_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AiChats" ADD CONSTRAINT "AiChats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
