Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

$sourceFiles = @(
  "course-manifest.js",
  "shared-nav.js",
  "shared-prevnext.js",
  "shared-walkthrough.js",
  "shared-lesson-ui.js",
  "shared-a11y.js",
  "shared-search.js",
  "shared-index.js"
)

$bundleParts = foreach ($relativePath in $sourceFiles) {
  $fullPath = Join-Path $repoRoot $relativePath
  if (-not (Test-Path -LiteralPath $fullPath)) {
    throw "Missing source file for bundle: $relativePath"
  }

  "// BEGIN $relativePath`n" + (Get-Content -Raw -LiteralPath $fullPath -Encoding UTF8) + "`n// END $relativePath`n"
}

$bundlePath = Join-Path $repoRoot "bundle.js"
Set-Content -LiteralPath $bundlePath -Value ($bundleParts -join "`n").TrimEnd() -Encoding UTF8 -NoNewline

Write-Host "Bundle rebuilt:" -ForegroundColor Green
Write-Host " - bundle.js"
