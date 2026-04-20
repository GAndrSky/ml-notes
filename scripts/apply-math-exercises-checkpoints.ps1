$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

function E {
  param([string]$Text)
  return [System.Net.WebUtility]::HtmlEncode($Text)
}

function New-Exercise {
  param(
    [string]$Type,
    [string]$Difficulty,
    [string]$Prompt,
    [string]$Solution,
    [string]$Code = ""
  )
  return @{
    Type = $Type
    Difficulty = $Difficulty
    Prompt = $Prompt
    Solution = $Solution
    Code = $Code
  }
}

function New-Note {
  param(
    [string]$Title,
    [object[]]$Exercises,
    [string[]]$Questions,
    [string[]]$DuckPrompts
  )
  return @{
    Title = $Title
    Exercises = $Exercises
    Questions = $Questions
    DuckPrompts = $DuckPrompts
  }
}

function New-ExerciseHtml {
  param([hashtable]$Exercise)

  $codeHtml = ""
  if ($Exercise.Code) {
    $codeHtml = "<pre><code class=""language-python"">$(E $Exercise.Code)</code></pre>"
  }

  return @"
        <article class="ml-exercise-card">
          <div class="ml-exercise-meta">
            <span class="ml-exercise-badge">$($Exercise.Type)</span>
            <span class="ml-exercise-badge">$($Exercise.Difficulty)</span>
          </div>
          <p>$(E $Exercise.Prompt)</p>
          <details class="ml-exercise-solution">
            <summary>Показать решение</summary>
            <p>$(E $Exercise.Solution)</p>
$codeHtml
          </details>
        </article>
"@
}

function New-ListItems {
  param([string[]]$Items)
  return (($Items | ForEach-Object { "            <li>$(E $_)</li>" }) -join "`r`n")
}

function New-Rating {
  param([string]$TopicId)
  $buttons = 1..5 | ForEach-Object { "          <button type=""button"" data-rating=""$_"">$_</button>" }
  return @"
        <div class="ml-self-rating" data-topic-id="$TopicId">
          <span class="ml-self-rating__label">Я могу объяснить это:</span>
$($buttons -join "`r`n")
          <span class="ml-self-rating__label" data-rating-status>Пока без оценки</span>
        </div>
"@
}

function New-BlockHtml {
  param([string]$TopicId, [hashtable]$Note)

  $exerciseHtml = ($Note.Exercises | ForEach-Object { New-ExerciseHtml $_ }) -join "`r`n"
  $questionItems = New-ListItems $Note.Questions
  $duckItems = New-ListItems $Note.DuckPrompts
  $rating = New-Rating $TopicId

  return @"

<!-- learning-exercises:start -->
  <section class="ml-exercises-section" data-learning-exercises="1">
    <h2>Упражнения: $($Note.Title)</h2>
    <p class="ml-exercises-note"><strong>Не пропускай упражнения.</strong> Способность воспроизвести вывод, код и объяснение без подсказок — это реальный тест понимания.</p>
    <div class="ml-exercise-list">
$exerciseHtml
    </div>
  </section>
<!-- learning-exercises:end -->

<!-- learning-checkpoint:start -->
  <section class="ml-checkpoint-section" data-learning-checkpoint="1">
    <h2>Learning checkpoint</h2>
    <div class="ml-advanced-grid">
      <article class="ml-checkpoint-card">
        <h3>Ответь без подсказок</h3>
        <ol class="ml-checkpoint-list">
$questionItems
        </ol>
      </article>
      <article class="ml-checkpoint-card">
        <h3>Explain to a rubber duck</h3>
        <ol class="ml-checkpoint-list">
$duckItems
        </ol>
$rating
      </article>
    </div>
  </section>
<!-- learning-checkpoint:end -->
"@
}

function Add-Block {
  param([string]$RelativePath, [string]$TopicId, [hashtable]$Note)

  $fullPath = Join-Path $repoRoot $RelativePath
  if (-not (Test-Path -LiteralPath $fullPath)) {
    throw "Missing file: $RelativePath"
  }

  $html = Get-Content -LiteralPath $fullPath -Raw -Encoding UTF8
  if ($html.Contains('<!-- learning-exercises:start -->') -or $html.Contains('<!-- learning-checkpoint:start -->')) {
    Write-Host "Skip existing exercises/checkpoint: $RelativePath"
    return
  }

  $block = New-BlockHtml -TopicId $TopicId -Note $Note
  $marker = '<!-- step1-learning:start -->'
  if ($html.Contains($marker)) {
    $html = $html.Replace($marker, $block + "`r`n" + $marker)
  } else {
    $html = $html.Replace('</body>', $block + "`r`n</body>")
  }

  Set-Content -LiteralPath $fullPath -Value $html -Encoding UTF8
  Write-Host "Updated: $RelativePath"
}

