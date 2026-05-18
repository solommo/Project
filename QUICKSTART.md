# ⚡ Focus Learning Platform — Quickstart Guide

This guide will walk you through setting up and running all three components (**AI**, **Backend**, and **Frontend**) of the Focus Platform on your local system.

---

## 🧭 System Overview & Ports

The platform relies on three services running concurrently:

*   **Vite Frontend UI**: Running on `http://localhost:5173`
*   **Laravel Backend API**: Running on `http://127.0.0.1:8000` (Endpoints: `/api`)
*   **Flask AI Service**: Running on `http://127.0.0.1:5000` (Endpoints: `/predict`)

---

## 📋 Prerequisites

Ensure you have the following installed on your machine:
1.  **Python**: Version 3.8+ (Python 3.13 is fully tested)
2.  **Node.js**: Version 18+ (LTS recommended)
3.  **PHP & Composer**: PHP 8.0+ (PHP 8.2 is fully tested) & Composer 2.0+
4.  **MySQL Database**: MySQL or MariaDB running locally (e.g., via XAMPP, WampServer, or direct installation) on port `3306` with `root` username and an empty password (or configured in your `.env` file).

---

## 🛠️ Step-by-Step Installation

### Step 1: Initialize the AI Service (`/ai`)

1.  Open a terminal and navigate to the `ai` directory:
    ```powershell
    cd "ai"
    ```
2.  Create and activate a Python virtual environment:
    *   **Windows (PowerShell)**:
        ```powershell
        python -m venv .venv
        .\.venv\Scripts\Activate.ps1
        ```
    *   **macOS / Linux**:
        ```bash
        python3 -m venv .venv
        source .venv/bin/activate
        ```
3.  Install Python dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Ensure you have the pre-trained LSTM model file `lstm_knowledge_tracing_model.h5` inside `/ai/models/`.

---

### Step 2: Configure & Seed the Laravel Backend (`/backend`)

1.  Open a new terminal window and navigate to the `backend` directory:
    ```powershell
    cd "backend"
    ```
2.  Install PHP dependencies:
    ```powershell
    composer install
    ```
3.  Set up environment configuration:
    ```powershell
    copy .env.example .env
    ```
4.  Generate application and JWT keys:
    ```powershell
    php artisan key:generate
    php artisan jwt:secret
    ```
5.  Create and seed the database:
    *   *Option A (Recommended & Automated)*: Run the automated database installer:
        ```powershell
        php setup_db.php
        ```
    *   *Option B (Manual)*: Create a MySQL database named `focus_platform` through phpMyAdmin or MySQL shell, then run:
        ```powershell
        php artisan migrate --seed
        ```
    This will run all database tables and seed them with subjects, units, questions, and our customized `MahmoudMagdySeeder` demo dataset.

---

### Step 3: Configure the React Frontend (`/frontent`)

1.  Open a new terminal window and navigate to the `frontent` directory:
    ```powershell
    cd "frontent"
    ```
2.  Install Node dependencies:
    ```powershell
    npm install
    ```
3.  Set up environment variables:
    Create a `.env` file in the `frontent` folder and add your Gemini API key (required for Socratic Chat components):
    ```env
    VITE_GEMINI_API_KEY=your_gemini_api_key_here
    ```

---

## 🚀 Running the Platform (Concurrent Services)

To run the full application, keep all three terminal windows open and execute the following start commands:

### 1. Start the Flask AI Server (`/ai`)
In your activated virtual environment terminal:
```powershell
# From the /ai directory
python api/ai_api.py
```
*The AI service will start on `http://127.0.0.1:5000`.*

---

### 2. Start the Laravel API Server (`/backend`)
In your backend terminal:
```powershell
# From the /backend directory
php artisan serve
```
*The Backend API will start on `http://127.0.0.1:8000`.*

---

### 3. Start the React Frontend App (`/frontent`)
In your frontend terminal:
```powershell
# From the /frontent directory
npm run dev
```
*The Frontend development server will start on `http://localhost:5173`.*

---

## 🔑 Demo Login Credentials

Once the seeders have run, you can immediately log into the application using our demo account:

*   **Role**: Teacher
*   **Email**: `magdy@gmail.com`
*   **Password**: `password`

*Note: 50 additional student accounts and 20 additional teacher accounts have been seeded with random emails using Laravel Factories. All of these accounts share the default password: `password`.*

---

## 🔍 Troubleshooting

*   **Database connection error**: Verify that MySQL is running on `127.0.0.1:3306` and credentials in `backend/.env` match.
*   **AI model not found error**: Ensure the model binary is located at `ai/models/lstm_knowledge_tracing_model.h5`.
*   **CORS or API connection issues**: Ensure that the Laravel backend server is running on port `8000` before accessing the React frontend.
