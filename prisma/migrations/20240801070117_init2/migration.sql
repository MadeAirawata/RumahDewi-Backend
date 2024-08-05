/*
  Warnings:

  - Added the required column `room_id` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `payments` ADD COLUMN `room_id` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_room_id_fkey` FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
