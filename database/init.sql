CREATE DATABASE IF NOT EXISTS remindme;

USE remindme;

CREATE TABLE `users` (
   `user_id` int NOT NULL AUTO_INCREMENT,
   `username` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
   `password` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
   `gmail` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
   `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
   `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   `role` enum('user','admin') COLLATE utf8mb4_unicode_ci DEFAULT 'user',
   PRIMARY KEY (`user_id`),
   UNIQUE KEY `gmail` (`gmail`)
 ) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

 CREATE TABLE `userprofile` (
   `user_id` int NOT NULL,
   `avatar_url` text COLLATE utf8mb4_unicode_ci,
   `weekly_goal` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
   PRIMARY KEY (`user_id`),
   CONSTRAINT `fk_userprofile_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

 CREATE TABLE `reminder` (
   `reminder_id` int NOT NULL AUTO_INCREMENT,
   `user_id` int NOT NULL,
   `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
   `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   `shown_at` datetime DEFAULT NULL,
   `level` enum('high','medium','low') COLLATE utf8mb4_unicode_ci DEFAULT 'medium',
   `title` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
   `content` text COLLATE utf8mb4_unicode_ci,
   `status` enum('pending','sent','completed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
   PRIMARY KEY (`reminder_id`),
   KEY `fk_reminder_user` (`user_id`),
   CONSTRAINT `fk_reminder_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
 ) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

 CREATE TABLE `emaillog` (
   `email_id` int NOT NULL AUTO_INCREMENT,
   `reminder_id` int NOT NULL,
   `user_id` int NOT NULL,
   `recipient_email` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
   `status` enum('pending','sending','sent','failed','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
   `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
   `sent_at` datetime DEFAULT NULL,
   `subject` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
   `content` text COLLATE utf8mb4_unicode_ci,
   PRIMARY KEY (`email_id`),
   UNIQUE KEY `uq_reminder_user` (`reminder_id`,`user_id`),
   KEY `idx_user_id` (`user_id`),
   KEY `idx_reminder_id` (`reminder_id`),
   CONSTRAINT `emaillog_ibfk_1` FOREIGN KEY (`reminder_id`) REFERENCES `reminder` (`reminder_id`) ON DELETE CASCADE,
   CONSTRAINT `emaillog_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
 ) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;