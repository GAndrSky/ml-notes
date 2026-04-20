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

$notes = [ordered]@{}

# NOTES_START

$notes["03_neural_basics/01_perceptron_and_neuron.html"] = New-Note `
  -Title 'Нейрон как обучаемая аффинная проверка признаков' `
  -Paragraphs @(
    'Один нейрон берёт входной вектор, считает взвешенную сумму, добавляет bias и пропускает результат через активацию. В этой операции уже есть главная идея deep learning: признаки получают обучаемые веса, а сеть настраивает, какие комбинации важны.',
    'Перцептрон без нелинейностей остаётся линейной моделью. Глубина становится полезной, когда между линейными слоями появляются активации, позволяющие строить композицию нелинейных преобразований.'
  ) `
  -Geometry @(
    'w^T x + b задаёт гиперплоскость; знак score показывает сторону пространства.',
    'Bias сдвигает границу без изменения её наклона.',
    'Несколько нейронов создают несколько направлений, по которым слой измеряет вход.'
  ) `
  -Probability @(
    'Сам score не является вероятностью; вероятность появляется после sigmoid или softmax.',
    'Веса можно читать как learned evidence: положительный вклад повышает score, отрицательный снижает.',
    'Калибровка вероятностей не гарантируется только архитектурой нейрона.'
  ) `
  -Optimization @(
    'Градиент показывает, как изменить каждый вес, чтобы уменьшить loss.',
    'Если входы не масштабированы, веса получают градиенты разного масштаба.',
    'Initialization задаёт стартовые направления, learning rate задаёт размер шагов.'
  ) `
  -Practice @(
    'Следи за shapes: batch dimension, input features, output units.',
    'Не забывай bias: без него граница обязана проходить через начало координат.',
    'Подбирай activation под задачу: sigmoid, softmax или linear output.'
  ) `
  -Example 'Если нейрон оценивает риск, вес возраста +0.4 повышает score при росте возраста, а вес скидки -0.2 снижает score при наличии скидки.'

$notes["03_neural_basics/02_activation_functions.html"] = New-Note `
  -Title 'Активации как источник нелинейности и градиентного поведения' `
  -Paragraphs @(
    'Активация делает сеть нелинейной и одновременно определяет, как градиент проходит назад через слой. Поэтому ReLU, sigmoid, tanh, GELU и SiLU влияют не только на forward pass, но и на trainability.',
    'Saturation — ключевая проблема. Когда sigmoid или tanh попадают в плоскую область, производная становится маленькой, и нижние слои получают слабый gradient signal.'
  ) `
  -Geometry @(
    'ReLU превращает пространство в кусочно-линейные области.',
    'Sigmoid сжимает ось в интервал 0..1 и теряет различия между очень большими значениями.',
    'GELU и SiLU дают мягкий gating без резкого обрыва отрицательных значений.'
  ) `
  -Probability @(
    'Sigmoid удобно читать как вероятность binary class, но только вместе с правильным loss.',
    'Softmax превращает vector logits в распределение по классам.',
    'GELU имеет probabilistic gating-интуицию: вход масштабируется вероятностью активности.'
  ) `
  -Optimization @(
    'Производная активации умножается на upstream gradient.',
    'Dead ReLU возникает, когда нейрон долго находится в отрицательной области и получает нулевой градиент.',
    'Smooth activations могут давать стабильные градиенты, но стоят дороже вычислительно.'
  ) `
  -Practice @(
    'В hidden layers начинай с ReLU/GELU/SiLU.',
    'Для logits используй стабильные loss: BCEWithLogitsLoss или CrossEntropyLoss.',
    'Если loss не двигается, проверь activation distribution, initialization и learning rate.'
  ) `
  -Example 'Если z = -3, ReLU отдаст 0 и градиент 0, а GELU сохранит маленький отрицательный выход и небольшой gradient signal.'

$notes["03_neural_basics/03_forward_pass.html"] = New-Note `
  -Title 'Forward pass как композиция тензорных преобразований' `
  -Paragraphs @(
    'Forward pass — это построение цепочки промежуточных тензоров, которые потом нужны backpropagation. Каждый слой меняет representation: размерность, масштаб, нелинейность и статистику активаций.',
    'Хорошее понимание forward pass начинается с shapes. Большая часть ошибок в нейросетях — несогласованные размерности, неправильный batch dimension, лишний transpose или неверная нормализация logits.'
  ) `
  -Geometry @(
    'Линейный слой поворачивает, масштабирует и сдвигает пространство признаков.',
    'Активации сгибают пространство и дают нелинейную функцию.',
    'Depth означает последовательное переописание объекта в более абстрактных координатах.'
  ) `
  -Probability @(
    'Logits — не вероятности; вероятности появляются после sigmoid/softmax.',
    'Normalization layers меняют статистику входов для следующих слоёв.',
    'Dropout ведёт себя по-разному в train и eval, поэтому режим модели важен.'
  ) `
  -Optimization @(
    'Forward pass сохраняет computational graph для chain rule.',
    'Плохие масштабы активаций ведут к exploding или vanishing gradients.',
    'Numerical overflow в forward ломает backward.'
  ) `
  -Practice @(
    'Печатай shapes на границах блоков: input, hidden, logits, loss.',
    'Разделяй train/eval режимы.',
    'Не применяй softmax перед CrossEntropyLoss в PyTorch.'
  ) `
  -Example 'Для batch 32 и 10 классов logits должны иметь shape [32, 10], а target для CrossEntropyLoss — shape [32] с class indices.'

$notes["03_neural_basics/04_loss_functions.html"] = New-Note `
  -Title 'Loss-функции как язык задачи' `
  -Paragraphs @(
    'Loss задаёт, что модель считает ошибкой. Одна и та же архитектура будет вести себя по-разному с MSE, BCE, cross-entropy, contrastive loss или ranking loss, потому что градиенты будут толкать параметры к разным решениям.',
    'Training loss и business metric не обязаны совпадать. Loss должен быть удобен для оптимизации и связан с целью, но финальное решение может оцениваться F1, recall at precision, NDCG, calibration error или revenue.'
  ) `
  -Geometry @(
    'MSE создаёт квадратичный штраф и сильно тянет к большим ошибкам.',
    'Cross-entropy повышает logit правильного класса относительно остальных.',
    'Contrastive losses меняют embedding space: похожие объекты сближаются, разные отталкиваются.'
  ) `
  -Probability @(
    'BCE и cross-entropy — negative log-likelihood для Bernoulli и categorical distributions.',
    'MSE соответствует Gaussian noise при regression assumptions.',
    'Proper scoring rules поощряют честные вероятности, а не только правильный класс.'
  ) `
  -Optimization @(
    'Стабильные loss работают с logits, чтобы избежать log(0), overflow и underflow.',
    'Reduction mean/sum меняет масштаб градиента и фактический learning rate.',
    'Class weights и label smoothing меняют градиентный сигнал.'
  ) `
  -Practice @(
    'Выбирай loss по типу target: regression, binary, multiclass, multilabel, ranking или embeddings.',
    'Проверяй shapes и dtype target.',
    'Если loss падает, а метрика нет, возможно loss плохо соответствует рабочей цели.'
  ) `
  -Example 'Для binary classification лучше BCEWithLogitsLoss на raw score z, чем sigmoid(z) + BCELoss вручную: встроенная версия стабильнее.'

