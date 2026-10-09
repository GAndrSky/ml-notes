Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Rebuilds shared-search-index.js from the lesson pages listed in course-manifest.js.
# Hand-written keywords in shared-search-extra-index.js are appended to the matching
# lesson's content, so search still finds those terms.

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

$maxContentLength = 6500
$maxSummaryLength = 220

function Get-PlainText {
  param([string]$Html)
  $text = [regex]::Replace($Html, '(?is)<(script|style|svg|canvas|noscript)\b.*?</\1>', ' ')
  $text = [regex]::Replace($text, '(?s)<!--.*?-->', ' ')
  $text = [regex]::Replace($text, '<[^>]+>', ' ')
  $text = [System.Net.WebUtility]::HtmlDecode($text)
  return ([regex]::Replace($text, '\s+', ' ')).Trim()
}

function Limit-Text {
  param([string]$Text, [int]$Length)
  if ($Text.Length -le $Length) {
    return $Text
  }
  return $Text.Substring(0, $Length).TrimEnd() + [char]0x2026
}

# Course structure from course-manifest.js: one page object per line.
$manifest = Get-Content -Raw -LiteralPath (Join-Path $repoRoot "course-manifest.js") -Encoding UTF8
$pages = New-Object System.Collections.Generic.List[object]
$sectionLabel = ""
$sectionTitle = ""
foreach ($line in ($manifest -split "`r?`n")) {
  if ($line -match '^\s{6}label:\s*"([^"]*)"') { $sectionLabel = $Matches[1]; continue }
  if ($line -match '^\s{6}title:\s*"([^"]*)"') { $sectionTitle = $Matches[1]; continue }
  if ($line -match 'path:\s*"([^"]+)"') {
    $pages.Add([pscustomobject]@{ Path = $Matches[1]; Section = "$sectionLabel. $sectionTitle" })
  }
}
if ($pages.Count -eq 0) {
  throw "No pages found in course-manifest.js"
}

# Hand-written keywords per path.
$extraKeywords = @{}
$extraPath = Join-Path $repoRoot "shared-search-extra-index.js"
if (Test-Path -LiteralPath $extraPath) {
  $extraText = Get-Content -Raw -LiteralPath $extraPath -Encoding UTF8
  $json = $extraText.Substring($extraText.IndexOf("[")).TrimEnd().TrimEnd(";")
  foreach ($record in (ConvertFrom-Json $json)) {
    $extraKeywords[$record.path] = (@($record.headings, $record.content) -join " ").Trim()
  }
}

$records = foreach ($page in $pages) {
  $fullPath = Join-Path $repoRoot $page.Path
  if (-not (Test-Path -LiteralPath $fullPath)) {
    throw "Manifest page is missing: $($page.Path)"
  }

  $html = Get-Content -Raw -LiteralPath $fullPath -Encoding UTF8
  $body = $html
  $bodyMatch = [regex]::Match($html, '(?is)<body\b[^>]*>(.*)</body>')
  if ($bodyMatch.Success) {
    $body = $bodyMatch.Groups[1].Value
  }

  $title = ""
  $h1 = [regex]::Match($body, '(?is)<h1\b[^>]*>(.*?)</h1>')
  if ($h1.Success) {
    $title = Get-PlainText $h1.Groups[1].Value
  }
  if (-not $title) {
    $titleTag = [regex]::Match($html, '(?is)<title>(.*?)</title>')
    $title = Get-PlainText $titleTag.Groups[1].Value
  }

  $headings = @([regex]::Matches($body, '(?is)<h[1-3]\b[^>]*>(.*?)</h[1-3]>') |
    ForEach-Object { Get-PlainText $_.Groups[1].Value } |
    Where-Object { $_ } |
    Select-Object -Unique)

  # Summary: first paragraph with real text.
  $summary = ""
  foreach ($paragraph in [regex]::Matches($body, '(?is)<p\b[^>]*>(.*?)</p>')) {
    $candidate = Get-PlainText $paragraph.Groups[1].Value
    if ($candidate.Length -ge 40) {
      $summary = Limit-Text $candidate $maxSummaryLength
      break
    }
  }

  $content = Get-PlainText $body
  if ($extraKeywords.ContainsKey($page.Path)) {
    $content = $extraKeywords[$page.Path] + " " + $content
  }

  [ordered]@{
    path = $page.Path
    title = $title
    section = $page.Section
    summary = $summary
    headings = ($headings -join " | ")
    content = Limit-Text $content $maxContentLength
  }
}

$json = ConvertTo-Json -InputObject @($records) -Depth 3 -Compress
$outPath = Join-Path $repoRoot "shared-search-index.js"
Set-Content -LiteralPath $outPath -Value ("window.__mlNotesSearchIndex = " + $json + ";") -Encoding UTF8 -NoNewline

Write-Host "Search index rebuilt:" -ForegroundColor Green
Write-Host " - shared-search-index.js ($($records.Count) lessons)"
