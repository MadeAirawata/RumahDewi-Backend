/*
  Warnings:

  - Added the required column `total_month` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `payments` ADD COLUMN `total_month` SMALLINT NOT NULL;