$notes["02_classic_ml/13_support_vector_machines.html"] = New-Note `
  -Title 'SVM как максимизация зазора' `
  -Paragraphs @(
    'SVM ищет разделяющую границу с максимальным margin между классами. Модель не просто классифицирует train points, а выбирает границу с максимальным запасом до критичных объектов.',
    'В soft-margin SVM разрешены нарушения margin. Параметр C задаёт компромисс между шириной margin и ценой ошибок на train.'
  ) `
  -Geometry @(
    'Support vectors лежат на margin или нарушают его; именно они определяют границу.',
    'Большой margin обычно даёт более устойчивое решение.',
    'Kernel SVM строит линейную границу в скрытом feature space, которая выглядит нелинейной в исходном пространстве.'
  ) `
  -Probability @(
    'SVM напрямую не оценивает вероятность, а оптимизирует margin-based score.',
    'Для probabilities нужна calibration: Platt scaling или isotonic regression.',
    'Hinge loss заботится о стороне margin, а не о калиброванной уверенности.'
  ) `
  -Optimization @(
    'Hinge loss выпуклый, но недифференцируемый в точке margin.',
    'Большой C меньше терпит нарушения, маленький C сильнее регуляризует.',
    'Kernel matrix дорогая по памяти и времени на больших данных.'
  ) `
  -Practice @(
    'Всегда масштабируй признаки перед SVM.',
    'Для RBF тюнь C и gamma вместе.',
    'На больших датасетах проверь linear SVM или approximate kernels.'
  ) `
  -Example 'Если C слишком велик, SVM может согнуть границу вокруг noisy points. При меньшем C модель допустит нарушения, но сохранит широкий margin.'

$notes["02_classic_ml/13a_kernel_methods_deeper.html"] = New-Note `
  -Title 'Kernel methods как неявная геометрия похожести' `
  -Paragraphs @(
    'Kernel trick позволяет вычислять dot product в feature space, не строя сами признаки явно. Это полезно, когда явное пространство огромное или бесконечномерное.',
    'Kernel задаёт не просто функцию, а смысл похожести. От него зависит, какие объекты считаются близкими и какие границы решения считаются простыми.'
  ) `
  -Geometry @(
    'Polynomial kernel добавляет взаимодействия признаков.',
    'RBF kernel делает влияние точки локальным.',
    'Gamma управляет радиусом влияния: большой gamma даёт очень локальные границы.'
  ) `
  -Probability @(
    'Positive semidefinite kernel можно читать как корректную матрицу похожести.',
    'Gaussian Process использует kernel как covariance function.',
    'RBF-интуиция связана с локальным влиянием наблюдений.'
  ) `
  -Optimization @(
    'Dual formulation выражает решение через train points и kernel matrix.',
    'Стоимость растёт с числом объектов.',
    'Regularization нужна, чтобы kernel model не подгоняла локальный шум.'
  ) `
  -Practice @(
    'Подбирай kernel под домен и тип признаков.',
    'Проверяй C/gamma на логарифмической сетке.',
    'Если matrix слишком большая, смотри Nyström или random Fourier features.'
  ) `
  -Example 'RBF с gamma=100 может считать похожими только почти идентичные объекты, и граница станет пятнистой.'

$notes["02_classic_ml/14_clustering.html"] = New-Note `
  -Title 'Clustering как поиск структуры без target' `
  -Paragraphs @(
    'В кластеризации нет правильной метки, поэтому алгоритм сам задаёт, что значит хорошая группа: компактность, плотность, иерархическая близость или вероятностная смесь.',
    'Разные методы могут честно дать разные кластеры на одних данных. Перед применением нужно понять, какая структура нужна задаче и как проверять полезность результата.'
  ) `
  -Geometry @(
    'k-means ищет сферические компактные группы вокруг центроидов.',
    'DBSCAN ищет плотные области и кластеры неправильной формы.',
    'Hierarchical clustering строит дерево близостей.'
  ) `
  -Probability @(
    'Кластер не равен истинному классу без внешней проверки.',
    'GMM добавляет soft membership вместо жёсткого назначения.',
    'Стабильность кластеров на resampling часто важнее красивой визуализации.'
  ) `
  -Optimization @(
    'k-means минимизирует within-cluster squared distances.',
    'DBSCAN зависит от eps и min_samples.',
    'Dimensionality reduction может убрать шум, но исказить расстояния.'
  ) `
  -Practice @(
    'Сначала выбери смысл кластера: сегменты, темы, аномалии, похожие объекты.',
    'Проверяй профили признаков и downstream usefulness.',
    'Не называй кластеры классами без validation.'
  ) `
  -Example 'k-means может разделить клиентов по среднему чеку, а DBSCAN — по плотным группам поведения; оба ответа валидны для разных вопросов.'

$notes["02_classic_ml/14a_gaussian_mixtures_em.html"] = New-Note `
  -Title 'GMM и EM как мягкая кластеризация' `
  -Paragraphs @(
    'Gaussian Mixture Model предполагает, что данные порождены смесью Gaussian-компонент. Объект может принадлежать нескольким компонентам с разными вероятностями.',
    'EM чередует E-step, где оцениваются responsibilities, и M-step, где обновляются параметры компонент. Likelihood обычно растёт, но глобальный максимум не гарантирован.'
  ) `
  -Geometry @(
    'Каждая Gaussian-компонента задаёт эллипсоид плотности.',
    'Covariance matrix определяет форму, вытянутость и поворот компоненты.',
    'Soft assignments дают плавные границы между кластерами.'
  ) `
  -Probability @(
    'Responsibility — вероятность, что компонент породил объект.',
    'Mixture weights отражают долю компонент в данных.',
    'Вырожденная covariance может искусственно поднять likelihood.'
  ) `
  -Optimization @(
    'EM монотонно не ухудшает likelihood, но может застрять локально.',
    'Initialization сильно влияет на результат.',
    'Количество компонент выбирают по BIC/AIC, validation likelihood и смыслу.'
  ) `
  -Practice @(
    'Сравни covariance_type: full, diagonal, spherical.',
    'Проверяй компоненты с почти нулевой variance.',
    'Интерпретируй soft probabilities, а не только argmax cluster.'
  ) `
  -Example 'Если responsibilities объекта 0.55 и 0.45, GMM показывает неопределённость, а не насильно кладёт объект в один кластер.'

