$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Web

$root = Split-Path -Parent $PSScriptRoot
$indexPath = Join-Path $root "index.html"
$indexHtml = Get-Content -LiteralPath $indexPath -Raw -Encoding UTF8

function HtmlText {
  param([string]$Text)
  return [System.Web.HttpUtility]::HtmlEncode($Text)
}

function Strip-Html {
  param([string]$Html)
  $text = [regex]::Replace($Html, "<[^>]+>", " ")
  $text = [System.Web.HttpUtility]::HtmlDecode($text)
  return ([regex]::Replace($text, "\s+", " ").Trim())
}

function Link-Href {
  param([string]$Path)
  if ([string]::IsNullOrWhiteSpace($Path)) { return "" }
  return "../" + ($Path -replace "\\", "/")
}

function Remove-Step1Blocks {
  param([string]$Html)
  $html = [regex]::Replace($Html, '(?is)\s*<!-- step1-viz:start -->.*?<!-- step1-viz:end -->\s*', "`r`n")
  $html = [regex]::Replace($html, '(?is)\s*<!-- step1-learning:start -->.*?<!-- step1-learning:end -->\s*', "`r`n")
  return $html
}

function Get-SectionKind {
  param([string]$Path)
  if ($Path -like "01_math/*") { return "math" }
  if ($Path -like "02_classic_ml/*") { return "classic" }
  if ($Path -like "03_neural_basics/*") { return "neural" }
  if ($Path -like "04_training/*") { return "training" }
  if ($Path -like "05_architectures/*") { return "architecture" }
  if ($Path -like "06_llm/*") { return "llm" }
  if ($Path -like "07_generative_models/*") { return "generative" }
  if ($Path -like "08_training_practice/*") { return "practice" }
  return "general"
}

