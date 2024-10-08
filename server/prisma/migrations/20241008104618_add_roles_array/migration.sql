/*
  Warnings:

  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.

*/
-- Step 1: Add the new `roles` column
ALTER TABLE "User" ADD COLUMN "roles" "Role"[] NOT NULL DEFAULT '{USER}';

-- Step 2: Migrate data from `role` to `roles`
UPDATE "User" SET "roles" = ARRAY["role"];

-- Step 3: Drop the old `role` column
ALTER TABLE "User" DROP COLUMN "role";
