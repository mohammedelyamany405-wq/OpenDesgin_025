# manage-classes.ps1 - Manage CSS classes
# Usage:
#   .\manage-classes.ps1 -Action list
#   .\manage-classes.ps1 -Action list -Category "layout"
#   .\manage-classes.ps1 -Action create -Category "custom" -ClassName "my-button" -Properties '{"padding": "12px 24px", "background": "#3b82f6", "color": "white"}'
#   .\manage-classes.ps1 -Action apply -NodeId "0:4" -ClassNames "container,flex-center"
#   .\manage-classes.ps1 -Action remove -NodeId "0:4"
#   .\manage-classes.ps1 -Action show -NodeId "0:4"

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("list", "create", "apply", "remove", "show")]
    [string]$Action,
    
    [string]$Category = "",
    
    [string]$ClassName = "",
    
    [string]$Properties = "{}",
    
    [string]$NodeId = "",
    
    [string]$ClassNames = ""
)

$ErrorActionPreference = "Stop"
$projectDir = "G:\ForWork\ExProject\projects\openpencil"
$classesFile = Join-Path $projectDir "site.classes.json"

# Read classes file
$classesData = if (Test-Path $classesFile) {
    Get-Content $classesFile -Raw | ConvertFrom-Json
} else {
    @{
        version = "1.0"
        classes = @{}
        applied = @{}
    }
}

