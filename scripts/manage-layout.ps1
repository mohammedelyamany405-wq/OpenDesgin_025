# manage-layout.ps1 - Manage Grid/Flexbox layout
# Usage:
#   .\manage-layout.ps1 -Action list
#   .\manage-layout.ps1 -Action apply -NodeId "0:5" -Type "flexbox" -Direction "row" -Gap 16 -Align "center" -Justify "space-between"
#   .\manage-layout.ps1 -Action apply -NodeId "0:6" -Type "grid" -Columns 3 -Gap 20
#   .\manage-layout.ps1 -Action show -NodeId "0:5"
#   .\manage-layout.ps1 -Action remove -NodeId "0:5"

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("list", "apply", "show", "remove")]
    [string]$Action,
    
    [string]$NodeId = "",
    
    [string]$Type = "flexbox",
    
    [string]$Direction = "row",
    
    [int]$Columns = 0,
    
    [int]$Gap = 0,
    
    [string]$Align = "stretch",
    
    [string]$Justify = "flex-start",
    
    [string]$Wrap = "nowrap"
)

$ErrorActionPreference = "Stop"
$projectDir = "G:\ForWork\ExProject\projects\openpencil"
$layoutFile = Join-Path $projectDir "site.layout.json"

# Read layout file
$layoutData = if (Test-Path $layoutFile) {
    Get-Content $layoutFile -Raw | ConvertFrom-Json
} else {
    @{
        version = "1.0"
        layouts = @{}
    }
}

switch ($Action) {
    "list" {
        Write-Host "=== Layouts ===" -ForegroundColor Cyan
        Write-Host ""
        
        if ($layoutData.layouts.PSObject.Properties.Count -eq 0) {
            Write-Host "No layouts defined." -ForegroundColor Yellow
        } else {
            foreach ($nodeId in $layoutData.layouts.PSObject.Properties.Name) {
                $layout = $layoutData.layouts.$nodeId
                Write-Host "Node: $nodeId" -ForegroundColor White
                Write-Host "  Type: $($layout.type)" -ForegroundColor Gray
                
                if ($layout.type -eq "flexbox") {
                    Write-Host "  Direction: $($layout.direction)" -ForegroundColor Gray
                    Write-Host "  Gap: $($layout.gap)px" -ForegroundColor Gray
                    Write-Host "  Align: $($layout.align)" -ForegroundColor Gray
                    Write-Host "  Justify: $($layout.justify)" -ForegroundColor Gray
                } else {
                    Write-Host "  Columns: $($layout.columns)" -ForegroundColor Gray
                    Write-Host "  Gap: $($layout.gap)px" -ForegroundColor Gray
                }
                Write-Host ""
            }
        }
    }
    
    "apply" {
        if (-not $NodeId) {
            Write-Host "Please specify -NodeId" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "=== Applying Layout ===" -ForegroundColor Cyan
        
        $layout = @{
            type = $Type
            timestamp = (Get-Date).ToString("o")
        }
        
        if ($Type -eq "flexbox") {
            $layout.direction = $Direction
            $layout.gap = $Gap
            $layout.align = $Align
            $layout.justify = $Justify
            $layout.wrap = $Wrap
            
            Write-Host "  Type: Flexbox" -ForegroundColor White
            Write-Host "  Direction: $Direction" -ForegroundColor Gray
            Write-Host "  Gap: ${Gap}px" -ForegroundColor Gray
            Write-Host "  Align: $Align" -ForegroundColor Gray
            Write-Host "  Justify: $Justify" -ForegroundColor Gray
        } else {
            $layout.columns = $Columns
            $layout.gap = $Gap
            
            Write-Host "  Type: Grid" -ForegroundColor White
            Write-Host "  Columns: $Columns" -ForegroundColor Gray
            Write-Host "  Gap: ${Gap}px" -ForegroundColor Gray
        }
        
        # Save layout
        $layoutObj = $layoutData.layouts | ConvertTo-Json -Depth 10 | ConvertFrom-Json
        $layoutObj | Add-Member -NotePropertyName $NodeId -NotePropertyValue $layout -Force
        $layoutData.layouts = $layoutObj
        $layoutData | ConvertTo-Json -Depth 10 | Set-Content -Path $layoutFile -Encoding UTF8
        
        Write-Host ""
        Write-Host "Layout applied to node $NodeId" -ForegroundColor Green
    }
    
    "show" {
        if (-not $NodeId) {
            Write-Host "Please specify -NodeId" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "=== Layout for Node $NodeId ===" -ForegroundColor Cyan
        
        $layout = $layoutData.layouts.$NodeId
        
        if ($layout) {
            Write-Host "Type: $($layout.type)" -ForegroundColor White
            
            if ($layout.type -eq "flexbox") {
                Write-Host "Direction: $($layout.direction)" -ForegroundColor Gray
                Write-Host "Gap: $($layout.gap)px" -ForegroundColor Gray
                Write-Host "Align: $($layout.align)" -ForegroundColor Gray
                Write-Host "Justify: $($layout.justify)" -ForegroundColor Gray
                
                # Generate CSS
                Write-Host ""
                Write-Host "Generated CSS:" -ForegroundColor Yellow
                Write-Host "  display: flex;" -ForegroundColor Gray
                Write-Host "  flex-direction: $($layout.direction);" -ForegroundColor Gray
                Write-Host "  gap: $($layout.gap)px;" -ForegroundColor Gray
                Write-Host "  align-items: $($layout.align);" -ForegroundColor Gray
                Write-Host "  justify-content: $($layout.justify);" -ForegroundColor Gray
            } else {
                Write-Host "Columns: $($layout.columns)" -ForegroundColor Gray
                Write-Host "Gap: $($layout.gap)px" -ForegroundColor Gray
                
                # Generate CSS
                Write-Host ""
                Write-Host "Generated CSS:" -ForegroundColor Yellow
                Write-Host "  display: grid;" -ForegroundColor Gray
                Write-Host "  grid-template-columns: repeat($($layout.columns), 1fr);" -ForegroundColor Gray
                Write-Host "  gap: $($layout.gap)px;" -ForegroundColor Gray
            }
        } else {
            Write-Host "No layout defined for this node" -ForegroundColor Yellow
        }
    }
    
    "remove" {
        if (-not $NodeId) {
            Write-Host "Please specify -NodeId" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "=== Removing Layout ===" -ForegroundColor Cyan
        
        if ($layoutData.layouts.$NodeId) {
            $layoutData.layouts.PSObject.Properties.Remove($NodeId)
            $layoutData | ConvertTo-Json -Depth 10 | Set-Content -Path $layoutFile -Encoding UTF8
            Write-Host "Layout removed from node $NodeId" -ForegroundColor Green
        } else {
            Write-Host "No layout defined for node $NodeId" -ForegroundColor Yellow
        }
    }
}