$notes["02_classic_ml/15_dimensionality_reduction.html"] = New-Note `
  -Title 'Снижение размерности как сохранение структуры' `
  -Paragraphs @(
    'Снижение размерности заменяет исходные признаки меньшим числом координат, стараясь сохранить важную структуру: variance, расстояния, локальные соседства или reconstruction.',
    'PCA ищет ортогональные направления максимальной дисперсии. Но высокая variance не всегда равна полезной информации для supervised target.'
  ) `
  -Geometry @(
    'PCA поворачивает оси к направлениям наибольшего разброса.',
    'Проекция на первые компоненты минимизирует squared reconstruction error среди линейных проекций.',
    't-SNE/UMAP сохраняют локальные соседства, но искажают глобальные расстояния.'
  ) `
  -Probability @(
    'Probabilistic PCA описывает данные как latent variables плюс Gaussian noise.',
    'Explained variance ratio показывает долю дисперсии, а не долю смысла.',
    'Малодисперсный признак может быть критичен для редкого класса.'
  ) `
  -Optimization @(
    'PCA решается через eigendecomposition или SVD.',
    'Whitening нормализует variance компонент, но может усилить noise.',
    'Для больших данных используют randomized или incremental PCA.'
  ) `
  -Practice @(
    'Масштабируй признаки перед PCA.',
    'Не обучай PCA на всём датасете до split-а.',
    'Не делай вывод о кластерах только по красивой 2D-картинке.'
  ) `
  -Example 'Если 20 компонент сохраняют 95% variance, модель может стать быстрее, но нужно проверить, не потерялась ли малая компонента для редкого класса.'

$notes["02_classic_ml/15a_kernel_pca_ica_autoencoders.html"] = New-Note `
  -Title 'Kernel PCA, ICA и Autoencoders как разные latent views' `
  -Paragraphs @(
    'Когда данные лежат на нелинейном manifold-е, линейная PCA может требовать слишком много компонент. Kernel PCA, ICA и autoencoders строят разные latent representations.',
    'Эти методы решают разные задачи: Kernel PCA сохраняет kernel-геометрию, ICA ищет независимые источники, autoencoder учит сжатие через reconstruction.'
  ) `
  -Geometry @(
    'Kernel PCA делает PCA в неявном нелинейном feature space.',
    'Autoencoder сжимает вход в bottleneck и восстанавливает через decoder.',
    'ICA поворачивает пространство к независимым источникам, а не просто некоррелированным осям.'
  ) `
  -Probability @(
    'ICA предполагает latent sources и статистическую независимость.',
    'Обычный autoencoder не задаёт полноценное распределение, в отличие от VAE.',
    'Reconstruction error может быть proxy для anomaly, но не calibrated probability.'
  ) `
  -Optimization @(
    'Kernel PCA ограничен размером kernel matrix.',
    'Autoencoder чувствителен к архитектуре, bottleneck, noise и регуляризации.',
    'Слишком мощный autoencoder может выучить почти identity mapping.'
  ) `
  -Practice @(
    'Выбирай метод по цели: visualization, compression, denoising, anomaly detection или feature learning.',
    'Проверяй downstream metric, а не только reconstruction.',
    'Для autoencoder анализируй latent space и validation reconstruction.'
  ) `
  -Example 'Если точки лежат на окружности, linear PCA видит две координаты, а kernel PCA может раскрыть нелинейную структуру.'

$notes["02_classic_ml/16_ensembles.html"] = New-Note `
  -Title 'Ансамбли как управление разными ошибками' `
  -Paragraphs @(
    'Ансамбль полезен, когда модели ошибаются не полностью одинаково. Averaging снижает variance, voting стабилизирует класс, stacking учит meta-model комбинировать предсказания.',
    'Главное условие — diversity. Если все модели имеют одинаковые признаки, алгоритм и ошибки, ансамбль почти не добавит качества.'
  ) `
  -Geometry @(
    'Averaging сглаживает границы решений.',
    'Voting объединяет несколько разбиений пространства.',
    'Stacking строит новое пространство из predictions base models.'
  ) `
  -Probability @(
    'Усреднение вероятностей похоже на mixture of experts без явного gating.',
    'Некалиброванные вероятности разных моделей нельзя бездумно усреднять.',
    'Out-of-fold predictions нужны, чтобы meta-model не видел train leakage.'
  ) `
  -Optimization @(
    'Bagging снижает variance, boosting снижает bias, stacking оптимизирует комбинацию.',
    'Weights ансамбля можно подбирать на validation, но легко переобучиться.',
    'Сложный ансамбль повышает latency и стоимость поддержки.'
  ) `
  -Practice @(
    'Собирай diversity через разные алгоритмы, признаки, seeds и folds.',
    'Для stacking используй out-of-fold predictions.',
    'Сравни выигрыш качества с ценой inference.'
  ) `
  -Example 'Если linear model ловит общий тренд, а tree model локальные правила, их среднее может быть стабильнее каждой отдельно.'

$notes["02_classic_ml/17_validation_and_hyperparameter_tuning.html"] = New-Note `
  -Title 'Валидация как защита от самообмана' `
  -Paragraphs @(
    'Валидация отвечает на вопрос, как модель поведёт себя на данных, которых она не видела. Неправильный split может сделать бесполезную модель выглядящей сильной.',
    'Hyperparameter tuning — тоже обучение на validation signal. Чем больше попыток, тем выше риск подогнать процесс под конкретную validation выборку.'
  ) `
  -Geometry @(
    'Split должен повторять deployment: time split, group split, stratification.',
    'Cross-validation усредняет качество по нескольким разрезам данных.',
    'Nested CV отделяет подбор гиперпараметров от честной оценки.'
  ) `
  -Probability @(
    'Validation score — случайная величина с дисперсией.',
    'Repeated CV помогает понять, значимо ли отличие моделей.',
    'Leakage уничтожает независимость validation.'
  ) `
  -Optimization @(
    'Grid search тратит бюджет равномерно, random search лучше в высоких размерностях.',
    'Bayesian optimization использует историю trials, но тоже может переобучиться на validation.',
    'Early stopping является частью выбора гиперпараметров.'
  ) `
  -Practice @(
    'Сначала фиксируй split и метрику, потом начинай tuning.',
    'Для связанных объектов используй GroupKFold.',
    'Test не трогают до финального выбора модели.'
  ) `
  -Example 'Если один пользователь имеет 20 записей, случайный split может отправить часть в train и часть в validation, и модель выучит пользователя.'

