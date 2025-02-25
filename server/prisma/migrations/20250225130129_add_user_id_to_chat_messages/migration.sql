/*
  Warnings:

  - Added the required column `user_id` to the `AiChatMessages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AiChatMessages" ADD COLUMN     "user_id" INTEGER NOT NULL;
