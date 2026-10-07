-- ==============================================================================
-- ACADEMY MANAGEMENT SYSTEM - SEED DATA
-- Default Admin, Teachers, Students, Classes, Subjects, Fees, Attendance & Results
-- ==============================================================================

-- 1. Academy Settings
INSERT INTO `academy_settings` (`id`, `academy_name`, `tagline`, `logo_url`, `address`, `phone`, `email`, `whatsapp_number`, `currency_symbol`, `academic_year`, `theme_color`)
VALUES (1, 'Apex Horizon Academy', 'Inspiring Minds, Building Leaders & Shaping Futures', '', 'Sector 11-A, University Road, Karachi, Pakistan', '+92 300 9876543', 'admissions@apexhorizon.edu.pk', '923009876543', 'Rs.', '2026', '#4f46e5')
ON DUPLICATE KEY UPDATE `academy_name` = VALUES(`academy_name`);

-- 2. Users (Admin, Teachers, Students)
-- Passwords:
-- admin: admin123 ($2a$10$uHECuwlihYU1IWdDDv.PYeiKCjUzBnh7WDi6b1ukE/qXB0oNOvXHe)
-- teachers: teacher123 ($2a$10$QEsS72Qfpn.gG09Za8B1NeWQuv9V.D.XBRMoyiJmjnRkFrdNVz8am)
-- students: student123 ($2a$10$.Mjic8Q75L6i0gFNO1PSX.pZVKD2vK5z4ysIA6FOAZoOlM/PJU406)

INSERT INTO `users` (`id`, `username`, `email`, `password`, `role`, `status`) VALUES
(1, 'admin', 'admin@apexhorizon.edu.pk', '$2a$10$uHECuwlihYU1IWdDDv.PYeiKCjUzBnh7WDi6b1ukE/qXB0oNOvXHe', 'admin', 'active'),
(2, 't_rashid', 'rashid.ali@apexhorizon.edu.pk', '$2a$10$QEsS72Qfpn.gG09Za8B1NeWQuv9V.D.XBRMoyiJmjnRkFrdNVz8am', 'teacher', 'active'),
(3, 't_fatima', 'fatima.noor@apexhorizon.edu.pk', '$2a$10$QEsS72Qfpn.gG09Za8B1NeWQuv9V.D.XBRMoyiJmjnRkFrdNVz8am', 'teacher', 'active'),
(4, 't_kamran', 'kamran.khan@apexhorizon.edu.pk', '$2a$10$QEsS72Qfpn.gG09Za8B1NeWQuv9V.D.XBRMoyiJmjnRkFrdNVz8am', 'teacher', 'active'),
(5, 's_ahmed', 'ahmed.ali@student.apex.edu.pk', '$2a$10$.Mjic8Q75L6i0gFNO1PSX.pZVKD2vK5z4ysIA6FOAZoOlM/PJU406', 'student', 'active'),
(6, 's_zainab', 'zainab.tariq@student.apex.edu.pk', '$2a$10$.Mjic8Q75L6i0gFNO1PSX.pZVKD2vK5z4ysIA6FOAZoOlM/PJU406', 'student', 'active'),
(7, 's_bilal', 'bilal.hassan@student.apex.edu.pk', '$2a$10$.Mjic8Q75L6i0gFNO1PSX.pZVKD2vK5z4ysIA6FOAZoOlM/PJU406', 'student', 'active'),
(8, 's_ayesha', 'ayesha.rehman@student.apex.edu.pk', '$2a$10$.Mjic8Q75L6i0gFNO1PSX.pZVKD2vK5z4ysIA6FOAZoOlM/PJU406', 'student', 'active')
ON DUPLICATE KEY UPDATE `username` = VALUES(`username`);

