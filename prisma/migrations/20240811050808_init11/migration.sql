/*
  Warnings:

  - You are about to drop the column `user_id` on the `rooms` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[room_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `rooms` DROP FOREIGN KEY `rooms_user_id_fkey`;

-- AlterTable
ALTER TABLE `rooms` DROP COLUMN `user_id`;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `room_id` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `users_room_id_key` ON `users`(`room_id`);

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_room_id_fkey` FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
