$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Web

$root = Split-Path -Parent $PSScriptRoot

function HtmlText {
  param([string]$Text)
  return [System.Web.HttpUtility]::HtmlEncode($Text)
}

function Remove-DeepeningBlocks {
  param([string]$Html)
  return [regex]::Replace($Html, '(?is)\s*<!-- architecture-deepening:start:[^>]+ -->.*?<!-- architecture-deepening:end -->\s*', "`r`n")
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

<!-- architecture-deepening:start:$id -->
  <section class="concept-walkthrough" data-architecture-deepening="$id">
    <div class="concept-walkthrough__kicker">Теория глубже</div>
    <h3>$title</h3>
$($paragraphs -join "`r`n")
$list
  </section>
<!-- architecture-deepening:end -->
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
    File = "05_architectures/01_cnn_convolutional_networks.html"
    Inserts = @(
      @{
        Id = "5-1-locality-prior"
        After = "Дискретная свёртка"
        Title = "CNN вшивает prior локальности и повторяемости паттернов"
        Paragraphs = @(
          "Свёртка предполагает, что важные признаки часто локальны: край, угол, текстура или маленький объект можно распознать по соседним пикселям. Второе предположение - один и тот же detector полезен в разных местах изображения.",
          "Именно parameter sharing делает CNN эффективной. Один фильтр скользит по всей карте и ищет один паттерн везде, вместо того чтобы учить отдельный набор весов для каждой позиции."
        )
        Items = @(
          "Локальность уменьшает число возможных взаимодействий.",
          "Shared weights уменьшают число параметров.",
          "Translation equivariance означает: сдвиг входа сдвигает feature map."
        )
      },
      @{
        Id = "5-1-effective-receptive-field"
        After = "Рецептивное поле"
        Title = "Теоретическое RF больше, чем реально используемое RF"
        Paragraphs = @(
          "На бумаге receptive field показывает, какая область входа может повлиять на конкретную активацию. Но фактическое влияние внутри этой области обычно распределено неравномерно: центральные пиксели часто влияют сильнее, чем дальние.",
          "Поэтому простое увеличение глубины не всегда означает, что модель хорошо использует глобальный контекст. Иногда нужны dilation, pooling, attention или архитектурные блоки, которые явно расширяют обмен информацией."
        )
        Items = @(
          "Малые ядра дают больше нелинейностей на ту же область.",
          "Dilation расширяет RF без роста числа параметров.",
          "Stride и pooling быстро уменьшают spatial resolution."
        )
      },
      @{
        Id = "5-1-pooling-tradeoff"
        After = "Pooling"
        Title = "Pooling покупает устойчивость ценой точной позиции"
        Paragraphs = @(
          "Max pooling оставляет сильнейший локальный сигнал и делает модель менее чувствительной к небольшому сдвигу объекта. Average pooling сглаживает область и больше похож на локальное усреднение энергии признака.",
          "Потеря spatial detail может вредить segmentation, detection и задачам, где важна точная геометрия. Поэтому современные сети часто заменяют грубый pooling на strided convolution, skip connections или multi-scale features."
        )
        Items = @(
          "Max pooling хорошо ловит наличие признака.",
          "Average pooling лучше сохраняет общий фон сигнала.",
          "Global average pooling превращает feature maps в class-level summary."
        )
      },
      @{
        Id = "5-1-depthwise-separable"
        After = "Depthwise Separable"
        Title = "Depthwise separable conv разделяет spatial mixing и channel mixing"
        Paragraphs = @(
          "Обычная convolution одновременно смешивает соседние пиксели и каналы. Depthwise separable convolution сначала применяет отдельный spatial filter к каждому каналу, а затем 1x1 convolution смешивает каналы.",
          "Такое разделение резко снижает число параметров и FLOPs. Цена - меньше совместной выразительности в одном слое, поэтому MobileNet-подобные сети компенсируют это шириной, глубиной и аккуратным дизайном блоков."
        )
        Items = @(
          "Depthwise conv отвечает за spatial pattern внутри канала.",
          "Pointwise 1x1 conv отвечает за mixing каналов.",
          "Mobile architectures используют этот trade-off для скорости на edge devices."
        )
      }
    )
  },
  @{
    File = "05_architectures/02_rnn_lstm.html"
    Inserts = @(
      @{
        Id = "5-2-state-compression"
        After = "Рекуррентная нейронная сеть"
        Title = "RNN сжимает прошлое в скрытое состояние"
        Paragraphs = @(
          "RNN читает последовательность по шагам и хранит историю в hidden state. Это сильное ограничение: вся полезная информация о прошлом должна поместиться в вектор фиксированного размера.",
          "Такой inductive bias подходит для потоковых данных и коротких зависимостей. Но когда нужно помнить много деталей на больших расстояниях, fixed hidden state становится узким горлом."
        )
        Items = @(
          "h_t хранит summary прошлого.",
          "x_t добавляет новую информацию текущего шага.",
          "Один и тот же recurrent weight переиспользуется на всех позициях."
        )
      },
      @{
        Id = "5-2-spectral-radius"
        After = "затухающего/взрывного"
        Title = "Долгая память RNN зависит от спектра recurrent dynamics"
        Paragraphs = @(
          "Backprop through time умножает градиент на похожие матрицы много раз. Если эффективные собственные значения меньше единицы, сигнал затухает. Если больше единицы, сигнал взрывается.",
          "Это не только математическая проблема. На практике RNN может хорошо учить ближайшие зависимости и почти игнорировать далёкие, потому что gradient от далёкого шага просто не доходит до ранних параметров."
        )
        Items = @(
          "Vanishing gradient стирает дальние зависимости.",
          "Exploding gradient требует clipping и осторожного lr.",
          "Gates в LSTM/GRU создают более управляемые пути для памяти."
        )
      },
      @{
        Id = "5-2-lstm-cell-highway"
        After = "LSTM"
        Title = "Cell state работает как почти линейная магистраль памяти"
        Paragraphs = @(
          "Главная идея LSTM - отделить долгосрочную память c_t от краткосрочного hidden state h_t. Cell state обновляется через forget и input gates, поэтому информация может пройти через много шагов с меньшим разрушением.",
          "Gates не просто добавляют параметры. Они дают модели право решать, что забыть, что записать и что показать наружу. Это делает память управляемой, а не полностью перезаписываемой на каждом шаге."
        )
        Items = @(
          "Forget gate контролирует сохранение старой памяти.",
          "Input gate контролирует запись новой информации.",
          "Output gate контролирует, какая часть памяти влияет на hidden state."
        )
      },
      @{
        Id = "5-2-truncated-bptt"
        After = "Truncated BPTT"
        Title = "Truncated BPTT ограничивает длину кредитного назначения"
        Paragraphs = @(
          "Полный BPTT через длинную sequence дорог по памяти и вычислениям. Truncated BPTT режет историю на окна и не передаёт gradient бесконечно далеко назад.",
          "Это ускоряет обучение и стабилизирует память, но вводит bias: модель может не получить прямой gradient для зависимостей длиннее окна. Поэтому длина окна - это архитектурно-оптимизационный компромисс."
        )
        Items = @(
          "Короткое окно дешевле, но хуже для long-range dependencies.",
          "Длинное окно точнее, но дороже и менее стабильно.",
          "Hidden state можно переносить вперёд, даже если gradient назад обрезан."
        )
      }
    )
  },
  @{
    File = "05_architectures/03_transformer_attention.html"
    Inserts = @(
      @{
        Id = "5-3-attention-memory"
        After = "Ключевая идея"
        Title = "Attention можно читать как content-addressable memory"
        Paragraphs = @(
          "Query спрашивает, какую информацию текущий токен ищет. Key описывает, по каким признакам другие токены могут быть найдены. Value содержит то, что будет передано, если токен оказался релевантным.",
          "В отличие от RNN, attention не обязан сжимать всё прошлое в один hidden state. Каждый токен может напрямую обратиться к другим токенам и собрать контекст как взвешенную смесь."
        )
        Items = @(
          "QK^T отвечает за scores релевантности.",
          "Softmax превращает scores в веса внимания.",
          "Умножение на V собирает информацию из выбранных токенов."
        )
      },
      @{
        Id = "5-3-scaling-entropy"
        After = "Почему делим"
        Title = "Деление на sqrt(d_k) защищает softmax от слишком резких scores"
        Paragraphs = @(
          "Dot product между случайными vectors растёт по дисперсии вместе с размерностью d_k. Без масштабирования QK^T становится слишком большим, softmax насыщается, а gradient через attention weights ухудшается.",
          "Деление на sqrt(d_k) удерживает scores в рабочем диапазоне. Это не косметика, а условие стабильного распределения внимания при изменении hidden size."
        )
        Items = @(
          "Слишком большие scores дают почти one-hot attention.",
          "Слишком маленькие scores дают почти равномерное внимание.",
          "Хороший scale оставляет softmax чувствительным к различиям релевантности."
        )
      },
      @{
        Id = "5-3-multihead-subspaces"
        After = "Multi-Head Attention"
        Title = "Multi-head attention даёт несколько подпространств отношений"
        Paragraphs = @(
          "Одна attention head может выучить один тип связи: локальный контекст, синтаксическую зависимость, coreference, позиционный паттерн или routing сигнала. Несколько heads позволяют параллельно смотреть на разные отношения.",
          "Но больше heads не всегда лучше. Если head dimension слишком маленькая, каждая head получает мало capacity. Если heads слишком много, часть может стать redundant."
        )
        Items = @(
          "num_heads управляет числом параллельных relation views.",
          "head_dim управляет ёмкостью каждой head.",
          "Output projection смешивает результаты heads обратно в общий residual stream."
        )
      },
      @{
        Id = "5-3-masks-info-flow"
        After = "Маски в Attention"
        Title = "Mask задаёт разрешённый граф потока информации"
        Paragraphs = @(
          "Padding mask запрещает смотреть на несуществующие токены. Causal mask запрещает смотреть в будущее. В обоих случаях mask не просто техническая деталь, а ограничение на то, какую информацию модель имеет право использовать.",
          "Если mask построена неправильно, модель может получить leakage из будущего или начать учитывать padding как настоящий контент. Такие ошибки часто дают хорошие offline loss и плохое реальное поведение."
        )
        Items = @(
          "Causal LM требует strict lower-triangular доступ к прошлому.",
          "Encoder attention обычно видит всю последовательность без causal mask.",
          "Cross-attention связывает decoder queries с encoder keys/values."
        )
      }
    )
  }
)

