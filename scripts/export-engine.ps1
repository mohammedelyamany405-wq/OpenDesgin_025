# export-engine.ps1 - Final export engine
# Generates clean HTML/CSS from all collected data
# Usage:
#   .\export-engine.ps1 -Action preview
#   .\export-engine.ps1 -Action export
#   .\export-engine.ps1 -Action validate-then-export

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("preview", "export", "validate-then-export")]
    [string]$Action
)

$ErrorActionPreference = "Stop"
$projectDir = "G:\ForWork\ExProject\projects\openpencil"
$outputDir = Join-Path $projectDir "export"

# Create export directory
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

# Read all data files
$sidecarFile = Join-Path $projectDir "site.tags.json"
$domFile = Join-Path $projectDir "site.dom.json"
$pagesFile = Join-Path $projectDir "site.pages.json"
$classesFile = Join-Path $projectDir "site.classes.json"
$layoutFile = Join-Path $projectDir "site.layout.json"

$sidecarData = if (Test-Path $sidecarFile) { Get-Content $sidecarFile -Raw | ConvertFrom-Json } else { $null }
$domData = if (Test-Path $domFile) { Get-Content $domFile -Raw | ConvertFrom-Json } else { $null }
$pagesData = if (Test-Path $pagesFile) { Get-Content $pagesFile -Raw | ConvertFrom-Json } else { $null }
$classesData = if (Test-Path $classesFile) { Get-Content $classesFile -Raw | ConvertFrom-Json } else { $null }
$layoutData = if (Test-Path $layoutFile) { Get-Content $layoutFile -Raw | ConvertFrom-Json } else { $null }

# Function to generate CSS for a node
function Get-NodeCss {
    param(
        [string]$NodeId,
        [object]$NodeData
    )
    
    $cssProps = @()
    
    # Get classes CSS
    if ($classesData -and $classesData.applied.$NodeId) {
        foreach ($className in $classesData.applied.$NodeId) {
            foreach ($cat in $classesData.classes.PSObject.Properties.Name) {
                if ($classesData.classes.$cat.$className) {
                    foreach ($prop in $classesData.classes.$cat.$className.properties.PSObject.Properties.Name) {
                        $cssProps += "$prop`: $($classesData.classes.$cat.$className.properties.$prop)"
                    }
                }
            }
        }
    }
    
    # Get layout CSS
    if ($layoutData -and $layoutData.layouts.$NodeId) {
        $layout = $layoutData.layouts.$NodeId
        if ($layout.type -eq "flexbox") {
            $cssProps += "display: flex"
            $cssProps += "flex-direction: $($layout.direction)"
            $cssProps += "gap: $($layout.gap)px"
            $cssProps += "align-items: $($layout.align)"
            $cssProps += "justify-content: $($layout.justify)"
        } else {
            $cssProps += "display: grid"
            $cssProps += "grid-template-columns: repeat($($layout.columns), 1fr)"
            $cssProps += "gap: $($layout.gap)px"
        }
    }
    
    # Get dimensions
    if ($NodeData.width -and $NodeData.height) {
        $cssProps += "width: $($NodeData.width)px"
        $cssProps += "height: $($NodeData.height)px"
    }
    
    return $cssProps
}

# Function to generate HTML node
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
    
    # Get CSS
    $cssProps = Get-NodeCss -NodeId $Node.id -NodeData $Node
    if ($cssProps.Count -gt 0) {
        $cssStr = $cssProps -join "; "
        $attrs += "style=`"$cssStr`""
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
        if ($tag -eq "img" -or $tag -eq "br" -or $tag -eq "hr") {
            $html = "$indentStr<$tag$attrStr />"
        } else {
            $html = "$indentStr<$tag$attrStr></$tag>"
        }
    }
    
    return $html
}

switch ($Action) {
    "preview" {
        Write-Host "=== Export Preview ===" -ForegroundColor Cyan
        
        if (-not $domData) {
            Write-Host "DOM tree not found. Run extract-tree.ps1 first." -ForegroundColor Red
            exit 1
        }
        
        # Generate HTML
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
        
        foreach ($element in $domData.elements) {
            $htmlParts += Generate-HtmlNode -Node $element -Indent 1
        }
        
        $htmlParts += "</body>"
        $htmlParts += "</html>"
        
        # Show preview
        Write-Host ""
        Write-Host "HTML Preview:" -ForegroundColor Yellow
        $htmlParts -join "`n"
    }
    
    "export" {
        Write-Host "=== Exporting ===" -ForegroundColor Cyan
        
        if (-not $domData) {
            Write-Host "DOM tree not found. Run extract-tree.ps1 first." -ForegroundColor Red
            exit 1
        }
        
        # Generate HTML
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
        
        foreach ($element in $domData.elements) {
            $htmlParts += Generate-HtmlNode -Node $element -Indent 1
        }
        
        $htmlParts += "</body>"
        $htmlParts += "</html>"
        
        # Save HTML
        $htmlContent = $htmlParts -join "`n"
        $htmlFile = Join-Path $outputDir "index.html"
        $htmlContent | Set-Content -Path $htmlFile -Encoding UTF8
        
        Write-Host "Exported to: $htmlFile" -ForegroundColor Green
        
        # Generate CSS file
        $cssParts = @()
        $cssParts += "/* Generated by Web Builder Classifier */"
        $cssParts += ""
        
        # Add all classes
        if ($classesData) {
            foreach ($cat in $classesData.classes.PSObject.Properties.Name) {
                $cssParts += "/* $cat */"
                foreach ($className in $classesData.classes.$cat.PSObject.Properties.Name) {
                    $class = $classesData.classes.$cat.$className
                    $cssParts += ".$className {"
                    foreach ($prop in $class.properties.PSObject.Properties.Name) {
                        $cssParts += "  ${prop}: $($class.properties.$prop);"
                    }
                    $cssParts += "}"
                    $cssParts += ""
                }
            }
        }
        
        $cssContent = $cssParts -join "`n"
        $cssFile = Join-Path $outputDir "styles.css"
        $cssContent | Set-Content -Path $cssFile -Encoding UTF8
        
        Write-Host "CSS exported to: $cssFile" -ForegroundColor Green
        
        # Generate summary
        Write-Host ""
        Write-Host "=== Export Summary ===" -ForegroundColor Yellow
        Write-Host "HTML: $htmlFile" -ForegroundColor White
        Write-Host "CSS: $cssFile" -ForegroundColor White
        
        if ($classesData -and $classesData.classes) {
            $totalClasses = 0
            foreach ($cat in $classesData.classes.PSObject.Properties.Name) {
                $totalClasses += @($classesData.classes.$cat.PSObject.Properties.Name).Count
            }
            Write-Host "Classes: $totalClasses" -ForegroundColor White
        }
        
        if ($layoutData -and $layoutData.layouts) {
            Write-Host "Layouts: $($layoutData.layouts.PSObject.Properties.Count)" -ForegroundColor White
        }
    }
    
    "validate-then-export" {
        Write-Host "=== Validate Then Export ===" -ForegroundColor Cyan
        
        # Run validation first
        Write-Host ""
        Write-Host "Running validation..." -ForegroundColor Yellow
        $validateResult = & "G:\ForWork\ExProject\scripts\validate.ps1" -Action full
        
        # Check if validation passed
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "Validation passed! Proceeding with export..." -ForegroundColor Green
            & $PSCommandPath -Action export
        } else {
            Write-Host ""
            Write-Host "Validation failed. Fix errors before exporting." -ForegroundColor Red
        }
    }
}
