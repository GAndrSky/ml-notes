$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Web

$root = Split-Path -Parent $PSScriptRoot

function HtmlText {
  param([string]$Text)
  return [System.Web.HttpUtility]::HtmlEncode($Text)
}

function Remove-DeepeningBlocks {
  param([string]$Html)
  return [regex]::Replace($Html, '(?is)\s*<!-- frontier-deepening:start:[^>]+ -->.*?<!-- frontier-deepening:end -->\s*', "`r`n")
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

<!-- frontier-deepening:start:$id -->
  <section class="concept-walkthrough" data-frontier-deepening="$id">
    <div class="concept-walkthrough__kicker">Теория глубже</div>
    <h3>$title</h3>
$($paragraphs -join "`r`n")
$list
  </section>
<!-- frontier-deepening:end -->
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
    return $Html.Insert($heading.Index + $heading.Length, $Block)
  }
  return $Html.Insert($insertAt, $Block)
}

$pages = @()

$pages += @(
  @{
    File = "06_llm/01_tokenization_bpe.html"
    Inserts = @(
      @{
        Id = "6-1-tokenizer-contract"
        After = "Почему tokenization"
        Title = "Tokenizer задаёт контракт между текстом и моделью"
        Paragraphs = @(
          "LLM не видит слова напрямую. Она видит последовательность token ids, и все дальнейшие операции работают именно с этой дискретной последовательностью. Поэтому tokenizer определяет, какие куски текста модель может обрабатывать как единицы смысла.",
          "Если tokenizer плохо покрывает язык, домен или код, модель получает длинные и шумные последовательности. Это повышает стоимость attention и усложняет обучение зависимостей."
        )
        Items = @(
          "Хороший tokenizer сжимает частые паттерны в короткие последовательности.",
          "Редкие слова и новые домены распадаются на больше токенов.",
          "Изменение tokenizer обычно несовместимо с уже обученными embeddings."
        )
      },
      @{
        Id = "6-1-bpe-compression"
        After = "Идея BPE"
        Title = "BPE - это жадное сжатие частых пар"
        Paragraphs = @(
          "BPE начинает с маленьких единиц и много раз объединяет самые частые соседние пары. В результате частые слова, морфемы, пробелы и куски кода получают короткие токены, а редкие строки всё равно можно собрать из меньших частей.",
          "Это не лингвистический парсер. BPE оптимизирует статистическую частоту, поэтому границы токенов не обязаны совпадать с границами слов или морфем."
        )
        Items = @(
          "Большой vocab уменьшает длину sequence, но увеличивает embedding matrix.",
          "Маленький vocab универсальнее, но даёт длинные последовательности.",
          "Доменные данные меняют то, какие merge rules окажутся полезными."
        )
      },
      @{
        Id = "6-1-byte-level"
        After = "Byte-level"
        Title = "Byte-level tokenization почти убирает OOV, но меняет гранулярность"
        Paragraphs = @(
          "Byte-level подход гарантирует, что любой текст можно представить через байты. Это удобно для многоязычности, emoji, кода и неожиданных символов, потому что tokenizer не ломается на unknown token.",
          "Цена - часть редких или необычных строк превращается в длинную цепочку мелких токенов. Модель всё ещё может их обработать, но контекстное окно расходуется быстрее."
        )
        Items = @(
          "Плюс: почти любой input представим без OOV.",
          "Минус: редкие символы могут быть дорогими по длине.",
          "Для кода и mixed-language текста byte-level tokenizer часто практичнее word-level."
        )
      }
    )
  },
  @{
    File = "06_llm/02_pretraining_objectives.html"
    Inserts = @(
      @{
        Id = "6-2-next-token-compression"
        After = "Базовая цель"
        Title = "Next-token prediction учит модель сжимать закономерности мира в параметры"
        Paragraphs = @(
          "Чтобы предсказать следующий токен, модель должна использовать грамматику, факты, стиль, причинные связи в тексте, формат документов и локальный контекст. Поэтому простая формулировка objective приводит к богатим внутренним представлениям.",
          "Модель не хранит train set как базу данных в прямом смысле. Она аппроксимирует распределение токенов, а параметры становятся сжатым описанием статистических закономерностей корпуса."
        )
        Items = @(
          "Loss измеряет surprise следующего токена.",
          "Context window задаёт доступную условную информацию.",
          "Качество данных ограничивает полезность выученного распределения."
        )
      },
      @{
        Id = "6-2-data-mixture"
        After = "Data mixture"
        Title = "Data mixture задаёт личность и компетенции base model"
        Paragraphs = @(
          "Архитектура определяет, что модель может представить, но смесь данных определяет, что модель чаще видит и чему придаёт вес. Код, математика, диалоги, web-текст и научные тексты формируют разные навыки.",
          "Переизбыток низкокачественных или дублированных данных может ухудшить обучение даже при большом compute. Поэтому deduplication, filtering и domain balance часто важнее мелких архитектурных изменений."
        )
        Items = @(
          "Dedup снижает memorization и wasted compute.",
          "High-quality mixture повышает sample efficiency.",
          "Domain oversampling помогает специализации, но может ухудшить общий стиль."
        )
      },
      @{
        Id = "6-2-boundary-knowledge-behavior"
        After = "Где граница"
        Title = "Pre-training даёт способности, но не обязательно удобный интерфейс поведения"
        Paragraphs = @(
          "Base model может знать много закономерностей, но не обязана отвечать как ассистент. Она продолжает текст по распределению pretraining corpus, а не следует пользовательской инструкции как продуктовая система.",
          "Instruction tuning и preference optimization меняют интерфейс поведения: как модель отвечает, отказывается, структурирует ответ и следует формату. Это надстройка над знаниями, а не полная замена pretraining."
        )
        Items = @(
          "Pretraining создаёт языковую и фактическую основу.",
          "SFT учит форматам задач и инструкций.",
          "RLHF/DPO уточняют предпочтительный стиль и безопасность поведения."
        )
      }
    )
  },
  @{
    File = "06_llm/03_instruction_tuning.html"
    Inserts = @(
      @{
        Id = "6-3-behavior-layer"
        After = "Что именно меняется"
        Title = "Instruction tuning меняет policy поведения, а не только знания"
        Paragraphs = @(
          "SFT обучает модель сопоставлять инструкцию с ожидаемым форматом ответа. Она начинает видеть prompt не как произвольный текст для продолжения, а как задачу, на которую нужно реагировать.",
          "Поэтому instruction tuning может резко улучшить пользовательское качество даже при похожем language modeling loss. Меняется распределение ответов: больше явного следования задаче, меньше случайного продолжения корпуса."
        )
        Items = @(
          "Модель учится ролям: вопрос, инструкция, контекст, ответ.",
          "Формат датасета становится частью learned interface.",
          "SFT не добавляет магически новые знания, если их не было в base model или данных."
        )
      },
      @{
        Id = "6-3-prompt-template"
        After = "шаблон промпта"
        Title = "Prompt template должен совпадать между train и inference"
        Paragraphs = @(
          "Если SFT обучалась на одном формате сообщений, а inference использует другой, модель получает distribution shift на самом входе. Спецтокены, роли, разделители и порядок секций начинают иметь смысл как управляющие сигналы.",
          "Это особенно важно для chat models. Даже сильная base model может отвечать хуже, если шаблон диалога сломан или роли перепутаны."
        )
        Items = @(
          "Chat template должен быть единым в training и serving.",
          "System/user/assistant роли нельзя подменять произвольно.",
          "Evaluation нужно запускать через тот же formatting pipeline."
        )
      },
      @{
        Id = "6-3-sft-limits"
        After = "границы instruction"
        Title = "SFT легко переучивает стиль и сложнее исправляет рассуждение"
        Paragraphs = @(
          "Instruction tuning хорошо учит формат, тон, структуру ответа и типовые навыки. Но если задача требует новых знаний, длинного reasoning или инструментального поведения, одного SFT может быть недостаточно.",
          "Слишком узкий instruction dataset может сделать модель вежливой, но менее разнообразной и менее устойчивой к нестандартным запросам. Поэтому важны coverage, negative examples и независимая оценка."
        )
        Items = @(
          "SFT улучшает interface alignment.",
          "Для сложных предпочтений часто нужны preference methods.",
          "Для новых знаний лучше retrieval, continued pretraining или качественный domain fine-tuning."
        )
      }
    )
  }
)

