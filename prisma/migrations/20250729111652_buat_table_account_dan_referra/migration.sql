/*
  Warnings:

  - A unique constraint covering the columns `[referral]` on the table `Accounts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `password` to the `Accounts` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `role` on the `Accounts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ORGANIZER');

-- AlterTable
ALTER TABLE "Accounts" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "referral" TEXT,
DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL;

-- DropEnum
DROP TYPE "ROLE";

-- CreateTable
CREATE TABLE "ReferralAccount" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "referrerid" INTEGER NOT NULL,
    "referredid" INTEGER NOT NULL,

    CONSTRAINT "ReferralAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReferralAccount_referrerid_key" ON "ReferralAccount"("referrerid");

-- CreateIndex
CREATE UNIQUE INDEX "ReferralAccount_referredid_key" ON "ReferralAccount"("referredid");

-- CreateIndex
CREATE UNIQUE INDEX "Accounts_referral_key" ON "Accounts"("referral");

-- AddForeignKey
ALTER TABLE "ReferralAccount" ADD CONSTRAINT "ReferralAccount_referrerid_fkey" FOREIGN KEY ("referrerid") REFERENCES "Accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralAccount" ADD CONSTRAINT "ReferralAccount_referredid_fkey" FOREIGN KEY ("referredid") REFERENCES "Accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
