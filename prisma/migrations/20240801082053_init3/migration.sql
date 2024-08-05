/*
  Warnings:

  - Made the column `user_id` on table `user_rooms` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `user_rooms` DROP FOREIGN KEY `user_rooms_user_id_fkey`;

-- AlterTable
ALTER TABLE `payments` ADD COLUMN `payment_image` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user_rooms` MODIFY `user_id` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `user_rooms` ADD CONSTRAINT `user_rooms_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
