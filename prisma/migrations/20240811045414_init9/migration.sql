/*
  Warnings:

  - You are about to drop the `user_rooms` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `rooms` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `rooms` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `user_rooms` DROP FOREIGN KEY `user_rooms_room_id_fkey`;

-- DropForeignKey
ALTER TABLE `user_rooms` DROP FOREIGN KEY `user_rooms_user_id_fkey`;

-- AlterTable
ALTER TABLE `payments` ADD COLUMN `rent_for` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `rooms` ADD COLUMN `user_id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `due_date` DATETIME(3) NULL,
    ADD COLUMN `occupied_since` DATETIME(3) NULL,
    ADD COLUMN `status` ENUM('CALON', 'BARU', 'LAMA') NOT NULL DEFAULT 'CALON';

-- DropTable
DROP TABLE `user_rooms`;

-- CreateIndex
CREATE UNIQUE INDEX `rooms_user_id_key` ON `rooms`(`user_id`);

-- AddForeignKey
ALTER TABLE `rooms` ADD CONSTRAINT `rooms_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
