# focus_platform — Backend (Laravel)

This repository contains the backend (Laravel) for the Focus platform. This README focuses on setting up and running the backend locally on Windows (XAMPP) or a Unix-like environment.

**Quick links:**

- API reference: [API_Routes.md](API_Routes.md)

## Prerequisites

- PHP 8.0+
- Composer
- MySQL (or MariaDB)
- Git
- Optional: Node.js (for compiling frontend assets)

On Windows, using XAMPP is supported — ensure MySQL and Apache (if needed) are running.

## Quick Setup (Windows / XAMPP)

1. Clone the repository and enter it:

```powershell
git clone https://github.com/Abdalla-Ahmed-2004/focus_platform.git
cd "focus_platform"
```

2. Install PHP dependencies:

```powershell
composer install
```

3. Copy the example environment and update values:

```powershell
copy .env.example .env
# Edit .env with your DB credentials and APP_URL (use an editor)
```

Important `.env` values:

- `APP_URL` — e.g. `http://127.0.0.1:8000`
- `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`

4. Generate keys:

```powershell
php artisan key:generate
php artisan jwt:secret
```

5. Create the database (via phpMyAdmin or MySQL CLI) and run migrations + seeders:

```powershell
php artisan migrate --seed
```

6. (Optional) Install Node dependencies and build assets:

```powershell
npm install
npm run dev
```

7. Start the development server:

```powershell
php artisan serve
```

The API will be available at `http://127.0.0.1:8000/api` by default.

## Environment / Permissions

On Linux/macOS, ensure writable directories:

```bash
chmod -R 775 storage bootstrap/cache
```

## Testing & Debugging

- Clear caches if you run into configuration issues:

```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

## Packages Used

- `tymon/jwt-auth` — JWT authentication (generate secret with `php artisan jwt:secret`)
- `spatie/laravel-permission` — Role & permission management

## API Reference

See [API_Routes.md](API_Routes.md) for a current list of endpoints, required roles, and example payloads.

## Contributing

- Create a feature branch, run tests (if available), and open a PR with a clear description.

---

If you want, I can also add a minimal Postman collection or example curl commands — tell me which format you prefer.

---

## Quick run (copy-paste)

Use the following commands in order to set up and run the backend locally. Adjust `.env` values (DB credentials, APP_URL) before running migrations.

Windows (PowerShell):

```powershell
git clone https://github.com/Abdalla-Ahmed-2004/focus_platform.git
cd "focus_platform"
composer install
copy .env.example .env
# Edit .env to set DB_* and APP_URL
php artisan key:generate
php artisan jwt:secret
php artisan migrate --seed
npm install
npm run dev
php artisan serve
```

Unix / macOS (bash):

```bash
git clone https://github.com/Abdalla-Ahmed-2004/focus_platform.git
cd focus_platform
composer install
cp .env.example .env
# Edit .env to set DB_* and APP_URL
php artisan key:generate
php artisan jwt:secret
php artisan migrate --seed
npm install
npm run dev
php artisan serve
```