$pages += @(
  @{
    File = "06_llm/04_rlhf.html"
    Inserts = @(
      @{
        Id = "6-4-reward-proxy"
        After = "Reward model"
        Title = "Reward model является proxy человеческих предпочтений"
        Paragraphs = @(
          "Reward model не знает истинную полезность ответа. Он учится предсказывать, какой из двух ответов люди предпочли бы в конкретном prompt. Поэтому качество RLHF ограничено качеством preference data и тем, насколько reward generalizes.",
          "Если reward model ошибается систематически, policy optimization будет усиливать эти ошибки. Это называется reward hacking: модель находит ответы, которые выглядят хорошими для reward model, но не обязательно полезны человеку."
        )
        Items = @(
          "Preference data задаёт критерий поведения.",
          "Reward model аппроксимирует этот критерий.",
          "Policy optimization может эксплуатировать слабости reward model."
        )
      },
      @{
        Id = "6-4-ppo-kl"
        After = "PPO"
        Title = "KL penalty удерживает policy рядом с SFT-моделью"
        Paragraphs = @(
          "В LLM RLHF нельзя просто максимизировать reward. Без ограничений модель быстро уходит в странные области текста, где reward model даёт высокую оценку, но язык и полезность деградируют.",
          "KL penalty штрафует отклонение от reference policy. Это делает оптимизацию более консервативной: модель улучшает предпочтения, но не должна слишком далеко уходить от SFT-поведения."
        )
        Items = @(
          "Слабый KL повышает риск reward hacking.",
          "Сильный KL мешает реально изменить поведение.",
          "PPO clip и KL оба ограничивают слишком агрессивные policy updates."
        )
      },
      @{
        Id = "6-4-rlhf-evaluation"
        After = "Почему RLHF сложно"
        Title = "RLHF требует отдельной оценки полезности, безопасности и правдивости"
        Paragraphs = @(
          "Одна reward-метрика не покрывает все свойства ассистента. Модель может стать более вежливой, но менее честной; более безопасной, но слишком отказной; более уверенной, но хуже калиброванной.",
          "Поэтому RLHF оценивают через набор независимых checks: human preference eval, factuality, refusal behavior, jailbreak robustness, domain tasks и regression на старых навыках."
        )
        Items = @(
          "Нужны holdout prompts, которые reward model не видел.",
          "Нужно отслеживать regressions по базовым навыкам.",
          "Safety и helpfulness часто конфликтуют и требуют явного баланса."
        )
      }
    )
  },
  @{
    File = "06_llm/05_lora_qlora.html"
    Inserts = @(
      @{
        Id = "6-5-low-rank-subspace"
        After = "LoRA в одной формуле"
        Title = "LoRA ограничивает fine-tuning низкоранговым подпространством"
        Paragraphs = @(
          "Полный fine-tuning может изменить каждую координату матрицы весов. LoRA говорит: полезное изменение часто лежит в подпространстве малой размерности, поэтому достаточно учить произведение двух маленьких матриц.",
          "Это снижает число trainable parameters и optimizer states. Base weights остаются замороженными, а адаптация хранится как компактная добавка."
        )
        Items = @(
          "Rank r задаёт ёмкость адаптации.",
          "Alpha масштабирует влияние LoRA update.",
          "Target modules определяют, какие части Transformer могут адаптироваться."
        )
      },
      @{
        Id = "6-5-target-modules"
        After = "Почему это экономит"
        Title = "Выбор target modules важнее, чем кажется"
        Paragraphs = @(
          "LoRA можно ставить в attention projections, FFN layers или почти все linear layers. Чем больше target modules, тем больше capacity и memory cost. Чем меньше target modules, тем выше риск недоадаптации.",
          "Для instruction tuning часто адаптируют q_proj, v_proj и иногда o_proj/FFN. Для сильной доменной адаптации может понадобиться шире покрыть модель."
        )
        Items = @(
          "Attention LoRA хорошо меняет routing информации.",
          "FFN LoRA лучше меняет token-wise transformations.",
          "Слишком высокий rank может переобучить маленький dataset."
        )
      },
      @{
        Id = "6-5-qlora-quantization"
        After = "QLoRA"
        Title = "QLoRA экономит память, но требует аккуратности к quantization noise"
        Paragraphs = @(
          "QLoRA хранит base model в quantized формате, а обучает LoRA adapters в более удобной точности. Это позволяет fine-tune большие модели на меньшем железе, потому что основная память уходит на frozen weights.",
          "Но quantization добавляет ошибку представления весов. Обычно это приемлемо, если base model качественная, adapters имеют достаточную ёмкость, а training loop использует стабильные dtype и optimizer settings."
        )
        Items = @(
          "NF4 полезен для весов с примерно нормальным распределением.",
          "Double quantization дополнительно снижает memory overhead.",
          "Compute dtype и optimizer choice всё равно влияют на стабильность."
        )
      }
    )
  },
  @{
    File = "06_llm/06_scaling_laws.html"
    Inserts = @(
      @{
        Id = "6-6-planning-tool"
        After = "Базовая идея"
        Title = "Scaling laws - инструмент планирования, а не магическое обещание"
        Paragraphs = @(
          "Scaling laws описывают среднюю зависимость loss от размера модели, данных и compute при похожем качестве setup. Они полезны для выбора бюджета эксперимента и оценки, где bottleneck: параметров мало, данных мало или compute распределён неудачно.",
          "Но закон работает только при сопоставимых данных, архитектуре и training recipe. Если меняется качество корпуса, tokenizer, optimizer или eval distribution, extrapolation становится менее надёжной."
        )
        Items = @(
          "Размер модели отвечает за capacity.",
          "Число токенов отвечает за обучающий сигнал.",
          "Compute связывает параметры, токены и число training steps."
        )
      },
      @{
        Id = "6-6-chinchilla"
        After = "Chinchilla"
        Title = "Chinchilla сдвинул фокус от bigger model к compute-optimal balance"
        Paragraphs = @(
          "Ранние LLM часто были недообучены по числу токенов относительно размера модели. Chinchilla-style вывод показал, что при фиксированном compute иногда лучше обучать меньшую модель на большем числе токенов, чем огромную модель на недостаточном корпусе.",
          "Практический вывод: параметры без данных не дают оптимального качества. Нужен баланс model size и token budget."
        )
        Items = @(
          "Undertrained model имеет слишком мало токенов на параметр.",
          "Compute-optimal режим балансирует N и D.",
          "Data quality может сдвигать оптимальный баланс сильнее, чем простая формула."
        )
      },
      @{
        Id = "6-6-eval-scaling"
        After = "Практический смысл"
        Title = "Loss scaling не всегда совпадает с ростом продуктового качества"
        Paragraphs = @(
          "Снижение pretraining loss обычно улучшает модель, но пользовательские навыки растут неравномерно. Некоторые abilities появляются плавно, другие требуют instruction tuning, tools, retrieval или другой evaluation setup.",
          "Поэтому scaling experiments должны смотреть не только perplexity, но и набор задач: reasoning, coding, factuality, long context, safety, latency и serving cost."
        )
        Items = @(
          "Perplexity полезна для общей языковой модели.",
          "Task eval показывает прикладные навыки.",
          "Serving cost может сделать меньшую модель предпочтительнее даже при худшем loss."
        )
      }
    )
  }
)

