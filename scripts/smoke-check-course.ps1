param(
  # Rewrite scripts/unstyled-classes-allowlist.txt from the current state instead of checking it.
  [switch]$UpdateUnstyledAllowlist
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

$excludedPages = @("index.html", "course-roadmap.html")
$lessonPages = Get-ChildItem -Path $repoRoot -Recurse -Filter *.html |
  ForEach-Object { $_.FullName.Substring($repoRoot.Length + 1).Replace('\', '/') } |
  Where-Object { $_ -notin $excludedPages -and $_ -notmatch '^(\.|vendor/)' } |
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

    if ($content -notmatch 'bundle\.js') {
      Add-Issue "Missing bundle.js in $relativePath"
    }

    if ($content -notmatch 'shared-nav\.css') {
      Add-Issue "Missing shared-nav.css in $relativePath"
    }

    if ($content -notmatch 'shared-theme\.css') {
      Add-Issue "Missing shared-theme.css in $relativePath"
    }
  }

  $indexPath = Join-Path $repoRoot "index.html"
  if (Test-Path -LiteralPath $indexPath) {
    $indexContent = Get-Content -Raw -LiteralPath $indexPath
    if ($indexContent -notmatch 'bundle\.js') {
      Add-Issue "Missing bundle.js in index.html"
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

function Get-NormalizedText {
  param([string]$Text)
  return $Text.TrimStart([char]0xFEFF).Replace("`r`n", "`n").Trim()
}

function Test-BundleFresh {
  $bundlePath = Join-Path $repoRoot "bundle.js"
  if (-not (Test-Path -LiteralPath $bundlePath)) {
    return
  }

  $bundle = Get-NormalizedText (Get-Content -Raw -LiteralPath $bundlePath -Encoding UTF8)
  $parts = [regex]::Matches($bundle, '(?s)// BEGIN (\S+)\n(.*?)\n// END \1')
  if ($parts.Count -eq 0) {
    Add-Issue "bundle.js has no BEGIN/END sections"
  }

  foreach ($part in $parts) {
    $source = $part.Groups[1].Value
    $sourcePath = Join-Path $repoRoot $source
    if (-not (Test-Path -LiteralPath $sourcePath)) {
      Add-Issue "bundle.js contains missing source: $source"
      continue
    }

    $sourceText = Get-NormalizedText (Get-Content -Raw -LiteralPath $sourcePath -Encoding UTF8)
    if ($sourceText -ne $part.Groups[2].Value.Trim()) {
      Add-Issue "bundle.js is stale for $source (run scripts/build-bundle.ps1)"
    }
  }
}

function Test-CourseManifest {
  $manifestPath = Join-Path $repoRoot "course-manifest.js"
  if (-not (Test-Path -LiteralPath $manifestPath)) {
    Add-Issue "Missing course-manifest.js"
    return
  }

  $content = Get-Content -Raw -LiteralPath $manifestPath -Encoding UTF8
  $paths = @([regex]::Matches($content, 'path:\s*"([^"]+)"') | ForEach-Object { $_.Groups[1].Value })

  foreach ($path in $paths) {
    if (-not (Test-Path -LiteralPath (Join-Path $repoRoot $path))) {
      Add-Issue "course-manifest.js points to missing page: $path"
    }
  }

  foreach ($relativePath in $lessonPages) {
    if ($relativePath -notin $paths) {
      Add-Issue "Missing from course-manifest.js: $relativePath"
    }
  }

  $duplicates = $paths | Group-Object | Where-Object { $_.Count -gt 1 }
  foreach ($duplicate in $duplicates) {
    Add-Issue "Duplicate page in course-manifest.js: $($duplicate.Name)"
  }
}

function Get-SelectorClasses {
  param([string]$Css)
  $css = [regex]::Replace($Css, '(?s)/\*.*?\*/', ' ')
  # Drop declaration bodies (innermost braces); what remains is selectors and at-rule preludes.
  $css = [regex]::Replace($css, '\{[^{}]*\}', ' ')
  $result = New-Object 'System.Collections.Generic.HashSet[string]'
  foreach ($match in [regex]::Matches($css, '\.([A-Za-z_][\w-]*)')) {
    [void]$result.Add($match.Groups[1].Value)
  }
  return ,$result
}

# Fails when a lesson uses a class that no stylesheet (shared or the page's own <style>)
# styles and that is not in the allow-list of known JS-only hook classes.
function Test-UnstyledClasses {
  $sharedStyled = New-Object 'System.Collections.Generic.HashSet[string]'
  $cssFiles = @("shared-theme.css", "shared-nav.css", "shared-search.css",
    "vendor/katex/katex.min.css", "vendor/highlightjs/github-dark.min.css")
  foreach ($file in $cssFiles) {
    $css = Get-Content -Raw -LiteralPath (Join-Path $repoRoot $file) -Encoding UTF8
    # The ".page > .x" list only sets width; it does not style those components.
    $css = [regex]::Replace($css, 'body\.ml-course-theme \.page > \.[\w-]+\s*,?', ' ')
    $sharedStyled.UnionWith((Get-SelectorClasses $css))
  }

  $allowlistPath = Join-Path $PSScriptRoot "unstyled-classes-allowlist.txt"
  $allowed = New-Object 'System.Collections.Generic.HashSet[string]'
  if (Test-Path -LiteralPath $allowlistPath) {
    Get-Content -LiteralPath $allowlistPath -Encoding UTF8 |
      Where-Object { $_ -and -not $_.StartsWith("#") } |
      ForEach-Object { [void]$allowed.Add($_.Trim()) }
  }

  $unstyled = New-Object 'System.Collections.Generic.SortedSet[string]'
  foreach ($relativePath in $lessonPages) {
    $html = Get-Content -Raw -LiteralPath (Join-Path $repoRoot $relativePath) -Encoding UTF8
    $pageCss = ([regex]::Matches($html, '(?is)<style\b[^>]*>(.*?)</style>') | ForEach-Object { $_.Groups[1].Value }) -join "`n"
    $pageStyled = Get-SelectorClasses $pageCss
    $markup = [regex]::Replace($html, '(?is)<script\b.*?</script>', ' ')

    foreach ($attribute in [regex]::Matches($markup, '(?<![\w-])class="([^"]+)"')) {
      foreach ($class in ($attribute.Groups[1].Value -split '\s+')) {
        if (-not $class -or $sharedStyled.Contains($class) -or $pageStyled.Contains($class)) {
          continue
        }
        [void]$unstyled.Add($class)
        if (-not $UpdateUnstyledAllowlist -and -not $allowed.Contains($class)) {
          Add-Issue "Unstyled class .$class in $relativePath (style it, or add it to scripts/unstyled-classes-allowlist.txt if it is a JS hook)"
        }
      }
    }
  }

  if ($UpdateUnstyledAllowlist) {
    $header = @(
      "# Classes used in lessons that no stylesheet styles, accepted as-is (mostly JS hooks).",
      "# Regenerate: powershell -File scripts/smoke-check-course.ps1 -UpdateUnstyledAllowlist"
    )
    Set-Content -LiteralPath $allowlistPath -Value ($header + @($unstyled)) -Encoding UTF8
    Write-Host "Allow-list written: $($unstyled.Count) classes" -ForegroundColor Yellow
  }
}

# A raw "<" in text (e.g. "\hat{p}<t" or "0<p<1") is parsed as a tag and silently eats content.
function Test-RawLessThan {
  $knownTags = @("a","abbr","article","aside","b","blockquote","body","br","button","canvas","caption","code","col",
    "colgroup","dd","details","div","dl","dt","em","figcaption","figure","footer","h1","h2","h3","h4","h5","h6","head",
    "header","hr","html","i","img","input","kbd","label","legend","li","link","main","mark","meta","nav","noscript","ol",
    "optgroup","option","p","pre","q","s","section","select","small","span","strong","sub","summary","sup","table",
    "tbody","td","textarea","tfoot","th","thead","title","tr","u","ul","var","svg","g","path","rect","circle","line",
    "polyline","polygon","text","tspan","defs","marker","ellipse","lineargradient","radialgradient","stop","use",
    "clippath","mask","pattern","foreignobject","math","mi","mo","mn","mrow","msup","msub","mfrac","wbr","video","source")
  foreach ($relativePath in $lessonPages) {
    $html = Get-Content -Raw -LiteralPath (Join-Path $repoRoot $relativePath) -Encoding UTF8
    $html = [regex]::Replace($html, '(?is)<script\b.*?</script>|<style\b.*?</style>|<!--.*?-->', ' ')
    $html = [regex]::Replace($html, '="[^"]*"', '=""')
    foreach ($match in [regex]::Matches($html, '</?([A-Za-z][A-Za-z0-9-]*)([^A-Za-z0-9-])')) {
      $name = $match.Groups[1].Value.ToLowerInvariant()
      $next = $match.Groups[2].Value
      if (($name -notin $knownTags) -or ($next -notmatch '[\s>/]')) {
        $start = [Math]::Max(0, $match.Index - 25)
        $snippet = $html.Substring($start, [Math]::Min(50, $html.Length - $start)) -replace '\s+', ' '
        Add-Issue "Raw '<' parsed as a tag in ${relativePath}: ...$snippet... (escape it as &lt;)"
      }
    }
  }
}

Test-SearchIndexFiles
Test-RawLessThan
Test-UnstyledClasses
Test-BundleFresh
Test-CourseManifest
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
