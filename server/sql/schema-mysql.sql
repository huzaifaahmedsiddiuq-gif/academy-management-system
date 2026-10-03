-- ==============================================================================
-- ACADEMY MANAGEMENT SYSTEM - MYSQL SCHEMA (v1.0)
-- Production Ready Relational Schema with Constraints, Indexes, and Defaults
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `academy_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `academy_db`;

-- Drop existing tables in reverse dependency order if resetting
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `announcements`;
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `fees`;
DROP TABLE IF EXISTS `study_material`;
DROP TABLE IF EXISTS `homework_submissions`;
DROP TABLE IF EXISTS `homework`;
DROP TABLE IF EXISTS `results`;
DROP TABLE IF EXISTS `exams`;
DROP TABLE IF EXISTS `attendance`;
DROP TABLE IF EXISTS `teacher_classes`;
DROP TABLE IF EXISTS `class_subjects`;
DROP TABLE IF EXISTS `students`;
DROP TABLE IF EXISTS `teachers`;
DROP TABLE IF EXISTS `subjects`;
DROP TABLE IF EXISTS `classes`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `academy_settings`;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Academy Settings (Single row configuration for dynamic branding across app, prints, and WhatsApp)
CREATE TABLE `academy_settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `academy_name` VARCHAR(150) NOT NULL DEFAULT 'NextGen Premier Academy',
  `tagline` VARCHAR(255) DEFAULT 'Empowering Future Leaders through Excellence',
  `logo_url` TEXT,
  `address` TEXT,
  `phone` VARCHAR(50) DEFAULT '+92 300 1234567',
  `email` VARCHAR(100) DEFAULT 'info@nextgenacademy.edu',
  `whatsapp_number` VARCHAR(50) DEFAULT '923001234567',
  `currency_symbol` VARCHAR(20) DEFAULT 'Rs.',
  `academic_year` VARCHAR(50) DEFAULT '2025-2026',
  `theme_color` VARCHAR(30) DEFAULT '#6366f1',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Users Table (Authentication for Admin, Teachers, and Students)
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(80) NOT NULL UNIQUE,
  `email` VARCHAR(120) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'teacher', 'student') NOT NULL,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_status` (`status`)
) ENGINE=InnoDB;

-- 3. Classes Table
CREATE TABLE `classes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(80) NOT NULL,
  `section` VARCHAR(50) NOT NULL DEFAULT 'A',
  `monthly_tuition_fee` DECIMAL(10,2) NOT NULL DEFAULT 5000.00,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 4. Subjects Table
CREATE TABLE `subjects` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `code` VARCHAR(50) UNIQUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 5. Class Subjects (Many-to-Many junction between Class and Subjects)
CREATE TABLE `class_subjects` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `class_id` INT NOT NULL,
  `subject_id` INT NOT NULL,
  FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `uniq_class_subject` (`class_id`, `subject_id`)
) ENGINE=InnoDB;

-- 6. Teachers Table
CREATE TABLE `teachers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL UNIQUE,
  `full_name` VARCHAR(120) NOT NULL,
  `phone` VARCHAR(50),
  `email` VARCHAR(120),
  `qualification` VARCHAR(150),
  `specialization` VARCHAR(150),
  `salary` DECIMAL(10,2) DEFAULT 0.00,
  `joining_date` DATE,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `avatar_url` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_teachers_name` (`full_name`),
  INDEX `idx_teachers_phone` (`phone`)
) ENGINE=InnoDB;

-- 7. Teacher Classes & Subjects Assignment
CREATE TABLE `teacher_classes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `teacher_id` INT NOT NULL,
  `class_id` INT NOT NULL,
  `subject_id` INT NOT NULL,
  FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `uniq_teacher_assignment` (`teacher_id`, `class_id`, `subject_id`)
) ENGINE=InnoDB;

-- 8. Students Table
CREATE TABLE `students` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL UNIQUE,
  `roll_number` VARCHAR(50) NOT NULL UNIQUE,
  `full_name` VARCHAR(120) NOT NULL,
  `father_name` VARCHAR(120) NOT NULL,
  `phone` VARCHAR(50),
  `guardian_phone` VARCHAR(50),
  `email` VARCHAR(120),
  `address` TEXT,
  `date_of_birth` DATE,
  `admission_date` DATE,
  `class_id` INT NOT NULL,
  `section` VARCHAR(50) DEFAULT 'A',
  `profile_picture` TEXT,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE RESTRICT,
  INDEX `idx_students_roll` (`roll_number`),
  INDEX `idx_students_name` (`full_name`),
  INDEX `idx_students_phone` (`phone`),
  INDEX `idx_students_class` (`class_id`),
  INDEX `idx_students_status` (`status`)
) ENGINE=InnoDB;

-- 9. Attendance Table
CREATE TABLE `attendance` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `class_id` INT NOT NULL,
  `date` DATE NOT NULL,
  `status` ENUM('present', 'absent', 'leave') NOT NULL DEFAULT 'present',
  `remarks` VARCHAR(255),
  `marked_by` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`marked_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  UNIQUE KEY `uniq_student_attendance_day` (`student_id`, `date`),
  INDEX `idx_attendance_date` (`date`),
  INDEX `idx_attendance_status` (`status`)
) ENGINE=InnoDB;

