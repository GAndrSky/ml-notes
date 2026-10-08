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
  return (($Items | ForEach-Object { "          <li>$(ConvertTo-HtmlText $_)</li>" }) -join "`r`n")
}

function New-Card {
  param([string]$Title, [string[]]$Items, [string]$ClassName)
  $safeTitle = ConvertTo-HtmlText $Title
  $list = New-List $Items
  return @"
        <div class="$ClassName">
          <h3>$safeTitle</h3>
          <ul>
$list
          </ul>
        </div>
"@
}

function New-TheoryExpansion {
  param([hashtable]$Note)

  $title = ConvertTo-HtmlText $Note.Title
  $paragraphs = New-Paragraphs $Note.Paragraphs
  $mental = New-Card "Как думать об этой теме" $Note.MentalModel "info"
  $practice = New-Card "Что проверять в практике" $Note.PracticeChecks "success"
  $pitfalls = New-Card "Где чаще всего ошибаются" $Note.Pitfalls "warn"
  $interview = New-Card "Как объяснить на собеседовании" $Note.Interview "info"

  return @"

<!-- theory-expansion:start -->
    <section class="concept-walkthrough theory-expansion" data-theory-expansion="1">
      <div class="concept-walkthrough__kicker">Теоретический слой</div>
      <h2>$title</h2>
$paragraphs
      <div class="grid-2">
$mental
$practice
$pitfalls
$interview
      </div>
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
  } else {
    $html = $html.Replace('</div>' + "`r`n  <script", $block + "`r`n</div>`r`n  <script")
  }

  Set-Content -LiteralPath $fullPath -Value $html -Encoding UTF8
  Write-Host "Updated: $RelativePath"
}