function Get-TopicProfile {
  param([string]$Kind, [string]$Title)

  $profiles = @{
    math = @{
      When = @(
        "Когда нужно понять вывод формулы, размерности тензоров или поведение градиента, возвращайся к теме «$Title».",
        "Используй эту базу при чтении статей: большинство сложных моделей опираются на те же операции, только в большем масштабе.",
        "Если интерактив показывает форму функции или матрицы, меняй один параметр за раз и связывай изменение картинки с конкретным символом в формуле."
      )
      Mistakes = @(
        "Учить запись без проверки размерностей: почти все ошибки в ML-математике проявляются как несовместимые shapes.",
        "Путать геометрический смысл с алгебраической записью: одна и та же формула может описывать поворот, проекцию, масштабирование или чувствительность.",
        "Пропускать числовой пример: маленький расчёт на 2-3 числах часто быстрее объясняет формулу, чем длинное определение."
      )
      Tune = @(
        "Проверяй оси, порядок умножения, нормировку и диапазоны значений.",
        "Для градиентных тем смотри знак, масштаб шага и то, какая переменная считается входом, а какая параметром.",
        "Для вероятностных тем проверяй, что вероятности нормированы и что условие после вертикальной черты действительно фиксировано."
      )
      Viz = @(
        "Смотри не только на итоговое число, а на направление изменения: куда двигается вектор, поверхность или распределение.",
        "Меняй один ползунок за раз, иначе трудно понять, какой параметр вызвал эффект.",
        "Если график кажется неожиданным, подставь маленький числовой пример и сравни его с тем, что показывает визуализация."
      )
    }
    classic = @{
      When = @(
        "Используй тему «$Title» как практический инструмент для табличных данных, baseline-моделей и быстрых проверок гипотез.",
        "Классические модели особенно полезны, когда важны скорость, интерпретируемость, небольшой датасет или строгая валидация.",
        "Перед нейросетью проверь, какой результат даёт простой baseline: он задаёт нижнюю планку качества."
      )
      Mistakes = @(
        "Подбирать модель до постановки метрики: без правильной метрики можно оптимизировать не ту задачу.",
        "Допускать leakage: scaling, encoding, feature selection и tuning должны обучаться только на train внутри pipeline.",
        "Сравнивать модели без одинакового split и одинакового preprocessing."
      )
      Tune = @(
        "Начни с данных: пропуски, выбросы, encoding, scaling и баланс классов часто важнее выбора алгоритма.",
        "Потом меняй сложность модели: регуляризацию, глубину, число соседей, число деревьев или learning rate в зависимости от темы.",
        "Фиксируй validation protocol до тюнинга, иначе улучшение может быть подгонкой под конкретный split."
      )
      Viz = @(
        "Смотри, как меняется граница решения, ошибка или метрика при изменении одного гиперпараметра.",
        "Если train становится лучше, а validation хуже, это сигнал переобучения, а не прогресса.",
        "Проверяй, какой объект или класс страдает: средняя метрика может скрывать систематическую ошибку."
      )
    }
    neural = @{
      When = @(
        "Возвращайся к теме «$Title», когда нужно понять, как слой преобразует сигнал и почему градиент проходит или затухает.",
        "Эти темы нужны перед обучением больших моделей: без них трудно отлаживать loss, активации и размерности.",
        "Используй формулы как карту forward/backward pass, а не как отдельные факты."
      )
      Mistakes = @(
        "Путать logits, probabilities и labels: от этого ломается выбор loss-функции и интерпретация выхода.",
        "Игнорировать scale: слишком большие logits, активации или loss быстро приводят к нестабильному обучению.",
        "Считать shape второстепенной деталью: большинство багов в нейросетях начинается с неправильной оси."
      )
      Tune = @(
        "Проверяй activation/loss pair, initialization, learning rate и нормализацию.",
        "Следи за распределением активаций и градиентов по слоям: нули, NaN и взрыв масштаба показывают проблему раньше метрики.",
        "Для классификации отдельно настраивай threshold или calibration, если важны вероятности."
      )
      Viz = @(
        "Смотри, где сигнал обнуляется, насыщается или становится слишком большим.",
        "Ползунки обычно показывают чувствительность: маленькое изменение входа может резко менять gradient flow.",
        "Сравни поведение функции около нуля, на больших положительных и больших отрицательных значениях."
      )
    }
    training = @{
      When = @(
        "Используй тему «$Title», когда модель уже построена, но обучение нестабильно, медленно или не улучшается.",
        "Обучение — это управление динамикой: важны не только формулы optimizer-а, но и масштаб градиента, scheduler и численная точность.",
        "Смотри на train/validation curves вместе: одна линия редко объясняет проблему полностью."
      )
      Mistakes = @(
        "Менять сразу много ручек: learning rate, batch size, optimizer и regularization нужно проверять постепенно.",
        "Игнорировать первые сотни шагов: именно там видны плохая инициализация, слишком большой lr и exploding gradients.",
        "Лечить NaN уменьшением модели, не проверив scale loss, precision, clipping и входные данные."
      )
      Tune = @(
        "Главные ручки: learning rate, scheduler, optimizer, weight decay, clipping и batch size.",
        "Для mixed precision проверяй loss scaling, BF16/FP16 режим и операции, чувствительные к overflow.",
        "Для регуляризации сравни train-validation gap, а не только финальную accuracy."
      )
      Viz = @(
        "Смотри на траекторию: плавное снижение loss отличается от скачков, плато и взрывов.",
        "Если ползунок управляет learning rate или momentum, оцени не только следующий шаг, но и устойчивость нескольких шагов подряд.",
        "Хорошая визуализация обучения показывает компромисс между скоростью и стабильностью."
      )
    }
    architecture = @{
      When = @(
        "Используй тему «$Title», когда выбираешь inductive bias: локальность, последовательность, attention, residual flow или нормализацию.",
        "Архитектура должна соответствовать структуре данных: изображение, текст, последовательность и табличные признаки требуют разных предположений.",
        "Перед усложнением архитектуры проверь, что bottleneck действительно в модели, а не в данных, loss или обучении."
      )
      Mistakes = @(
        "Копировать архитектуру без учёта размера данных, бюджета памяти и целевой метрики.",
        "Сравнивать модели с разным compute budget и делать вывод, что одна архитектура всегда лучше.",
        "Игнорировать shape flow: stride, padding, heads, channels и sequence length напрямую определяют память и скорость."
      )
      Tune = @(
        "Настраивай depth, width, normalization, dropout, kernel/head sizes и residual structure.",
        "Следи за memory footprint: иногда ограничение sequence length или feature map важнее числа параметров.",
        "Для Transformer-подобных моделей отдельно проверяй attention mask, positional encoding и scaling."
      )
      Viz = @(
        "Смотри, какая часть входа влияет на выход: receptive field, attention map или residual path.",
        "Меняй размер окна, число heads или глубину и отслеживай, где появляется bottleneck.",
        "Интерпретируй картинку как поток информации, а не как декоративную схему."
      )
    }
    llm = @{
      When = @(
        "Используй тему «$Title», когда работаешь с языковыми моделями: токены, данные, alignment, адаптация и масштабирование.",
        "LLM почти всегда упирается в компромисс между качеством данных, compute, context length и способом fine-tuning.",
        "Отделяй pre-training knowledge от instruction-following поведения: это разные этапы и разные источники качества."
      )
      Mistakes = @(
        "Думать, что токены равны словам: tokenizer меняет длину контекста, стоимость и поведение на редких строках.",
        "Оценивать модель только по нескольким удачным ответам: нужны adversarial examples, held-out задачи и сравнение baseline.",
        "Fine-tune без контроля данных: маленький плохой датасет может ухудшить поведение сильной модели."
      )
      Tune = @(
        "Настраивай data mixture, context length, learning rate, adapter rank, quantization и decoding параметры.",
        "Для LoRA/QLoRA смотри rank, alpha, target modules и качество калибровочного набора.",
        "Для RLHF/SFT отдельно контролируй reward hacking, over-optimization и деградацию полезности."
      )
      Viz = @(
        "Смотри, как меняется распределение вероятностей токенов, а не только финальный текст.",
        "Если визуализация показывает scaling или preference, оцени наклон тренда и точку насыщения.",
        "Меняй decoding/temperature аккуратно: это меняет разнообразие, но не добавляет знания модели."
      )
    }
    generative = @{
      When = @(
        "Используй тему «$Title», когда нужно понять, как модель порождает новые объекты, а не только предсказывает метку.",
        "Генеративные модели требуют оценки и качества samples, и структуры latent/noise process.",
        "Сравнивай модели по задаче: likelihood, diversity, controllability и sample quality не всегда улучшаются вместе."
      )
      Mistakes = @(
        "Судить только по красивым примерам: нужны diversity checks, failure cases и стабильные метрики.",
        "Путать latent space с реальным смысловым пространством: близость в latent не всегда означает семантическую близость.",
        "Игнорировать баланс обучения: GAN, VAE и diffusion ломаются по разным причинам."
      )
      Tune = @(
        "Настраивай latent dimension, noise schedule, regularization, guidance, architecture capacity и learning rate.",
        "Для GAN следи за балансом generator/discriminator и признаками mode collapse.",
        "Для diffusion оцени schedule, number of steps, prediction target и sampler."
      )
      Viz = @(
        "Смотри, как шум превращается в структуру или как latent перемещение меняет объект.",
        "Если картинка улучшается, проверь diversity: модель могла просто сузить набор вариантов.",
        "Интерактивы здесь полезны как проверка процесса генерации по шагам, а не только финального результата."
      )
    }
    practice = @{
      When = @(
        "Используй тему «$Title», когда обучение нужно масштабировать, ускорить, стабилизировать или отладить в реальном проекте.",
        "Практические темы включай после появления конкретной боли: нехватка памяти, медленный dataloader, NaN, loss spikes или плохой throughput.",
        "Отделяй инженерную проблему от ML-проблемы: иногда качество модели не меняется, потому что bottleneck в инфраструктуре."
      )
      Mistakes = @(
        "Оптимизировать наугад без профилирования: сначала измерение, потом изменение.",
        "Игнорировать воспроизводимость: без seed, версий данных и логов невозможно понять, что именно помогло.",
        "Скрывать нестабильность усреднением: loss spikes и NaN нужно расследовать, а не сглаживать графиком."
      )
      Tune = @(
        "Настраивай global batch, accumulation, sharding strategy, checkpoint granularity и dataloader throughput.",
        "Для памяти сравни activation checkpointing, mixed precision, FSDP и уменьшение sequence length.",
        "Для отладки фиксируй минимальный воспроизводимый batch и проверяй данные до optimizer step."
      )
      Viz = @(
        "Смотри на узкое место: GPU utilization, memory, dataloader wait или communication overhead.",
        "Если график показывает spikes, ищи совпадения с batch-ами, scheduler step, precision overflow или data anomaly.",
        "Интерактив должен помогать выбирать компромисс: память против compute, скорость против стабильности."
      )
    }
  }

  if ($profiles.ContainsKey($Kind)) { return $profiles[$Kind] }
  return $profiles["classic"]
}

