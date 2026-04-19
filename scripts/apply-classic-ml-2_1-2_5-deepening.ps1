$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Web

$root = Split-Path -Parent $PSScriptRoot

function HtmlText {
  param([string]$Text)
  return [System.Web.HttpUtility]::HtmlEncode($Text)
}

function Remove-DeepeningBlocks {
  param([string]$Html)
  return [regex]::Replace($Html, '(?is)\s*<!-- classic-deepening:start:[^>]+ -->.*?<!-- classic-deepening:end -->\s*', "`r`n")
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

function New-DeepeningBlock {
  param([hashtable]$Spec)
  $id = HtmlText $Spec.Id
  $title = HtmlText $Spec.Title
  $paragraphs = New-Object System.Collections.Generic.List[string]
  foreach ($paragraph in $Spec.Paragraphs) {
    [void]$paragraphs.Add("    <p>$(HtmlText $paragraph)</p>")
  }
  $list = New-ListHtml $Spec.Items
  return @"

<!-- classic-deepening:start:$id -->
  <section class="concept-walkthrough" data-classic-deepening="$id">
    <div class="concept-walkthrough__kicker">Теория глубже</div>
    <h3>$title</h3>
$($paragraphs -join "`r`n")
$list
  </section>
<!-- classic-deepening:end -->
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
    File = "02_classic_ml/01_intro_to_classical_ml.html"
    Inserts = @(
      @{
        Id = "2-1-ml-loop"
        After = "Что вообще называется"
        Title = "ML как замкнутый контур решений"
        Paragraphs = @(
          "Классическое машинное обучение удобно понимать не как набор алгоритмов, а как цикл: данные задают наблюдения, модель задаёт семейство допустимых объяснений, loss превращает ошибку в число, optimizer ищет параметры, а validation проверяет, не обманули ли мы себя.",
          "Главный вопрос в этом цикле: какая часть качества пришла из настоящего сигнала, а какая из случайной подгонки под конкретную выборку. Поэтому baseline, split и метрика являются частью модели не меньше, чем сам алгоритм."
        )
        Items = @(
          "Hypothesis space — какие функции модель вообще способна выразить.",
          "Objective — что модель считает хорошим решением.",
          "Validation protocol — как мы проверяем, что решение переживает новые данные."
        )
      },
      @{
        Id = "2-1-validation-feedback"
        After = "Train / Validation / Test"
        Title = "Почему validation постепенно превращается в train"
        Paragraphs = @(
          "Каждый раз, когда ты смотришь на validation score и меняешь признаки, модель или гиперпараметры, информация из validation попадает в процесс разработки. Формально веса модели на validation не обучались, но твои инженерные решения уже подстроились под этот набор.",
          "Именно поэтому test должен оставаться последним независимым измерением. Если test использовать как validation, он перестаёт отвечать на вопрос о будущем качестве и начинает измерять качество подгонки процесса разработки."
        )
        Items = @(
          "Validation нужен для выбора решения.",
          "Test нужен для честного финального отчёта.",
          "Nested CV нужен, когда сам подбор гиперпараметров становится частью оценки."
        )
      },
      @{
        Id = "2-1-learning-curves"
        After = "Bias vs Variance"
        Title = "Learning curves как диагностика причины ошибки"
        Paragraphs = @(
          "Bias и variance лучше всего читать не по одному числу, а по двум кривым: train score и validation score при росте данных, сложности модели или числа итераций. Если обе кривые плохие и близкие — модель недообучается. Если train сильно лучше validation — модель слишком хорошо запоминает train.",
          "Это превращает абстрактную дилемму в инженерное решение: добавить признаки, упростить модель, усилить регуляризацию, собрать данные или изменить метрику."
        )
        Items = @(
          "Высокий bias: больше выразительности, лучшие признаки, меньше регуляризации.",
          "Высокая variance: больше данных, сильнее регуляризация, проще модель, стабильнее split.",
          "Шумный target: иногда потолок качества задаёт не модель, а сама постановка задачи."
        )
      }
    )
  },
  @{
    File = "02_classic_ml/02_data_preprocessing.html"
    Inserts = @(
      @{
        Id = "2-2-geometry"
        After = "Зачем вообще нужна предобработка"
        Title = "Preprocessing меняет геометрию задачи"
        Paragraphs = @(
          "Предобработка — это не косметика перед моделью. Scaling меняет расстояния, encoding меняет пространство признаков, imputation добавляет предположения о неизвестных значениях, а feature engineering буквально создаёт новые оси, по которым модель сможет разделять данные.",
          "Один и тот же алгоритм после preprocessing видит другую задачу. Поэтому качество preprocessing нельзя оценивать отдельно от модели и validation protocol."
        )
        Items = @(
          "Для k-NN и SVM масштаб признаков меняет само понятие близости.",
          "Для линейных моделей encoding определяет, какие сравнения модель может выразить.",
          "Для деревьев scaling часто не важен, но leakage и target encoding остаются критичными."
        )
      },
      @{
        Id = "2-2-missingness"
        After = "Пропуски"
        Title = "Пропуск — это иногда сигнал, а не мусор"
        Paragraphs = @(
          "Missing values бывают разных типов. MCAR означает, что пропуск случайный и почти не несёт информации. MAR означает, что пропуск объясняется другими наблюдаемыми признаками. MNAR означает, что сам факт пропуска связан с неизвестным значением или поведением пользователя.",
          "Если пропуски не случайны, простое среднее может стереть важный сигнал. Поэтому часто полезно добавлять indicator-признак: было значение пропущено или нет."
        )
        Items = @(
          "MCAR: можно использовать простую imputation, если доля пропусков мала.",
          "MAR: imputation должна учитывать другие признаки.",
          "MNAR: сам факт пропуска может быть предиктором target."
        )
      },
      @{
        Id = "2-2-fit-transform"
        After = "Train / validation / test и data leakage"
        Title = "Fit-state: главный источник тихого leakage"
        Paragraphs = @(
          "Любой preprocessing, который что-то вычисляет по данным, имеет состояние: среднее и стандартное отклонение scaler-а, частоты категорий, выбранные признаки, статистики target encoding. Это состояние должно обучаться только на train.",
          "Validation и test имеют право только проходить через уже обученный transform. Если fit происходит на всём датасете, модель получает статистику будущих данных, даже если target напрямую не использовался."
        )
        Items = @(
          "fit: изучает параметры обработки на train.",
          "transform: применяет уже найденные параметры к любым данным.",
          "Pipeline нужен, чтобы эта дисциплина сохранялась внутри cross-validation."
        )
      }
    )
  },
  @{
    File = "02_classic_ml/03_linear_regression.html"
    Inserts = @(
      @{
        Id = "2-3-assumptions"
        After = "Что такое линейная регрессия"
        Title = "Предсказание и статистический вывод — разные режимы"
        Paragraphs = @(
          "Для prediction линейная регрессия может быть полезной даже когда реальные связи не идеально линейны: она даёт стабильный baseline и хорошо работает при адекватных признаках. Для inference требования жёстче: важны независимость ошибок, отсутствие сильной эндогенности, разумная форма шума и корректная интерпретация коэффициентов.",
          "Если цель — предсказывать, главный критерий validation quality. Если цель — объяснять причинный эффект признака, одной линейной регрессии недостаточно: нужны дизайн исследования, контроль confounders и проверка assumptions."
        )
        Items = @(
          "Linearity: средний ответ примерно выражается линейной комбинацией признаков.",
          "Exogeneity: ошибка не должна систематически зависеть от признаков.",
          "Homoscedasticity: масштаб шума не должен резко меняться по диапазону прогнозов."
        )
      },
      @{
        Id = "2-3-projection"
        After = "Геометрический смысл least squares"
        Title = "Least squares как ортогональная проекция"
        Paragraphs = @(
          "В матричном виде модель ищет точку Xw в пространстве всех линейных комбинаций столбцов X. Вектор y обычно не лежит точно в этом пространстве, поэтому алгоритм выбирает ближайшую точку по евклидовой дистанции.",
          "Residual y−Xw в оптимуме ортогонален каждому столбцу X. Это сильная геометрическая идея: после обучения ни один признак не должен содержать линейно извлекаемый остаточный сигнал."
        )
        Items = @(
          "Столбцы X задают подпространство возможных прогнозов.",
          "Xw — конкретная точка в этом подпространстве.",
          "Residual — часть target, которую линейная модель не смогла объяснить."
        )
      },
      @{
        Id = "2-3-conditioning"
        After = "Нормальное уравнение"
        Title = "Почему closed-form решение может быть численно хрупким"
        Paragraphs = @(
          "Нормальное уравнение выглядит элегантно, но матрица XᵀX усиливает проблемы conditioning. Если признаки сильно коррелируют или имеют разные масштабы, обратная матрица становится нестабильной: маленький шум в данных может резко менять коэффициенты.",
          "Поэтому на практике часто используют SVD, QR-разложение, регуляризацию Ridge или итерационные методы. Это не усложнение ради усложнения, а защита от плохой геометрии признакового пространства."
        )
        Items = @(
          "Multicollinearity делает коэффициенты неустойчивыми.",
          "Scaling улучшает conditioning и ускоряет gradient descent.",
          "Ridge добавляет λI и делает задачу более устойчивой."
        )
      }
    )
  },
  @{
    File = "02_classic_ml/04_linear_model_regularization.html"
    Inserts = @(
      @{
        Id = "2-4-regularization-views"
        After = "Зачем нужна регуляризация"
        Title = "Три взгляда на регуляризацию"
        Paragraphs = @(
          "Регуляризацию можно понимать одновременно как ограничение сложности, как prior на параметры и как стабилизатор оптимизации. В инженерном смысле она говорит модели: не используй слишком резкие объяснения, если более спокойное объяснение почти так же хорошо описывает данные.",
          "Это особенно важно при шумных признаках, малом числе объектов, высокой размерности и коррелированных колонках. Без регуляризации модель может выбрать большой коэффициент не потому, что признак полезен, а потому что случайно совпал с train."
        )
        Items = @(
          "Геометрический взгляд: ограничиваем область допустимых весов.",
          "Вероятностный взгляд: задаём prior, какие веса считаем правдоподобными.",
          "Оптимизационный взгляд: улучшаем устойчивость решения и conditioning."
        )
      },
      @{
        Id = "2-4-l1-l2-geometry"
        After = "Почему Lasso зануляет"
        Title = "Почему форма ограничения меняет решение"
        Paragraphs = @(
          "L2-шар гладкий, поэтому оптимум чаще касается ограничения в точке, где оба коэффициента остаются ненулевыми. L1-ромб имеет углы на осях, и линия уровня loss часто впервые касается именно угла. Угол означает, что один из коэффициентов стал ровно нулём.",
          "Это не магия Lasso, а геометрическое следствие формы penalty. Поэтому L1 хорошо делает feature selection, но при сильной корреляции признаков может выбрать один из нескольких похожих признаков довольно произвольно."
        )
        Items = @(
          "Ridge распределяет вес между коррелированными признаками.",
          "Lasso склонен выбирать один признак и занулять другие.",
          "Elastic Net полезен, когда нужна sparsity, но признаки группами коррелированы."
        )
      },
      @{
        Id = "2-4-lambda-prior"
        After = "Связь с MAP"
        Title = "λ как сила доверия prior"
        Paragraphs = @(
          "В MAP-интерпретации λ управляет тем, насколько сильно мы верим prior по сравнению с данными. Маленькая λ говорит: данные важнее, пусть веса растут, если это снижает loss. Большая λ говорит: большие веса подозрительны, даже если train становится лучше.",
          "Это объясняет, почему λ нельзя выбирать по train loss. Чем выше λ, тем больше bias и меньше variance; оптимальное значение находится только через validation."
        )
        Items = @(
          "Gaussian prior приводит к L2/Ridge.",
          "Laplace prior приводит к L1/Lasso.",
          "Validation выбирает баланс между prior и likelihood."
        )
      }
    )
  },
  @{
    File = "02_classic_ml/05_logistic_regression.html"
    Inserts = @(
      @{
        Id = "2-5-discriminative"
        After = "Что такое логистическая регрессия"
        Title = "Logistic regression моделирует границу через вероятность"
        Paragraphs = @(
          "Логистическая регрессия — discriminative model: она не пытается описать, как вообще генерируются признаки внутри каждого класса. Она напрямую моделирует P(y=1|x), то есть вероятность метки при уже наблюдаемых признаках.",
          "Это делает модель простой и сильной для baseline: коэффициенты задают направление изменения log-odds, sigmoid переводит score в вероятность, а threshold превращает вероятность в действие."
        )
        Items = @(
          "Score z отвечает за линейную геометрию.",
          "Sigmoid отвечает за вероятностную шкалу.",
          "Threshold отвечает за бизнес-решение и цену ошибок."
        )
      },
      @{
        Id = "2-5-proper-scoring"
        After = "Binary cross-entropy"
        Title = "BCE — это не просто штраф, а proper scoring rule"
        Paragraphs = @(
          "Binary cross-entropy поощряет модель говорить честные вероятности. Если реальная частота события около 70%, минимальный ожидаемый BCE достигается около прогноза 0.7, а не около произвольного уверенного класса.",
          "Поэтому BCE полезен не только для классификации, но и для calibration. Модель с хорошей accuracy может быть плохо откалибрована: она угадывает класс, но её вероятности нельзя использовать как риск."
        )
        Items = @(
          "Accuracy оценивает дискретное решение.",
          "BCE оценивает качество вероятности.",
          "Calibration проверяет, совпадает ли уверенность модели с реальной частотой."
        )
      },
      @{
        Id = "2-5-threshold-cost"
        After = "Как из вероятности получается класс"
        Title = "Threshold должен зависеть от цены ошибок"
        Paragraphs = @(
          "Порог 0.5 не является законом природы. Он разумен только если классы примерно сбалансированы и ошибки FP/FN стоят одинаково. В медицине, fraud detection или churn prediction цена пропуска события часто намного выше цены ложной тревоги.",
          "Поэтому logistic regression лучше разделять на две части: модель оценивает вероятность, а отдельное decision rule выбирает threshold под метрику, бюджет, risk appetite или business cost."
        )
        Items = @(
          "Высокий threshold уменьшает FP, но увеличивает FN.",
          "Низкий threshold повышает recall, но может ухудшить precision.",
          "Выбор threshold нужно делать на validation, а не на test."
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
    $block = New-DeepeningBlock $insert
    $html = Add-AfterCardHeading $html $insert.After $block
  }

  Set-Content -LiteralPath $path -Value $html -Encoding UTF8
  Write-Host "$($page.File): deepening blocks inserted"
  $updated += 1
}

Write-Host "Classic ML 2.1-2.5 deepening updated: $updated files"

