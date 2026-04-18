$ErrorActionPreference = "Stop"

function ConvertTo-PlainText {
  param([string]$Html)
  $text = [regex]::Replace($Html, "<br\s*/?>", " ", "IgnoreCase")
  $text = [regex]::Replace($text, "<[^>]+>", " ")
  $text = [System.Net.WebUtility]::HtmlDecode($text)
  $text = [regex]::Replace($text, "\s+", " ").Trim()
  return $text
}

function ConvertTo-HtmlText {
  param([string]$Text)
  return [System.Net.WebUtility]::HtmlEncode($Text)
}

function Test-CodeLike {
  param([string]$Text, [string]$OpenTag)
  if ($OpenTag -match '\bdata-code-block\b') { return $true }
  if ($OpenTag -match 'class\s*=\s*["''][^"'']*\bcode\b') { return $true }
  return $Text -match '(?i)\b(import|from\s+\w+\s+import|def\s+\w+\(|class\s+\w+|return\s+|torch\.|np\.|numpy\.|plt\.|console\.log|function\s+\w+\(|const\s+|let\s+|=>|for\s*\(|while\s*\(|print\s*\(|optimizer\.|loss\.backward|model\.|nn\.)'
}

function Get-FormulaKind {
  param([string]$Text)
  if ($Text -match '(?i)attention|softmax|query|key|value|qk') { return "attention" }
  if ($Text -match '(?i)adam|momentum|optimizer|gradient|grad|θ|eta|η|beta|β|epsilon|ε') { return "optim" }
  if ($Text -match '(?i)posterior|prior|likelihood|entropy|kl|bayes|p\(') { return "prob" }
  if ($Text -match '(?i)relu|sigmoid|gelu|silu|swish|tanh') { return "activation" }
  if ($Text -match '(?i)mse|bce|cross.?entropy|loss|triplet|nt.?xent') { return "loss" }
  if ($Text -match '(?i)conv|kernel|feature map|\*') { return "cnn" }
  if ($Text -match '(?i)rnn|lstm|gru|hidden state|cell state|h_t|c_t') { return "rnn" }
  if ($Text -match '(?i)jacobian|hessian|matrix|vector|⊤|∂|∇|Σ') { return "linear" }
  return "general"
}

function Get-Copy {
  param([string]$Kind)
  switch ($Kind) {
    "attention" { return @("Формула показывает, как элемент выбирает, от кого собрать полезную информацию.", "Как поисковый запрос, который выбирает самые подходящие результаты и забирает их смысл.", "Если один score равен 2, а другой 1, softmax даст примерно 0.73 и 0.27: первый источник внесёт около 73% итоговой информации.") }
    "optim" { return @("Формула описывает, как параметры делают шаг в сторону меньшей ошибки.", "Как спускаться с горы, постоянно корректируя длину и направление шага.", "Если параметр θ=1.0, learning rate η=0.1, а градиент равен 3, то простой шаг даёт θ_new = 1.0 − 0.1·3 = 0.7.") }
    "prob" { return @("Формула оценивает, насколько данные согласуются с гипотезой или распределением.", "Как обновлять мнение о ситуации по новым фактам и наблюдениям.", "Если модель даёт P=0.8, это можно читать так: среди 10 похожих случаев она ожидает около 8 успешных исходов.") }
    "activation" { return @("Формула решает, какую часть сигнала пропустить дальше, а какую ослабить.", "Как клапан или фильтр, который пропускает только подходящий поток.", "Для ReLU: вход −2 превращается в 0, а вход 3 остаётся 3. Отрицательный сигнал гасится, положительный проходит.") }
    "loss" { return @("Формула измеряет, насколько прогноз модели далёк от правильного ответа.", "Как шкала штрафа за промах, где разные ошибки наказываются по-разному.", "Если правильный класс y=1, то прогноз ŷ=0.9 даёт небольшой штраф, а ŷ=0.1 — большой, потому что модель была уверена не туда.") }
    "cnn" { return @("Формула ищет знакомый локальный паттерн во входе.", "Как вести лупу по изображению и искать совпадение с маленьким шаблоном.", "Фильтр [1, −1] на фрагменте [5, 2] даёт 1·5 + (−1)·2 = 3: сильный отклик на перепад.") }
    "rnn" { return @("Формула обновляет память о прошлом с учётом нового входа.", "Как держать в голове сюжет книги и дополнять его новой главой.", "Если старая память 0.7, новый сигнал 0.2, а gate пропускает 50%, итоговая память будет смесью старого и нового, а не полной заменой.") }
    "linear" { return @("Формула собирает в одной записи влияния входов на итоговый результат.", "Как таблица влияния, где видно, какой фактор за что отвечает.", "Если вес признака 2, значение признака 3 и bias 1, вклад будет 2·3+1=7.") }
    default { return @("Формула связывает несколько величин и показывает, как они влияют друг на друга.", "Как панель с несколькими ручками, каждая из которых меняет общий результат.", "Если один множитель равен 2, а вход увеличился с 3 до 4, вклад этой части вырос с 6 до 8.") }
  }
}

