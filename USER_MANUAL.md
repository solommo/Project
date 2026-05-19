# User Manual: How to Run the Project

This manual explains how to run all services of the Focus Learning Platform from this repository:
`/home/runner/work/Project/Project`

## 1) Prerequisites

- Python 3.8+
- Node.js 18+
- PHP 8.0+ and Composer
- MySQL on `127.0.0.1:3306` (default `root` user, empty password unless changed in `.env`)

## 2) Run AI Service (Terminal 1)

```bash
cd /home/runner/work/Project/Project/ai
python3 -m venv .venv
source .venv/bin/activate   # Windows: .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python api/ai_api.py
```

AI service URL: `http://127.0.0.1:5000`

## 3) Run Backend API (Terminal 2)

```bash
cd /home/runner/work/Project/Project/backend
composer install
cp .env.example .env        # Windows: copy .env.example .env
php artisan key:generate
php artisan jwt:secret
php setup_db.php            # creates DB and runs migrations
php artisan db:seed         # seeds demo data
php artisan serve
```

Backend URL: `http://127.0.0.1:8000`

## 4) Run Frontend (Terminal 3)

```bash
cd /home/runner/work/Project/Project/frontent
npm install
```

Create file: `/home/runner/work/Project/Project/frontent/.env`

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

Start frontend:

```bash
npm run dev
```

Frontend URL: `http://localhost:5173`

## 5) Demo Login

- Email: `magdy@gmail.com`
- Password: `password`
