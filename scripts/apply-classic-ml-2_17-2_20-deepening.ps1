$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Web

$root = Split-Path -Parent $PSScriptRoot

function HtmlText {
  param([string]$Text)
  return [System.Web.HttpUtility]::HtmlEncode($Text)
}

function Remove-DeepeningBlocks {
  param([string]$Html)
  return [regex]::Replace($Html, '(?is)\s*<!-- practical-ml-deepening:start:[^>]+ -->.*?<!-- practical-ml-deepening:end -->\s*', "`r`n")
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

<!-- practical-ml-deepening:start:$id -->
  <section class="concept-walkthrough" data-practical-ml-deepening="$id">
    <div class="concept-walkthrough__kicker">Теория глубже</div>
    <h3>$title</h3>
$($paragraphs -join "`r`n")
$list
  </section>
<!-- practical-ml-deepening:end -->
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
    File = "02_classic_ml/17_validation_and_hyperparameter_tuning.html"
    Inserts = @(
      @{
        Id = "2-17-validation-as-experiment"
        After = "Зачем вообще нужна валидация"
        Title = "Validation protocol - это дизайн эксперимента"
        Paragraphs = @(
          "Валидация отвечает не на вопрос «насколько модель хороша на этих данных», а на вопрос «что, вероятно, произойдёт с будущими объектами из того же процесса». Поэтому split должен имитировать будущий inference: время, группы пользователей, редкие классы, дубликаты и способ сбора данных.",
          "Если split не похож на реальный сценарий, метрика становится измерением удобства эксперимента, а не качества модели. В таком случае можно улучшать validation score и одновременно ухудшать реальный продукт."
        )
        Items = @(
          "Random split подходит только если будущие объекты действительно похожи на случайную подвыборку прошлого.",
          "Time split нужен, когда порядок времени влияет на распределение признаков и target.",
          "Group split нужен, когда один пользователь, пациент, товар или документ может появляться несколько раз."
        )
      },
      @{
        Id = "2-17-cv-estimator"
        After = "2\.17\.2 Cross-validation"
        Title = "Cross-validation оценивает среднее качество, но не отменяет uncertainty"
        Paragraphs = @(
          "K-fold CV уменьшает зависимость оценки от одного случайного split-а, но не превращает validation score в абсолютную истину. Fold-и могут быть коррелированы, данные могут иметь скрытые группы, а распределение будущего inference может отличаться от train.",
          "Поэтому полезно смотреть не только mean score, но и разброс по fold-ам. Большой разброс означает, что модель или validation protocol нестабильны: качество зависит от того, какие объекты попали в validation."
        )
        Items = @(
          "Mean CV score показывает ожидаемый уровень качества.",
          "Std по fold-ам показывает устойчивость оценки.",
          "Очень маленький validation set даёт шумную оценку даже при хорошем алгоритме."
        )
      },
      @{
        Id = "2-17-hpo-overfits"
        After = "Hyperparameter search"
        Title = "HPO тоже переобучается на validation"
        Paragraphs = @(
          "Каждый запуск grid search, random search или Bayesian optimization смотрит на validation score и выбирает лучший вариант. Если перебрать достаточно много вариантов, часть улучшений будет случайной. Это такой же selection bias, как выбор лучшей модели по test set.",
          "Чем больше гиперпараметров и чем шумнее validation, тем выше риск выбрать конфигурацию, которая победила случайно. Поэтому финальный test должен оставаться нетронутым, а для дорогих решений используют nested CV или отдельный holdout после HPO."
        )
        Items = @(
          "Не используй test set для выбора гиперпараметров.",
          "Фиксируй search space заранее, иначе эксперимент начинает подгоняться под результат.",
          "Сравнивай best score с простым baseline, а не только с соседними настройками."
        )
      },
      @{
        Id = "2-17-leakage-protocol"
        After = "2\.17\.6 Leakage"
        Title = "Leakage чаще возникает в preprocessing, а не в модели"
        Paragraphs = @(
          "Модель редко получает target напрямую. Чаще leakage появляется раньше: scaler обучили на всех данных, target encoding посчитали до split-а, oversampling сделали до CV, дубликаты пользователя попали и в train, и в validation.",
          "Практическое правило: всё, что учится по данным, должно учиться только внутри train-fold-а. Validation-fold должен проходить через уже обученный transformer как будущий новый объект."
        )
        Items = @(
          "fit_transform применяется на train, transform - на validation.",
          "Feature selection должна быть внутри CV, если она смотрит на target.",
          "Sampling и target encoding тоже должны жить внутри pipeline."
        )
      }
    )
  },
  @{
    File = "02_classic_ml/18_imbalanced_classes.html"
    Inserts = @(
      @{
        Id = "2-18-prior-utility"
        After = "Почему imbalance"
        Title = "Imbalance меняет prior и цену действия"
        Paragraphs = @(
          "Редкий класс создаёт две разные проблемы. Первая - статистическая: positive examples мало, поэтому модель хуже видит их разнообразие. Вторая - decision problem: даже правильная вероятность может требовать другого threshold, потому что цена false negative и false positive несимметрична.",
          "Поэтому imbalance нельзя лечить только oversampling или class_weight. Нужно отдельно решить, хотим ли мы улучшить ranking, calibration, recall редкого класса или бизнес-стоимость решений."
        )
        Items = @(
          "Ranking отвечает: кого поднять выше в списке риска.",
          "Calibration отвечает: можно ли доверять вероятности.",
          "Threshold отвечает: когда превращать score в действие."
        )
      },
      @{
        Id = "2-18-accuracy-baseline"
        After = "2\.18\.1 Почему accuracy"
        Title = "Accuracy при imbalance надо сравнивать с тупым baseline"
        Paragraphs = @(
          "Если positive class составляет 1%, модель, которая всегда говорит negative, уже получает 99% accuracy. Это не качество, а отражение base rate. Поэтому высокая accuracy без confusion matrix ничего не доказывает.",
          "Нужно смотреть, какую часть редкого класса модель реально находит и сколько ложных тревог создаёт. В реальных задачах часто важен не один threshold, а вся PR-кривая или top-k качество."
        )
        Items = @(
          "Baseline accuracy равен доле majority class.",
          "Recall показывает, сколько редких событий найдено.",
          "Precision показывает, сколько найденных тревог действительно полезны."
        )
      },
      @{
        Id = "2-18-weights-vs-threshold"
        After = "2\.18\.2 Class weights"
        Title = "Class weights и threshold решают разные задачи"
        Paragraphs = @(
          "Class weights меняют обучение: ошибки minority class становятся дороже внутри loss, и модель пытается сдвинуть boundary. Threshold tuning меняет только правило принятия решения после обучения. Эти методы похожи по эффекту на confusion matrix, но работают на разных этапах.",
          "Если модель хорошо ранжирует объекты, иногда достаточно подобрать threshold. Если модель вообще не учится видеть minority class, нужны веса, sampling, новые признаки или другая модель."
        )
        Items = @(
          "Class weights влияют на параметры модели.",
          "Threshold влияет на действие, но не на learned representation.",
          "После class weights вероятности могут хуже калиброваться, поэтому calibration стоит проверить отдельно."
        )
      },
      @{
        Id = "2-18-sampling-inside-cv"
        After = "Что важно при sampling"
        Title = "Sampling должен происходить внутри cross-validation"
        Paragraphs = @(
          "Oversampling, undersampling и SMOTE нельзя делать до train/validation split. Если синтетические или дублированные точки попадут в validation, модель будет проверяться на данных, которые частично видела во время обучения.",
          "Правильная схема: split сначала, sampling только на train-fold-е, validation остаётся в естественном распределении. Так метрика показывает поведение на реальных будущих данных, а не на искусственно сбалансированной проверке."
        )
        Items = @(
          "SMOTE до CV создаёт leakage через соседей.",
          "Validation distribution должен отражать реальную частоту классов.",
          "Sampling лучше оформлять как шаг imbalanced-learn Pipeline."
        )
      }
    )
  },
  @{
    File = "02_classic_ml/19_model_interpretation.html"
    Inserts = @(
      @{
        Id = "2-19-model-not-world"
        After = "Зачем вообще нужна интерпретация"
        Title = "Интерпретация объясняет поведение модели, а не причинность мира"
        Paragraphs = @(
          "Если SHAP, permutation importance или коэффициент говорит, что признак важен, это означает важность для конкретной обученной модели на конкретном распределении данных. Это не доказывает, что признак причинно влияет на target в реальности.",
          "Причинный вывод требует другого дизайна: экспериментов, инструментальных переменных, causal graphs или сильных assumptions. Интерпретация ML полезна для debugging, доверия и коммуникации, но её нельзя автоматически превращать в бизнес-причину."
        )
        Items = @(
          "Model explanation: почему модель дала такой prediction.",
          "Data explanation: какие паттерны есть в датасете.",
          "Causal explanation: что изменит outcome при вмешательстве."
        )
      },
      @{
        Id = "2-19-coefficients-scale"
        After = "2\.19\.1 Коэффициенты"
        Title = "Коэффициенты читаются только вместе с масштабом признаков"
        Paragraphs = @(
          "Большой коэффициент не всегда означает большую практическую важность. Если признак измеряется в тысячах, его коэффициент может быть маленьким, но вклад в prediction большим. Если признаки стандартизированы, коэффициенты становятся сравнимее.",
          "Для логистической регрессии коэффициент живёт в log-odds пространстве. Его удобно переводить через exp(coef): это multiplicative change odds при увеличении признака на одну единицу."
        )
        Items = @(
          "Перед сравнением коэффициентов проверь scaling.",
          "Знак коэффициента показывает направление связи в модели.",
          "Коррелированные признаки делят вклад нестабильно."
        )
      },
      @{
        Id = "2-19-correlated-features"
        After = "Коррелированные признаки"
        Title = "Корреляции делают attribution нестабильной"
        Paragraphs = @(
          "Когда два признака несут один и тот же сигнал, модель может использовать любой из них или разделить вклад между ними. Тогда permutation importance, коэффициенты и SHAP могут показывать разные истории, хотя predictive quality почти не меняется.",
          "Это не баг конкретного метода, а неоднозначность объяснения. Если признаки взаимозаменяемы, вопрос «какой признак важен» становится плохо определённым без группировки признаков или domain constraints."
        )
        Items = @(
          "Смотри correlation matrix и feature clusters перед интерпретацией.",
          "Групповая permutation importance часто честнее одиночной.",
          "Не делай вывод о неважности признака, если его копия остаётся в данных."
        )
      },
      @{
        Id = "2-19-pdp-shap-assumptions"
        After = "2\.19\.5 SHAP"
        Title = "PDP, permutation и SHAP отвечают на разные вопросы"
        Paragraphs = @(
          "PDP показывает среднее изменение prediction при искусственном изменении признака, но может создавать нереалистичные комбинации признаков. Permutation importance измеряет падение качества при разрушении признака, но страдает от корреляций. SHAP раскладывает prediction на вклады, но результат зависит от background distribution и assumptions о зависимости признаков.",
          "Поэтому хорошая интерпретация обычно использует несколько методов. Если они противоречат друг другу, это сигнал не выбрать любимый график, а проверить данные, корреляции и устойчивость модели."
        )
        Items = @(
          "PDP: средний эффект признака на prediction.",
          "Permutation: насколько качество падает без нормального признака.",
          "SHAP: как конкретный prediction раскладывается относительно baseline."
        )
      }
    )
  },
  @{
    File = "02_classic_ml/20_practical_pipeline.html"
    Inserts = @(
      @{
        Id = "2-20-pipeline-protocol"
        After = "Зачем нужен практический pipeline"
        Title = "Pipeline нужен, чтобы эксперимент был воспроизводимым объектом"
        Paragraphs = @(
          "В реальном ML модель - это не только estimator.fit(). Это порядок split-а, preprocessing, feature engineering, sampling, model selection, threshold tuning и evaluation. Если эти шаги живут отдельно в notebook cells, эксперимент легко становится нереплицируемым.",
          "Pipeline превращает процесс в один объект с явной границей между fit и transform. Это снижает leakage, упрощает CV и делает production-поведение ближе к validation-поведению."
        )
        Items = @(
          "fit учится только на train.",
          "transform применяет уже выученные правила к validation/test/inference.",
          "Одинаковый pipeline должен обслуживать training и inference."
        )
      },
      @{
        Id = "2-20-framing"
        After = "2\.20\.1 Постановка задачи"
        Title = "Framing определяет метрику, данные и допустимые ошибки"
        Paragraphs = @(
          "До выбора модели нужно решить, что именно считается правильным действием. Одну и ту же проблему можно поставить как regression, binary classification, ranking, anomaly detection или forecasting. От framing зависит target, split, metric и способ принятия решения.",
          "Плохой framing нельзя исправить мощной моделью. Если target запаздывает, labels шумные или метрика не связана с реальной стоимостью ошибок, pipeline будет оптимизировать неправильную цель."
        )
        Items = @(
          "Определи decision: что система должна сделать после prediction.",
          "Определи horizon: на какой момент времени нужен прогноз.",
          "Определи cost: какие ошибки дороже и почему."
        )
      },
      @{
        Id = "2-20-baseline-instrument"
        After = "2\.20\.3 Baseline"
        Title = "Baseline - это измерительный прибор, а не слабая модель для отчёта"
        Paragraphs = @(
          "Хороший baseline показывает, есть ли в задаче сигнал и насколько сложная модель вообще нужна. Он должен быть настолько простым, чтобы его поведение можно было объяснить: majority class, mean predictor, linear model, shallow tree или простая business rule.",
          "Если сложная модель не обгоняет baseline честно и стабильно, проблема может быть не в алгоритме, а в target, split, признаках или метрике. Baseline экономит время, потому что быстро выявляет слабые места постановки."
        )
        Items = @(
          "Baseline должен запускаться первым.",
          "Baseline должен проходить тот же validation protocol.",
          "Baseline нужен для сравнения не только score, но и сложности поддержки."
        )
      },
      @{
        Id = "2-20-evaluation-to-deployment"
        After = "2\.20\.6 Evaluation"
        Title = "Evaluation должна моделировать deployment decision"
        Paragraphs = @(
          "Offline metric полезна только если она связана с реальным действием системы. Для credit scoring важен threshold и cost ошибок, для рекомендаций - ranking и position bias, для fraud - top-k investigation capacity, для медицинской задачи - sensitivity при допустимом false positive rate.",
          "Поэтому evaluation часто включает несколько слоёв: техническую метрику модели, decision metric после threshold, segment analysis, stability over time и sanity-check ошибок. Один общий score скрывает слишком много рисков."
        )
        Items = @(
          "Смотри качество по сегментам, а не только среднее.",
          "Проверяй calibration, если prediction используется как probability.",
          "Проверяй drift и деградацию, если данные меняются во времени."
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
  Write-Host "$($page.File): practical ML deepening blocks inserted"
  $updated += 1
}

Write-Host "Classic ML 2.17-2.20 deepening updated: $updated files"