function New-Row {
  param([string]$Symbol, [string]$Name, [string]$Description)
  return "      <div class=""formula-anatomy__row""><span class=""fa-sym"">$(ConvertTo-HtmlText $Symbol)</span><span class=""fa-name"">$(ConvertTo-HtmlText $Name)</span><span class=""fa-desc"">$(ConvertTo-HtmlText $Description)</span></div>"
}

function Get-Rows {
  param([string]$Text)
  $rows = New-Object System.Collections.Generic.List[string]
  $add = {
    param($symbol, $name, $description)
    if (-not ($rows | Where-Object { $_ -like "*>$([System.Net.WebUtility]::HtmlEncode($symbol))<*" })) {
      [void]$rows.Add((New-Row $symbol $name $description))
    }
  }

  if ($Text -match 'θ') { & $add 'θ' 'параметры' 'Обучаемые веса и другие настраиваемые величины модели.' }
  if ($Text -match 'η') { & $add 'η' 'learning rate' 'Размер шага оптимизации: чем больше, тем резче обновление.' }
  if ($Text -match 'λ') { & $add 'λ' 'коэффициент штрафа' 'Сила регуляризации или дополнительного ограничения.' }
  if ($Text -match '∇|grad') { & $add '∇' 'градиент' 'Направление самого быстрого роста функции по параметрам.' }
  if ($Text -match '∂') { & $add '∂' 'частная производная' 'Чувствительность выхода к изменению одной переменной.' }
  if ($Text -match 'Σ|sum') { & $add 'Σ' 'сумма' 'Собирает вклад многих элементов в один итог.' }
  if ($Text -match '⊤|\^T|ᵀ') { & $add '⊤' 'транспонирование' 'Меняет ориентацию вектора или матрицы для умножения.' }
  if ($Text -match '⊙') { & $add '⊙' 'поэлементное умножение' 'Каждая координата умножается отдельно, без смешивания с другими.' }
  if ($Text -match '√|sqrt') { & $add '√' 'корень' 'Мягко уменьшает масштаб величины и стабилизирует численный диапазон.' }
  if ($Text -match '(?i)softmax') { & $add 'softmax' 'нормировка в веса' 'Преобразует scores в вероятности или доли с суммой 1.' }
  if ($Text -match '(?i)log') { & $add 'log' 'логарифм' 'Сжимает диапазон и превращает произведения вероятностей в суммы.' }
  if ($Text -match '\bQ\b|Query') { & $add 'Q' 'Query' 'Что текущий элемент ищет у других элементов.' }
  if ($Text -match '\bK\b|Key') { & $add 'K' 'Key' 'Как каждый элемент описан для сопоставления с query.' }
  if ($Text -match '\bV\b|Value') { & $add 'V' 'Value' 'Информация, которую элемент отдаёт после выбора attention-весов.' }
  if ($Text -match '\bw\b|W|weights|вес') { & $add 'w / W' 'веса' 'Обучаемые важности признаков или связей между слоями.' }
  if ($Text -match '\bx\b|X') { & $add 'x / X' 'вход' 'Данные или признаки, которые формула обрабатывает.' }
  if ($Text -match 'y|ŷ|hat') { & $add 'y / ŷ' 'истина и прогноз' 'Сравнение правильного ответа и предсказания модели.' }
  if ($Text -match '\bb\b|bias') { & $add 'b' 'bias' 'Смещение, которое двигает порог или базовый уровень ответа.' }
  if ($Text -match 'P\(|prob') { & $add 'P(·)' 'вероятность' 'Насколько событие или гипотеза согласуется с данными.' }
  if ($Text -match '=') { & $add '=' 'связь' 'Показывает, как левая величина выражается через правую часть.' }

  if ($rows.Count -eq 0) {
    [void]$rows.Add((New-Row 'x' 'вход' 'То, что формула получает на вход.'))
    [void]$rows.Add((New-Row 'f(x)' 'преобразование' 'Правило, которое меняет вход и возвращает результат.'))
    [void]$rows.Add((New-Row '=' 'связь' 'Показывает зависимость одной величины от другой.'))
  }

  return ($rows | Select-Object -First 6) -join "`r`n"
}

