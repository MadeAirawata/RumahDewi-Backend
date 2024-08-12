-- DropForeignKey
ALTER TABLE `rooms` DROP FOREIGN KEY `rooms_user_id_fkey`;

-- AlterTable
ALTER TABLE `rooms` MODIFY `user_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `rooms` ADD CONSTRAINT `rooms_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
