-- ==============================================================================
-- ACADEMY MANAGEMENT SYSTEM - SUPABASE (POSTGRESQL) SCHEMA (v1.0)
-- Production Ready Relational Schema with Constraints, Indexes, and Foreign Keys
-- Compatible with Supabase SQL Editor
-- ==============================================================================

-- Drop existing tables if re-running
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS fees CASCADE;
DROP TABLE IF EXISTS study_material CASCADE;
DROP TABLE IF EXISTS homework_submissions CASCADE;
DROP TABLE IF EXISTS homework CASCADE;
DROP TABLE IF EXISTS results CASCADE;
DROP TABLE IF EXISTS exams CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS teacher_classes CASCADE;
DROP TABLE IF EXISTS class_subjects CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS teachers CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS academy_settings CASCADE;

-- 1. Academy Settings
CREATE TABLE academy_settings (
  id SERIAL PRIMARY KEY,
  academy_name VARCHAR(150) NOT NULL DEFAULT 'NextGen Premier Academy',
  tagline VARCHAR(255) DEFAULT 'Empowering Future Leaders through Excellence',
  logo_url TEXT,
  address TEXT,
  phone VARCHAR(50) DEFAULT '+92 300 1234567',
  email VARCHAR(100) DEFAULT 'info@nextgenacademy.edu',
  whatsapp_number VARCHAR(50) DEFAULT '923001234567',
  currency_symbol VARCHAR(20) DEFAULT 'Rs.',
  academic_year VARCHAR(50) DEFAULT '2026',
  theme_color VARCHAR(30) DEFAULT '#6366f1',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Users Table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(80) NOT NULL UNIQUE,
  email VARCHAR(120) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- 3. Classes Table
CREATE TABLE classes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  section VARCHAR(50) NOT NULL DEFAULT 'A',
  monthly_tuition_fee NUMERIC(10,2) NOT NULL DEFAULT 5000.00,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Subjects Table
CREATE TABLE subjects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Class Subjects
CREATE TABLE class_subjects (
  id SERIAL PRIMARY KEY,
  class_id INT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id INT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  CONSTRAINT uniq_class_subject UNIQUE (class_id, subject_id)
);

-- 6. Teachers Table
CREATE TABLE teachers (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(120) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(120),
  qualification VARCHAR(150),
  specialization VARCHAR(150),
  salary NUMERIC(10,2) DEFAULT 0.00,
  joining_date DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_teachers_name ON teachers(full_name);
CREATE INDEX idx_teachers_phone ON teachers(phone);

-- 7. Teacher Classes & Subjects Assignment
CREATE TABLE teacher_classes (
  id SERIAL PRIMARY KEY,
  teacher_id INT NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  class_id INT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id INT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  CONSTRAINT uniq_teacher_assignment UNIQUE (teacher_id, class_id, subject_id)
);

-- 8. Students Table
CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  roll_number VARCHAR(50) NOT NULL UNIQUE,
  full_name VARCHAR(120) NOT NULL,
  father_name VARCHAR(120) NOT NULL,
  phone VARCHAR(50),
  guardian_phone VARCHAR(50),
  email VARCHAR(120),
  address TEXT,
  date_of_birth DATE,
  admission_date DATE,
  class_id INT NOT NULL REFERENCES classes(id) ON DELETE RESTRICT,
  section VARCHAR(50) DEFAULT 'A',
  profile_picture TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_students_roll ON students(roll_number);
CREATE INDEX idx_students_name ON students(full_name);
CREATE INDEX idx_students_phone ON students(phone);
CREATE INDEX idx_students_class ON students(class_id);
CREATE INDEX idx_students_status ON students(status);

-- 9. Attendance Table
CREATE TABLE attendance (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id INT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'leave')),
  remarks VARCHAR(255),
  marked_by INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT uniq_student_attendance_day UNIQUE (student_id, date)
);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_status ON attendance(status);

-- 10. Exams Table
CREATE TABLE exams (
  id SERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  class_id INT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  exam_date DATE,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Results Table
CREATE TABLE results (
  id SERIAL PRIMARY KEY,
  exam_id INT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id INT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  total_marks NUMERIC(5,2) NOT NULL DEFAULT 100.00,
  obtained_marks NUMERIC(5,2) NOT NULL,
  percentage NUMERIC(5,2) GENERATED ALWAYS AS ((obtained_marks / total_marks) * 100) STORED,
  grade VARCHAR(10),
  remarks VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT uniq_exam_student_subject UNIQUE (exam_id, student_id, subject_id)
);
CREATE INDEX idx_results_student ON results(student_id);

-- 12. Homework Table
CREATE TABLE homework (
  id SERIAL PRIMARY KEY,
  teacher_id INT NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  class_id INT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id INT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  file_url TEXT,
  assigned_date DATE NOT NULL,
  due_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_homework_due ON homework(due_date);

-- 13. Homework Submissions Table
CREATE TABLE homework_submissions (
  id SERIAL PRIMARY KEY,
  homework_id INT NOT NULL REFERENCES homework(id) ON DELETE CASCADE,
  student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  submission_text TEXT,
  file_url TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'late')),
  grade VARCHAR(20),
  teacher_feedback TEXT,
  CONSTRAINT uniq_homework_student UNIQUE (homework_id, student_id)
);

-- 14. Study Material Table
CREATE TABLE study_material (
  id SERIAL PRIMARY KEY,
  class_id INT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id INT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id INT REFERENCES teachers(id) ON DELETE SET NULL,
  title VARCHAR(200) NOT NULL,
  chapter VARCHAR(150),
  topic VARCHAR(150),
  material_type VARCHAR(20) NOT NULL DEFAULT 'pdf' CHECK (material_type IN ('pdf', 'notes', 'book', 'document', 'image', 'video')),
  file_url TEXT,
  video_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_material_class_subj ON study_material(class_id, subject_id);

-- 15. Fees Table
CREATE TABLE fees (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  month_year VARCHAR(50) NOT NULL,
  fee_type VARCHAR(100) NOT NULL DEFAULT 'Monthly Tuition Fee',
  total_amount NUMERIC(10,2) NOT NULL,
  paid_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  remaining_amount NUMERIC(10,2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
  due_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'unpaid' CHECK (status IN ('paid', 'partial', 'unpaid')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT uniq_student_month_fee UNIQUE (student_id, month_year, fee_type)
);
CREATE INDEX idx_fees_status ON fees(status);
CREATE INDEX idx_fees_month ON fees(month_year);

-- 16. Payments Table
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  fee_id INT NOT NULL REFERENCES fees(id) ON DELETE CASCADE,
  student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  payment_method VARCHAR(30) NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'bank_transfer', 'easypaisa', 'jazzcash', 'online')),
  payment_date DATE NOT NULL,
  receipt_number VARCHAR(80) NOT NULL UNIQUE,
  remarks VARCHAR(255),
  received_by INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_payments_receipt ON payments(receipt_number);
CREATE INDEX idx_payments_date ON payments(payment_date);

-- 17. Announcements Table
CREATE TABLE announcements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  target_role VARCHAR(20) NOT NULL DEFAULT 'all' CHECK (target_role IN ('all', 'students', 'teachers')),
  target_class_id INT REFERENCES classes(id) ON DELETE CASCADE,
  priority VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'high', 'urgent')),
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_by INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_announcements_created ON announcements(created_at);

-- 18. Notifications Table
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(30) NOT NULL DEFAULT 'general' CHECK (type IN ('homework', 'result', 'fee', 'announcement', 'general')),
  link VARCHAR(255),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_notif_user_read ON notifications(user_id, is_read);
