/*
  Warnings:

  - You are about to drop the column `room_id` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `rooms` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `users_room_id_fkey`;

-- AlterTable
ALTER TABLE `rooms` ADD COLUMN `user_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `room_id`;

-- CreateIndex
CREATE UNIQUE INDEX `rooms_user_id_key` ON `rooms`(`user_id`);

-- AddForeignKey
ALTER TABLE `rooms` ADD CONSTRAINT `rooms_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
