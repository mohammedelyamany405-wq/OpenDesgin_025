# manage-frames.ps1 - Manage frames/breakpoints for a page
# Usage:
#   .\manage-frames.ps1 -Action list
#   .\manage-frames.ps1 -Action create -FrameName "Desktop" -Width 1200 -Height 800
#   .\manage-frames.ps1 -Action create-responsive -PageName "Page 1"

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("list", "create", "create-responsive", "delete")]
    [string]$Action,
    
    [string]$FrameName = "",
    
    [int]$Width = 0,
    
    [int]$Height = 800,
    
    [string]$PageName = "Page 1"
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

# Read pages config
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
        Write-Host "=== Frames ===" -ForegroundColor Cyan
        
        # Get current page tree
        $treeResult = Invoke-McpTool -ToolName "get_page_tree"
        $tree = $treeResult | ConvertFrom-Json
        
        Write-Host "Page: $($tree.page)" -ForegroundColor Green
        Write-Host ""
        
        if ($tree.children.Count -eq 0) {
            Write-Host "No frames found." -ForegroundColor Yellow
        } else {
            Write-Host "Frames:" -ForegroundColor Yellow
            foreach ($child in $tree.children) {
                Write-Host "  [$($child.id)] $($child.name)" -ForegroundColor White
                Write-Host "    Size: $($child.w) x $($child.h)" -ForegroundColor Gray
            }
        }
        
        # Show breakpoints
        Write-Host ""
        Write-Host "Breakpoints:" -ForegroundColor Yellow
        Write-Host "  Desktop: >= $($pagesConfig.breakpoints.desktop)px" -ForegroundColor White
        Write-Host "  Tablet: >= $($pagesConfig.breakpoints.tablet)px" -ForegroundColor White
        Write-Host "  Mobile: >= $($pagesConfig.breakpoints.mobile)px" -ForegroundColor White
    }
    
    "create" {
        if (-not $FrameName) {
            Write-Host "Please specify -FrameName" -ForegroundColor Red
            exit 1
        }
        
        if ($Width -eq 0) {
            Write-Host "Please specify -Width" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "=== Creating Frame: $FrameName ===" -ForegroundColor Cyan
        
        $createResult = Invoke-McpTool -ToolName "create_shape" -ToolArgs @{
            type = "FRAME"
            x = 0
            y = 0
            width = $Width
            height = $Height
            name = $FrameName
        }
        $createData = $createResult | ConvertFrom-Json
        
        Write-Host "✅ Frame created!" -ForegroundColor Green
        Write-Host "  ID: $($createData.id)" -ForegroundColor White
        Write-Host "  Name: $($createData.name)" -ForegroundColor White
        Write-Host "  Size: $Width x $Height" -ForegroundColor White
    }
    
    "create-responsive" {
        Write-Host "=== Creating Responsive Frames ===" -ForegroundColor Cyan
        
        # Get breakpoints
        $desktopWidth = $pagesConfig.breakpoints.desktop
        $tabletWidth = $pagesConfig.breakpoints.tablet
        $mobileWidth = $pagesConfig.breakpoints.mobile
        
        # Create frames
        $frames = @(
            @{ name = "Desktop"; width = $desktopWidth; height = 800 },
            @{ name = "Tablet"; width = $tabletWidth; height = 1024 },
            @{ name = "Mobile"; width = $mobileWidth; height = 812 }
        )
        
        $yOffset = 0
        foreach ($frame in $frames) {
            Write-Host "  Creating $($frame.name) ($($frame.width)x$($frame.height))..." -ForegroundColor Yellow
            
            $createResult = Invoke-McpTool -ToolName "create_shape" -ToolArgs @{
                type = "FRAME"
                x = 0
                y = $yOffset
                width = $frame.width
                height = $frame.height
                name = $frame.name
            }
            $createData = $createResult | ConvertFrom-Json
            
            Write-Host "    ✅ Created: $($createData.id)" -ForegroundColor Green
            
            $yOffset += $frame.height + 50
        }
        
        Write-Host ""
        Write-Host "✅ All responsive frames created!" -ForegroundColor Green
    }
    
    "delete" {
        if (-not $FrameName) {
            Write-Host "Please specify -FrameName" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "=== Deleting Frame: $FrameName ===" -ForegroundColor Cyan
        
        # Get frame ID
        $treeResult = Invoke-McpTool -ToolName "get_page_tree"
        $tree = $treeResult | ConvertFrom-Json
        $frameToDelete = $tree.children | Where-Object { $_.name -eq $FrameName }
        
        if (-not $frameToDelete) {
            Write-Host "Frame not found: $FrameName" -ForegroundColor Red
            exit 1
        }
        
        $deleteResult = Invoke-McpTool -ToolName "delete_node" -ToolArgs @{id = $frameToDelete.id}
        Write-Host "✅ Frame deleted: $FrameName" -ForegroundColor Green
    }
}