-- 3. Classes
INSERT INTO `classes` (`id`, `name`, `section`, `monthly_tuition_fee`, `description`) VALUES
(1, 'Grade 9', 'Science - A', 4500.00, 'Matric Secondary Science Morning Group'),
(2, 'Grade 10', 'Science - A', 5000.00, 'Matric Final Science Morning Group'),
(3, 'Grade 11', 'Pre-Engineering', 6000.00, 'FSc Intermediate Pre-Engineering'),
(4, 'Grade 12', 'Pre-Medical', 6500.00, 'FSc Intermediate Pre-Medical')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 4. Subjects
INSERT INTO `subjects` (`id`, `name`, `code`) VALUES
(1, 'Mathematics', 'MATH-09'),
(2, 'Physics', 'PHY-09'),
(3, 'Chemistry', 'CHEM-09'),
(4, 'Biology', 'BIO-09'),
(5, 'Computer Science', 'CS-09'),
(6, 'English Grammar & Literature', 'ENG-09'),
(7, 'Urdu Compulsory', 'URD-09'),
(8, 'Islamiyat', 'ISL-09'),
(9, 'Sindhi Salees', 'SND-09')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 5. Class Subjects
INSERT INTO `class_subjects` (`class_id`, `subject_id`) VALUES
(1, 1), (1, 2), (1, 3), (1, 5), (1, 6), (1, 7), (1, 8),
(2, 1), (2, 2), (2, 3), (2, 5), (2, 6), (2, 7), (2, 8),
(3, 1), (3, 2), (3, 3), (3, 6),
(4, 2), (4, 3), (4, 4), (4, 6)
ON DUPLICATE KEY UPDATE `class_id` = VALUES(`class_id`);

-- 6. Teachers
INSERT INTO `teachers` (`id`, `user_id`, `full_name`, `phone`, `email`, `qualification`, `specialization`, `salary`, `joining_date`, `status`) VALUES
(1, 2, 'Prof. Rashid Ali', '+92 301 2345678', 'rashid.ali@apexhorizon.edu.pk', 'M.Sc. Mathematics & Physics', 'Advanced Calculus & Quantum Mechanics', 65000.00, '2023-01-15', 'active'),
(2, 3, 'Dr. Fatima Noor', '+92 302 3456789', 'fatima.noor@apexhorizon.edu.pk', 'Ph.D. Organic Chemistry', 'Chemistry & Biochemistry', 70000.00, '2023-03-01', 'active'),
(3, 4, 'Sir Kamran Khan', '+92 303 4567890', 'kamran.khan@apexhorizon.edu.pk', 'BS Computer Science', 'Software Engineering & Databases', 60000.00, '2023-08-10', 'active')
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`);

-- 7. Teacher Assignments
INSERT INTO `teacher_classes` (`teacher_id`, `class_id`, `subject_id`) VALUES
(1, 1, 1), -- Rashid teaches Math to Grade 9
(1, 1, 2), -- Rashid teaches Physics to Grade 9
(1, 2, 1), -- Rashid teaches Math to Grade 10
(2, 1, 3), -- Fatima teaches Chemistry to Grade 9
(2, 2, 3), -- Fatima teaches Chemistry to Grade 10
(3, 1, 5), -- Kamran teaches Computer to Grade 9
(3, 2, 5)  -- Kamran teaches Computer to Grade 10
ON DUPLICATE KEY UPDATE `teacher_id` = VALUES(`teacher_id`);

-- 8. Students
INSERT INTO `students` (`id`, `user_id`, `roll_number`, `full_name`, `father_name`, `phone`, `guardian_phone`, `email`, `address`, `date_of_birth`, `admission_date`, `class_id`, `section`, `status`) VALUES
(1, 5, 'APEX-2025-001', 'Ahmed Ali', 'Muhammad Ali Khan', '+92 312 9988771', '+92 300 1122334', 'ahmed.ali@student.apex.edu.pk', 'House # 42, Block 4, Gulshan-e-Iqbal, Karachi', '2008-04-12', '2024-08-01', 1, 'Science - A', 'active'),
(2, 6, 'APEX-2025-002', 'Zainab Tariq', 'Tariq Mehmood', '+92 313 8877662', '+92 301 2233445', 'zainab.tariq@student.apex.edu.pk', 'Apartment 5B, Al-Noor Heights, Johar Town, Karachi', '2008-09-21', '2024-08-01', 1, 'Science - A', 'active'),
(3, 7, 'APEX-2025-003', 'Bilal Hassan', 'Hassan Siddiqui', '+92 314 7766553', '+92 302 3344556', 'bilal.hassan@student.apex.edu.pk', 'Plot 18, Street 7, PECHS Block 2, Karachi', '2007-11-05', '2024-08-01', 2, 'Science - A', 'active'),
(4, 8, 'APEX-2025-004', 'Ayesha Rehman', 'Abdul Rehman', '+92 315 6655442', '+92 303 4455667', 'ayesha.rehman@student.apex.edu.pk', 'Bungalow 12-C, Phase 5, DHA, Karachi', '2007-06-18', '2024-08-01', 2, 'Science - A', 'active')
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`);

