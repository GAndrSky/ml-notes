Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

$excludedPages = @("index.html", "course-roadmap.html")
$lessonPages = Get-ChildItem -Path $repoRoot -Recurse -Filter *.html |
  ForEach-Object { $_.FullName.Substring($repoRoot.Length + 1).Replace('\', '/') } |
  Where-Object { $_ -notin $excludedPages } |
  Sort-Object

$issues = New-Object System.Collections.Generic.List[string]

function Add-Issue {
  param([string]$Message)
  $issues.Add($Message)
}

function Get-IndexedPaths {
  $result = New-Object System.Collections.Generic.List[string]

  foreach ($file in @("shared-search-index.js", "shared-search-extra-index.js")) {
    $fullPath = Join-Path $repoRoot $file
    if (-not (Test-Path -LiteralPath $fullPath)) {
      Add-Issue "Missing search index file: $file"
      continue
    }

    $content = Get-Content -Raw -LiteralPath $fullPath
    $matches = [regex]::Matches($content, '"path"\s*:\s*"([^"]+)"|path\s*:\s*"([^"]+)"')

    foreach ($match in $matches) {
      if ($match.Groups[1].Success) {
        $result.Add($match.Groups[1].Value)
      } elseif ($match.Groups[2].Success) {
        $result.Add($match.Groups[2].Value)
      }
    }
  }

  return $result | Sort-Object -Unique
}

function Test-SearchIndexFiles {
  $primaryPath = Join-Path $repoRoot "shared-search-index.js"
  $extraPath = Join-Path $repoRoot "shared-search-extra-index.js"

  if (Test-Path -LiteralPath $primaryPath) {
    $primaryContent = Get-Content -Raw -LiteralPath $primaryPath
    if ($primaryContent -notmatch 'window\.__mlNotesSearchIndex\s*=') {
      Add-Issue "Malformed shared-search-index.js header"
    }
  }

  if (Test-Path -LiteralPath $extraPath) {
    $extraContent = Get-Content -Raw -LiteralPath $extraPath
    if ($extraContent -notmatch 'window\.__mlNotesSearchExtraIndex\s*=\s*\[\s*\{') {
      Add-Issue "Malformed shared-search-extra-index.js header"
    }
  }
}

function Test-SharedAssets {
  foreach ($relativePath in $lessonPages) {
    $fullPath = Join-Path $repoRoot $relativePath
    $content = Get-Content -Raw -LiteralPath $fullPath

    if ($content -notmatch 'shared-nav\.js') {
      Add-Issue "Missing shared-nav.js in $relativePath"
    }

    if ($content -notmatch 'shared-nav\.css') {
      Add-Issue "Missing shared-nav.css in $relativePath"
    }
  }
}

function Test-LocalLinks {
  $pagesToCheck = $lessonPages + $excludedPages

  foreach ($relativePath in $pagesToCheck) {
    $fullPath = Join-Path $repoRoot $relativePath
    $dir = Split-Path -Parent $fullPath
    $content = Get-Content -Raw -LiteralPath $fullPath
    $matches = [regex]::Matches($content, '(?:href|src)="([^"]+)"')

    foreach ($match in $matches) {
      $target = $match.Groups[1].Value
      if ($target -match '^(https?:|mailto:|javascript:|data:|#)') {
        continue
      }

      $clean = ($target -split '#')[0]
      $clean = ($clean -split '\?')[0]
      if ([string]::IsNullOrWhiteSpace($clean)) {
        continue
      }

      $resolved = Join-Path $dir $clean
      if (-not (Test-Path -LiteralPath $resolved)) {
        Add-Issue "Broken local reference in $relativePath -> $target"
      }
    }
  }
}

function Test-SearchCoverage {
  $indexed = Get-IndexedPaths

  foreach ($relativePath in $lessonPages) {
    if ($relativePath -notin $indexed) {
      Add-Issue "Missing from search index: $relativePath"
    }
  }

  if ("course-roadmap.html" -in $indexed) {
    Add-Issue "Roadmap page is still included in search index"
  }
}

Test-SearchIndexFiles
Test-SharedAssets
Test-LocalLinks
Test-SearchCoverage

if ($issues.Count -gt 0) {
  Write-Host "Smoke check failed:" -ForegroundColor Red
  foreach ($issue in $issues) {
    Write-Host " - $issue" -ForegroundColor Red
  }
  exit 1
}

Write-Host "Smoke check passed." -ForegroundColor Green
Write-Host "Lessons checked: $($lessonPages.Count)"
