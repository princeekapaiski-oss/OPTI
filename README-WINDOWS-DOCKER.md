
# TextNet Optimizer — Windows & Docker Ready

## Windows (без Docker)
1) Откройте PowerShell в папке проекта
2) Выполните:
   ```powershell
   ./run_windows.ps1
   ```
Приложение поднимется на http://localhost:5000

## Запуск через Docker Desktop (Windows)
1) Установите Docker Desktop
2) В папке проекта выполните:
   ```powershell
   docker compose up --build
   ```
Backend будет доступен на http://localhost:5000

## База данных
По умолчанию используется SQLite (файл backend/app.db).
Для PostgreSQL укажите `DATABASE_URL`.