-- 9. Attendance
INSERT INTO `attendance` (`student_id`, `class_id`, `date`, `status`, `remarks`, `marked_by`) VALUES
(1, 1, '2025-09-20', 'present', 'On time', 2),
(1, 1, '2025-09-21', 'present', 'Active in class', 2),
(1, 1, '2025-09-22', 'present', 'On time', 2),
(1, 1, '2025-09-23', 'leave', 'Medical leave submitted', 2),
(1, 1, '2025-09-24', 'present', 'On time', 2),
(2, 1, '2025-09-20', 'present', 'On time', 2),
(2, 1, '2025-09-21', 'present', 'On time', 2),
(2, 1, '2025-09-22', 'absent', 'Uninformed absence', 2),
(2, 1, '2025-09-23', 'present', 'On time', 2),
(2, 1, '2025-09-24', 'present', 'On time', 2)
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

-- 10. Exams
INSERT INTO `exams` (`id`, `title`, `class_id`, `exam_date`, `is_published`) VALUES
(1, 'First Term Evaluation 2025', 1, '2025-09-15', TRUE),
(2, 'Mid-Term Comprehensive Exam', 2, '2025-09-18', TRUE)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- 11. Results
INSERT INTO `results` (`exam_id`, `student_id`, `subject_id`, `total_marks`, `obtained_marks`, `grade`, `remarks`) VALUES
(1, 1, 1, 100.00, 94.00, 'A+', 'Outstanding problem-solving skills'),
(1, 1, 2, 100.00, 88.00, 'A', 'Strong theoretical conceptual grasp'),
(1, 1, 3, 100.00, 91.00, 'A+', 'Excellent laboratory and equation performance'),
(1, 1, 5, 100.00, 96.00, 'A+', 'Exceptional programming and logic aptitude'),
(1, 2, 1, 100.00, 85.00, 'A', 'Good performance, practice geometry'),
(1, 2, 2, 100.00, 82.00, 'A', 'Well done'),
(1, 2, 3, 100.00, 78.00, 'B', 'Revise organic mechanisms')
ON DUPLICATE KEY UPDATE `obtained_marks` = VALUES(`obtained_marks`);

