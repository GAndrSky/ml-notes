(function () {
  if (window.__mlNotesInteractiveGuidesInitialized) {
    return;
  }
  window.__mlNotesInteractiveGuidesInitialized = true;

  var pagePath = window.__mlNotesCurrentPagePath || "";
  var pageShell = document.querySelector(".page");
  if (!pageShell) {
    return;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function textOf(el) {
    return String((el && el.textContent) || "").replace(/\s+/g, " ").trim();
  }

  function headingOf(card) {
    var heading = card.querySelector("h2, h3");
    return textOf(heading) || "интерактив";
  }

  var SPECIAL_GUIDES = [
    {
      page: "02_classic_ml/10_decision_trees.html",
      title: /gini impurity|интерактив:\s*gini/i,
      data: {
        title: "Как читать Gini impurity",
        intro: "Интерактив показывает, как чистота узла зависит от доли классов внутри него.",
        items: [
          "Когда один класс занимает почти весь узел, Gini близок к 0: дерево почти не сомневается, какой класс предсказывать.",
          "Максимальная нечистота для двух классов возникает около 50/50: split ещё не отделил один класс от другого.",
          "Ползунок доли класса можно читать как состав узла: чем сильнее смесь, тем больше стимул искать новый split."
        ]
      }
    },
    {
      page: "02_classic_ml/10_decision_trees.html",
      title: /gini.*entropy|entropy/i,
      data: {
        title: "Как сравнивать Gini и Entropy",
        intro: "Здесь важно видеть не абсолютные числа, а форму штрафа за смешивание классов.",
        items: [
          "Обе кривые минимальны на чистых узлах и максимальны около равной смеси классов.",
          "Entropy обычно сильнее подчёркивает неопределённость, а Gini часто даёт похожий split при меньшей вычислительной цене.",
          "Если кривые дают близкие решения, это нормально: в деревьях важнее порядок split-ов, чем красивое значение impurity само по себе."
        ]
      }
    },
    {
      page: "02_classic_ml/10_decision_trees.html",
      title: /один split|порогу|threshold/i,
      data: {
        title: "Как читать split по порогу",
        intro: "Интерактив показывает, как одно числовое правило делит данные на левый и правый узел.",
        items: [
          "Двигай threshold и смотри не только на линию, но и на impurity в обеих дочерних группах.",
          "Хороший split делает группы более однородными, даже если каждая из них всё ещё не идеально чистая.",
          "Если threshold отделяет мало точек, качество может выглядеть хорошо случайно и плохо переноситься на новые данные."
        ]
      }
    },
    {
      page: "02_classic_ml/10_decision_trees.html",
      title: /regression tree split|regression tree/i,
      data: {
        title: "Как читать regression split",
        intro: "Regression tree выбирает split так, чтобы внутри листьев target был менее разбросан.",
        items: [
          "Горизонтальные уровни листьев — это средние значения target в левой и правой группах.",
          "Хороший split уменьшает сумму квадратов отклонений внутри листьев: точки становятся ближе к своим локальным средним.",
          "Если один лист получает слишком мало объектов, его среднее может стать шумным, даже если train-ошибка выглядит маленькой."
        ]
      }
    },
    {
      page: "04_training/08_weight_initialization_deeper.html",
      title: /variance.*глубине|инициализация|initialization/i,
      data: {
        title: "Как читать variance по глубине",
        intro: "Интерактив показывает, что происходит с масштабом сигнала при проходе через много слоёв.",
        items: [
          "Если variance быстро растёт, активации и градиенты могут взрываться: сеть становится численно нестабильной.",
          "Если variance быстро падает к нулю, сигнал исчезает: глубокие слои почти не получают полезной информации.",
          "Хорошая инициализация удерживает variance около стабильного диапазона, чтобы forward и backward pass не ломались по глубине."
        ]
      }
    },
    {
      page: "05_architectures/03_transformer_attention.html",
      title: /√d|softmax|scaled/i,
      data: {
        title: "Как читать эффект деления на √dₖ",
        intro: "Визуализация показывает, почему attention scores нужно масштабировать перед softmax.",
        items: [
          "Без деления на √dₖ dot-product scores растут с размерностью, и softmax становится слишком резким.",
          "Слишком резкий softmax превращает attention почти в one-hot выбор: модель перестаёт мягко смешивать информацию.",
          "Нормировка сохраняет scores в рабочем диапазоне, где градиенты ещё информативны и attention может учиться гибко."
        ]
      }
    },
    {
      page: "05_architectures/03_transformer_attention.html",
      title: /attention map|карта attention|heatmap/i,
      data: {
        title: "Как читать карту Attention",
        intro: "Карта attention показывает, какие токены смотрят на какие другие токены.",
        items: [
          "Строка обычно соответствует текущему query-токену: он решает, откуда брать информацию.",
          "Яркая ячейка означает большой вес: этот key/value сильно влияет на обновлённое представление query.",
          "Смотри на паттерны, а не на одну клетку: diagonal, локальные окна, дальние связи и mask говорят о разных режимах обработки контекста."
        ]
      }
    },
    {
      page: "07_generative_models/03_diffusion_models.html",
      title: /diffusion|шум|noise/i,
      data: {
        title: "Как читать diffusion process",
        intro: "Интерактив показывает две стороны diffusion: постепенное зашумление и обратное восстановление структуры.",
        items: [
          "Forward process разрушает данные контролируемым шумом: на больших шагах исходная структура почти исчезает.",
          "Reverse process учится не магически рисовать картинку, а постепенно убирать шум, двигаясь к более вероятным данным.",
          "Шаг t можно читать как уровень разрушения информации: чем больше t, тем сильнее модель зависит от выученного prior."
        ]
      }
    }
  ];

  function specialCopyFor(title, fullText) {
    var haystack = title + " " + (fullText || "");
    for (var i = 0; i < SPECIAL_GUIDES.length; i += 1) {
      var rule = SPECIAL_GUIDES[i];
      if (rule.page && rule.page !== pagePath) {
        continue;
      }
      if (rule.title.test(haystack)) {
        return rule.data;
      }
    }
    return null;
  }

  function kindFor(card) {
    var text = (headingOf(card) + " " + textOf(card)).toLowerCase();
    if (/gradient|градиент|loss|optimizer|learning rate|scheduler|adam|momentum|clipping|stability/.test(text)) {
      return "training";
    }
    if (/tree|gini|entropy|split|forest|boosting|svm|cluster|pca|metric|regression|classification/.test(text)) {
      return "classic";
    }
    if (/attention|transformer|cnn|rnn|lstm|resnet|normalization|vit|positional/.test(text)) {
      return "architecture";
    }
    if (/token|bpe|rlhf|lora|scaling|vae|gan|diffusion/.test(text) || /06_llm|07_generative/.test(pagePath)) {
      return "advanced";
    }
    if (/matrix|vector|derivative|probability|entropy|jacobian|hessian|calculus/.test(text)) {
      return "math";
    }
    return "general";
  }

  function copyFor(kind, title, fullText) {
    var special = specialCopyFor(title, fullText);
    if (special) {
      return special;
    }

    var common = {
      title: "Как читать этот интерактив",
      intro: "Блок относится к секции «" + title + "».",
      items: [
        "Смотри не только на итоговое число, а на то, какая часть механизма меняется при движении ползунка.",
        "Меняй один параметр за раз: так проще понять причинную связь между настройкой и поведением модели.",
        "Если картинка резко меняется от малого движения, это признак чувствительного режима или нестабильной области."
      ]
    };

    var map = {
      math: [
        "Визуализация показывает геометрию формулы: как меняется объект, направление, поверхность или распределение.",
        "Следи за осями, масштабом и тем, какая величина остаётся фиксированной.",
        "Числовой вывод рядом с графиком полезно читать как проверку интуиции: он показывает конкретное значение того, что видно на экране."
      ],
      classic: [
        "Интерактив показывает, как меняется bias-variance, impurity, граница решения или метрика при другой настройке модели.",
        "Обращай внимание на trade-off: улучшение train-качества часто покупается переобучением.",
        "Threshold, глубина, k, C, gamma и число кластеров — это ручки, которые меняют форму решения, а не просто качество."
      ],
      training: [
        "Здесь важно смотреть на динамику: шаг, градиент, variance, масштаб активаций и устойчивость обучения.",
        "Ползунок обычно имитирует гиперпараметр training loop, который меняет траекторию обучения.",
        "Опасные режимы проявляются как взрыв, затухание, резкие скачки или почти полное отсутствие движения."
      ],
      architecture: [
        "Интерактив показывает поток информации внутри архитектуры: receptive field, память, attention-веса, residual path или позиционный сигнал.",
        "Смотри, какие элементы начинают влиять друг на друга и где возникает bottleneck: по пространству, времени, каналам или токенам.",
        "Хорошая интерпретация здесь — понять, какую информацию архитектура может передать дальше."
      ],
      advanced: [
        "Интерактив связывает абстрактную идею с инженерным поведением: токены, reward, low-rank update, шум или процесс генерации.",
        "Следи за тем, какая величина меняется локально, а какая влияет на всю систему.",
        "Если результат выглядит неожиданно, ищи скрытый компромисс: качество против compute, устойчивость против скорости, diversity против точности."
      ]
    };

    return {
      title: common.title,
      intro: common.intro,
      items: map[kind] || common.items
    };
  }

  function makeGuide(data) {
    var guide = document.createElement("div");
    guide.className = "ml-interactive-guide";
    guide.innerHTML =
      '<span class="ml-interactive-guide__label">Визуализация</span>' +
      "<h3>" + escapeHtml(data.title) + "</h3>" +
      '<p class="muted">' + escapeHtml(data.intro) + "</p>" +
      "<ul>" +
      data.items.map(function (item) {
        return "<li>" + escapeHtml(item) + "</li>";
      }).join("") +
      "</ul>";
    return guide;
  }

  function attachGuides() {
    var cards = Array.prototype.slice.call(pageShell.querySelectorAll(".card, section, article")).filter(function (card) {
      if (card.classList.contains("hero") || card.classList.contains("ml-interactive-guide")) {
        return false;
      }
      if (card.querySelector(":scope > .ml-interactive-guide")) {
        return false;
      }
      return !!card.querySelector("canvas, input[type='range'], select, .control, .controls");
    });

    cards.forEach(function (card) {
      var title = headingOf(card);
      var data = copyFor(kindFor(card), title, textOf(card));
      card.appendChild(makeGuide(data));
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", attachGuides);
  } else {
    attachGuides();
  }
  window.addEventListener("load", attachGuides);
})();
