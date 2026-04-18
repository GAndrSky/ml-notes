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
        intro: "Этот интерактив показывает, как чистота узла зависит от доли классов внутри него.",
        items: [
          "Когда один класс занимает почти весь узел, Gini близок к 0: дерево уже почти не сомневается, какой класс предсказывать.",
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
        intro: "Здесь важно увидеть не абсолютные числа, а форму штрафа за смешивание классов.",
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
          "Если threshold отделяет мало точек или создаёт очень маленький лист, качество может выглядеть хорошо случайно и плохо переноситься на новые данные."
        ]
      }
    },
    {
      page: "02_classic_ml/10_decision_trees.html",
      title: /regression tree split|regression tree/i,
      data: {
        title: "Как читать regression split",
        intro: "В regression tree split выбирается так, чтобы внутри листьев target был как можно менее разбросан.",
        items: [
          "Горизонтальные уровни листьев — это средние значения target в левой и правой группах.",
          "Хороший split уменьшает сумму квадратов отклонений внутри листьев: точки становятся ближе к своим локальным средним.",
          "Если один лист получает слишком мало объектов, его среднее может стать шумным, даже если ошибка на train выглядит маленькой."
        ]
      }
    },
    {
      page: "02_classic_ml/10_decision_trees.html",
      title: /глубина дерева|переобучение|depth/i,
      data: {
        title: "Как читать глубину дерева",
        intro: "Этот граф показывает классический bias-variance trade-off для деревьев.",
        items: [
          "С ростом глубины train-качество почти всегда улучшается: дерево запоминает всё более мелкие детали.",
          "Validation-качество обычно сначала растёт, а потом падает: после некоторой точки дерево начинает ловить шум.",
          "Оптимальная глубина — не максимальная, а та, где validation ещё выигрывает от детализации и не начал резко проигрывать от variance."
        ]
      }
    },
    {
      page: "04_training/08_weight_initialization_deeper.html",
      title: /variance.*глубине|инициализация/i,
      data: {
        title: "Как читать variance по глубине",
        intro: "Интерактив показывает, что происходит с масштабом сигнала, когда он проходит через много слоёв.",
        items: [
          "Если variance быстро растёт, активации и градиенты могут взрываться: сеть становится численно нестабильной.",
          "Если variance быстро падает к нулю, сигнал исчезает: глубокие слои почти не получают полезной информации.",
          "Хорошая инициализация старается удержать variance около стабильного диапазона, чтобы forward и backward pass не ломались по глубине."
        ]
      }
    },
    {
      page: "05_architectures/03_transformer_attention.html",
      title: /√d|softmax/i,
      data: {
        title: "Как читать эффект деления на √dₖ",
        intro: "Эта визуализация показывает, почему attention scores нужно масштабировать перед softmax.",
        items: [
          "Без деления на √dₖ dot-product scores растут с размерностью и softmax становится слишком резким.",
          "Слишком резкий softmax превращает attention почти в one-hot выбор: модель перестаёт мягко смешивать информацию.",
          "Нормировка сохраняет scores в рабочем диапазоне, где градиенты ещё информативны и attention может учиться гибко."
        ]
      }
    },
    {
      page: "05_architectures/03_transformer_attention.html",
      title: /интерактивная визуализация attention|attention$/i,
      data: {
        title: "Как читать карту Attention",
        intro: "Карта attention показывает, какие токены смотрят на какие другие токены.",
        items: [
          "Строка обычно соответствует текущему query-токену: он решает, откуда брать информацию.",
          "Яркая ячейка означает большой вес: этот key/value сильно влияет на обновлённое представление query.",
          "Смотри на паттерны, а не на одну клетку: diagonal, локальные окна, дальние связи и causal mask говорят о разных режимах обработки контекста."
        ]
      }
    },
    {
      page: "05_architectures/03_transformer_attention.html",
      title: /multi-head|mha/i,
      data: {
        title: "Как читать Multi-Head Attention",
        intro: "MHA полезен тем, что разные головы могут смотреть на разные типы отношений.",
        items: [
          "Одна голова может ловить локальные зависимости, другая — дальние ссылки, третья — синтаксический или позиционный паттерн.",
          "Увеличение числа heads не просто добавляет мощность: оно дробит hidden dimension на несколько подпространств внимания.",
          "Если все головы смотрят одинаково, capacity тратится неэффективно; полезность MHA именно в разнообразии паттернов."
        ]
      }
    },
    {
      page: "05_architectures/03_transformer_attention.html",
      title: /маск|mask/i,
      data: {
        title: "Как читать attention mask",
        intro: "Mask показывает, какие связи между токенами разрешены, а какие искусственно запрещены.",
        items: [
          "Padding mask скрывает пустые токены, чтобы модель не училась на техническом заполнителе.",
          "Causal mask запрещает смотреть в будущее: токен может использовать только прошлый контекст.",
          "Если маска задана неверно, модель может либо терять полезную информацию, либо получить leakage из будущего."
        ]
      }
    },
    {
      page: "07_generative_models/03_diffusion_models.html",
      title: /интерактивная интуиция|diffusion/i,
      data: {
        title: "Как читать diffusion process",
        intro: "Интерактив показывает две стороны diffusion: постепенное зашумление и обратное восстановление структуры.",
        items: [
          "Forward process разрушает данные контролируемым шумом: на больших шагах исходная структура почти исчезает.",
          "Reverse process учится не магически рисовать картинку, а постепенно убирать шум, оценивая направление к более вероятным данным.",
          "Смотри на шаг t как на уровень разрушения информации: чем больше t, тем больше модель зависит от выученного prior."
        ]
      }
    },
    {
      title: /gradient descent|градиент/i,
      data: {
        title: "Как читать траекторию градиентного спуска",
        intro: "Визуализация показывает не только точку минимума, но и поведение шага на поверхности loss.",
        items: [
          "Длина шага зависит от learning rate: слишком маленький шаг делает обучение медленным, слишком большой может перескакивать минимум.",
          "Направление шага задаёт отрицательный градиент: модель идёт туда, где loss локально уменьшается быстрее всего.",
          "Если траектория колеблется или уходит в сторону, обычно проблема в масштабе признаков, curvature или слишком большом learning rate."
        ]
      }
    },
    {
      title: /svd|pca|eigen/i,
      data: {
        title: "Как читать линейное преобразование",
        intro: "Такие интерактивы показывают, как матрица меняет пространство данных.",
        items: [
          "Смотри, какие направления растягиваются, какие сжимаются, а какие почти исчезают.",
          "В PCA/SVD главные направления — это не просто красивые оси, а направления наибольшей сохранённой вариации.",
          "Если при уменьшении размерности структура сохраняется, значит данные действительно лежат близко к более низкоразмерному подпространству."
        ]
      }
    },
    {
      title: /token|bpe/i,
      data: {
        title: "Как читать tokenization demo",
        intro: "Интерактив токенизации показывает, как текст превращается в дискретные единицы для модели.",
        items: [
          "Токен — не обязательно слово: это может быть часть слова, пробел, суффикс, префикс или частый фрагмент.",
          "BPE постепенно склеивает самые частые пары, поэтому частые слова становятся короткими, а редкие разбиваются на куски.",
          "Если текст получает много токенов, он дороже по контексту и compute, даже если визуально кажется коротким."
        ]
      }
    },
    {
      title: /scheduler|learning rate|warmup|cosine|onecycle/i,
      data: {
        title: "Как читать scheduler",
        intro: "Интерактив показывает, как learning rate меняется во времени и почему это влияет на траекторию обучения.",
        items: [
          "Warmup защищает старт обучения от слишком резких шагов, пока веса и моменты оптимизатора ещё не стабилизировались.",
          "Cosine decay постепенно уменьшает шаг, чтобы модель сначала исследовала пространство, а потом аккуратно донастраивалась.",
          "OneCycle временно разгоняет обучение и затем сильно снижает шаг, часто помогая быстрее пройти плохие области loss landscape."
        ]
      }
    },
    {
      title: /clipping|clip/i,
      data: {
        title: "Как читать gradient clipping",
        intro: "Интерактив показывает, как clipping ограничивает слишком большой градиент перед обновлением весов.",
        items: [
          "Если норма градиента ниже порога, clipping почти ничего не делает: обучение идёт обычным образом.",
          "Если норма резко выросла, clipping уменьшает длину шага, но сохраняет направление обновления.",
          "Это не лечит причину нестабильности, но часто спасает training loop от одного разрушительного шага."
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
      first: "Смотри не только на итоговое число, а на то, какая часть механизма меняется при движении ползунка.",
      second: "Меняй один параметр за раз: так проще понять причинную связь между настройкой и поведением модели.",
      third: "Если картинка резко меняется от малого движения, это признак чувствительного режима или нестабильной области."
    };

    var map = {
      math: {
        first: "Здесь визуализация показывает геометрию формулы: как меняется объект, направление, поверхность или распределение.",
        second: "Следи за осями, масштабом и тем, какая величина остаётся фиксированной. Часто смысл становится понятным именно через движение точки или вектора.",
        third: "Числовой вывод рядом с графиком полезно читать как проверку интуиции: он показывает не новую теорию, а конкретное значение того, что ты видишь."
      },
      classic: {
        first: "Интерактив показывает, как меняется bias-variance, impurity, граница решения или метрика при другой настройке модели.",
        second: "Обращай внимание на trade-off: улучшение train-качества часто покупается переобучением, а сглаживание может убрать полезный сигнал.",
        third: "Если есть threshold, глубина, k, C, gamma или число кластеров, воспринимай их как ручки, которые меняют форму решения, а не просто качество."
      },
      training: {
        first: "Здесь важно смотреть на динамику: как меняется шаг, градиент, variance, масштаб активаций или устойчивость обучения.",
        second: "Ползунок обычно имитирует гиперпараметр training loop. Малое изменение может менять не итоговую формулу, а траекторию обучения.",
        third: "Опасные режимы проявляются как взрыв, затухание, резкие скачки или почти полное отсутствие движения."
      },
      architecture: {
        first: "Интерактив показывает поток информации внутри архитектуры: receptive field, память, attention-веса, residual path или позиционный сигнал.",
        second: "Смотри, какие элементы начинают влиять друг на друга и где возникает bottleneck: по пространству, времени, каналам или токенам.",
        third: "Хорошая интерпретация здесь — не 'красивая картинка', а понимание, какую информацию архитектура может передать дальше."
      },
      advanced: {
        first: "Интерактив помогает связать абстрактную идею с инженерным поведением: токены, reward, low-rank update, шум или процесс генерации.",
        second: "Следи за тем, какая величина меняется локально, а какая влияет на всю систему: это особенно важно в LLM и generative models.",
        third: "Если результат выглядит неожиданно, ищи скрытый компромисс: качество против compute, устойчивость против скорости, diversity против точности."
      }
    };

    var selected = map[kind] || common;
    return {
      title: common.title,
      intro: "Блок относится к секции «" + title + "».",
      items: [selected.first, selected.second, selected.third]
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
