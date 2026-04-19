$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Web

$root = Split-Path -Parent $PSScriptRoot

function HtmlText {
  param([string]$Text)
  return [System.Web.HttpUtility]::HtmlEncode($Text)
}

function Remove-DeepeningBlocks {
  param([string]$Html)
  return [regex]::Replace($Html, '(?is)\s*<!-- neural-deepening:start:[^>]+ -->.*?<!-- neural-deepening:end -->\s*', "`r`n")
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

<!-- neural-deepening:start:$id -->
  <section class="concept-walkthrough" data-neural-deepening="$id">
    <div class="concept-walkthrough__kicker">Теория глубже</div>
    <h3>$title</h3>
$($paragraphs -join "`r`n")
$list
  </section>
<!-- neural-deepening:end -->
"@
}

function Add-AfterCardHeading {
  param([string]$Html, [string]$HeadingPattern, [string]$Block)
  $headingPatternInsideTag = "(?is)<h[23][^>]*>(?:(?!</h[23]>).)*$HeadingPattern(?:(?!</h[23]>).)*</h[23]>"
  $heading = [regex]::Match($Html, $headingPatternInsideTag)
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
    File = "03_neural_basics/01_perceptron_and_neuron.html"
    Inserts = @(
      @{
        Id = "3-1-neuron-detector"
        After = "От биологии к математике"
        Title = "Нейрон - локальный детектор признака"
        Paragraphs = @(
          "Один нейрон не понимает объект целиком. Он проверяет один вопрос: похож ли вход на тот шаблон, который записан в его весах. Если похож, pre-activation становится большой; если нет, сигнал слабый или отрицательный.",
          "В глубокой сети такие маленькие детекторы собираются в иерархию. Ранние слои реагируют на простые паттерны, следующие слои комбинируют их в более абстрактные признаки, а последние слои превращают представление в решение."
        )
        Items = @(
          "Веса задают направление, на которое нейрон реагирует.",
          "Bias задаёт порог, после которого реакция становится заметной.",
          "Активация решает, сколько сигнала передать дальше."
        )
      },
      @{
        Id = "3-1-dot-product-geometry"
        After = "Скалярное произведение"
        Title = "Скалярное произведение измеряет совпадение направления"
        Paragraphs = @(
          "Геометрически w^T x большой, когда входной вектор направлен примерно туда же, куда вектор весов. Поэтому нейрон можно читать как измеритель сходства: он усиливает входы, которые совпадают с его learned direction.",
          "Длина вектора тоже влияет на значение. Поэтому scaling и normalization важны: один признак с большим масштабом может доминировать в dot product, даже если он не несёт больше смысла."
        )
        Items = @(
          "Угол между x и w отвечает за похожесть направления.",
          "Длина x отвечает за силу входного сигнала.",
          "Длина w отвечает за чувствительность нейрона к этому направлению."
        )
      },
      @{
        Id = "3-1-bias-threshold"
        After = "Роль bias"
        Title = "Bias сдвигает границу решения без изменения направления"
        Paragraphs = @(
          "Веса задают ориентацию гиперплоскости, а bias двигает её относительно начала координат. Без bias нейрон обязан проводить границу через ноль, что искусственно ограничивает модель.",
          "Оптимизационно bias часто берёт на себя базовый уровень активации. Если признак должен срабатывать даже при небольшом входе, bias может сдвинуть threshold; если нужен строгий фильтр, bias делает нейрон менее склонным активироваться."
        )
        Items = @(
          "w меняет наклон разделяющей границы.",
          "b меняет положение границы.",
          "Большой положительный bias повышает базовую активность, отрицательный - делает нейрон более строгим."
        )
      },
      @{
        Id = "3-1-universal-approximation"
        After = "универсальный аппроксиматор"
        Title = "Универсальная аппроксимация не означает лёгкое обучение"
        Paragraphs = @(
          "Теорема об универсальной аппроксимации говорит, что достаточно широкая сеть может представить очень много функций. Но она не гарантирует, что gradient descent быстро найдёт нужные веса, что данных хватит или что модель будет хорошо обобщать.",
          "Практический смысл другой: нелинейные нейроны дают достаточно богатый язык для построения функций. А качество уже зависит от архитектуры, initialization, loss, optimizer, regularization и данных."
        )
        Items = @(
          "Expressivity отвечает за то, что сеть может представить.",
          "Optimization отвечает за то, получится ли это найти.",
          "Generalization отвечает за то, будет ли найденная функция работать вне train."
        )
      }
    )
  },
  @{
    File = "03_neural_basics/02_activation_functions.html"
    Inserts = @(
      @{
        Id = "3-2-nonlinearity-composition"
        After = "Зачем вообще нужна нелинейность"
        Title = "Нелинейность не украшает сеть, а создаёт сложную геометрию"
        Paragraphs = @(
          "Если убрать активации, любое число линейных слоёв схлопнется в один линейный слой. Глубина без нелинейности не добавляет выразительности: произведение матриц всё равно остаётся матрицей.",
          "Активации разрезают пространство на области, где сеть ведёт себя по-разному. ReLU-сеть, например, строит кусочно-линейную функцию: локально она линейна, но глобально может иметь очень сложную форму."
        )
        Items = @(
          "Linear layers поворачивают, растягивают и смешивают признаки.",
          "Activations меняют режим вычисления в зависимости от значения.",
          "Композиция слоёв создаёт иерархию всё более сложных признаков."
        )
      },
      @{
        Id = "3-2-derivative-gate"
        After = "Проблема затухающего"
        Title = "Производная активации - это gate для градиента"
        Paragraphs = @(
          "Во время backprop градиент проходит через производные всех промежуточных активаций. Если производные много раз меньше единицы, сигнал ошибки постепенно исчезает. Если они много раз больше единицы, градиент может взорваться.",
          "Поэтому активация выбирается не только по форме forward pass. Важно, как она пропускает gradient flow. ReLU стала популярной именно потому, что в положительной области её производная равна единице и не гасит сигнал."
        )
        Items = @(
          "Sigmoid насыщается на больших по модулю входах и даёт малую производную.",
          "Tanh центрирована около нуля, но тоже насыщается.",
          "ReLU хорошо пропускает положительный градиент, но может умереть в отрицательной области."
        )
      },
      @{
        Id = "3-2-dying-relu-mechanism"
        After = "Dying ReLU"
        Title = "Dying ReLU возникает из-за постоянного отрицательного pre-activation"
        Paragraphs = @(
          "Если для всех или почти всех объектов z у нейрона становится отрицательным, ReLU выдаёт ноль. Производная на этой стороне тоже нулевая, поэтому веса нейрона перестают получать полезный gradient update.",
          "Это чаще происходит при слишком большом learning rate, плохой initialization или сильном сдвиге bias. LeakyReLU, GELU и SiLU уменьшают риск, потому что не делают отрицательную сторону полностью мёртвой."
        )
        Items = @(
          "Мёртвый нейрон выдаёт почти всегда ноль.",
          "Нулевой output часто означает нулевой gradient через этот путь.",
          "Leaky activations оставляют небольшой канал для восстановления."
        )
      },
      @{
        Id = "3-2-softmax-logits"
        After = "Softmax"
        Title = "Softmax превращает относительные logits в распределение"
        Paragraphs = @(
          "Softmax не смотрит на абсолютные значения logits отдельно. Ему важны разности между ними: если ко всем logits добавить одно и то же число, вероятности не изменятся. Поэтому перед softmax можно вычитать максимум logits для численной стабильности.",
          "Температура softmax управляет резкостью распределения. Низкая температура делает выбор почти argmax, высокая - распределяет вероятность мягче между классами."
        )
        Items = @(
          "Logits - сырые score до нормировки.",
          "Softmax делает вероятности, сумма которых равна единице.",
          "CrossEntropyLoss в PyTorch ждёт logits, а не уже применённый softmax."
        )
      }
    )
  },
  @{
    File = "03_neural_basics/03_forward_pass.html"
    Inserts = @(
      @{
        Id = "3-3-shapes-contract"
        After = "Один слой"
        Title = "Shapes - это контракт между слоями"
        Paragraphs = @(
          "Forward pass можно читать как цепочку договоров о размерах. Выход одного слоя обязан быть входом следующего. Большинство ошибок в нейросетях сначала проявляются не как плохая accuracy, а как несовместимость shapes.",
          "Понимание shapes даёт контроль над архитектурой: ты видишь, где появляется batch dimension, где меняется feature dimension, где broadcasting bias корректен, а где случайно скрывает ошибку."
        )
        Items = @(
          "Batch dimension обычно не смешивается с feature dimension.",
          "Weight matrix хранит обучаемое преобразование признаков.",
          "Bias broadcast-ится по batch и добавляет отдельный сдвиг каждому выходному нейрону."
        )
      },
      @{
        Id = "3-3-batch-matmul"
        After = "Батч: почему"
        Title = "Batching меняет не математику модели, а эффективность вычислений"
        Paragraphs = @(
          "Один объект и batch объектов проходят через тот же слой. Разница в том, что batch превращает много одинаковых операций в одну большую матричную операцию, которую GPU выполняет значительно эффективнее.",
          "Batch size также влияет на статистику обучения. Большие batch-и дают более стабильный gradient estimate, но могут хуже шуметь и требовать другой learning rate. Маленькие batch-и шумнее, зато иногда помогают optimization выйти из резких минимумов."
        )
        Items = @(
          "Forward для batch параллелит одинаковые вычисления.",
          "Память растёт вместе с batch size и числом сохранённых активаций.",
          "Оптимальный batch size часто ограничен GPU memory и стабильностью обучения."
        )
      },
      @{
        Id = "3-3-activation-memory"
        After = "Memory"
        Title = "Forward pass сохраняет активации для будущего backprop"
        Paragraphs = @(
          "Во время inference forward pass может просто посчитать результат. Во время training он должен сохранить промежуточные активации, потому что backprop использует их для вычисления градиентов по весам и входам.",
          "Это объясняет, почему обучение требует намного больше памяти, чем inference. Чем глубже сеть и чем больше batch, тем больше activation memory. Gradient checkpointing экономит память, пересчитывая часть forward pass во время backward."
        )
        Items = @(
          "Weights занимают память постоянно.",
          "Activations растут с batch size и глубиной.",
          "Backward обычно требует сохранённых Z или A для производных."
        )
      },
      @{
        Id = "3-3-representation-pipeline"
        After = "Forward pass как построение"
        Title = "Forward pass последовательно меняет язык описания объекта"
        Paragraphs = @(
          "Каждый слой переводит объект в новое представление. Вход может быть пикселями, токенами или табличными признаками, но после нескольких слоёв сеть работает уже с learned features, которые удобнее для текущей loss.",
          "Оптимизационно forward pass задаёт, какой сигнал увидит loss. Если representation плохое, loss даёт градиент, но этот градиент может быть трудно использовать. Поэтому архитектура, normalization и activation flow напрямую влияют на обучаемость."
        )
        Items = @(
          "Ранние слои обычно ловят простые локальные паттерны.",
          "Средние слои комбинируют признаки в более абстрактные структуры.",
          "Последние слои переводят representation в logits, value или embedding."
        )
      }
    )
  },
  @{
    File = "03_neural_basics/04_loss_functions.html"
    Inserts = @(
      @{
        Id = "3-4-loss-as-assumption"
        After = "Единый фрейм"
        Title = "Loss фиксирует предположение о шуме и цене ошибки"
        Paragraphs = @(
          "Loss - это не просто число для optimizer. Он кодирует, какие ошибки считаются дорогими и какой probabilistic story мы считаем правдоподобной. MSE соответствует гауссовскому шуму, MAE ближе к лапласовскому, BCE - Bernoulli target, CrossEntropy - categorical target.",
          "Если loss не совпадает с реальной задачей, модель может честно оптимизировать неправильное поведение. Поэтому выбор loss всегда связан с метрикой, распределением target и downstream-решением."
        )
        Items = @(
          "MSE сильно штрафует крупные промахи.",
          "MAE устойчивее к выбросам.",
          "CrossEntropy штрафует уверенные ошибки особенно сильно."
        )
      },
      @{
        Id = "3-4-mse-bce-gradients"
        After = "Вывод BCE"
        Title = "Хороший loss даёт полезный gradient signal"
        Paragraphs = @(
          "Loss важен не только как итоговая метрика. Он определяет, какой градиент получает модель на каждом примере. Для BCE уверенная неправильная вероятность создаёт сильный gradient push, потому что такую ошибку нужно быстро исправлять.",
          "Поэтому в классификации обычно используют logits плюс CrossEntropy или BCEWithLogitsLoss. Такая связка стабильнее и даёт правильный gradient flow без ручного sigmoid или softmax перед loss."
        )
        Items = @(
          "Для binary classification используй BCEWithLogitsLoss, если модель выдаёт один logit.",
          "Для multiclass classification используй CrossEntropyLoss по logits.",
          "Не применяй softmax перед CrossEntropyLoss в PyTorch."
        )
      },
      @{
        Id = "3-4-focal-loss-meaning"
        After = "Focal Loss"
        Title = "Focal Loss меняет внимание optimizer"
        Paragraphs = @(
          "Focal Loss уменьшает вклад лёгких примеров, которые модель уже уверенно классифицирует. Это освобождает gradient budget для трудных и редких примеров, что полезно при сильном imbalance или dense detection.",
          "Но focal loss не является универсальным лекарством. Если labels шумные, он может усилить внимание к спорным или неверно размеченным объектам. Поэтому его стоит проверять вместе с calibration и PR-метриками."
        )
        Items = @(
          "gamma управляет тем, насколько сильно подавляются лёгкие примеры.",
          "alpha может компенсировать imbalance между классами.",
          "Слишком сильный focal режим может ухудшить calibration вероятностей."
        )
      },
      @{
        Id = "3-4-numerical-stability"
        After = "log-sum-exp"
        Title = "Численная стабильность защищает математику от ограничений float"
        Paragraphs = @(
          "Математически exp большого logit существует, но в float32 или float16 он может стать infinity. Маленькие вероятности могут стать нулём, а log(0) превращается в бесконечность. Это ломает loss и градиенты.",
          "log-sum-exp trick сохраняет те же вероятностные отношения, но переносит вычисления в безопасный диапазон. Поэтому production-код почти всегда использует fused losses, где sigmoid, softmax и log объединены в устойчивую операцию."
        )
        Items = @(
          "Вычитай максимум logits перед softmax.",
          "Используй BCEWithLogitsLoss вместо sigmoid плюс BCE.",
          "Следи за NaN и inf в loss, gradients и activations."
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
  Write-Host "$($page.File): neural deepening blocks inserted"
  $updated += 1
}

Write-Host "Neural basics deepening updated: $updated files"