$pages += @(
  @{
    File = "05_architectures/04_transformer_architecture.html"
    Inserts = @(
      @{
        Id = "5-4-position-breaks-symmetry"
        After = "Positional Encoding"
        Title = "Позиции ломают permutation symmetry self-attention"
        Paragraphs = @(
          "Self-attention без positional information видит последовательность как набор токенов: перестановка токенов переставит выходы, но не даст модели знания о порядке. Для языка, кода и времени порядок является частью смысла.",
          "Positional encoding добавляет модели координатную систему. Абсолютные позиции говорят, где токен стоит, относительные и rotary-подходы больше фокусируются на расстоянии и взаимном расположении."
        )
        Items = @(
          "Sinusoidal PE даёт фиксированные частоты и может экстраполировать ограниченно.",
          "Learnable PE хорошо подстраивается под train length, но хуже переносится за пределы длины.",
          "RoPE кодирует относительный сдвиг через вращение query/key."
        )
      },
      @{
        Id = "5-4-residual-stream"
        After = "Полная архитектура Transformer"
        Title = "Residual stream - общая шина информации Transformer"
        Paragraphs = @(
          "Transformer block не заменяет состояние полностью. Attention и FFN добавляют поправки в residual stream. Это позволяет глубокой сети накапливать информацию, не разрушая полностью предыдущие представления.",
          "Такой дизайн делает обучение глубже стабильнее: если подблок временно бесполезен, residual path всё равно переносит сигнал дальше. Поэтому skip connections здесь так же важны, как и сами attention/FFN."
        )
        Items = @(
          "Attention смешивает информацию между токенами.",
          "FFN перерабатывает информацию внутри каждого токена.",
          "Residual connection сохраняет маршрут для activations и gradients."
        )
      },
      @{
        Id = "5-4-preln-stability"
        After = "Pre-LN vs Post-LN"
        Title = "Pre-LN стабилизирует gradient path в глубоких Transformer"
        Paragraphs = @(
          "В Post-LN normalization стоит после residual addition, и gradient к ранним слоям может быть менее стабильным. В Pre-LN нормализация стоит перед подблоком, а residual path остаётся ближе к identity route.",
          "Поэтому современные большие decoder-only модели чаще используют Pre-LN или его варианты. Цена - иногда хуже финальная expressivity без дополнительных приёмов, но training stability обычно важнее."
        )
        Items = @(
          "Post-LN ближе к оригинальному Transformer.",
          "Pre-LN проще обучать на большой глубине.",
          "RMSNorm упрощает LayerNorm и часто используется в LLM."
        )
      },
      @{
        Id = "5-4-ffn-token-memory"
        After = "Feed-Forward Network"
        Title = "FFN - это token-wise нелинейная память"
        Paragraphs = @(
          "Attention отвечает за обмен между токенами, но FFN применяет одну и ту же MLP к каждому токену отдельно. Он расширяет hidden dimension, применяет нелинейность и сжимает обратно, создавая более богатое представление токена.",
          "В LLM большая доля параметров часто находится именно в FFN. SwiGLU/GEGLU улучшают этот блок через gated activation: одна ветка создаёт значение, другая управляет тем, сколько его пропустить."
        )
        Items = @(
          "d_ff обычно в несколько раз больше d_model.",
          "FFN не смешивает позиции напрямую.",
          "Gated FFN повышает expressivity при хорошем compute trade-off."
        )
      }
    )
  },
  @{
    File = "05_architectures/05_resnet_normalization.html"
    Inserts = @(
      @{
        Id = "5-5-residual-correction"
        After = "Degradation Problem"
        Title = "Residual block учит поправку, а не всю функцию заново"
        Paragraphs = @(
          "Если оптимальное преобразование близко к identity, plain network всё равно должна выучить identity через несколько нелинейных слоёв. ResNet делает identity route явным, а блок учит только residual correction F(x).",
          "Это снижает сложность оптимизации: блоку легче научиться маленькой поправке, чем полностью реконструировать вход. Поэтому глубина становится полезной, а не только опасной."
        )
        Items = @(
          "Skip path переносит исходный сигнал.",
          "Residual branch добавляет поправку.",
          "Если поправка не нужна, сеть может приблизиться к identity."
        )
      },
      @{
        Id = "5-5-gradient-identity"
        After = "Градиент через skip"
        Title = "Skip connection создаёт прямой путь для градиента"
        Paragraphs = @(
          "В residual block градиент может пройти через branch F(x), но также имеет identity path. Это уменьшает риск, что все градиенты будут проходить через длинную цепочку нестабильных Jacobian.",
          "Именно поэтому residual connections стали базовым элементом не только CNN, но и Transformer, diffusion U-Net и многих современных архитектур."
        )
        Items = @(
          "Identity path стабилизирует backward.",
          "Residual branch может учить сложную поправку.",
          "Projection shortcut нужен, когда меняется размерность."
        )
      },
      @{
        Id = "5-5-bottleneck-economy"
        After = "Bottleneck"
        Title = "Bottleneck экономит compute через 1x1 channel projection"
        Paragraphs = @(
          "Bottleneck block сначала сжимает channels через 1x1 convolution, затем делает 3x3 convolution в меньшем пространстве, а потом расширяет channels обратно. Это снижает стоимость spatial convolution.",
          "1x1 convolution не видит соседние пиксели, но эффективно смешивает каналы. Поэтому bottleneck разделяет channel mixing и spatial processing, похожим образом к идее эффективных CNN-блоков."
        )
        Items = @(
          "1x1 reduce уменьшает channel dimension.",
          "3x3 работает в сжатом пространстве.",
          "1x1 expand возвращает нужную ширину residual stream."
        )
      },
      @{
        Id = "5-5-normalization-choice"
        After = "Normalization"
        Title = "Выбор normalization зависит от оси статистики и режима inference"
        Paragraphs = @(
          "BatchNorm использует batch statistics во время training и running statistics во время eval. Если batch маленький или distribution inference отличается, эти статистики могут стать источником ошибки.",
          "LayerNorm и GroupNorm не зависят от batch size таким же образом. Поэтому LN доминирует в Transformer, GN полезен при маленьких batch в vision, а BN остаётся сильным default для классических CNN с нормальным batch size."
        )
        Items = @(
          "BatchNorm: хорошо для CNN и больших batch.",
          "LayerNorm: хорошо для sequence models и Transformer.",
          "GroupNorm: устойчивее BatchNorm при маленьких batch."
        )
      }
    )
  },
  @{
    File = "05_architectures/06_positional_encodings.html"
    Inserts = @(
      @{
        Id = "5-6-permutation-problem"
        After = "Откуда вообще"
        Title = "Без позиции attention не различает порядок"
        Paragraphs = @(
          "Self-attention сравнивает токены по содержанию. Если не добавить позиционную информацию, модель не знает, кто стоял раньше, кто позже и какое расстояние между токенами.",
          "Это особенно критично для языка и кода: одни и те же токены в разном порядке могут иметь противоположный смысл. Positional encoding превращает sequence из множества в упорядоченную структуру."
        )
        Items = @(
          "Absolute PE кодирует номер позиции.",
          "Relative PE кодирует расстояние между токенами.",
          "RoPE кодирует позицию внутри dot product query/key."
        )
      },
      @{
        Id = "5-6-extrapolation"
        After = "Три больших семейства"
        Title = "Главный тест positional encoding - перенос на длины вне train"
        Paragraphs = @(
          "Модель может хорошо работать на train context length и резко деградировать на более длинных последовательностях. Причина часто не только в attention cost, но и в том, как позиционная схема ведёт себя вне диапазона обучения.",
          "Learned absolute embeddings плохо знают позиции, которых не видели. RoPE и ALiBi проектировались так, чтобы лучше переносить relative distance, но и они требуют аккуратного scaling при очень длинном контексте."
        )
        Items = @(
          "Train length задаёт привычный диапазон позиций.",
          "Extrapolation требует корректного поведения на больших расстояниях.",
          "Context extension часто требует RoPE scaling или fine-tuning."
        )
      },
      @{
        Id = "5-6-rope-geometry"
        After = "Формулы"
        Title = "RoPE превращает позицию в вращение признаков"
        Paragraphs = @(
          "RoPE вращает пары координат query и key на угол, зависящий от позиции. При dot product между Q и K появляется зависимость от относительного сдвига позиций, а не только от абсолютных индексов.",
          "Геометрически это означает, что смысл токена и его позиция смешиваются в фазе. Чем дальше позиции, тем иначе взаимодействуют соответствующие частоты."
        )
        Items = @(
          "Низкие частоты отвечают за длинные масштабы.",
          "Высокие частоты отвечают за короткие различия позиций.",
          "RoPE scaling меняет, как быстро фаза меняется с расстоянием."
        )
      }
    )
  }
)

