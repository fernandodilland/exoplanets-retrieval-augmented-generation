-- Use the database
USE `exoplanets-rag`;

-- Create users table
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uid` CHAR(36) NOT NULL DEFAULT (UUID()),
    `user` VARCHAR(100) NOT NULL,
    `password` VARCHAR(255) NOT NULL COMMENT 'Argon2id hash',
    `last_access` TIMESTAMP NULL DEFAULT NULL,
    `last_modified` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_uid` (`uid`),
    UNIQUE KEY `unique_user` (`user`),
    INDEX `idx_user` (`user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create files table
CREATE TABLE IF NOT EXISTS `files` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uid` CHAR(36) NOT NULL DEFAULT (UUID()),
    `user_id` INT UNSIGNED NOT NULL,
    `absolute_path` VARCHAR(500) NOT NULL,
    `url` VARCHAR(500) NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_uid` (`uid`),
    INDEX `idx_user_id` (`user_id`),
    CONSTRAINT `fk_files_user` FOREIGN KEY (`user_id`) 
        REFERENCES `users` (`id`) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create responses table
CREATE TABLE IF NOT EXISTS `responses` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uid` CHAR(36) NOT NULL DEFAULT (UUID()),
    `user_id` INT UNSIGNED NOT NULL,
    `question` TEXT NOT NULL,
    `response` TEXT NOT NULL,
    `probability_percentage` INT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_uid` (`uid`),
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_created_at` (`created_at`),
    CONSTRAINT `fk_responses_user` FOREIGN KEY (`user_id`) 
        REFERENCES `users` (`id`) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