function New-Anatomy {
  param([string]$Text)
  $kind = Get-FormulaKind $Text
  $copy = Get-Copy $kind
  $rows = Get-Rows $Text
  return @"

    <div class="formula-anatomy" data-static-formula-anatomy="1">
      <div class="formula-anatomy__header">Что означают символы</div>
      <div class="formula-anatomy__grid">
$rows
      </div>
      <hr class="formula-anatomy__divider">
      <div class="formula-anatomy__intuition"><strong>Интуиция:</strong> $(ConvertTo-HtmlText $copy[0])</div>
      <div class="formula-anatomy__analogy"><strong>Аналогия:</strong> $(ConvertTo-HtmlText $copy[1])</div>
      <div class="formula-anatomy__example"><strong>Числовой пример:</strong> $(ConvertTo-HtmlText $copy[2])</div>
    </div>
"@
}

$root = Split-Path -Parent $PSScriptRoot
$files = Get-ChildItem -Path $root -Recurse -Filter *.html | Where-Object {
  $_.FullName -notlike "*\vendor\*" -and $_.FullName -notlike "*\node_modules\*"
}

$pattern = [regex]::new('(?is)<div\b[^>]*class\s*=\s*["''][^"'']*(?:\bformula\b|\bfm\b)[^"'']*["''][^>]*>.*?</div>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
$totalInserted = 0

foreach ($file in $files) {
  $html = Get-Content -LiteralPath $file.FullName -Raw
  $matches = $pattern.Matches($html)
  if ($matches.Count -eq 0) { continue }

  $builder = [System.Text.StringBuilder]::new()
  $last = 0
  $insertedInFile = 0

  foreach ($match in $matches) {
    $before = $html.Substring($last, $match.Index - $last)
    [void]$builder.Append($before)
    [void]$builder.Append($match.Value)

    $openTag = [regex]::Match($match.Value, '(?is)^<div\b[^>]*>').Value
    $plain = ConvertTo-PlainText $match.Value
    $afterStart = $match.Index + $match.Length
    $after = $html.Substring($afterStart, [Math]::Min(600, $html.Length - $afterStart))

    $shouldSkip =
      ($openTag -match '\bdata-no-formula-anatomy\b') -or
      ($openTag -match 'class\s*=\s*["''][^"'']*\bformula-anatomy\b') -or
      (Test-CodeLike $plain $openTag) -or
      ($plain.Length -lt 3) -or
      ($after -match '^\s*<div\s+class=["'']formula-anatomy\b')

    if (-not $shouldSkip) {
      [void]$builder.Append((New-Anatomy $plain))
      $insertedInFile += 1
      $totalInserted += 1
    }

    $last = $afterStart
  }

  [void]$builder.Append($html.Substring($last))
  if ($insertedInFile -gt 0) {
    Set-Content -LiteralPath $file.FullName -Value $builder.ToString() -Encoding UTF8
    Write-Host "$($file.FullName): inserted $insertedInFile"
  }
}

Write-Host "Static formula anatomy inserted: $totalInserted"

