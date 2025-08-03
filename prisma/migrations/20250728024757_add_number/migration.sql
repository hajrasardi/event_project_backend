/*
  Warnings:

  - You are about to drop the column `email` on the `Accounts` table. All the data in the column will be lost.
  - Added the required column `phone_number` to the `Accounts` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Accounts_email_key";

-- AlterTable
ALTER TABLE "Accounts" DROP COLUMN "email",
ADD COLUMN     "phone_number" INTEGER NOT NULL;
