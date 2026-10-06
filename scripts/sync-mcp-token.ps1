# sync-mcp-token.ps1
# Reads the auth token from OpenPencil's discovery file and updates opencode.json

$ErrorActionPreference = "Stop"

# Find the discovery file - check both possible locations
$discoveryFile = $null

# Check new path
$newPath = Join-Path $env:LOCALAPPDATA "OpenPencil\mcp.json"
if (Test-Path $newPath) {
    $discoveryFile = Get-Item $newPath
}

# Check old path
if (-not $discoveryFile) {
    $oldDir = Join-Path $env:LOCALAPPDATA "Temp\open-pencil-mcp"
    $discoveryFile = Get-ChildItem $oldDir -Recurse -Filter "mcp.json" -ErrorAction SilentlyContinue | 
        Sort-Object LastWriteTime -Descending | 
        Select-Object -First 1
}

if (-not $discoveryFile) {
    Write-Host "No discovery file found. Is OpenPencil MCP server running?" -ForegroundColor Red
    exit 1
}

# Read the discovery file
$discovery = Get-Content $discoveryFile.FullName -Raw | ConvertFrom-Json

if (-not $discovery.authToken) {
    Write-Host "No auth token in discovery file" -ForegroundColor Red
    exit 1
}

Write-Host "Found auth token: $($discovery.authToken.Substring(0,8))..." -ForegroundColor Green
Write-Host "Port: $($discovery.httpPort)" -ForegroundColor Cyan
Write-Host "PID: $($discovery.pid)" -ForegroundColor Cyan

# Read opencode.json
$configPath = Join-Path $env:USERPROFILE ".config\opencode\opencode.json"
$config = Get-Content $configPath -Raw | ConvertFrom-Json

# Update the openpencil MCP server config
$oldToken = $config.mcp.openpencil.headers.Authorization -replace "Bearer ", ""
$newToken = $discovery.authToken

if ($oldToken -eq $newToken) {
    Write-Host "Token already up to date" -ForegroundColor Green
    exit 0
}

# Update the token
$config.mcp.openpencil.headers.Authorization = "Bearer $newToken"

# Save the config
$config | ConvertTo-Json -Depth 10 | Set-Content $configPath -Encoding UTF8

Write-Host "Updated opencode.json with new token" -ForegroundColor Green
Write-Host "Old: $($oldToken.Substring(0,8))..." -ForegroundColor Yellow
Write-Host "New: $($newToken.Substring(0,8))..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Restart opencode to apply changes" -ForegroundColor Cyan
