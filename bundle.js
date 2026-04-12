// BEGIN shared-nav.js
(function () {
  if (window.__mlNotesNavInitialized) {
    return;
  }
  window.__mlNotesNavInitialized = true;

  var sections = [
    {
      id: "math",
      label: "Блок 1",
      title: "Математика",
      pages: [
        { path: "01_math/01_linear_algebra.html", label: "1.1 Линейная алгебра" },
        { path: "01_math/02_calculus.html", label: "1.2 Матанализ" },
        { path: "01_math/03_probability_theory.html", label: "1.3 Теория вероятностей" },
        { path: "01_math/04_information_theory.html", label: "1.4 Теория информации" }
      ]
    },
    {
      id: "classic-ml",
      label: "Блок 2",
      title: "Классическое ML",
      pages: [
        { path: "02_classic_ml/01_intro_to_classical_ml.html", label: "2.1 Классическое ML" },
        { path: "02_classic_ml/02_data_preprocessing.html", label: "2.2 Предобработка" },
        { path: "02_classic_ml/03_linear_regression.html", label: "2.3 Линейная регрессия" },
        { path: "02_classic_ml/04_linear_model_regularization.html", label: "2.4 Регуляризация" },
        { path: "02_classic_ml/05_logistic_regression.html", label: "2.5 Логистическая регрессия" },
        { path: "02_classic_ml/06_regression_metrics.html", label: "2.6 Метрики регрессии" },
        { path: "02_classic_ml/07_classification_metrics.html", label: "2.7 Метрики классификации" },
        { path: "02_classic_ml/08_distance_based_models.html", label: "2.8 k-NN / Distance" },
        { path: "02_classic_ml/09_naive_bayes.html", label: "2.9 Naive Bayes" },
        { path: "02_classic_ml/10_decision_trees.html", label: "2.10 Decision Trees" },
        { path: "02_classic_ml/11_bagging_random_forest.html", label: "2.11 Random Forest" },
        { path: "02_classic_ml/12_boosting.html", label: "2.12 Boosting" },
        { path: "02_classic_ml/12a_gradient_boosting_theory.html", label: "2.12a GB Theory" },
        { path: "02_classic_ml/12b_gradient_boosting_in_practice.html", label: "2.12b GBDT Practice" },
        { path: "02_classic_ml/13_support_vector_machines.html", label: "2.13 SVM" },
        { path: "02_classic_ml/13a_kernel_methods_deeper.html", label: "2.13a Kernels" },
        { path: "02_classic_ml/14_clustering.html", label: "2.14 Кластеризация" },
        { path: "02_classic_ml/14a_gaussian_mixtures_em.html", label: "2.14a GMM / EM" },
        { path: "02_classic_ml/15_dimensionality_reduction.html", label: "2.15 Снижение размерности" },
        { path: "02_classic_ml/15a_kernel_pca_ica_autoencoders.html", label: "2.15a KPCA / ICA" },
        { path: "02_classic_ml/16_ensembles.html", label: "2.16 Ансамбли" },
        { path: "02_classic_ml/17_validation_and_hyperparameter_tuning.html", label: "2.17 Валидация / HPO" },
        { path: "02_classic_ml/18_imbalanced_classes.html", label: "2.18 Несбалансированные классы" },
        { path: "02_classic_ml/19_model_interpretation.html", label: "2.19 Интерпретация" },
        { path: "02_classic_ml/20_practical_pipeline.html", label: "2.20 Практический pipeline" }
      ]
    },
    {
      id: "neural-basics",
      label: "Блок 3",
      title: "База нейросетей",
      pages: [
        { path: "03_neural_basics/01_perceptron_and_neuron.html", label: "3.1 Нейрон" },
        { path: "03_neural_basics/02_activation_functions.html", label: "3.2 Активации" },
        { path: "03_neural_basics/03_forward_pass.html", label: "3.3 Forward pass" },
        { path: "03_neural_basics/04_loss_functions.html", label: "3.4 Loss" }
      ]
    },
    {
      id: "training",
      label: "Блок 4",
      title: "Обучение",
      pages: [
        { path: "04_training/01_backpropagation.html", label: "4.1 Backprop" },
        { path: "04_training/02_optimizers.html", label: "4.2 Оптимизаторы" },
        { path: "04_training/03_adam_adamw_lion.html", label: "4.3 Adam / Lion" },
        { path: "04_training/04_regularization.html", label: "4.4 Регуляризация" },
        { path: "04_training/05_learning_rate_scheduling.html", label: "4.5 LR Scheduling" },
        { path: "04_training/06_gradient_clipping_and_stability.html", label: "4.6 Clipping / Stability" },
        { path: "04_training/07_mixed_precision_training.html", label: "4.7 Mixed Precision" },
        { path: "04_training/08_weight_initialization_deeper.html", label: "4.8 Инициализация" }
      ]
    },
    {
      id: "architectures",
      label: "Блок 5",
      title: "Архитектуры",
      pages: [
        { path: "05_architectures/01_cnn_convolutional_networks.html", label: "5.1 CNN" },
        { path: "05_architectures/02_rnn_lstm.html", label: "5.2 RNN / LSTM" },
        { path: "05_architectures/03_transformer_attention.html", label: "5.3 Attention" },
        { path: "05_architectures/04_transformer_architecture.html", label: "5.4 Архитектура" },
        { path: "05_architectures/05_resnet_normalization.html", label: "5.5 ResNet / Norm" },
        { path: "05_architectures/06_positional_encodings.html", label: "5.6 Positional Encodings" },
        { path: "05_architectures/07_efficient_attention.html", label: "5.7 Efficient Attention" },
        { path: "05_architectures/08_vision_transformer.html", label: "5.8 ViT" }
      ]
    },
    {
      id: "llm",
      label: "Блок 6",
      title: "LLM",
      pages: [
        { path: "06_llm/01_tokenization_bpe.html", label: "6.1 Tokenization / BPE" },
        { path: "06_llm/02_pretraining_objectives.html", label: "6.2 Pre-training" },
        { path: "06_llm/03_instruction_tuning.html", label: "6.3 Instruction tuning" },
        { path: "06_llm/04_rlhf.html", label: "6.4 RLHF" },
        { path: "06_llm/05_lora_qlora.html", label: "6.5 LoRA / QLoRA" },
        { path: "06_llm/06_scaling_laws.html", label: "6.6 Scaling laws" }
      ]
    },
    {
      id: "generative",
      label: "Блок 7",
      title: "Generative Models",
      pages: [
        { path: "07_generative_models/01_variational_autoencoders.html", label: "7.1 VAE" },
        { path: "07_generative_models/02_generative_adversarial_networks.html", label: "7.2 GAN" },
        { path: "07_generative_models/03_diffusion_models.html", label: "7.3 Diffusion" }
      ]
    },
    {
      id: "training-practice",
      label: "Блок 8",
      title: "Практика обучения",
      pages: [
        { path: "08_training_practice/01_distributed_training.html", label: "8.1 DDP / FSDP" },
        { path: "08_training_practice/02_gradient_checkpointing.html", label: "8.2 Checkpointing" },
        { path: "08_training_practice/03_profiling_and_performance.html", label: "8.3 Profiling" },
        { path: "08_training_practice/04_debugging_loss_spikes.html", label: "8.4 Loss spikes" }
      ]
    }
  ];

  var sectionAccentMap = {
    math: "#6c8ebf",
    "classic-ml": "#7eb87e",
    "neural-basics": "#c8956c",
    training: "#b87eb8",
    architectures: "#7eb8b8",
    llm: "#d497b8",
    generative: "#d58f79",
    "training-practice": "#97a9d6"
  };

  var rootUrl = new URL(
    ".",
    document.currentScript && document.currentScript.src
      ? document.currentScript.src
      : window.location.href
  );
  var siteBaseUrl = "https://gandrsky.github.io/ml-notes/";
  var indexHref = new URL("index.html", rootUrl).href;

  function pageHref(page) {
    return new URL(page.path, rootUrl).href;
  }

  var pages = [];
  sections.forEach(function (section, sectionIndex) {
    section.pages.forEach(function (page, pageIndexInSection) {
      pages.push({
        path: page.path,
        label: page.label,
        sectionId: section.id,
        sectionLabel: section.label,
        sectionTitle: section.title,
        sectionIndex: sectionIndex,
        pageIndexInSection: pageIndexInSection,
        sectionSize: section.pages.length
      });
    });
  });

  window.__mlNotesCourseData = {
    rootUrl: rootUrl.href,
    sections: sections.map(function (section) {
      return {
        id: section.id,
        label: section.label,
        title: section.title,
        accent: sectionAccentMap[section.id] || "#7eb8b8",
        pages: section.pages.map(function (page) {
          return {
            path: page.path,
            label: page.label
          };
        })
      };
    }),
    pages: pages.map(function (page) {
      return {
        path: page.path,
        label: page.label,
        sectionId: page.sectionId,
        sectionLabel: page.sectionLabel,
        sectionTitle: page.sectionTitle
      };
    }),
    totalLessons: pages.length
  };

  var currentUrl = new URL(window.location.href);
  currentUrl.search = "";
  currentUrl.hash = "";
  var currentHref = currentUrl.href;

  var currentIndex = pages.findIndex(function (page) {
    return pageHref(page) === currentHref;
  });

  if (currentIndex === -1) {
    return;
  }

  document.body.classList.add("ml-course-theme");

  var currentPage = pages[currentIndex];
  var currentSection = sections[currentPage.sectionIndex];
  var currentAccent = sectionAccentMap[currentSection.id] || "#7eb8b8";
  var visitedStorageKey = "ml_notes_visited";
  var desktopQuery = window.matchMedia("(min-width: 960px)");

  document.body.dataset.mlSection = currentSection.id;
  document.body.style.setProperty("--section-accent", currentAccent);
  window.__mlNotesCurrentPagePath = currentPage.path;

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function ensureScript(relativePath, dataAttributeName) {
    if (dataAttributeName && document.querySelector("script[" + dataAttributeName + '="1"]')) {
      return;
    }

    var script = document.createElement("script");
    script.src = new URL(relativePath, rootUrl).href;
    script.defer = true;
    script.async = false;
    if (dataAttributeName) {
      script.setAttribute(dataAttributeName, "1");
    }
    document.body.appendChild(script);
  }

  function readVisitedPaths() {
    var validPaths = Object.create(null);
    pages.forEach(function (page) {
      validPaths[page.path] = true;
    });

    try {
      var parsed = JSON.parse(window.localStorage.getItem(visitedStorageKey) || "[]");
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.filter(function (path) {
        return typeof path === "string" && validPaths[path];
      });
    } catch (error) {
      return [];
    }
  }

  function writeVisitedPaths(paths) {
    try {
      window.localStorage.setItem(visitedStorageKey, JSON.stringify(paths));
    } catch (error) {
      // Ignore storage issues.
    }
  }

  function markVisited(path) {
    var paths = readVisitedPaths();
    if (paths.indexOf(path) === -1) {
      paths.push(path);
      writeVisitedPaths(paths);
    }
    return paths;
  }

  var visitedPaths = markVisited(currentPage.path);
  var visitedSet = {};
  visitedPaths.forEach(function (path) {
    visitedSet[path] = true;
  });
  window.__mlNotesVisitedPaths = visitedPaths.slice();

  function upsertMeta(selector, buildElement) {
    var existing = document.head.querySelector(selector);
    if (existing) {
      return existing;
    }

    var created = buildElement();
    document.head.appendChild(created);
    return created;
  }

  function setMetaTag(name, content) {
    var meta = upsertMeta('meta[name="' + name + '"]', function () {
      var element = document.createElement("meta");
      element.setAttribute("name", name);
      return element;
    });
    meta.setAttribute("content", content);
  }

  function setOgTag(property, content) {
    var meta = upsertMeta('meta[property="' + property + '"]', function () {
      var element = document.createElement("meta");
      element.setAttribute("property", property);
      return element;
    });
    meta.setAttribute("content", content);
  }

  function ensureFavicon() {
    var href = new URL("favicon.png", rootUrl).href;
    var icon = upsertMeta('link[rel="icon"]', function () {
      var link = document.createElement("link");
      link.setAttribute("rel", "icon");
      return link;
    });
    icon.setAttribute("type", "image/png");
    icon.setAttribute("href", href);
  }

  function applyMeta() {
    var pageTitle = currentPage.label + " — ML-конспект";
    var description = currentPage.label + " — интерактивный ML-конспект по теме \"" + currentSection.title + "\": формулы, визуализации, примеры и код.";
    var ogUrl = new URL(currentPage.path, siteBaseUrl).href;

    document.title = pageTitle;
    setMetaTag("description", description);
    setOgTag("og:title", pageTitle);
    setOgTag("og:description", description);
    setOgTag("og:url", ogUrl);
    ensureFavicon();
  }

  applyMeta();

  var previousPage = pages[currentIndex - 1] || null;
  var nextPage = pages[currentIndex + 1] || null;
  var visitedCount = visitedPaths.length;
  var progressPercent = pages.length ? Math.round((visitedCount / pages.length) * 100) : 0;

  function buildInlineAction(page, text, className) {
    if (!page) {
      return '<span class="' + className + ' is-disabled">' + escapeHtml(text) + "</span>";
    }

    return '<a class="' + className + '" href="' + pageHref(page) + '">' + escapeHtml(text) + "</a>";
  }

  function buildSidebarLink(page) {
    var isCurrent = page.path === currentPage.path;
    var isVisited = !!visitedSet[page.path];

    return (
      '<a class="ml-page-nav__link' +
      (isCurrent ? " is-current" : "") +
      '" data-label="' +
      escapeHtml(page.label.toLowerCase()) +
      '" href="' +
      pageHref(page) +
      '">' +
      '<span class="ml-page-nav__link-label">' +
      escapeHtml(page.label) +
      "</span>" +
      '<span class="ml-page-nav__link-check' +
      (isVisited ? " is-visible" : "") +
      '" aria-hidden="true">✓</span>' +
      "</a>"
    );
  }

  function buildSectionMarkup(section) {
    var sectionPages = pages.filter(function (page) {
      return page.sectionId === section.id;
    });
    var isCurrentSection = section.id === currentSection.id;

    return (
      '<details class="ml-page-nav__section"' +
      (isCurrentSection ? " open" : "") +
      ' data-section="' +
      escapeHtml(section.id) +
      '">' +
      '<summary class="ml-page-nav__section-summary">' +
      '<div class="ml-page-nav__section-meta">' +
      '<span class="ml-page-nav__section-kicker">' +
      escapeHtml(section.label) +
      "</span>" +
      '<strong class="ml-page-nav__section-title">' +
      escapeHtml(section.title) +
      "</strong>" +
      "</div>" +
      '<span class="ml-page-nav__section-count">' +
      sectionPages.length +
      "</span>" +
      "</summary>" +
      '<div class="ml-page-nav__section-links">' +
      sectionPages.map(buildSidebarLink).join("") +
      "</div>" +
      "</details>"
    );
  }

  function buildPagerCard(page, kicker, className, fallbackText) {
    if (!page) {
      return (
        '<span class="ml-page-pager__card ' +
        className +
        ' is-disabled">' +
        '<span class="ml-page-pager__kicker">' +
        escapeHtml(kicker) +
        "</span>" +
        '<strong class="ml-page-pager__title">' +
        escapeHtml(fallbackText) +
        "</strong>" +
        "</span>"
      );
    }

    return (
      '<a class="ml-page-pager__card ' +
      className +
      '" href="' +
      pageHref(page) +
      '">' +
      '<span class="ml-page-pager__kicker">' +
      escapeHtml(kicker) +
      "</span>" +
      '<strong class="ml-page-pager__title">' +
      escapeHtml(page.label) +
      "</strong>" +
      "</a>"
    );
  }

  var navShell = document.createElement("div");
  navShell.className = "ml-page-nav-shell";
  navShell.innerHTML =
    '<button class="ml-page-nav__mobile-toggle" type="button" aria-expanded="false" aria-controls="ml-course-sidebar" aria-label="Открыть навигацию">☰</button>' +
    '<div class="ml-page-nav__overlay" hidden></div>' +
    '<aside class="ml-page-nav" id="ml-course-sidebar" aria-label="Навигация по курсу">' +
    '<div class="ml-page-nav__toolbar">' +
    '<div class="ml-page-nav__toolbar-meta">' +
    '<span class="ml-page-nav__current-kicker">' +
    escapeHtml(currentPage.sectionLabel) +
    " · " +
    (currentPage.pageIndexInSection + 1) +
    " / " +
    currentPage.sectionSize +
    "</span>" +
    '<strong class="ml-page-nav__current-title">' +
    escapeHtml(currentPage.label) +
    "</strong>" +
    '<span class="ml-page-nav__course-subtitle">' +
    escapeHtml(currentSection.title) +
    "</span>" +
    "</div>" +
    '<button class="ml-page-nav__close" type="button" aria-label="Закрыть меню">×</button>' +
    "</div>" +
    '<div class="ml-page-nav__panel">' +
    '<div class="ml-page-nav__course-meta">' +
    '<span class="ml-page-nav__course-kicker">Весь курс</span>' +
    '<strong class="ml-page-nav__course-title">' +
    pages.length +
    " тем в одном конспекте" +
    "</strong>" +
    '<span class="ml-page-nav__course-subtitle">Изучено: ' +
    visitedCount +
    " из " +
    pages.length +
    " · " +
    progressPercent +
    "%</span>" +
    '<div class="ml-page-nav__progress"><span style="width:' +
    progressPercent +
    '%"></span></div>' +
    "</div>" +
    '<div class="ml-page-nav__actions">' +
    buildInlineAction(previousPage, "← Назад", "ml-page-nav__action-link") +
    '<a class="ml-page-nav__action-link" href="' +
    indexHref +
    '">Главная</a>' +
    buildInlineAction(nextPage, "Далее →", "ml-page-nav__action-link") +
    "</div>" +
    '<div class="ml-page-nav__sections">' +
    sections.map(buildSectionMarkup).join("") +
    "</div>" +
    "</div>" +
    "</aside>";

  document.body.insertBefore(navShell, document.body.firstChild);

  var bottomNav = document.createElement("nav");
  bottomNav.className = "ml-page-pager";
  bottomNav.setAttribute("aria-label", "Переход между страницами");
  bottomNav.innerHTML =
    buildPagerCard(previousPage, "← Предыдущая тема", "is-previous", "Нет предыдущей темы") +
    '<a class="ml-page-pager__card is-home" href="' +
    indexHref +
    '">' +
    '<span class="ml-page-pager__kicker">Оглавление</span>' +
    '<strong class="ml-page-pager__title">Вернуться на главную</strong>' +
    "</a>" +
    buildPagerCard(nextPage, "Следующая тема →", "is-next", "Последняя тема блока");

  var pageContainer = document.querySelector(".page");
  if (pageContainer) {
    pageContainer.appendChild(bottomNav);
  } else {
    document.body.appendChild(bottomNav);
  }

  var mobileToggle = navShell.querySelector(".ml-page-nav__mobile-toggle");
  var sidebar = navShell.querySelector(".ml-page-nav");
  var overlay = navShell.querySelector(".ml-page-nav__overlay");
  var closeButton = navShell.querySelector(".ml-page-nav__close");
  var sectionNodes = Array.prototype.slice.call(navShell.querySelectorAll(".ml-page-nav__section"));
  var mobileOpen = false;

  function syncMobileState() {
    var shouldUseOverlay = !desktopQuery.matches;
    navShell.classList.toggle("is-open", shouldUseOverlay && mobileOpen);
    overlay.hidden = !(shouldUseOverlay && mobileOpen);
    mobileToggle.setAttribute("aria-expanded", shouldUseOverlay && mobileOpen ? "true" : "false");
    document.body.classList.toggle("ml-sidebar-open", shouldUseOverlay && mobileOpen);

    if (!shouldUseOverlay) {
      overlay.hidden = true;
      mobileToggle.setAttribute("aria-expanded", "false");
    }
  }

  function closeMobileSidebar() {
    mobileOpen = false;
    syncMobileState();
  }

  function openMobileSidebar() {
    mobileOpen = true;
    syncMobileState();
  }

  function applyFilter(value) {
    var query = String(value || "").trim().toLowerCase();

    sectionNodes.forEach(function (sectionNode) {
      var links = Array.prototype.slice.call(sectionNode.querySelectorAll(".ml-page-nav__link"));
      var hasVisible = false;

      links.forEach(function (link) {
        var matches = !query || link.getAttribute("data-label").indexOf(query) !== -1;
        link.hidden = !matches;
        if (matches) {
          hasVisible = true;
        }
      });

      sectionNode.classList.toggle("is-empty", !hasVisible);
      sectionNode.open = query ? hasVisible : sectionNode.getAttribute("data-section") === currentSection.id;
    });
  }

  mobileToggle.addEventListener("click", function () {
    if (mobileOpen) {
      closeMobileSidebar();
      return;
    }
    openMobileSidebar();
  });

  overlay.addEventListener("click", closeMobileSidebar);
  closeButton.addEventListener("click", closeMobileSidebar);

  navShell.addEventListener("click", function (event) {
    var target = event.target;
    if (!target || !target.closest) {
      return;
    }

    if (target.closest(".ml-page-nav__link") && !desktopQuery.matches) {
      closeMobileSidebar();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeMobileSidebar();
    }
  });

  desktopQuery.addEventListener("change", function () {
    if (desktopQuery.matches) {
      closeMobileSidebar();
    } else {
      syncMobileState();
    }
  });

  applyFilter("");
  syncMobileState();

  var hasMathCandidates = Array.prototype.some.call(
    document.querySelectorAll(".formula, .inline-math, [data-render-tex]"),
    function (element) {
      return !element.hasAttribute("data-no-tex");
    }
  );

  var hasCodeCandidates = Array.prototype.some.call(
    document.querySelectorAll("pre code, .formula[data-code-block], .formula"),
    function (element) {
      var text = String(element.textContent || "").trim();
      if (!text) {
        return false;
      }

      return /(import\s+\w+|from\s+\w+\s+import|def\s+\w+\(|class\s+\w+|function\s+\w+\(|const\s+|let\s+|=>|\$\s+\w+|#!\/bin\/bash|torch\.|np\.|numpy|console\.log|echo\s+)/im.test(text);
    }
  );

  if (currentPage.sectionId === "classic-ml") {
    ensureScript("shared-classic-ml-practice.js", "data-ml-practice-script");
  }

  if (currentPage.sectionId !== "math") {
    ensureScript("shared-theory-notes.js", "data-ml-theory-script");
    ensureScript("shared-explainer-notes.js", "data-ml-explainer-script");
    ensureScript("shared-formula-explainers.js", "data-ml-formula-explainer-script");
  }

  if (hasMathCandidates) {
    ensureScript("shared-katex.js", "data-ml-katex-script");
  }

  if (hasCodeCandidates) {
    ensureScript("shared-code-highlight.js", "data-ml-code-highlight-script");
  }
})();

// END shared-nav.js

// BEGIN shared-search.js
(function () {
  if (window.__mlNotesSearchInitialized) {
    return;
  }
  window.__mlNotesSearchInitialized = true;
  var script = document.currentScript;
  var rootUrl = new URL(".", script && script.src ? script.src : window.location.href);
  var indexScriptUrl = new URL("shared-search-index.js", rootUrl).href;
  var extraIndexScriptUrl = new URL("shared-search-extra-index.js", rootUrl).href;
  var searchCssUrl = new URL("shared-search.css", rootUrl).href;
  var fuseUrl = new URL("vendor/fuse.min.js", rootUrl).href;
  var MIN_QUERY_LENGTH = 2;
  var searchIndexPromise = null;
  var searchExtraIndexPromise = null;

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function normalizeWhitespace(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function ensureStylesheet(href, id) {
    if (document.getElementById(id)) {
      return;
    }

    var link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }

  function ensureScript(src, testGlobal, id) {
    if (testGlobal && window[testGlobal]) {
      return Promise.resolve(true);
    }

    if (id && document.getElementById(id)) {
      return new Promise(function (resolve) {
        var existing = document.getElementById(id);
        existing.addEventListener("load", function () { resolve(true); }, { once: true });
        existing.addEventListener("error", function () { resolve(false); }, { once: true });
      });
    }

    return new Promise(function (resolve) {
      var tag = document.createElement("script");
      if (id) {
        tag.id = id;
      }
      tag.src = src;
      tag.async = true;
      tag.onload = function () { resolve(true); };
      tag.onerror = function () { resolve(false); };
      document.head.appendChild(tag);
    });
  }

  function ensureSearchIndex() {
    if (window.__mlNotesSearchIndex) {
      return Promise.resolve(window.__mlNotesSearchIndex);
    }

    if (!searchIndexPromise) {
      searchIndexPromise = ensureScript(indexScriptUrl, "__mlNotesSearchIndex", "ml-notes-search-index-script")
        .then(function () {
          return window.__mlNotesSearchIndex || [];
        });
    }

    return searchIndexPromise;
  }

  function ensureExtraSearchIndex() {
    if (window.__mlNotesSearchExtraIndex) {
      return Promise.resolve(window.__mlNotesSearchExtraIndex);
    }

    if (!searchExtraIndexPromise) {
      searchExtraIndexPromise = ensureScript(extraIndexScriptUrl, "__mlNotesSearchExtraIndex", "ml-notes-search-extra-index-script")
        .then(function () {
          return window.__mlNotesSearchExtraIndex || [];
        })
        .catch(function () {
          return [];
        });
    }

    return searchExtraIndexPromise;
  }

  function mergeSearchRecords(baseRecords, extraRecords) {
    var merged = [];
    var seen = Object.create(null);

    [baseRecords || [], extraRecords || []].forEach(function (records) {
      records.forEach(function (record) {
        if (!record || !record.path || seen[record.path]) {
          return;
        }
        seen[record.path] = true;
        merged.push(record);
      });
    });

    return merged;
  }

  function buildSnippet(record, query) {
    var source = normalizeWhitespace(record.summary || "") + " " + normalizeWhitespace(record.headings || "") + " " + normalizeWhitespace(record.content || "");
    var normalizedQuery = normalizeWhitespace(query);
    var lowerSource = source.toLowerCase();
    var lowerQuery = normalizedQuery.toLowerCase();
    var index = lowerSource.indexOf(lowerQuery);

    if (index === -1) {
      return source.slice(0, 180).trim() + (source.length > 180 ? "…" : "");
    }

    var start = Math.max(0, index - 70);
    var end = Math.min(source.length, index + normalizedQuery.length + 110);
    var snippet = source.slice(start, end).trim();

    if (start > 0) {
      snippet = "…" + snippet;
    }

    if (end < source.length) {
      snippet += "…";
    }

    return snippet;
  }

  function highlightQuery(text, query) {
    if (!query) {
      return escapeHtml(text);
    }

    var pattern = new RegExp("(" + escapeRegExp(query) + ")", "ig");
    return escapeHtml(text).replace(pattern, "<mark>$1</mark>");
  }

  function searchFallback(records, query) {
    var lowerQuery = query.toLowerCase();

    return records
      .map(function (record) {
        var haystack = [
          record.title,
          record.section,
          record.summary,
          record.headings,
          record.content
        ].join(" ").toLowerCase();

        var titleIndex = (record.title || "").toLowerCase().indexOf(lowerQuery);
        var contentIndex = haystack.indexOf(lowerQuery);

        if (contentIndex === -1) {
          return null;
        }

        return {
          item: record,
          score: titleIndex === -1 ? contentIndex + 1000 : titleIndex
        };
      })
      .filter(Boolean)
      .sort(function (left, right) {
        return left.score - right.score;
      })
      .slice(0, 8);
  }

  function createResultsMarkup(matches, query) {
    if (!matches.length) {
      return '<div class="ml-search__status">Ничего не нашлось. Попробуй короче запрос или другое ключевое слово.</div>';
    }

    return matches
      .map(function (match) {
        var record = match.item || match;
        var title = highlightQuery(record.title || record.label || record.path, query);
        var snippet = highlightQuery(buildSnippet(record, query), query);
        var section = escapeHtml(record.section || record.sectionTitle || "");

        return (
          '<a class="ml-search__result" href="' + new URL(record.path, rootUrl).href + '">' +
          '<div class="ml-search__meta"><span class="ml-search__badge">' + section + "</span></div>" +
          '<div class="ml-search__title">' + title + "</div>" +
          '<p class="ml-search__snippet">' + snippet + "</p>" +
          "</a>"
        );
      })
      .join("");
  }

  function mountSearch(container, options) {
    if (!container || container.querySelector(".ml-search")) {
      return;
    }

    var wrapper = document.createElement("div");
    wrapper.className = "ml-search " + (options.mode === "hero" ? "ml-search--hero" : "ml-search--nav");
    wrapper.innerHTML =
      '<label class="ml-search__label" for="' + options.id + '">Поиск по конспекту</label>' +
      '<input class="ml-search__input" id="' + options.id + '" type="search" placeholder="Например: Adam, Jacobian, dropout, attention" autocomplete="off" />' +
      '<div class="ml-search__hint">Ищет по названиям тем, подзаголовкам и тексту конспектов без сервера.</div>' +
      '<div class="ml-search__results" hidden></div>';

    if (options.mode === "nav") {
      var sections = container.querySelector(".ml-page-nav__sections");
      if (sections) {
        container.insertBefore(wrapper, sections);
      } else {
        container.appendChild(wrapper);
      }
    } else {
      container.appendChild(wrapper);
    }

    var input = wrapper.querySelector(".ml-search__input");
    var results = wrapper.querySelector(".ml-search__results");
    var docs = null;
    var fuse = null;
    var isLoading = false;

    function renderStatus(message) {
      results.hidden = false;
      results.innerHTML = '<div class="ml-search__status">' + escapeHtml(message) + "</div>";
    }

    function ensureSearchReady() {
      if (docs) {
        return Promise.resolve({ docs: docs, fuse: fuse });
      }

      if (isLoading) {
        return new Promise(function (resolve) {
          var timer = window.setInterval(function () {
            if (!isLoading && docs) {
              window.clearInterval(timer);
              resolve({ docs: docs, fuse: fuse });
            }
          }, 60);
        });
      }

      isLoading = true;
      renderStatus("Индексация конспектов…");

      return Promise.all([
        ensureSearchIndex(),
        ensureExtraSearchIndex(),
        ensureScript(fuseUrl, "Fuse", "ml-notes-fuse-script")
      ]).then(function (payload) {
        docs = mergeSearchRecords(payload[0], payload[1]);

        if (window.Fuse && docs.length) {
          fuse = new window.Fuse(docs, {
            includeScore: true,
            threshold: 0.32,
            ignoreLocation: true,
            minMatchCharLength: 2,
            keys: [
              { name: "title", weight: 0.42 },
              { name: "section", weight: 0.08 },
              { name: "summary", weight: 0.18 },
              { name: "headings", weight: 0.14 },
              { name: "content", weight: 0.18 }
            ]
          });
        }

        isLoading = false;
        return { docs: docs, fuse: fuse };
      }).catch(function () {
        isLoading = false;
        docs = mergeSearchRecords(window.__mlNotesSearchIndex || [], window.__mlNotesSearchExtraIndex || []);
        return { docs: docs, fuse: null };
      });
    }

    function runSearch(query) {
      var normalized = normalizeWhitespace(query);

      if (normalized.length < MIN_QUERY_LENGTH) {
        results.hidden = true;
        results.innerHTML = "";
        return;
      }

      ensureSearchReady().then(function (state) {
        var matches = state.fuse ? state.fuse.search(normalized, { limit: 8 }) : searchFallback(state.docs, normalized);
        results.hidden = false;
        results.innerHTML = createResultsMarkup(matches, normalized);
      });
    }

    input.addEventListener("focus", function () {
      ensureSearchReady();
    });

    input.addEventListener("input", function (event) {
      runSearch(event.target.value);
    });
  }

  function init() {
    ensureStylesheet(searchCssUrl, "ml-notes-search-stylesheet");

    var navPanel = document.querySelector(".ml-page-nav__panel");
    if (navPanel) {
      mountSearch(navPanel, { mode: "nav", id: "ml-notes-nav-search" });
    }

    var hero = document.querySelector(".hero");
    if (hero && document.body && !document.querySelector(".ml-page-nav")) {
      mountSearch(hero, { mode: "hero", id: "ml-notes-home-search" });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();

// END shared-search.js

// BEGIN shared-index.js
(function () {
  if (window.__mlNotesIndexInitialized) {
    return;
  }
  window.__mlNotesIndexInitialized = true;

  function readVisitedPaths() {
    try {
      var parsed = JSON.parse(window.localStorage.getItem("ml_notes_visited") || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function init() {
    if (!document.body || !document.body.classList.contains("ml-index-theme")) {
      return;
    }

    var courseData = window.__mlNotesCourseData || { sections: [], totalLessons: 0 };
    var sections = Array.prototype.slice.call(document.querySelectorAll(".section"));
    var hero = document.querySelector(".hero");
    var visited = readVisitedPaths();
    var visitedSet = {};
    visited.forEach(function (path) {
      visitedSet[path] = true;
    });

    var accentMap = {
      1: "#6c8ebf",
      2: "#7eb87e",
      3: "#c8956c",
      4: "#b87eb8",
      5: "#7eb8b8",
      6: "#d497b8",
      7: "#d58f79",
      8: "#97a9d6"
    };

    sections.forEach(function (section, index) {
      var blockNumber = index + 1;
      section.classList.add("section--block-" + blockNumber);
      section.dataset.block = String(blockNumber);
      section.style.setProperty("--block-accent", accentMap[blockNumber] || "#7eb8b8");

      Array.prototype.slice.call(section.querySelectorAll(".card")).forEach(function (card) {
        var href = card.getAttribute("href");
        if (!href) {
          return;
        }

        var path = href.replace(/^\.\//, "");
        card.dataset.lessonCard = path;
        if (visitedSet[path]) {
          card.classList.add("is-visited");
        }
      });
    });

    var heroTitle = hero && hero.querySelector("h1");
    var heroSubtitle = hero && hero.querySelector(".hero-subtitle");
    var progressCount = hero && hero.querySelector(".hero-progress__count");
    var progressLabel = hero && hero.querySelector(".hero-progress__label");
    var progressBar = hero && hero.querySelector(".hero-progress__bar span");

    var totalLessons = Number(courseData.totalLessons || document.querySelectorAll("[data-lesson-card]").length || 0);
    var validVisitedCount = visited.filter(function (path) {
      return !!document.querySelector('[data-lesson-card="' + path + '"]');
    }).length;
    var progressPercent = totalLessons ? Math.round((validVisitedCount / totalLessons) * 100) : 0;

    if (heroTitle) {
      heroTitle.textContent = "Интерактивный ML-конспект";
    }

    if (heroSubtitle) {
      heroSubtitle.textContent = totalLessons + " тем · от линейной алгебры до LLM и diffusion · интерактивные визуализации и код";
    }

    if (progressCount) {
      progressCount.textContent = "Изучено: " + validVisitedCount + " из " + totalLessons;
    }

    if (progressLabel) {
      progressLabel.textContent = progressPercent + "% курса";
    }

    if (progressBar) {
      progressBar.style.width = progressPercent + "%";
    }

    var classicMlSection = sections[1];
    var classicGrid = classicMlSection && classicMlSection.querySelector(".grid");
    if (classicGrid && !classicGrid.querySelector(".index-subgroup")) {
      var subgroupMap = {
        "2.1": "Базовые модели",
        "2.6": "Метрики",
        "2.8": "Продвинутые модели",
        "2.17": "Практика"
      };

      Array.prototype.slice.call(classicGrid.querySelectorAll(".card")).forEach(function (card) {
        var badge = card.querySelector(".badge");
        var key = badge ? badge.textContent.trim() : "";
        if (!subgroupMap[key]) {
          return;
        }

        var divider = document.createElement("div");
        divider.className = "index-subgroup";
        divider.innerHTML =
          '<span class="index-subgroup__line"></span>' +
          '<span class="index-subgroup__label">' + subgroupMap[key] + "</span>" +
          '<span class="index-subgroup__line"></span>';
        classicGrid.insertBefore(divider, card);
      });
    }

    var visitedCards = document.querySelectorAll(".card.is-visited");
    Array.prototype.forEach.call(visitedCards, function (card) {
      if (card.querySelector(".index-card-check")) {
        return;
      }

      var check = document.createElement("span");
      check.className = "index-card-check";
      check.textContent = "✓";
      card.appendChild(check);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();

// END shared-index.js

