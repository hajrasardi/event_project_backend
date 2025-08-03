/*
  Warnings:

  - You are about to drop the column `created_at` on the `Accounts` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `Accounts` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `Accounts` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `Accounts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Accounts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Accounts" DROP COLUMN "created_at",
DROP COLUMN "isVerified",
DROP COLUMN "password",
ADD COLUMN     "email" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Accounts_email_key" ON "Accounts"("email");
