# assign-tag.ps1 - Assign HTML tag to a node
# Usage: powershell -ExecutionPolicy Bypass -File assign-tag.ps1 -NodeId "0:3" -NodeType "FRAME" -Tag "header" -Behavior "sticky"

param(
    [Parameter(Mandatory=$true)]
    [string]$NodeId,
    
    [Parameter(Mandatory=$true)]
    [string]$NodeType,
    
    [string]$Tag = "",
    
    [string]$Behavior = "none",
    
    [string]$Classes = ""
)

$ErrorActionPreference = "Stop"
$projectDir = "G:\ForWork\ExProject\projects\openpencil"
$sidecarFile = Join-Path $projectDir "site.tags.json"
$availableTagsFile = Join-Path $projectDir "available-tags.json"

# Read available tags
$availableTags = Get-Content $availableTagsFile -Raw | ConvertFrom-Json

# Get available tags for this node type
$nodeTypeTags = $availableTags.tags.$NodeType
if (-not $nodeTypeTags) {
    Write-Host "No tags available for node type: $NodeType" -ForegroundColor Red
    exit 1
}

# If no tag specified, show available tags
if (-not $Tag) {
    Write-Host "=== Available Tags for $NodeType ===" -ForegroundColor Cyan
    Write-Host ""
    for ($i = 0; $i -lt $nodeTypeTags.available.Count; $i++) {
        $t = $nodeTypeTags.available[$i]
        Write-Host "  [$($i+1)] $($t.tag) - $($t.name)" -ForegroundColor White
        Write-Host "      $($t.description)" -ForegroundColor Gray
    }
    Write-Host ""
    Write-Host "Usage: .\assign-tag.ps1 -NodeId '$NodeId' -NodeType '$NodeType' -Tag '<tag_name>'" -ForegroundColor Yellow
    exit 0
}

# Validate tag
$validTag = $nodeTypeTags.available | Where-Object { $_.tag -eq $Tag }
if (-not $validTag) {
    Write-Host "Invalid tag '$Tag' for node type $NodeType" -ForegroundColor Red
    Write-Host "Available tags: $($nodeTypeTags.available.tag -join ', ')" -ForegroundColor Yellow
    exit 1
}

# Read existing sidecar data
$sidecarData = if (Test-Path $sidecarFile) {
    Get-Content $sidecarFile -Raw | ConvertFrom-Json
} else {
    @{
        version = "1.0"
        nodes = @{}
    }
}

# Ensure nodes property exists
if (-not $sidecarData.nodes) {
    $sidecarData | Add-Member -NotePropertyName "nodes" -NotePropertyValue @{} -Force
}

# Update or create node entry
$classesArray = if ($Classes) { $Classes -split ',' | ForEach-Object { $_.Trim() } } else { @() }
$nodeEntry = @{
    htmlTag = $Tag
    behavior = $Behavior
    classes = $classesArray
    updatedAt = (Get-Date).ToString("o")
}

$sidecarData.nodes | Add-Member -NotePropertyName $NodeId -NotePropertyValue $nodeEntry -Force

# Save sidecar data
$sidecarData | ConvertTo-Json -Depth 10 | Set-Content -Path $sidecarFile -Encoding UTF8

Write-Host "✅ Tag assigned successfully!" -ForegroundColor Green
Write-Host "  Node: $NodeId" -ForegroundColor White
Write-Host "  Tag: $Tag" -ForegroundColor White
Write-Host "  Behavior: $Behavior" -ForegroundColor White
Write-Host "  Classes: $($Classes -join ', ')" -ForegroundColor White
Write-Host ""
Write-Host "Saved to: $sidecarFile" -ForegroundColor Gray
