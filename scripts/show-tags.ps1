# show-tags.ps1 - Display all saved tags
# Usage: powershell -ExecutionPolicy Bypass -File show-tags.ps1

$ErrorActionPreference = "Stop"
$projectDir = "G:\ForWork\ExProject\projects\openpencil"
$sidecarFile = Join-Path $projectDir "site.tags.json"

if (-not (Test-Path $sidecarFile)) {
    Write-Host "No tags file found. Start assigning tags first." -ForegroundColor Yellow
    exit 0
}

$sidecarData = Get-Content $sidecarFile -Raw | ConvertFrom-Json

Write-Host "=== Web Builder - Saved Tags ===" -ForegroundColor Cyan
Write-Host "Version: $($sidecarData.version)" -ForegroundColor Gray
Write-Host ""

$nodeCount = $sidecarData.nodes.PSObject.Properties.Name.Count
if ($nodeCount -eq 0) {
    Write-Host "No tags assigned yet." -ForegroundColor Yellow
    exit 0
}

Write-Host "Total nodes with tags: $nodeCount" -ForegroundColor Green
Write-Host ""

# Group by tag type
$tagGroups = @{}
foreach ($nodeId in $sidecarData.nodes.PSObject.Properties.Name) {
    $nodeData = $sidecarData.nodes.$nodeId
    $tag = $nodeData.htmlTag
    if (-not $tagGroups[$tag]) {
        $tagGroups[$tag] = @()
    }
    $tagGroups[$tag] += @{
        id = $nodeId
        behavior = $nodeData.behavior
        classes = $nodeData.classes
    }
}

# Display by tag type
foreach ($tag in $tagGroups.Keys | Sort-Object) {
    $nodes = $tagGroups[$tag]
    Write-Host "[$tag] ($($nodes.Count) nodes)" -ForegroundColor Yellow
    
    foreach ($node in $nodes) {
        Write-Host "  Node: $($node.id)" -ForegroundColor White
        Write-Host "    Behavior: $($node.behavior)" -ForegroundColor Gray
        Write-Host "    Classes: $($node.classes -join ', ')" -ForegroundColor Gray
    }
    Write-Host ""
}

# Summary
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "Total tags: $nodeCount" -ForegroundColor White
Write-Host "Tag types: $($tagGroups.Keys.Count)" -ForegroundColor White
Write-Host "File: $sidecarFile" -ForegroundColor Gray