$notes["02_classic_ml/18_imbalanced_classes.html"] = New-Note `
  -Title 'Imbalance и цена редких ошибок' `
  -Paragraphs @(
    'Imbalance означает, что базовая частота классов сильно различается. Accuracy может быть высокой, даже если модель игнорирует редкий класс.',
    'Работа с imbalance — это выбор метрики, threshold, calibration, weights, resampling и validation под реальную цену false positive и false negative.'
  ) `
  -Geometry @(
    'Threshold меняет область positive class.',
    'Oversampling меняет плотность точек и может исказить границу.',
    'Undersampling упрощает majority class, но может выбросить важные подтипы.'
  ) `
  -Probability @(
    'Base rate влияет на precision.',
    'Class weights меняют эффективную цену ошибок, но не гарантируют калибровку.',
    'PR-AUC обычно информативнее ROC-AUC при редком positive.'
  ) `
  -Optimization @(
    'Weighted loss усиливает градиент редкого класса.',
    'Focal loss фокусируется на трудных примерах.',
    'Threshold tuning после обучения часто даёт больше пользы, чем смена алгоритма.'
  ) `
  -Practice @(
    'Определи рабочее ограничение: precision, recall или стоимость.',
    'Проверяй confusion matrix на выбранном threshold.',
    'Делай stratified split и следи за редким классом в каждом fold.'
  ) `
  -Example 'Если fraud rate 0.5%, precision 10% означает, что из 100 тревог только 10 настоящие.'

$notes["02_classic_ml/19_model_interpretation.html"] = New-Note `
  -Title 'Интерпретация модели не равна причинности' `
  -Paragraphs @(
    'Интерпретация показывает, какие признаки связаны с предсказаниями модели и где модель ошибается. Но объяснение модели не доказывает причинное влияние признака на реальный мир.',
    'Global importance, local explanation, PDP, ICE и SHAP отвечают на разные вопросы. Их нельзя смешивать в один универсальный ответ.'
  ) `
  -Geometry @(
    'PDP показывает среднюю траекторию prediction вдоль одной оси.',
    'ICE показывает отдельные траектории объектов.',
    'SHAP раскладывает prediction на вклады признаков относительно baseline.'
  ) `
  -Probability @(
    'Feature importance измеряет изменение score или predictions при вмешательстве в признак.',
    'Коррелированные признаки делят или перетягивают importance.',
    'Local explanations имеют uncertainty и могут быть нестабильны.'
  ) `
  -Optimization @(
    'Permutation importance оценивает падение score при разрушении признака.',
    'Surrogate model приближает сложную модель простой и добавляет ошибку аппроксимации.',
    'Стабильность объяснений надо проверять across folds.'
  ) `
  -Practice @(
    'Не делай causal claims из SHAP/PDP.',
    'Проверяй leakage features: ID, будущие агрегаты, дата после события.',
    'Показывай объяснение вместе с ограничениями метода.'
  ) `
  -Example 'Высокий вклад количества звонков в поддержку может быть следствием проблемы клиента, а не причиной оттока.'

$notes["02_classic_ml/20_practical_pipeline.html"] = New-Note `
  -Title 'Pipeline как воспроизводимая ML-система' `
  -Paragraphs @(
    'ML pipeline соединяет данные, preprocessing, модель, валидацию, артефакты и inference. Без pipeline результат трудно повторить, отладить и перенести в production.',
    'Хороший pipeline фиксирует список признаков, порядок преобразований, random seeds, версии библиотек, split, метрики, thresholds и проверки входных данных.'
  ) `
  -Geometry @(
    'Pipeline похож на граф преобразований от сырых данных до prediction.',
    'Каждый узел меняет пространство данных и может исказить всё дальше.',
    'Data contract задаёт устойчивую форму входа для training и inference.'
  ) `
  -Probability @(
    'Monitoring следит за drift признаков, target, predictions и ошибок.',
    'Calibration и threshold могут деградировать даже при стабильной accuracy.',
    'Production data часто отличается из-за selection bias, delayed labels и feedback loops.'
  ) `
  -Optimization @(
    'Pipeline оптимизирует score, latency, memory, maintainability и retraining cost.',
    'CI проверяет схемы данных, smoke inference и базовые метрики.',
    'Reproducibility снижает стоимость debugging.'
  ) `
  -Practice @(
    'Сохраняй model card: данные, метрики, ограничения, thresholds, дату обучения.',
    'Следи, чтобы preprocessing в train и inference был идентичным.',
    'Добавь алерты на пропуски, unseen categories и drift predictions.'
  ) `
  -Example 'Если в production появилась новая категория, encoder должен явно обработать unknown, а не silently превратить её в некорректные нули.'

$notes["02_classic_ml/07_classification_metrics.html"] = New-Note `
  -Title 'Метрики классификации как управление порогом' `
  -Paragraphs @(
    'Классификатор часто выдаёт score, а метрики оценивают разные способы превратить score в решение. Accuracy, precision, recall, F1, ROC-AUC и PR-AUC отвечают на разные вопросы и могут противоречить друг другу.',
    'При несбалансированных классах accuracy почти всегда опасна. Модель может выглядеть хорошей, просто предсказывая majority class. Поэтому выбор метрики должен идти от цены false positive и false negative.'
  ) `
  -Geometry @(
    'Threshold двигает границу решения: ниже порог — больше positive, выше порог — меньше positive.',
    'ROC-кривая показывает траекторию TPR/FPR по всем порогам.',
    'PR-кривая лучше раскрывает качество, когда positive class редкий.'
  ) `
  -Probability @(
    'Хороший ranking score не гарантирует калиброванные вероятности.',
    'Precision зависит от base rate класса и меняется при переносе на другую популяцию.',
    'Recall измеряет долю найденных positive среди всех настоящих positive.'
  ) `
  -Optimization @(
    'Многие метрики недифференцируемы, поэтому модель обучают на surrogate loss.',
    'Threshold подбирают после обучения на validation.',
    'F1 балансирует precision и recall, но игнорирует true negatives.'
  ) `
  -Practice @(
    'Начинай с confusion matrix при рабочем threshold.',
    'Для редкого класса показывай PR-AUC и recall at fixed precision.',
    'Не подбирай threshold на test.'
  ) `
  -Example 'В fraud detection recall 95% может быть бесполезен, если precision 2% и команда не успевает проверять тревоги.'

