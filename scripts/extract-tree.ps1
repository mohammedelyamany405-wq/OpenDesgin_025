# extract-tree.ps1 - Extract DOM tree from OpenPencil and merge with tags
# Usage: powershell -ExecutionPolicy Bypass -File extract-tree.ps1

$ErrorActionPreference = "Stop"
$projectDir = "G:\ForWork\ExProject\projects\openpencil"
$sidecarFile = Join-Path $projectDir "site.tags.json"
$outputFile = Join-Path $projectDir "site.dom.json"

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

# Read sidecar tags
$sidecarData = if (Test-Path $sidecarFile) {
    Get-Content $sidecarFile -Raw | ConvertFrom-Json
} else {
    @{ version = "1.0"; nodes = @{} }
}

# Get page tree
Write-Host "=== Extracting DOM Tree ===" -ForegroundColor Cyan
$treeResult = Invoke-McpTool -ToolName "get_page_tree"
$tree = $treeResult | ConvertFrom-Json

Write-Host "Page: $($tree.page)" -ForegroundColor Green
Write-Host "Children: $($tree.children.Count)" -ForegroundColor Green

# Function to merge tags with tree
function Merge-TagsWithNode {
    param(
        [object]$Node,
        [object]$SidecarData
    )
    
    $nodeId = $Node.id
    $nodeTag = $SidecarData.nodes.$nodeId
    
    $result = @{
        id = $nodeId
        type = $Node.type
        name = $Node.name
        width = $Node.w
        height = $Node.h
    }
    
    if ($nodeTag) {
        $result.htmlTag = $nodeTag.htmlTag
        $result.behavior = $nodeTag.behavior
        $result.classes = $nodeTag.classes
    } else {
        $result.htmlTag = $null
        $result.behavior = "none"
        $result.classes = @()
    }
    
    # Process children
    if ($Node.children -and $Node.children.Count -gt 0) {
        $result.children = @()
        foreach ($child in $Node.children) {
            $result.children += Merge-TagsWithNode -Node $child -SidecarData $SidecarData
        }
    }
    
    return $result
}

# Merge tags with tree
$domTree = @{
    page = $tree.page
    elements = @()
}

foreach ($child in $tree.children) {
    $domTree.elements += Merge-TagsWithNode -Node $child -SidecarData $sidecarData
}

# Save DOM tree
$domTree | ConvertTo-Json -Depth 10 | Set-Content -Path $outputFile -Encoding UTF8

Write-Host ""
Write-Host "=== DOM Tree Extracted ===" -ForegroundColor Cyan
Write-Host "Saved to: $outputFile" -ForegroundColor Green

# Display summary
$taggedCount = 0
$untaggedCount = 0

function Count-Nodes {
    param([object]$Node)
    
    if ($Node.htmlTag) {
        $script:taggedCount++
    } else {
        $script:untaggedCount++
    }
    
    if ($Node.children) {
        foreach ($child in $Node.children) {
            Count-Nodes -Node $child
        }
    }
}

foreach ($element in $domTree.elements) {
    Count-Nodes -Node $element
}

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "Tagged elements: $taggedCount" -ForegroundColor Green
Write-Host "Untagged elements: $untaggedCount" -ForegroundColor Yellow
Write-Host "Total: $($taggedCount + $untaggedCount)" -ForegroundColor White
