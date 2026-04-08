(function () {
  const pagePath = window.__mlNotesCurrentPagePath;

  if (!pagePath || pagePath.indexOf("02_classic_ml/") !== 0) {
    return;
  }

  const practiceCardsByPage = {
    "02_classic_ml/01_intro_to_classical_ml.html": {
      use: [
        "Когда нужен сильный baseline для табличных данных до любых нейросетей.",
        "Когда важны интерпретируемость, скорость обучения и дешёвый inference.",
        "Когда качество больше зависит от признаков и постановки задачи, чем от архитектуры."
      ],
      pitfalls: [
        "Слишком рано прыгать в deep learning без baseline на тех же данных.",
        "Сравнивать модели на разных split-ах и делать выводы по шумному результату.",
        "Игнорировать feature engineering и надеяться, что модель всё поймёт сама."
      ],
      tuning: [
        "Схему валидации и выбор честной метрики под задачу.",
        "Список признаков, их агрегации и доменные трансформации.",
        "Порог принятия решения и бизнес-стоимость ошибок."
      ]
    },
    "02_classic_ml/02_data_preprocessing.html": {
      use: [
        "Когда в данных есть пропуски, выбросы, категориальные и числовые признаки вместе.",
        "Когда нужно стабилизировать входы перед линейными, distance-based и kernel-моделями.",
        "Когда хочется собрать воспроизводимый pipeline train -> validation -> inference."
      ],
      pitfalls: [
        "Делать scaling или imputation на всём датасете до split и ловить leakage.",
        "Использовать разные правила кодирования на train и production.",
        "Механически нормализовать всё подряд, не понимая распределения признака."
      ],
      tuning: [
        "Стратегию заполнения пропусков: median, constant, separate bucket.",
        "Тип кодирования категорий: one-hot, target encoding, frequency encoding.",
        "Схему scaling и feature transforms: standard, robust, log, clipping."
      ]
    },
    "02_classic_ml/03_linear_regression.html": {
      use: [
        "Когда целевая переменная числовая и нужна интерпретируемая отправная точка.",
        "Когда связь с признаками близка к линейной после простых трансформаций.",
        "Когда нужно быстро понять, какие признаки двигают target вверх или вниз."
      ],
      pitfalls: [
        "Экстраполировать далеко за диапазон обучающих данных.",
        "Игнорировать мультиколлинеарность и нестабильность коэффициентов.",
        "Оставлять сильные выбросы и потом удивляться плохому fit."
      ],
      tuning: [
        "Набор признаков, interaction terms и polynomial features умеренной степени.",
        "Трансформацию target: log, Box-Cox, winsorization.",
        "Робастный вариант обучения и отбор признаков."
      ]
    },
    "02_classic_ml/04_linear_model_regularization.html": {
      use: [
        "Когда признаков много и обычная линейная модель начинает переобучаться.",
        "Когда коэффициенты скачут из-за коррелированных фичей.",
        "Когда нужна более устойчивая и компактная линейная модель."
      ],
      pitfalls: [
        "Штрафовать признаки без предварительного scaling и сравнивать несопоставимое.",
        "Подбирать lambda по test set вместо validation или CV.",
        "Считать, что L1 всегда лучше только потому, что делает sparsity."
      ],
      tuning: [
        "Силу регуляризации: alpha, lambda или C в обратной записи.",
        "Тип штрафа: L1, L2 или Elastic Net.",
        "Соотношение L1/L2 и минимальный полезный набор признаков."
      ]
    },
    "02_classic_ml/05_logistic_regression.html": {
      use: [
        "Когда нужен сильный и быстрый baseline для binary classification.",
        "Когда важны понятные коэффициенты и адекватные вероятности после калибровки.",
        "Когда данные табличные или sparse, а признаков много."
      ],
      pitfalls: [
        "Оставлять threshold = 0.5 при сильном class imbalance.",
        "Не масштабировать признаки при регуляризации и получать кривые коэффициенты.",
        "Читать коэффициенты как причинный эффект без оглядки на данные."
      ],
      tuning: [
        "Силу регуляризации и тип penalty.",
        "Threshold для precision/recall trade-off.",
        "Class weight и калибровку вероятностей."
      ]
    },
    "02_classic_ml/06_regression_metrics.html": {
      use: [
        "Когда нужно выбрать метрику под реальную цену ошибки в бизнесе.",
        "Когда MAE, RMSE и R2 дают разную картину и это важно разобрать.",
        "Когда задача чувствительна к крупным промахам или, наоборот, к средней стабильности."
      ],
      pitfalls: [
        "Сравнивать RMSE между задачами с разными шкалами target.",
        "Оптимизировать удобную метрику вместо реально важной для продукта.",
        "Забывать про units: ошибка в рублях и ошибка в процентах ощущаются по-разному."
      ],
      tuning: [
        "Основную offline-метрику и её secondary guardrails.",
        "Sample weights для важных сегментов данных.",
        "Политику работы с выбросами и clipping target."
      ]
    },
    "02_classic_ml/07_classification_metrics.html": {
      use: [
        "Когда нужно выбрать баланс между precision, recall, F1 и ranking-метриками.",
        "Когда accuracy скрывает проблемы на редких классах.",
        "Когда модель выдаёт score, а решение принимается по threshold."
      ],
      pitfalls: [
        "Смотреть только accuracy на imbalanced данных.",
        "Смешивать threshold-free метрики и thresholded quality как будто они взаимозаменяемы.",
        "Выбирать micro, macro и weighted averaging без понимания задачи."
      ],
      tuning: [
        "Threshold под нужный компромисс ложных срабатываний и пропусков.",
        "Тип усреднения для multiclass/multilabel сценария.",
        "Калибровку score и decision policy."
      ]
    },
    "02_classic_ml/08_distance_based_models.html": {
      use: [
        "Когда важны локальные соседи и форма границы решения не обязана быть линейной.",
        "Когда нужен простой non-parametric baseline без явного обучения параметров.",
        "Когда датасет не слишком большой и inference cost приемлем."
      ],
      pitfalls: [
        "Не масштабировать признаки и получать доминирование одной координаты.",
        "Пускать в k-NN много шумных или нерелевантных фичей.",
        "Забывать, что prediction дорогой, потому что поиск идёт по обучающей выборке."
      ],
      tuning: [
        "Количество соседей k.",
        "Метрику расстояния и weighting соседей.",
        "Scaling, отбор признаков и approximate nearest neighbors."
      ]
    },
    "02_classic_ml/09_naive_bayes.html": {
      use: [
        "Когда нужен очень быстрый baseline для текста, токенов и sparse counts.",
        "Когда данных мало и хочется устойчивую простую модель.",
        "Когда важна скорость обучения и предсказания даже сильнее максимального качества."
      ],
      pitfalls: [
        "Ожидать хорошо откалиброванные вероятности из наивной модели.",
        "Взять не тот вариант NB для типа признаков.",
        "Игнорировать сильную корреляцию признаков и переоценивать уверенность."
      ],
      tuning: [
        "Сглаживание alpha.",
        "Выбор семейства: Gaussian, Multinomial, Bernoulli.",
        "Class priors и способ векторизации текста."
      ]
    },
    "02_classic_ml/10_decision_trees.html": {
      use: [
        "Когда нужна rule-based модель с понятными сплитами по признакам.",
        "Когда табличные данные нелинейны и имеют смешанные типы фичей.",
        "Когда хочется быстро поймать interactions без ручного feature engineering."
      ],
      pitfalls: [
        "Растить дерево до глубины, где оно просто запоминает train.",
        "Доверять одному дереву как стабильной модели на шумных данных.",
        "Не проверять leakage через признаки, которые почти копируют target."
      ],
      tuning: [
        "max_depth и min_samples_leaf.",
        "criterion: gini, entropy или MSE-варианты.",
        "Порог pruning и минимальное улучшение split."
      ]
    },
    "02_classic_ml/11_bagging_random_forest.html": {
      use: [
        "Когда нужен сильный дефолт для табличных данных без тяжёлой предобработки.",
        "Когда одно дерево слишком нестабильно и хочется уменьшить variance.",
        "Когда важно получить хорошее качество при разумной интерпретируемости."
      ],
      pitfalls: [
        "Слепо увеличивать число деревьев и не смотреть на latency.",
        "Читать feature importance как истину, не проверяя коррелированные признаки.",
        "Не сравнивать forest с более простым baseline и не проверять OOB/validation."
      ],
      tuning: [
        "n_estimators и max_features.",
        "max_depth, min_samples_leaf и min_samples_split.",
        "class_weight, bootstrap и OOB evaluation."
      ]
    },
    "02_classic_ml/12_boosting.html": {
      use: [
        "Когда на табличных данных нужно выжать ещё качество поверх простых моделей.",
        "Когда есть сложные нелинейности и слабые базовые learners можно наращивать последовательно.",
        "Когда production готов терпеть более аккуратный тюнинг ради качества."
      ],
      pitfalls: [
        "Ставить слишком высокий learning rate и взрывать переобучение.",
        "Запускать boosting без early stopping и честной CV.",
        "Путать gain в train и реальную генерализацию на новых данных."
      ],
      tuning: [
        "learning_rate и число итераций.",
        "Глубину дерева или число leaves в base learner.",
        "subsample, colsample и early stopping rounds."
      ]
    },
    "02_classic_ml/13_support_vector_machines.html": {
      use: [
        "Когда данных не слишком много, а margin-based классификация уместна.",
        "Когда признаки высокоразмерные и sparse, например в тексте.",
        "Когда линейная модель с kernel trick может дать выигрыш без ансамблей."
      ],
      pitfalls: [
        "Запускать RBF SVM на очень большом датасете и упираться во время.",
        "Не масштабировать признаки перед kernel-методом.",
        "Интерпретировать distance to hyperplane как готовую вероятность."
      ],
      tuning: [
        "C как жёсткость штрафа за ошибки.",
        "kernel и gamma для нелинейного случая.",
        "class_weight и схему calibration поверх scores."
      ]
    },
    "02_classic_ml/14_clustering.html": {
      use: [
        "Когда нужно сегментировать пользователей или объекты без меток.",
        "Когда хочется исследовать структуру данных до supervised-модели.",
        "Когда кластеризация используется как вспомогательная фича или эвристика."
      ],
      pitfalls: [
        "Ждать, что кластеры автоматически совпадут с бизнес-классами.",
        "Фиксировать k или eps без проверки масштаба и структуры данных.",
        "Оценивать кластеризацию только одной метрикой без domain sanity check."
      ],
      tuning: [
        "Число кластеров, eps, min_samples или linkage в зависимости от метода.",
        "Scaling и выбор distance metric.",
        "Способ инициализации и стабильность решения на разных запусках."
      ]
    },
    "02_classic_ml/15_dimensionality_reduction.html": {
      use: [
        "Когда нужно сжать признаки, убрать шум и ускорить downstream-модель.",
        "Когда важна визуализация сложных данных в 2D/3D.",
        "Когда хочется избавиться от мультиколлинеарности и редундантных направлений."
      ],
      pitfalls: [
        "Считать расстояния на t-SNE/UMAP буквально и делать сильные выводы.",
        "Fit-ить reduction до split и получать leakage.",
        "Слишком агрессивно уменьшать размерность и терять полезный сигнал."
      ],
      tuning: [
        "n_components и долю объяснённой дисперсии.",
        "Стандартизацию признаков до PCA и похожих методов.",
        "neighbors/perplexity/min_dist для нелинейной визуализации."
      ]
    },
    "02_classic_ml/16_ensembles.html": {
      use: [
        "Когда несколько разных моделей ошибаются по-разному и их можно объединить.",
        "Когда нужен прирост качества без изобретения новой модели с нуля.",
        "Когда есть смысл балансировать bias, variance и robustness через комбинацию."
      ],
      pitfalls: [
        "Смешивать почти одинаковые модели и не получать новой информации.",
        "Делать stacking с leakage между base models и meta-model.",
        "Забывать про цену ансамбля в latency, памяти и сопровождении."
      ],
      tuning: [
        "Разнообразие base models, а не только их индивидуальный score.",
        "Весы blending или параметры meta-model в stacking.",
        "Схему out-of-fold предсказаний и регуляризацию верхнего уровня."
      ]
    },
    "02_classic_ml/17_validation_and_hyperparameter_tuning.html": {
      use: [
        "Когда нужно честно выбрать модель и не обмануться случайным split.",
        "Когда параметров много и ручной подбор уже нестабилен.",
        "Когда хочется понимать, где кончается реальный signal и начинается noise."
      ],
      pitfalls: [
        "Подглядывать в test set во время выбора параметров.",
        "Использовать обычный KFold для time series или group-based данных.",
        "Тратить большой search budget до сильного baseline и чистого pipeline."
      ],
      tuning: [
        "Схему split: stratified, group, time series, nested CV.",
        "Ширину search space и приоритеты параметров.",
        "Budget, pruning, early stopping и reproducibility seed."
      ]
    },
    "02_classic_ml/18_imbalanced_classes.html": {
      use: [
        "Когда положительный класс редкий и его пропуск дорого стоит.",
        "Когда fraud, churn, дефекты или инциденты встречаются редко.",
        "Когда threshold и sampling важнее, чем ещё 0.5% accuracy."
      ],
      pitfalls: [
        "Судить по accuracy и не замечать провала по recall.",
        "Делать oversampling до split и получать leakage дублей.",
        "Оставлять дефолтный threshold и потом удивляться нулевой полезности."
      ],
      tuning: [
        "class_weight, undersampling, oversampling и SMOTE-подходы.",
        "Threshold под целевой recall/precision.",
        "PR-AUC, cost-sensitive loss и сегментные веса."
      ]
    },
    "02_classic_ml/19_model_interpretation.html": {
      use: [
        "Когда нужно объяснить предсказание пользователю, аналитику или бизнесу.",
        "Когда модель надо дебажить и проверять, не учится ли она на мусоре.",
        "Когда важна прозрачность признаков и контроль рисков."
      ],
      pitfalls: [
        "Делать причинные выводы из SHAP, PDP или importances.",
        "Игнорировать нестабильность локальных объяснений на соседних точках.",
        "Показывать одну красивую диаграмму без проверки на validation данных."
      ],
      tuning: [
        "Локальный или глобальный метод интерпретации под конкретный вопрос.",
        "Размер background sample и sampling strategy для SHAP.",
        "Группировку коррелированных признаков и форму визуализации."
      ]
    },
    "02_classic_ml/20_practical_pipeline.html": {
      use: [
        "Когда нужен production-style процесс, а не просто ноутбук с одной моделью.",
        "Когда важно воспроизводимо прогонять preprocessing, обучение и валидацию.",
        "Когда модель надо не только обучить, но и обслуживать после релиза."
      ],
      pitfalls: [
        "Разъезжать train-time и inference-time preprocessing.",
        "Не версионировать данные, фичи и артефакты модели.",
        "Выпустить модель без мониторинга drift и деградации качества."
      ],
      tuning: [
        "Порядок шагов в pipeline и точки кэширования.",
        "Retrain cadence, триггеры переобучения и rollback strategy.",
        "Мониторинг метрик, drift checks и алерты на сбои."
      ]
    }
  };

  const practice = practiceCardsByPage[pagePath];
  const pageShell = document.querySelector(".page");

  if (!practice || !pageShell || pageShell.querySelector(".ml-practice-section")) {
    return;
  }

  const escapeHtml = function (value) {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  };

  const buildList = function (items) {
    return (
      '<ul class="ml-practice-list">' +
      items.map(function (item) {
        return "<li>" + escapeHtml(item) + "</li>";
      }).join("") +
      "</ul>"
    );
  };

  const section = document.createElement("section");
  section.className = "card ml-practice-section";
  section.innerHTML =
    '<div class="ml-practice-header">' +
    "<h2>Практические карточки</h2>" +
    '<p class="muted">Короткий cheat sheet по теме: когда этот инструмент уместен, где чаще всего ошибаются и какие ручки обычно крутят в реальной работе.</p>' +
    "</div>" +
    '<div class="ml-practice-grid">' +
    '<div class="ml-practice-card ml-practice-card--use">' +
    "<h3>Когда использовать</h3>" +
    buildList(practice.use) +
    "</div>" +
    '<div class="ml-practice-card ml-practice-card--pitfalls">' +
    "<h3>Типичные ошибки</h3>" +
    buildList(practice.pitfalls) +
    "</div>" +
    '<div class="ml-practice-card ml-practice-card--tuning">' +
    "<h3>Что тюнить</h3>" +
    buildList(practice.tuning) +
    "</div>" +
    "</div>";

  const hero = pageShell.querySelector(".hero");
  if (hero) {
    hero.insertAdjacentElement("afterend", section);
    return;
  }

  pageShell.insertBefore(section, pageShell.firstChild);
})();
