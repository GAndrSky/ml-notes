// BEGIN course-manifest.js
/**
 * course-manifest.js - single source of truth for the course structure.
 *
 * Read by shared-nav.js (sidebar, index cards, progress) and
 * shared-prevnext.js (prev/next pager). Order here = course order.
 *
 * section: id, label (sidebar badge), title (sidebar heading),
 *          pagerTitle (pager progress caption), accent (CSS colour)
 * page:    path (from site root), label (sidebar/index, numbered),
 *          title (short title on prev/next buttons)
 *
 * After editing, run scripts/build-bundle.ps1, scripts/build-search-index.ps1,
 * node scripts/build-review-data.mjs
 * and scripts/smoke-check-course.ps1.
 */
window.__mlNotesCourse = {
  sections: [
    {
      id: "math",
      label: "Блок 1",
      title: "Математика",
      pagerTitle: "01 Математика",
      accent: "#6c8ebf",
      pages: [
        { path: "01_math/01_linear_algebra.html", label: "1.1 Линейная алгебра", title: "Линейная алгебра" },
        { path: "01_math/02_calculus.html", label: "1.2 Матанализ", title: "Математический анализ" },
        { path: "01_math/03_probability_theory.html", label: "1.3 Теория вероятностей", title: "Теория вероятностей" },
        { path: "01_math/04_information_theory.html", label: "1.4 Теория информации", title: "Теория информации" },
        { path: "01_math/05_optimization_theory.html", label: "1.5 Optimization Theory", title: "Теория оптимизации" }
      ]
    },
    {
      id: "classic-ml",
      label: "Блок 2",
      title: "Классическое ML",
      pagerTitle: "02 Классический ML",
      accent: "#7eb87e",
      pages: [
        { path: "02_classic_ml/01_intro_to_classical_ml.html", label: "2.1 Классическое ML", title: "Введение в классический ML" },
        { path: "02_classic_ml/02_data_preprocessing.html", label: "2.2 Предобработка", title: "Препроцессинг данных" },
        { path: "02_classic_ml/03_linear_regression.html", label: "2.3 Линейная регрессия", title: "Линейная регрессия" },
        { path: "02_classic_ml/04_linear_model_regularization.html", label: "2.4 Регуляризация", title: "Регуляризация линейных моделей" },
        { path: "02_classic_ml/05_logistic_regression.html", label: "2.5 Логистическая регрессия", title: "Логистическая регрессия" },
        { path: "02_classic_ml/06_regression_metrics.html", label: "2.6 Метрики регрессии", title: "Метрики регрессии" },
        { path: "02_classic_ml/07_classification_metrics.html", label: "2.7 Метрики классификации", title: "Метрики классификации" },
        { path: "02_classic_ml/08_distance_based_models.html", label: "2.8 k-NN / Distance", title: "Модели на расстоянии (KNN)" },
        { path: "02_classic_ml/09_naive_bayes.html", label: "2.9 Naive Bayes", title: "Наивный Байес" },
        { path: "02_classic_ml/10_decision_trees.html", label: "2.10 Decision Trees", title: "Деревья решений" },
        { path: "02_classic_ml/11_bagging_random_forest.html", label: "2.11 Random Forest", title: "Бэггинг и Random Forest" },
        { path: "02_classic_ml/12_boosting.html", label: "2.12 Boosting", title: "Бустинг" },
        { path: "02_classic_ml/12a_gradient_boosting_theory.html", label: "2.12a GB Theory", title: "Gradient Boosting: теория" },
        { path: "02_classic_ml/12b_gradient_boosting_in_practice.html", label: "2.12b GBDT Practice", title: "Gradient Boosting: практика" },
        { path: "02_classic_ml/13_support_vector_machines.html", label: "2.13 SVM", title: "SVM" },
        { path: "02_classic_ml/13a_kernel_methods_deeper.html", label: "2.13a Kernels", title: "Kernel Methods" },
        { path: "02_classic_ml/14_clustering.html", label: "2.14 Кластеризация", title: "Кластеризация" },
        { path: "02_classic_ml/14a_gaussian_mixtures_em.html", label: "2.14a GMM / EM", title: "Гауссовы смеси (EM)" },
        { path: "02_classic_ml/15_dimensionality_reduction.html", label: "2.15 Снижение размерности", title: "Снижение размерности" },
        { path: "02_classic_ml/15a_kernel_pca_ica_autoencoders.html", label: "2.15a KPCA / ICA", title: "Kernel PCA, ICA, Автоэнкодеры" },
        { path: "02_classic_ml/16_ensembles.html", label: "2.16 Ансамбли", title: "Ансамблевые методы" },
        { path: "02_classic_ml/17_validation_and_hyperparameter_tuning.html", label: "2.17 Валидация / HPO", title: "Валидация и гиперпараметры" },
        { path: "02_classic_ml/18_imbalanced_classes.html", label: "2.18 Несбалансированные классы", title: "Дисбаланс классов" },
        { path: "02_classic_ml/19_model_interpretation.html", label: "2.19 Интерпретация", title: "Интерпретация моделей" },
        { path: "02_classic_ml/20_practical_pipeline.html", label: "2.20 Практический pipeline", title: "Практический pipeline" },
        { path: "02_classic_ml/21_anomaly_detection.html", label: "2.21 Anomaly Detection", title: "Обнаружение аномалий" },
        { path: "02_classic_ml/22_time_series_fundamentals.html", label: "2.22 Time Series", title: "Основы временных рядов" }
      ]
    },
    {
      id: "neural-basics",
      label: "Блок 3",
      title: "База нейросетей",
      pagerTitle: "03 Основы нейросетей",
      accent: "#c8956c",
      pages: [
        { path: "03_neural_basics/01_perceptron_and_neuron.html", label: "3.1 Нейрон", title: "Перцептрон и нейрон" },
        { path: "03_neural_basics/02_activation_functions.html", label: "3.2 Активации", title: "Функции активации" },
        { path: "03_neural_basics/03_forward_pass.html", label: "3.3 Forward pass", title: "Прямой проход" },
        { path: "03_neural_basics/04_loss_functions.html", label: "3.4 Loss", title: "Функции потерь" }
      ]
    },
    {
      id: "training",
      label: "Блок 4",
      title: "Обучение",
      pagerTitle: "04 Обучение",
      accent: "#b87eb8",
      pages: [
        { path: "04_training/01_backpropagation.html", label: "4.1 Backprop", title: "Backpropagation" },
        { path: "04_training/02_optimizers.html", label: "4.2 Оптимизаторы", title: "Оптимизаторы" },
        { path: "04_training/03_adam_adamw_lion.html", label: "4.3 Adam / Lion", title: "Adam, AdamW, Lion" },
        { path: "04_training/04_regularization.html", label: "4.4 Регуляризация", title: "Регуляризация" },
        { path: "04_training/05_learning_rate_scheduling.html", label: "4.5 LR Scheduling", title: "Learning Rate Scheduling" },
        { path: "04_training/06_gradient_clipping_and_stability.html", label: "4.6 Clipping / Stability", title: "Gradient Clipping" },
        { path: "04_training/07_mixed_precision_training.html", label: "4.7 Mixed Precision", title: "Mixed Precision" },
        { path: "04_training/08_weight_initialization_deeper.html", label: "4.8 Инициализация", title: "Инициализация весов" },
        { path: "04_training/09_numerical_stability.html", label: "4.9 Numerical Stability", title: "Численная стабильность" }
      ]
    },
    {
      id: "architectures",
      label: "Блок 5",
      title: "Архитектуры",
      pagerTitle: "05 Архитектуры",
      accent: "#7eb8b8",
      pages: [
        { path: "05_architectures/01_cnn_convolutional_networks.html", label: "5.1 CNN", title: "CNN" },
        { path: "05_architectures/02_rnn_lstm.html", label: "5.2 RNN / LSTM", title: "RNN и LSTM" },
        { path: "05_architectures/03_transformer_attention.html", label: "5.3 Attention", title: "Attention" },
        { path: "05_architectures/04_transformer_architecture.html", label: "5.4 Архитектура", title: "Архитектура трансформера" },
        { path: "05_architectures/05_resnet_normalization.html", label: "5.5 ResNet / Norm", title: "ResNet и нормализация" },
        { path: "05_architectures/06_positional_encodings.html", label: "5.6 Positional Encodings", title: "Позиционные кодировки" },
        { path: "05_architectures/07_efficient_attention.html", label: "5.7 Efficient Attention", title: "Efficient Attention" },
        { path: "05_architectures/08_vision_transformer.html", label: "5.8 ViT", title: "Vision Transformer (ViT)" },
        { path: "05_architectures/09_object_detection.html", label: "5.9 Object Detection", title: "Object Detection" },
        { path: "05_architectures/10_segmentation.html", label: "5.10 Segmentation", title: "Segmentation" },
        { path: "05_architectures/11_contrastive_learning_clip.html", label: "5.11 Contrastive / CLIP", title: "Contrastive Learning & CLIP" }
      ]
    },
    {
      id: "llm",
      label: "Блок 6",
      title: "LLM",
      pagerTitle: "06 LLM",
      accent: "#d497b8",
      pages: [
        { path: "06_llm/01_tokenization_bpe.html", label: "6.1 Tokenization / BPE", title: "Токенизация (BPE)" },
        { path: "06_llm/02_pretraining_objectives.html", label: "6.2 Pre-training", title: "Задачи предобучения" },
        { path: "06_llm/03_instruction_tuning.html", label: "6.3 Instruction tuning", title: "Instruction Tuning" },
        { path: "06_llm/04_rlhf.html", label: "6.4 RLHF", title: "RLHF" },
        { path: "06_llm/05_lora_qlora.html", label: "6.5 LoRA / QLoRA", title: "LoRA & QLoRA" },
        { path: "06_llm/06_scaling_laws.html", label: "6.6 Scaling laws", title: "Scaling Laws" },
        { path: "06_llm/07_kv_cache_inference_optimization.html", label: "6.7 KV-Cache / Inference", title: "KV-Cache & Inference" },
        { path: "06_llm/08_dpo_alignment_alternatives.html", label: "6.8 DPO / Alignment", title: "DPO и выравнивание" },
        { path: "06_llm/09_retrieval_augmented_generation.html", label: "6.9 RAG", title: "RAG" }
      ]
    },
    {
      id: "generative",
      label: "Блок 7",
      title: "Generative Models",
      pagerTitle: "07 Генеративные модели",
      accent: "#d58f79",
      pages: [
        { path: "07_generative_models/01_variational_autoencoders.html", label: "7.1 VAE", title: "VAE" },
        { path: "07_generative_models/02_generative_adversarial_networks.html", label: "7.2 GAN", title: "GAN" },
        { path: "07_generative_models/03_diffusion_models.html", label: "7.3 Diffusion", title: "Диффузионные модели" },
        { path: "07_generative_models/04_normalizing_flows.html", label: "7.4 Normalizing Flows", title: "Normalizing Flows" },
        { path: "07_generative_models/05_stable_diffusion_deep_dive.html", label: "7.5 Stable Diffusion", title: "Stable Diffusion" }
      ]
    },
    {
      id: "training-practice",
      label: "Блок 8",
      title: "Практика обучения",
      pagerTitle: "08 Практика обучения",
      accent: "#97a9d6",
      pages: [
        { path: "08_training_practice/01_distributed_training.html", label: "8.1 DDP / FSDP", title: "Distributed Training" },
        { path: "08_training_practice/02_gradient_checkpointing.html", label: "8.2 Checkpointing", title: "Gradient Checkpointing" },
        { path: "08_training_practice/03_profiling_and_performance.html", label: "8.3 Profiling", title: "Профилирование" },
        { path: "08_training_practice/04_debugging_loss_spikes.html", label: "8.4 Loss spikes", title: "Отладка Loss Spikes" }
      ]
    },
    {
      id: "mlops",
      label: "Блок 9",
      title: "MLOps / Deployment",
      pagerTitle: "09 MLOps",
      accent: "#6ea5ff",
      pages: [
        { path: "09_mlops_deployment/01_experiment_tracking.html", label: "9.1 Experiment Tracking", title: "Трекинг экспериментов" },
        { path: "09_mlops_deployment/02_model_serving.html", label: "9.2 Model Serving", title: "Model Serving" },
        { path: "09_mlops_deployment/03_docker_for_ml.html", label: "9.3 Docker for ML", title: "Docker для ML" },
        { path: "09_mlops_deployment/04_ml_system_design_patterns.html", label: "9.4 ML System Design", title: "Паттерны ML-систем" },
        { path: "09_mlops_deployment/05_interview_prep_system_design.html", label: "9.5 System Design Interview", title: "System Design: интервью" }
      ]
    },
    {
      id: "job-prep",
      label: "Job Prep",
      title: "Подготовка к собеседованиям",
      pagerTitle: "Подготовка к работе",
      accent: "#82d0b6",
      pages: [
        { path: "job_prep/01_interview_question_bank.html", label: "Interview Question Bank", title: "Банк вопросов" },
        { path: "job_prep/02_ml_system_design.html", label: "ML System Design Framework", title: "ML System Design" },
        { path: "job_prep/03_resume_portfolio_checklist.html", label: "Resume / Portfolio Checklist", title: "Резюме и портфолио" }
      ]
    },
    {
      id: "projects",
      label: "Блок 10",
      title: "Projects",
      pagerTitle: "10 Проекты",
      accent: "#8fd17f",
      pages: [
        { path: "10_projects/01_neural_net_from_scratch.html", label: "10.1 NN from Scratch", title: "Нейросеть с нуля" },
        { path: "10_projects/02_finetune_llm_lora.html", label: "10.2 LoRA Fine-tuning", title: "Fine-tune LLM (LoRA)" },
        { path: "10_projects/03_end_to_end_cv_pipeline.html", label: "10.3 CV Pipeline", title: "CV Pipeline" },
        { path: "10_projects/04_rag_application.html", label: "10.4 RAG Application", title: "RAG-приложение" },
        { path: "10_projects/05_kaggle_competition_walkthrough.html", label: "10.5 Kaggle Walkthrough", title: "Kaggle Walkthrough" }
      ]
    }
  ]
};

