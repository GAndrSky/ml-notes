$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Web

$root = Split-Path -Parent $PSScriptRoot

function HtmlText {
  param([string]$Text)
  return [System.Web.HttpUtility]::HtmlEncode($Text)
}

function Remove-DeepeningBlocks {
  param([string]$Html)
  return [regex]::Replace($Html, '(?is)\s*<!-- metrics-deepening:start:[^>]+ -->.*?<!-- metrics-deepening:end -->\s*', "`r`n")
}

function Get-DivEndFrom {
  param([string]$Html, [int]$Start)
  if ($Start -lt 0) { return -1 }
  $tagRegex = [regex]::new('(?is)<div\b[^>]*>|</div>')
  $matches = $tagRegex.Matches($Html, $Start)
  $depth = 0
  foreach ($tag in $matches) {
    if ($tag.Value -match '^<div\b') { $depth += 1 } else { $depth -= 1 }
    if ($depth -eq 0) { return $tag.Index + $tag.Length }
  }
  return -1
}

function Find-CardStartBefore {
  param([string]$Html, [int]$Index)
  $prefix = $Html.Substring(0, $Index)
  $start = -1
  foreach ($match in [regex]::Matches($prefix, '(?is)<div\b[^>]*class=["''][^"'']*\bcard\b[^"'']*["''][^>]*>')) {
    $start = $match.Index
  }
  return $start
}

function New-ListHtml {
  param([string[]]$Items)
  if (-not $Items -or $Items.Count -eq 0) { return "" }
  $rows = New-Object System.Collections.Generic.List[string]
  foreach ($item in $Items) {
    [void]$rows.Add("      <li>$(HtmlText $item)</li>")
  }
  return "    <ul>`r`n$($rows -join "`r`n")`r`n    </ul>"
}

function New-Block {
  param([hashtable]$Spec)
  $id = HtmlText $Spec.Id
  $title = HtmlText $Spec.Title
  $paragraphs = New-Object System.Collections.Generic.List[string]
  foreach ($paragraph in $Spec.Paragraphs) {
    [void]$paragraphs.Add("    <p>$(HtmlText $paragraph)</p>")
  }
  $list = New-ListHtml $Spec.Items
  return @"

<!-- metrics-deepening:start:$id -->
  <section class="concept-walkthrough" data-metrics-deepening="$id">
    <div class="concept-walkthrough__kicker">Теория глубже</div>
    <h3>$title</h3>
$($paragraphs -join "`r`n")
$list
  </section>
<!-- metrics-deepening:end -->
"@
}

function Add-AfterCardHeading {
  param([string]$Html, [string]$HeadingPattern, [string]$Block)
  $heading = [regex]::Match($Html, "(?is)<h[23][^>]*>[^<]*$HeadingPattern.*?</h[23]>")
  if (-not $heading.Success) {
    Write-Warning "Heading not found: $HeadingPattern"
    return $Html
  }
  $cardStart = Find-CardStartBefore $Html $heading.Index
  $insertAt = Get-DivEndFrom $Html $cardStart
  if ($insertAt -lt 0) {
    Write-Warning "Card end not found for heading: $HeadingPattern"
    return $Html
  }
  return $Html.Insert($insertAt, $Block)
}

