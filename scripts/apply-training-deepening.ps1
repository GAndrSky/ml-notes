$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Web

$root = Split-Path -Parent $PSScriptRoot

function HtmlText {
  param([string]$Text)
  return [System.Web.HttpUtility]::HtmlEncode($Text)
}

function Remove-DeepeningBlocks {
  param([string]$Html)
  return [regex]::Replace($Html, '(?is)\s*<!-- training-deepening:start:[^>]+ -->.*?<!-- training-deepening:end -->\s*', "`r`n")
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

<!-- training-deepening:start:$id -->
  <section class="concept-walkthrough" data-training-deepening="$id">
    <div class="concept-walkthrough__kicker">Теория глубже</div>
    <h3>$title</h3>
$($paragraphs -join "`r`n")
$list
  </section>
<!-- training-deepening:end -->
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

$pages = @()

$pages += @(
  @{
    File = "04_training/01_backpropagation.html"
    Inserts = @(
      @{
        Id = "4-1-backprop-as-credit-assignment"
        After = "Идея в одной фразе"
        Title = "Backprop решает задачу распределения ответственности"
        Paragraphs = @(
          "Forward pass строит prediction, а backprop отвечает на другой вопрос: какие промежуточные решения внутри сети больше всего виноваты в loss. Это credit assignment problem. Без него мы знали бы только итоговую ошибку, но не знали бы, какие веса менять.",
          "Backprop эффективен потому, что переиспользует локальные производные и проходит граф один раз назад. Он не перебирает каждый параметр отдельно, а передаёт один градиентный сигнал через всю композицию функций."
        )
        Items = @(
          "Локальная производная говорит, как узел реагирует на свой вход.",
          "Upstream gradient говорит, насколько итоговый loss чувствителен к выходу узла.",
          "Их произведение даёт вклад узла в ошибку всей сети."
        )
      },
      @{
        Id = "4-1-vjp-efficiency"
        After = "Векторный случай"
        Title = "VJP важнее полного Якобиана в реальных сетях"
        Paragraphs = @(
          "Полный Jacobian может быть огромным: выходов и входов у слоя тысячи или миллионы. Backprop почти никогда не строит его явно. Вместо этого он умножает incoming gradient на Jacobian локальной операции: это vector-Jacobian product.",
          "Такой подход экономит память и вычисления. Autograd хранит граф операций forward pass, а затем вызывает для каждой операции локальное правило backward, которое возвращает нужные VJP."
        )
        Items = @(
          "Jacobian описывает все локальные чувствительности.",
          "VJP берёт только то направление, которое нужно текущему loss.",
          "Reverse-mode autodiff подходит для моделей с миллионами параметров и скалярным loss."
        )
      },
      @{
        Id = "4-1-activation-mask"
        After = "Градиенты через функции активации"
        Title = "Активация фильтрует не только forward-сигнал, но и gradient flow"
        Paragraphs = @(
          "Если ReLU в forward pass обнулила отрицательный z, то в backward pass она также блокирует градиент через этот путь. Поэтому mask активации фактически решает, какие нейроны участвовали в обучении на данном batch.",
          "Для гладких активаций вроде GELU и SiLU блокировка мягче. Они могут передавать небольшой сигнал даже в отрицательной области, что иногда делает обучение стабильнее на глубоких сетях."
        )
        Items = @(
          "ReLU создаёт жёсткую бинарную маску.",
          "Sigmoid и tanh могут гасить градиент через saturation.",
          "GELU и SiLU дают более плавный gradient gate."
        )
      },
      @{
        Id = "4-1-debugging-backward"
        After = "Реализация"
        Title = "Backprop нужно отлаживать по нормам градиентов"
        Paragraphs = @(
          "Если loss не учится, смотреть только на значение loss недостаточно. Нужно проверить, доходят ли градиенты до ранних слоёв, не стали ли они нулевыми, не взорвались ли они и не блокирует ли их случайный detach.",
          "Практический debugging начинается с gradient norms по слоям, проверки requires_grad, отсутствия in-place ошибок и сравнения train/eval режимов. Это быстрее, чем менять архитектуру вслепую."
        )
        Items = @(
          "Нулевые gradient norms часто означают detach, saturation или dead ReLU.",
          "Очень большие norms указывают на exploding gradients или слишком высокий lr.",
          "Разные нормы по слоям помогают увидеть, где именно ломается gradient flow."
        )
      }
    )
  },
  @{
    File = "04_training/02_optimizers.html"
    Inserts = @(
      @{
        Id = "4-2-optimizer-as-dynamical-system"
        After = "Общая задача оптимизации"
        Title = "Optimizer задаёт динамику движения по loss surface"
        Paragraphs = @(
          "Один и тот же gradient можно использовать по-разному. SGD делает прямой шаг против градиента, momentum добавляет инерцию, Adam нормирует шаг через историю первого и второго моментов. Поэтому optimizer - это не техническая деталь, а правило движения по сложному рельефу loss.",
          "В глубоких сетях loss surface плохо обусловлена: в одних направлениях кривизна большая, в других маленькая. Хороший optimizer помогает двигаться быстрее по длинным долинам и осторожнее по резким направлениям."
        )
        Items = @(
          "lr задаёт базовую длину шага.",
          "momentum сглаживает направление движения.",
          "adaptive methods меняют шаг отдельно для разных параметров."
        )
      },
      @{
        Id = "4-2-sgd-noise"
        After = "SGD"
        Title = "Шум mini-batch gradient может помогать обучению"
        Paragraphs = @(
          "SGD использует приближённый градиент по mini-batch, а не точный градиент по всему датасету. Это добавляет шум, но шум не всегда вреден: он может помогать выходить из резких локальных областей и улучшать generalization.",
          "Слишком маленький batch делает обучение нестабильным, слишком большой может требовать lr scaling и хуже исследовать поверхность. Поэтому batch size и learning rate нужно рассматривать как связанную пару."
        )
        Items = @(
          "Маленький batch: больше шума, дешевле шаг, нестабильнее оценка.",
          "Большой batch: стабильнее gradient estimate, выше memory cost.",
          "При увеличении batch часто нужно пересматривать learning rate и warmup."
        )
      },
      @{
        Id = "4-2-momentum-valley"
        After = "Momentum"
        Title = "Momentum подавляет колебания поперёк ущелья"
        Paragraphs = @(
          "В узком овраге loss gradient часто меняет знак поперёк долины и остаётся более согласованным вдоль долины. Momentum накапливает согласованную часть движения и усредняет поперечные колебания.",
          "Поэтому momentum ускоряет движение в стабильном направлении, но может overshoot, если lr слишком большой или loss surface резко меняется. Это причина, почему lr и momentum нельзя тюнить полностью независимо."
        )
        Items = @(
          "Большой momentum ускоряет движение, но повышает риск перелёта.",
          "Маленький momentum ближе к обычному SGD.",
          "Warmup может снизить риск раннего overshoot."
        )
      },
      @{
        Id = "4-2-scheduler-control"
        After = "Learning Rate Scheduling"
        Title = "Scheduler управляет фазами обучения"
        Paragraphs = @(
          "В начале обучения нужен достаточно большой шаг, чтобы быстро найти рабочую область параметров. Ближе к концу нужен меньший шаг, чтобы не прыгать вокруг хорошего решения. Scheduler формализует эту смену режимов.",
          "Warmup особенно важен для больших моделей: optimizer states ещё не накопили статистику, initialization может давать нестабильные activations, а большой lr в первые шаги легко разрушает представления."
        )
        Items = @(
          "Warmup защищает ранние шаги.",
          "Decay или cosine annealing стабилизируют финальную донастройку.",
          "Restart или OneCycle могут помочь выйти из плохой траектории."
        )
      }
    )
  },
  @{
    File = "04_training/03_adam_adamw_lion.html"
    Inserts = @(
      @{
        Id = "4-3-adam-preconditioner"
        After = "Adam — полный"
        Title = "Adam можно читать как диагональный preconditioner"
        Paragraphs = @(
          "Adam делит направление первого момента на корень второго момента. Практически это означает: параметры с исторически большими градиентами получают меньший effective step, а параметры с малыми градиентами - относительно больший.",
          "Это похоже на грубое приближение к адаптации под локальную геометрию loss. Adam не строит Hessian, но использует статистику градиентов как дешёвый proxy масштаба."
        )
        Items = @(
          "m отвечает за сглаженное направление.",
          "v отвечает за масштаб и шумность параметра.",
          "epsilon защищает от деления на ноль и влияет на очень малые v."
        )
      },
      @{
        Id = "4-3-bias-correction-cold-start"
        After = "Adam step"
        Title = "Bias correction исправляет холодный старт EMA"
        Paragraphs = @(
          "EMA в Adam стартует с нуля. В первые шаги m и v искусственно занижены, потому что история ещё не накопилась. Bias correction делит их на фактор, который учитывает, сколько памяти уже реально заполнено.",
          "Без этой поправки первые шаги Adam были бы плохо масштабированы. Чем дальше обучение, тем меньше correction влияет, потому что beta^t стремится к нулю."
        )
        Items = @(
          "На ранних шагах correction заметна.",
          "На поздних шагах Adam ведёт себя как обычная EMA-адаптация.",
          "Проблемы early training часто связаны не только с Adam, но и с lr/warmup."
        )
      },
      @{
        Id = "4-3-adamw-decoupling"
        After = "AdamW"
        Title = "AdamW отделяет shrinkage весов от адаптивного градиентного шага"
        Paragraphs = @(
          "В SGD L2 regularization и weight decay почти совпадают по эффекту. В Adam это ломается, потому что градиент L2 проходит через адаптивное деление на sqrt(v). В итоге разные параметры получают разный decay, зависящий от optimizer state.",
          "AdamW применяет weight decay напрямую к весам, отдельно от gradient update. Это делает регуляризацию более предсказуемой и обычно лучше работает для современных deep learning моделей."
        )
        Items = @(
          "Adam + L2 смешивает decay с адаптивным масштабированием.",
          "AdamW делает decay как отдельное уменьшение весов.",
          "Bias и norm-параметры часто исключают из weight decay."
        )
      },
      @{
        Id = "4-3-lion-sign"
        After = "Lion"
        Title = "Lion использует знак update и поэтому меняет смысл lr"
        Paragraphs = @(
          "Lion делает шаг по sign сглаженного направления, а не по величине адаптивно нормированного градиента как Adam. Это уменьшает память optimizer state, но делает learning rate и weight decay более чувствительными.",
          "Поскольку magnitude update почти дискретизируется до знака, scale градиента влияет меньше, а направление и стабильность momentum становятся важнее. На практике Lion часто требует меньший lr, чем AdamW."
        )
        Items = @(
          "Плюс: меньше optimizer memory.",
          "Риск: чувствительность к lr и weight decay.",
          "Проверять нужно на конкретной архитектуре, а не заменять AdamW автоматически."
        )
      }
    )
  }
)

$pages += @(
  @{
    File = "04_training/04_regularization.html"
    Inserts = @(
      @{
        Id = "4-4-regularization-as-prior"
        After = "Почему возникает переобучение"
        Title = "Регуляризация добавляет предпочтение к более простым решениям"
        Paragraphs = @(
          "Переобучение возникает, когда модель использует лишнюю свободу, чтобы подстроиться под случайные детали train set. Регуляризация не просто ухудшает train score ради порядка; она задаёт inductive bias: какие функции считаются более правдоподобными до наблюдения validation.",
          "В вероятностном смысле L2 похожа на Gaussian prior на веса, L1 - на sparse prior, dropout - на усреднение множества подсетей. Разные техники ограничивают модель разными способами."
        )
        Items = @(
          "Weight decay ограничивает масштаб весов.",
          "Dropout снижает co-adaptation нейронов.",
          "Normalization стабилизирует распределения активаций и градиентов."
        )
      },
      @{
        Id = "4-4-weight-decay-function-smoothness"
        After = "Weight Decay"
        Title = "Малые веса часто означают более гладкую функцию"
        Paragraphs = @(
          "Штраф на большие веса ограничивает чувствительность модели к входам. Если веса огромные, маленькое изменение признака может резко изменить output. Weight decay мягко толкает модель к решениям, где prediction меняется спокойнее.",
          "Но decay не должен применяться механически ко всем параметрам. Для bias, BatchNorm/LayerNorm scale и некоторых embedding-параметров decay может вредить, потому что их роль не равна обычным весам линейного слоя."
        )
        Items = @(
          "Слишком маленький decay почти не влияет.",
          "Слишком большой decay вызывает underfit.",
          "AdamW обычно предпочтительнее Adam + L2 для deep learning."
        )
      },
      @{
        Id = "4-4-dropout-ensemble"
        After = "Dropout"
        Title = "Dropout обучает сеть не зависеть от одного маршрута"
        Paragraphs = @(
          "Во время training dropout случайно отключает часть активаций. Это заставляет сеть распределять информацию по нескольким маршрутам, а не строить хрупкую цепочку, где один нейрон решает всё.",
          "Dropout особенно полезен в fully-connected слоях и больших моделях с ограниченным датасетом. В современных архитектурах с normalization, residual connections и большим объёмом данных его сила часто ниже, чем раньше."
        )
        Items = @(
          "Training mode включает dropout.",
          "Eval mode отключает dropout и использует полную сеть.",
          "Слишком высокий dropout может уничтожить полезный сигнал."
        )
      },
      @{
        Id = "4-4-normalization-axes"
        After = "Batch Normalization"
        Title = "Normalization выбирает ось, по которой стабилизирует статистику"
        Paragraphs = @(
          "BatchNorm использует статистику batch-а, поэтому хорошо работает в CNN и больших batch-ах, но может быть нестабилен при маленьких batch или distribution shift. LayerNorm нормирует внутри одного объекта, поэтому не зависит от batch statistics и удобен для Transformer.",
          "Нормализация не только регуляризует. Она меняет conditioning задачи оптимизации: градиенты становятся более управляемыми, а сеть меньше зависит от масштаба промежуточных активаций."
        )
        Items = @(
          "BatchNorm: статистика по batch и spatial dimensions.",
          "LayerNorm: статистика по feature dimension внутри объекта.",
          "RMSNorm: упрощённая нормировка без вычитания среднего."
        )
      }
    )
  },
  @{
    File = "04_training/05_learning_rate_scheduling.html"
    Inserts = @(
      @{
        Id = "4-5-lr-as-energy"
        After = "Почему одного фиксированного"
        Title = "Learning rate задаёт энергию движения optimizer"
        Paragraphs = @(
          "Слишком маленький lr делает обучение медленным и может застревать в слабых областях. Слишком большой lr разрушает уже найденные представления и создаёт loss spikes. Scheduler нужен потому, что оптимальный масштаб шага меняется по ходу обучения.",
          "В начале модель далека от хорошего решения и может двигаться грубее. В конце маленькие изменения параметров уже важны, поэтому шаг нужно уменьшать, чтобы не шуметь вокруг минимума."
        )
        Items = @(
          "Большой lr быстрее исследует пространство, но нестабилен.",
          "Малый lr точнее донастраивает, но медленнее.",
          "Scheduler превращает один lr в траекторию шагов."
        )
      },
      @{
        Id = "4-5-warmup-protects-stats"
        After = "Warmup"
        Title = "Warmup защищает модель, пока статистики ещё не стабилизировались"
        Paragraphs = @(
          "В первые шаги optimizer states пустые, normalization statistics ещё грубые, а random initialization может давать нестабильные activation scales. Если сразу дать большой lr, модель может уйти в плохую область до того, как training станет информативным.",
          "Warmup постепенно увеличивает lr и даёт optimizer время накопить статистику. Особенно это важно для Transformer, больших batch-ей и mixed precision."
        )
        Items = @(
          "Warmup слишком короткий: ранние spikes.",
          "Warmup слишком длинный: медленный старт.",
          "Обычно warmup настраивают как долю от общего числа training steps."
        )
      },
      @{
        Id = "4-5-cosine-annealing"
        After = "Cosine annealing"
        Title = "Cosine annealing делает плавный переход от поиска к уточнению"
        Paragraphs = @(
          "Cosine schedule уменьшает lr без резких скачков. Это полезно, когда хочется сначала активно исследовать loss surface, а затем постепенно перейти к тонкой настройке.",
          "В отличие от step decay, cosine не создаёт внезапных переломов в динамике optimizer. Это часто даёт более стабильные кривые loss, особенно в больших deep learning training runs."
        )
        Items = @(
          "Высокий lr в начале помогает исследованию.",
          "Плавное снижение уменьшает шум в финале.",
          "Минимальный lr не всегда должен быть нулём."
        )
      },
      @{
        Id = "4-5-onecycle"
        After = "OneCycleLR"
        Title = "OneCycle использует временно высокий lr как контролируемый стресс"
        Paragraphs = @(
          "OneCycleLR сначала повышает lr, затем резко снижает его к концу. Высокая фаза может помочь выйти из узких резких областей, а финальная низкая фаза стабилизирует решение.",
          "Этот режим требует аккуратного max_lr. Если он слишком высокий, модель не получает полезный стресс, а просто разваливается. Поэтому lr finder или небольшой pilot run здесь особенно полезны."
        )
        Items = @(
          "max_lr - главный параметр риска.",
          "pct_start задаёт длину фазы роста.",
          "Финальная фаза часто работает как aggressive annealing."
        )
      }
    )
  },
  @{
    File = "04_training/06_gradient_clipping_and_stability.html"
    Inserts = @(
      @{
        Id = "4-6-exploding-product"
        After = "Откуда берутся exploding"
        Title = "Exploding gradients часто возникают как произведение многих Jacobian"
        Paragraphs = @(
          "В глубокой или рекуррентной сети backprop умножает сигнал ошибки на множество локальных производных. Если их эффективные нормы часто больше единицы, общий gradient может расти экспоненциально по глубине или длине последовательности.",
          "Clipping не исправляет причину плохого conditioning, но ограничивает максимальный шаг optimizer. Это похоже на ремень безопасности: он не улучшает дорогу, но предотвращает катастрофу при резком рывке."
        )
        Items = @(
          "Длинные sequence усиливают риск exploding gradients.",
          "Плохая initialization может сделать Jacobian слишком большим.",
          "Слишком высокий lr превращает большой gradient в разрушительный update."
        )
      },
      @{
        Id = "4-6-clip-norm-vs-value"
        After = "Clip by norm"
        Title = "Clip by norm сохраняет направление градиента лучше, чем clip by value"
        Paragraphs = @(
          "Clip by value обрезает каждую координату отдельно и может сильно изменить направление gradient vector. Clip by norm масштабирует весь gradient, если его общая длина превышает threshold, поэтому направление сохраняется лучше.",
          "Для deep learning чаще используют global norm clipping, особенно в RNN, Transformer и sequence задачах. Но threshold нельзя выбирать вслепую: слишком низкий threshold превращает обучение в постоянное недошагивание."
        )
        Items = @(
          "clip_grad_value_ ограничивает отдельные координаты.",
          "clip_grad_norm_ ограничивает общую норму.",
          "Логируй gradient norm до clipping, чтобы понимать, как часто clipping срабатывает."
        )
      },
      @{
        Id = "4-6-stability-stack"
        After = "Clipping — только"
        Title = "Стабильность - это стек мер, а не одна настройка"
        Paragraphs = @(
          "Если обучение регулярно взрывается, clipping может скрыть симптом, но не решить проблему. Нужно проверить initialization, lr schedule, normalization, mixed precision, loss implementation и качество данных.",
          "Хороший debugging строится от дешёвых проверок к дорогим: сначала NaN/Inf, gradient norms, lr, batch statistics; затем архитектура, scaling данных и optimizer state."
        )
        Items = @(
          "Clipping помогает пережить редкие spikes.",
          "Постоянный clipping почти каждый шаг говорит о слишком агрессивном режиме.",
          "NaN нужно ловить сразу, иначе optimizer state тоже может испортиться."
        )
      }
    )
  }
)

$pages += @(
  @{
    File = "04_training/07_mixed_precision_training.html"
    Inserts = @(
      @{
        Id = "4-7-throughput-memory"
        After = "Зачем вообще mixed"
        Title = "Mixed precision ускоряет обучение через память и tensor cores"
        Paragraphs = @(
          "Половинная точность уменьшает размер activations и временных буферов, поэтому в память помещается больший batch или более длинная sequence. На современных GPU FP16/BF16 операции также используют специализированные tensor cores.",
          "Но ускорение не бесплатно. Некоторые операции чувствительны к диапазону и точности, поэтому AMP автоматически оставляет часть вычислений в более стабильных форматах."
        )
        Items = @(
          "FP16/BF16 уменьшают memory footprint.",
          "Tensor Cores ускоряют matmul и convolution.",
          "Optimizer states часто остаются в FP32."
        )
      },
      @{
        Id = "4-7-fp16-bf16-range"
        After = "FP16 vs BF16"
        Title = "BF16 жертвует mantissa ради широкого диапазона exponent"
        Paragraphs = @(
          "FP16 имеет больше точности в mantissa, но значительно уже диапазон чисел. BF16 имеет меньшую точность, зато exponent похож на FP32, поэтому он реже ловит overflow и underflow.",
          "Для больших моделей BF16 часто удобнее и стабильнее, если hardware его поддерживает. FP16 может быть быстрее или доступнее, но чаще требует loss scaling."
        )
        Items = @(
          "FP16: выше риск underflow малых gradients.",
          "BF16: шире динамический диапазон, обычно меньше нуждается в scaling.",
          "FP32: медленнее и больше по памяти, но стабильнее."
        )
      },
      @{
        Id = "4-7-loss-scaling"
        After = "loss scaling"
        Title = "Loss scaling защищает маленькие градиенты от underflow"
        Paragraphs = @(
          "В FP16 маленькие gradient values могут округлиться до нуля. Loss scaling временно умножает loss на большой коэффициент, чтобы градиенты стали представимыми, а затем перед optimizer step делит их обратно.",
          "Dynamic scaler меняет scale автоматически: увеличивает, если всё стабильно, и уменьшает, если появляются Inf/NaN. Это делает FP16 training практичным без ручной настройки scale."
        )
        Items = @(
          "Scale применяется до backward.",
          "Unscale делается перед clipping и optimizer step.",
          "Если найден Inf/NaN, optimizer step пропускается."
        )
      },
      @{
        Id = "4-7-sensitive-ops"
        After = "Где mixed precision"
        Title = "Самые опасные места - softmax, reductions и logits-sensitive операции"
        Paragraphs = @(
          "Softmax, log, exp, variance, normalization и большие reductions чувствительны к переполнению и потере точности. Поэтому фреймворки часто считают их в FP32 или используют fused kernels.",
          "Если AMP ломает обучение, не нужно сразу отключать mixed precision полностью. Часто достаточно найти нестабильный участок, отключить autocast локально или заменить операцию на устойчивую версию."
        )
        Items = @(
          "Проверяй loss на Inf/NaN после каждого шага при debugging.",
          "Используй fused losses вместо ручных sigmoid/softmax + log.",
          "Для нестабильного блока можно временно использовать autocast(enabled=False)."
        )
      }
    )
  },
  @{
    File = "04_training/08_weight_initialization_deeper.html"
    Inserts = @(
      @{
        Id = "4-8-signal-propagation"
        After = "Почему инициализация"
        Title = "Инициализация задаёт начальный режим распространения сигнала"
        Paragraphs = @(
          "До первого шага optimizer сеть уже имеет динамику: activations проходят вперёд, gradients пойдут назад. Если variance активаций растёт по слоям, forward signal взрывается. Если variance убывает, сигнал исчезает ещё до обучения.",
          "Хорошая initialization пытается удержать масштаб activations и gradients примерно стабильным по глубине. Это не гарантирует качество, но даёт optimizer шанс начать обучение в рабочем диапазоне."
        )
        Items = @(
          "Слишком большие веса вызывают exploding activations.",
          "Слишком маленькие веса вызывают vanishing signal.",
          "Residual connections и normalization частично снижают чувствительность к initialization."
        )
      },
      @{
        Id = "4-8-xavier-assumption"
        After = "Xavier"
        Title = "Xavier предполагает примерно симметричные активации"
        Paragraphs = @(
          "Xavier/Glorot initialization выбирает scale так, чтобы variance сохранялась между входом и выходом слоя при линейных или tanh-like активациях. Она балансирует fan_in и fan_out, потому что важны и forward, и backward масштабы.",
          "Для ReLU это предположение хуже, потому что половина значений часто обнуляется. Поэтому ReLU-сетям обычно нужна другая поправка масштаба."
        )
        Items = @(
          "fan_in связан с числом входов нейрона.",
          "fan_out связан с числом выходных путей градиента.",
          "Xavier хорошо подходит для tanh/sigmoid-like сетей, но sigmoid всё равно может насыщаться."
        )
      },
      @{
        Id = "4-8-he-relu"
        After = "He / Kaiming"
        Title = "He initialization компенсирует обнуление ReLU"
        Paragraphs = @(
          "ReLU пропускает в среднем только положительную часть распределения. Это уменьшает variance активаций, поэтому He/Kaiming initialization использует больший scale, чтобы сохранить сигнал после ReLU.",
          "Если использовать слишком маленький scale с ReLU, глубокая сеть может начать почти мёртвой. Если scale слишком большой, появляются exploding activations и нестабильный loss."
        )
        Items = @(
          "Kaiming normal/uniform обычно выбирают для ReLU и LeakyReLU.",
          "Для GELU/SiLU часто работают похожие режимы, но architecture-specific defaults важны.",
          "После изменения activation полезно пересмотреть initialization."
        )
      },
      @{
        Id = "4-8-practical-diagnostics"
        After = "Практические следствия"
        Title = "Проверяй initialization через статистики activations"
        Paragraphs = @(
          "Самый быстрый sanity-check: сделать один forward pass до обучения и посмотреть mean/std activations по слоям. Если std быстро растёт или падает к нулю, optimizer будет бороться с плохим стартом.",
          "Для глубоких сетей полезно также смотреть gradient norms после первого backward. Если ранние слои получают почти ноль или огромные значения, проблема может быть в initialization, activation, normalization или lr."
        )
        Items = @(
          "Логируй activation mean/std по слоям.",
          "Проверяй долю нулей после ReLU.",
          "Смотри gradient norms до первого optimizer step."
        )
      }
    )
  },
  @{
    File = "04_training/09_numerical_stability.html"
    Inserts = @(
      @{
        Id = "4-9-finite-floats"
        After = "Почему это отдельная"
        Title = "Компьютер считает не вещественными числами, а конечной сеткой"
        Paragraphs = @(
          "Математическая формула может быть корректной, но её реализация в float может ломаться. У чисел есть конечный диапазон, конечная точность и округление. Поэтому две алгебраически эквивалентные записи могут вести себя по-разному в коде.",
          "Numerical stability - это умение записать вычисление так, чтобы важные отношения между числами сохранялись в доступном формате. В deep learning это критично, потому что ошибки повторяются миллионы раз за training run."
        )
        Items = @(
          "Overflow превращает слишком большое число в Inf.",
          "Underflow превращает слишком маленькое число в ноль.",
          "Cancellation теряет точность при вычитании близких чисел."
        )
      },
      @{
        Id = "4-9-format-choice"
        After = "FP32, FP16"
        Title = "Формат числа - это trade-off между скоростью, памятью и диапазоном"
        Paragraphs = @(
          "FP32 даёт хороший баланс точности и диапазона, но стоит больше памяти. FP16 быстрее и компактнее, но имеет узкий exponent. BF16 сохраняет широкий exponent, поэтому лучше переносит большие и маленькие значения, но имеет меньше точности в mantissa.",
          "Выбор формата влияет не только на скорость. Он меняет вероятность NaN, underflow gradients, unstable softmax и расхождение optimizer state."
        )
        Items = @(
          "FP32 удобен для стабильности и debugging.",
          "FP16 часто требует dynamic loss scaling.",
          "BF16 обычно предпочтителен для больших моделей при поддержке hardware."
        )
      },
      @{
        Id = "4-9-stable-softmax-why"
        After = "Stable softmax"
        Title = "Вычитание max сохраняет softmax, но убирает overflow"
        Paragraphs = @(
          "Softmax инвариантен к добавлению или вычитанию одной и той же константы из всех logits. Поэтому можно вычесть максимальный logit: самый большой exp станет exp(0)=1, а остальные будут меньше или равны единице.",
          "Это не меняет вероятности, потому что числитель и знаменатель масштабируются одинаково. Но вычисление становится безопаснее для float, особенно при больших logits."
        )
        Items = @(
          "Не считай exp(logits) напрямую для больших logits.",
          "Используй log_softmax или CrossEntropyLoss вместо ручного softmax + log.",
          "Проверяй logits distribution, если softmax становится слишком резким."
        )
      },
      @{
        Id = "4-9-debug-order"
        After = "Чек-лист отладки"
        Title = "Отладка NaN должна идти от источника, а не от последнего симптома"
        Paragraphs = @(
          "NaN часто появляется далеко от причины. Например, gradient overflow случился в backward, optimizer state испортился на step, а заметили это только на следующем forward. Поэтому нужно логировать промежуточные места: inputs, logits, loss, gradients, weights и optimizer step.",
          "Хорошая стратегия - временно включить anomaly detection, уменьшить lr, отключить AMP, проверить один batch и затем возвращать оптимизации по одной. Так легче найти минимальное условие, при котором ошибка появляется."
        )
        Items = @(
          "Сначала воспроизведи NaN на маленьком batch.",
          "Проверь данные: Inf, NaN, экстремальные значения, неправильные labels.",
          "Потом проверяй model forward, loss, backward, clipping и optimizer step отдельно."
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
  Write-Host "$($page.File): training deepening blocks inserted"
  $updated += 1
}

Write-Host "Training deepening updated: $updated files"