function New-List {
  param([string[]]$Items, [string]$ClassName)
  $out = New-Object System.Collections.Generic.List[string]
  foreach ($item in $Items) {
    [void]$out.Add("        <li>$(HtmlText $item)</li>")
  }
  return "      <ul class=""$ClassName"">`r`n$($out -join "`r`n")`r`n      </ul>"
}

function New-LinksList {
  param($Prev, $Next)
  $items = New-Object System.Collections.Generic.List[string]
  if ($Prev) {
    [void]$items.Add("        <li><a href=""$(HtmlText (Link-Href $Prev.Path))"">← $(HtmlText $Prev.Label)</a> — повторить предыдущий контекст перед этой темой.</li>")
  }
  if ($Next) {
    [void]$items.Add("        <li><a href=""$(HtmlText (Link-Href $Next.Path))"">$(HtmlText $Next.Label) →</a> — следующий шаг, где эта идея используется дальше.</li>")
  }
  [void]$items.Add('        <li><a href="../index.html">Карта курса</a> — вернуться к общему маршруту и соседним блокам.</li>')
  return "      <ul class=""ml-endcap-list"">`r`n$($items -join "`r`n")`r`n      </ul>"
}

function New-LearningBlock {
  param($Page, $Prev, $Next)
  $profile = Get-TopicProfile (Get-SectionKind $Page.Path) $Page.Title
  $when = New-List $profile.When "ml-endcap-list"
  $mistakes = New-List $profile.Mistakes "ml-endcap-list"
  $tune = New-List $profile.Tune "ml-endcap-list"
  $links = New-LinksList $Prev $Next
  $title = HtmlText $Page.Title
  return @"

<!-- step1-learning:start -->
  <section class="ml-endcap-section" data-step1-learning-layer="1">
    <h2>Как закрепить тему: $title</h2>
    <p class="muted">Этот блок связывает теорию с практическим решением: где применять идею, какие ошибки проверять и какие ручки менять в эксперименте.</p>
    <div class="ml-endcap-grid">
      <article class="ml-endcap-card">
        <h3>Когда применять</h3>
$when
      </article>
      <article class="ml-endcap-card">
        <h3>Типичные ошибки</h3>
$mistakes
      </article>
      <article class="ml-endcap-card">
        <h3>Что тюнить</h3>
$tune
      </article>
      <article class="ml-endcap-card">
        <h3>Связи с другими темами</h3>
$links
      </article>
    </div>
  </section>
<!-- step1-learning:end -->
"@
}

