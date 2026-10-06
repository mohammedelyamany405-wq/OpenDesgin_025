# validate.ps1 - Smart validation system for Web Builder
# Usage:
#   .\validate.ps1 -Action semantic
#   .\validate.ps1 -Action technical
#   .\validate.ps1 -Action full
#   .\validate.ps1 -Action export-check

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("semantic", "technical", "full", "export-check")]
    [string]$Action
)

$ErrorActionPreference = "Stop"
$projectDir = "G:\ForWork\ExProject\projects\openpencil"
$sidecarFile = Join-Path $projectDir "site.tags.json"
$domFile = Join-Path $projectDir "site.dom.json"
$pagesFile = Join-Path $projectDir "site.pages.json"

# Read files
$sidecarData = if (Test-Path $sidecarFile) {
    Get-Content $sidecarFile -Raw | ConvertFrom-Json
} else {
    @{ version = "1.0"; nodes = @{} }
}

$domData = if (Test-Path $domFile) {
    Get-Content $domFile -Raw | ConvertFrom-Json
} else {
    $null
}

$pagesData = if (Test-Path $pagesFile) {
    Get-Content $pagesFile -Raw | ConvertFrom-Json
} else {
    $null
}

# Validation results
$results = @{
    errors = @()
    warnings = @()
    info = @()
    passed = @()
}

# Function to add result
function Add-Result {
    param(
        [string]$Type,
        [string]$Message,
        [string]$NodeId = "",
        [string]$Severity = "error"
    )
    
    $result = @{
        type = $Type
        message = $Message
        nodeId = $NodeId
        severity = $Severity
        timestamp = (Get-Date).ToString("o")
    }
    
    switch ($Severity) {
        "error" { $results.errors += $result }
        "warning" { $results.warnings += $result }
        "info" { $results.info += $result }
        "passed" { $results.passed += $result }
    }
}

switch ($Action) {
    "semantic" {
        Write-Host "=== Semantic Validation ===" -ForegroundColor Cyan
        Write-Host ""
        
        # Check if DOM tree exists
        if (-not $domData) {
            Add-Result -Type "structure" -Message "DOM tree not found. Run extract-tree.ps1 first." -Severity "error"
        } else {
            Add-Result -Type "structure" -Message "DOM tree found" -Severity "passed"
            
            # Check for essential elements
            $essentialTags = @("header", "main", "footer")
            $foundTags = @()
            
            function Find-Tags {
                param([object]$Node)
                
                if ($Node.htmlTag) {
                    $foundTags += $Node.htmlTag
                }
                
                if ($Node.children) {
                    foreach ($child in $Node.children) {
                        Find-Tags -Node $child
                    }
                }
            }
            
            foreach ($element in $domData.elements) {
                Find-Tags -Node $element
            }
            
            # Check for missing essential tags
            foreach ($tag in $essentialTags) {
                if ($foundTags -contains $tag) {
                    Add-Result -Type "semantic" -Message "Essential tag found: <$tag>" -Severity "passed"
                } else {
                    Add-Result -Type "semantic" -Message "Missing essential tag: <$tag>" -Severity "error"
                }
            }
            
            # Check for untagged elements
            $untaggedCount = 0
            function Count-Untagged {
                param([object]$Node)
                
                if (-not $Node.htmlTag) {
                    $script:untaggedCount++
                }
                
                if ($Node.children) {
                    foreach ($child in $Node.children) {
                        Count-Untagged -Node $child
                    }
                }
            }
            
            foreach ($element in $domData.elements) {
                Count-Untagged -Node $element
            }
            
            if ($untaggedCount -eq 0) {
                Add-Result -Type "semantic" -Message "All elements are tagged" -Severity "passed"
            } else {
                Add-Result -Type "semantic" -Message "$untaggedCount elements are untagged" -Severity "warning"
            }
            
            # Check for heading hierarchy
            $headings = @()
            function Find-Headings {
                param([object]$Node)
                
                if ($Node.htmlTag -match "^h[1-6]$") {
                    $headings += @{
                        level = [int]$Node.htmlTag.Substring(1)
                        nodeId = $Node.id
                    }
                }
                
                if ($Node.children) {
                    foreach ($child in $Node.children) {
                        Find-Headings -Node $child
                    }
                }
            }
            
            foreach ($element in $domData.elements) {
                Find-Headings -Node $element
            }
            
            if ($headings.Count -gt 0) {
                $sortedHeadings = $headings | Sort-Object { $_.level }
                $prevLevel = 0
                $hierarchyValid = $true
                
                foreach ($h in $sortedHeadings) {
                    if ($h.level - $prevLevel -gt 1) {
                        $hierarchyValid = $false
                    }
                    $prevLevel = $h.level
                }
                
                if ($hierarchyValid) {
                    Add-Result -Type "semantic" -Message "Heading hierarchy is valid" -Severity "passed"
                } else {
                    Add-Result -Type "semantic" -Message "Heading hierarchy has gaps" -Severity "warning"
                }
            }
        }
    }
    
    "technical" {
        Write-Host "=== Technical Validation ===" -ForegroundColor Cyan
        Write-Host ""
        
        # Check if DOM tree exists
        if (-not $domData) {
            Add-Result -Type "structure" -Message "DOM tree not found" -Severity "error"
        } else {
            Add-Result -Type "structure" -Message "DOM tree found" -Severity "passed"
            
            # Check for elements without dimensions
            $noDimensionCount = 0
            function Check-Dimensions {
                param([object]$Node)
                
                if (-not $Node.width -or -not $Node.height) {
                    $script:noDimensionCount++
                }
                
                if ($Node.children) {
                    foreach ($child in $Node.children) {
                        Check-Dimensions -Node $child
                    }
                }
            }
            
            foreach ($element in $domData.elements) {
                Check-Dimensions -Node $element
            }
            
            if ($noDimensionCount -eq 0) {
                Add-Result -Type "technical" -Message "All elements have dimensions" -Severity "passed"
            } else {
                Add-Result -Type "technical" -Message "$noDimensionCount elements missing dimensions" -Severity "warning"
            }
            
            # Check for overlapping elements (simplified)
            Add-Result -Type "technical" -Message "Overlap detection not implemented yet" -Severity "info"
        }
        
        # Check pages configuration
        if ($pagesData) {
            Add-Result -Type "technical" -Message "Pages configuration found" -Severity "passed"
            
            # Check breakpoints
            if ($pagesData.breakpoints) {
                Add-Result -Type "technical" -Message "Breakpoints configured: Desktop=$($pagesData.breakpoints.desktop), Tablet=$($pagesData.breakpoints.tablet), Mobile=$($pagesData.breakpoints.mobile)" -Severity "passed"
            } else {
                Add-Result -Type "technical" -Message "No breakpoints configured" -Severity "warning"
            }
        } else {
            Add-Result -Type "technical" -Message "Pages configuration not found" -Severity "warning"
        }
    }
    
    "full" {
        # Run both semantic and technical validation
        Write-Host "=== Full Validation ===" -ForegroundColor Cyan
        Write-Host ""
        
        # Semantic checks
        & $PSCommandPath -Action semantic
        
        Write-Host ""
        
        # Technical checks
        & $PSCommandPath -Action technical
    }
    
    "export-check" {
        Write-Host "=== Export Readiness Check ===" -ForegroundColor Cyan
        Write-Host ""
        
        # Run full validation first
        & $PSCommandPath -Action full
        
        # Check if export is allowed
        Write-Host ""
        Write-Host "=== Export Decision ===" -ForegroundColor Cyan
        
        if ($results.errors.Count -eq 0) {
            Write-Host "âœ… EXPORT ALLOWED" -ForegroundColor Green
            Write-Host "No critical errors found." -ForegroundColor White
        } else {
            Write-Host "â‌Œ EXPORT BLOCKED" -ForegroundColor Red
            Write-Host "$($results.errors.Count) critical error(s) found:" -ForegroundColor White
            foreach ($error in $results.errors) {
                Write-Host "  - $($error.message)" -ForegroundColor Red
            }
        }
    }
}

