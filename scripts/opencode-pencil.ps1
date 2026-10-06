# OpenPencil HTTP Helper for OpenCode
# Usage: powershell -ExecutionPolicy Bypass -File opencode-pencil.ps1 -Tool "tool_name" -Args '{"key":"value"}'

param(
    [Parameter(Mandatory=$true)]
    [string]$Tool,
    
    [string]$ToolArgs = '{}'
)

$ErrorActionPreference = "Stop"

# Read auth token
$mcpDir = Get-ChildItem "$env:LOCALAPPDATA\Temp\open-pencil-mcp" -Directory -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $mcpDir) {
    Write-Error "OpenPencil MCP server not running. Start OpenPencil first."
    exit 1
}

$mcpFile = Join-Path $mcpDir.FullName "mcp.json"
if (-not (Test-Path $mcpFile)) {
    Write-Error "mcp.json not found at $($mcpDir.FullName)"
    exit 1
}

$token = (Get-Content $mcpFile -Raw | ConvertFrom-Json).authToken

# Connect (initialize)
$headers = @{
    "Authorization" = "Bearer $token"
    "Accept" = "application/json, text/event-stream"
    "Content-Type" = "application/json"
}

$initBody = @{
    jsonrpc = "2.0"
    id = 1
    method = "initialize"
    params = @{
        protocolVersion = "2024-11-05"
        capabilities = @{}
        clientInfo = @{
            name = "opencode"
            version = "1.0"
        }
    }
} | ConvertTo-Json -Depth 10

$initResponse = Invoke-WebRequest -Uri "http://127.0.0.1:7600/mcp" -Method POST -Headers $headers -Body $initBody -UseBasicParsing -TimeoutSec 10
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

$callResponse = Invoke-WebRequest -Uri "http://127.0.0.1:7600/mcp" -Method POST -Headers $headers -Body $callBody -UseBasicParsing -TimeoutSec 30
$callResponse.Content