$notes["02_classic_ml/08_distance_based_models.html"] = New-Note `
  -Title 'Distance-based модели и смысл близости' `
  -Paragraphs @(
    'Модели на расстояниях предполагают, что похожие объекты находятся рядом в выбранном пространстве признаков. Если масштаб, encoding или шум искажают расстояния, алгоритм будет уверенно использовать неправильную геометрию.',
    'k-NN, k-means и похожие методы полностью зависят от representation. Качество часто растёт не от тюнинга k, а от нормализации, выбора метрики, feature selection и уменьшения шумных измерений.'
  ) `
  -Geometry @(
    'k-NN принимает решение по локальной окрестности вокруг точки.',
    'k-means ищет компактные сферические группы вокруг центроидов.',
    'В высокой размерности расстояния теряют контраст: ближайший и дальний сосед становятся похожи.'
  ) `
  -Probability @(
    'Доля классов среди соседей может быть локальной оценкой P(y|x), но она шумная при малом k.',
    'k-means близок к жёсткому варианту смеси сферических Gaussian clusters.',
    'Density-based методы читаются как поиск областей высокой плотности.'
  ) `
  -Optimization @(
    'k-means минимизирует сумму квадратов расстояний до ближайших центроидов.',
    'k-NN почти не обучается, но дорого работает на inference.',
    'Малый k даёт variance, большой k даёт bias.'
  ) `
  -Practice @(
    'Всегда проверяй scaling и смысл выбранной метрики.',
    'Не применяй Euclidean distance к смешанным признакам без подготовки.',
    'Для больших данных смотри approximate nearest neighbors.'
  ) `
  -Example 'Если рост в сантиметрах и доход в рублях подать без scaling, расстояние почти полностью будет определяться доходом.'

$notes["02_classic_ml/09_naive_bayes.html"] = New-Note `
  -Title 'Naive Bayes как вероятностный baseline' `
  -Paragraphs @(
    'Naive Bayes оценивает вероятность класса через prior и likelihood признаков при этом классе. Его сильное упрощение — условная независимость признаков, но на sparse text features оно часто работает surprisingly well.',
    'Модель полезна, когда данных мало, признаков много, а скорость важнее сложной нелинейной границы. Даже если вероятности плохо калиброваны, ranking и classification могут быть сильными.'
  ) `
  -Geometry @(
    'В log-пространстве произведение вероятностей превращается в сумму вкладов признаков.',
    'Для текста граница часто похожа на линейную, где веса задаются частотами слов по классам.',
    'Smoothing не даёт редкому признаку обнулить вероятность класса.'
  ) `
  -Probability @(
    'Prior P(y) отражает базовую частоту класса.',
    'Likelihood P(x_i|y) показывает, насколько признак типичен для класса.',
    'Conditional independence почти всегда нарушается, но может быть полезным приближением.'
  ) `
  -Optimization @(
    'Параметры считаются частотами и обычно не требуют gradient descent.',
    'Laplace smoothing добавляет псевдонаблюдения.',
    'Логарифмы защищают от underflow при произведении маленьких вероятностей.'
  ) `
  -Practice @(
    'Для текста сравни Naive Bayes с linear SVM и logistic regression.',
    'Настрой smoothing α и preprocessing текста.',
    'Не трактуй сырые вероятности как калиброванные без проверки.'
  ) `
  -Example 'Если слово refund встречается в spam в 20 раз чаще, чем в ham, его log-likelihood ratio сильно сдвигает ответ к spam.'

