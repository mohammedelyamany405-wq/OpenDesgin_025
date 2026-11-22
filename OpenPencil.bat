@echo off
chcp 65001 >nul
setlocal EnableExtensions
cd /d "%~dp0"

echo ========================================
echo   OpenPencil
echo ========================================
echo.

set "APP_DIR=%~dp0projects\openpencil"
if not exist "%APP_DIR%\package.json" (
    echo OpenPencil was not found at:
    echo   %APP_DIR%
    echo Make sure you extracted the full repository folder.
    pause
    exit /b 1
)

set "PATH=%USERPROFILE%\.bun\bin;%PATH%"
where bun >nul 2>&1
if errorlevel 1 (
    echo [1/4] Installing Bun...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "irm https://bun.sh/install.ps1 | iex"
    set "PATH=%USERPROFILE%\.bun\bin;%PATH%"
    where bun >nul 2>&1
    if errorlevel 1 (
        echo Bun install failed. Open https://bun.sh then run this file again.
        pause
        exit /b 1
    )
) else (
    echo [1/4] Bun is ready.
)

cd /d "%APP_DIR%"

if not exist "node_modules\" (
    echo [2/4] Installing packages. First run may take several minutes...
    bun install
    if errorlevel 1 (
        echo bun install failed.
        pause
        exit /b 1
    )
) else (
    echo [2/4] Packages are already installed.
)

if not exist "packages\core\dist\" (
    echo [3/4] Building packages. First run may take several minutes...
    bun run build:packages
    if errorlevel 1 (
        echo Package build failed.
        pause
        exit /b 1
    )
) else (
    echo [3/4] Packages are already built.
)

echo [4/4] Starting OpenPencil at http://localhost:1420
echo Close this window to stop the program.
echo.
start "" cmd /c "timeout /t 8 /nobreak >nul && start http://localhost:1420"
bun run dev
echo.
pause
