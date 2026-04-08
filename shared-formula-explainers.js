(function () {
  const pagePath = window.__mlNotesCurrentPagePath;

  if (!pagePath || pagePath.indexOf("01_math/") === 0) {
    return;
  }

  const pageExamples = {
    "02_classic_ml/03_linear_regression.html": "Например, цена квартиры может складываться из площади, района и возраста дома с разными весами.",
    "02_classic_ml/05_logistic_regression.html": "Например, спам-фильтр сначала считает score, а потом переводит его в вероятность спама.",
    "02_classic_ml/08_distance_based_models.html": "Например, новый объект получает ответ от ближайших похожих примеров, а не от общей глобальной формулы.",
    "02_classic_ml/10_decision_trees.html": "Например, дерево задаёт цепочку вопросов вида 'доход выше порога?' и шаг за шагом сужает решение.",
    "02_classic_ml/11_bagging_random_forest.html": "Например, forest усредняет решения множества деревьев и сглаживает случайные промахи одного дерева.",
    "02_classic_ml/12_boosting.html": "Например, boosting шаг за шагом добавляет поправки к ошибкам предыдущей версии модели.",
    "02_classic_ml/13_support_vector_machines.html": "Например, SVM ищет границу с максимально широким зазором между двумя классами.",
    "02_classic_ml/14_clustering.html": "Например, точки группируются не по меткам, а по выбранному представлению близости.",
    "02_classic_ml/15_dimensionality_reduction.html": "Например, PCA пытается описать много признаков несколькими главными направлениями.",
    "03_neural_basics/01_perceptron_and_neuron.html": "Например, один нейрон может срабатывать, когда несколько входов вместе дают достаточно сильный сигнал.",
    "03_neural_basics/02_activation_functions.html": "Например, ReLU пропускает положительную часть сигнала и обнуляет отрицательную.",
    "03_neural_basics/03_forward_pass.html": "Например, каждый следующий слой получает уже преобразованное представление, а не исходные признаки напрямую.",
    "03_neural_basics/04_loss_functions.html": "Например, loss растёт, когда модель ошибается сильнее или делает это с излишней уверенностью.",
    "04_training/01_backpropagation.html": "Например, backprop проходит от ошибки назад и вычисляет, как каждый параметр повлиял на итоговый промах.",
    "04_training/02_optimizers.html": "Например, optimizer решает, насколько большим шагом менять параметры после вычисления градиента.",
    "04_training/03_adam_adamw_lion.html": "Например, Adam учитывает историю градиентов и потому двигается иначе, чем обычный SGD.",
    "04_training/04_regularization.html": "Например, регуляризация мешает сети слишком точно подстроиться под шум обучающей выборки.",
    "05_architectures/01_cnn_convolutional_networks.html": "Например, один и тот же фильтр ищет границы или текстуры по всему изображению.",
    "05_architectures/02_rnn_lstm.html": "Например, скрытое состояние несёт дальше информацию о предыдущих токенах последовательности.",
    "05_architectures/03_transformer_attention.html": "Например, токен может смотреть на релевантные ему слова вне зависимости от расстояния до них.",
    "05_architectures/04_transformer_architecture.html": "Например, блок transformer сначала смешивает токены через attention, а потом перерабатывает каждый токен отдельно.",
    "05_architectures/05_resnet_normalization.html": "Например, residual-путь позволяет сети доучивать поправку, а не переписывать весь сигнал с нуля."
  };

  const escapeHtml = function (value) {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  };

  const normalize = function (value) {
    return value.replace(/\s+/g, " ").trim();
  };

  const findContextHeading = function (element) {
    let node = element.previousElementSibling;

    while (node) {
      if (/^H[123]$/.test(node.tagName)) {
        return normalize(node.textContent || "");
      }

      const nestedHeading = node.querySelector && node.querySelector("h2, h3");
      if (nestedHeading) {
        return normalize(nestedHeading.textContent || "");
      }

      node = node.previousElementSibling;
    }

    return "";
  };

  const isCodeLike = function (text, element) {
    if (!text || text.length < 12) {
      return true;
    }

    if (element.id && /code|snippet|source/i.test(element.id)) {
      return true;
    }

    return /(function\s*\(|const\s+|let\s+|var\s+|document\.|addEventListener|ctx\.|=>|;\s*$)/m.test(text);
  };

  const detectCategory = function (text) {
    const lower = text.toLowerCase();

    if (/[∂δ∇]|d[a-z]\/d[a-z]|gradient|jacobian|hessian|backprop|chain rule/.test(lower) || /∂|δ|∇|Jᵀ|J\^T/.test(text)) {
      return "gradient";
    }

    if (/sigmoid|softmax|logit|odds|likelihood|bayes|posterior/.test(lower) || /\bp\(|\bP\(/.test(text)) {
      return "probability";
    }

    if (/loss|cross-entropy|mse|mae|rmse|hinge|entropy|gini|r²|r\^2/.test(lower) || /^L\s*=|^J\s*=/.test(normalize(text))) {
      return "loss";
    }

    if (/attention|query|key|value|qk|softmax\(qk/.test(lower) || /QK|Q·K|QK\^T/.test(text)) {
      return "attention";
    }

    if (/lstm|rnn|gate|h_t|c_t/.test(lower) || /hₜ|cₜ/.test(text)) {
      return "sequence";
    }

    if (/gini|information gain|split|impurity|tree/.test(lower)) {
      return "tree";
    }

    if (/distance|nearest|knn|k-nn/.test(lower) || /‖|sqrt|√/.test(text)) {
      return "distance";
    }

    if (/sum|mean|avg|sigma|cov|svd|eigen|principal|variance/.test(lower) || /Σ|μ|σ/.test(text)) {
      return "statistics";
    }

    if (/conv|kernel|stride|padding|feature map/.test(lower)) {
      return "convolution";
    }

    if (/y_hat|ŷ|w|β|theta|bias|x·w|x @ w|z =|a =/.test(lower) || /ŷ|θ|β/.test(text)) {
      return "linear";
    }

    return "generic";
  };

  const buildExplanation = function (text, heading) {
    const category = detectCategory(text);
    const compact = normalize(text);
    const example = pageExamples[pagePath] || "Смотри на формулу как на способ перевести идею модели в точную вычислимую запись.";

    const readingParts = [];
    if (compact.indexOf("=") !== -1) {
      readingParts.push("Слева обычно стоит то, что мы хотим получить или оценить, справа — из каких частей это вычисляется.");
    }
    if (/Σ|sum/i.test(text)) {
      readingParts.push("Знак суммы означает, что итог складывается из нескольких вкладов или по объектам, или по признакам.");
    }
    if (/⊙/.test(text)) {
      readingParts.push("Символ ⊙ читается как поэлементное умножение: значения умножаются покомпонентно, без смешивания координат.");
    }
    if (/log/i.test(text)) {
      readingParts.push("Логарифм здесь обычно либо стабилизирует вычисление, либо превращает произведения вероятностей в суммы.");
    }
    if (/max|min|softmax/i.test(text)) {
      readingParts.push("Здесь есть операция выбора или нормализации: она решает, что усиливать, а что подавлять.");
    }
    if (!readingParts.length) {
      readingParts.push("Читай формулу справа налево как цепочку операций: какие входы берутся, как они преобразуются и что получается на выходе.");
    }

    const responses = {
      gradient: {
        meaning: "Формула описывает чувствительность: как изменение активации, веса или входа повлияет на итоговую ошибку.",
        code: "В коде это обычно проявляется в `backward()` и в тензорах `.grad`: знак и масштаб говорят, в какую сторону выгодно менять параметр."
      },
      probability: {
        meaning: "Формула переводит score модели в вероятность или связывает наблюдение с вероятностной интерпретацией.",
        code: "В коде это обычно слой `sigmoid`/`softmax` или вычисление likelihood; затем уже можно читать ответ как confidence модели."
      },
      loss: {
        meaning: "Формула задаёт штраф за ошибку модели: именно это число оптимизатор старается уменьшить во время обучения.",
        code: "В коде это обычно объект `criterion(pred, target)`, а интерпретировать значение loss полезно вместе с метрикой на validation."
      },
      attention: {
        meaning: "Формула описывает, как элемент входа выбирает, на какие другие элементы ему смотреть и как сильно им доверять.",
        code: "В коде это обычно матрицы `Q`, `K`, `V`, затем `softmax` по score и взвешенное смешивание контекста."
      },
      sequence: {
        meaning: "Формула описывает обновление скрытого состояния: какая часть прошлого сохраняется и какой новый сигнал добавляется.",
        code: "В коде это шаг рекуррентного слоя, где состояние переносится между timestep-ами и постепенно собирает контекст."
      },
      tree: {
        meaning: "Формула измеряет качество разбиения: насколько чище или однороднее становятся группы после очередного split-а.",
        code: "В коде это критерий выбора порога и признака; чем сильнее падение impurity, тем привлекательнее split для дерева."
      },
      distance: {
        meaning: "Формула оценивает близость между объектами, а значит напрямую определяет, кто для модели считается соседом.",
        code: "В коде это шаг сравнения точек по метрике расстояния; после него уже решается голосование или поиск ближайших примеров."
      },
      statistics: {
        meaning: "Формула агрегирует данные: считает среднее, дисперсию, ковариацию или выделяет главное направление вариации.",
        code: "В коде это обычно шаг подготовки статистики по данным или преобразование признаков в более компактное представление."
      },
      convolution: {
        meaning: "Формула показывает локальное сканирование входа фильтром: один и тот же шаблон проверяется в разных позициях.",
        code: "В коде это слой свёртки, где ядро проходит по входу и строит feature map с ответами локальных детекторов."
      },
      linear: {
        meaning: "Формула собирает ответ как взвешенную комбинацию входов с возможным bias и последующей активацией.",
        code: "В коде это часто одна строка вроде `z = x @ w + b`, после которой может идти нелинейность или вычисление вероятности."
      },
      generic: {
        meaning: heading
          ? "Формула здесь формализует идею раздела «" + heading + "» и показывает, как словесная логика превращается в точный расчёт."
          : "Формула здесь фиксирует точный способ вычисления: что именно считается и какие величины для этого нужны.",
        code: "В коде это обычно отдельная операция или маленький фрагмент pipeline, который затем используется как часть общего расчёта."
      }
    };

    return {
      meaning: responses[category].meaning,
      reading: readingParts.join(" "),
      code: responses[category].code + " " + example
    };
  };

  const buildCard = function (text, heading, signature) {
    const explanation = buildExplanation(text, heading);
    const card = document.createElement("div");
    card.className = "ml-formula-explainer";
    card.dataset.formulaSignature = signature;
    card.innerHTML =
      '<div class="ml-formula-explainer__label">Разбор формулы</div>' +
      '<ul class="ml-formula-explainer__list">' +
      "<li><strong>Смысл:</strong> " + escapeHtml(explanation.meaning) + "</li>" +
      "<li><strong>Как читать:</strong> " + escapeHtml(explanation.reading) + "</li>" +
      "<li><strong>Пример и код:</strong> " + escapeHtml(explanation.code) + "</li>" +
      "</ul>";
    return card;
  };

  let scheduled = false;

  const processFormulas = function () {
    scheduled = false;

    document.querySelectorAll(".formula").forEach(function (formula) {
      const text = normalize(formula.textContent || "");

      if (isCodeLike(text, formula)) {
        return;
      }

      const signature = text.toLowerCase();
      const next = formula.nextElementSibling;
      if (next && next.classList.contains("ml-formula-explainer")) {
        if (next.dataset.formulaSignature === signature) {
          return;
        }
        next.remove();
      }

      const heading = findContextHeading(formula);
      const card = buildCard(text, heading, signature);
      formula.insertAdjacentElement("afterend", card);
    });
  };

  const scheduleProcess = function () {
    if (scheduled) {
      return;
    }

    scheduled = true;
    window.setTimeout(processFormulas, 120);
  };

  processFormulas();
  window.setTimeout(processFormulas, 500);
  window.addEventListener("load", processFormulas);

  const observer = new MutationObserver(function () {
    scheduleProcess();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
})();
