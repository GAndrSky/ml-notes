$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

function E { param([string]$Text) return [System.Net.WebUtility]::HtmlEncode($Text) }

function Ex {
  param([string]$Type, [string]$Difficulty, [string]$Prompt, [string]$Solution, [string]$Code = "")
  return @{ Type = $Type; Difficulty = $Difficulty; Prompt = $Prompt; Solution = $Solution; Code = $Code }
}

function Note {
  param([string]$Title, [object[]]$Exercises, [string[]]$Questions, [string[]]$Duck)
  return @{ Title = $Title; Exercises = $Exercises; Questions = $Questions; Duck = $Duck }
}

function ExerciseHtml {
  param([hashtable]$Exercise)
  $code = ""
  if ($Exercise.Code) {
    $code = "<pre><code class=""language-python"">$(E $Exercise.Code)</code></pre>"
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
$code
          </details>
        </article>
"@
}

function Items { param([string[]]$Values) return (($Values | ForEach-Object { "            <li>$(E $_)</li>" }) -join "`r`n") }

function Rating {
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

function BlockHtml {
  param([string]$TopicId, [hashtable]$Note)
  $exercises = ($Note.Exercises | ForEach-Object { ExerciseHtml $_ }) -join "`r`n"
  $questions = Items $Note.Questions
  $duck = Items $Note.Duck
  $rating = Rating $TopicId
  return @"

<!-- learning-exercises:start -->
  <section class="ml-exercises-section" data-learning-exercises="1">
    <h2>Упражнения: $($Note.Title)</h2>
    <p class="ml-exercises-note"><strong>Не пропускай упражнения.</strong> В блоке обучения понимание проверяется не чтением формул, а способностью вывести update, написать минимальный код и объяснить failure mode.</p>
    <div class="ml-exercise-list">
$exercises
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
$questions
        </ol>
      </article>
      <article class="ml-checkpoint-card">
        <h3>Explain to a rubber duck</h3>
        <ol class="ml-checkpoint-list">
$duck
        </ol>
$rating
      </article>
    </div>
  </section>
<!-- learning-checkpoint:end -->
"@
}

function AddBlock {
  param([string]$Path, [string]$TopicId, [hashtable]$Note)
  $full = Join-Path $repoRoot $Path
  $html = Get-Content -LiteralPath $full -Raw -Encoding UTF8
  if ($html.Contains('<!-- learning-exercises:start -->') -or $html.Contains('<!-- learning-checkpoint:start -->')) {
    Write-Host "Skip existing exercises/checkpoint: $Path"
    return
  }
  $block = BlockHtml -TopicId $TopicId -Note $Note
  $marker = '<!-- step1-learning:start -->'
  if ($html.Contains($marker)) {
    $html = $html.Replace($marker, $block + "`r`n" + $marker)
  } else {
    $html = $html.Replace('</body>', $block + "`r`n</body>")
  }
  Set-Content -LiteralPath $full -Value $html -Encoding UTF8
  Write-Host "Updated: $Path"
}

$adamCode = @'
# What it does: one AdamW update for a vector of parameters
# Input shapes: theta=(d,), grad=(d,), m=(d,), v=(d,)
# Output shapes: theta_new=(d,), m_new=(d,), v_new=(d,)
import numpy as np

def adamw_step(theta, grad, m, v, t, lr=3e-4, b1=0.9, b2=0.999, eps=1e-8, wd=0.01):
    m = b1 * m + (1 - b1) * grad
    v = b2 * v + (1 - b2) * (grad ** 2)
    m_hat = m / (1 - b1 ** t)
    v_hat = v / (1 - b2 ** t)
    theta = theta * (1 - lr * wd) - lr * m_hat / (np.sqrt(v_hat) + eps)
    return theta, m, v

theta = np.array([1.0, -2.0])
grad = np.array([0.1, -0.4])
m = np.zeros_like(theta)
v = np.zeros_like(theta)
print(adamw_step(theta, grad, m, v, t=1)[0])
# Gotchas: AdamW decay is decoupled; do bias correction before the parameter update.
'@

$gradCheckCode = @'
# What it does: finite-difference check for a scalar loss
# Input shape: w=(d,)
# Output shape: grad=(d,)
import numpy as np

def loss(w):
    x = np.array([1.0, -2.0, 3.0])
    y = 2.0
    pred = w @ x
    return (pred - y) ** 2

def finite_diff(w, eps=1e-5):
    g = np.zeros_like(w)
    for i in range(w.size):
        step = np.zeros_like(w)
        step[i] = eps
        g[i] = (loss(w + step) - loss(w - step)) / (2 * eps)
    return g

w = np.array([0.2, -0.1, 0.3])
print(finite_diff(w))
# Gotchas: compare with analytic/autograd gradients at the same parameter values.
'@

$clipCode = @'
# What it does: global norm gradient clipping
# Input shapes: list of gradient arrays with arbitrary shapes
# Output shapes: clipped gradients with same shapes
import numpy as np

def clip_by_global_norm(grads, max_norm=1.0, eps=1e-12):
    total = np.sqrt(sum(np.sum(g * g) for g in grads))
    scale = min(1.0, max_norm / (total + eps))
    return [g * scale for g in grads], total, scale

grads = [np.array([3.0, 4.0]), np.array([0.0, 12.0])]
clipped, norm, scale = clip_by_global_norm(grads, max_norm=5.0)
print(norm, scale, clipped)
# Gotchas: clipping too often means lr or model dynamics may still be wrong.
'@

$notes = [ordered]@{}

# NOTES_START

$notes["04_training/05_learning_rate_scheduling"] = @{
  Path = "04_training/05_learning_rate_scheduling.html"
  Note = Note "Learning Rate Scheduling" @(
    Ex "Type A — Derivation" "Foundational" "Запиши cosine decay schedule от lr_max к lr_min и объясни, почему он плавнее step decay." "Cosine плавно меняет lr через половину косинуса, поэтому нет резкого скачка update scale. Step decay может резко изменить динамику loss."
    Ex "Type A — Derivation" "Intermediate" "Объясни warmup как постепенное увеличение радиуса шага. Почему он особенно важен для Transformer и больших batch?" "В начале параметры и optimizer state нестабильны. Warmup не даёт большим ранним градиентам сделать разрушительный шаг, особенно при LayerNorm, Adam и больших batch."
    Ex "Type B — Coding" "Foundational" "Реализуй linear warmup + cosine decay и распечатай первые/последние значения lr." "Первые шаги должны расти от 0 до max_lr, затем плавно снижаться к min_lr." "# What it does: warmup + cosine learning-rate schedule`n# Input shape: scalar step`n# Output shape: scalar lr`nimport math`n`ndef lr_at(step, total=1000, warmup=100, max_lr=3e-4, min_lr=3e-5):`n    if step < warmup:`n        return max_lr * (step + 1) / warmup`n    progress = (step - warmup) / max(1, total - warmup)`n    cosine = 0.5 * (1 + math.cos(math.pi * progress))`n    return min_lr + (max_lr - min_lr) * cosine`n`nprint([round(lr_at(s), 8) for s in [0, 10, 99, 100, 500, 999]])`n# Gotchas: recompute schedule when total steps changes; log lr during training."
    Ex "Type B — Coding" "Intermediate" "Добавь lr schedule в простой NumPy gradient descent и сравни с постоянным lr на квадратичной функции." "Schedule должен позволить сначала двигаться быстрее, а ближе к концу стабилизировать точку. На слишком простой функции выигрыш может быть мал."
    Ex "Type C — Conceptual" "Foundational" "Почему хороший lr в начале обучения может быть плохим в конце?" "В начале нужен быстрый прогресс по грубой поверхности. В конце параметры рядом с минимумом, и большой шаг начинает перекидывать через хорошую область."
    Ex "Type C — Conceptual" "Hard" "Почему нельзя слепо копировать schedule, если поменялось число epochs или batch size?" "Schedule зависит от числа optimizer steps и noise scale. Изменение batch/epochs меняет и динамику градиента, и время, когда decay должен начаться."
  ) @(
    "Зачем нужен warmup?",
    "Чем cosine decay отличается от step decay?",
    "Почему lr надо логировать вместе с loss?",
    "Что делает ReduceLROnPlateau?",
    "Как batch size связан с выбором lr?"
  ) @(
    "Объясни scheduler как коробку передач для optimizer-а.",
    "Объясни, почему один constant lr редко оптимален от начала до конца."
  )
}

$notes["04_training/06_gradient_clipping_and_stability"] = @{
  Path = "04_training/06_gradient_clipping_and_stability.html"
  Note = Note "Gradient Clipping и стабильность" @(
    Ex "Type A — Derivation" "Foundational" "Выведи формулу global norm clipping: когда ||g|| > c, новый градиент равен g * c / ||g||." "Масштабирование сохраняет направление вектора, но ограничивает длину до c. Если norm меньше порога, градиент не меняют."
    Ex "Type A — Derivation" "Intermediate" "Сравни clipping by norm и clipping by value на векторе [100, 1]. Как меняется направление?" "Norm clipping сохраняет отношение координат, value clipping режет большую координату отдельно. Поэтому value clipping может сильно повернуть направление update-а."
    Ex "Type B — Coding" "Foundational" "Реализуй global norm clipping для списка NumPy-градиентов." "Код должен посчитать общую норму по всем параметрам и применить один общий scale." $clipCode
    Ex "Type B — Coding" "Intermediate" "Сымитируй 100 шагов SGD, где каждый 20-й gradient spike в 50 раз больше. Сравни траектории с clipping и без." "Без clipping один spike может резко увести параметры. С clipping spike ограничивается и траектория становится стабильнее."
    Ex "Type C — Conceptual" "Foundational" "Почему clipping не является настоящим исправлением причины NaN?" "Он ограничивает шаг optimizer-а, но не устраняет overflow, плохие данные, неверный loss, слишком большой lr или нестабильные операции."
    Ex "Type C — Conceptual" "Hard" "Почему важно логировать, как часто clipping срабатывает?" "Если clipping срабатывает почти всегда, обучение фактически идёт с другим update rule. Это сигнал, что threshold слишком мал или динамика модели нестабильна."
  ) @(
    "Что такое global gradient norm?",
    "Когда clipping by value хуже norm clipping?",
    "Где в training loop применяется clipping?",
    "Какие причины NaN clipping не исправляет?",
    "Как понять, что clipping threshold выбран слишком низко?"
  ) @(
    "Объясни clipping как предохранитель на слишком большой шаг.",
    "Объясни разницу между ограничением длины вектора и обрезанием отдельных координат."
  )
}

$notes["04_training/07_mixed_precision_training"] = @{
  Path = "04_training/07_mixed_precision_training.html"
  Note = Note "Mixed Precision Training" @(
    Ex "Type A — Derivation" "Foundational" "Объясни, почему loss scaling помогает FP16 backward не потерять маленькие градиенты." "Если loss умножить на scale, градиенты тоже умножаются на scale и становятся представимыми в FP16. Перед optimizer step градиенты делят обратно, поэтому математический update сохраняется."
    Ex "Type A — Derivation" "Intermediate" "Сравни FP16 и BF16 по динамическому диапазону и точности mantissa. Что это меняет для обучения?" "BF16 имеет меньше точности mantissa, но шире range, поэтому реже ловит overflow/underflow. FP16 точнее в узком диапазоне, но менее стабилен по масштабу."
    Ex "Type B — Coding" "Foundational" "Напиши минимальный PyTorch training step с autocast и GradScaler." "autocast выбирает precision для операций, scaler масштабирует loss и безопасно делает backward/step." "# What it does: minimal AMP training step in PyTorch`n# Input shapes: x=(batch,d), y=(batch,1)`n# Output shape: scalar loss`nimport torch`nfrom torch import nn`n`nmodel = nn.Linear(4, 1).cuda()`nopt = torch.optim.AdamW(model.parameters(), lr=1e-3)`nscaler = torch.cuda.amp.GradScaler()`nx = torch.randn(32, 4, device='cuda')`ny = torch.randn(32, 1, device='cuda')`n`nopt.zero_grad(set_to_none=True)`nwith torch.cuda.amp.autocast():`n    loss = ((model(x) - y) ** 2).mean()`nscaler.scale(loss).backward()`nscaler.step(opt)`nscaler.update()`n# Gotchas: keep optimizer state stable; disable AMP briefly when debugging NaN."
    Ex "Type B — Coding" "Intermediate" "Напиши проверку, которая делает один train step с AMP и один без AMP на маленькой модели и сравнивает loss." "Loss не обязан совпасть бит-в-бит, но должен быть близким. Большое расхождение говорит о precision-sensitive операции или нестабильном масштабе."
    Ex "Type C — Conceptual" "Foundational" "Почему нельзя просто перевести всю модель и optimizer state в FP16?" "Некоторые состояния и reductions требуют FP32-стабильности. Полный FP16 может дать underflow/overflow и испортить update."
    Ex "Type C — Conceptual" "Hard" "Почему BF16 часто предпочитают для больших моделей, если он менее точен по mantissa?" "Широкий exponent range обычно важнее для стабильности больших активаций/градиентов. Меньшая mantissa часто переносима из-за статистической природы обучения."
  ) @(
    "Что делает autocast?",
    "Зачем нужен GradScaler?",
    "Чем FP16 отличается от BF16 practically?",
    "Какие операции чаще ломаются в низкой точности?",
    "Как диагностировать, что NaN связан именно с AMP?"
  ) @(
    "Объясни mixed precision как компромисс скорости и численной безопасности.",
    "Объясни loss scaling без деталей IEEE-формата."
  )
}

$notes["04_training/08_weight_initialization_deeper"] = @{
  Path = "04_training/08_weight_initialization_deeper.html"
  Note = Note "Инициализация весов" @(
    Ex "Type A — Derivation" "Foundational" "Выведи интуицию Xavier: почему variance весов должна зависеть от fan_in/fan_out?" "Если суммировать fan_in независимых входов, variance pre-activation растёт пропорционально fan_in. Масштаб весов выбирают так, чтобы variance не взрывалась и не затухала."
    Ex "Type A — Derivation" "Intermediate" "Объясни, почему He initialization больше подходит для ReLU, чем Xavier." "ReLU примерно зануляет половину сигналов, уменьшая variance. He scale компенсирует этот эффект через множитель 2/fan_in."
    Ex "Type B — Coding" "Foundational" "Сымитируй прохождение random batch через 30 линейных ReLU-слоёв при разных weight scale и измерь variance активаций." "При маленьком scale variance затухнет, при большом взорвётся. Хорошая инициализация держит масштаб более стабильным." "# What it does: activation variance through random ReLU network`n# Input shape: X=(batch,width)`n# Output shape: printed variance per depth`nimport numpy as np`n`nrng = np.random.default_rng(0)`nX = rng.normal(size=(512, 128))`nfor scale in [0.05, np.sqrt(2/128), 0.3]:`n    A = X.copy()`n    vars_ = []`n    for _ in range(30):`n        W = rng.normal(scale=scale, size=(128, 128))`n        A = np.maximum(0, A @ W)`n        vars_.append(A.var())`n    print('scale', round(scale, 4), 'last var', vars_[-1])`n# Gotchas: activation choice changes the correct scale; normalization can hide but not erase bad initialization."
    Ex "Type B — Coding" "Intermediate" "Напиши проверку первого forward pass: среднее и std активаций по слоям до обучения." "Это быстрый sanity check. Если std быстро уходит в 0 или infinity, обучение будет трудным ещё до optimizer-а."
    Ex "Type C — Conceptual" "Foundational" "Почему нельзя инициализировать все веса нулями?" "Нейроны одного слоя будут получать одинаковые градиенты и останутся симметричными. Сеть не сможет выучить разные признаки."
    Ex "Type C — Conceptual" "Hard" "Почему residual connections смягчают, но не отменяют проблему initialization?" "Skip path помогает сигналу и градиенту проходить глубже, но residual ветви всё равно могут иметь неправильный масштаб и разрушать стабильность суммы."
  ) @(
    "Что такое fan_in и fan_out?",
    "Почему ReLU требует другого масштаба, чем tanh?",
    "Как увидеть плохую инициализацию до обучения?",
    "Почему symmetry breaking обязателен?",
    "Как normalization влияет на чувствительность к initialization?"
  ) @(
    "Объясни инициализацию как контроль масштаба сигнала по глубине.",
    "Объясни, почему нулевые веса ломают обучение, даже если градиенты формально считаются."
  )
}

$notes["04_training/09_numerical_stability"] = @{
  Path = "04_training/09_numerical_stability.html"
  Note = Note "Numerical Stability" @(
    Ex "Type A — Derivation" "Foundational" "Докажи, что softmax(x) не меняется, если из всех logits вычесть одну и ту же константу c." "В числителе и знаменателе появляется общий множитель exp(-c), который сокращается. Поэтому можно вычитать max(logits) для защиты от overflow."
    Ex "Type A — Derivation" "Intermediate" "Выведи log-sum-exp trick: log(sum exp(x_i)) = m + log(sum exp(x_i - m)), где m=max(x)." "Вынеси exp(m) из суммы: log(exp(m) sum exp(x_i-m)) = m + log(sum exp(x_i-m)). Теперь все exp аргументы <= 0."
    Ex "Type B — Coding" "Foundational" "Реализуй stable softmax и сравни с naive softmax на logits [1000, 1001, 1002]." "Naive exp переполнится, stable softmax должен вернуть корректные вероятности." "# What it does: stable softmax with max subtraction`n# Input shape: logits=(classes,)`n# Output shape: probs=(classes,)`nimport numpy as np`n`ndef softmax_stable(x):`n    z = x - np.max(x)`n    e = np.exp(z)`n    return e / e.sum()`n`nlogits = np.array([1000.0, 1001.0, 1002.0])`nprint(softmax_stable(logits))`n# Gotchas: use logits, not already-softmaxed probabilities; subtract max per row for batches."
    Ex "Type B — Coding" "Intermediate" "Напиши safe BCE loss, который clipping-ует probabilities перед log." "Clipping защищает от log(0), но в реальном DL лучше использовать BCEWithLogitsLoss, чтобы не терять стабильность sigmoid+log." 
    Ex "Type C — Conceptual" "Foundational" "Почему NaN часто появляется не там, где возникла первичная причина?" "Одна нестабильная операция создаёт inf/NaN, затем они распространяются по графу. Видимый NaN в loss может быть следствием более раннего overflow."
    Ex "Type C — Conceptual" "Hard" "Почему стабильная формула может быть математически эквивалентна нестабильной, но практически лучше?" "Floating point имеет конечный диапазон и точность. Алгебраически равные выражения могут создавать разные промежуточные значения, например exp(1000) против exp(0)."
  ) @(
    "Зачем вычитать max перед softmax?",
    "Что такое overflow и underflow?",
    "Почему лучше CrossEntropyLoss по logits, чем softmax + log вручную?",
    "Как искать источник NaN в training loop?",
    "Какие операции самые рискованные численно?"
  ) @(
    "Объясни numerical stability как защиту от плохих промежуточных чисел.",
    "Объясни log-sum-exp trick без формул."
  )
}

$notes["04_training/01_backpropagation"] = @{
  Path = "04_training/01_backpropagation.html"
  Note = Note "Backpropagation" @(
    Ex "Type A — Derivation" "Foundational" "Выведи dL/dW и dL/db для одного линейного слоя z = xW + b и MSE loss. Обязательно укажи shapes для x, W, z и y." "Для batch X формы (n,d), W формы (d,k), Z=XW+b формы (n,k). Если L=mean((Z-Y)^2), то dL/dZ имеет форму (n,k), dL/dW = X^T dL/dZ формы (d,k), dL/db = sum по batch формы (k,)."
    Ex "Type A — Derivation" "Hard" "Покажи, почему для softmax + cross-entropy градиент по logits упрощается до p - y_onehot." "Производная log-softmax даёт матрицу Jacobian, где diagonal часть p_i(1-p_i), off-diagonal -p_i p_j. После свёртки с one-hot target все члены упрощаются до p_j - y_j. Это причина, почему CrossEntropyLoss удобно принимать logits напрямую."
    Ex "Type B — Coding" "Intermediate" "Реализуй finite-difference gradient check для маленького линейного слоя и сравни с ручным backward." "Finite differences должен совпасть с analytic gradient с малой погрешностью. Если не совпадает, обычно ошибка в transpose, усреднении batch или знаке." $gradCheckCode
    Ex "Type B — Coding" "Hard" "Напиши 2-layer MLP на NumPy: forward, ReLU, MSE, backward, update. Не используй PyTorch." "Минимальная реализация должна сохранить pre-activation для ReLU mask, затем пройти backward от loss к W2/b2 и W1/b1. Главные проверки: shapes и падение loss на toy data."
    Ex "Type C — Conceptual" "Foundational" "Почему backprop требует один forward и один backward pass, а не отдельный проход для каждого параметра?" "Reverse-mode AD переиспользует локальные производные и upstream gradients в computational graph. Для одного scalar loss это эффективнее, чем perturb каждый параметр отдельно."
    Ex "Type C — Conceptual" "Intermediate" "Что происходит с градиентами в глубокой сети с sigmoid activations?" "Производная sigmoid максимум 0.25. При многократном перемножении такие множители быстро уменьшают сигнал, поэтому ранние слои получают почти нулевой gradient."
  ) @(
    "Почему backward pass зависит от значений, сохранённых во forward pass?",
    "Где в backprop появляется transpose и почему?",
    "Что такое VJP и почему он практичнее полного Jacobian?",
    "Как отличить ошибку optimizer-а от ошибки backward-а?",
    "Почему finite differences полезен для проверки ручных градиентов?"
  ) @(
    "Объясни backprop как передачу ответственности за ошибку назад по графу.",
    "Объясни, почему dL/dW зависит и от входа слоя, и от ошибки на выходе слоя."
  )
}

$notes["04_training/02_optimizers"] = @{
  Path = "04_training/02_optimizers.html"
  Note = Note "Оптимизаторы" @(
    Ex "Type A — Derivation" "Foundational" "Запиши update SGD для theta и объясни знак минус через направление градиента." "Градиент указывает направление роста loss, поэтому для минимизации делаем theta_new = theta - lr * grad. Если знак перепутать, loss будет расти."
    Ex "Type A — Derivation" "Intermediate" "Выведи momentum update как exponential moving average градиентов и объясни роль beta." "v_t = beta v_{t-1} + (1-beta) g_t. Большой beta дольше помнит прошлое и сильнее сглаживает шум, но медленнее реагирует на смену направления."
    Ex "Type B — Coding" "Foundational" "Реализуй SGD и Momentum для функции f(x,y)=x^2+20y^2 и сравни траектории." "Momentum должен уменьшить зигзаги в узкой долине, если learning rate выбран стабильно. Если lr слишком большой, momentum может усилить overshoot."
    Ex "Type B — Coding" "Intermediate" "Реализуй optimizer step, который принимает параметры и градиенты списком NumPy-массивов." "Это упражнение проверяет, что optimizer — это отдельная логика update-а, а не часть forward model. Shapes параметров и градиентов должны совпадать."
    Ex "Type C — Conceptual" "Foundational" "Почему один и тот же learning rate может быть нормальным для SGD и слишком большим для Adam или наоборот?" "Optimizer меняет effective step. Adam нормирует шаг по истории градиентов, SGD нет. Поэтому одинаковый base lr не означает одинаковое движение параметров."
    Ex "Type C — Conceptual" "Hard" "Как batch size влияет на шумность градиента и на выбор learning rate?" "Больший batch даёт менее шумную оценку градиента, но дороже шаг. Часто при увеличении batch можно увеличить lr, но это ограничено стабильностью и generalization."
  ) @(
    "Чем SGD отличается от full-batch gradient descent?",
    "Что momentum запоминает и почему это помогает?",
    "Почему optimizer нельзя оценивать без learning rate schedule?",
    "Что означает effective learning rate?",
    "Как понять по loss curve, что lr слишком большой?"
  ) @(
    "Объясни optimizer как правило движения по поверхности loss.",
    "Объясни momentum через аналогию с тяжёлым шаром в долине."
  )
}

$notes["04_training/03_adam_adamw_lion"] = @{
  Path = "04_training/03_adam_adamw_lion.html"
  Note = Note "Adam, AdamW, Lion" @(
    Ex "Type A — Derivation" "Foundational" "Распиши один шаг Adam: m_t, v_t, bias correction, update theta. Объясни, зачем нужен epsilon." "m_t хранит EMA градиента, v_t хранит EMA квадрата градиента. Bias correction компенсирует старт с нуля. epsilon защищает от деления на ноль и стабилизирует маленькие v."
    Ex "Type A — Derivation" "Intermediate" "Покажи разницу между L2 penalty внутри Adam и decoupled weight decay в AdamW." "В Adam L2 добавляется к градиенту и затем проходит через адаптивный делитель. В AdamW decay применяется отдельно к параметрам, поэтому штраф не искажается per-parameter scaling."
    Ex "Type B — Coding" "Foundational" "Реализуй один AdamW update для NumPy-вектора параметров." "Код должен сделать m/v update, bias correction, adaptive step и decoupled decay. Проверяй порядок операций." $adamCode
    Ex "Type B — Coding" "Intermediate" "Сравни sign update Lion с AdamW на одном и том же градиенте. Что теряется при переходе к sign?" "Sign update сохраняет направление по знаку, но теряет информацию о величине градиента. Это может быть эффективно, но требует аккуратного lr."
    Ex "Type C — Conceptual" "Foundational" "Почему Adam часто быстрее стартует, чем SGD?" "Он адаптирует шаги по координатам и сглаживает шумные градиенты, поэтому лучше переносит разные масштабы параметров и sparse gradients."
    Ex "Type C — Conceptual" "Hard" "Почему AdamW стал дефолтом для многих Transformer-like моделей?" "Decoupled weight decay лучше контролирует нормы весов в adaptive optimizer-е, а Adam-динамика хорошо работает с noisy gradients, LayerNorm и большими моделями."
  ) @(
    "Что хранят первый и второй моменты Adam?",
    "Зачем нужна bias correction?",
    "Чем AdamW отличается от Adam + L2?",
    "Почему Lion требует другой learning rate?",
    "Какие симптомы говорят, что weight decay выбран плохо?"
  ) @(
    "Объясни Adam как осторожного водителя, который смотрит и на направление, и на тряску дороги.",
    "Объясни decoupled weight decay без формул."
  )
}

$notes["04_training/04_regularization"] = @{
  Path = "04_training/04_regularization.html"
  Note = Note "Регуляризация" @(
    Ex "Type A — Derivation" "Foundational" "Для loss L + lambda * ||w||^2 выведи gradient update и покажи, где появляется weight decay." "Градиент штрафа равен 2 lambda w. SGD update: w <- w - lr(grad_L + 2 lambda w) = (1 - 2 lr lambda)w - lr grad_L. Поэтому L2 тянет веса к нулю."
    Ex "Type A — Derivation" "Intermediate" "Объясни inverted dropout scaling: почему во время обучения activations делят на 1-p?" "Если нейрон оставлен с вероятностью 1-p, то без scaling expectation уменьшится. Деление на 1-p сохраняет expected activation, чтобы train и eval масштабы были ближе."
    Ex "Type B — Coding" "Foundational" "Реализуй dropout mask для матрицы activations и проверь, что среднее примерно сохраняется." "При достаточно большом числе элементов среднее после inverted dropout должно быть близко к исходному среднему." "# What it does: inverted dropout on activations`n# Input shape: A=(batch,features)`n# Output shape: A_drop=(batch,features)`nimport numpy as np`nrng = np.random.default_rng(0)`nA = np.ones((1000, 100))`np = 0.3`nmask = rng.binomial(1, 1-p, size=A.shape)`nA_drop = A * mask / (1-p)`nprint(A.mean(), A_drop.mean())`n# Gotchas: apply dropout only in train mode; do not scale again at eval."
    Ex "Type B — Coding" "Intermediate" "Напиши эксперимент: train/validation gap для polynomial regression при разных lambda." "Ожидаемый результат: при lambda=0 модель может overfit, при умеренной lambda validation улучшается, при слишком большой lambda появляется underfit."
    Ex "Type C — Conceptual" "Foundational" "Почему регуляризация не всегда улучшает качество?" "Если модель уже underfit или проблема в данных/метрике, дополнительное ограничение только ухудшит train и validation."
    Ex "Type C — Conceptual" "Hard" "Почему dropout и weight decay не являются взаимозаменяемыми?" "Weight decay ограничивает нормы весов, dropout добавляет шум и заставляет сеть распределять представления. Они влияют на разные failure modes."
  ) @(
    "Как L2 превращается в weight decay в SGD?",
    "Что показывает train-validation gap?",
    "Когда dropout вреден?",
    "Почему label smoothing влияет на calibration?",
    "Чем data augmentation отличается от penalty на веса?"
  ) @(
    "Объясни регуляризацию как запрет модели слишком доверять случайным деталям train set.",
    "Объясни dropout как тренировку команды без части игроков."
  )
}

foreach ($entry in $notes.GetEnumerator()) {
  AddBlock -Path $entry.Value.Path -TopicId $entry.Key -Note $entry.Value.Note
}