-- 12. Homework
INSERT INTO `homework` (`id`, `teacher_id`, `class_id`, `subject_id`, `title`, `description`, `assigned_date`, `due_date`) VALUES
(1, 1, 1, 1, 'Quadratic Equations Exercise 2.4', 'Solve all questions from 1 to 12. Show step-by-step discriminant working on clean sheets.', '2025-09-24', '2025-09-29'),
(2, 2, 1, 3, 'Periodic Trends Research & Worksheet', 'Draw Mendeleev vs Modern Periodic trend graphs for atomic radius and electronegativity.', '2025-09-25', '2025-09-30'),
(3, 3, 1, 5, 'Algorithm Flowchart & Python Loops', 'Design flowcharts and write pseudocode for prime number check and Fibonacci sequence.', '2025-09-26', '2025-10-02')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- 13. Study Material
INSERT INTO `study_material` (`id`, `class_id`, `subject_id`, `teacher_id`, `title`, `chapter`, `topic`, `material_type`, `file_url`, `description`) VALUES
(1, 1, 1, 1, 'Algebra & Quadratic Equations Handout', 'Chapter 2', 'Roots of Quadratic Equations', 'pdf', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'Complete solved examples and short tricks for board exams.'),
(2, 1, 2, 1, 'Kinematics & Newton Laws Quick Revision', 'Chapter 3', 'Newton Third Law of Motion', 'notes', '', 'Key formula sheets and definitions with board paper questions.'),
(3, 1, 5, 3, 'Data Structures & Flowcharts Masterclass', 'Chapter 1', 'Problem Solving Logic', 'pdf', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'Illustrated flowcharts and dry-run table exercises.')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- 14. Fees
INSERT INTO `fees` (`id`, `student_id`, `month_year`, `fee_type`, `total_amount`, `paid_amount`, `due_date`, `status`) VALUES
(1, 1, 'September 2025', 'Monthly Tuition Fee', 4500.00, 3000.00, '2025-09-10', 'partial'),
(2, 1, 'August 2025', 'Monthly Tuition Fee', 4500.00, 4500.00, '2025-08-10', 'paid'),
(3, 2, 'September 2025', 'Monthly Tuition Fee', 4500.00, 4500.00, '2025-09-10', 'paid'),
(4, 3, 'September 2025', 'Monthly Tuition Fee', 5000.00, 0.00, '2025-09-10', 'unpaid')
ON DUPLICATE KEY UPDATE `paid_amount` = VALUES(`paid_amount`);

-- 15. Payments
INSERT INTO `payments` (`id`, `fee_id`, `student_id`, `amount`, `payment_method`, `payment_date`, `receipt_number`, `remarks`, `received_by`) VALUES
(1, 2, 1, 4500.00, 'cash', '2025-08-05', 'REC-2025-0801', 'August fee cleared in full', 1),
(2, 1, 1, 3000.00, 'easypaisa', '2025-09-08', 'REC-2025-0914', 'Partial payment received. Remaining Rs. 1500 committed by month-end.', 1),
(3, 3, 2, 4500.00, 'bank_transfer', '2025-09-04', 'REC-2025-0902', 'Paid online via HBL Internet Banking', 1)
ON DUPLICATE KEY UPDATE `receipt_number` = VALUES(`receipt_number`);

-- 16. Announcements
INSERT INTO `announcements` (`id`, `title`, `content`, `target_role`, `target_class_id`, `priority`, `is_published`, `created_by`) VALUES
(1, 'Mid-Term Examination Schedule Announced', 'The Mid-Term Examinations for all grades will commence from October 15, 2025. Please collect your date sheet and admit cards from the admin counter.', 'all', NULL, 'high', TRUE, 1),
(2, 'Special Science & Math Remedial Workshops', 'Extra coaching classes for Mathematics and Physics will be held every Saturday from 10:00 AM to 1:00 PM for Grade 9 & 10 students.', 'students', 1, 'normal', TRUE, 1),
(3, 'Faculty Meeting & Syllabus Review', 'All senior faculty members are requested to attend the monthly academic progress meeting on Friday at 3:30 PM in Conference Hall A.', 'teachers', NULL, 'urgent', TRUE, 1)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- 17. Notifications
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `link`, `is_read`) VALUES
(1, 5, 'New Homework Assigned', 'Sir Rashid has assigned Quadratic Equations Exercise 2.4 due on Sep 29.', 'homework', '/student/homework', FALSE),
(2, 5, 'Exam Results Published', 'First Term Evaluation 2025 results are published! You scored 94% in Math.', 'result', '/student/results', FALSE),
(3, 5, 'Fee Reminder', 'Your September tuition fee has an outstanding balance of Rs. 1500.', 'fee', '/student/fees', FALSE)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);