# Display results
Write-Host ""
Write-Host "=== Validation Results ===" -ForegroundColor Cyan

# Errors
if ($results.errors.Count -gt 0) {
    Write-Host ""
    Write-Host "â‌Œ ERRORS ($($results.errors.Count)):" -ForegroundColor Red
    foreach ($error in $results.errors) {
        Write-Host "  - $($error.message)" -ForegroundColor Red
        if ($error.nodeId) {
            Write-Host "    Node: $($error.nodeId)" -ForegroundColor Gray
        }
    }
}

# Warnings
if ($results.warnings.Count -gt 0) {
    Write-Host ""
    Write-Host "âڑ ï¸ڈ WARNINGS ($($results.warnings.Count)):" -ForegroundColor Yellow
    foreach ($warning in $results.warnings) {
        Write-Host "  - $($warning.message)" -ForegroundColor Yellow
        if ($warning.nodeId) {
            Write-Host "    Node: $($warning.nodeId)" -ForegroundColor Gray
        }
    }
}

# Info
if ($results.info.Count -gt 0) {
    Write-Host ""
    Write-Host "INFO ($($results.info.Count)):" -ForegroundColor Cyan
    foreach ($info in $results.info) {
        Write-Host "  - $($info.message)" -ForegroundColor Cyan
    }
}

# Passed
if ($results.passed.Count -gt 0) {
    Write-Host ""
    Write-Host "PASSED ($($results.passed.Count)):" -ForegroundColor Green
    foreach ($passed in $results.passed) {
        Write-Host "  - $($passed.message)" -ForegroundColor Green
    }
}

# Summary
Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "Errors: $($results.errors.Count)" -ForegroundColor Red
Write-Host "Warnings: $($results.warnings.Count)" -ForegroundColor Yellow
Write-Host "Info: $($results.info.Count)" -ForegroundColor Cyan
Write-Host "Passed: $($results.passed.Count)" -ForegroundColor Green

# Overall status
Write-Host ""
if ($results.errors.Count -eq 0) {
    Write-Host "VALIDATION PASSED" -ForegroundColor Green
} else {
    Write-Host "VALIDATION FAILED" -ForegroundColor Red
}
