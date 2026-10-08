$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

function ConvertTo-HtmlText {
  param([string]$Text)
  return [System.Net.WebUtility]::HtmlEncode($Text)
}

function New-Paragraphs {
  param([string[]]$Paragraphs)
  return (($Paragraphs | ForEach-Object { "      <p>$(ConvertTo-HtmlText $_)</p>" }) -join "`r`n")
}

function New-List {
  param([string[]]$Items)
  return (($Items | ForEach-Object { "            <li>$(ConvertTo-HtmlText $_)</li>" }) -join "`r`n")
}

function New-Card {
  param([string]$Title, [string[]]$Items)
  $safeTitle = ConvertTo-HtmlText $Title
  $list = New-List $Items
  return @"
        <article class="ml-advanced-card">
          <h3>$safeTitle</h3>
          <ul>
$list
          </ul>
        </article>
"@
}

function New-Note {
  param(
    [string]$Title,
    [string[]]$Paragraphs,
    [string[]]$Geometry,
    [string[]]$Probability,
    [string[]]$Optimization,
    [string[]]$Practice,
    [string]$Example
  )
  return @{
    Title = $Title
    Paragraphs = $Paragraphs
    Geometry = $Geometry
    Probability = $Probability
    Optimization = $Optimization
    Practice = $Practice
    Example = $Example
  }
}

function New-TheoryExpansion {
  param([hashtable]$Note)

  $title = ConvertTo-HtmlText $Note.Title
  $paragraphs = New-Paragraphs $Note.Paragraphs
  $geometry = New-Card "Геометрическая интуиция" $Note.Geometry
  $probability = New-Card "Вероятностная интерпретация" $Note.Probability
  $optimization = New-Card "Оптимизационный смысл" $Note.Optimization
  $practice = New-Card "Практика и типичные ошибки" $Note.Practice
  $example = ConvertTo-HtmlText $Note.Example

  return @"

<!-- theory-expansion:start -->
    <section class="concept-walkthrough theory-expansion" data-theory-expansion="1">
      <div class="concept-walkthrough__kicker">Теоретический слой</div>
      <h2>$title</h2>
$paragraphs
      <div class="ml-advanced-grid">
$geometry
$probability
$optimization
$practice
      </div>
      <p><strong>Мини-пример:</strong> $example</p>
    </section>
<!-- theory-expansion:end -->
"@
}

function Add-TheoryExpansion {
  param([string]$RelativePath, [hashtable]$Note)

  $fullPath = Join-Path $repoRoot $RelativePath
  if (-not (Test-Path -LiteralPath $fullPath)) {
    throw "Missing file: $RelativePath"
  }

  $html = Get-Content -LiteralPath $fullPath -Raw -Encoding UTF8
  if ($html.Contains('<!-- theory-expansion:start -->')) {
    Write-Host "Skip existing theory expansion: $RelativePath"
    return
  }

  $block = New-TheoryExpansion $Note
  $marker = '<!-- step1-learning:start -->'
  if ($html.Contains($marker)) {
    $html = $html.Replace($marker, $block + "`r`n" + $marker)
  } elseif ($html.Contains('</body>')) {
    $html = $html.Replace('</body>', $block + "`r`n</body>")
  } else {
    throw "Cannot find insertion point in $RelativePath"
  }

  Set-Content -LiteralPath $fullPath -Value $html -Encoding UTF8
  Write-Host "Updated: $RelativePath"
}

$notes = [ordered]@{}

