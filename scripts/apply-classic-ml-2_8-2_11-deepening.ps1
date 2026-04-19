$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Web

$root = Split-Path -Parent $PSScriptRoot

function HtmlText {
  param([string]$Text)
  return [System.Web.HttpUtility]::HtmlEncode($Text)
}

function Remove-DeepeningBlocks {
  param([string]$Html)
  return [regex]::Replace($Html, '(?is)\s*<!-- model-deepening:start:[^>]+ -->.*?<!-- model-deepening:end -->\s*', "`r`n")
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

<!-- model-deepening:start:$id -->
  <section class="concept-walkthrough" data-model-deepening="$id">
    <div class="concept-walkthrough__kicker">Теория глубже</div>
    <h3>$title</h3>
$($paragraphs -join "`r`n")
$list
  </section>
<!-- model-deepening:end -->
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
    File = "02_classic_ml/08_distance_based_models.html"
    Inserts = @(
      @{
        Id = "2-8-metric-bias"
        After = "Что такое distance-based"
        Title = "Метрика расстояния — это hidden assumption модели"
        Paragraphs = @(
          "k-NN не учит веса в привычном смысле, но это не значит, что у него нет предположений. Главное предположение спрятано в distance metric: близкие объекты считаются похожими по target. Если выбранная геометрия не отражает реальную похожесть, модель будет уверенно искать не тех соседей.",
          "Поэтому preprocessing и metric learning здесь особенно важны. Scaling, encoding и выбор L1/L2 фактически задают карту пространства, по которой модель ищет локальные закономерности."
        )
        Items = @(
          "Euclidean distance хорошо работает, когда важны гладкие радиальные отклонения.",
          "Manhattan distance устойчивее, когда признаки складываются как независимые абсолютные вклады.",
          "Cosine distance полезен, когда важнее направление вектора, чем его длина."
        )
      },
      @{
        Id = "2-8-k-as-smoother"
        After = "Выбор k"
        Title = "k управляет степенью локального сглаживания"
        Paragraphs = @(
          "Маленькое k делает модель почти запоминанием отдельных объектов: граница становится рваной, чувствительной к шуму и выбросам. Большое k усредняет больше соседей и сглаживает решение, но может стереть локальные паттерны.",
          "В этом смысле k играет роль regularization. Он не добавляет штраф в loss, но ограничивает, насколько сильно один объект может повлиять на prediction."
        )
        Items = @(
          "k=1: низкий bias, высокая variance.",
          "Большое k: выше bias, ниже variance.",
          "Distance weighting частично смягчает проблему большого k, потому что близкие соседи получают больший голос."
        )
      },
      @{
        Id = "2-8-distance-concentration"
        After = "Curse of dimensionality"
        Title = "В высокой размерности расстояния теряют контраст"
        Paragraphs = @(
          "Curse of dimensionality для k-NN проявляется не только в том, что данных нужно больше. Важнее другое: ближайший и дальний сосед становятся похожими по расстоянию. Когда все объекты примерно одинаково далеко, понятие ближайшего соседа теряет смысл.",
          "Это объясняет, почему dimensionality reduction, feature selection и domain-specific embeddings часто важнее самого выбора k. Нужно вернуть пространству контраст: близкое должно быть действительно близким, а далёкое — заметно далёким."
        )
        Items = @(
          "Удаляй шумные признаки: они добавляют расстояние, но не добавляют сигнал.",
          "Используй embeddings, если сырые признаки плохо отражают семантическую близость.",
          "Проверяй распределение nearest-neighbor distances, а не только итоговую accuracy."
        )
      }
    )
  },
  @{
    File = "02_classic_ml/09_naive_bayes.html"
    Inserts = @(
      @{
        Id = "2-9-generative-story"
        After = "Что такое Naive Bayes"
        Title = "Naive Bayes строит историю генерации данных"
        Paragraphs = @(
          "Naive Bayes относится к generative models: он пытается описать, как признаки могли появиться внутри каждого класса. Сначала выбирается класс через prior, потом для этого класса генерируются признаки через likelihood. Классификация получается обратным вопросом: какой класс лучше объясняет уже увиденные признаки.",
          "Это отличается от logistic regression, которая напрямую моделирует P(y|x). Naive Bayes чаще проще и быстрее, но платит за это сильным предположением об условной независимости."
        )
        Items = @(
          "Prior отвечает за базовую частоту класса.",
          "Likelihood отвечает за типичность признака внутри класса.",
          "Posterior соединяет prior и evidence после наблюдения объекта."
        )
      },
      @{
        Id = "2-9-double-counting"
        After = "Conditional independence assumption"
        Title = "Нарушение независимости приводит к double counting"
        Paragraphs = @(
          "Если два признака сильно коррелированы, Naive Bayes может посчитать один и тот же сигнал дважды. Например, слова profit и revenue в финансовом тексте могут усиливать один и тот же смысл, но модель умножит их likelihood так, будто это независимые свидетельства.",
          "Иногда это всё равно работает, потому что для классификации важен правильный ranking классов, а не идеально откалиброванная вероятность. Но вероятности Naive Bayes часто получаются слишком уверенными."
        )
        Items = @(
          "Коррелированные признаки завышают уверенность posterior.",
          "Для ranking модель может оставаться полезной даже при плохой calibration.",
          "Если нужны честные вероятности, проверяй calibration или используй calibrators."
        )
      },
      @{
        Id = "2-9-smoothing-prior"
        After = "Почему в Multinomial NB нужен smoothing"
        Title = "Smoothing — это prior против нулевой вероятности"
        Paragraphs = @(
          "Без smoothing один невиданный токен может обнулить вероятность всего класса. Это слишком сильное наказание: отсутствие слова в train не означает невозможность встретить его в будущем.",
          "Additive smoothing добавляет виртуальные наблюдения. Модель становится менее уверенной в редких событиях и лучше переносит новые тексты, категории или признаки."
        )
        Items = @(
          "alpha=0: максимальная вера train-частотам, высокий риск нулей.",
          "alpha=1: Laplace smoothing, сильнее сглаживает редкости.",
          "Маленькая alpha часто лучше, если данных много и словарь большой."
        )
      }
    )
  },
  @{
    File = "02_classic_ml/10_decision_trees.html"
    Inserts = @(
      @{
        Id = "2-10-piecewise-constant"
        After = "Что такое дерево решений"
        Title = "Дерево — это кусочно-постоянная модель пространства"
        Paragraphs = @(
          "Каждый split режет пространство признаков осевым условием: x_j <= threshold. После нескольких split-ов пространство превращается в прямоугольные регионы, а каждый лист хранит простое предсказание: класс majority или средний target.",
          "Поэтому дерево хорошо ловит нелинейные правила и взаимодействия признаков, но его границы остаются ступенчатыми. Чем глубже дерево, тем мельче регионы и тем ближе модель к запоминанию train."
        )
        Items = @(
          "Classification leaf хранит распределение классов.",
          "Regression leaf хранит среднее target внутри региона.",
          "Глубина дерева управляет размером регионов и риском переобучения."
        )
      },
      @{
        Id = "2-10-impurity-as-risk"
        After = "Gini impurity"
        Title = "Impurity измеряет риск ошибочного листа"
        Paragraphs = @(
          "Gini и entropy можно читать как разные способы измерить неопределённость класса внутри узла. Если узел чистый, листовое решение очевидно. Если классы смешаны, любой prediction из этого узла рискован.",
          "Split полезен, когда он переносит неопределённость из родителя в более чистые дочерние узлы. Поэтому дерево не ищет красивую глобальную границу: оно жадно выбирает вопрос, который прямо сейчас уменьшает локальный риск."
        )
        Items = @(
          "Gini быстрее и часто даёт похожие split-ы с entropy.",
          "Entropy сильнее реагирует на очень малые вероятности.",
          "Information gain должен учитывать размер дочерних узлов, иначе маленькие чистые группы переоценятся."
        )
      },
      @{
        Id = "2-10-pruning-regularization"
        After = "Depth, leaves, pruning"
        Title = "Pruning — это регуляризация структуры, а не весов"
        Paragraphs = @(
          "В линейных моделях регуляризация обычно штрафует коэффициенты. В деревьях главная сложность находится в структуре: глубина, число листьев, min_samples_leaf и min_impurity_decrease. Они ограничивают, насколько мелко дерево имеет право дробить пространство.",
          "Хороший split должен не просто улучшать train impurity, а давать устойчивое улучшение на новых данных. Поэтому ограничения на листья часто важнее, чем точный выбор между Gini и entropy."
        )
        Items = @(
          "max_depth ограничивает длину цепочек условий.",
          "min_samples_leaf защищает от листьев на 1-2 объектах.",
          "ccp_alpha удаляет ветви, которые дают слишком маленький выигрыш относительно сложности."
        )
      }
    )
  },
  @{
    File = "02_classic_ml/11_bagging_random_forest.html"
    Inserts = @(
      @{
        Id = "2-11-variance-correlation"
        After = "Зачем вообще переходить"
        Title = "Лес снижает variance только если деревья не одинаковые"
        Paragraphs = @(
          "Усреднение моделей снижает variance, когда ошибки отдельных моделей не полностью коррелированы. Если все деревья делают одну и ту же ошибку, голосование ничего не исправит. Random Forest специально добавляет разнообразие через bootstrap samples и случайные подмножества признаков.",
          "Поэтому сила леса не только в количестве деревьев, а в балансе: каждое дерево должно быть достаточно сильным, но деревья должны ошибаться немного по-разному."
        )
        Items = @(
          "Больше деревьев снижает шум ансамбля, но не лечит bias.",
          "Feature subsampling уменьшает корреляцию между деревьями.",
          "Слишком слабые деревья дают стабильный, но плохой ансамбль."
        )
      },
      @{
        Id = "2-11-oob-bootstrap"
        After = "Bootstrap sampling"
        Title = "OOB score использует то, что bootstrap оставляет часть объектов вне дерева"
        Paragraphs = @(
          "В каждом bootstrap sample часть train-объектов повторяется, а часть вообще не попадает в обучение конкретного дерева. Эти out-of-bag объекты можно использовать как мини-validation для этого дерева.",
          "OOB score не заменяет финальную validation strategy во всех случаях, но даёт быстрый честный сигнал без отдельного hold-out, особенно когда данных мало."
        )
        Items = @(
          "Каждое дерево видит свой bootstrap sample.",
          "OOB prediction для объекта строится только по деревьям, которые его не видели.",
          "OOB полезен для диагностики, но при time series или grouped data его нужно применять осторожно."
        )
      },
      @{
        Id = "2-11-importance-caveats"
        After = "Feature importance"
        Title = "Feature importance в лесу объясняет модель, а не причинность"
        Paragraphs = @(
          "Встроенная impurity importance может завышать признаки с большим числом возможных split-ов и странно распределять важность между коррелированными признаками. Permutation importance честнее проверяет, насколько падает качество при разрушении признака, но тоже зависит от validation distribution.",
          "Поэтому importance нужно читать как вопрос к модели: чем она пользовалась для prediction. Это не доказательство, что признак причинно управляет target."
        )
        Items = @(
          "Коррелированные признаки могут делить importance между собой.",
          "Permutation importance лучше считать на validation или test-like split.",
          "Для локальных объяснений смотри SHAP или decision path, но проверяй устойчивость объяснений."
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
  Write-Host "$($page.File): model deepening blocks inserted"
  $updated += 1
}

Write-Host "Classic ML 2.8-2.11 deepening updated: $updated files"