-- 10. Exams Table
CREATE TABLE `exams` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `class_id` INT NOT NULL,
  `exam_date` DATE,
  `is_published` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 11. Results Table
CREATE TABLE `results` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `exam_id` INT NOT NULL,
  `student_id` INT NOT NULL,
  `subject_id` INT NOT NULL,
  `total_marks` DECIMAL(5,2) NOT NULL DEFAULT 100.00,
  `obtained_marks` DECIMAL(5,2) NOT NULL,
  `percentage` DECIMAL(5,2) GENERATED ALWAYS AS ((`obtained_marks` / `total_marks`) * 100) STORED,
  `grade` VARCHAR(10),
  `remarks` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `uniq_exam_student_subject` (`exam_id`, `student_id`, `subject_id`),
  INDEX `idx_results_student` (`student_id`)
) ENGINE=InnoDB;

-- 12. Homework Table
CREATE TABLE `homework` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `teacher_id` INT NOT NULL,
  `class_id` INT NOT NULL,
  `subject_id` INT NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT,
  `file_url` TEXT,
  `assigned_date` DATE NOT NULL,
  `due_date` DATE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE,
  INDEX `idx_homework_due` (`due_date`)
) ENGINE=InnoDB;

-- 13. Homework Submissions Table
CREATE TABLE `homework_submissions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `homework_id` INT NOT NULL,
  `student_id` INT NOT NULL,
  `submission_text` TEXT,
  `file_url` TEXT,
  `submitted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `status` ENUM('submitted', 'graded', 'late') NOT NULL DEFAULT 'submitted',
  `grade` VARCHAR(20),
  `teacher_feedback` TEXT,
  FOREIGN KEY (`homework_id`) REFERENCES `homework`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `uniq_homework_student` (`homework_id`, `student_id`)
) ENGINE=InnoDB;

-- 14. Study Material Table
CREATE TABLE `study_material` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `class_id` INT NOT NULL,
  `subject_id` INT NOT NULL,
  `teacher_id` INT,
  `title` VARCHAR(200) NOT NULL,
  `chapter` VARCHAR(150),
  `topic` VARCHAR(150),
  `material_type` ENUM('pdf', 'notes', 'book', 'document', 'image', 'video') NOT NULL DEFAULT 'pdf',
  `file_url` TEXT,
  `video_url` TEXT,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON DELETE SET NULL,
  INDEX `idx_material_class_subj` (`class_id`, `subject_id`)
) ENGINE=InnoDB;

-- 15. Fees Table (Monthly/Term Fee Master for Each Student)
CREATE TABLE `fees` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `month_year` VARCHAR(50) NOT NULL,
  `fee_type` VARCHAR(100) NOT NULL DEFAULT 'Monthly Tuition Fee',
  `total_amount` DECIMAL(10,2) NOT NULL,
  `paid_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `remaining_amount` DECIMAL(10,2) GENERATED ALWAYS AS (`total_amount` - `paid_amount`) STORED,
  `due_date` DATE NOT NULL,
  `status` ENUM('paid', 'partial', 'unpaid') NOT NULL DEFAULT 'unpaid',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `uniq_student_month_fee` (`student_id`, `month_year`, `fee_type`),
  INDEX `idx_fees_status` (`status`),
  INDEX `idx_fees_month` (`month_year`)
) ENGINE=InnoDB;

-- 16. Payments Table (Every payment transaction towards a fee)
CREATE TABLE `payments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `fee_id` INT NOT NULL,
  `student_id` INT NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `payment_method` ENUM('cash', 'bank_transfer', 'easypaisa', 'jazzcash', 'online') NOT NULL DEFAULT 'cash',
  `payment_date` DATE NOT NULL,
  `receipt_number` VARCHAR(80) NOT NULL UNIQUE,
  `remarks` VARCHAR(255),
  `received_by` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`fee_id`) REFERENCES `fees`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`received_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_payments_receipt` (`receipt_number`),
  INDEX `idx_payments_date` (`payment_date`)
) ENGINE=InnoDB;

-- 17. Announcements Table
CREATE TABLE `announcements` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(200) NOT NULL,
  `content` TEXT NOT NULL,
  `target_role` ENUM('all', 'students', 'teachers') NOT NULL DEFAULT 'all',
  `target_class_id` INT,
  `priority` ENUM('normal', 'high', 'urgent') NOT NULL DEFAULT 'normal',
  `is_published` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_by` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`target_class_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_announcements_created` (`created_at`)
) ENGINE=InnoDB;

-- 18. Notifications Table
CREATE TABLE `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `message` TEXT NOT NULL,
  `type` ENUM('homework', 'result', 'fee', 'announcement', 'general') NOT NULL DEFAULT 'general',
  `link` VARCHAR(255),
  `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_notif_user_read` (`user_id`, `is_read`)
) ENGINE=InnoDB;