$notes = [ordered]@{}

# NOTES_START

$notes["01_math/03_probability_theory"] = @{
  Path = "01_math/03_probability_theory.html"
  Note = New-Note -Title "Теория вероятностей" -Exercises @(
    New-Exercise "Type A — Derivation" "Foundational" `
      "Выведи формулу Байеса из определения условной вероятности P(A|B)=P(A,B)/P(B)." `
      "Из P(A|B)=P(A,B)/P(B) и P(B|A)=P(A,B)/P(A) получаем P(A,B)=P(B|A)P(A). Подставляем в первую формулу: P(A|B)=P(B|A)P(A)/P(B)."
    New-Exercise "Type A — Derivation" "Intermediate" `
      "Покажи, почему максимизация произведения likelihood по объектам эквивалентна максимизации суммы log-likelihood." `
      "Логарифм монотонен, поэтому максимум не меняется. log product_i p(x_i|theta) = sum_i log p(x_i|theta). Сумма устойчивее численно и проще оптимизируется."
    New-Exercise "Type B — Coding" "Foundational" `
      "Смоделируй 10 000 бросков нечестной монеты с p(head)=0.7 и покажи, как empirical frequency сходится к вероятности." `
      "Чем больше наблюдений, тем меньше относительный шум частоты. Это не доказывает вероятность для одного исхода, но показывает закон больших чисел." `
      "# What it does: simulates Bernoulli trials and empirical frequency`n# Input shape: samples=(n,)`n# Output shape: scalar empirical probability`nimport numpy as np`n`nrng = np.random.default_rng(0)`nsamples = rng.binomial(1, 0.7, size=10_000)`nfor n in [10, 100, 1000, 10000]:`n    print(n, samples[:n].mean())`n# Gotchas: random seed affects small n; convergence is noisy, not monotonic."
    New-Exercise "Type B — Coding" "Intermediate" `
      "Реализуй вычисление log-likelihood для Bernoulli-модели и найди p, который лучше объясняет данные." `
      "MLE для Bernoulli равен среднему значению меток. Grid ниже должен максимум около empirical mean." `
      "# What it does: Bernoulli log-likelihood grid search`n# Input shape: y=(n,)`n# Output shape: best_p=scalar`nimport numpy as np`n`ny = np.array([1, 0, 1, 1, 0, 1, 1, 1])`nps = np.linspace(0.01, 0.99, 99)`nll = np.array([np.sum(y*np.log(p) + (1-y)*np.log(1-p)) for p in ps])`nbest_p = ps[np.argmax(ll)]`nprint('empirical mean=', y.mean())`nprint('best p=', best_p)`n# Gotchas: never evaluate log(0); clip probabilities away from 0 and 1."
    New-Exercise "Type C — Conceptual" "Foundational" `
      "Почему prior и likelihood отвечают на разные вопросы?" `
      "Prior описывает убеждение о параметре до данных. Likelihood описывает, насколько наблюдаемые данные вероятны при фиксированном параметре. Posterior объединяет оба источника."
    New-Exercise "Type C — Conceptual" "Hard" `
      "Почему хорошая accuracy не означает хорошую вероятностную калибровку?" `
      "Accuracy проверяет только правильный класс после threshold/argmax. Калибровка проверяет, соответствует ли уверенность частоте событий: среди объектов с 0.8 вероятности событие должно происходить примерно в 80% случаев."
  ) -Questions @(
    "Как из определения условной вероятности получить формулу Байеса?",
    "Чем likelihood отличается от probability события?",
    "Почему log-likelihood численно лучше произведения вероятностей?",
    "Что означает posterior в Bayesian learning?",
    "Почему calibration важна для ML-решений?"
  ) -DuckPrompts @(
    "Объясни Bayes theorem через пример медицинского теста.",
    "Объясни maximum likelihood как настройку параметров модели под наблюдаемые данные."
  )
}