// END course-manifest.js

// BEGIN shared-nav.js
(function () {
  if (window.__mlNotesNavInitialized) {
    return;
  }
  window.__mlNotesNavInitialized = true;

  // Course structure lives in course-manifest.js (loaded first in bundle.js).
  var sections = (window.__mlNotesCourse && window.__mlNotesCourse.sections) || [];

  var visitedStorageKey = "ml_notes_visited";
  var collapsedStorageKey = "ml_notes_sidebar_collapsed";
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
        accent: section.accent || "#7eb8b8",
        pages: section.pages.slice()
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

  function dispatchProgressChanged(paths) {
    window.dispatchEvent(
      new window.CustomEvent("ml-notes-progress-changed", {
        detail: { visitedPaths: paths.slice() }
      })
    );
  }

  function setVisited(path, shouldVisit) {
    var paths = readVisitedPaths();
    var index = paths.indexOf(path);

    if (shouldVisit && index === -1) {
      paths.push(path);
    }

    if (!shouldVisit && index !== -1) {
      paths.splice(index, 1);
    }

    writeVisitedPaths(paths);
    dispatchProgressChanged(paths);
    return paths;
  }

  function readCollapsedState() {
    try {
      return window.localStorage.getItem(collapsedStorageKey) === "1";
    } catch (error) {
      return false;
    }
  }

  function writeCollapsedState(value) {
    try {
      window.localStorage.setItem(collapsedStorageKey, value ? "1" : "0");
    } catch (error) {
      // Ignore storage issues.
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function ensureScript(relativePath, dataAttributeName, onLoad) {
    if (dataAttributeName && document.querySelector("script[" + dataAttributeName + '="1"]')) {
      if (typeof onLoad === "function") {
        window.setTimeout(onLoad, 0);
      }
      return;
    }

    var script = document.createElement("script");
    script.src = new URL(relativePath, rootUrl).href;
    script.defer = true;
    script.async = false;
    if (typeof onLoad === "function") {
      script.addEventListener("load", onLoad);
      script.addEventListener("error", onLoad);
    }
    if (dataAttributeName) {
      script.setAttribute(dataAttributeName, "1");
    }
    document.body.appendChild(script);
  }

  function upsertMeta(selector, builder) {
    var existing = document.head.querySelector(selector);
    if (existing) {
      return existing;
    }

    var element = builder();
    document.head.appendChild(element);
    return element;
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
    var icon = upsertMeta('link[rel="icon"]', function () {
      var element = document.createElement("link");
      element.setAttribute("rel", "icon");
      return element;
    });
    icon.setAttribute("type", "image/png");
    icon.setAttribute("href", new URL("favicon.png", rootUrl).href);
  }

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
  var currentAccent = currentSection.accent || "#7eb8b8";
  var desktopQuery = window.matchMedia("(min-width: 960px)");
  var mobileOpen = false;
  var desktopCollapsed = readCollapsedState();

  document.body.dataset.mlSection = currentSection.id;
  document.body.style.setProperty("--section-accent", currentAccent);
  window.__mlNotesCurrentPagePath = currentPage.path;

  document.title = currentPage.label + " - ML notes";
  setMetaTag("description", currentPage.label + " - interactive ML notes with formulas, visualizations, and code.");
  setOgTag("og:title", currentPage.label + " - ML notes");
  setOgTag("og:description", currentPage.label + " - interactive ML notes with formulas, visualizations, and code.");
  setOgTag("og:url", new URL(currentPage.path, siteBaseUrl).href);
  ensureFavicon();

  var previousPage = pages[currentIndex - 1] || null;
  var nextPage = pages[currentIndex + 1] || null;

  function buildInlineAction(page, text, className) {
    if (!page) {
      return '<span class="' + className + ' is-disabled">' + escapeHtml(text) + "</span>";
    }

    return '<a class="' + className + '" href="' + pageHref(page) + '">' + escapeHtml(text) + "</a>";
  }

  function buildSidebarLink(page, visitedSet) {
    var isCurrent = page.path === currentPage.path;
    var isVisited = !!visitedSet[page.path];

    return (
      '<a class="ml-page-nav__link' +
      (isCurrent ? " is-current" : "") +
      '" data-path="' +
      escapeHtml(page.path) +
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
      '" aria-hidden="true">\u2713</span>' +
      "</a>"
    );
  }

  function buildSectionMarkup(section, visitedSet) {
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
      sectionPages.map(function (page) { return buildSidebarLink(page, visitedSet); }).join("") +
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

  var initialVisitedPaths = readVisitedPaths();
  if (initialVisitedPaths.indexOf(currentPage.path) === -1) {
    initialVisitedPaths.push(currentPage.path);
    writeVisitedPaths(initialVisitedPaths);
    dispatchProgressChanged(initialVisitedPaths);
  }

  var initialVisitedSet = {};
  initialVisitedPaths.forEach(function (path) {
    initialVisitedSet[path] = true;
  });

  var navShell = document.createElement("div");
  navShell.className = "ml-page-nav-shell";
  navShell.innerHTML =
    '<button class="ml-page-nav__mobile-toggle" type="button" aria-expanded="false" aria-controls="ml-course-sidebar" aria-label="\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u043d\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u044e">\u2630</button>' +
    '<div class="ml-page-nav__overlay" hidden></div>' +
    '<aside class="ml-page-nav" id="ml-course-sidebar" aria-label="\u041d\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u044f \u043f\u043e \u043a\u0443\u0440\u0441\u0443">' +
    '<div class="ml-page-nav__toolbar">' +
    '<div class="ml-page-nav__toolbar-meta">' +
    '<span class="ml-page-nav__current-kicker">' +
    escapeHtml(currentPage.sectionLabel) +
    " \u00b7 " +
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
    '<div class="ml-page-nav__toolbar-actions-inline">' +
    '<button class="ml-page-nav__collapse" type="button" aria-label="\u0421\u0432\u0435\u0440\u043d\u0443\u0442\u044c \u0431\u043e\u043a\u043e\u0432\u043e\u0435 \u043c\u0435\u043d\u044e">\u00ab</button>' +
    '<button class="ml-page-nav__close" type="button" aria-label="\u0417\u0430\u043a\u0440\u044b\u0442\u044c \u043c\u0435\u043d\u044e">\u00d7</button>' +
    "</div>" +
    "</div>" +
    '<div class="ml-page-nav__panel">' +
    '<div class="ml-page-nav__course-meta">' +
    '<span class="ml-page-nav__course-kicker">\u0412\u0435\u0441\u044c \u043a\u0443\u0440\u0441</span>' +
    '<strong class="ml-page-nav__course-title">' +
    pages.length +
    " \u0442\u0435\u043c \u0432 \u043e\u0434\u043d\u043e\u043c \u043a\u043e\u043d\u0441\u043f\u0435\u043a\u0442\u0435" +
    "</strong>" +
    '<span class="ml-page-nav__course-subtitle ml-page-nav__progress-text"></span>' +
    '<div class="ml-page-nav__progress"><span></span></div>' +
    '<div class="ml-page-nav__utility-row">' +
    '<button class="ml-page-nav__visit-toggle" type="button"></button>' +
    "</div>" +
    "</div>" +
    '<div class="ml-page-nav__actions">' +
    buildInlineAction(previousPage, "\u2190 \u041d\u0430\u0437\u0430\u0434", "ml-page-nav__action-link") +
    '<a class="ml-page-nav__action-link" href="' +
    indexHref +
    '">\u0413\u043b\u0430\u0432\u043d\u0430\u044f</a>' +
    buildInlineAction(nextPage, "\u0414\u0430\u043b\u0435\u0435 \u2192", "ml-page-nav__action-link") +
    "</div>" +
    '<div class="ml-page-nav__sections">' +
    sections.map(function (section) { return buildSectionMarkup(section, initialVisitedSet); }).join("") +
    "</div>" +
    "</div>" +
    "</aside>";

  document.body.insertBefore(navShell, document.body.firstChild);

  var pageContainer = document.querySelector(".page");

  var detachedLessonContentSelector = [
    "main",
    "section",
    "article",
    "aside",
    "header",
    "footer",
    ".hero",
    ".card",
    ".grid-2",
    ".grid-3",
    ".formula",
    ".formula-anatomy",
    ".intuition",
    ".info",
    ".warn",
    ".success",
    ".step",
    ".concept-walkthrough",
    ".classic-theory-note",
    ".classic-viz-note",
    ".ml-practice-section",
    ".ml-theory-section",
    ".ml-explainer-section",
    ".ml-advanced-section",
    ".ml-endcap-section",
    ".ml-study-header",
    ".ml-formula-explainer"
  ].join(", ");

  function isDetachedLessonContent(element) {
    if (!element || element === pageContainer || element === navShell) {
      return false;
    }

    if (element.matches("script, style, link, template, noscript")) {
      return false;
    }

    if (
      element.classList.contains("ml-page-nav-shell") ||
      element.classList.contains("ml-page-pager")
    ) {
      return false;
    }

    return element.matches(detachedLessonContentSelector);
  }

  function normalizeDetachedLessonContent() {
    if (!pageContainer) {
      return;
    }

    Array.prototype.slice.call(document.body.children).forEach(function (element) {
      if (isDetachedLessonContent(element)) {
        pageContainer.appendChild(element);
      }
    });
  }

  var bottomNav = document.createElement("nav");
  bottomNav.className = "ml-page-pager";
  bottomNav.setAttribute("aria-label", "\u041f\u0435\u0440\u0435\u0445\u043e\u0434 \u043c\u0435\u0436\u0434\u0443 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0430\u043c\u0438");
  bottomNav.innerHTML =
    buildPagerCard(previousPage, "\u2190 \u041f\u0440\u0435\u0434\u044b\u0434\u0443\u0449\u0430\u044f \u0442\u0435\u043c\u0430", "is-previous", "\u041d\u0435\u0442 \u043f\u0440\u0435\u0434\u044b\u0434\u0443\u0449\u0435\u0439 \u0442\u0435\u043c\u044b") +
    '<a class="ml-page-pager__card is-home" href="' +
    indexHref +
    '">' +
    '<span class="ml-page-pager__kicker">\u041e\u0433\u043b\u0430\u0432\u043b\u0435\u043d\u0438\u0435</span>' +
    '<strong class="ml-page-pager__title">\u0412\u0435\u0440\u043d\u0443\u0442\u044c\u0441\u044f \u043d\u0430 \u0433\u043b\u0430\u0432\u043d\u0443\u044e</strong>' +
    "</a>" +
    buildPagerCard(nextPage, "\u0421\u043b\u0435\u0434\u0443\u044e\u0449\u0430\u044f \u0442\u0435\u043c\u0430 \u2192", "is-next", "\u041f\u043e\u0441\u043b\u0435\u0434\u043d\u044f\u044f \u0442\u0435\u043c\u0430 \u0431\u043b\u043e\u043a\u0430");

  function placeBottomPager() {
    if (pageContainer) {
      normalizeDetachedLessonContent();
      if (pageContainer.lastElementChild !== bottomNav) {
        pageContainer.appendChild(bottomNav);
      }
      return;
    }

    if (document.body.lastElementChild !== bottomNav) {
      document.body.appendChild(bottomNav);
    }
  }

  placeBottomPager();
  window.addEventListener("load", placeBottomPager);

  function readSelfRatings() {
    try {
      var parsed = JSON.parse(localStorage.getItem("ml_notes_self_rating") || "{}");
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch (error) {
      return {};
    }
  }

  function writeSelfRatings(ratings) {
    localStorage.setItem("ml_notes_self_rating", JSON.stringify(ratings || {}));
    window.dispatchEvent(new CustomEvent("ml-notes-self-rating-changed", { detail: { ratings: ratings || {} } }));
  }

  function initSelfRatings() {
    var widgets = Array.prototype.slice.call(document.querySelectorAll(".ml-self-rating[data-topic-id]"));
    if (!widgets.length) {
      return;
    }

    var ratings = readSelfRatings();

    widgets.forEach(function (widget) {
      // initSelfRatings runs more than once; a second set of handlers would undo every click.
      if (widget.getAttribute("data-rating-ready") === "1") {
        return;
      }
      widget.setAttribute("data-rating-ready", "1");

      var topicId = widget.getAttribute("data-topic-id");
      var buttons = Array.prototype.slice.call(widget.querySelectorAll("button[data-rating]"));
      var status = widget.querySelector("[data-rating-status]");

      function render(value) {
        buttons.forEach(function (button) {
          button.classList.toggle("is-active", String(value || "") === button.getAttribute("data-rating"));
        });
        if (status) {
          status.textContent = value
            ? "\u0422\u0435\u043a\u0443\u0449\u0430\u044f \u043e\u0446\u0435\u043d\u043a\u0430: " + value + "/5"
            : "\u041f\u043e\u043a\u0430 \u0431\u0435\u0437 \u043e\u0446\u0435\u043d\u043a\u0438";
        }
      }

      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          var nextValue = Number(button.getAttribute("data-rating"));
          ratings = readSelfRatings();
          if (ratings[topicId] === nextValue) {
            delete ratings[topicId];
            render(null);
          } else {
            ratings[topicId] = nextValue;
            render(nextValue);
          }
          writeSelfRatings(ratings);
        });
      });

      render(ratings[topicId]);
    });
  }

  var mobileToggle = navShell.querySelector(".ml-page-nav__mobile-toggle");
  var overlay = navShell.querySelector(".ml-page-nav__overlay");
  var closeButton = navShell.querySelector(".ml-page-nav__close");
  var collapseButton = navShell.querySelector(".ml-page-nav__collapse");
  var progressText = navShell.querySelector(".ml-page-nav__progress-text");
  var progressBar = navShell.querySelector(".ml-page-nav__progress span");
  var visitToggleButton = navShell.querySelector(".ml-page-nav__visit-toggle");
  var sectionNodes = Array.prototype.slice.call(navShell.querySelectorAll(".ml-page-nav__section"));

  function syncSidebarState() {
    var isDesktop = desktopQuery.matches;

    navShell.classList.toggle("is-open", !isDesktop && mobileOpen);
    navShell.classList.toggle("is-desktop-collapsed", isDesktop && desktopCollapsed);
    document.body.classList.toggle("ml-sidebar-open", !isDesktop && mobileOpen);
    document.body.classList.toggle("ml-sidebar-collapsed", isDesktop && desktopCollapsed);

    overlay.hidden = !(!isDesktop && mobileOpen);
    mobileToggle.setAttribute("aria-expanded", !isDesktop && mobileOpen ? "true" : "false");
    collapseButton.textContent = isDesktop && desktopCollapsed ? "\u00bb" : "\u00ab";
    collapseButton.setAttribute(
      "aria-label",
      isDesktop && desktopCollapsed
        ? "\u0420\u0430\u0437\u0432\u0435\u0440\u043d\u0443\u0442\u044c \u0431\u043e\u043a\u043e\u0432\u043e\u0435 \u043c\u0435\u043d\u044e"
        : "\u0421\u0432\u0435\u0440\u043d\u0443\u0442\u044c \u0431\u043e\u043a\u043e\u0432\u043e\u0435 \u043c\u0435\u043d\u044e"
    );
  }

  function refreshVisitedUi(paths) {
    var visitedSet = {};
    paths.forEach(function (path) {
      visitedSet[path] = true;
    });

    Array.prototype.slice.call(navShell.querySelectorAll(".ml-page-nav__link")).forEach(function (link) {
      var path = link.getAttribute("data-path");
      var check = link.querySelector(".ml-page-nav__link-check");
      if (!check) {
        return;
      }
      check.classList.toggle("is-visible", !!visitedSet[path]);
    });

    var visitedCount = paths.length;
    var progressPercent = pages.length ? Math.round((visitedCount / pages.length) * 100) : 0;
    var currentVisited = !!visitedSet[currentPage.path];

    progressText.textContent =
      "\u0418\u0437\u0443\u0447\u0435\u043d\u043e: " + visitedCount + " \u0438\u0437 " + pages.length + " \u00b7 " + progressPercent + "%";
    progressBar.style.width = progressPercent + "%";
    visitToggleButton.textContent = currentVisited
      ? "\u0421\u043d\u044f\u0442\u044c \u0433\u0430\u043b\u043e\u0447\u043a\u0443 \u0441 \u0442\u0435\u043a\u0443\u0449\u0435\u0439 \u0442\u0435\u043c\u044b"
      : "\u041e\u0442\u043c\u0435\u0442\u0438\u0442\u044c \u0442\u0435\u043a\u0443\u0449\u0443\u044e \u0442\u0435\u043c\u0443 \u043a\u0430\u043a \u043f\u0440\u043e\u0439\u0434\u0435\u043d\u043d\u0443\u044e";
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
    if (desktopQuery.matches) {
      desktopCollapsed = !desktopCollapsed;
      writeCollapsedState(desktopCollapsed);
      syncSidebarState();
      return;
    }

    mobileOpen = !mobileOpen;
    syncSidebarState();
  });

  closeButton.addEventListener("click", function () {
    mobileOpen = false;
    syncSidebarState();
  });

  collapseButton.addEventListener("click", function () {
    desktopCollapsed = !desktopCollapsed;
    writeCollapsedState(desktopCollapsed);
    syncSidebarState();
  });

  overlay.addEventListener("click", function () {
    mobileOpen = false;
    syncSidebarState();
  });

  visitToggleButton.addEventListener("click", function () {
    var currentlyVisited = !!navShell.querySelector('.ml-page-nav__link[data-path="' + currentPage.path + '"] .ml-page-nav__link-check.is-visible');
    var updated = setVisited(currentPage.path, !currentlyVisited);
    refreshVisitedUi(updated);
  });

  navShell.addEventListener("click", function (event) {
    var target = event.target;
    if (!target || !target.closest) {
      return;
    }

    if (target.closest(".ml-page-nav__link") && !desktopQuery.matches) {
      mobileOpen = false;
      syncSidebarState();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      mobileOpen = false;
      syncSidebarState();
    }
  });

  desktopQuery.addEventListener("change", function () {
    if (desktopQuery.matches) {
      mobileOpen = false;
    }
    syncSidebarState();
  });

  window.addEventListener("ml-notes-progress-changed", function (event) {
    var paths = event && event.detail && Array.isArray(event.detail.visitedPaths)
      ? event.detail.visitedPaths
      : readVisitedPaths();
    refreshVisitedUi(paths);
  });

  applyFilter("");
  refreshVisitedUi(readVisitedPaths());
  syncSidebarState();
  initSelfRatings();

  var hasMathCandidates = Array.prototype.some.call(
    document.querySelectorAll(".formula, .inline-math, [data-render-tex]"),
    function (element) {
      return !element.hasAttribute("data-no-tex");
    }
  );

  // Inline \( ... \) math in ordinary text also needs KaTeX.
  if (!hasMathCandidates && (pageContainer || document.body).textContent.indexOf("\\(") !== -1) {
    hasMathCandidates = true;
  }

  var hasFormulaExplainCandidates = document.querySelector(".formula, .fm, .inline-math, [data-render-tex]");

  var hasCodeCandidates = Array.prototype.some.call(
    document.querySelectorAll("pre code, .formula[data-code-block], .formula"),
    function (element) {
      var text = String(element.textContent || "").trim();
      if (!text) {
        return false;
      }
      return /(import\s+\w+|from\s+\w+\s+import|def\s+\w+\(|class\s+\w+|function\s+\w+\(|const\s+|let\s+|=>|#!\/bin\/bash|echo\s+|torch\.|np\.|numpy|console\.log)/im.test(text);
    }
  );

  if (currentPage.sectionId === "classic-ml") {
    ensureScript("shared-classic-ml-practice.js", "data-ml-practice-script", placeBottomPager);
  }

  ensureScript("shared-theory-notes.js", "data-ml-theory-script", placeBottomPager);

  if (currentPage.sectionId !== "math") {
    ensureScript("shared-explainer-notes.js", "data-ml-explainer-script", placeBottomPager);
  }

  ensureScript("shared-advanced-notes.js", "data-ml-advanced-script", placeBottomPager);

  ensureScript("shared-interactive-guides.js", "data-ml-interactive-guides-script", placeBottomPager);

  if (hasFormulaExplainCandidates) {
    ensureScript("shared-formula-explainers.js", "data-ml-formula-explainer-script", placeBottomPager);
  }

  if (hasMathCandidates) {
    ensureScript("shared-katex.js", "data-ml-katex-script", placeBottomPager);
  }

  if (hasCodeCandidates) {
    ensureScript("shared-code-highlight.js", "data-ml-code-highlight-script", placeBottomPager);
  }
})();

// END shared-nav.js

// BEGIN shared-prevnext.js
/**
 * shared-prevnext.js
 * Injects prev/next navigation + section progress bar into every page.
 * Auto-initialises when DOM is ready.
 *
 * Page order and titles come from course-manifest.js.
 */
(function () {
  'use strict';

  if (window.__mlNotesPrevNextInitialized) return;
  window.__mlNotesPrevNextInitialized = true;

  // Flatten course-manifest.js into [pagerTitle, path, title] entries.
  var PAGES = [];
  ((window.__mlNotesCourse && window.__mlNotesCourse.sections) || []).forEach(function (section) {
    section.pages.forEach(function (page) {
      PAGES.push([section.pagerTitle, page.path, page.title]);
    });
  });

  /** Relative URL from one page to another (both in section/page.html format). */
  function relUrl(fromPath, toPath) {
    var fromDir = fromPath.split('/')[0];
    var toDir   = toPath.split('/')[0];
    var toFile  = toPath.split('/')[1];
    return (fromDir === toDir) ? toFile : ('../' + toDir + '/' + toFile);
  }

  /** Detect which page we're on by matching pathname to PAGES entries. */
  function detectCurrent() {
    var pn = window.location.pathname.replace(/\\/g, '/');
    for (var i = 0; i < PAGES.length; i++) {
      var rel  = PAGES[i][1];
      var dir  = rel.split('/')[0];
      var file = rel.split('/')[1];
      if (pn.indexOf('/' + dir + '/' + file) !== -1) return i;
    }
    return -1;
  }

  function init() {
    var cur = detectCurrent();
    if (cur === -1) return;

    var section = PAGES[cur][0];
    var fromPath = PAGES[cur][1];

    // Section bounds
    var sStart = cur, sEnd = cur;
    while (sStart > 0 && PAGES[sStart - 1][0] === section) sStart--;
    while (sEnd < PAGES.length - 1 && PAGES[sEnd + 1][0] === section) sEnd++;
    var posInSection  = cur - sStart + 1;
    var sectionTotal  = sEnd - sStart + 1;
    var pct = Math.round(posInSection / sectionTotal * 100);

    var prevEntry = cur > 0 ? PAGES[cur - 1] : null;
    var nextEntry = cur < PAGES.length - 1 ? PAGES[cur + 1] : null;

    function makeBtn(entry, isPrev) {
      var cls = 'ml-prevnext__btn ml-prevnext__btn--' + (isPrev ? 'prev' : 'next');
      var lbl = isPrev ? '← Назад' : 'Вперёд →'; // ← Назад / Вперёд →
      var titleEl = '<span class="ml-prevnext__title">' + (entry ? entry[2] : '') + '</span>';
      var labelEl = '<span class="ml-prevnext__label">' + lbl + '</span>';
      var inner   = isPrev ? (labelEl + titleEl) : (titleEl + labelEl);

      if (!entry) {
        return '<span class="' + cls + ' ml-prevnext__btn--ghost">' + inner + '</span>';
      }
      var href = relUrl(fromPath, entry[1]);
      return '<a href="' + href + '" class="' + cls + '">' + inner + '</a>';
    }

    var html = '<nav class="ml-prevnext" aria-label="Навигация по курсу">'
      + makeBtn(prevEntry, true)
      + '<div class="ml-prevnext__progress">'
      +   '<span class="ml-prevnext__pos">' + posInSection + ' / ' + sectionTotal + '</span>'
      +   '<div class="ml-prevnext__bar"><div class="ml-prevnext__fill" style="width:' + pct + '%"></div></div>'
      +   '<span class="ml-prevnext__section">' + section + '</span>'
      + '</div>'
      + makeBtn(nextEntry, false)
      + '</nav>';

    var nav = document.createElement('div');
    nav.innerHTML = html;
    document.body.appendChild(nav.firstChild);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

// END shared-prevnext.js

// BEGIN shared-walkthrough.js
/**
 * shared-walkthrough.js
 * Powers .ml-walkthrough step-by-step algorithm components.
 * No dependencies. Auto-initialises on DOMContentLoaded.
 *
 * Markup contract:
 *   .ml-walkthrough              — root container
 *     .ml-walkthrough__step      — one step (hidden by default)
 *     .wt-active                 — active step class (added by JS)
 *     [data-wt-prev]             — Prev button
 *     [data-wt-next]             — Next button
 *     [data-wt-cur]              — current step number text node
 *     [data-wt-tot]              — total steps text node
 *     .ml-walkthrough__progress-bar — CSS progress bar
 */
(function () {
  'use strict';

  if (window.__mlNotesWalkthroughInitialized) return;
  window.__mlNotesWalkthroughInitialized = true;

  function initOne(root) {
    var steps    = root.querySelectorAll('.ml-walkthrough__step');
    var btnPrev  = root.querySelector('[data-wt-prev]');
    var btnNext  = root.querySelector('[data-wt-next]');
    var spanCur  = root.querySelector('[data-wt-cur]');
    var spanTot  = root.querySelector('[data-wt-tot]');
    var bar      = root.querySelector('.ml-walkthrough__progress-bar');
    var total    = steps.length;
    var current  = 0;

    if (!total) return;
    if (spanTot) spanTot.textContent = total;

    function show(idx) {
      // Bounds
      idx = Math.max(0, Math.min(idx, total - 1));
      // Swap active class
      steps[current].classList.remove('wt-active');
      current = idx;
      steps[current].classList.add('wt-active');
      // Update counter
      if (spanCur) spanCur.textContent = current + 1;
      // Update progress bar
      if (bar) bar.style.width = ((current + 1) / total * 100) + '%';
      // Update button states
      if (btnPrev) btnPrev.disabled = current === 0;
      if (btnNext) btnNext.disabled = current === total - 1;
    }

    // Initialise first step
    show(0);

    if (btnPrev) btnPrev.addEventListener('click', function () {
      root.dataset.wtDir = 'prev';
      show(current - 1);
    });
    if (btnNext) btnNext.addEventListener('click', function () {
      root.dataset.wtDir = 'next';
      show(current + 1);
    });

    // Keyboard navigation (←/→) when focus is inside the component
    root.setAttribute('tabindex', '0');
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        root.dataset.wtDir = 'next';
        show(current + 1);
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        root.dataset.wtDir = 'prev';
        show(current - 1);
      }
    });
  }

  function initAll() {
    document.querySelectorAll('.ml-walkthrough').forEach(initOne);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();

// END shared-walkthrough.js

// BEGIN shared-lesson-ui.js
/**
 * shared-lesson-ui.js
 * Small UI helpers that lesson markup calls directly (onclick="...").
 * Part of bundle.js. A page that still defines its own version keeps it.
 */
(function () {
  'use strict';

  // Tabs: <button class="tab-btn" onclick="showTab('panelId', this)"> + <div class="tab-panel" id="panelId">
  if (typeof window.showTab !== 'function') {
    window.showTab = function (id, button) {
      document.querySelectorAll('.tab-panel').forEach(function (node) { node.classList.remove('active'); });
      document.querySelectorAll('.tab-btn').forEach(function (node) { node.classList.remove('active'); });
      document.getElementById(id).classList.add('active');
      button.classList.add('active');
    };
  }
})();

// END shared-lesson-ui.js

// BEGIN shared-a11y.js
/* shared-a11y.js - accessible names for interactive widgets.
 *
 * Many lesson widgets show their label as plain text next to the control
 * ("x₀ = <span>1.00</span>" followed by <input type="range">), which screen readers
 * do not associate with the control. This pass, run on load and for widgets added
 * later, gives every unnamed form control an aria-label taken from that visible text,
 * marks canvases as images labelled by the nearest heading, and names icon-only buttons.
 * It never overrides an existing accessible name.
 */
(function () {
  if (window.__mlNotesA11yInitialized) return;
  window.__mlNotesA11yInitialized = true;

  var VALUE_SELECTOR = '[id$="Val"],[id$="val"],[id$="Value"],[id$="Disp"],[id$="-disp"],.val-display,.ml-slider-lab__param-value,output,input,select,textarea,button,canvas,svg';

  function clean(text) {
    return String(text || "").replace(/\s+/g, " ").replace(/[\s:=≈]+$/, "").trim().slice(0, 90);
  }

  function visibleText(el) {
    var copy = el.cloneNode(true);
    Array.prototype.forEach.call(copy.querySelectorAll(VALUE_SELECTOR), function (x) { x.remove(); });
    return clean(copy.textContent);
  }

  function hasName(el) {
    if (el.getAttribute("aria-label") || el.getAttribute("aria-labelledby") || el.getAttribute("title")) return true;
    if (el.closest("label")) return true;
    if (el.id && document.querySelector('label[for="' + el.id.replace(/"/g, '\\"') + '"]')) return true;
    return false;
  }

  function nameControl(el) {
    if (hasName(el)) return;
    var label = "";
    for (var p = el.previousElementSibling; p && !label; p = p.previousElementSibling) label = visibleText(p);
    for (var par = el.parentElement, k = 0; par && !label && k < 2; par = par.parentElement, k++) label = visibleText(par);
    if (!label && el.placeholder) label = clean(el.placeholder);
    if (label) { el.setAttribute("aria-label", label); el.setAttribute("data-a11y-auto", ""); }
  }

  function nameCanvas(canvas) {
    if (canvas.getAttribute("aria-label") || canvas.getAttribute("aria-labelledby")) return;
    // nearest heading that comes before the canvas, searching outwards through its containers
    var heading = "";
    for (var p = canvas.parentElement; p && !heading; p = p.parentElement) {
      var hs = p.querySelectorAll("h2, h3, .ml-slider-lab__title");
      for (var i = hs.length - 1; i >= 0 && !heading; i--) {
        if (hs[i].compareDocumentPosition(canvas) & Node.DOCUMENT_POSITION_FOLLOWING) heading = clean(hs[i].textContent);
      }
      if (p === document.body) break;
    }
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", heading ? "Интерактивный график: " + heading : "Интерактивный график");
  }

  function nameIconButton(btn) {
    if (hasName(btn) || clean(btn.textContent).replace(/[←→↑↓×✕▶◀‹›«»]/g, "").trim()) return;
    if (btn.hasAttribute("data-wt-prev")) btn.setAttribute("aria-label", "Предыдущий шаг");
    else if (btn.hasAttribute("data-wt-next")) btn.setAttribute("aria-label", "Следующий шаг");
    else if (/←|‹|«|◀/.test(btn.textContent)) btn.setAttribute("aria-label", "Назад");
    else if (/→|›|»|▶/.test(btn.textContent)) btn.setAttribute("aria-label", "Вперёд");
    else if (/×|✕/.test(btn.textContent)) btn.setAttribute("aria-label", "Закрыть");
  }

  function run(root) {
    if (!root || !root.querySelectorAll) return;
    var controls = root.querySelectorAll('input:not([type="hidden"]):not([type="button"]):not([type="submit"]), select, textarea');
    Array.prototype.forEach.call(controls, nameControl);
    // controls that got the same generated name inside one container (matrix cells, etc.) get numbered
    var groups = new Map();
    Array.prototype.forEach.call(controls, function (el) {
      if (!el.hasAttribute("data-a11y-auto")) return;
      var key = (el.parentElement && el.parentElement.parentElement) ? el.parentElement.parentElement : el.parentElement;
      var name = el.getAttribute("data-a11y-base") || el.getAttribute("aria-label");
      if (!groups.has(key)) groups.set(key, {});
      (groups.get(key)[name] = groups.get(key)[name] || []).push(el);
    });
    groups.forEach(function (byName) {
      Object.keys(byName).forEach(function (name) {
        var list = byName[name];
        if (list.length < 2) return;
        list.forEach(function (el, i) { el.setAttribute("data-a11y-base", name); el.setAttribute("aria-label", name + ", ячейка " + (i + 1)); });
      });
    });
    Array.prototype.forEach.call(root.querySelectorAll("canvas"), nameCanvas);
    Array.prototype.forEach.call(root.querySelectorAll("button"), nameIconButton);
  }

  function start() {
    run(document.body);
    var pending = false;
    new MutationObserver(function () {
      if (pending) return;
      pending = true;
      // batch DOM changes from widgets that rebuild their markup
      setTimeout(function () { pending = false; run(document.body); }, 200);
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();

// END shared-a11y.js

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

  var visitedKey = "ml_notes_visited";

  function readVisitedPaths() {
    try {
      var parsed = JSON.parse(window.localStorage.getItem(visitedKey) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function writeVisitedPaths(paths) {
    try {
      window.localStorage.setItem(visitedKey, JSON.stringify(paths));
    } catch (error) {
      // Ignore storage issues.
    }
  }

  function dispatchProgressChanged(paths) {
    window.dispatchEvent(
      new window.CustomEvent("ml-notes-progress-changed", {
        detail: { visitedPaths: paths.slice() }
      })
    );
  }

  function setVisited(path, shouldVisit) {
    var paths = readVisitedPaths().filter(Boolean);
    var index = paths.indexOf(path);

    if (shouldVisit && index === -1) {
      paths.push(path);
    }

    if (!shouldVisit && index !== -1) {
      paths.splice(index, 1);
    }

    writeVisitedPaths(paths);
    dispatchProgressChanged(paths);
    return paths;
  }

  // "1 тема", "3 темы", "5 тем"
  function topicCount(n) {
    var mod10 = n % 10;
    var mod100 = n % 100;
    var word = "тем";
    if (mod10 === 1 && mod100 !== 11) {
      word = "тема";
    } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
      word = "темы";
    }
    return n + " " + word;
  }

  function init() {
    if (!document.body || !document.body.classList.contains("ml-index-theme")) {
      return;
    }

    var courseData = window.__mlNotesCourseData || { sections: [], totalLessons: 0 };
    var sections = Array.prototype.slice.call(document.querySelectorAll(".section"));
    var hero = document.querySelector(".hero");
    // Index sections follow course-manifest.js order: take label and accent from there.
    var manifestSections = Array.isArray(courseData.sections) ? courseData.sections : [];

    sections.forEach(function (section, index) {
      var blockNumber = index + 1;
      var meta = manifestSections[index] || {};
      var head = section.querySelector(".section-head");
      section.classList.add("section--block-" + blockNumber);
      section.dataset.block = String(blockNumber);
      section.style.setProperty("--block-accent", meta.accent || "#7eb8b8");
      if (head) {
        head.dataset.kicker = meta.label || "";
        head.dataset.count = topicCount(section.querySelectorAll(".card").length);
      }

      Array.prototype.slice.call(section.querySelectorAll(".card")).forEach(function (card) {
        var href = card.getAttribute("href");
        if (!href) {
          return;
        }

        card.dataset.lessonCard = href.replace(/^\.\//, "");

        if (!card.querySelector(".index-card-check")) {
          var checkButton = document.createElement("button");
          checkButton.type = "button";
          checkButton.className = "index-card-check";
          checkButton.setAttribute("aria-label", "\u041e\u0442\u043c\u0435\u0442\u0438\u0442\u044c \u0442\u0435\u043c\u0443 \u043a\u0430\u043a \u043f\u0440\u043e\u0439\u0434\u0435\u043d\u043d\u0443\u044e");
          card.appendChild(checkButton);
        }
      });
    });

    var heroTitle = hero && hero.querySelector("h1");
    var heroSubtitle = hero && hero.querySelector(".hero-subtitle");
    var progressCount = hero && hero.querySelector(".hero-progress__count");
    var progressLabel = hero && hero.querySelector(".hero-progress__label");
    var progressBar = hero && hero.querySelector(".hero-progress__bar span");
    var totalLessons = Number(courseData.totalLessons || document.querySelectorAll("[data-lesson-card]").length || 0);

    function initTrackSelector() {
      var root = document.querySelector("[data-track-selector]");
      if (!root) {
        return;
      }

      var tabs = Array.prototype.slice.call(root.querySelectorAll("[data-track-tab]"));
      var panels = Array.prototype.slice.call(root.querySelectorAll("[data-track-panel]"));

      tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
          var key = tab.dataset.trackTab;
          tabs.forEach(function (item) {
            item.classList.toggle("is-active", item === tab);
          });
          panels.forEach(function (panel) {
            panel.classList.toggle("is-active", panel.dataset.trackPanel === key);
          });
        });
      });
    }

    if (heroTitle) {
      heroTitle.textContent = "\u0418\u043d\u0442\u0435\u0440\u0430\u043a\u0442\u0438\u0432\u043d\u044b\u0439 ML\u2011\u043a\u043e\u043d\u0441\u043f\u0435\u043a\u0442";
    }

    if (heroSubtitle) {
      heroSubtitle.textContent =
        totalLessons +
        " \u0442\u0435\u043c \u00b7 \u043e\u0442 \u043c\u0430\u0442\u0435\u043c\u0430\u0442\u0438\u043a\u0438 \u0434\u043e LLM \u0438 generative models \u00b7 \u043a\u043e\u043d\u0441\u043f\u0435\u043a\u0442\u044b, \u043a\u043e\u0434 \u0438 \u0442\u0435\u043e\u0440\u0438\u044f";
    }

    function refreshUi(paths) {
      var visitedSet = {};
      paths.forEach(function (path) {
        visitedSet[path] = true;
      });

      Array.prototype.slice.call(document.querySelectorAll("[data-lesson-card]")).forEach(function (card) {
        var path = card.dataset.lessonCard;
        var isVisited = !!visitedSet[path];
        card.classList.toggle("is-visited", isVisited);

        var button = card.querySelector(".index-card-check");
        if (!button) {
          return;
        }

        button.textContent = isVisited ? "\u2713" : "";
        button.setAttribute(
          "aria-label",
          isVisited
            ? "\u0421\u043d\u044f\u0442\u044c \u043e\u0442\u043c\u0435\u0442\u043a\u0443 \u0441 \u0442\u0435\u043c\u044b"
            : "\u041e\u0442\u043c\u0435\u0442\u0438\u0442\u044c \u0442\u0435\u043c\u0443 \u043a\u0430\u043a \u043f\u0440\u043e\u0439\u0434\u0435\u043d\u043d\u0443\u044e"
        );
      });

      var validVisitedCount = paths.filter(function (path) {
        return !!document.querySelector('[data-lesson-card="' + path + '"]');
      }).length;
      var progressPercent = totalLessons ? Math.round((validVisitedCount / totalLessons) * 100) : 0;

      if (progressCount) {
        progressCount.textContent =
          "\u0418\u0437\u0443\u0447\u0435\u043d\u043e: " + validVisitedCount + " \u0438\u0437 " + totalLessons;
      }

      if (progressLabel) {
        progressLabel.textContent = progressPercent + "% \u043a\u0443\u0440\u0441\u0430";
      }

      if (progressBar) {
        progressBar.style.width = progressPercent + "%";
      }
    }

    var classicMlSection = sections[1];
    var classicGrid = classicMlSection && classicMlSection.querySelector(".grid");
    if (classicGrid && !classicGrid.querySelector(".index-subgroup")) {
      var subgroupMap = {
        "2.1": "\u0411\u0430\u0437\u043e\u0432\u044b\u0435 \u043c\u043e\u0434\u0435\u043b\u0438",
        "2.6": "\u041c\u0435\u0442\u0440\u0438\u043a\u0438",
        "2.8": "\u041f\u0440\u043e\u0434\u0432\u0438\u043d\u0443\u0442\u044b\u0435 \u043c\u043e\u0434\u0435\u043b\u0438",
        "2.17": "\u041f\u0440\u0430\u043a\u0442\u0438\u043a\u0430"
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

    document.addEventListener("click", function (event) {
      var button = event.target && event.target.closest ? event.target.closest(".index-card-check") : null;
      if (!button) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      var card = button.closest("[data-lesson-card]");
      if (!card) {
        return;
      }

      var path = card.dataset.lessonCard;
      var shouldVisit = !card.classList.contains("is-visited");
      var updatedPaths = setVisited(path, shouldVisit);
      refreshUi(updatedPaths);
    });

    window.addEventListener("ml-notes-progress-changed", function (event) {
      var paths = event && event.detail && Array.isArray(event.detail.visitedPaths)
        ? event.detail.visitedPaths
        : readVisitedPaths();
      refreshUi(paths);
    });

    initTrackSelector();
    refreshUi(readVisitedPaths());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();

// END shared-index.js