$notes["04_training/01_backpropagation.html"] = New-Note `
  -Title 'Backpropagation как эффективное применение chain rule' `
  -Paragraphs @(
    'Backpropagation — это способ быстро посчитать, как каждый параметр сети влияет на итоговый loss. Он не является отдельной магией нейросетей: это reverse-mode automatic differentiation, применённый к computational graph.',
    'Главная идея в локальности. Каждый узел графа знает только свою локальную производную и входящий сверху градиент. Перемножая эти локальные чувствительности в обратном порядке, сеть получает градиенты для миллионов параметров за один backward pass.',
    'Практически backprop важен не только для вывода формул. Он объясняет vanishing gradients, exploding gradients, detach, in-place operation bugs, необходимость сохранения intermediate activations и стоимость памяти при обучении.'
  ) `
  -Geometry @(
    'Loss можно представить как поверхность над пространством параметров, а градиент — как направление самого быстрого роста этой поверхности.',
    'Backprop переносит чувствительность от выхода к ранним слоям через цепочку локальных преобразований.',
    'Jacobian показывает, как маленькое движение входа слоя меняет выход слоя; VJP умножает этот Jacobian на градиент сверху.'
  ) `
  -Probability @(
    'Если loss является negative log-likelihood, градиент показывает, как изменить параметры, чтобы повысить вероятность наблюдаемых ответов.',
    'Mini-batch gradient — шумная оценка полного градиента по распределению данных.',
    'Слишком маленький или слишком большой gradient signal искажает обучение: модель либо почти не обновляет ранние слои, либо делает нестабильные шаги.'
  ) `
  -Optimization @(
    'Reverse-mode AD эффективен, когда параметров много, а loss один: именно это типично для нейросетей.',
    'Backward pass переиспользует промежуточные значения forward pass, поэтому memory footprint растёт с глубиной и размером batch.',
    'Градиент сам по себе не обучает модель; optimizer решает, как превратить градиент в шаг параметров.'
  ) `
  -Practice @(
    'Проверяй shapes градиентов и параметров, особенно вокруг transpose, broadcasting и batch dimension.',
    'Не используй detach, no_grad или in-place операции там, где нужен gradient flow.',
    'Если обучение не идёт, смотри norm градиентов по слоям: нули, NaN и резкие пики сразу показывают проблему.'
  ) `
  -Example 'Для z = w*x + b и loss L градиент по w равен dL/dz * x. Если x большой, тот же upstream gradient даст больший шаг по w, поэтому масштаб входов напрямую влияет на обучение.'

$notes["04_training/02_optimizers.html"] = New-Note `
  -Title 'Оптимизатор как правило движения по loss landscape' `
  -Paragraphs @(
    'Optimizer превращает градиент в обновление параметров. SGD делает прямой шаг против градиента, momentum добавляет инерцию, RMSProp/Adam масштабируют шаги по истории градиентов.',
    'Разница между optimizer-ами особенно заметна на плохо обусловленных поверхностях loss: узкие долины, разные масштабы параметров, шумные mini-batches и sparse gradients требуют разной динамики движения.',
    'Выбор optimizer-а нельзя отделять от learning rate, batch size, scheduler, normalization и weight decay. На практике optimizer — это часть общей системы обучения, а не одна изолированная формула.'
  ) `
  -Geometry @(
    'SGD двигается локально вниз по поверхности, но может зигзагами идти по узкой долине.',
    'Momentum сглаживает направление движения и помогает быстрее проходить длинные пологие направления.',
    'Adaptive methods меняют размер шага по координатам: параметры с большими историческими градиентами получают меньший effective step.'
  ) `
  -Probability @(
    'Mini-batch gradient — случайная оценка полного градиента, поэтому оптимизация всегда содержит шум.',
    'Momentum можно читать как exponential moving average направления, где недавние batch-и важнее старых.',
    'Шум SGD иногда помогает выходить из резких минимумов, но слишком большой шум мешает сходимости.'
  ) `
  -Optimization @(
    'Learning rate задаёт базовый размер шага; слишком большой lr даёт расходимость, слишком маленький — медленное обучение.',
    'Momentum уменьшает variance направления, но при слишком большом lr может усиливать overshoot.',
    'Adaptive scaling ускоряет раннее обучение, но не всегда даёт лучшую финальную generalization.'
  ) `
  -Practice @(
    'Начинай диагностику с learning rate: это самая чувствительная ручка почти для всех optimizer-ов.',
    'Сравнивай optimizer-ы при честно подобранном lr и scheduler, иначе вывод будет случайным.',
    'Смотри train curve в первые сотни шагов: divergence, plateau и spikes часто видны сразу.'
  ) `
  -Example 'Если SGD прыгает между стенками узкой долины, momentum усредняет предыдущие направления и позволяет двигаться вдоль долины более стабильно.'