$notes["01_math/04_information_theory"] = @{
  Path = "01_math/04_information_theory.html"
  Note = New-Note -Title "Теория информации" -Exercises @(
    New-Exercise "Type A — Derivation" "Foundational" `
      "Посчитай entropy для честной монеты и для монеты с P(head)=0.9. Объясни, почему честная монета имеет большую неопределённость." `
      "Для честной монеты H=-2*(0.5 log2 0.5)=1 бит. Для 0.9/0.1: H=-(0.9 log2 0.9 + 0.1 log2 0.1)≈0.47 бит. Честная монета менее предсказуема."
    New-Exercise "Type A — Derivation" "Intermediate" `
      "Покажи, что cross-entropy H(p,q)=H(p)+KL(p||q). Что это значит для обучения классификатора?" `
      "H(p,q)=-sum p log q. Добавим и вычтем sum p log p: получаем -sum p log p + sum p log(p/q). Первый член H(p), второй KL. Так как H(p) фиксирован для данных, минимизация cross-entropy минимизирует KL от истинного распределения к модели."
    New-Exercise "Type B — Coding" "Foundational" `
      "Реализуй entropy и KL divergence для дискретных распределений и проверь значения на двух монетах." `
      "Код показывает, что KL несимметричен: KL(p||q) и KL(q||p) обычно разные." `
      "# What it does: computes entropy and KL for discrete distributions`n# Input shapes: p=(k,), q=(k,)`n# Output shapes: scalar entropy, scalar KL`nimport numpy as np`n`ndef entropy(p):`n    p = np.asarray(p, dtype=float)`n    return -np.sum(p * np.log2(p))`n`ndef kl(p, q):`n    p = np.asarray(p, dtype=float)`n    q = np.asarray(q, dtype=float)`n    return np.sum(p * np.log2(p / q))`n`np = np.array([0.5, 0.5])`nq = np.array([0.9, 0.1])`nprint(entropy(p), entropy(q))`nprint(kl(p, q), kl(q, p))`n# Gotchas: distributions must sum to 1; handle zero probabilities carefully in real code."
    New-Exercise "Type B — Coding" "Intermediate" `
      "Реализуй softmax cross-entropy для batch logits и labels без PyTorch. Используй log-sum-exp trick." `
      "Вычитание максимального logit не меняет softmax, но предотвращает overflow в exp." `
      "# What it does: stable softmax cross-entropy from logits`n# Input shapes: logits=(batch,classes), y=(batch,)`n# Output shape: scalar loss`nimport numpy as np`n`ndef cross_entropy(logits, y):`n    shifted = logits - logits.max(axis=1, keepdims=True)`n    log_probs = shifted - np.log(np.exp(shifted).sum(axis=1, keepdims=True))`n    return -log_probs[np.arange(len(y)), y].mean()`n`nlogits = np.array([[2.0, 0.0, -1.0], [0.1, 1.2, 0.3]])`ny = np.array([0, 1])`nprint(cross_entropy(logits, y))`n# Gotchas: pass raw logits, not softmax probabilities; subtract max before exp."
    New-Exercise "Type C — Conceptual" "Foundational" `
      "Почему cross-entropy штрафует уверенные неправильные ответы сильнее, чем неуверенные?" `
      "Если модель даёт правильному классу вероятность около нуля, -log(q) становится очень большим. Это делает уверенную ошибку дорогой."
    New-Exercise "Type C — Conceptual" "Hard" `
      "Почему KL divergence не является настоящим расстоянием?" `
      "KL несимметричен и не обязан удовлетворять triangle inequality. KL(p||q) измеряет цену кодирования данных из p с помощью q, а не геометрическую дистанцию."
  ) -Questions @(
    "Что измеряет entropy и когда она максимальна?",
    "Почему KL(p||q) не равно KL(q||p)?",
    "Как cross-entropy связана с maximum likelihood?",
    "Зачем нужен log-sum-exp trick?",
    "Как mutual information будет отличаться от correlation?"
  ) -DuckPrompts @(
    "Объясни entropy как средний surprise без формул.",
    "Объясни KL divergence как цену использования неправильной карты мира."
  )
}

