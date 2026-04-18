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

function Remove-StaticFormulaAnatomy {
  param([string]$Html)
  $marker = '<div class="formula-anatomy" data-static-formula-anatomy="1">'
  $builder = [System.Text.StringBuilder]::new()
  $pos = 0

  while ($true) {
    $start = $Html.IndexOf($marker, $pos, [System.StringComparison]::OrdinalIgnoreCase)
    if ($start -lt 0) { break }

    [void]$builder.Append($Html.Substring($pos, $start - $pos))
    $tagRegex = [regex]::new('(?is)<div\b[^>]*>|</div>')
    $matches = $tagRegex.Matches($Html, $start)
    $depth = 0
    $end = $start

    foreach ($tag in $matches) {
      if ($tag.Value -match '^<div\b') { $depth += 1 } else { $depth -= 1 }
      if ($depth -eq 0) {
        $end = $tag.Index + $tag.Length
        break
      }
    }

    if ($end -le $start) {
      $pos = $start + $marker.Length
    } else {
      $pos = $end
      while ($pos -lt $Html.Length -and [char]::IsWhiteSpace($Html[$pos])) { $pos += 1 }
    }
  }

  [void]$builder.Append($Html.Substring($pos))
  return $builder.ToString()
}

function Get-FormulaKind {
  param([string]$Text)
  if ($Text -match '(?i)gini|impurity|information gain|\bgain\b') { return "impurity" }
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
    "impurity" { return @("Формула измеряет, насколько узел дерева смешан по классам: чем выше значение, тем менее чистый узел.", "Как коробка с шариками разных цветов: если все шарики одного цвета, беспорядка нет; если цвета перемешаны, impurity выше.", "Если в узле два класса 50/50, то Gini = 1 − (0.5² + 0.5²) = 0.5. Если узел чистый 100/0, то Gini = 0.") }
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
  param([string]$Text, [string]$Kind)
  $rows = New-Object System.Collections.Generic.List[string]
  $add = {
    param($symbol, $name, $description)
    if (-not ($rows | Where-Object { $_ -clike "*>$([System.Net.WebUtility]::HtmlEncode($symbol))<*" })) {
      [void]$rows.Add((New-Row $symbol $name $description))
    }
  }

  if ($Text -match '(?i)\bGini\b') { & $add 'Gini' 'индекс Джини' 'Мера нечистоты узла: 0 означает полностью чистый узел, максимум ближе к смешанным классам.' }
  if ($Text -match '(?i)entropy|\bH\(') { & $add 'H' 'энтропия' 'Мера неопределённости или смешанности распределения классов.' }
  if ($Text -match '(?i)gain|IG') { & $add 'Gain' 'выигрыш разбиения' 'Насколько split уменьшает impurity по сравнению с родительским узлом.' }
  if ($Text -match 'p[_\s]?\{?k\}?|p_k|pₖ') { & $add 'p_k' 'доля класса k' 'Вероятность или частота класса k внутри текущего узла дерева.' }
  if ($Text -match '\bk\s*=|_\{?k|p_k|pₖ') { & $add 'k' 'индекс класса' 'Номер класса, по которому идёт суммирование.' }
  if ($Text -match '\bK\b') {
    if ($Kind -eq 'attention') {
      & $add 'K' 'Key' 'Как каждый элемент описан для сопоставления с query.'
    } else {
      & $add 'K' 'число классов' 'Сколько классов учитывается в сумме: k идёт от 1 до K.'
    }
  }
  if ($Text -match 'x[_\s]?\{?j\}?|x_j') { & $add 'x_j' 'j-й признак' 'Конкретный признак объекта, по которому дерево проверяет условие.' }
  if ($Text -match '\bj\b|x_j') { & $add 'j' 'индекс признака' 'Номер признака, выбранного для текущего split.' }
  if ($Text -match '\bt\b|threshold|порог') { & $add 't' 'порог split' 'Граница, относительно которой объект отправляется в левую или правую ветку.' }
  if ($Text -match 'left|right|branch|вет') { & $add 'left/right' 'ветви дерева' 'Два направления после проверки условия: одна ветка для true, другая для false.' }
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
  if ($Text -match '\bV\b|Value') { & $add 'V' 'Value' 'Информация, которую элемент отдаёт после выбора attention-весов.' }
  if ($Text -match '\bw\b|W|weights|вес') { & $add 'w / W' 'веса' 'Обучаемые важности признаков или связей между слоями.' }
  if ($Text -match '\bx\b|X') { & $add 'x / X' 'вход' 'Данные или признаки, которые формула обрабатывает.' }
  if ($Text -match 'y|ŷ|hat') { & $add 'y / ŷ' 'истина и прогноз' 'Сравнение правильного ответа и предсказания модели.' }
  if ($Text -match '\bb\b|bias') { & $add 'b' 'bias' 'Смещение, которое двигает порог или базовый уровень ответа.' }
  if ($Text -match 'P\(|prob|\bp\b') { & $add 'P(·)' 'вероятность' 'Насколько событие или гипотеза согласуется с данными.' }
  if ($Text -match '=') { & $add '=' 'связь' 'Показывает, как левая величина выражается через правую часть.' }

  if ($rows.Count -eq 0) {
    [void]$rows.Add((New-Row 'x' 'вход' 'То, что формула получает на вход.'))
    [void]$rows.Add((New-Row 'f(x)' 'преобразование' 'Правило, которое меняет вход и возвращает результат.'))
    [void]$rows.Add((New-Row '=' 'связь' 'Показывает зависимость одной величины от другой.'))
  }

  return ($rows | Select-Object -First 8) -join "`r`n"
}

