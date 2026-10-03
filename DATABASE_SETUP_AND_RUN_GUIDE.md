# 🏫 Academy Management Software — Complete Setup & Query Guide

Yeh guide step-by-step samjhati hai ke software ko kaise run karna hai, database (MySQL ya Supabase) kaise select aur connect karna hai, aur custom queries kaise execute karni hain.

---

## ⚡ Quick Start Overview

| Component | Port | Technology | Command |
| :--- | :--- | :--- | :--- |
| **Backend API** | `http://localhost:5000` | Node.js + Express | `cd server && npm run dev` |
| **Frontend UI** | `http://localhost:5173` | React + Vite + Tailwind | `cd client && npm run dev` |
| **DB Wizard** | CLI Console | Interactive Node.js | `cd server && npm run wizard` |

---

## 🗄️ Database Options (Dono Supported Hain)

Aap apni marzi ke mutabiq **MySQL** ya **Supabase PostgreSQL** select kar sakte hain. Application ka core architecture database provider abstraction layer par bana hai:

```
server/src/database/
  ├── index.js      <-- Universal Query Router (MySQL & Supabase)
  ├── mysql.js      <-- MySQL connection pool
  └── supabase.js   <-- Supabase PostgreSQL connection pool
```

---

### Option 1: MySQL Setup (Local / XAMPP)

1. **MySQL Start Karein**:
   - XAMPP / WAMP / MySQL Workbench open karein aur MySQL service start karein (Default Port: `3306`).
2. **Environment Configure Karein (`server/.env`)**:
   ```env
   DATABASE_PROVIDER=mysql
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=academy_db
   ```
3. **Database Tables aur Demo Data Initialize Karein**:
   ```bash
   cd server
   npm run init-db
   ```
   *Yeh command automatically `academy_db` create karegi, saari tables banayegi aur initial demo accounts insert karegi.*

---

### Option 2: Supabase (PostgreSQL Cloud) Setup

Agar aapke paas local MySQL nahi hai to aap **Supabase** ka free PostgreSQL database use kar sakte hain:

1. [Supabase.com](https://supabase.com) par free project create karein.
2. Project Settings → **Database** → **Connection String (URI)** copy karein.
3. `server/.env` mein credentials paste karein:
   ```env
   DATABASE_PROVIDER=supabase
   DATABASE_URL=postgresql://postgres.yourproject:yourpassword@aws-0-xx.pooler.supabase.com:6543/postgres
   SUPABASE_URL=https://yourproject.supabase.co
   SUPABASE_ANON_KEY=your_anon_key
   ```
4. Tables aur Seed Data load karein:
   - **Method A (Automatic)**:
     ```bash
     cd server
     npm run init-db
     ```
   - **Method B (Supabase SQL Editor)**:
     - Supabase Dashboard mein **SQL Editor** open karein.
     - `server/sql/schema-supabase.sql` ka content paste karke **Run** karein.
     - `server/sql/seed-supabase.sql` ka content paste karke **Run** karein.

---

## 🛠️ Interactive Database Wizard & Query Runner

Aap terminal mein ek single command se database initialize kar sakte hain ya custom SQL query chala sakte hain:

```bash
cd server
npm run wizard
```

Aapke samne interactive menu open hoga:
```
========================================================
   🏫 ACADEMY MANAGEMENT SYSTEM - DATABASE WIZARD      
========================================================
Choose an option:
  1. Setup & Initialize MySQL Database
  2. Setup & Initialize Supabase PostgreSQL
  3. Run Custom SQL Query on Active Database
  4. Switch Active Provider (MySQL <-> Supabase)
  5. Exit
--------------------------------------------------------
```

### Direct SQL Query Run Karna:
Wizard mein **Option 3** select karein aur query enter karein:
- `SELECT id, username, role, email FROM users;`
- `SELECT full_name, roll_number, class_name FROM students;`
- `SELECT * FROM fees WHERE status = 'pending';`

Tables ka output clean console table format mein display hoga.

---

## 🔑 Default Login Accounts & Credentials

Initial seed hone ke baad yeh real credentials test karein:

| Role | Username / Identifier | Password | Access / Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` | Complete Academy Access, Financials, Reports, Settings |
| **Faculty (Teacher)** | `t_rashid` | `teacher123` | Assigned Classes, Attendance Marking, Homework, Marksheet Entry |
| **Student** | `s_ahmed` | `student123` | Personal Attendance, Marksheet, Submissions, Fee Vouchers, Profile |

---

## 🚀 How to Run the Complete Project

### Terminal 1: Backend Server
```bash
cd server
npm run dev
```
*Server listening on: `http://localhost:5000`*

### Terminal 2: Frontend UI
```bash
cd client
npm run dev
```
*Client available on: `http://localhost:5173`*

Browser mein open karein: **`http://localhost:5173`**

---

## ✨ Features Checklist Completed

- [x] **Full-Stack JavaScript Only** (React + Vite + Tailwind CSS + Node.js + Express.js).
- [x] **Dual Database Support** (MySQL + Supabase PostgreSQL) with runtime switcher.
- [x] **Role-Based Auth & Protected Routing** (Admin, Teacher, Student).
- [x] **Admin Dashboard** (Dynamic live statistics, revenue overview, attendance trends).
- [x] **Student Management** (Admission, Profile, Class Allocation, Status toggle, Password reset).
- [x] **Faculty & Teacher Management** (Course allocation, Section mapping).
- [x] **Class & Subject Hierarchy** (Grades, Sections, Course Subjects, Teachers).
- [x] **Attendance Register** (Daily sheet, monthly matrix, absent/leave counters).
- [x] **Exams & Marksheet** (Exam terms, marks entry, grades, automated percentage).
- [x] **Homework Portal** (Faculty assignment, student submission upload, grading).
- [x] **Study Material & E-Library** (Class/Subject/Chapter organized PDFs and videos).
- [x] **Fee Management & Ledger** (Tuition dues, partial payments, automated balance calculation).
- [x] **Student Portal** (Personalized dashboards, fee statement, marksheet, attendance, profile, password change).
- [x] **Announcements & Notifications** (Broadcasts with priority filters, bell icon badge).
- [x] **Comprehensive Reports** (Student dossier, attendance sheets, fee collection, exam result sheets).
- [x] **System-Wide Output Services** (Official Print layout, PDF generation via jsPDF, WhatsApp pre-formatted sharing).
- [x] **Academy Branding Settings** (Dynamic academy name, logo, contact, currency symbol reflected throughout).
- [x] **Dark / Light Theme** toggle with persistence.