$notes["04_training/03_adam_adamw_lion.html"] = New-Note `
  -Title 'Adam, AdamW и Lion как разные способы нормировать шаг' `
  -Paragraphs @(
    'Adam хранит две истории: средний градиент и средний квадрат градиента. Первая история задаёт направление, вторая — масштабирует шаг по каждому параметру, чтобы шумные координаты двигались осторожнее.',
    'AdamW отделяет weight decay от adaptive update. Это важно, потому что классический L2 penalty внутри Adam смешивается с per-parameter scaling и работает не так, как обычное уменьшение весов.',
    'Lion использует sign-based update с momentum-like состоянием. Он может быть эффективен по памяти и скорости, но сильнее требует аккуратного выбора learning rate и weight decay.'
  ) `
  -Geometry @(
    'Adam делает разные effective step sizes по разным координатам loss landscape.',
    'AdamW дополнительно равномерно тянет веса к нулю, не смешивая этот эффект с адаптивным делителем.',
    'Lion двигается по знаку направления, поэтому меньше зависит от точной величины градиента.'
  ) `
  -Probability @(
    'EMA моментов — статистическая оценка среднего направления и масштаба шума по параметру.',
    'Bias correction нужна, потому что в начале EMA стартует с нуля и занижает моменты.',
    'Большой второй момент означает, что параметр часто получает крупные или шумные градиенты.'
  ) `
  -Optimization @(
    'Adam часто быстро снижает loss в начале, особенно при sparse или разношкальных градиентах.',
    'AdamW обычно предпочтительнее Adam для современных deep learning моделей из-за decoupled weight decay.',
    'У Lion обычно learning rate меньше, чем у AdamW, а weight decay часто играет более заметную роль.'
  ) `
  -Practice @(
    'Для большинства современных сетей начинай с AdamW, а не Adam.',
    'Не переносишь lr между AdamW и Lion напрямую: динамика шага другая.',
    'Если validation хуже при хорошем train loss, проверь weight decay, scheduler и overfitting, а не только optimizer.'
  ) `
  -Example 'Если у одного параметра градиенты постоянно в 100 раз больше, Adam уменьшит его effective step через второй момент, чтобы он не доминировал над обучением.'

$notes["04_training/04_regularization.html"] = New-Note `
  -Title 'Регуляризация как управление capacity модели' `
  -Paragraphs @(
    'Регуляризация нужна, когда модель способна объяснить train set слишком точно, включая шум. Она добавляет ограничения или шум, чтобы решение стало проще, устойчивее и лучше переносилось на unseen data.',
    'Weight decay, dropout, label smoothing, data augmentation и early stopping работают по-разному, но их общий смысл один: уменьшить зависимость модели от случайных деталей train-выборки.',
    'Регуляризация не заменяет правильную валидацию. Если split неверный или есть leakage, regularization может лишь замаскировать проблему, но не сделать оценку честной.'
  ) `
  -Geometry @(
    'Weight decay сжимает веса и делает функцию менее резкой.',
    'Dropout заставляет сеть работать без части связей, поэтому представления становятся менее хрупкими.',
    'Augmentation расширяет область вокруг примеров, где модель должна давать согласованный ответ.'
  ) `
  -Probability @(
    'L2 weight decay можно читать как Gaussian prior на веса.',
    'Dropout похож на обучение большого ансамбля подсетей с общими параметрами.',
    'Label smoothing уменьшает чрезмерную уверенность и улучшает калибровку вероятностей.'
  ) `
  -Optimization @(
    'Penalty меняет objective: модель минимизирует не только ошибку, но и цену сложности.',
    'Early stopping выбирает параметры до момента, когда модель начинает подгонять train noise.',
    'Слишком сильная регуляризация даёт underfitting: train и validation остаются плохими.'
  ) `
  -Practice @(
    'Диагностируй по train-validation gap: большой gap говорит о variance, плохой train score — о bias или optimization issue.',
    'Weight decay и dropout тюнь отдельно: они не всегда взаимозаменяемы.',
    'Не добавляй регуляризацию вслепую, если проблема на самом деле в learning rate, данных или loss.'
  ) `
  -Example 'Если train accuracy 99%, а validation 78%, увеличение weight decay или dropout может помочь. Если train accuracy тоже 78%, регуляризация только ухудшит underfitting.'