$notes["02_classic_ml/10_decision_trees.html"] = New-Note `
  -Title 'Decision Tree как последовательность локальных вопросов' `
  -Paragraphs @(
    'Дерево решений строит модель как набор if-then правил. Каждый split делит пространство на области так, чтобы внутри новых областей ответы стали более однородными по impurity или variance.',
    'Главный риск дерева — высокая variance. Глубокое дерево легко запоминает train set: листья становятся маленькими, а правила начинают описывать шум.'
  ) `
  -Geometry @(
    'CART-дерево режет пространство axis-aligned прямоугольниками.',
    'Путь от корня до листа задаёт одну область пространства.',
    'Чем глубже дерево, тем дробнее и неровнее граница решения.'
  ) `
  -Probability @(
    'Leaf probability обычно равна доле классов в листе.',
    'Gini и entropy измеряют смешанность классов.',
    'Маленькие листья дают шумные вероятности, поэтому min_samples_leaf улучшает устойчивость.'
  ) `
  -Optimization @(
    'Дерево жадно выбирает лучший split на каждом шаге.',
    'max_depth, min_samples_split и min_samples_leaf работают как регуляризация.',
    'Pruning удаляет ветви, которые дают мало пользы.'
  ) `
  -Practice @(
    'Смотри размер листьев и глубину, а не только train score.',
    'Не доверяй impurity importance без проверки permutation importance.',
    'Для качества чаще переходи к Random Forest или Boosting, но дерево оставляй для интерпретации.'
  ) `
  -Example 'Если split age < 35 уменьшил Gini с 0.48 до 0.31, дерево считает возраст полезным именно в этом узле.'

$notes["02_classic_ml/11_bagging_random_forest.html"] = New-Note `
  -Title 'Random Forest как снижение variance деревьев' `
  -Paragraphs @(
    'Bagging обучает много моделей на bootstrap-выборках и усредняет ответы. Если отдельные модели шумные, но ошибаются не одинаково, среднее становится стабильнее.',
    'Random Forest добавляет случайность по признакам на каждом split-е. Это снижает корреляцию между деревьями и делает averaging эффективнее.'
  ) `
  -Geometry @(
    'Одно дерево даёт рваную границу, лес усредняет много таких границ.',
    'Random feature subsets заставляют деревья смотреть на разные проекции пространства.',
    'Больше деревьев снижает шум ансамбля до плато.'
  ) `
  -Probability @(
    'Вероятность класса — средний голос или средняя вероятность по деревьям.',
    'Bootstrap создаёт эмпирическое распределение обучающих наборов.',
    'OOB score оценивает качество на объектах, не попавших в bootstrap конкретного дерева.'
  ) `
  -Optimization @(
    'Каждое дерево строится жадно, ансамбль снижает variance через averaging.',
    'n_estimators, max_depth, max_features и min_samples_leaf управляют устойчивостью.',
    'Коррелированные деревья дают меньше пользы от усреднения.'
  ) `
  -Practice @(
    'Начни с достаточного числа деревьев и настрой min_samples_leaf/max_features.',
    'Для больших sparse данных лес может быть тяжелее линейных моделей.',
    'Impurity importance bias-ится к признакам с большим числом split-ов.'
  ) `
  -Example 'Если 200 деревьев дают ошибку 0.18, а 500 деревьев 0.179, качество вышло на плато.'

$notes["02_classic_ml/12_boosting.html"] = New-Note `
  -Title 'Boosting как последовательное исправление ошибок' `
  -Paragraphs @(
    'Boosting строит сильную модель из последовательности слабых моделей. Следующий learner обучается так, чтобы исправлять ошибки текущего ансамбля.',
    'На табличных данных boosting силён, потому что накапливает множество маленьких нелинейных правил и хорошо ловит взаимодействия признаков.'
  ) `
  -Geometry @(
    'Каждое новое дерево слегка деформирует границу в местах ошибок.',
    'Learning rate делает деформации маленькими и устойчивыми.',
    'Много shallow trees создают сложную функцию как сумму локальных поправок.'
  ) `
  -Probability @(
    'Для log-loss boosting улучшает estimate P(y|x), но вероятности могут требовать calibration.',
    'Ошибочные объекты получают больше влияния на следующие шаги.',
    'Label noise может притягивать boosting к шуму без регуляризации.'
  ) `
  -Optimization @(
    'Gradient Boosting — functional gradient descent по функции предсказания.',
    'Shrinkage, subsampling, depth и early stopping задают bias-variance tradeoff.',
    'Early stopping часто важнее ручного выбора числа деревьев.'
  ) `
  -Practice @(
    'Сначала проверь leakage и validation, потом тюнь параметры.',
    'Для tabular задач сравни XGBoost, LightGBM и CatBoost.',
    'Не делай глубокие деревья без контроля validation loss.'
  ) `
  -Example 'Если текущая модель недооценивает дорогие квартиры, следующий learner учится на residuals и добавляет локальную поправку.'

$notes["02_classic_ml/12a_gradient_boosting_theory.html"] = New-Note `
  -Title 'Gradient Boosting как градиентный спуск по функциям' `
  -Paragraphs @(
    'Обычный gradient descent меняет параметры. Gradient Boosting меняет функцию предсказания: на каждом шаге добавляет weak learner, приближающий отрицательный градиент loss по текущим предсказаниям.',
    'Pseudo-residuals — центральная идея. Для MSE они совпадают с обычными residuals, но для log-loss и других loss становятся направлением, куда нужно сдвинуть предсказания.'
  ) `
  -Geometry @(
    'Текущая функция — точка в функциональном пространстве.',
    'Новое дерево задаёт направление шага.',
    'Learning rate укорачивает шаг и сглаживает траекторию.'
  ) `
  -Probability @(
    'Для probabilistic losses градиенты зависят от расхождения predicted probability и метки.',
    'Log-loss сильнее исправляет уверенные ошибки.',
    'Multi-class boosting строит score-функции, которые softmax переводит в вероятности.'
  ) `
  -Optimization @(
    'Weak learner подгоняется к negative gradient.',
    'Depth дерева задаёт сложность одной поправки.',
    'Regularization — это shrinkage, ограничения learner-а, subsampling и stopping.'
  ) `
  -Practice @(
    'Понимай, какой loss оптимизируется.',
    'Если validation loss растёт, уменьшай learning rate, глубину или добавляй stopping.',
    'Сравни конфигурации на одинаковом split и seed.'
  ) `
  -Example 'Для MSE negative gradient равен y - F(x), поэтому новое дерево буквально учится предсказывать текущую ошибку ансамбля.'

