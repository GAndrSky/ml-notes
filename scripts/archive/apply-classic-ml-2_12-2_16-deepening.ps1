$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Web

$root = Split-Path -Parent $PSScriptRoot

function HtmlText {
  param([string]$Text)
  return [System.Web.HttpUtility]::HtmlEncode($Text)
}

function Remove-DeepeningBlocks {
  param([string]$Html)
  return [regex]::Replace($Html, '(?is)\s*<!-- advanced-models-deepening:start:[^>]+ -->.*?<!-- advanced-models-deepening:end -->\s*', "`r`n")
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

<!-- advanced-models-deepening:start:$id -->
  <section class="concept-walkthrough" data-advanced-models-deepening="$id">
    <div class="concept-walkthrough__kicker">Теория глубже</div>
    <h3>$title</h3>
$($paragraphs -join "`r`n")
$list
  </section>
<!-- advanced-models-deepening:end -->
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

$pages = @(
  @{
    File = "02_classic_ml/12_boosting.html"
    Inserts = @(
      @{
        Id = "2-12-additive-view"
        After = "Почему boosting"
        Title = "Boosting лучше читать как additive model"
        Paragraphs = @(
          "Boosting не просто усредняет много деревьев. Он строит предсказание как сумму последовательных поправок, где каждая новая модель видит ошибки текущего ансамбля. Поэтому порядок моделей важен: позднее дерево обучается уже на другом представлении задачи.",
          "Такой взгляд объясняет, почему boosting часто уменьшает bias сильнее, чем bagging. Bagging стабилизирует шумные модели через усреднение, а boosting постепенно достраивает недостающую форму функции."
        )
        Items = @(
          "Bagging: много независимых моделей, затем усреднение.",
          "Boosting: одна последовательная модель, собранная из маленьких шагов.",
          "Главный риск boosting - слишком долго исправлять train-ошибки и начать учить шум."
        )
      },
      @{
        Id = "2-12-adaboost-margin"
        After = "2\.12\.1 AdaBoost"
        Title = "AdaBoost можно понимать через margin объектов"
        Paragraphs = @(
          "В AdaBoost веса объектов растут не просто потому, что модель ошиблась. Алгоритм пытается увеличить margin: правильный класс должен получать уверенный суммарный голос, а не случайное преимущество в один слабый классификатор.",
          "Если объект стабильно ошибочный из-за шума или неверной разметки, AdaBoost будет всё сильнее на него смотреть. Это делает метод чувствительным к выбросам и объясняет, почему современные GBDT обычно удобнее в реальных табличных задачах."
        )
        Items = @(
          "Большой положительный margin означает уверенно правильное решение.",
          "Отрицательный margin означает, что ансамбль склоняется к неправильному классу.",
          "Шумные labels могут получить слишком большой вес и испортить следующие weak learners."
        )
      },
      @{
        Id = "2-12-hyperparameter-coupling"
        After = "2\.12\.7 Hyperparameters"
        Title = "Гиперпараметры boosting нельзя читать по одному"
        Paragraphs = @(
          "learning_rate, n_estimators, depth, subsampling и regularization образуют связанную систему. Маленький learning_rate обычно требует больше деревьев, но даёт более плавную траекторию обучения. Большая depth повышает способность ловить interactions, но резко увеличивает риск локального переобучения.",
          "Практическая настройка boosting - это управление скоростью, гибкостью и доверием к split-ам. Если менять все параметры хаотично, легко получить улучшение на validation случайно и не понять, что именно сработало."
        )
        Items = @(
          "Сначала зафиксируй validation protocol и early stopping.",
          "Потом найди разумную сложность деревьев: depth, leaves, min_child_weight.",
          "После этого подбирай learning_rate и n_estimators как пару."
        )
      }
    )
  },
  @{
    File = "02_classic_ml/12a_gradient_boosting_theory.html"
    Inserts = @(
      @{
        Id = "2-12a-function-space"
        After = "Gradient Boosting как оптимизация"
        Title = "Градиент считается по предсказаниям, а не по весам дерева"
        Paragraphs = @(
          "В нейросети gradient descent двигает параметры. В gradient boosting мы двигаем функцию F(x). Для каждого объекта считаем, как нужно изменить текущее предсказание, чтобы loss уменьшился быстрее всего, а затем обучаем дерево приближать это направление.",
          "Именно поэтому residuals в boosting называются pseudo-residuals. Для MSE они похожи на обычные остатки, но для logloss, quantile loss или другой функции потерь это уже антиградиент по prediction."
        )
        Items = @(
          "Объект получает свой целевой сдвиг prediction.",
          "Дерево аппроксимирует эти сдвиги кусочно-постоянной функцией.",
          "Ансамбль обновляется маленьким шагом, чтобы не переучить шум."
        )
      },
      @{
        Id = "2-12a-shrinkage"
        After = "Shrinkage"
        Title = "Shrinkage делает функциональный шаг более осторожным"
        Paragraphs = @(
          "Если новое дерево сразу добавить с полным весом, ансамбль может слишком резко подстроиться под текущие pseudo-residuals. learning rate уменьшает вклад дерева и превращает boosting в серию маленьких корректировок.",
          "Маленькие шаги часто дают лучшую generalization, потому что модель проходит более гладкий путь по пространству функций. Цена - нужно больше деревьев и больше времени."
        )
        Items = @(
          "Большой learning rate: быстрее, но выше риск overshoot.",
          "Маленький learning rate: медленнее, но стабильнее.",
          "Early stopping нужен, чтобы остановить последовательное исправление до момента заучивания шума."
        )
      },
      @{
        Id = "2-12a-stagewise-complexity"
        After = "Stage-wise контроль"
        Title = "Stage-wise обучение само по себе является регуляризацией"
        Paragraphs = @(
          "Boosting не ищет лучшую сумму всех деревьев за один глобальный solve. Он добавляет деревья по одному и ограничивает каждое дерево как слабую поправку. Это создаёт inductive bias: модель предпочитает решения, которые можно собрать постепенно.",
          "Такой режим похож на аккуратное редактирование текста. Вместо полной переписи на каждом шаге алгоритм делает локальную правку, проверяет ошибку и только потом решает, что исправлять дальше."
        )
        Items = @(
          "Слабые learners ограничивают форму одной поправки.",
          "learning rate ограничивает силу поправки.",
          "число итераций ограничивает общий объём исправлений."
        )
      }
    )
  },
  @{
    File = "02_classic_ml/12b_gradient_boosting_in_practice.html"
    Inserts = @(
      @{
        Id = "2-12b-library-differences"
        After = "XGBoost, LightGBM и CatBoost решают"
        Title = "Разница библиотек - это не только скорость"
        Paragraphs = @(
          "XGBoost, LightGBM и CatBoost реализуют одну идею GBDT, но делают разные инженерные ставки. XGBoost силён стабильной регуляризацией и контролем split-ов. LightGBM оптимизирован под скорость, histogram training и leaf-wise growth. CatBoost отдельно решает категориальные признаки и target leakage через ordered boosting.",
          "Выбор библиотеки должен зависеть от структуры данных. Для wide табличных данных с категориальными признаками CatBoost часто даёт сильный baseline. Для очень больших данных LightGBM может быстрее найти хороший режим. XGBoost удобен, когда нужен предсказуемый контроль regularization."
        )
        Items = @(
          "CatBoost: категориальные признаки и ordered statistics.",
          "LightGBM: скорость, histogram, leaf-wise деревья.",
          "XGBoost: сильный контроль регуляризации и стабильный production baseline."
        )
      },
      @{
        Id = "2-12b-parameter-groups"
        After = "Практическое чтение гиперпараметров"
        Title = "Дели параметры на группы: шаг, форма, доверие, шум"
        Paragraphs = @(
          "Практический тюнинг GBDT становится проще, если не держать десятки параметров как плоский список. learning_rate и n_estimators управляют длиной траектории. max_depth, num_leaves и min_child_samples управляют формой деревьев. lambda, min_gain_to_split и min_child_weight регулируют доверие к локальным улучшениям.",
          "subsample и colsample добавляют случайность, чтобы деревья меньше повторяли ошибки друг друга. Это особенно полезно, когда данных много, признаков много или train-score быстро улучшается быстрее validation-score."
        )
        Items = @(
          "Шаг: learning_rate, n_estimators, early_stopping_rounds.",
          "Форма: max_depth, num_leaves, max_leaf_nodes.",
          "Доверие к split-у: min_child_weight, min_data_in_leaf, min_gain_to_split.",
          "Шум и diversity: subsample, colsample_bytree, bagging_fraction."
        )
      },
      @{
        Id = "2-12b-tuning-protocol"
        After = "Как тюнить без хаоса"
        Title = "Тюнинг должен начинаться с честного validation"
        Paragraphs = @(
          "Самая частая ошибка в boosting - искать лучший набор параметров без стабильного validation protocol. Для временных данных нужен time split, для группированных данных - group split, для редких классов - stratification. Иначе модель оптимизируется под неправильный эксперимент.",
          "После честного split-а лучше двигаться слоями: baseline, early stopping, сложность деревьев, регуляризация, subsampling, финальная калибровка или threshold. Такой порядок даёт причинное понимание улучшений."
        )
        Items = @(
          "Не тюнь параметры на test set.",
          "Сравнивай модели на одинаковых fold-ах.",
          "Сохраняй best_iteration, иначе можно случайно использовать переобученный хвост."
        )
      }
    )
  },
  @{
    File = "02_classic_ml/13_support_vector_machines.html"
    Inserts = @(
      @{
        Id = "2-13-margin-robustness"
        After = "Maximum margin intuition"
        Title = "Margin - это геометрический запас прочности"
        Paragraphs = @(
          "SVM выбирает не просто разделяющую линию, а линию с максимальным зазором до ближайших объектов. Этот зазор можно читать как устойчивость к небольшим сдвигам данных: если точка немного шумит, она всё ещё остаётся на правильной стороне boundary.",
          "Именно support vectors определяют boundary. Далёкие точки почти не влияют на решение, потому что они уже имеют достаточный margin и не несут информации о границе."
        )
        Items = @(
          "Большой margin обычно лучше переносится на новые данные.",
          "Support vectors - точки, которые ограничивают зазор.",
          "Если классы сильно пересекаются, maximum margin без ошибок становится невозможен."
        )
      },
      @{
        Id = "2-13-soft-margin-c"
        After = "Soft margin SVM"
        Title = "C задаёт цену нарушения margin"
        Paragraphs = @(
          "Soft margin разрешает ошибаться или заходить внутрь margin, но штрафует такие нарушения. Параметр C управляет тем, насколько дорого модели игнорировать проблемные точки.",
          "Большой C заставляет SVM сильнее подгоняться под train и делать меньше нарушений. Маленький C допускает больше нарушений ради более широкой и спокойной границы."
        )
        Items = @(
          "C вверх: меньше train-ошибок, выше риск переобучения.",
          "C вниз: шире margin, больше bias, устойчивее к шуму.",
          "C нельзя выбирать без scaling, потому что расстояния и margin зависят от масштаба признаков."
        )
      },
      @{
        Id = "2-13-c-gamma-joint"
        After = "Как читать C и gamma вместе"
        Title = "C и gamma управляют разными сторонами сложности RBF-SVM"
        Paragraphs = @(
          "gamma задаёт радиус влияния точки в RBF kernel. Большой gamma делает влияние локальным: boundary может изгибаться вокруг отдельных объектов. Маленький gamma делает похожесть глобальной: boundary становится гладкой.",
          "C решает, насколько сильно модель обязана исправлять нарушения этой boundary. Поэтому опасная комбинация - большой gamma и большой C: локальная гибкость плюс высокий штраф ошибок часто превращают SVM в memorization."
        )
        Items = @(
          "Большой gamma + большой C: максимальная гибкость и риск overfit.",
          "Маленький gamma + маленький C: гладко, но может underfit.",
          "Grid search обычно смотрит C и gamma вместе в логарифмической шкале."
        )
      }
    )
  },
  @{
    File = "02_classic_ml/13a_kernel_methods_deeper.html"
    Inserts = @(
      @{
        Id = "2-13a-feature-space"
        After = "Главная формула"
        Title = "Kernel trick скрывает явное пространство признаков"
        Paragraphs = @(
          "Kernel можно читать как быстрый способ посчитать inner product после некоторого преобразования признаков. Мы не строим огромный вектор phi(x) явно, но получаем значение похожести так, будто работаем в этом пространстве.",
          "Это полезно, когда разделение в исходных признаках сложное, но становится линейным после нелинейного отображения. SVM затем строит линейную границу уже в скрытом feature space."
        )
        Items = @(
          "Polynomial kernel добавляет взаимодействия признаков.",
          "RBF kernel создаёт очень богатое локальное пространство похожести.",
          "Kernel matrix хранит попарные сходства объектов и быстро растёт как O(n²)."
        )
      },
      @{
        Id = "2-13a-mercer-psd"
        After = "Mercer коротко"
        Title = "Корректный kernel должен вести себя как скалярное произведение"
        Paragraphs = @(
          "Mercer condition в практическом смысле говорит: kernel matrix должна быть positive semidefinite. Тогда её можно интерпретировать как матрицу скалярных произведений в некотором feature space.",
          "Если функция похожести не PSD, оптимизационная задача SVM может потерять выпуклость и стабильность. Поэтому не любая красивая мера похожести автоматически является хорошим kernel."
        )
        Items = @(
          "PSD matrix не создаёт отрицательных квадратов длины.",
          "Симметрия важна: похожесть x с y равна похожести y с x.",
          "Domain-specific similarity нужно проверять, прежде чем использовать как kernel."
        )
      },
      @{
        Id = "2-13a-rbf-bandwidth"
        After = "RBF и почему"
        Title = "gamma в RBF - это обратная ширина локального внимания"
        Paragraphs = @(
          "RBF kernel быстро уменьшает похожесть с расстоянием. gamma управляет скоростью этого затухания: при большом gamma только почти идентичные точки сильно похожи, при маленьком gamma похожесть размазана шире.",
          "Геометрически gamma задаёт размер локального района, в котором обучающий объект может влиять на prediction. Поэтому он тесно связан с density данных и масштабом признаков."
        )
        Items = @(
          "Перед RBF почти всегда нужен scaling.",
          "Большой gamma делает kernel matrix ближе к единичной матрице.",
          "Маленький gamma делает многие точки похожими и сглаживает boundary."
        )
      }
    )
  },
  @{
    File = "02_classic_ml/14_clustering.html"
    Inserts = @(
      @{
        Id = "2-14-exploratory-compression"
        After = "Что такое кластеризация"
        Title = "Кластеризация - это гипотеза о структуре, а не ground truth"
        Paragraphs = @(
          "Без labels невозможно доказать, что найденные группы являются истинными классами. Кластеризация сжимает данные в несколько групп по выбранной геометрии и помогает увидеть возможную структуру, но смысл этим группам даёт уже человек или downstream-задача.",
          "Один и тот же датасет может иметь несколько полезных кластеризаций: по цене, поведению, риску, географии или стилю использования. Поэтому вопрос не только в алгоритме, а в том, какая похожесть полезна для решения."
        )
        Items = @(
          "Кластеры нельзя автоматически называть классами.",
          "Метрика расстояния задаёт, что значит похожесть.",
          "Качество проверяется стабильностью, интерпретируемостью и downstream-пользой."
        )
      },
      @{
        Id = "2-14-kmeans-assumptions"
        After = "2\.14\.1 k-means"
        Title = "k-means предполагает компактные примерно сферические группы"
        Paragraphs = @(
          "k-means минимизирует расстояние до центроидов, поэтому лучше всего работает, когда кластеры похожи на округлые облака сравнимого размера. Если группы вытянутые, разной плотности или вложенные друг в друга, центроиды описывают данные грубо.",
          "Инициализация тоже важна: плохие стартовые центры могут привести к другому локальному минимуму. Поэтому k-means++ и несколько random starts - не косметика, а часть устойчивого pipeline."
        )
        Items = @(
          "Scaling обязателен, если признаки в разных единицах.",
          "k-means плохо отделяет non-convex формы.",
          "Centroid не всегда является реальным типичным объектом, особенно для sparse или categorical данных."
        )
      },
      @{
        Id = "2-14-validation-limits"
        After = "2\.14\.4 Silhouette score"
        Title = "Внутренние метрики кластеризации легко переинтерпретировать"
        Paragraphs = @(
          "Silhouette, inertia и elbow помогают сравнивать режимы, но они не знают бизнес-смысла кластеров. Высокий silhouette может означать геометрически чистые группы, которые бесполезны для продукта. Низкий silhouette может быть нормальным, если данные действительно образуют плавный спектр без резких границ.",
          "Поэтому хороший анализ кластеров всегда включает sanity-check: профили групп, размер групп, стабильность при resampling и проверку на downstream-задаче."
        )
        Items = @(
          "Elbow часто субъективен и может не иметь явного изгиба.",
          "Silhouette любит компактные разделённые группы.",
          "Стабильность кластеров важнее одного красивого числа."
        )
      }
    )
  },
  @{
    File = "02_classic_ml/14a_gaussian_mixtures_em.html"
    Inserts = @(
      @{
        Id = "2-14a-soft-membership"
        After = "Модель смеси"
        Title = "GMM заменяет жёсткий кластер на распределение ответственности"
        Paragraphs = @(
          "В k-means точка принадлежит одному ближайшему центроиду. В GMM точка получает probability-like responsibility для каждой компоненты. Это лучше отражает неопределённость на границах кластеров и позволяет компонентам иметь разную форму через covariance matrix.",
          "Такой подход особенно полезен, когда данные перекрываются. Вместо искусственного жёсткого решения модель показывает, что объект частично похож на несколько групп."
        )
        Items = @(
          "pi_k отвечает за размер компоненты.",
          "mu_k отвечает за центр компоненты.",
          "Sigma_k отвечает за форму и ориентацию эллипса плотности."
        )
      },
      @{
        Id = "2-14a-em-lower-bound"
        After = "EM шаг за шагом"
        Title = "EM оптимизирует likelihood через чередование двух простых задач"
        Paragraphs = @(
          "Главная трудность GMM - скрытая переменная: мы не знаем, какая компонента породила каждую точку. E-step оценивает распределение этой скрытой принадлежности при текущих параметрах. M-step обновляет параметры так, будто эти soft labels известны.",
          "Каждый шаг EM не уменьшает likelihood при корректной реализации. Но это не гарантирует глобальный optimum: алгоритм может застрять в локальном решении, поэтому initialization имеет большое значение."
        )
        Items = @(
          "E-step: оценить responsibilities.",
          "M-step: пересчитать параметры с весами responsibilities.",
          "Повторять до стабилизации likelihood или параметров."
        )
      },
      @{
        Id = "2-14a-covariance-regularization"
        After = "K-means vs GMM"
        Title = "Covariance делает модель гибкой, но может стать нестабильной"
        Paragraphs = @(
          "Full covariance позволяет компоненте быть эллипсом любой ориентации. Это мощно, но требует больше данных: маленькая компонента может схлопнуться вокруг одной точки и получить почти сингулярную covariance.",
          "На практике часто используют diagonal covariance, tied covariance или reg_covar. Это ограничивает форму компонент и защищает likelihood от искусственного роста через слишком узкие гауссианы."
        )
        Items = @(
          "full covariance: гибко, но дорого и чувствительно.",
          "diag covariance: проще, устойчивее, игнорирует корреляции признаков.",
          "reg_covar добавляет численную защиту к covariance matrix."
        )
      }
    )
  },
  @{
    File = "02_classic_ml/15_dimensionality_reduction.html"
    Inserts = @(
      @{
        Id = "2-15-compression-objective"
        After = "Зачем вообще снижать размерность"
        Title = "Снижение размерности - это контролируемая потеря информации"
        Paragraphs = @(
          "Любой метод снижения размерности выбирает, какую информацию сохранить, а какую выбросить. PCA сохраняет направления с большой дисперсией. t-SNE и UMAP стараются сохранить локальную близость. Autoencoder может сохранять то, что помогает восстановить вход.",
          "Поэтому нельзя спрашивать только: какая 2D-картинка красивее. Нужно спрашивать: какая структура важна для задачи - глобальные оси, локальные соседи, реконструкция, сегментация или downstream prediction."
        )
        Items = @(
          "PCA хорошо объясняет линейную вариативность.",
          "t-SNE удобен для локальной визуализации групп.",
          "UMAP часто лучше сохраняет баланс локальной и глобальной структуры."
        )
      },
      @{
        Id = "2-15-pca-projection"
        After = "2\.15\.1 PCA intuition"
        Title = "PCA ищет не красивые оси, а минимальную ошибку реконструкции"
        Paragraphs = @(
          "Главные компоненты можно понимать двумя эквивалентными способами: направления максимальной дисперсии и линейная подпространственная проекция с минимальной squared reconstruction error. Второй взгляд полезнее для ML, потому что показывает цену сжатия.",
          "Если сигнал задачи находится в малодисперсном направлении, PCA может его удалить. Поэтому PCA без проверки downstream-метрики опасен: большая дисперсия не всегда означает полезную информацию."
        )
        Items = @(
          "Центрирование данных обязательно для корректной PCA.",
          "Scaling меняет, какие признаки считаются важными.",
          "Explained variance показывает сохранённую вариативность, но не гарантирует сохранённый target signal."
        )
      },
      @{
        Id = "2-15-visualization-trust"
        After = "Когда нельзя слишком доверять"
        Title = "2D-визуализация - это карта с искажениями"
        Paragraphs = @(
          "t-SNE и UMAP полезны для исследования embeddings, но расстояния на 2D-картинке нельзя читать буквально. Размер островов, расстояние между островами и форма кластеров могут быть следствием параметров алгоритма, density данных и random seed.",
          "Хорошая практика - проверять выводы несколькими запусками, несколькими параметрами и численными метриками в исходном пространстве. Визуализация должна порождать гипотезы, а не заменять validation."
        )
        Items = @(
          "Не сравнивай площадь кластеров как реальные вероятности.",
          "Не делай вывод о дальности групп только по 2D-расстоянию.",
          "Проверяй nearest neighbors в исходном или embedding-пространстве."
        )
      }
    )
  },
  @{
    File = "02_classic_ml/15a_kernel_pca_ica_autoencoders.html"
    Inserts = @(
      @{
        Id = "2-15a-objectives"
        After = "Три разных цели"
        Title = "Kernel PCA, ICA и Autoencoder отвечают на разные вопросы"
        Paragraphs = @(
          "Kernel PCA спрашивает: можно ли найти нелинейное пространство, где вариативность описывается проще. ICA спрашивает: можно ли разложить наблюдения на статистически независимые источники. Autoencoder спрашивает: какой bottleneck позволяет восстановить вход с минимальной ошибкой.",
          "Эти методы легко спутать, потому что все дают low-dimensional representation. Но критерий успеха у них разный, поэтому один метод не является прямой заменой другого."
        )
        Items = @(
          "Kernel PCA - геометрия и нелинейные компоненты.",
          "ICA - независимые скрытые источники.",
          "Autoencoder - обучаемое сжатие через reconstruction objective."
        )
      },
      @{
        Id = "2-15a-kernel-pca"
        After = "Kernel PCA"
        Title = "Kernel PCA делает PCA после неявного нелинейного lift"
        Paragraphs = @(
          "Обычная PCA ищет линейные компоненты в исходных признаках. Kernel PCA сначала неявно переносит точки в feature space через kernel, а затем делает PCA по kernel matrix. Это позволяет распрямлять структуры, которые в исходном пространстве выглядят изогнутыми.",
          "Цена подхода - масштабируемость и интерпретируемость. Kernel matrix растёт как n на n, а компоненты сложнее объяснять через исходные признаки."
        )
        Items = @(
          "RBF kernel полезен для гладкой нелинейной структуры.",
          "Polynomial kernel полезен для interactions признаков.",
          "gamma в kernel PCA влияет на то, насколько локальной становится геометрия."
        )
      },
      @{
        Id = "2-15a-autoencoder-bottleneck"
        After = "Autoencoder"
        Title = "Autoencoder полезен только если bottleneck заставляет учить структуру"
        Paragraphs = @(
          "Если autoencoder слишком мощный, он может почти скопировать вход и не выучить полезное представление. Bottleneck, noise, sparsity, weight decay и архитектурные ограничения нужны, чтобы модель сохраняла не каждую деталь, а устойчивую структуру данных.",
          "В отличие от PCA, autoencoder оптимизируется gradient descent и может быть нелинейным. Это даёт гибкость, но добавляет риск нестабильного обучения и зависимости от архитектуры."
        )
        Items = @(
          "Undercomplete bottleneck ограничивает размер latent vector.",
          "Denoising autoencoder учится восстанавливать чистый сигнал из зашумлённого.",
          "Variational autoencoder добавляет вероятностную структуру latent space."
        )
      }
    )
  },
  @{
    File = "02_classic_ml/16_ensembles.html"
    Inserts = @(
      @{
        Id = "2-16-diversity-competence"
        After = "Почему ансамбли вообще работают"
        Title = "Ансамбль требует одновременно качества и разнообразия"
        Paragraphs = @(
          "Если все модели делают одинаковые ошибки, ансамбль почти ничего не улучшит. Если модели очень разные, но каждая слабая, усреднение тоже не спасёт. Сила ансамбля появляется, когда base learners достаточно компетентны и ошибаются не полностью синхронно.",
          "Это объясняет пользу разных seeds, bootstrap samples, feature subsets и разных model families. Они создают diversity, но не должны разрушать базовое качество."
        )
        Items = @(
          "Компетентность: base learner лучше случайного baseline.",
          "Разнообразие: ошибки моделей частично независимы.",
          "Усреднение уменьшает variance только если ошибки не идеально коррелированы."
        )
      },
      @{
        Id = "2-16-probability-averaging"
        After = "Weighted voting"
        Title = "Усреднение вероятностей требует calibration"
        Paragraphs = @(
          "Soft voting обычно сильнее hard voting, потому что использует уверенность моделей. Но если одна модель плохо откалибрована и выдаёт слишком экстремальные вероятности, она может перетянуть ансамбль даже при невысоком качестве.",
          "Поэтому перед probability averaging полезно смотреть calibration curve, log loss и распределение predicted probabilities. Иногда лучше усреднять logits или использовать calibrated classifiers."
        )
        Items = @(
          "Hard voting использует только классы.",
          "Soft voting использует вероятности и лучше различает уверенность.",
          "Плохая calibration может сделать soft voting хуже простого majority vote."
        )
      },
      @{
        Id = "2-16-stacking-leakage"
        After = "Как правильно строить stacking"
        Title = "Stacking должен учиться только на out-of-fold predictions"
        Paragraphs = @(
          "Главная ошибка stacking - обучить meta-model на предсказаниях base models для тех же объектов, на которых base models обучались. Тогда meta-model видит слишком оптимистичные predictions и учится на leakage.",
          "Правильный stacking строит out-of-fold predictions: каждый train-объект получает прогноз от модели, которая не видела его при обучении. Только такие признаки честно показывают, как base learners ведут себя на новых данных."
        )
        Items = @(
          "Train base models внутри folds.",
          "Собери OOF-predictions для meta-model.",
          "После выбора схемы переобучи base models на полном train для финального inference."
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
  Write-Host "$($page.File): advanced model deepening blocks inserted"
  $updated += 1
}

Write-Host "Classic ML 2.12-2.16 deepening updated: $updated files"