$notes["01_math/01_linear_algebra"] = @{
  Path = "01_math/01_linear_algebra.html"
  Note = New-Note -Title "Линейная алгебра" -Exercises @(
    New-Exercise "Type A — Derivation" "Foundational" `
      "Докажи вручную, что матричное умножение XW для X формы (n, d) и W формы (d, k) даёт выход формы (n, k). Распиши формулу для одного элемента Y_ij." `
      "Элемент Y_ij равен сумме по общей оси d: Y_ij = sum_m X_im W_mj. Индекс i выбирает объект, j выбирает выходную координату, m пробегает входные признаки. Поэтому n остаётся числом объектов, k становится числом новых признаков."
    New-Exercise "Type A — Derivation" "Intermediate" `
      "Выведи, почему скалярное произведение связано с косинусом угла: a·b = ||a|| ||b|| cos(theta). Объясни, почему cosine similarity игнорирует длину вектора." `
      "Если нормировать оба вектора до единичной длины, их dot product становится cos(theta). Длина исчезает, остаётся только направление. Поэтому cosine similarity полезна для embeddings, где важнее семантическое направление, чем масштаб."
    New-Exercise "Type B — Coding" "Foundational" `
      "Реализуй matrix multiplication на NumPy и проверь shapes без использования @ внутри своей функции." `
      "Циклы ниже явно показывают общую ось d. Это медленнее, чем NumPy, но полезно для понимания размерностей." `
      "# What it does: manual matrix multiplication`n# Input shapes: X=(n,d), W=(d,k)`n# Output shape: Y=(n,k)`nimport numpy as np`n`ndef matmul_manual(X, W):`n    n, d = X.shape`n    d2, k = W.shape`n    assert d == d2`n    Y = np.zeros((n, k))`n    for i in range(n):`n        for j in range(k):`n            for m in range(d):`n                Y[i, j] += X[i, m] * W[m, j]`n    return Y`n`nX = np.array([[1., 2.], [3., 4.]])`nW = np.array([[2., 0., 1.], [1., -1., 3.]])`nprint(matmul_manual(X, W))`nprint(X @ W)`n# Gotchas: inner dimensions must match; output columns come from W, not X."
    New-Exercise "Type B — Coding" "Intermediate" `
      "Сгенерируй облако 2D-точек, примени линейное преобразование A и сравни determinant с изменением площади маленького квадрата." `
      "Determinant показывает, во сколько раз линейное преобразование масштабирует ориентированную площадь. Если det отрицательный, ориентация переворачивается." `
      "# What it does: checks area scaling by determinant`n# Input shapes: A=(2,2), square=(4,2)`n# Output shape: transformed=(4,2)`nimport numpy as np`n`ndef polygon_area(P):`n    x, y = P[:, 0], P[:, 1]`n    return 0.5 * abs(np.dot(x, np.roll(y, -1)) - np.dot(y, np.roll(x, -1)))`n`nA = np.array([[2.0, 0.5], [0.0, 1.5]])`nsquare = np.array([[0.,0.], [1.,0.], [1.,1.], [0.,1.]])`ntransformed = square @ A.T`nprint('det(A)=', np.linalg.det(A))`nprint('area ratio=', polygon_area(transformed) / polygon_area(square))`n# Gotchas: use A.T when row-vectors are stored as points; determinant can be negative because of orientation."
    New-Exercise "Type C — Conceptual" "Foundational" `
      "Почему в ML почти всегда нужно проверять shapes перед чтением смысла формулы?" `
      "Потому что shape ошибки часто раскрывают неправильную ось, перепутанный batch dimension или неверный порядок умножения. Если размерности не сходятся, формула не может быть правильной реализацией идеи."
    New-Exercise "Type C — Conceptual" "Hard" `
      "Объясни, почему low-rank approximation может сжимать модель или данные, но одновременно терять важную информацию." `
      "Low-rank approximation сохраняет доминирующие направления variance или энергии матрицы. Если слабое направление содержит редкий, но важный сигнал, сжатие может улучшить среднюю реконструкцию и ухудшить downstream-задачу."
  ) -Questions @(
    "Как по shapes понять, можно ли умножить две матрицы?",
    "Что геометрически делает матрица с облаком точек?",
    "Почему rank связан с количеством независимых направлений информации?",
    "Чем eigenvectors отличаются по смыслу от singular vectors?",
    "Почему PCA можно понимать как поиск новой системы координат?"
  ) -DuckPrompts @(
    "Объясни матрицу весов нейросети как геометрическое преобразование пространства признаков.",
    "Объясни SVD человеку, который знает только векторы и проекции."
  )
}

