Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

$indexPath = Join-Path $repoRoot "index.html"
$content = Get-Content -Raw -LiteralPath $indexPath -Encoding UTF8

$headReplacement = @'
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Интерактивный ML-конспект</title>
  <meta name="description" content="Интерактивный ML-конспект: 62 темы, формулы, визуализации и код — от математики и классического ML до LLM, diffusion и практики обучения." />
  <meta property="og:title" content="Интерактивный ML-конспект" />
  <meta property="og:description" content="Интерактивный курс по ML: математика, классическое ML, нейросети, архитектуры, LLM и generative models." />
  <meta property="og:url" content="https://gandrsky.github.io/ml-notes/index.html" />
  <link rel="icon" type="image/png" href="favicon.png" />
  <link rel="stylesheet" href="shared-theme.css" />
'@

$styleReplacement = @'
  <style>
    .wrap {
      max-width: 1220px;
    }

    .hero {
      display: grid;
      gap: 0;
    }

    .hero-subtitle {
      margin: 0;
      max-width: 72ch;
      color: var(--muted);
      font-size: 1rem;
      line-height: 1.7;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 18px;
    }

    .card {
      min-width: 0;
    }

    @media (max-width: 640px) {
      .grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
'@

$heroReplacement = @'
    <section class="hero">
      <div class="hero-kicker">Machine Learning Notes</div>
      <h1>Интерактивный ML-конспект</h1>
      <p class="hero-subtitle">62 темы · от линейной алгебры до LLM и diffusion · интерактивные визуализации и код</p>
      <div class="hero-metrics">
        <span>8 блоков</span>
        <span>62 темы</span>
        <span>формулы, код и визуализации</span>
      </div>
      <div class="hero-progress">
        <div class="hero-progress__meta">
          <span class="hero-progress__count">Изучено: 0 из 62</span>
          <span class="hero-progress__label">0% курса</span>
        </div>
        <div class="hero-progress__bar"><span></span></div>
      </div>
    </section>
'@

$content = [regex]::Replace(
  $content,
  '(?s)<meta charset="UTF-8"\s*/>\s*<meta name="viewport"[^>]*>\s*<title>.*?</title>\s*<link rel="stylesheet" href="shared-theme\.css"\s*/>',
  $headReplacement,
  1
)

$content = [regex]::Replace($content, '(?s)<style>.*?</style>', $styleReplacement, 1)
$content = [regex]::Replace($content, '(?s)<section class="hero">.*?</section>', $heroReplacement, 1)
$content = $content -replace '<script src="shared-search\.js"></script>', '<script src="bundle.js" defer></script>'
$content = $content -replace '<script src="bundle\.js"></script>', '<script src="bundle.js" defer></script>'

Set-Content -LiteralPath $indexPath -Value $content -Encoding UTF8

Write-Host "Index updated." -ForegroundColor Green