$notes["02_classic_ml/12b_gradient_boosting_in_practice.html"] = New-Note `
  -Title 'XGBoost, LightGBM и CatBoost на практике' `
  -Paragraphs @(
    'Современные boosting-библиотеки добавляют second-order approximation, histogram split search, regularization, categorical handling, sampling и быстрый inference.',
    'XGBoost часто удобен как стабильный baseline, LightGBM быстр на больших таблицах, CatBoost силён на категориальных признаках благодаря ordered boosting и аккуратной работе с target statistics.'
  ) `
  -Geometry @(
    'Histogram split search группирует значения в bins и ускоряет поиск разрезов.',
    'Leaf-wise growth может быстро снижать loss, но требует контроля overfit.',
    'Categorical splits заменяют грубый one-hot статистическими представлениями категорий.'
  ) `
  -Probability @(
    'Second-order методы учитывают gradient и curvature loss.',
    'Ordered boosting снижает target leakage в категориальных статистиках.',
    'Class weights меняют эффективную цену ошибок при imbalance.'
  ) `
  -Optimization @(
    'Главные ручки: learning_rate, n_estimators, depth/num_leaves, min_child_samples, subsampling, L1/L2.',
    'Small learning rate плюс more trees часто стабильнее, но дороже.',
    'Early stopping должен быть частью стандартного workflow.'
  ) `
  -Practice @(
    'Для временных данных используй time split.',
    'Сохраняй preprocessing, список признаков, seed и best iteration.',
    'Не начинай с огромной сетки параметров без baseline.'
  ) `
  -Example 'Если LightGBM с num_leaves=255 идеально учит train и падает на validation, уменьшение num_leaves часто полезнее добавления деревьев.'

$notes["02_classic_ml/01_intro_to_classical_ml.html"] = New-Note `
  -Title 'Классическое ML как дисциплина про обобщение' `
  -Paragraphs @(
    'Классическое машинное обучение начинается не с выбора алгоритма, а с вопроса: какую закономерность можно извлечь из конечной выборки и насколько она перенесётся на новые данные. Каждый метод задаёт inductive bias: линейность, локальность, гладкость, разреженность, независимость признаков или композицию простых правил.',
    'Практическая сила этого блока в baseline-мышлении. Аккуратный baseline показывает нижнюю планку качества, отделяет проблему данных от проблемы модели и даёт контрольную точку перед бустингом, нейросетями или сложным feature engineering.'
  ) `
  -Geometry @(
    'Модель можно представить как способ разрезать пространство признаков: прямой, деревом областей, локальными соседями или кластерами.',
    'Переобучение выглядит как слишком сложная граница, которая повторяет шум train-выборки.',
    'Хорошее обобщение обычно означает более простую границу, устойчивую к малым изменениям данных.'
  ) `
  -Probability @(
    'Многие алгоритмы оценивают P(y|x) или surrogate для этой вероятности, даже если выглядят как геометрическая процедура.',
    'Validation/test split оценивает не память модели, а вероятность хорошего ответа на новых объектах.',
    'Калибровка важна, когда решение зависит не только от класса, но и от уверенности модели.'
  ) `
  -Optimization @(
    'Каждый метод минимизирует свой loss или критерий: MSE, log-loss, impurity, hinge loss, расстояние до центроидов.',
    'Регуляризация добавляет цену сложности и заставляет выбирать более устойчивое объяснение.',
    'Сначала фиксируют метрику и валидацию, потом оптимизируют модель.'
  ) `
  -Practice @(
    'До обучения зафиксируй задачу, target, признаки, метрику и схему split-а.',
    'Все преобразования должны жить внутри pipeline, иначе легко получить leakage.',
    'Сравнивай модели на одинаковых folds и одинаковом preprocessing.'
  ) `
  -Example 'Если логистическая регрессия даёт ROC-AUC 0.82, а сложный бустинг 0.83, baseline показывает, что основной потолок может быть в данных и признаках, а не в типе модели.'

$notes["02_classic_ml/02_data_preprocessing.html"] = New-Note `
  -Title 'Preprocessing как часть модели' `
  -Paragraphs @(
    'Предобработка определяет, какую информацию модель увидит и в каком масштабе. Пропуски, категории, даты, выбросы, редкие значения и текстовые поля меняют не только удобство данных, но и саму постановку задачи.',
    'Самая частая ошибка — обучать scaler, imputer, encoder или feature selection на всём датасете до split-а. Тогда validation/test уже частично повлияли на train-процесс, и качество становится завышенным.'
  ) `
  -Geometry @(
    'Scaling меняет геометрию: признак в больших единицах может доминировать над расстояниями, градиентами и регуляризацией.',
    'One-hot encoding превращает категории в дискретные оси без искусственного порядка.',
    'Выбросы растягивают оси и могут сдвигать центр данных, поэтому robust scaling иногда меняет результат сильнее, чем модель.'
  ) `
  -Probability @(
    'Imputation задаёт предположение о механизме пропусков: случайные они или информативные.',
    'Редкие категории похожи на низкочастотные события: объединение снижает шум, но теряет детали.',
    'Distribution shift часто проявляется через новые категории, другие диапазоны и изменившуюся долю пропусков.'
  ) `
  -Optimization @(
    'Нормальный масштаб признаков делает поверхность loss более ровной для градиентных методов.',
    'Encoding может резко увеличить размерность и поменять эффективную силу регуляризации.',
    'Pipeline гарантирует fit только на train и transform на validation/test.'
  ) `
  -Practice @(
    'Раздели признаки по типам: числовые, категориальные, даты, текст, бинарные флаги, потенциальные утечки.',
    'Для каждого преобразования проверь, где вызывается fit.',
    'Логируй словари категорий, статистики scaling-а и доли пропусков.'
  ) `
  -Example 'Если доход в рублях и возраст в годах подать в k-NN без scaling, расстояние почти полностью будет определяться доходом.'

$notes["02_classic_ml/03_linear_regression.html"] = New-Note `
  -Title 'Линейная регрессия как проекция на признаки' `
  -Paragraphs @(
    'Линейная регрессия ищет такую линейную комбинацию признаков, которая минимизирует средний квадрат ошибки. Это не только baseline, но и база для bias-variance, residual analysis, regularization и probabilistic interpretation.',
    'Смысл модели хорошо виден через остатки. Если residuals систематичны, меняются по масштабу или зависят от признака, линейная форма недоописала структуру данных.'
  ) `
  -Geometry @(
    'Предсказания лежат в подпространстве, натянутом на признаки; обучение проецирует target на это подпространство.',
    'Коэффициент задаёт наклон гиперплоскости по своей оси при прочих равных.',
    'Коррелированные признаки делают коэффициенты нестабильными: форма предсказания может быть похожей, а отдельные веса сильно разными.'
  ) `
  -Probability @(
    'При Gaussian noise и постоянной дисперсии MSE соответствует maximum likelihood.',
    'Residuals можно читать как реализацию шума, который модель не объяснила.',
    'Доверительные интервалы для коэффициентов имеют смысл только при выполнении статистических предположений.'
  ) `
  -Optimization @(
    'OLS имеет closed-form решение, но на больших данных часто используют gradient descent.',
    'MSE даёт выпуклую квадратичную поверхность, где локальный минимум является глобальным.',
    'Scaling улучшает conditioning и ускоряет численную оптимизацию.'
  ) `
  -Practice @(
    'Проверь residual plots, выбросы, multicollinearity и масштаб признаков.',
    'Не интерпретируй коэффициенты без учёта scaling-а и encoding-а.',
    'Если веса нестабильны, сравни с Ridge/Lasso.'
  ) `
  -Example 'Если коэффициент площади равен 1200, то в рамках линейной модели каждый дополнительный метр добавляет около 1200 к цене при фиксированных остальных признаках.'

