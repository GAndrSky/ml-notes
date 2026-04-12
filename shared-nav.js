(function () {
  const sections = [
    {
      id: "math",
      label: "Блок 1",
      title: "Математическая база",
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

  const rootUrl = new URL(
    ".",
    document.currentScript && document.currentScript.src
      ? document.currentScript.src
      : window.location.href
  );
  if (!document.querySelector('link[data-ml-theme-link="1"]')) {
    const themeLink = document.createElement("link");
    themeLink.rel = "stylesheet";
    themeLink.href = new URL("shared-theme.css", rootUrl).href;
    themeLink.dataset.mlThemeLink = "1";
    document.head.appendChild(themeLink);
  }
  document.body.classList.add("ml-course-theme");
  const indexHref = new URL("index.html", rootUrl).href;
  const currentUrl = new URL(window.location.href);
  currentUrl.search = "";
  currentUrl.hash = "";
  const currentHref = currentUrl.href;

  const pages = [];
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
    })
  };

  const currentIndex = pages.findIndex(function (page) {
    return new URL(page.path, rootUrl).href === currentHref;
  });

  if (currentIndex === -1) {
    return;
  }

  const currentPage = pages[currentIndex];
  const currentSection = sections[currentPage.sectionIndex];
  window.__mlNotesCurrentPagePath = currentPage.path;
  const pageHref = function (page) {
    return new URL(page.path, rootUrl).href;
  };
  const hasMathCandidates = Array.from(
    document.querySelectorAll(".formula, .inline-math, [data-render-tex]")
  ).some(function (element) {
    const source = String(
      (element.dataset && element.dataset.texSource) || element.textContent || ""
    )
      .replace(/\s+/g, " ")
      .trim();

    if (!source || source.length < 3) {
      return false;
    }

    if (element.id && /code|snippet|source/i.test(element.id)) {
      return false;
    }

    return !/(import\s+\w+|from\s+\w+\s+import|torch\.|np\.|numpy|function\s*\(|const\s+|let\s+|document\.|addEventListener|ctx\.|return\s+|class\s+\w+)/im.test(
      source
    );
  });
  const hasPythonCodeCandidates = Array.from(
    document.querySelectorAll("pre code, .formula")
  ).some(function (element) {
    const source = String(element.textContent || "")
      .replace(/\s+/g, " ")
      .trim();

    if (!source || source.length < 12) {
      return false;
    }

    if (
      element.classList.contains("language-python") ||
      element.classList.contains("lang-python")
    ) {
      return true;
    }

    return /(import\s+\w+|from\s+\w+\s+import|def\s+\w+\(|class\s+\w+|print\(|for\s+\w+\s+in|torch\.|np\.|numpy|pandas|sklearn)/im.test(
      source
    );
  });
  const openStorageKey = "ml-notes-nav-open";
  const desktopQuery = window.matchMedia("(min-width: 960px)");

  let isOpen = desktopQuery.matches;
  try {
    const saved = window.localStorage.getItem(openStorageKey);
    if (saved !== null) {
      isOpen = saved === "1";
    }
  } catch (error) {
    // Ignore storage issues and keep the responsive default.
  }

  const buildActionLink = function (page, text, className) {
    if (!page) {
      return (
        '<span class="' +
        className +
        ' is-disabled">' +
        text +
        "</span>"
      );
    }

    return (
      '<a class="' +
      className +
      '" href="' +
      pageHref(page) +
      '">' +
      text +
      "</a>"
    );
  };

  const buildSectionMarkup = function (section) {
    const isCurrentSection = section.id === currentSection.id;
    const sectionPages = pages.filter(function (page) {
      return page.sectionId === section.id;
    });

    return (
      '<details class="ml-page-nav__section"' +
      (isCurrentSection ? " open" : "") +
      ' data-section="' +
      section.id +
      '">' +
      '<summary class="ml-page-nav__section-summary">' +
      '<div class="ml-page-nav__section-meta">' +
      '<span class="ml-page-nav__section-kicker">' +
      section.label +
      "</span>" +
      '<strong class="ml-page-nav__section-title">' +
      section.title +
      "</strong>" +
      "</div>" +
      '<span class="ml-page-nav__section-count">' +
      sectionPages.length +
      "</span>" +
      "</summary>" +
      '<div class="ml-page-nav__section-links">' +
      sectionPages
        .map(function (page) {
          const isCurrentPage = page.path === currentPage.path;
          return (
            '<a class="ml-page-nav__link' +
            (isCurrentPage ? " is-current" : "") +
            '" data-label="' +
            page.label.toLowerCase() +
            '" href="' +
            pageHref(page) +
            '">' +
            page.label +
            "</a>"
          );
        })
        .join("") +
      "</div>" +
      "</details>"
    );
  };

  const topNav = document.createElement("nav");
  topNav.className = "ml-page-nav";
  if (isOpen) {
    topNav.classList.add("is-open");
  }
  topNav.setAttribute("aria-label", "Навигация по курсу");
  topNav.innerHTML =
    '<div class="ml-page-nav__toolbar">' +
    '<button class="ml-page-nav__toggle" type="button" aria-expanded="' +
    (isOpen ? "true" : "false") +
    '">' +
    (isOpen ? "Скрыть меню" : "Показать меню") +
    "</button>" +
    '<div class="ml-page-nav__current">' +
    '<span class="ml-page-nav__current-kicker">' +
    currentPage.sectionLabel +
    " • " +
    (currentPage.pageIndexInSection + 1) +
    " / " +
    currentPage.sectionSize +
    "</span>" +
    '<strong class="ml-page-nav__current-title">' +
    currentPage.label +
    "</strong>" +
    "</div>" +
    '<div class="ml-page-nav__toolbar-actions">' +
    buildActionLink(pages[currentIndex - 1], "← Назад", "ml-page-nav__action-link") +
    '<a class="ml-page-nav__action-link" href="' + indexHref + '">Главная</a>' +
    buildActionLink(pages[currentIndex + 1], "Далее →", "ml-page-nav__action-link") +
    "</div>" +
    "</div>" +
    '<div class="ml-page-nav__panel"' +
    (isOpen ? "" : " hidden") +
    ">" +
    '<div class="ml-page-nav__panel-head">' +
    '<div class="ml-page-nav__course-meta">' +
    '<span class="ml-page-nav__course-kicker">Весь курс</span>' +
    '<strong class="ml-page-nav__course-title">' + pages.length + ' темы с единой навигацией</strong>' +
    '<span class="ml-page-nav__course-subtitle">' +
    currentSection.label +
    ": " +
    currentSection.title +
    "</span>" +
    "</div>" +
    '<label class="ml-page-nav__search">' +
    '<span class="ml-page-nav__search-label">Быстрый поиск темы</span>' +
    '<input class="ml-page-nav__search-input" type="search" placeholder="Например: SHAP, Adam, матанализ" autocomplete="off" />' +
    "</label>" +
    "</div>" +
    '<div class="ml-page-nav__sections">' +
    sections.map(buildSectionMarkup).join("") +
    "</div>" +
    "</div>";

  document.body.insertBefore(topNav, document.body.firstChild);

  const bottomNav = document.createElement("nav");
  bottomNav.className = "ml-page-nav ml-page-nav--bottom";
  bottomNav.setAttribute("aria-label", "Переход между страницами");
  bottomNav.innerHTML =
    '<div class="ml-page-nav__pager">' +
    buildActionLink(pages[currentIndex - 1], "← " + (pages[currentIndex - 1] ? pages[currentIndex - 1].label : "Назад"), "ml-page-nav__pager-link") +
    '<a class="ml-page-nav__pager-link" href="' + indexHref + '">К оглавлению</a>' +
    buildActionLink(pages[currentIndex + 1], (pages[currentIndex + 1] ? pages[currentIndex + 1].label : "Далее") + " →", "ml-page-nav__pager-link") +
    "</div>";

  if (currentPage.sectionId === "classic-ml" && !document.querySelector('script[data-ml-practice-script="1"]')) {
    const practiceScript = document.createElement("script");
    practiceScript.src = new URL("shared-classic-ml-practice.js", rootUrl).href;
    practiceScript.async = false;
    practiceScript.dataset.mlPracticeScript = "1";
    document.body.appendChild(practiceScript);
  }

  if (currentPage.sectionId !== "math" && !document.querySelector('script[data-ml-theory-script="1"]')) {
    const theoryScript = document.createElement("script");
    theoryScript.src = new URL("shared-theory-notes.js", rootUrl).href;
    theoryScript.async = false;
    theoryScript.dataset.mlTheoryScript = "1";
    document.body.appendChild(theoryScript);
  }
  if (currentPage.sectionId !== "math" && !document.querySelector('script[data-ml-explainer-script="1"]')) {
    const explainerScript = document.createElement("script");
    explainerScript.src = new URL("shared-explainer-notes.js", rootUrl).href;
    explainerScript.async = false;
    explainerScript.dataset.mlExplainerScript = "1";
    document.body.appendChild(explainerScript);
  }
  if (currentPage.sectionId !== "math" && !document.querySelector('script[data-ml-formula-explainer-script="1"]')) {
    const formulaExplainerScript = document.createElement("script");
    formulaExplainerScript.src = new URL("shared-formula-explainers.js", rootUrl).href;
    formulaExplainerScript.async = false;
    formulaExplainerScript.dataset.mlFormulaExplainerScript = "1";
    document.body.appendChild(formulaExplainerScript);
  }
  if (!document.querySelector('script[data-ml-search-script="1"]')) {
    const searchScript = document.createElement("script");
    searchScript.src = new URL("shared-search.js", rootUrl).href;
    searchScript.async = false;
    searchScript.dataset.mlSearchScript = "1";
    document.body.appendChild(searchScript);
  }
  if (hasMathCandidates && !document.querySelector('script[data-ml-katex-script="1"]')) {
    const katexScript = document.createElement("script");
    katexScript.src = new URL("shared-katex.js", rootUrl).href;
    katexScript.async = false;
    katexScript.dataset.mlKatexScript = "1";
    document.body.appendChild(katexScript);
  }
  if (hasPythonCodeCandidates && !document.querySelector('script[data-ml-code-highlight-script="1"]')) {
    const codeHighlightScript = document.createElement("script");
    codeHighlightScript.src = new URL("shared-code-highlight.js", rootUrl).href;
    codeHighlightScript.async = false;
    codeHighlightScript.dataset.mlCodeHighlightScript = "1";
    document.body.appendChild(codeHighlightScript);
  }

  document.body.appendChild(bottomNav);

  const toggleButton = topNav.querySelector(".ml-page-nav__toggle");
  const panel = topNav.querySelector(".ml-page-nav__panel");
  const searchInput = topNav.querySelector(".ml-page-nav__search-input");
  const sectionsNodes = Array.from(topNav.querySelectorAll(".ml-page-nav__section"));

  const syncOpenState = function () {
    topNav.classList.toggle("is-open", isOpen);
    panel.hidden = !isOpen;
    toggleButton.textContent = isOpen ? "Скрыть меню" : "Показать меню";
    toggleButton.setAttribute("aria-expanded", isOpen ? "true" : "false");

    try {
      window.localStorage.setItem(openStorageKey, isOpen ? "1" : "0");
    } catch (error) {
      // Ignore storage issues.
    }
  };

  const applyFilter = function (value) {
    const query = value.trim().toLowerCase();

    sectionsNodes.forEach(function (sectionNode) {
      const links = Array.from(sectionNode.querySelectorAll(".ml-page-nav__link"));
      let hasVisible = false;

      links.forEach(function (link) {
        const matches = !query || link.dataset.label.indexOf(query) !== -1;
        link.hidden = !matches;
        if (matches) {
          hasVisible = true;
        }
      });

      sectionNode.classList.toggle("is-empty", !hasVisible);
      if (query && hasVisible) {
        sectionNode.open = true;
      } else if (!query) {
        sectionNode.open = sectionNode.dataset.section === currentSection.id;
      }
    });
  };

  toggleButton.addEventListener("click", function () {
    isOpen = !isOpen;
    syncOpenState();
  });

  searchInput.addEventListener("input", function (event) {
    applyFilter(event.target.value);
  });

  desktopQuery.addEventListener("change", function (event) {
    try {
      if (window.localStorage.getItem(openStorageKey) !== null) {
        return;
      }
    } catch (error) {
      // Ignore storage issues and use responsive behavior.
    }

    isOpen = event.matches;
    syncOpenState();
  });

  syncOpenState();
  applyFilter("");
})();