$notes = [ordered]@{
  "06_llm/01_tokenization_bpe.html" = @{
    Title = "Tokenizer как часть модели, а не техническая мелочь"
    Paragraphs = @(
      "Tokenizer задаёт то, какие фрагменты текста вообще доступны модели как атомарные единицы. Если строка распалась на слишком много токенов, attention платит больше compute, контекст расходуется быстрее, а статистика редких фрагментов становится шумнее.",
      "Важно отделять лингвистическую интуицию от статистической. BPE, WordPiece и Unigram не обязаны находить красивые морфемы. Они строят компромисс между размером словаря, длиной последовательности и покрытием редких строк.",
      "Для подготовки полезно думать о tokenization как о первом bottleneck LLM: до embeddings, attention и pre-training модель уже получила искажённое, дискретное представление текста."
    )
    MentalModel = @(
      "Большой vocabulary уменьшает sequence length, но увеличивает embedding matrix и делает редкие токены менее обученными.",
      "Маленький vocabulary лучше покрывает новые строки, но удлиняет контекст и повышает цену attention.",
      "Byte-level tokenizer почти не имеет unknown tokens, но может давать странные разбиения для языков, символов и форматирования."
    )
    PracticeChecks = @(
      "Смотри tokens per word / tokens per character на своём домене, а не только средние метрики на английском.",
      "Проверяй код, числа, пробелы, Unicode, русский текст и специальные символы отдельно.",
      "При смене tokenizer почти всегда нужна новая embedding matrix или полный re-training совместимых слоёв."
    )
    Pitfalls = @(
      "Думать, что токены равны словам и context length равен числу слов.",
      "Сравнивать модели по context length без учёта tokenizer-а: 8k токенов у разных tokenizer-ов покрывают разный текст.",
      "Игнорировать домен: tokenizer для общего текста может плохо сжимать логи, код, медицину или юридические документы."
    )
    Interview = @(
      "Начни с проблемы word-level vocabulary: редкость, OOV и огромный словарь.",
      "Объясни subword-компромисс: частые куски становятся короткими, редкие строки собираются из частей.",
      "Заверши практическим выводом: tokenizer влияет на стоимость, контекст, качество embeddings и поведение модели."
    )
  }
  "06_llm/02_pretraining_objectives.html" = @{
    Title = "Pre-training objective как источник базовых способностей"
    Paragraphs = @(
      "Pre-training не учит модель быть ассистентом напрямую. Он учит предсказывать структуру текста в огромном корпусе, и из этой задачи возникают grammar, factual associations, coding patterns, reasoning templates и knowledge compression.",
      "Next-token prediction кажется простой целью, но она заставляет модель строить внутреннее состояние, достаточное для продолжения контекста. Чтобы хорошо предсказать следующий токен, нужно учитывать стиль, факты, синтаксис, задачу, long-range dependencies и скрытое намерение текста.",
      "Ключевой практический вывод: качество pre-training определяется не только числом токенов. Data mixture, deduplication, contamination, document quality, curriculum и token distribution напрямую меняют будущие способности модели."
    )
    MentalModel = @(
      "Loss pre-training измеряет сжатие распределения текста, а не helpfulness.",
      "Lower perplexity обычно помогает, но не гарантирует хорошее instruction following.",
      "Модель учит статистику корпуса, включая шум, bias, форматные привычки и повторяющиеся ошибки."
    )
    PracticeChecks = @(
      "Разделяй train loss, validation loss и downstream evals: они отвечают на разные вопросы.",
      "Проверяй data contamination, если eval выглядит слишком хорошим.",
      "Смотри качество данных по доменам: код, математика, диалоги, документы и web text дают разные навыки."
    )
    Pitfalls = @(
      "Считать next-token prediction слишком слабой задачей: на масштабе она становится богатым self-supervised сигналом.",
      "Путать pre-training knowledge с alignment behavior.",
      "Оценивать pre-training только по одному validation loss без downstream задач."
    )
    Interview = @(
      "Скажи, что pre-training строит base model через self-supervised objective.",
      "Объясни, почему next-token prediction требует modelling hidden structure.",
      "Отдельно подчеркни, что instruction tuning и RLHF меняют поведение, а не создают основную массу знаний с нуля."
    )
  }
  "06_llm/03_instruction_tuning.html" = @{
    Title = "Instruction tuning превращает base model в управляемую модель"
    Paragraphs = @(
      "Base model умеет продолжать текст, но не обязана следовать инструкции. Instruction tuning меняет распределение поведения: модель начинает воспринимать prompt как задачу, соблюдать формат ответа и имитировать паттерны полезного ассистента.",
      "Главная ценность SFT-датасета не в размере, а в качестве демонстраций. Несколько тысяч хорошо подобранных examples могут сильнее изменить поведение, чем большой, но шумный набор однотипных ответов.",
      "Instruction tuning также задаёт стиль отказов, формат reasoning, длину ответа, предпочтение структурированных списков и тон общения. Поэтому SFT надо рассматривать как behavioral fine-tuning, а не просто supervised loss."
    )
    MentalModel = @(
      "SFT учит не знаниям в широком смысле, а форме использования уже выученных способностей.",
      "Dataset distribution становится implicit product spec: модель копирует стиль, формат и границы ответов.",
      "Слишком узкий SFT может ухудшить generality, даже если training loss выглядит хорошо."
    )
    PracticeChecks = @(
      "Проверяй diversity инструкций: QA, rewriting, coding, refusal, multi-step tasks, tool-like prompts.",
      "Смотри eval не только на helpful examples, но и на edge cases: ambiguous prompts, unsafe requests, incomplete context.",
      "Контролируй длину и формат ответов: модель быстро перенимает шаблонные привычки датасета."
    )
    Pitfalls = @(
      "Считать SFT простым дообучением на правильных ответах без product consequences.",
      "Делать датасет из однотипных длинных ответов и получать verbose model.",
      "Использовать синтетические ответы без фильтрации качества, фактических ошибок и стиля."
    )
    Interview = @(
      "Раздели base LM и assistant model: первая продолжает текст, вторая следует инструкциям.",
      "Объясни, что SFT задаёт поведенческий prior через демонстрации.",
      "Добавь ограничение: SFT не решает preference optimization и часто дополняется RLHF/DPO."
    )
  }
  "06_llm/04_rlhf.html" = @{
    Title = "RLHF как оптимизация предпочтений под ограничением"
    Paragraphs = @(
      "RLHF нужен там, где нет единственного правильного target-а, но есть человеческое предпочтение между ответами. Модель учится не просто повторять демонстрации, а сдвигать policy в сторону ответов, которые люди чаще выбирают.",
      "Reward model является суррогатом, а не истиной. Поэтому весь RLHF держится на балансе: улучшать preference score, но не дать policy уйти слишком далеко от reference model и не начать эксплуатировать слабости reward model.",
      "Самое важное для понимания RLHF: это не магический слой безопасности и не способ добавить знания. Это механизм изменения поведения под noisy preference signal."
    )
    MentalModel = @(
      "SFT задаёт стартовую policy, reward model оценивает ответы, PPO/DPO-подобный этап меняет вероятности ответов.",
      "KL к reference model работает как страховочный трос: он ограничивает слишком резкие поведенческие сдвиги.",
      "Reward hacking возникает, когда model learns to please the reward model instead of the human."
    )
    PracticeChecks = @(
      "Оценивай helpfulness, harmlessness, factuality и refusal behavior раздельно.",
      "Смотри reward score вместе с human eval: рост reward не всегда означает рост качества.",
      "Проверяй regressions: RLHF может улучшить стиль, но ухудшить калибровку, краткость или фактическую точность."
    )
    Pitfalls = @(
      "Принимать reward model за объективную метрику истины.",
      "Ставить слишком слабый KL и получать странный over-optimized style.",
      "Считать RLHF заменой data quality, retrieval, reasoning evals или safety evals."
    )
    Interview = @(
      "Опиши pipeline: SFT, preference data, reward model, policy optimization with KL.",
      "Объясни proxy problem и reward hacking.",
      "Скажи, что RLHF оптимизирует предпочтения, но требует независимых evals и ограничений."
    )
  }
  "06_llm/05_lora_qlora.html" = @{
    Title = "LoRA/QLoRA как параметрически дешёвое изменение поведения"
    Paragraphs = @(
      "LoRA исходит из наблюдения, что для адаптации модели не всегда нужно менять всю огромную матрицу весов. Достаточно учить low-rank поправку, которая добавляется к замороженным весам и меняет нужное поведение.",
      "Это даёт сильную практическую экономию: меньше обучаемых параметров, меньше optimizer state, проще хранить несколько адаптеров под разные задачи. QLoRA добавляет к этому quantization base model, чтобы обучать адаптеры ещё дешевле по памяти.",
      "Но LoRA не бесплатная магия. Rank, target modules, alpha, dropout, качество данных и quantization format сильно влияют на то, сможет ли адаптер выразить нужное изменение."
    )
    MentalModel = @(
      "Base model остаётся основным носителем знаний, adapter задаёт компактный поведенческий сдвиг.",
      "Rank r контролирует bottleneck: слишком малый rank недовыражает задачу, слишком большой повышает риск переобучения и стоимость.",
      "Target modules определяют, какие части computation graph вообще могут измениться."
    )
    PracticeChecks = @(
      "Начинай с attention projections и MLP projections, затем проверяй ablation по target modules.",
      "Следи за trainable params, VRAM, validation loss и task-specific evals, а не только за training loss.",
      "Для QLoRA проверяй, не ломает ли quantization редкие доменные навыки или численную стабильность."
    )
    Pitfalls = @(
      "Ожидать, что маленький adapter добавит знания, которых нет в base model и данных.",
      "Поднимать rank вместо исправления плохого датасета.",
      "Сравнивать LoRA runs без одинакового prompt format и eval protocol."
    )
    Interview = @(
      "Объясни формулу ΔW = BA: большая поправка заменяется произведением двух маленьких матриц.",
      "Скажи, почему это экономит optimizer state и память.",
      "Добавь ограничения: capacity adapter-а ограничена rank-ом и выбранными target modules."
    )
  }
  "06_llm/06_scaling_laws.html" = @{
    Title = "Scaling laws как инженерная экономика качества"
    Paragraphs = @(
      "Scaling laws полезны не тем, что дают одну магическую формулу, а тем, что превращают рост модели в управляемый trade-off. Качество зависит от параметров, данных и compute, и плохое распределение бюджета может дать хуже результат, чем меньшая, но правильно обученная модель.",
      "Chinchilla-style вывод важен как принцип: при фиксированном compute нельзя бесконечно увеличивать параметры и недообучать модель на малом количестве токенов. Data-optimal training часто требует больше качественных токенов на параметр, чем ранние рецепты.",
      "Для подготовки важно понимать, что scaling laws описывают тренды, а не гарантии. Data quality, architecture, tokenizer, contamination, curriculum и optimizer recipe могут сдвигать кривые."
    )
    MentalModel = @(
      "Compute budget распределяется между model size, number of tokens и training efficiency.",
      "Undertrained large model может проиграть smaller compute-optimal model.",
      "Loss curves нужны для прогнозирования, но downstream способности появляются не идеально гладко."
    )
    PracticeChecks = @(
      "Смотри tokens-per-parameter и не сравнивай модели только по числу параметров.",
      "Отделяй raw token count от quality-adjusted token count.",
      "Проверяй, не достигла ли модель data bottleneck или optimization bottleneck."
    )
    Pitfalls = @(
      "Считать, что больше параметров всегда лучше при любом compute.",
      "Игнорировать качество данных и считать все токены одинаковыми.",
      "Переносить scaling law вне режима, где она была измерена."
    )
    Interview = @(
      "Скажи, что scaling laws описывают предсказуемое снижение loss с ростом ресурсов.",
      "Объясни Chinchilla intuition: compute надо балансировать между параметрами и токенами.",
      "Заверши практическим выводом: для планирования training run важнее compute-optimal recipe, чем размер ради размера."
    )
  }
  "07_generative_models/01_variational_autoencoders.html" = @{
    Title = "VAE как вероятностный autoencoder с управляемым latent space"
    Paragraphs = @(
      "Обычный autoencoder может научиться удобному коду, но этот код не обязан быть пригодным для генерации. VAE добавляет вероятностную структуру: encoder выдаёт распределение, decoder учится восстанавливать из sampled latent, а prior заставляет latent space быть связным.",
      "ELBO можно читать как компромисс: reconstruction term хочет сохранить информацию о конкретном объекте, KL term хочет, чтобы posterior не слишком далеко ушёл от prior. В этом напряжении возникает генеративность VAE.",
      "Главная практическая опасность — posterior collapse. Если decoder слишком сильный или KL включён слишком резко, модель может игнорировать latent variable."
    )
    MentalModel = @(
      "Encoder строит q(z|x), decoder строит p(x|z), prior p(z) задаёт пространство для sampling.",
      "Reparameterization trick не убирает случайность, а переносит её в ε, чтобы сохранить gradient path.",
      "KL term делает latent space гладким, но может задавить информацию."
    )
    PracticeChecks = @(
      "Отслеживай reconstruction loss и KL отдельно, а не только суммарный ELBO.",
      "Проверяй latent traversals: меняется ли sample осмысленно при движении по latent axes.",
      "Используй KL annealing или beta-VAE, если видишь collapse или плохую структуру latent space."
    )
    Pitfalls = @(
      "Путать хороший reconstruction с хорошей генерацией.",
      "Считать prior формальностью: именно он делает sampling осмысленным.",
      "Сравнивать VAE с GAN только по sharpness samples, игнорируя likelihood и latent control."
    )
    Interview = @(
      "Начни с latent variable model: p(x,z)=p(z)p(x|z).",
      "Выведи смысл ELBO как reconstruction минус KL.",
      "Объясни reparameterization trick и posterior collapse."
    )
  }
  "07_generative_models/02_generative_adversarial_networks.html" = @{
    Title = "GAN как нестабильная, но мощная игра распределений"
    Paragraphs = @(
      "GAN не максимизирует likelihood напрямую. Он обучает два процесса: discriminator ищет отличие между real и generated samples, generator меняет своё распределение так, чтобы это отличие стало труднее найти.",
      "Из-за этого loss GAN нельзя читать как обычный supervised loss. Если discriminator становится слишком сильным, generator может получать плохой gradient. Если discriminator слишком слабый, feedback становится бессмысленным.",
      "GAN важен для понимания generative modeling именно как пример adversarial objective: высокое визуальное качество может прийти вместе с mode collapse и плохим покрытием распределения."
    )
    MentalModel = @(
      "Generator двигает p_G, discriminator оценивает различимость p_G и p_data.",
      "Сходимость зависит от динамики двух игроков, а не только от одного objective.",
      "Wasserstein view делает расстояние между распределениями более геометрически осмысленным."
    )
    PracticeChecks = @(
      "Смотри diversity samples, а не только sharpness.",
      "Отслеживай balance D/G: accuracy discriminator, gradient norms, sample collapse.",
      "Пробуй spectral normalization, gradient penalty, label smoothing и разные update ratios."
    )
    Pitfalls = @(
      "Считать красивый cherry-picked sample доказательством хорошей модели.",
      "Оценивать training только по generator/discriminator loss.",
      "Не замечать mode collapse, если нет diversity grid или nearest-neighbor анализа."
    )
    Interview = @(
      "Объясни minimax: discriminator максимизирует различение, generator минимизирует различимость.",
      "Расскажи mode collapse как failure coverage.",
      "Свяжи WGAN с более гладким расстоянием между распределениями."
    )
  }
  "07_generative_models/03_diffusion_models.html" = @{
    Title = "Diffusion как обучение обратного процесса удаления шума"
    Paragraphs = @(
      "Diffusion models превращают генерацию в последовательность простых denoising-задач. Forward process постепенно добавляет шум к данным, а neural network учится идти назад: предсказывать шум, чистый sample или velocity.",
      "Сила diffusion в том, что обучение становится стабильнее adversarial игры: модель получает supervised-like сигнал на каждом noise level. Цена — sampling обычно требует много шагов, хотя современные samplers сильно ускоряют процесс.",
      "Для подготовки важно понимать три слоя: noise schedule, prediction target и sampler. Они вместе определяют качество, скорость и устойчивость генерации."
    )
    MentalModel = @(
      "Forward process фиксирован и разрушает данные до шума.",
      "Reverse process обучается и постепенно восстанавливает структуру.",
      "Score matching intuition: модель учится направлению, куда надо двигаться от шума к data manifold."
    )
    PracticeChecks = @(
      "Проверяй noise schedule: слишком агрессивный schedule усложняет denoising.",
      "Сравнивай ε-prediction, x0-prediction и v-prediction для конкретной архитектуры.",
      "Оцени sampler steps, guidance scale и diversity вместе, потому что они конфликтуют."
    )
    Pitfalls = @(
      "Думать, что больше denoising steps всегда лучше: после точки насыщения растёт цена, а качество почти не меняется.",
      "Ставить слишком высокий guidance и получать красивые, но менее разнообразные samples.",
      "Путать training objective и sampling algorithm: модель одна, samplers могут быть разные."
    )
    Interview = @(
      "Опиши forward noising и learned reverse denoising.",
      "Объясни, почему задача обучения стабильнее GAN.",
      "Добавь trade-off: качество и controllability против стоимости sampling."
    )
  }
  "08_training_practice/01_distributed_training.html" = @{
    Title = "Distributed training как борьба с памятью и коммуникацией"
    Paragraphs = @(
      "Distributed training нужен не только для скорости. Часто одна модель или один batch просто не помещаются на один GPU, и приходится разделять параметры, optimizer state, gradients или данные.",
      "DDP и FSDP решают разные задачи. DDP реплицирует модель и синхронизирует градиенты, что просто и эффективно, пока модель помещается на каждую карту. FSDP шардирует параметры и optimizer state, экономя память ценой более сложной коммуникации.",
      "Главная инженерная мысль: после некоторого масштаба bottleneck переносится с compute на communication, dataloader, synchronization и memory movement."
    )
    MentalModel = @(
      "Data parallelism делит batch, model parallelism делит модель, sharding делит состояние.",
      "All-reduce gradients стоит времени и сети, а не FLOPs GPU.",
      "Effective batch size меняет optimization dynamics, поэтому scaling требует LR/schedule adjustments."
    )
    PracticeChecks = @(
      "Смотри GPU utilization, step time breakdown, communication time и dataloader wait.",
      "Проверяй, одинаковы ли random seeds, shuffling и gradients across ranks.",
      "Следи за memory per rank: параметры, gradients, activations, optimizer state, buffers."
    )
    Pitfalls = @(
      "Думать, что больше GPU всегда почти линейно ускоряют training.",
      "Игнорировать network bandwidth и topology.",
      "Сравнивать runs с разным effective batch без корректного LR scaling."
    )
    Interview = @(
      "Сравни DDP и FSDP через память и коммуникацию.",
      "Объясни all-reduce как синхронизацию градиентов.",
      "Назови bottlenecks: communication, dataloader, memory, stragglers."
    )
  }
  "08_training_practice/02_gradient_checkpointing.html" = @{
    Title = "Gradient checkpointing как обмен памяти на compute"
    Paragraphs = @(
      "Backprop требует хранить activations, потому что они нужны для вычисления градиентов. В больших моделях именно activations часто становятся главным потребителем памяти, особенно при длинном context length.",
      "Gradient checkpointing сохраняет только часть activations, а остальные пересчитывает во время backward. Поэтому память уменьшается, но compute и wall-clock time растут.",
      "Это не оптимизация скорости. Это способ сделать training возможным при ограниченной памяти или поднять batch/context/model size ценой дополнительных forward recomputations."
    )
    MentalModel = @(
      "Без checkpointing храним больше, считаем меньше.",
      "С checkpointing храним меньше, считаем часть forward повторно.",
      "Лучшие checkpoints ставятся на границах блоков, где recompute дешёв относительно memory saved."
    )
    PracticeChecks = @(
      "Измеряй peak memory и step time до/после, а не только факт запуска.",
      "Проверяй корректность с dropout/RNG: recompute должен быть согласованным.",
      "Комбинируй checkpointing с mixed precision, FSDP и sequence packing осторожно."
    )
    Pitfalls = @(
      "Включить checkpointing везде и неожиданно сильно замедлить training.",
      "Не учитывать, что memory bottleneck может быть optimizer state, а не activations.",
      "Забыть проверить deterministic behavior при recomputation."
    )
    Interview = @(
      "Объясни, какие activations нужны backward pass.",
      "Скажи, что checkpointing удаляет часть activations и пересчитывает их.",
      "Назови trade-off: меньше memory, больше compute."
    )
  }
  "08_training_practice/03_profiling_and_performance.html" = @{
    Title = "Profiling как поиск настоящего bottleneck, а не угадывание"
    Paragraphs = @(
      "Performance optimization без профилирования почти всегда превращается в гадание. Training step состоит из dataloader, host-to-device transfer, forward, backward, optimizer step, communication и logging. Узкое место может быть в любом из этих сегментов.",
      "Главная задача profiling — не получить красивый граф, а отделить compute-bound проблему от memory-bound, input-bound или communication-bound проблемы.",
      "Для больших моделей важно смотреть не только average step time. Нужны variance, spikes, GPU idle gaps, kernel fragmentation и synchronization points."
    )
    MentalModel = @(
      "GPU utilization низкий не всегда означает слабую модель: возможно, CPU/dataloader не успевает кормить GPU.",
      "Много маленьких kernels может быть хуже одного крупного fused kernel.",
      "Синхронизации скрывают latency и ломают параллелизм."
    )
    PracticeChecks = @(
      "Разделяй data time, compute time, communication time и logging/checkpoint time.",
      "Проверяй batch size, num_workers, pinned memory, prefetch, sequence padding и kernel fusion.",
      "Сравнивай throughput в tokens/sec или samples/sec, а не только loss/sec."
    )
    Pitfalls = @(
      "Оптимизировать Python-код, когда bottleneck в GPU kernels или communication.",
      "Смотреть только среднее время шага и игнорировать spikes.",
      "Добавлять слишком частый logging/evaluation/checkpointing и портить throughput."
    )
    Interview = @(
      "Скажи, что profiling начинается с breakdown training step.",
      "Объясни difference between compute-bound, memory-bound, input-bound, communication-bound.",
      "Приведи пример: если GPU idle, проверь dataloader и host-to-device transfer."
    )
  }
  "08_training_practice/04_debugging_loss_spikes.html" = @{
    Title = "Loss spikes как симптом, а не диагноз"
    Paragraphs = @(
      "Loss spike говорит только, что training dynamics резко ухудшилась. Он не говорит причину. Причина может быть в bad batch, learning rate, mixed precision, exploding gradients, неправильных targets, data corruption или нестабильной нормализации.",
      "Хороший debugging строится вокруг первого плохого шага. Если поймать batch id, logits range, grad norm, loss components и precision state до/после spike, поиск становится инженерной задачей, а не случайным тюнингом.",
      "Самый опасный подход — просто уменьшить learning rate и забыть. Иногда это маскирует data bug или NaN source, который потом вернётся на большем масштабе."
    )
    MentalModel = @(
      "Spike может быть optimization issue, data issue, numerical issue или systems issue.",
      "Нужно локализовать первый момент divergence, а не анализировать только финальный NaN.",
      "Loss components важнее общего loss, если objective состоит из нескольких частей."
    )
    PracticeChecks = @(
      "Логируй grad norm, logits min/max, activation stats, lr, batch id, sequence length и loss components.",
      "Сохраняй problematic batch для воспроизведения.",
      "Пробуй disable AMP, lower LR, gradient clipping и data validation по отдельности, чтобы не смешивать причины."
    )
    Pitfalls = @(
      "Менять много гиперпараметров одновременно и терять причинность.",
      "Игнорировать редкие batches: один corrupted sample может ломать training.",
      "Смотреть только train loss без validation и без stats по logits/gradients."
    )
    Interview = @(
      "Скажи, что spike — symptom, и перечисли группы причин.",
      "Опиши минимальный debug pack: batch, lr, grad norm, logits, NaN/Inf, loss components.",
      "Объясни, почему нужно воспроизводить первый плохой шаг."
    )
  }
  "04_training/09_numerical_stability.html" = @{
    Title = "Численная устойчивость как обязательная часть training recipe"
    Paragraphs = @(
      "Numerical stability — это не отдельная проблема только для low-level инженеров. В deep learning почти каждая большая модель упирается в ограниченный диапазон float, накопление ошибок, экспоненты, логарифмы и scaling градиентов.",
      "Две математически одинаковые формулы могут вести себя совершенно по-разному на GPU. Stable softmax, log-sum-exp, epsilon в знаменателях, gradient clipping и loss scaling — это способы записать вычисления так, чтобы training loop не разрушался от крайних значений.",
      "Для подготовки важно уметь объяснять не только что такое overflow/underflow, но и как их диагностировать: где впервые появляется Inf/NaN, какие tensors имеют экстремальный range и какой компонент loss породил проблему."
    )
    MentalModel = @(
      "Float — это конечная сетка чисел, а не настоящие вещественные числа.",
      "Overflow заражает граф через Inf/NaN, underflow тихо зануляет маленькие вероятности и градиенты.",
      "Стабильная запись формулы сохраняет смысл, но меняет порядок вычислений."
    )
    PracticeChecks = @(
      "Используй log_softmax / CrossEntropyLoss вместо ручного softmax + log.",
      "Логируй logits range, grad norm, loss scale, NaN/Inf counts и activation stats.",
      "Если проблема непонятна, временно отключи mixed precision и сравни поведение."
    )
    Pitfalls = @(
      "Считать NaN случайностью и просто перезапускать training.",
      "Добавлять epsilon везде без понимания масштаба величин.",
      "Игнорировать data preprocessing: экстремальные входы часто запускают numerical failures."
    )
    Interview = @(
      "Объясни overflow, underflow и cancellation.",
      "Покажи stable softmax через вычитание max.",
      "Назови практический debug route: найти первый Inf/NaN, проверить logits/gradients/loss scale/data batch."
    )
  }
}

foreach ($entry in $notes.GetEnumerator()) {
  Add-TheoryExpansion -RelativePath $entry.Key -Note $entry.Value
}