function New-VizBlock {
  param($Page)
  $profile = Get-TopicProfile (Get-SectionKind $Page.Path) $Page.Title
  $items = New-List $profile.Viz "ml-explainer-list"
  return @"

<!-- step1-viz:start -->
    <div class="classic-viz-note" data-step1-viz-explainer="1">
      <div class="classic-viz-note__kicker">Как читать интерактив</div>
      <h3>Что менять и как интерпретировать</h3>
$items
    </div>
<!-- step1-viz:end -->
"@
}

$pages = New-Object System.Collections.Generic.List[object]
$cardRegex = [regex]::new('(?is)<a\b[^>]*class="[^"]*\bcard\b[^"]*"[^>]*href="([^"]+)"[^>]*>\s*<div class="badge">([^<]+)</div>\s*<h3>(.*?)</h3>\s*<p>(.*?)</p>\s*</a>')
foreach ($match in $cardRegex.Matches($indexHtml)) {
  $path = $match.Groups[1].Value.Replace('\', '/')
  if ($path -notmatch '\.html$') { continue }
  [void]$pages.Add([pscustomobject]@{
    Path = $path
    Label = (Strip-Html ($match.Groups[2].Value + " " + $match.Groups[3].Value))
    Title = (Strip-Html $match.Groups[3].Value)
    Description = (Strip-Html $match.Groups[4].Value)
  })
}

$updated = 0
$vizUpdated = 0

for ($i = 0; $i -lt $pages.Count; $i++) {
  $page = $pages[$i]
  $fullPath = Join-Path $root ($page.Path -replace '/', '\')
  if (-not (Test-Path -LiteralPath $fullPath)) { continue }

  $html = Get-Content -LiteralPath $fullPath -Raw -Encoding UTF8
  $html = Remove-Step1Blocks $html

  $hasCanvasBeforeScript = $false
  $scriptIndex = $html.IndexOf("<script", [System.StringComparison]::OrdinalIgnoreCase)
  $prefix = if ($scriptIndex -gt 0) { $html.Substring(0, $scriptIndex) } else { $html }
  $canvasMatch = [regex]::Match($prefix, '(?is)<canvas\b[^>]*>.*?</canvas>')
  if ($canvasMatch.Success) {
    $insertAt = $canvasMatch.Index + $canvasMatch.Length
    $html = $html.Insert($insertAt, (New-VizBlock $page))
    $hasCanvasBeforeScript = $true
    $vizUpdated += 1
  }

  $prev = if ($i -gt 0) { $pages[$i - 1] } else { $null }
  $next = if ($i -lt $pages.Count - 1) { $pages[$i + 1] } else { $null }
  $learningBlock = New-LearningBlock $page $prev $next

  $bundlePattern = '(?is)(\s*</div>\s*<script\s+src="\.\./bundle\.js"\s+defer></script>\s*</body>)'
  if ([regex]::IsMatch($html, $bundlePattern)) {
    $html = [regex]::Replace($html, $bundlePattern, ($learningBlock + '$1'), 1)
  } elseif ($html -match '(?is)</body>') {
    $html = [regex]::Replace($html, '(?is)</body>', ($learningBlock + "`r`n</body>"), 1)
  } else {
    $html += $learningBlock
  }

  Set-Content -LiteralPath $fullPath -Value $html -Encoding UTF8
  $updated += 1
  $vizText = if ($hasCanvasBeforeScript) { " + viz" } else { "" }
  Write-Host "$($page.Path): learning layer$vizText"
}

Write-Host "Step 1 learning layer updated: $updated files"
Write-Host "Visualization notes inserted: $vizUpdated files"