$pages += @(
  @{
    File = "07_generative_models/01_variational_autoencoders.html"
    Inserts = @(
      @{
        Id = "7-1-latent-variable-model"
        After = "Генеративная постановка"
        Title = "VAE учит вероятностную модель скрытых причин"
        Paragraphs = @(
          "VAE предполагает, что наблюдение x порождается скрытой переменной z. Encoder приближает posterior q(z|x), а decoder задаёт likelihood p(x|z). Это делает autoencoder не просто компрессором, а generative model.",
          "Latent space должен быть не набором произвольных кодов, а распределением, из которого можно семплировать. Именно поэтому появляется prior p(z) и KL-штраф."
        )
        Items = @(
          "Encoder оценивает распределение скрытого кода.",
          "Decoder восстанавливает или генерирует объект из z.",
          "Prior делает latent space пригодным для sampling."
        )
      },
      @{
        Id = "7-1-elbo-tradeoff"
        After = "ELBO от начала"
        Title = "ELBO балансирует reconstruction и regularized latent space"
        Paragraphs = @(
          "Первая часть ELBO поощряет decoder хорошо объяснять объект через z. Вторая часть, KL, удерживает q(z|x) рядом с prior. Если KL слишком слабый, latent space может стать рваным. Если слишком сильный, модель игнорирует z.",
          "Этот trade-off объясняет beta-VAE и KL annealing. Мы регулируем, насколько модель должна предпочитать чистую структуру latent space вместо максимальной реконструкции."
        )
        Items = @(
          "Reconstruction term отвечает за качество восстановления.",
          "KL term отвечает за форму latent distribution.",
          "Posterior collapse возникает, когда decoder игнорирует z."
        )
      },
      @{
        Id = "7-1-reparameterization-gradient"
        After = "Reparameterization"
        Title = "Reparameterization переносит случайность вне обучаемых параметров"
        Paragraphs = @(
          "Sampling из q(z|x) напрямую мешает backprop, потому что случайная операция разрывает обычный gradient path. Reparameterization записывает z как mu плюс sigma умножить на epsilon, где epsilon не зависит от параметров encoder.",
          "Теперь gradient может идти через mu и sigma, а случайность остаётся внешним источником шума. Это делает stochastic latent model обучаемой обычным gradient descent."
        )
        Items = @(
          "epsilon семплируется из фиксированного N(0,1).",
          "mu и sigma учатся encoder-ом.",
          "z остаётся случайным, но differentiable по параметрам encoder."
        )
      }
    )
  },
  @{
    File = "07_generative_models/02_generative_adversarial_networks.html"
    Inserts = @(
      @{
        Id = "7-2-game-dynamics"
        After = "Minimax"
        Title = "GAN - это динамическая игра двух обучающихся систем"
        Paragraphs = @(
          "Generator и discriminator меняют задачу друг для друга на каждом шаге. Discriminator учится отличать real от fake, а generator учится производить samples, которые проходят этот тест.",
          "В отличие от обычной supervised optimization, цель здесь не стационарна. Когда один игрок меняется, loss landscape другого тоже меняется. Это делает обучение GAN чувствительным к балансу скоростей."
        )
        Items = @(
          "Сильный discriminator может дать generator слабый gradient.",
          "Слабый discriminator не даёт полезного сигнала качества.",
          "Баланс update ratio и learning rate критичен."
        )
      },
      @{
        Id = "7-2-mode-collapse"
        After = "Mode collapse"
        Title = "Mode collapse - локальная победа generator при плохом покрытии распределения"
        Paragraphs = @(
          "Generator может найти несколько samples, которые хорошо обманывают discriminator, и начать производить почти только их. Визуально качество может быть высоким, но разнообразие падает.",
          "Это происходит потому, что adversarial objective не всегда достаточно штрафует отсутствие редких modes. Поэтому GAN оценивают не только sharpness, но и diversity."
        )
        Items = @(
          "Collapse может выглядеть как повторение похожих картинок.",
          "Discriminator feedback может стать слишком локальным.",
          "Diversity metrics и human inspection нужны вместе."
        )
      },
      @{
        Id = "7-2-wasserstein"
        After = "Wasserstein"
        Title = "Wasserstein distance даёт более полезный сигнал, когда распределения не пересекаются"
        Paragraphs = @(
          "Классический GAN может иметь слабый gradient, если real и generated distributions лежат на разных manifold. Wasserstein distance измеряет стоимость переноса массы и меняется более плавно при сдвиге distributions.",
          "WGAN заменяет discriminator на critic и требует Lipschitz constraint. Это улучшает стабильность, но добавляет свои практические ограничения: gradient penalty, clipping или spectral normalization."
        )
        Items = @(
          "Critic оценивает score, а не probability real/fake.",
          "Lipschitz constraint нужен для корректной Wasserstein-оценки.",
          "WGAN loss легче интерпретировать как качество training dynamics."
        )
      }
    )
  },
  @{
    File = "07_generative_models/03_diffusion_models.html"
    Inserts = @(
      @{
        Id = "7-3-forward-schedule"
        After = "Forward process"
        Title = "Noise schedule задаёт учебную программу denoising"
        Paragraphs = @(
          "Forward process постепенно разрушает данные шумом. Если шум добавляется слишком резко, reverse model получает слишком сложную задачу. Если слишком медленно, training и sampling становятся дорогими.",
          "Schedule определяет, какие уровни corrupted data модель увидит и насколько равномерно она научится denoise на разных signal-to-noise regimes."
        )
        Items = @(
          "Ранние шаги сохраняют много структуры изображения.",
          "Поздние шаги почти полностью шумовые.",
          "SNR schedule влияет на то, какие детали модель учит лучше."
        )
      },
      @{
        Id = "7-3-noise-prediction"
        After = "noise prediction"
        Title = "Предсказание шума превращает reverse process в supervised denoising"
        Paragraphs = @(
          "В DDPM мы знаем, какой шум epsilon добавили к x_0 на шаге t. Поэтому можно обучать сеть предсказывать этот шум по noisy sample и timestep. Это даёт простой MSE objective вместо прямого моделирования сложного reverse distribution.",
          "Интуитивно модель учится говорить: какая часть текущего sample является шумом, который нужно убрать, чтобы приблизиться к данным."
        )
        Items = @(
          "x_t - зашумлённый sample.",
          "t сообщает уровень шума.",
          "epsilon prediction даёт направление denoising."
        )
      },
      @{
        Id = "7-3-guidance-sampling"
        After = "Почему diffusion победил"
        Title = "Качество diffusion сильно зависит от sampler и guidance"
        Paragraphs = @(
          "Обученная denoising model задаёт локальные шаги, но итоговая генерация зависит от того, как мы идём от шума к данным. Число шагов, sampler, classifier-free guidance и schedule меняют trade-off между качеством, разнообразием и скоростью.",
          "Слишком сильный guidance может сделать samples красивее, но менее разнообразными или с артефактами. Слишком слабый guidance хуже следует условию prompt."
        )
        Items = @(
          "Больше sampling steps обычно повышает качество, но замедляет inference.",
          "Guidance scale усиливает следование условию.",
          "Sampler выбирает численный путь reverse process."
        )
      }
    )
  }
)