$notes["01_math/02_calculus"] = @{
  Path = "01_math/02_calculus.html"
  Note = New-Note -Title "Матанализ" -Exercises @(
    New-Exercise "Type A — Derivation" "Foundational" `
      "Для f(x)=3x^2-4x+1 выведи производную через определение предела, а не по правилу степени." `
      "Подставь (f(x+h)-f(x))/h. После раскрытия скобок останется (6xh+3h^2-4h)/h = 6x+3h-4. При h -> 0 получаем 6x-4."
    New-Exercise "Type A — Derivation" "Intermediate" `
      "Для L=(wx+b-y)^2 выведи dL/dw, dL/db и dL/dx через цепное правило." `
      "Обозначим e=wx+b-y. Тогда L=e^2, dL/de=2e. Далее de/dw=x, de/db=1, de/dx=w. Поэтому dL/dw=2e x, dL/db=2e, dL/dx=2e w."
    New-Exercise "Type B — Coding" "Foundational" `
      "Напиши finite difference gradient checker для функции f(x)=sum(x^2) и сравни с аналитическим градиентом." `
      "Finite differences приближает производную через маленькое изменение входа. Если epsilon слишком большой, ошибка аппроксимации растёт; если слишком маленький, мешает численное округление." `
      "# What it does: finite-difference gradient check`n# Input shape: x=(d,)`n# Output shape: grad=(d,)`nimport numpy as np`n`ndef f(x):`n    return np.sum(x ** 2)`n`ndef grad_fd(x, eps=1e-5):`n    g = np.zeros_like(x)`n    for i in range(x.size):`n        step = np.zeros_like(x)`n        step[i] = eps`n        g[i] = (f(x + step) - f(x - step)) / (2 * eps)`n    return g`n`nx = np.array([1.0, -2.0, 3.0])`nprint(grad_fd(x))`nprint(2 * x)`n# Gotchas: do not choose eps extremely small; central difference is usually more accurate than forward difference."
    New-Exercise "Type B — Coding" "Intermediate" `
      "Реализуй 20 шагов gradient descent для f(x,y)=x^2+10y^2 и объясни, почему по y шаги чувствительнее." `
      "Кривизна по y в 10 раз выше, поэтому слишком большой learning rate вызывает oscillation или divergence именно вдоль y." `
      "# What it does: gradient descent on an anisotropic quadratic`n# Input shape: point=(2,)`n# Output shape: trajectory=(steps+1,2)`nimport numpy as np`n`ndef grad(p):`n    x, y = p`n    return np.array([2*x, 20*y])`n`np = np.array([4.0, 4.0])`nlr = 0.08`ntraj = [p.copy()]`nfor _ in range(20):`n    p = p - lr * grad(p)`n    traj.append(p.copy())`nprint(np.array(traj)[-5:])`n# Gotchas: lr that is safe for x may be too large for y; curvature controls stable step size."
    New-Exercise "Type C — Conceptual" "Foundational" `
      "Почему gradient descent идёт против градиента, а не по градиенту?" `
      "Градиент указывает направление самого быстрого локального роста функции. Loss нужно уменьшать, поэтому шаг делается в противоположном направлении."
    New-Exercise "Type C — Conceptual" "Hard" `
      "Почему Hessian почти никогда не считают явно для больших нейросетей?" `
      "Если параметров P, Hessian имеет P^2 элементов. Для миллионов параметров это невозможно хранить и дорого считать. Вместо этого используют first-order методы или Hessian-vector products."
  ) -Questions @(
    "Что именно измеряет производная в контексте ML loss?",
    "Как цепное правило делает backprop возможным?",
    "Почему learning rate зависит от curvature поверхности?",
    "Что показывает Hessian и как распознать saddle point?",
    "Чем numerical gradient отличается от autograd?"
  ) -DuckPrompts @(
    "Объясни gradient descent как спуск по рельефу loss без формул.",
    "Объясни chain rule на примере маленькой вычислительной цепочки из трёх операций."
  )
}

foreach ($entry in $notes.GetEnumerator()) {
  Add-Block -RelativePath $entry.Value.Path -TopicId $entry.Key -Note $entry.Value.Note
}