function New-Anatomy {
  param([string]$Text)
  $kind = Get-FormulaKind $Text
  $copy = Get-Copy $kind
  $rows = Get-Rows $Text $kind
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

function Get-PageKind {
  param([string]$Name)
  switch -Regex ($Name) {
    '01_intro_to_classical_ml' { return 'intro' }
    '02_data_preprocessing' { return 'preprocessing' }
    '03_linear_regression' { return 'linear_regression' }
    '04_linear_model_regularization' { return 'regularization' }
    '05_logistic_regression' { return 'logistic' }
    '06_regression_metrics' { return 'regression_metric' }
    '07_classification_metrics' { return 'classification_metric' }
    '08_distance_based_models' { return 'distance' }
    '09_naive_bayes' { return 'naive_bayes' }
    '10_decision_trees' { return 'tree' }
    '11_bagging_random_forest' { return 'forest' }
    '12a_gradient_boosting_theory' { return 'boosting' }
    '12b_gradient_boosting_in_practice' { return 'boosting' }
    '12_boosting' { return 'boosting' }
    '13a_kernel_methods_deeper' { return 'kernel' }
    '13_support_vector_machines' { return 'svm' }
    '14a_gaussian_mixtures_em' { return 'gmm' }
    '14_clustering' { return 'clustering' }
    '15a_kernel_pca_ica_autoencoders' { return 'dimred' }
    '15_dimensionality_reduction' { return 'dimred' }
    '16_ensembles' { return 'ensemble' }
    '17_validation_and_hyperparameter_tuning' { return 'validation' }
    '18_imbalanced_classes' { return 'imbalanced' }
    '19_model_interpretation' { return 'interpretation' }
    '20_practical_pipeline' { return 'pipeline' }
    default { return 'general' }
  }
}

function Get-FormulaKindSmart {
  param([string]$Text, [string]$PageKind)
  if ($Text -match '(?i)gini|impurity|information gain|\bIG\b|\bgain\b') { return 'tree_impurity' }
  if ($Text -match '(?i)entropy|\bH\(|-\s*\\?sum.*log') { return 'entropy' }
  if ($Text -match '(?i)accuracy|precision|recall|f1|TP|FP|TN|FN|TPR|FPR|ROC|AUC|confusion') { return 'classification_metric' }
  if ($Text -match '(?i)MAE|MSE|RMSE|MAPE|R\^?2|R²|SSE|SSR|residual|y_i.*hat|ŷ') {
    if ($PageKind -eq 'linear_regression') { return 'linear_regression' }
    return 'regression_metric'
  }
  if ($Text -match '(?i)sigmoid|logit|odds|BCE|binary cross|logistic|σ') { return 'logistic' }
  if ($Text -match '(?i)L1|L2|Ridge|Lasso|Elastic|regular|weight decay|lambda|λ|alpha|α') { return 'regularization' }
  if ($Text -match '(?i)distance|euclidean|manhattan|minkowski|cosine|k-?NN|nearest|\|\|.*\|\|') { return 'distance' }
  if ($Text -match '(?i)Bayes|posterior|prior|likelihood|P\(|Laplace|Naive') { return 'naive_bayes' }
  if ($Text -match '(?i)bootstrap|bagging|OOB|random forest|vote|average|T_b') { return 'forest' }
  if ($Text -match '(?i)boost|AdaBoost|gradient boosting|residual|F_m|h_m|weak learner|stump') { return 'boosting' }
  if ($Text -match '(?i)SVM|margin|hinge|support vector|kernel|RBF|Mercer|C\s*\\sum|ξ|xi') {
    if ($PageKind -eq 'kernel') { return 'kernel' }
    return 'svm'
  }
  if ($Text -match '(?i)k-?means|centroid|silhouette|DBSCAN|WCSS|inertia|cluster') { return 'clustering' }
  if ($Text -match '(?i)Gaussian mixture|GMM|responsib|EM|gamma|γ|pi_k|π|N\(|Sigma|Σ') {
    if ($PageKind -eq 'gmm') { return 'gmm' }
  }
  if ($Text -match '(?i)PCA|SVD|eigen|covariance|explained variance|component|UΣV|U S V') { return 'dimred' }
  if ($Text -match '(?i)cross.?validation|fold|GridSearch|RandomSearch|argmax|argmin|validation|train') { return 'validation' }
  if ($Text -match '(?i)SMOTE|class weight|minority|majority|imbalance|balanced') { return 'imbalanced' }
  if ($Text -match '(?i)SHAP|PDP|ICE|permutation|importance|φ|phi|baseline') { return 'interpretation' }
  if ($Text -match '(?i)pipeline|fit|transform|leakage|train_test_split') { return 'pipeline' }
  return $PageKind
}

function Get-CopySmart {
  param([string]$Kind)
  switch ($Kind) {
    'intro' { return @('Формула фиксирует базовую логику ML: есть данные, модель, ошибка и проверка на новых примерах.', 'Как пробная настройка прибора: важен не только сам прибор, но и честная проверка измерений.', 'Если baseline даёт 0.70 accuracy, а новая модель 0.72 на одном split, это ещё не доказательство улучшения: нужна валидация.') }
    'preprocessing' { return @('Формула описывает преобразование признака перед обучением, то есть меняет геометрию данных для модели.', 'Как привести разные единицы измерения к одной шкале, чтобы метры и миллиметры не спорили друг с другом.', 'Если признак был 100 при среднем 80 и std 10, standard scaling даст (100-80)/10 = 2.') }
    'linear_regression' { return @('Формула показывает, как линейная модель собирает прогноз из вкладов признаков и штрафует остатки.', 'Как смета: итоговая цена складывается из отдельных позиций с разными коэффициентами.', 'Если y=10, прогноз ŷ=8, то residual=2, а квадрат ошибки равен 4.') }
    'regularization' { return @('Формула добавляет к ошибке штраф за сложность, чтобы модель не опиралась на слишком большие веса.', 'Как договор с лимитом бюджета: можно улучшать качество, но дорогие решения должны окупаться.', 'Если λ=0.1 и сумма квадратов весов 20, регуляризационный штраф равен 2.') }
    'logistic' { return @('Формула переводит линейный score в вероятность и затем в решение через threshold.', 'Как индикатор риска: сырой балл превращается в вероятность события.', 'Если logit=0, sigmoid даёт 0.5; если logit=2, вероятность уже около 0.88.') }
    'regression_metric' { return @('Формула измеряет размер числовой ошибки и задаёт, какие промахи модель должна бояться сильнее.', 'Как оценка точности стрелка: можно считать средний промах или особенно штрафовать дальние попадания.', 'Ошибки 1 и 5 дают MAE=3, но MSE=(1²+5²)/2=13, поэтому крупный промах доминирует.') }
    'classification_metric' { return @('Формула считает качество классификации через типы правильных и неправильных решений.', 'Как медицинский тест: важно отдельно считать найденных больных и ложные тревоги.', 'Если TP=80 и FP=20, precision=80/(80+20)=0.8.') }
    'distance' { return @('Формула задаёт, какие объекты считаются близкими, а значит определяет поведение k-NN и похожих методов.', 'Как карта: выбранная метрика говорит, идти ли по прямой, по кварталам или сравнивать направление.', 'Для точек (0,0) и (3,4) евклидово расстояние равно 5.') }
    'naive_bayes' { return @('Формула обновляет вероятность класса по наблюдаемым признакам и их likelihood.', 'Как диагноз: prior задаёт исходное ожидание, симптомы уточняют его.', 'Если prior класса 0.5, а признаки дают likelihood в 4 раза выше, posterior сильно сдвигается к этому классу.') }
    'tree_impurity' { return @('Формула оценивает, насколько узел дерева смешан и насколько split сделал дочерние узлы чище.', 'Как сортировка шариков по коробкам: хороший вопрос раскладывает цвета отдельно.', 'Для 50/50 Gini = 0.5, а для 90/10 Gini = 1-(0.9²+0.1²)=0.18.') }
    'entropy' { return @('Формула измеряет неопределённость распределения классов в битах или натуральных единицах.', 'Как вопрос “угадай цвет”: чем равномернее варианты, тем больше информации нужно.', 'Для бинарного 50/50 entropy равна 1 биту; для 100/0 entropy равна 0.') }
    'forest' { return @('Формула усредняет много нестабильных деревьев, чтобы снизить variance итоговой модели.', 'Как решение жюри: один эксперт шумит, но среднее мнение группы стабильнее.', 'Если три дерева дают 0,1,1, majority vote выбирает класс 1.') }
    'boosting' { return @('Формула добавляет слабую модель как поправку к текущему ансамблю, обычно в сторону ошибок или градиента.', 'Как редактировать черновик: каждый проход исправляет оставшиеся слабые места.', 'Если F₀=10, новое дерево даёт h=2, а η=0.1, новый прогноз F₁=10.2.') }
    'svm' { return @('Формула ищет границу с большим margin и штрафует объекты, которые нарушают зазор.', 'Как провести коридор между двумя группами точек: граница должна быть не вплотную к объектам.', 'Если margin violation равен 0, объект не добавляет hinge-loss; если violation 0.7, он штрафуется.') }
    'kernel' { return @('Формула считает похожесть так, будто данные уже подняты в более богатое пространство признаков.', 'Как сравнивать тексты не по словам напрямую, а по скрытой близости смыслов.', 'RBF-kernel близок к 1 для похожих точек и стремится к 0 для далёких.') }
    'clustering' { return @('Формула описывает компактность или разделённость групп без использования правильных labels.', 'Как разложить вещи по коробкам так, чтобы внутри коробки предметы были похожи.', 'Если точка ближе к центроиду A, чем к B, k-means назначит её кластеру A.') }
    'gmm' { return @('Формула описывает данные как смесь вероятностных компонент и даёт мягкую принадлежность к ним.', 'Как определить, из какой фабрики пришла деталь, если партии перекрываются по размерам.', 'Если responsibilities равны 0.8 и 0.2, точка в основном относится к первой Gaussian-компоненте.') }
    'dimred' { return @('Формула ищет сжатое представление данных, сохраняя главную структуру: variance, независимость или реконструкцию.', 'Как сделать карту метро: сохранить важные связи, убрав лишние детали.', 'Если первая PCA-компонента объясняет 70% variance, одна ось уже несёт большую часть разброса.') }
    'ensemble' { return @('Формула смешивает несколько моделей, чтобы получить более устойчивое решение, чем у одной модели.', 'Как совет экспертов: разные ошибки частично компенсируют друг друга.', 'Если модели дают вероятности 0.6, 0.7 и 0.8, average ensemble вернёт 0.7.') }
    'validation' { return @('Формула задаёт честный способ оценить модель и выбрать гиперпараметры без подглядывания в test.', 'Как репетиция перед экзаменом: тренировочные задачи не должны совпадать с финальными.', 'В 5-fold CV модель обучается 5 раз, каждый раз оставляя другую пятую часть для проверки.') }
    'imbalanced' { return @('Формула меняет взгляд на качество, когда классы встречаются неравномерно и accuracy становится misleading.', 'Как искать редкую поломку: “почти всегда нет поломки” даёт высокую accuracy, но бесполезно.', 'При 1% positives модель “всегда 0” имеет 99% accuracy и 0 recall по редкому классу.') }
    'interpretation' { return @('Формула раскладывает prediction или качество на вклады признаков, но объясняет модель, а не причинность мира.', 'Как разбор чека: видно, какие позиции дали итоговую сумму, но не почему их купили.', 'Если baseline 0.3, prediction 0.8 и вклад признака +0.2, этот признак поднял прогноз модели.') }
    'pipeline' { return @('Формула фиксирует порядок обработки данных, чтобы обучение и проверка проходили честно и воспроизводимо.', 'Как производственная линия: каждый шаг должен быть тем же на train, validation и будущих данных.', 'Scaler fit-ится на train, а validation только transform-ится; иначе появляется leakage.') }
    default { return @('Формула задаёт правило, по которому данные превращаются в прогноз, score или критерий выбора.', 'Как техническая инструкция: входы, параметры и правило вместе дают измеримый результат.', 'Если меняется один вход, смотри, как меняется итоговый score или решение модели.') }
  }
}

function Add-SmartFallbackRows {
  param([System.Collections.Generic.List[string]]$Rows, [string]$Kind)
  $addFallback = {
    param($symbol, $name, $description)
    if (-not ($Rows | Where-Object { $_ -clike "*>$([System.Net.WebUtility]::HtmlEncode($symbol))<*" })) {
      [void]$Rows.Add((New-Row $symbol $name $description))
    }
  }
  switch ($Kind) {
    'preprocessing' { & $addFallback 'x' 'исходный признак' 'Значение до преобразования.'; & $addFallback 'μ / mean' 'центр признака' 'Среднее значение, вычисленное только на train.'; & $addFallback 'σ / std' 'масштаб признака' 'Разброс, на который делят после центрирования.' }
    'linear_regression' { & $addFallback 'ŷ' 'прогноз' 'Число, которое модель предсказывает для объекта.'; & $addFallback 'w' 'коэффициенты' 'Вклад каждого признака в итоговый прогноз.'; & $addFallback 'b' 'свободный член' 'Базовый уровень прогноза при нулевых признаках.' }
    'regularization' { & $addFallback 'λ' 'сила регуляризации' 'Чем больше λ, тем сильнее штраф за сложность.'; & $addFallback 'w_i' 'вес признака' 'Коэффициент модели, который штрафуется регуляризацией.'; & $addFallback 'L_reg' 'итоговый loss' 'Ошибка модели плюс штраф за сложность.' }
    'logistic' { & $addFallback 'z' 'logit' 'Сырой линейный score до sigmoid.'; & $addFallback 'σ(z)' 'вероятность' 'Score, сжатый в диапазон от 0 до 1.'; & $addFallback 'threshold' 'порог решения' 'Граница, после которой вероятность переводится в класс 1.' }
    'regression_metric' { & $addFallback 'y_i' 'истинный ответ' 'Реальное значение target.'; & $addFallback 'ŷ_i' 'предсказание' 'Ответ модели для i-го объекта.'; & $addFallback 'n' 'число объектов' 'Сколько ошибок усредняется в метрике.' }
    'classification_metric' { & $addFallback 'TP' 'true positives' 'Положительные объекты, найденные моделью правильно.'; & $addFallback 'FP' 'false positives' 'Ложные срабатывания модели.'; & $addFallback 'FN' 'false negatives' 'Пропущенные положительные объекты.' }
    'distance' { & $addFallback 'd(x,y)' 'расстояние' 'Численная мера близости между двумя объектами.'; & $addFallback 'x_i, y_i' 'координаты' 'Значения признаков двух сравниваемых объектов.'; & $addFallback 'k' 'число соседей' 'Сколько ближайших объектов участвуют в голосовании.' }
    'naive_bayes' { & $addFallback 'P(C|x)' 'posterior класса' 'Вероятность класса после наблюдения признаков.'; & $addFallback 'P(x|C)' 'likelihood' 'Насколько признаки типичны для этого класса.'; & $addFallback 'P(C)' 'prior класса' 'Частота или ожидание класса до признаков.' }
    'tree_impurity' { & $addFallback 'p_k' 'доля класса k' 'Частота класса внутри текущего узла.'; & $addFallback 'K' 'число классов' 'Сколько классов учитывается в узле.'; & $addFallback 'split' 'вопрос дерева' 'Проверка признака, которая делит узел на дочерние группы.' }
    'entropy' { & $addFallback 'H' 'entropy' 'Неопределённость распределения классов.'; & $addFallback 'p_k' 'доля класса' 'Вероятность класса внутри узла.'; & $addFallback 'log₂' 'измерение в битах' 'Показывает количество информации в бинарных вопросах.' }
    'forest' { & $addFallback 'B' 'число деревьев' 'Сколько bootstrap-моделей входит в ансамбль.'; & $addFallback 'T_b(x)' 'прогноз дерева' 'Ответ b-го дерева для объекта x.'; & $addFallback 'vote / mean' 'агрегация' 'Голосование для классификации или среднее для регрессии.' }
    'boosting' { & $addFallback 'F_m(x)' 'текущий ансамбль' 'Прогноз после m добавленных weak learners.'; & $addFallback 'h_m(x)' 'новая слабая модель' 'Поправка, которую добавляют на текущем шаге.'; & $addFallback 'η' 'learning rate' 'Насколько сильно добавляется новая поправка.' }
    'svm' { & $addFallback 'w, b' 'гиперплоскость' 'Параметры разделяющей границы.'; & $addFallback 'C' 'цена нарушения' 'Насколько сильно штрафуются ошибки margin.'; & $addFallback 'ξ_i' 'slack' 'Величина нарушения margin для объекта.' }
    'kernel' { & $addFallback 'K(x,z)' 'kernel' 'Функция похожести двух объектов.'; & $addFallback 'γ' 'ширина RBF' 'Управляет локальностью похожести.'; & $addFallback 'φ(x)' 'скрытые признаки' 'Неявное пространство, где kernel ведёт себя как dot product.' }
    'clustering' { & $addFallback 'μ_k' 'центроид' 'Центр k-го кластера.'; & $addFallback 'c_i' 'назначение кластера' 'К какому кластеру отнесён i-й объект.'; & $addFallback 'K' 'число кластеров' 'Сколько групп ищет алгоритм.' }
    'gmm' { & $addFallback 'π_k' 'вес компоненты' 'Доля k-й Gaussian-компоненты в смеси.'; & $addFallback 'μ_k, Σ_k' 'параметры Gaussian' 'Центр и форма k-й компоненты.'; & $addFallback 'γ_ik' 'responsibility' 'Мягкая принадлежность объекта i к компоненте k.' }
    'dimred' { & $addFallback 'X' 'матрица данных' 'Объекты по строкам, признаки по столбцам.'; & $addFallback 'component' 'новая ось' 'Направление, на которое проецируются данные.'; & $addFallback 'λ' 'explained variance' 'Сколько разброса объясняет компонента.' }
    'ensemble' { & $addFallback 'M' 'число моделей' 'Сколько моделей смешивается.'; & $addFallback 'f_m(x)' 'прогноз модели' 'Ответ m-го участника ансамбля.'; & $addFallback 'w_m' 'вес модели' 'Насколько сильно m-я модель влияет на итог.' }
    'validation' { & $addFallback 'fold' 'часть CV' 'Один train/validation split внутри cross-validation.'; & $addFallback 'score' 'метрика качества' 'Значение, по которому выбирают гиперпараметры.'; & $addFallback 'θ' 'гиперпараметры' 'Настройки модели, выбранные по validation.' }
    'imbalanced' { & $addFallback 'minority' 'редкий класс' 'Класс, который важен, но встречается редко.'; & $addFallback 'weight' 'вес класса' 'Множитель ошибки для компенсации дисбаланса.'; & $addFallback 'threshold' 'порог решения' 'Настраивается под precision/recall trade-off.' }
    'interpretation' { & $addFallback 'f(x)' 'прогноз модели' 'Что именно объясняет метод интерпретации.'; & $addFallback 'baseline' 'базовый уровень' 'Средний или ожидаемый прогноз до учёта признаков.'; & $addFallback 'φ_i' 'вклад признака' 'Насколько признак сдвигает прогноз относительно baseline.' }
    'pipeline' { & $addFallback 'fit' 'обучить состояние' 'Вычислить параметры preprocessing или модели на train.'; & $addFallback 'transform' 'применить состояние' 'Преобразовать данные уже найденными параметрами.'; & $addFallback 'train/val/test' 'разделы данных' 'Разные роли данных для обучения, выбора и финальной проверки.' }
    default { & $addFallback 'x' 'вход' 'Данные, которые формула обрабатывает.'; & $addFallback 'f(x)' 'правило модели' 'Преобразование входа в score, прогноз или критерий.'; & $addFallback 'score' 'измеримый результат' 'Число, по которому принимается решение или сравнение.' }
  }
}

function Get-RowsSmart {
  param([string]$Text, [string]$Kind)
  $rows = New-Object System.Collections.Generic.List[string]
  $add = {
    param($symbol, $name, $description)
    if (-not ($rows | Where-Object { $_ -clike "*>$([System.Net.WebUtility]::HtmlEncode($symbol))<*" })) {
      [void]$rows.Add((New-Row $symbol $name $description))
    }
  }

  if ($Text -match 'p[_\s]?\{?k\}?|p_k|pₖ') { & $add 'p_k' 'доля класса k' 'Частота класса k внутри текущего узла, кластера или распределения.' }
  if ($Text -match '\bK\b') { & $add 'K' 'число групп/классов' 'В зависимости от темы: число классов, кластеров или компонент.' }
  if ($Text -match 'Σ|sum|\\sum') { & $add 'Σ' 'сумма' 'Складывает вклад объектов, классов, признаков или моделей.' }
  if ($Text -match '(?i)log') { & $add 'log' 'логарифм' 'Сжимает вероятности и превращает произведения в суммы.' }
  if ($Text -match 'λ|lambda') { & $add 'λ' 'сила штрафа' 'Гиперпараметр, управляющий регуляризацией или ограничением.' }
  if ($Text -match 'α|alpha') { & $add 'α' 'коэффициент шага/штрафа' 'В зависимости от темы: сила learner-а, pruning или регуляризации.' }
  if ($Text -match 'η|learning rate') { & $add 'η' 'learning rate' 'Размер добавляемого шага или поправки.' }
  if ($Text -match 'y_i|yᵢ') { & $add 'y_i' 'истинный ответ' 'Правильное значение для i-го объекта.' }
  if ($Text -match 'ŷ|\\hat\{y\}|y_hat') { & $add 'ŷ_i' 'предсказание' 'Ответ модели для i-го объекта.' }
  if ($Text -match '\bn\b|n_') { & $add 'n' 'число объектов' 'Размер выборки, узла, fold-а или группы.' }
  if ($Text -match 'x_j|xⱼ') { & $add 'x_j' 'j-й признак' 'Значение конкретной колонки объекта.' }
  if ($Text -match '\bt\b|threshold') { & $add 't' 'порог' 'Граница, по которой объект отправляется в одну из групп.' }
  if ($Text -match '(?i)TP') { & $add 'TP' 'true positives' 'Положительные объекты, найденные правильно.' }
  if ($Text -match '(?i)FP') { & $add 'FP' 'false positives' 'Отрицательные объекты, ошибочно помеченные положительными.' }
  if ($Text -match '(?i)FN') { & $add 'FN' 'false negatives' 'Положительные объекты, которые модель пропустила.' }
  if ($Text -match '(?i)TN') { & $add 'TN' 'true negatives' 'Отрицательные объекты, найденные правильно.' }
  if ($Text -match 'μ|mu') { & $add 'μ' 'среднее / центр' 'Центр распределения, кластера или масштабируемого признака.' }
  if ($Text -match 'σ|std') { & $add 'σ' 'стандартное отклонение' 'Мера разброса вокруг среднего.' }
  if ($Text -match 'π|pi_') { & $add 'π_k' 'вес компоненты' 'Доля k-й компоненты в смеси.' }
  if ($Text -match 'γ|gamma') { & $add 'γ' 'gamma / responsibility' 'В kernel это ширина RBF, в GMM — мягкая принадлежность.' }
  if ($Text -match '(?i)C\b|\\bC\\b') { & $add 'C' 'сила штрафа' 'В SVM задаёт цену margin-нарушений.' }
  if ($Text -match 'ξ|xi') { & $add 'ξ_i' 'slack-переменная' 'Насколько объект нарушает margin.' }
  if ($Text -match '(?i)fold') { & $add 'fold' 'валидационная часть' 'Один из разбиений в cross-validation.' }

  Add-SmartFallbackRows $rows $Kind
  return ($rows | Select-Object -First 8) -join "`r`n"
}

function New-Anatomy {
  param([string]$Text, [string]$PageName)
  $pageKind = Get-PageKind $PageName
  $kind = Get-FormulaKindSmart $Text $pageKind
  $copy = Get-CopySmart $kind
  $rows = Get-RowsSmart $Text $kind
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
$targetDir = $env:ML_NOTES_TARGET_DIR
$scanRoot = if ([string]::IsNullOrWhiteSpace($targetDir)) { $root } else { Join-Path $root $targetDir }
$files = Get-ChildItem -Path $scanRoot -Recurse -Filter *.html | Where-Object {
  $_.FullName -notlike "*\vendor\*" -and $_.FullName -notlike "*\node_modules\*"
}

$pattern = [regex]::new('(?is)<div\b[^>]*class\s*=\s*["''][^"'']*(?:\bformula\b|\bfm\b)[^"'']*["''][^>]*>.*?</div>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
$totalInserted = 0

foreach ($file in $files) {
  $html = Get-Content -LiteralPath $file.FullName -Raw
  $html = Remove-StaticFormulaAnatomy $html
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
      ($openTag -match '\bdata-no-tex\b') -or
      ($openTag -match 'class\s*=\s*["''][^"'']*\bformula-anatomy') -or
      (Test-CodeLike $plain $openTag) -or
      ($plain.Length -lt 3) -or
      ($after -match '^\s*<div\s+class=["'']formula-anatomy\b')

    if (-not $shouldSkip) {
      [void]$builder.Append((New-Anatomy $plain $file.Name))
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



