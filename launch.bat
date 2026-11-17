@echo off
chcp 65001 >nul
title Lanceur de Projets PFE - Salons & Foires
color 0B

:MENU
cls
echo ========================================================
echo       LANCEUR DE PROJETS PFE - SALONS ^& FOIRES
echo ========================================================
echo.
echo  1. Salons_Foires  (Port 8000) - Evenements ^& Secteurs
echo  2. Session1       (Port 8001) - PHP MVC + MySQL
echo  3. Session2       (Port 8002) - Secteurs API ^& JSON
echo  4. Session_3      (Port 8003) - Secteurs OOP ^& JSON
echo  5. Racine globale (Port 8000) - Tous les dossiers
echo  6. Quitter
echo.
echo ========================================================
set /p choix="Entrez votre choix (1-6) : "

if "%choix%"=="1" goto SALONS_FOIRES
if "%choix%"=="2" goto SESSION1
if "%choix%"=="3" goto SESSION2
if "%choix%"=="4" goto SESSION3
if "%choix%"=="5" goto GLOBAL
if "%choix%"=="6" goto QUIT

echo Choix invalide.
timeout /t 2 >nul
goto MENU

:SALONS_FOIRES
cls
echo [Lancement de Salons_Foires sur le port 8000...]
start "" "http://localhost:8000/frontend/index.html"
cd /d "%~dp0Salons_Foires"
php -S localhost:8000
pause
goto MENU

:SESSION1
cls
echo [Lancement de Session1 sur le port 8001...]
echo Assurez-vous que MySQL est demarre !
start "" "http://localhost:8001/salons-foires/index.php"
cd /d "%~dp0Session1"
php -S localhost:8001
pause
goto MENU

:SESSION2
cls
echo [Lancement de Session2 sur le port 8002...]
start "" "http://localhost:8002/frontend/index.html"
cd /d "%~dp0Session2\réalisation\secteurs-activite"
php -S localhost:8002
pause
goto MENU

:SESSION3
cls
echo [Lancement de Session_3 sur le port 8003...]
start "" "http://localhost:8003/frontend/index.html"
cd /d "%~dp0Session_3"
php -S localhost:8003
pause
goto MENU

:GLOBAL
cls
echo [Lancement global sur le port 8000...]
start "" "http://localhost:8000/Salons_Foires/frontend/index.html"
cd /d "%~dp0"
php -S localhost:8000
pause
goto MENU

:QUIT
exit