$notes["02_classic_ml/04_linear_model_regularization.html"] = New-Note `
  -Title 'Регуляризация как цена за сложность' `
  -Paragraphs @(
    'Регуляризация добавляет к ошибке модели штраф за форму коэффициентов. Она помогает, когда признаков много, они коррелируют, выборка мала или модель слишком уверенно подстраивается под train.',
    'Ridge плавно сжимает веса, Lasso может занулять признаки, Elastic Net совмещает оба эффекта. Поэтому выбор штрафа зависит не только от качества, но и от желаемой структуры решения.'
  ) `
  -Geometry @(
    'Ridge ограничивает веса шаром L2 и мягко тянет решение к центру.',
    'Lasso ограничивает веса ромбом L1; углы повышают шанс получить нулевые коэффициенты.',
    'При росте λ граница решения становится проще и менее чувствительной к шуму.'
  ) `
  -Probability @(
    'L2 можно читать как Gaussian prior на веса: большие веса маловероятны.',
    'L1 соответствует Laplace prior и сильнее тянет малые веса к нулю.',
    'λ задаёт силу prior-а о простоте относительно данных.'
  ) `
  -Optimization @(
    'L2 остаётся гладкой выпуклой задачей и улучшает conditioning.',
    'L1 недифференцируема в нуле, поэтому часто используется coordinate descent.',
    'λ подбирают внутри cross-validation, иначе регуляризация подгоняется под validation.'
  ) `
  -Practice @(
    'Перед Ridge/Lasso масштабируй признаки.',
    'Не используй Lasso как единственный feature selection без проверки стабильности.',
    'Смотри не только score, но и устойчивость коэффициентов на folds.'
  ) `
  -Example 'Если два признака почти дублируют друг друга, Ridge обычно распределит вес между ними, а Lasso может оставить один и занулить второй.'

$notes["02_classic_ml/05_logistic_regression.html"] = New-Note `
  -Title 'Логистическая регрессия как модель log-odds' `
  -Paragraphs @(
    'Логистическая регрессия строит линейный score, переводит его в log-odds и через sigmoid получает вероятность класса. Это делает её сильной baseline-моделью для классификации и интерпретируемым инструментом.',
    'Важно отделять вероятность от решения. Модель выдаёт score или probability, а threshold превращает это в класс. Порог выбирают по цене ошибок, imbalance и рабочей метрике, а не автоматически по 0.5.'
  ) `
  -Geometry @(
    'Decision boundary остаётся гиперплоскостью; sigmoid меняет уверенность, но не форму границы.',
    'Далеко от границы вероятность насыщается около 0 или 1.',
    'Feature scaling влияет на регуляризацию и скорость оптимизации.'
  ) `
  -Probability @(
    'Модель оценивает P(y=1|x), если данные и регуляризация позволяют калибровать вероятность.',
    'Log-loss сильно штрафует уверенные ошибки.',
    'Коэффициент показывает изменение log-odds при росте признака на единицу.'
  ) `
  -Optimization @(
    'Log-loss выпуклый для линейной логистической регрессии.',
    'При separable data без регуляризации веса могут расти без ограничения.',
    'Regularization стабилизирует веса и улучшает generalization.'
  ) `
  -Practice @(
    'Смотри calibration curve, PR-AUC при imbalance и confusion matrix при выбранном threshold.',
    'Не оценивай редкий класс только accuracy.',
    'Интерпретируй коэффициенты только с учётом scaling-а, one-hot encoding-а и корреляций.'
  ) `
  -Example 'Если коэффициент признака равен 0.7, odds положительного класса умножаются примерно на exp(0.7), то есть почти в два раза.'

$notes["02_classic_ml/06_regression_metrics.html"] = New-Note `
  -Title 'Метрики регрессии как цена разных ошибок' `
  -Paragraphs @(
    'Метрика регрессии определяет, какую ошибку ты считаешь дорогой. MAE относится к ошибкам линейно, MSE/RMSE усиливают большие промахи, R² сравнивает модель с baseline среднего значения.',
    'Метрику нельзя выбирать по привычке. Если редкие крупные ошибки критичны, RMSE полезен. Если важна типичная абсолютная ошибка и устойчивость к выбросам, MAE часто честнее.'
  ) `
  -Geometry @(
    'MAE даёт ромбовидные уровни loss, MSE — гладкие эллипсы.',
    'RMSE возвращает ошибку в единицы target, но сохраняет квадратичный штраф.',
    'R² измеряет долю дисперсии target, объяснённую моделью относительно среднего.'
  ) `
  -Probability @(
    'MSE соответствует Gaussian noise, MAE ближе к Laplace noise с тяжёлыми хвостами.',
    'Если шум асимметричен, средняя ошибка может скрывать bias.',
    'Prediction intervals важны, когда нужна неопределённость, а не только точка.'
  ) `
  -Optimization @(
    'MSE гладкий и удобен для градиентов, но чувствителен к выбросам.',
    'MAE устойчивее к выбросам, но недифференцируем в нуле.',
    'Training loss и reporting metric могут различаться, но связь нужно проверять.'
  ) `
  -Practice @(
    'Всегда сравнивай с baseline: среднее, медиана или сезонное правило.',
    'Показывай ошибку в понятных единицах.',
    'Смотри распределение ошибок по сегментам, а не только среднее.'
  ) `
  -Example 'Две модели могут иметь одинаковый MAE 10, но у одной есть редкие ошибки 100. RMSE сразу покажет этот риск.'

foreach ($entry in $notes.GetEnumerator()) {
  Add-TheoryExpansion -RelativePath $entry.Key -Note $entry.Value
}