$pages += @(
  @{
    File = "08_training_practice/01_distributed_training.html"
    Inserts = @(
      @{
        Id = "8-1-ddp-throughput"
        After = "DDP"
        Title = "DDP масштабирует batch parallelism, но платит communication cost"
        Paragraphs = @(
          "В DDP каждая GPU хранит полную копию модели и считает gradients на своей части batch. Затем gradients синхронизируются через all-reduce. Поэтому compute масштабируется хорошо, пока communication не становится bottleneck.",
          "Главный практический вопрос: достаточно ли большая работа на GPU между синхронизациями. Если batch слишком маленький или сеть медленная, GPUs ждут communication вместо вычислений."
        )
        Items = @(
          "Global batch равен local batch умножить на число workers.",
          "All-reduce синхронизирует gradients.",
          "Gradient accumulation помогает увеличить effective batch без роста memory на один step."
        )
      },
      @{
        Id = "8-1-fsdp-sharding"
        After = "FSDP"
        Title = "FSDP покупает память ценой более сложной коммуникации"
        Paragraphs = @(
          "FSDP шардирует параметры, gradients и optimizer states между устройствами. Это позволяет обучать модели, которые не помещаются целиком на одну GPU, но требует собирать параметры перед вычислением слоёв и снова освобождать память.",
          "Поэтому FSDP чувствителен к wrap policy, размеру блоков, overlap communication и checkpointing. Неправильная настройка может сэкономить память, но потерять throughput."
        )
        Items = @(
          "Sharding снижает memory per GPU.",
          "All-gather нужен перед использованием shard-нутых параметров.",
          "Wrap granularity влияет на баланс memory и communication overhead."
        )
      },
      @{
        Id = "8-1-reproducibility"
        After = "Как принимать решение"
        Title = "Distributed training меняет не только скорость, но и эксперимент"
        Paragraphs = @(
          "При изменении числа GPU меняется global batch, порядок данных, seed behavior, численная недетерминированность reductions и иногда learning rate schedule. Поэтому distributed run нельзя считать тем же экспериментом без проверки.",
          "Надёжный pipeline фиксирует effective batch, schedule по optimizer steps, checkpoint format и eval protocol. Иначе можно получить другое качество и не понять, почему."
        )
        Items = @(
          "Логируй global batch и число optimizer steps.",
          "Сохраняй checkpoints совместимо с выбранной стратегией sharding.",
          "Сравни single-GPU sanity run с distributed run на маленьком subset."
        )
      }
    )
  },
  @{
    File = "08_training_practice/02_gradient_checkpointing.html"
    Inserts = @(
      @{
        Id = "8-2-activation-memory"
        After = "Идея"
        Title = "Checkpointing меняет память на дополнительный compute"
        Paragraphs = @(
          "Обычный training сохраняет activations, чтобы backward мог использовать их позже. Gradient checkpointing сохраняет только часть activations, а пропущенные пересчитывает заново во время backward.",
          "Это не меняет математический gradient, если операции детерминированы и правильно обработан RNG state. Меняется только способ организации вычислений."
        )
        Items = @(
          "Память уменьшается за счёт меньшего числа сохранённых activations.",
          "Время растёт из-за повторного forward для checkpointed blocks.",
          "Лучше checkpoint-ить большие повторяющиеся blocks."
        )
      },
      @{
        Id = "8-2-rng-state"
        After = "Что именно пересчитывается"
        Title = "Dropout и случайность требуют сохранения RNG-состояния"
        Paragraphs = @(
          "Если checkpointed block содержит dropout, повторный forward во время backward должен использовать тот же random mask, что и original forward. Иначе backward будет соответствовать другой функции.",
          "Фреймворки обычно умеют сохранять RNG state, но это может добавлять overhead. При нестандартных random operations стоит проверить корректность явно."
        )
        Items = @(
          "Детерминированные blocks checkpoint-ить проще.",
          "Dropout требует согласованного RNG.",
          "Нестандартные side effects внутри forward могут ломать checkpointing."
        )
      },
      @{
        Id = "8-2-where-worth-it"
        After = "Когда checkpointing"
        Title = "Checkpointing особенно выгоден для activation-heavy моделей"
        Paragraphs = @(
          "Если память в основном занята параметрами, checkpointing даст мало. Если память съедают activations из-за длинного контекста, большого batch или глубокой сети, выигрыш может быть большим.",
          "Поэтому checkpointing часто используют в Transformer, diffusion U-Net и больших sequence-моделях. Но его надо измерять: иногда bottleneck смещается в compute и throughput падает слишком сильно."
        )
        Items = @(
          "Полезен при длинной sequence length.",
          "Полезен при большом batch или resolution.",
          "Менее полезен, если memory bottleneck - optimizer states или parameters."
        )
      }
    )
  },
  @{
    File = "08_training_practice/03_profiling_and_performance.html"
    Inserts = @(
      @{
        Id = "8-3-measure-first"
        After = "Что надо мерить"
        Title = "Оптимизировать без профиля - значит угадывать bottleneck"
        Paragraphs = @(
          "Медленный training step может быть вызван dataloader, CPU preprocessing, GPU kernels, communication, memory bandwidth или синхронизациями. По внешнему времени step нельзя надёжно понять причину.",
          "Профилирование должно разделять data time, forward, backward, optimizer step, communication и eval overhead. Только после этого имеет смысл менять код."
        )
        Items = @(
          "GPU utilization показывает, насколько устройство занято.",
          "Data loader time показывает, ждёт ли GPU входные batch-и.",
          "Memory bandwidth может быть bottleneck даже при умеренных FLOPs."
        )
      },
      @{
        Id = "8-3-cpu-gpu-overlap"
        After = "Типичные bottleneck"
        Title = "Хороший pipeline перекрывает CPU, GPU и IO"
        Paragraphs = @(
          "Пока GPU считает текущий batch, CPU должен готовить следующий. Если preprocessing, decoding или augmentations идут последовательно перед каждым step, GPU простаивает.",
          "DataLoader workers, pinned memory, prefetching и перенос данных non_blocking помогают перекрыть подготовку и вычисления. Но слишком много workers тоже может перегрузить CPU или диск."
        )
        Items = @(
          "num_workers тюнится под CPU и storage.",
          "pin_memory ускоряет transfer host-to-device.",
          "prefetch_factor помогает держать очередь batch-ей."
        )
      },
      @{
        Id = "8-3-kernel-fusion"
        After = "Практический порядок"
        Title = "Мелкие операции могут проигрывать из-за launch overhead"
        Paragraphs = @(
          "На GPU много маленьких kernels часто хуже, чем один крупный fused kernel. Даже если FLOPs мало, каждый запуск kernel имеет overhead, а промежуточные tensors нужно читать и писать в память.",
          "Поэтому torch.compile, fused optimizers, fused attention и vectorized operations могут ускорять код без изменения математики модели."
        )
        Items = @(
          "Ищи частые маленькие kernels в profiler trace.",
          "Избегай Python loops по элементам или токенам.",
          "Проверяй, что оптимизация не меняет численную стабильность."
        )
      }
    )
  },
  @{
    File = "08_training_practice/04_debugging_loss_spikes.html"
    Inserts = @(
      @{
        Id = "8-4-spike-taxonomy"
        After = "Первый чек-лист"
        Title = "Loss spike нужно классифицировать до исправления"
        Paragraphs = @(
          "Spike может быть data issue, numerical issue, optimizer issue или distributed issue. Если сразу уменьшать lr, можно скрыть проблему в данных. Если сразу чистить данные, можно пропустить FP16 overflow.",
          "Правильный первый шаг - определить, воспроизводится ли spike на том же batch, той же seed, одной GPU и без AMP. Это быстро сужает класс причин."
        )
        Items = @(
          "Воспроизводится на том же batch - ищи данные или deterministic bug.",
          "Пропадает без AMP - ищи overflow/underflow.",
          "Появляется только distributed - ищи sync, sharding или batch composition."
        )
      },
      @{
        Id = "8-4-binary-search"
        After = "Как быстро разделить"
        Title = "Binary search по training loop быстрее случайных правок"
        Paragraphs = @(
          "Раздели step на участки: load batch, forward, loss, backward, clipping, optimizer step, scheduler step. Проверяй NaN/Inf и нормы после каждого участка.",
          "Так можно найти первый момент, где значение стало плохим. Последний видимый NaN почти никогда не является первопричиной."
        )
        Items = @(
          "Проверяй inputs и labels до forward.",
          "Проверяй logits и loss до backward.",
          "Проверяй gradient norms до optimizer step."
        )
      },
      @{
        Id = "8-4-logging-invariants"
        After = "Что логировать"
        Title = "Логи должны показывать инварианты, а не только loss"
        Paragraphs = @(
          "Loss сам по себе говорит, что стало плохо, но не говорит где. Нужны вспомогательные инварианты: диапазон logits, доля NaN/Inf, gradient norm, weight norm, lr, grad scale, batch id и длины последовательностей.",
          "Если эти значения пишутся заранее, debugging spike занимает минуты. Если их нет, приходится воспроизводить аварию вслепую."
        )
        Items = @(
          "Логируй batch metadata для воспроизведения.",
          "Логируй lr и AMP grad scale.",
          "Логируй top gradient norms по слоям или параметр-группам."
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
  Write-Host "$($page.File): frontier deepening blocks inserted"
  $updated += 1
}

Write-Host "Frontier blocks deepening updated: $updated files"

