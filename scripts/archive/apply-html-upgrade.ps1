Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

Add-Type -AssemblyName System.Web

$siteBase = "https://gandrsky.github.io/ml-notes/"
$excluded = @("index.html", "course-roadmap.html")

function Escape-AttributeValue {
  param([string]$Value)
  return [System.Web.HttpUtility]::HtmlAttributeEncode($Value)
}

function Upsert-LessonHead {
  param([string]$RelativePath)

  $fullPath = Join-Path $repoRoot $RelativePath
  $content = Get-Content -Raw -LiteralPath $fullPath -Encoding UTF8

  $titleMatch = [regex]::Match($content, '<title>(.*?)</title>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
  $title = if ($titleMatch.Success) {
    [System.Web.HttpUtility]::HtmlDecode(($titleMatch.Groups[1].Value -replace '\s+', ' ').Trim())
  } else {
    [IO.Path]::GetFileNameWithoutExtension($RelativePath)
  }

  $description = "$title - interactive ML notes with formulas, visualizations, and code."
  $ogTitle = "$title - ML notes"
  $ogDescription = $description
  $ogUrl = $siteBase + ($RelativePath -replace '\\', '/')

  $content = [regex]::Replace($content, '(?ms)\s*<meta name="description"[^>]*>\s*', "")
  $content = [regex]::Replace($content, '(?ms)\s*<meta property="og:title"[^>]*>\s*', "")
  $content = [regex]::Replace($content, '(?ms)\s*<meta property="og:description"[^>]*>\s*', "")
  $content = [regex]::Replace($content, '(?ms)\s*<meta property="og:url"[^>]*>\s*', "")
  $content = [regex]::Replace($content, '(?ms)\s*<link rel="icon"[^>]*>\s*', "")

  if ($content -notmatch 'shared-theme\.css') {
    $content = $content -replace '</head>', "  <link rel=`"stylesheet`" href=`"../shared-theme.css`" />`r`n</head>"
  }

  $metaBlock = @"
  <meta name="description" content="$(Escape-AttributeValue $description)" />
  <meta property="og:title" content="$(Escape-AttributeValue $ogTitle)" />
  <meta property="og:description" content="$(Escape-AttributeValue $ogDescription)" />
  <meta property="og:url" content="$(Escape-AttributeValue $ogUrl)" />
  <link rel="icon" type="image/png" href="../favicon.png" />
"@

  $content = $content -replace '</head>', ($metaBlock + "`r`n</head>")
  $content = $content -replace '<script\s+src="\.\./shared-nav\.js"></script>', '<script src="../bundle.js" defer></script>'
  $content = $content -replace '<script\s+src="\.\./bundle\.js"></script>', '<script src="../bundle.js" defer></script>'

  Set-Content -LiteralPath $fullPath -Value $content -Encoding UTF8
}

$lessonPages = Get-ChildItem -Path $repoRoot -Recurse -Filter *.html |
  ForEach-Object { $_.FullName.Substring($repoRoot.Length + 1).Replace('\', '/') } |
  Where-Object { $_ -notin $excluded } |
  Sort-Object

foreach ($relativePath in $lessonPages) {
  Upsert-LessonHead -RelativePath $relativePath
}

Write-Host "HTML lesson pages upgraded:" -ForegroundColor Green
Write-Host " - $($lessonPages.Count) files"
