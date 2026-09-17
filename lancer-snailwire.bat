@echo off
setlocal
title SnailWire - lancement local
cd /d "%~dp0"

echo ============================================
echo   SnailWire - demarrage de l'environnement local
echo ============================================
echo.

REM --- Backend --------------------------------------------------------
if not exist "backend\node_modules" (
    echo [Backend] Installation des dependances ^(premier lancement^)...
    pushd backend
    call npm install
    popd
    echo.
)

REM --- Frontend --------------------------------------------------------
if not exist "frontend\node_modules" (
    echo [Frontend] Installation des dependances ^(premier lancement^)...
    pushd frontend
    call npm install
    popd
    echo.
)

echo Lancement du backend sur http://localhost:3001 ...
start "SnailWire - backend" cmd /k "cd /d "%~dp0backend" && npm run dev"

echo Lancement du frontend sur http://localhost:5173 ...
start "SnailWire - frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo Deux fenetres viennent de s'ouvrir (backend + frontend).
echo Le site va s'ouvrir automatiquement dans ton navigateur.
echo Pour tout arreter : ferme simplement ces deux fenetres.
echo.
pause