$pages += @(
  @{
    File = "05_architectures/07_efficient_attention.html"
    Inserts = @(
      @{
        Id = "5-7-quadratic-bottleneck"
        After = "Где узкое место"
        Title = "O(n^2) attention ограничивает не только FLOPs, но и память"
        Paragraphs = @(
          "Обычный attention строит матрицу scores размера sequence length на sequence length для каждой head. При росте контекста в 2 раза эта матрица растёт примерно в 4 раза.",
          "На практике bottleneck часто находится в памяти и bandwidth, а не только в количестве умножений. Поэтому efficient attention методы пытаются уменьшить materialization attention matrix, IO между HBM/SRAM или само число разрешённых связей."
        )
        Items = @(
          "Длинный контекст резко увеличивает activation memory.",
          "Attention matrix часто дороже, чем кажется по формуле FLOPs.",
          "KV-cache переносит часть стоимости в autoregressive inference."
        )
      },
      @{
        Id = "5-7-flashattention-io"
        After = "Почему FlashAttention"
        Title = "FlashAttention ускоряет exact attention через IO-aware вычисление"
        Paragraphs = @(
          "FlashAttention не меняет математический результат attention. Он меняет способ вычисления: обрабатывает блоки Q/K/V так, чтобы не материализовать огромную attention matrix в медленной памяти.",
          "Ключевая идея - online softmax и tiling. Это уменьшает чтение/запись в HBM и делает attention быстрее и экономнее по памяти, особенно на длинных последовательностях."
        )
        Items = @(
          "Результат остаётся exact attention, а не approximation.",
          "Экономия идёт через memory IO.",
          "Польза растёт с sequence length и размером batch/heads."
        )
      },
      @{
        Id = "5-7-sparse-approx-tradeoff"
        After = "Сравнение подходов"
        Title = "Sparse и approximate attention меняют inductive bias модели"
        Paragraphs = @(
          "Sparse attention запрещает часть связей между токенами. Это экономит compute, но задаёт гипотезу: не все токены должны напрямую смотреть друг на друга. Approximate attention пытается заменить полную матрицу более дешёвой оценкой.",
          "Такие методы требуют проверки на задаче. Если важная зависимость попала в запрещённую или плохо аппроксимированную область, модель может терять качество даже при хорошей скорости."
        )
        Items = @(
          "Local attention хорошо подходит для локального контекста.",
          "Global tokens помогают переносить summary по всей sequence.",
          "Approximation нужно сравнивать не только по speed, но и по downstream quality."
        )
      }
    )
  },
  @{
    File = "05_architectures/08_vision_transformer.html"
    Inserts = @(
      @{
        Id = "5-8-patchify-tokenization"
        After = "Patchify"
        Title = "Patchify - это токенизация изображения"
        Paragraphs = @(
          "ViT превращает картинку в последовательность patch tokens. Каждый patch линейно проецируется в embedding, после чего Transformer работает с изображением почти как с текстовой последовательностью.",
          "Это убирает встроенный CNN prior локальности и translation equivariance. Модель получает больше гибкости, но обычно требует больше данных, augmentation или pretraining, чтобы выучить visual structure."
        )
        Items = @(
          "Patch size задаёт длину visual sequence.",
          "Projection patch-а похожа на convolution с kernel=stride=patch_size.",
          "Position embeddings нужны, потому что порядок patch-ей важен."
        )
      },
      @{
        Id = "5-8-patch-size-tradeoff"
        After = "Почему patch size"
        Title = "Patch size управляет балансом деталей и стоимости attention"
        Paragraphs = @(
          "Маленький patch сохраняет больше локальных деталей, но создаёт больше токенов. Attention cost растёт квадратично по числу patch tokens, поэтому слишком маленький patch быстро становится дорогим.",
          "Большой patch дешевле, но грубее: мелкие объекты и границы могут потеряться ещё до Transformer. Поэтому patch size - это архитектурный компромисс между spatial resolution и compute."
        )
        Items = @(
          "16x16 - классический ViT baseline.",
          "8x8 даёт больше деталей, но заметно дороже.",
          "32x32 дешевле, но может терять small objects."
        )
      },
      @{
        Id = "5-8-cnn-vs-vit-priors"
        After = "CNN vs ViT"
        Title = "CNN и ViT отличаются количеством встроенных предположений"
        Paragraphs = @(
          "CNN заранее предполагает локальность, shared filters и translation equivariance. Это помогает на малых и средних датасетах. ViT делает меньше таких предположений и позволяет attention самому выучить отношения между patch-ами.",
          "Поэтому ViT часто раскрывается при большом pretraining и сильных augmentation. Если данных мало, CNN или hybrid architecture могут быть устойчивее."
        )
        Items = @(
          "CNN сильнее как data-efficient prior.",
          "ViT гибче при большом масштабе данных.",
          "Hybrid models используют convolutional stem или multi-scale features."
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
  Write-Host "$($page.File): architecture deepening blocks inserted"
  $updated += 1
}

Write-Host "Architectures deepening updated: $updated files"


