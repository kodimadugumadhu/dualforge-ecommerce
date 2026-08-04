@echo off
title DualForge E-Commerce Launcher
color 0A
echo ========================================================
echo         DUALFORGE E-COMMERCE PLATFORM LAUNCHER
echo ========================================================
echo.
echo [0/2] Clearing stale background processes on ports 8085 and 5173...
powershell -Command "Get-NetTCPConnection -LocalPort 8085,5173 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"

echo.
echo [1/2] Starting Spring Boot Enterprise Backend (Port 8085)...
start "DualForge Backend" cmd /k "cd backend && mvn spring-boot:run"

echo.
echo [2/2] Starting Vite React High-Speed Frontend (Port 5173)...
start "DualForge Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo  SUCCESS: All DualForge services triggered!
echo  ------------------------------------------------------
echo  - Backend REST API : http://localhost:8085
echo  - Frontend Web App : http://localhost:5173
echo  - Admin Login      : admin / adminpassword
echo  - Customer Login   : customer / customerpassword
echo ========================================================
echo.
echo Please keep the server command windows open while testing.
echo.
pause
