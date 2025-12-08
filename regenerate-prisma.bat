@echo off
echo ========================================
echo Parando processos Node.js...
echo ========================================
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo Regenerando Prisma Client...
echo ========================================
cd /d "%~dp0"
call npx prisma generate

echo.
echo ========================================
echo CONCLUIDO! Agora execute: npm run dev
echo ========================================
pause