$notes["04_training/05_learning_rate_scheduling.html"] = New-Note `
  -Title 'Learning rate schedule как управление скоростью обучения во времени' `
  -Paragraphs @(
    'Learning rate — самая сильная ручка оптимизации. Scheduler меняет её во времени: warmup защищает первые шаги, decay помогает сходиться, cosine annealing плавно снижает шаг, OneCycle временно разгоняет обучение.',
    'Постоянный lr редко оптимален на всём протяжении тренировки. В начале параметры случайны и gradients нестабильны, в середине нужен быстрый прогресс, ближе к концу полезны меньшие шаги для уточнения решения.',
    'Scheduler нужно выбирать вместе с optimizer-ом, batch size и total training budget. Один и тот же schedule может работать по-разному при другой длине обучения.'
  ) `
  -Geometry @(
    'Большой lr делает длинные шаги по loss landscape и может перепрыгивать хорошие области.',
    'Малый lr даёт точную локальную настройку, но может застревать или учиться слишком медленно.',
    'Warmup постепенно увеличивает радиус шага, пока сеть выходит из случайной инициализации.'
  ) `
  -Probability @(
    'SGD noise scale зависит от lr и batch size: schedule фактически меняет температуру оптимизации.',
    'Больший lr может помогать искать широкие области, меньший lr — стабилизировать финальное решение.',
    'Резкие изменения lr могут менять распределение updates и вызывать spikes loss.'
  ) `
  -Optimization @(
    'Warmup особенно важен для Transformer-like моделей, больших batch и mixed precision.',
    'Cosine decay плавно уменьшает step size без резких границ.',
    'ReduceLROnPlateau реагирует на validation metric, но требует аккуратного patience и noise tolerance.'
  ) `
  -Practice @(
    'Сначала найди разумный максимальный lr через короткий range test или быстрые прогоны.',
    'Логируй lr вместе с loss, иначе трудно понять, почему изменилась динамика.',
    'При изменении total epochs пересчитай schedule, а не копируй старые параметры.'
  ) `
  -Example 'Если loss стабильно падает первые 5 эпох, а потом validation застрял, cosine decay или ReduceLROnPlateau может дать меньшие шаги и улучшить fine-tuning.'

$notes["04_training/06_gradient_clipping_and_stability.html"] = New-Note `
  -Title 'Gradient clipping как ограничитель опасных шагов' `
  -Paragraphs @(
    'Gradient clipping ограничивает размер обновления, когда градиент становится слишком большим. Это особенно важно для RNN, Transformers, mixed precision и задач с редкими тяжёлыми batch-ами.',
    'Clipping не исправляет причину нестабильности полностью. Он ставит предохранитель на шаг optimizer-а, но NaN, плохой loss scaling, неверные labels, слишком большой lr или unstable operation всё равно нужно диагностировать отдельно.',
    'Различай clipping by norm и clipping by value. Norm clipping сохраняет направление общего градиента и ограничивает длину вектора, value clipping режет каждую координату отдельно и может сильнее исказить направление.'
  ) `
  -Geometry @(
    'Gradient vector показывает направление шага, а clipping ограничивает его длину.',
    'Norm clipping помещает update внутрь шара допустимого радиуса.',
    'Value clipping режет отдельные координаты и может менять направление сильнее, чем norm clipping.'
  ) `
  -Probability @(
    'Редкие batch-и могут давать heavy-tailed gradients: большая часть шагов нормальна, но иногда возникает резкий пик.',
    'Clipping уменьшает влияние таких выбросов на траекторию обучения.',
    'Если clipping срабатывает почти всегда, threshold слишком мал или обучение действительно нестабильно.'
  ) `
  -Optimization @(
    'Clipping применяется после backward и до optimizer.step.',
    'Слишком маленький threshold замедляет обучение, потому что почти все шаги становятся искусственно короткими.',
    'Clipping особенно полезен вместе с scheduler и mixed precision, где spikes могут быстро превратиться в overflow.'
  ) `
  -Practice @(
    'Логируй global grad norm и долю шагов, где clipping сработал.',
    'При NaN проверь inputs, loss, lr, AMP scaler, exp/log/division операции и только потом меняй clipping.',
    'Начинай с norm clipping, если нет причины резать значения по координатам.'
  ) `
  -Example 'Если обычно grad norm около 2, но раз в 200 шагов прыгает до 300, clipping на 5 не даст одному batch-у разрушить параметры.'

