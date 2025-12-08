@echo off
echo ========================================
echo LIMPANDO AMBIENTE ANTERIOR (Porta 3001)...
echo ========================================
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo INICIANDO TORK CRM NA PORTA 4000...
echo ========================================
cd /d "%~dp0"
npm run dev

pause