$pages = @(
  @{
    File = "02_classic_ml/06_regression_metrics.html"
    Inserts = @(
      @{
        Id = "2-6-metric-as-utility"
        After = "Зачем вообще нужны метрики регрессии"
        Title = "Метрика — это функция полезности, а не украшение отчёта"
        Paragraphs = @(
          "Метрика задаёт, какие ошибки считаются дорогими. Если ошибка в 10 единиц в четыре раза хуже ошибки в 5, MSE подходит лучше MAE. Если ошибка в 10 единиц примерно в два раза хуже ошибки в 5, MAE ближе к реальной стоимости.",
          "Поэтому метрика должна выбираться до сравнения моделей. Иначе можно построить модель, которая математически улучшает одно число, но ухудшает реальное решение."
        )
        Items = @(
          "MSE/RMSE усиливают крупные промахи.",
          "MAE устойчивее к выбросам и ближе к медианной логике.",
          "MAPE читабелен для бизнеса, но ломается около нуля."
        )
      },
      @{
        Id = "2-6-noise-model"
        After = "MSE"
        Title = "Выбор метрики эквивалентен предположению о шуме"
        Paragraphs = @(
          "MSE естественно появляется, если считать, что ошибка вокруг прогноза примерно гауссовская. MAE соответствует более тяжёлым хвостам, где крупные отклонения встречаются чаще и не должны доминировать над обучением.",
          "Это полезная вероятностная интерпретация: метрика говорит не только о качестве, но и о том, какой тип ошибки мы считаем нормальным для данных."
        )
        Items = @(
          "Gaussian noise → squared error.",
          "Laplace-like noise → absolute error.",
          "Heavy tails → подумай о MAE, Huber, quantile loss или robust preprocessing."
        )
      },
      @{
        Id = "2-6-residuals"
        After = "Residual analysis"
        Title = "Residuals показывают, что именно модель не поняла"
        Paragraphs = @(
          "Средняя метрика сжимает всю ошибку в одно число, но residual plot показывает структуру этой ошибки. Если residuals имеют форму дуги, модель пропустила нелинейность. Если разброс растёт вместе с прогнозом, шум зависит от масштаба. Если есть группы ошибок, не хватает признака или сегментации.",
          "Поэтому residual analysis — это мост между метриками и feature engineering: он подсказывает, что изменить в данных или модели."
        )
        Items = @(
          "Случайное облако residuals — хороший знак.",
          "Паттерн в residuals — сигнал пропущенной структуры.",
          "Один большой выброс может менять RMSE сильнее, чем качество основной массы объектов."
        )
      }
    )
  },
  @{
    File = "02_classic_ml/07_classification_metrics.html"
    Inserts = @(
      @{
        Id = "2-7-cost-map"
        After = "Зачем вообще нужны метрики классификации"
        Title = "Метрика классификации — это карта цены ошибок"
        Paragraphs = @(
          "Классификация почти никогда не сводится к вопросу «угадали или нет». Ошибки FP и FN обычно стоят по-разному: ложная тревога раздражает пользователя, а пропущенный fraud или диагноз может быть намного дороже.",
          "Confusion matrix нужна именно поэтому: она раскладывает общую ошибку на типы решений, которые можно связать с реальной стоимостью."
        )
        Items = @(
          "Accuracy хороша, когда классы сбалансированы и ошибки примерно равны по цене.",
          "Precision важен, когда ложное срабатывание дорого.",
          "Recall важен, когда пропуск события дорог."
        )
      },
      @{
        Id = "2-7-base-rate"
        After = "Precision / Recall"
        Title = "Precision зависит от base rate сильнее, чем кажется"
        Paragraphs = @(
          "При редком positive class даже хороший классификатор может иметь скромный precision: если реальных положительных случаев мало, среди найденных сигналов легко набираются false positives. Recall отвечает на другой вопрос: какую долю настоящих positive мы поймали.",
          "Это объясняет, почему ROC-AUC может выглядеть прилично при imbalance, а PR-AUC остаётся низким. PR-кривая ближе к вопросу: сколько полезных находок среди всех поднятых тревог."
        )
        Items = @(
          "Base rate — доля positive class в данных.",
          "Precision сравнивай с baseline precision, равным base rate.",
          "При редких событиях PR-AUC обычно информативнее ROC-AUC."
        )
      },
      @{
        Id = "2-7-ranking-calibration-threshold"
        After = "Threshold tuning"
        Title = "Разделяй ranking, calibration и threshold"
        Paragraphs = @(
          "Модель может хорошо ранжировать объекты, но плохо калибровать вероятности. ROC-AUC и PR-AUC проверяют качество ranking: насколько positive обычно выше negative. Log loss и calibration curve проверяют, можно ли доверять числу 0.8 как вероятности.",
          "Threshold — это третий слой. Он превращает score или вероятность в действие и должен подбираться под метрику, цену ошибок и ограничения продукта."
        )
        Items = @(
          "Ranking: кто выше в списке риска.",
          "Calibration: насколько score похож на настоящую вероятность.",
          "Threshold: где провести границу действия."
        )
      }
    )
  }
)

$updated = 0

foreach ($page in $pages) {
  $path = Join-Path $root ($page.File -replace '/', '\')
  $html = Get-Content -LiteralPath $path -Raw -Encoding UTF8
  $html = Remove-DeepeningBlocks $html

  foreach ($insert in $page.Inserts) {
    $block = New-Block $insert
    $html = Add-AfterCardHeading $html $insert.After $block
  }

  Set-Content -LiteralPath $path -Value $html -Encoding UTF8
  Write-Host "$($page.File): metrics deepening blocks inserted"
  $updated += 1
}

Write-Host "Classic ML 2.6-2.7 deepening updated: $updated files"


