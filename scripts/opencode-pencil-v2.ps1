# OpenPencil HTTP Helper v2 - Works with or without auth
# Usage: powershell -ExecutionPolicy Bypass -File opencode-pencil-v2.ps1 -Tool "tool_name" -ToolArgs '{"key":"value"}'

param(
    [Parameter(Mandatory=$true)]
    [string]$Tool,
    
    [string]$ToolArgs = '{}'
)

$ErrorActionPreference = "Stop"
$baseUrl = "http://127.0.0.1:7600"

# Try to read token from discovery file
$token = $null
$mcpDir = Get-ChildItem "$env:LOCALAPPDATA\Temp\open-pencil-mcp" -Directory -ErrorAction SilentlyContinue | Select-Object -First 1
if ($mcpDir) {
    $mcpFile = Join-Path $mcpDir.FullName "mcp.json"
    if (Test-Path $mcpFile) {
        try {
            $token = (Get-Content $mcpFile -Raw | ConvertFrom-Json).authToken
        } catch {}
    }
}

# Build headers
$headers = @{
    "Accept" = "application/json, text/event-stream"
    "Content-Type" = "application/json"
}

if ($token) {
    $headers["Authorization"] = "Bearer $token"
}

# Initialize
$initBody = '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"opencode","version":"1.0"}}}'
$initResponse = Invoke-WebRequest -Uri "$baseUrl/mcp" -Method POST -Headers $headers -Body $initBody -UseBasicParsing -TimeoutSec 10
$sessionId = $initResponse.Headers["mcp-session-id"]
$headers["mcp-session-id"] = $sessionId

# Call tool
$callBody = @{
    jsonrpc = "2.0"
    id = 3
    method = "tools/call"
    params = @{
        name = $Tool
        arguments = ($ToolArgs | ConvertFrom-Json)
    }
} | ConvertTo-Json -Depth 10

$callResponse = Invoke-WebRequest -Uri "$baseUrl/mcp" -Method POST -Headers $headers -Body $callBody -UseBasicParsing -TimeoutSec 30
$callResponse.Content
