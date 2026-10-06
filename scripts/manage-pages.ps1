# manage-pages.ps1 - Manage pages in OpenPencil
# Usage: 
#   .\manage-pages.ps1 -Action list
#   .\manage-pages.ps1 -Action create -PageName "About"
#   .\manage-pages.ps1 -Action switch -PageName "About"
#   .\manage-pages.ps1 -Action delete -PageName "About"

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("list", "create", "switch", "delete")]
    [string]$Action,
    
    [string]$PageName = ""
)

$ErrorActionPreference = "Stop"
$projectDir = "G:\ForWork\ExProject\projects\openpencil"
$pagesFile = Join-Path $projectDir "site.pages.json"

# Read MCP token
$discoveryPath = Join-Path $env:LOCALAPPDATA "Temp\open-pencil-mcp\18d901424f534c7b\mcp.json"
if (-not (Test-Path $discoveryPath)) {
    Write-Host "MCP server not running. Start OpenPencil first." -ForegroundColor Red
    exit 1
}

$discovery = Get-Content $discoveryPath -Raw | ConvertFrom-Json
$token = $discovery.authToken

# Function to call MCP tool
function Invoke-McpTool {
    param(
        [string]$ToolName,
        [hashtable]$ToolArgs = @{}
    )
    
    $headers = @{"Authorization" = "Bearer $token"; "Accept" = "application/json, text/event-stream"; "Content-Type" = "application/json"}
    $initBody = '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"opencode","version":"1.0"}}}'
    $initResponse = Invoke-WebRequest -Uri "http://127.0.0.1:7600/mcp" -Method POST -Headers $headers -Body $initBody -UseBasicParsing -TimeoutSec 10
    $sessionId = $initResponse.Headers["mcp-session-id"]
    $headers["mcp-session-id"] = $sessionId
    
    $callBody = @{
        jsonrpc = "2.0"
        id = 3
        method = "tools/call"
        params = @{
            name = $ToolName
            arguments = $ToolArgs
        }
    } | ConvertTo-Json -Depth 10
    
    $callResponse = Invoke-WebRequest -Uri "http://127.0.0.1:7600/mcp" -Method POST -Headers $headers -Body $callBody -UseBasicParsing -TimeoutSec 30
    return ($callResponse.Content | ConvertFrom-Json).result.content[0].text
}

# Read or create pages config
$pagesConfig = if (Test-Path $pagesFile) {
    Get-Content $pagesFile -Raw | ConvertFrom-Json
} else {
    @{
        version = "1.0"
        pages = @()
        breakpoints = @{
            desktop = 1200
            tablet = 768
            mobile = 375
        }
    }
}

switch ($Action) {
    "list" {
        Write-Host "=== Pages ===" -ForegroundColor Cyan
        
        # Get pages from OpenPencil
        $pagesResult = Invoke-McpTool -ToolName "list_pages"
        $pagesData = $pagesResult | ConvertFrom-Json
        
        Write-Host "Current page: $($pagesData.current)" -ForegroundColor Green
        Write-Host ""
        Write-Host "All pages:" -ForegroundColor Yellow
        foreach ($page in $pagesData.pages) {
            $marker = if ($page.name -eq $pagesData.current) { " *" } else { "" }
            Write-Host "  [$($page.id)] $($page.name)$marker" -ForegroundColor White
        }
        
        # Show breakpoints
        Write-Host ""
        Write-Host "Breakpoints:" -ForegroundColor Yellow
        Write-Host "  Desktop: $($pagesConfig.breakpoints.desktop)px" -ForegroundColor White
        Write-Host "  Tablet: $($pagesConfig.breakpoints.tablet)px" -ForegroundColor White
        Write-Host "  Mobile: $($pagesConfig.breakpoints.mobile)px" -ForegroundColor White
    }
    
    "create" {
        if (-not $PageName) {
            Write-Host "Please specify -PageName" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "=== Creating Page: $PageName ===" -ForegroundColor Cyan
        
        $createResult = Invoke-McpTool -ToolName "create_page" -ToolArgs @{name = $PageName}
        $createData = $createResult | ConvertFrom-Json
        
        Write-Host "✅ Page created!" -ForegroundColor Green
        Write-Host "  ID: $($createData.id)" -ForegroundColor White
        Write-Host "  Name: $($createData.name)" -ForegroundColor White
        
        # Add to pages config
        $pagesConfig.pages += @{
            id = $createData.id
            name = $createData.name
            frames = @()
        }
        
        # Save pages config
        $pagesConfig | ConvertTo-Json -Depth 10 | Set-Content -Path $pagesFile -Encoding UTF8
        Write-Host "Saved to: $pagesFile" -ForegroundColor Gray
    }
    
    "switch" {
        if (-not $PageName) {
            Write-Host "Please specify -PageName" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "=== Switching to Page: $PageName ===" -ForegroundColor Cyan
        
        $switchResult = Invoke-McpTool -ToolName "switch_page" -ToolArgs @{page = $PageName}
        Write-Host "✅ Switched to page: $PageName" -ForegroundColor Green
    }
    
    "delete" {
        if (-not $PageName) {
            Write-Host "Please specify -PageName" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "=== Deleting Page: $PageName ===" -ForegroundColor Cyan
        
        # Get page ID first
        $pagesResult = Invoke-McpTool -ToolName "list_pages"
        $pagesData = $pagesResult | ConvertFrom-Json
        $pageToDelete = $pagesData.pages | Where-Object { $_.name -eq $PageName }
        
        if (-not $pageToDelete) {
            Write-Host "Page not found: $PageName" -ForegroundColor Red
            exit 1
        }
        
        $deleteResult = Invoke-McpTool -ToolName "delete_node" -ToolArgs @{id = $pageToDelete.id}
        Write-Host "✅ Page deleted: $PageName" -ForegroundColor Green
        
        # Remove from pages config
        $pagesConfig.pages = $pagesConfig.pages | Where-Object { $_.name -ne $PageName }
        $pagesConfig | ConvertTo-Json -Depth 10 | Set-Content -Path $pagesFile -Encoding UTF8
    }
}
