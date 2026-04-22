Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

$sourceFiles = @(
  "shared-nav.js",
  "shared-search.js",
  "shared-index.js"
)

$bundleParts = foreach ($relativePath in $sourceFiles) {
  $fullPath = Join-Path $repoRoot $relativePath
  if (-not (Test-Path -LiteralPath $fullPath)) {
    throw "Missing source file for bundle: $relativePath"
  }

  "// BEGIN $relativePath`r`n" + (Get-Content -Raw -LiteralPath $fullPath -Encoding UTF8) + "`r`n// END $relativePath`r`n"
}

$bundlePath = Join-Path $repoRoot "bundle.js"
Set-Content -LiteralPath $bundlePath -Value ($bundleParts -join "`r`n").TrimEnd() -Encoding UTF8 -NoNewline

Write-Host "Bundle rebuilt:" -ForegroundColor Green
Write-Host " - bundle.js"
