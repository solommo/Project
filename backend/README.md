# 🐘 Focus Platform — Laravel Backend API

This repository contains the REST API backend built on Laravel for the Focus Platform. It serves academic curriculums, handles user authentication, tracks quiz attempts, and interfaces with the Flask AI model.

---

## 🧭 Service Overview

*   **Host/Port**: `http://127.0.0.1:8000` (Endpoints: `/api/*`)
*   **Database**: MySQL (`focus_platform`)
*   **Key Dependencies**: `tymon/jwt-auth` for authentication, `spatie/laravel-permission` for ACL.

---

## 📂 Project Layout

*   `app/Http/Controllers/` — API controllers including user dashboard, chat logs, and teacher verification.
*   `app/Models/` — Data models (User, Student, Teacher, Subject, Unit, Lesson, Quiz, Question).
*   `routes/api.php` & `routes/api/` — Structured and decoupled API routes.
*   `setup_db.php` — Helper script that creates the MySQL database and runs migrations.
*   `database/migrations/` — Database schema files.
*   `database/seeders/` — Seeding scripts, including `MahmoudMagdySeeder` for demo credentials.

---

## 🛠️ Step-by-Step Execution

### 1. Install PHP & Composer Packages
Open a terminal at the `backend` directory and run:
```powershell
composer install
```

### 2. Set Up the Environment
1.  Copy the environment template:
    ```powershell
    copy .env.example .env
    ```
2.  Confirm the MySQL variables in `.env` match your local setup (defaults in `.env.example` target `focus_platform` on `127.0.0.1:3306` with `root` and an empty password).

### 3. Initialize Keys & Database
Generate your application cryptographic keys, JWT secret keys, and seed the MySQL database:
```powershell
# Generate keys
php artisan key:generate
php artisan jwt:secret

# Create the database and run migrations/seeders
php setup_db.php

# (Optional manual flow) Create the database yourself, then run:
# php artisan migrate --seed
```

### 4. Run the Dev API Server
Start Laravel's built-in serving utility:
```powershell
php artisan serve
```
*The API is now active at `http://127.0.0.1:8000/api`.*

---

## 🔑 Demo login credentials

The database seeding initializes a fully populated system with mock courses, questions, and accounts. You can immediately log into the system with the default teacher account:

*   **Role**: Teacher
*   **Email**: `magdy@gmail.com`
*   **Password**: `password`

*Note: All auto-generated mock student and teacher accounts created by Laravel factories also share the default password: `password`.*
