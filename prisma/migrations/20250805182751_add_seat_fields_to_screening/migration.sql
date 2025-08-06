/*
  Warnings:

  - Added the required column `availableSeats` to the `Screening` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalSeats` to the `Screening` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Screening" ADD COLUMN     "availableSeats" INTEGER NOT NULL,
ADD COLUMN     "totalSeats" INTEGER NOT NULL;