$notes["04_training/07_mixed_precision_training.html"] = New-Note `
  -Title 'Mixed precision как компромисс скорости, памяти и численной точности' `
  -Paragraphs @(
    'Mixed precision использует низкую точность для части операций, чтобы ускорить обучение и снизить расход памяти. Обычно матричные операции выполняются в FP16/BF16, а master weights, некоторые reductions и чувствительные операции остаются в FP32.',
    'FP16 даёт высокую скорость, но имеет узкий динамический диапазон и легко ловит underflow/overflow. BF16 имеет меньше mantissa precision, но гораздо шире range, поэтому часто стабильнее для больших моделей.',
    'Loss scaling нужен в FP16, чтобы маленькие градиенты не округлялись в ноль. Dynamic scaler увеличивает или уменьшает scale в зависимости от того, появились ли overflow/NaN.'
  ) `
  -Geometry @(
    'Числа в низкой точности лежат на более грубой сетке представимых значений.',
    'Малые градиенты могут исчезать между ячейками этой сетки, а большие значения могут уходить в infinity.',
    'Autocast выбирает, какие операции безопасно считать в низкой точности, а какие лучше оставить в FP32.'
  ) `
  -Probability @(
    'Округление добавляет численный шум, который не равен полезному стохастическому шуму SGD.',
    'BF16 лучше сохраняет масштаб больших и малых значений, но хуже различает близкие числа.',
    'NaN/Inf часто появляются не случайно, а из-за конкретных операций: exp, division, softmax, log, norm.'
  ) `
  -Optimization @(
    'Mixed precision меняет не objective, а численную реализацию updates.',
    'Loss scaling защищает backward pass от underflow градиентов.',
    'Некоторые операции должны оставаться в FP32, иначе optimizer state или normalization могут стать нестабильными.'
  ) `
  -Practice @(
    'Используй autocast и GradScaler вместо ручного перевода всей модели в FP16.',
    'Для новых GPU и больших моделей часто проверяй BF16 как более стабильный режим.',
    'При NaN сначала отключи AMP на короткий прогон, чтобы отделить численную проблему от архитектурной.'
  ) `
  -Example 'Если градиент 1e-8 в FP16 округляется в ноль, loss scaling умножает loss, делает градиент крупнее в backward, а перед step масштаб корректно снимается.'

$notes["04_training/08_weight_initialization_deeper.html"] = New-Note `
  -Title 'Инициализация весов как контроль потока variance' `
  -Paragraphs @(
    'Инициализация задаёт стартовую динамику сети до первого шага optimizer-а. Если variance активаций или градиентов растёт с глубиной, обучение взрывается. Если variance затухает, ранние слои почти не учатся.',
    'Xavier/Glorot и He initialization выводятся из требования сохранить масштаб сигнала при прохождении через слой. Выбор зависит от activation: tanh/sigmoid требуют одного масштаба, ReLU-подобные функции — другого.',
    'Правильная инициализация не гарантирует хорошего качества, но плохая может убить обучение полностью. Особенно это заметно в глубоких MLP, CNN без normalization и Transformer-блоках без аккуратного residual scaling.'
  ) `
  -Geometry @(
    'Инициализация задаёт начальный радиус облака активаций в каждом слое.',
    'Слишком большие веса растягивают пространство и насыщают активации.',
    'Слишком маленькие веса сжимают представления к почти одинаковым значениям.'
  ) `
  -Probability @(
    'Веса стартуют как случайные величины с выбранной дисперсией.',
    'Цель fan-in/fan-out scaling — сохранить variance активаций и градиентов примерно постоянной.',
    'Symmetry breaking нужен, чтобы нейроны одного слоя не учились одинаково.'
  ) `
  -Optimization @(
    'Плохая инициализация создаёт vanishing/exploding gradients ещё до выбора optimizer-а.',
    'Normalization layers расширяют допустимый диапазон инициализаций, но не делают её неважной.',
    'Residual connections помогают градиенту проходить глубже, но scale residual ветвей всё равно важен.'
  ) `
  -Practice @(
    'Выбирай initialization под activation: He для ReLU-like, Xavier для tanh/sigmoid-like.',
    'Проверяй распределение активаций на первом forward pass до обучения.',
    'Не инициализируй все веса одинаково: это ломает symmetry breaking.'
  ) `
  -Example 'Если в 50-слойной сети variance активаций умножается на 1.2 в каждом слое, к выходу она вырастет примерно в 1.2^50, то есть почти в 9100 раз.'

foreach ($entry in $notes.GetEnumerator()) {
  Add-TheoryExpansion -RelativePath $entry.Key -Note $entry.Value
}

