@echo off
echo ========================================
echo   OpenPencil MCP Token Sync + Restart
echo ========================================
echo.

REM Step 1: Sync the token
echo [1/2] Syncing MCP token...
powershell -ExecutionPolicy Bypass -File "G:\ForWork\ExProject\scripts\sync-mcp-token.ps1"
if %errorlevel% neq 0 (
    echo Failed to sync token. Is OpenPencil MCP server running?
    pause
    exit /b 1
)

echo.
echo [2/2] Starting opencode...
echo.
start "" "opencode"

echo Done! opencode is starting...
