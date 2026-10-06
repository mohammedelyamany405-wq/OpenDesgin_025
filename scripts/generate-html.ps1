# generate-html.ps1 - Generate clean HTML from DOM tree
# Usage: powershell -ExecutionPolicy Bypass -File generate-html.ps1

$ErrorActionPreference = "Stop"
$projectDir = "G:\ForWork\ExProject\projects\openpencil"
$domFile = Join-Path $projectDir "site.dom.json"
$outputDir = Join-Path $projectDir "export"

# Create export directory
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

# Read DOM tree
if (-not (Test-Path $domFile)) {
    Write-Host "DOM tree not found. Run extract-tree.ps1 first." -ForegroundColor Red
    exit 1
}

$domData = Get-Content $domFile -Raw | ConvertFrom-Json

Write-Host "=== Generating HTML ===" -ForegroundColor Cyan
Write-Host "Page: $($domData.page)" -ForegroundColor Green

# Function to generate HTML from node
function Generate-HtmlNode {
    param(
        [object]$Node,
        [int]$Indent = 0
    )
    
    $indentStr = "  " * $Indent
    $tag = if ($Node.htmlTag) { $Node.htmlTag } else { "div" }
    $classes = if ($Node.classes -and $Node.classes.Count -gt 0) { $Node.classes -join " " } else { "" }
    
    # Build attributes
    $attrs = @()
    if ($classes) { $attrs += "class=`"$classes`"" }
    
    # Add inline styles for dimensions
    if ($Node.width -and $Node.height) {
        $attrs += "style=`"width: $($Node.width)px; height: $($Node.height)px`""
    }
    
    $attrStr = if ($attrs.Count -gt 0) { " " + ($attrs -join " ") } else { "" }
    
    # Generate HTML
    if ($Node.children -and $Node.children.Count -gt 0) {
        $html = "$indentStr<$tag$attrStr>`n"
        foreach ($child in $Node.children) {
            $html += Generate-HtmlNode -Node $child -Indent ($Indent + 1)
            $html += "`n"
        }
        $html += "$indentStr</$tag>"
    } else {
        # Self-closing or empty tag
        if ($tag -eq "img" -or $tag -eq "br" -or $tag -eq "hr") {
            $html = "$indentStr<$tag$attrStr />"
        } else {
            $html = "$indentStr<$tag$attrStr></$tag>"
        }
    }
    
    return $html
}

# Generate HTML structure
$htmlParts = @()
$htmlParts += "<!DOCTYPE html>"
$htmlParts += "<html lang=`"en`">"
$htmlParts += "<head>"
$htmlParts += "  <meta charset=`"UTF-8`">"
$htmlParts += "  <meta name=`"viewport`" content=`"width=device-width, initial-scale=1.0`">"
$htmlParts += "  <title>$($domData.page)</title>"
$htmlParts += "  <style>"
$htmlParts += "    body { margin: 0; padding: 20px; font-family: sans-serif; }"
$htmlParts += "    * { box-sizing: border-box; }"
$htmlParts += "  </style>"
$htmlParts += "</head>"
$htmlParts += "<body>"

# Add elements
foreach ($element in $domData.elements) {
    $htmlParts += Generate-HtmlNode -Node $element -Indent 1
}

$htmlParts += "</body>"
$htmlParts += "</html>"

# Save HTML
$htmlContent = $htmlParts -join "`n"
$htmlFile = Join-Path $outputDir "index.html"
$htmlContent | Set-Content -Path $htmlFile -Encoding UTF8

Write-Host ""
Write-Host "=== HTML Generated ===" -ForegroundColor Cyan
Write-Host "Saved to: $htmlFile" -ForegroundColor Green

# Show preview
Write-Host ""
Write-Host "=== HTML Preview ===" -ForegroundColor Yellow
$htmlContent