switch ($Action) {
    "list" {
        Write-Host "=== CSS Classes ===" -ForegroundColor Cyan
        Write-Host ""
        
        if ($Category) {
            # List classes in specific category
            if ($classesData.classes.$Category) {
                Write-Host "Category: $Category" -ForegroundColor Green
                Write-Host ""
                
                foreach ($className in $classesData.classes.$Category.PSObject.Properties.Name) {
                    $class = $classesData.classes.$Category.$className
                    Write-Host "  $className" -ForegroundColor White
                    foreach ($prop in $class.properties.PSObject.Properties.Name) {
                        Write-Host "    ${prop}: $($class.properties.$prop)" -ForegroundColor Gray
                    }
                    Write-Host ""
                }
            } else {
                Write-Host "Category not found: $Category" -ForegroundColor Red
            }
        } else {
            # List all categories
            Write-Host "Categories:" -ForegroundColor Yellow
            foreach ($cat in $classesData.classes.PSObject.Properties.Name) {
                $count = @($classesData.classes.$cat.PSObject.Properties.Name).Count
                Write-Host "  $cat ($count classes)" -ForegroundColor White
            }
            
            Write-Host ""
            Write-Host "Use -Category to view specific class details" -ForegroundColor Gray
        }
    }
    
    "create" {
        if (-not $Category -or -not $ClassName) {
            Write-Host "Please specify -Category and -ClassName" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "=== Creating Class ===" -ForegroundColor Cyan
        
        # Parse properties
        $props = $Properties | ConvertFrom-Json
        
        # Create class object
        $newClass = @{
            name = $ClassName
            properties = @{}
        }
        
        foreach ($prop in $props.PSObject.Properties) {
            $newClass.properties[$prop.Name] = $prop.Value
        }
        
        # Add to category
        if (-not $classesData.classes.$Category) {
            $classesData.classes.$Category = @{}
        }
        
        $classesData.classes.$Category.$ClassName = $newClass
        
        # Save
        $classesData | ConvertTo-Json -Depth 10 | Set-Content -Path $classesFile -Encoding UTF8
        
        Write-Host "Class created!" -ForegroundColor Green
        Write-Host "  Category: $Category" -ForegroundColor White
        Write-Host "  Name: $ClassName" -ForegroundColor White
        Write-Host "  Properties:" -ForegroundColor White
        foreach ($prop in $props.PSObject.Properties) {
            Write-Host "    $($prop.Name): $($prop.Value)" -ForegroundColor Gray
        }
    }
    
    "apply" {
        if (-not $NodeId -or -not $ClassNames) {
            Write-Host "Please specify -NodeId and -ClassNames" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "=== Applying Classes ===" -ForegroundColor Cyan
        
        # Parse class names
        $classNamesArray = $ClassNames -split "," | ForEach-Object { $_.Trim() }
        
        # Validate classes exist
        $validClasses = @()
        foreach ($className in $classNamesArray) {
            $found = $false
            foreach ($cat in $classesData.classes.PSObject.Properties.Name) {
                if ($classesData.classes.$cat.$className) {
                    $validClasses += $className
                    $found = $true
                    break
                }
            }
            if (-not $found) {
                Write-Host "Class not found: $className" -ForegroundColor Yellow
            }
        }
        
        if ($validClasses.Count -eq 0) {
            Write-Host "No valid classes to apply" -ForegroundColor Red
            exit 1
        }
        
        # Apply to node
        if (-not $classesData.applied) {
            $classesData | Add-Member -NotePropertyName "applied" -NotePropertyValue @{} -Force
        }
        
        # Use string key instead of property
        $appliedObj = $classesData.applied | ConvertTo-Json -Depth 10 | ConvertFrom-Json
        $appliedObj | Add-Member -NotePropertyName $NodeId -NotePropertyValue $validClasses -Force
        $classesData.applied = $appliedObj
        
        # Save
        $classesData | ConvertTo-Json -Depth 10 | Set-Content -Path $classesFile -Encoding UTF8
        
        Write-Host "Classes applied to node $NodeId" -ForegroundColor Green
        Write-Host "  Classes: $($validClasses -join ', ')" -ForegroundColor White
    }
    
    "remove" {
        if (-not $NodeId) {
            Write-Host "Please specify -NodeId" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "=== Removing Classes ===" -ForegroundColor Cyan
        
        if ($classesData.applied.$NodeId) {
            $classesData.applied.PSObject.Properties.Remove($NodeId)
            
            # Save
            $classesData | ConvertTo-Json -Depth 10 | Set-Content -Path $classesFile -Encoding UTF8
            
            Write-Host "Classes removed from node $NodeId" -ForegroundColor Green
        } else {
            Write-Host "No classes applied to node $NodeId" -ForegroundColor Yellow
        }
    }
    
    "show" {
        if (-not $NodeId) {
            Write-Host "Please specify -NodeId" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "=== Classes for Node $NodeId ===" -ForegroundColor Cyan
        
        $appliedClasses = $classesData.applied.$NodeId
        
        if ($appliedClasses) {
            Write-Host "Applied classes:" -ForegroundColor Green
            foreach ($className in $appliedClasses) {
                # Find class details
                $classDetails = $null
                foreach ($cat in $classesData.classes.PSObject.Properties.Name) {
                    if ($classesData.classes.$cat.$className) {
                        $classDetails = $classesData.classes.$cat.$className
                        break
                    }
                }
                
                if ($classDetails) {
                    Write-Host "  $className" -ForegroundColor White
                    foreach ($prop in $classDetails.properties.PSObject.Properties.Name) {
                        Write-Host "    ${prop}: $($classDetails.properties.$prop)" -ForegroundColor Gray
                    }
                }
            }
            
            # Generate CSS
            Write-Host ""
            Write-Host "Generated CSS:" -ForegroundColor Yellow
            $cssProps = @()
            foreach ($className in $appliedClasses) {
                foreach ($cat in $classesData.classes.PSObject.Properties.Name) {
                    if ($classesData.classes.$cat.$className) {
                        foreach ($prop in $classesData.classes.$cat.$className.properties.PSObject.Properties.Name) {
                            $cssProps += "$prop`: $($classesData.classes.$cat.$className.properties.$prop)"
                        }
                    }
                }
            }
            Write-Host "  .node-$NodeId {" -ForegroundColor White
            foreach ($prop in $cssProps) {
                Write-Host "    $prop" -ForegroundColor Gray
            }
            Write-Host "  }" -ForegroundColor White
        } else {
            Write-Host "No classes applied to this node" -ForegroundColor Yellow
        }
    }
}
