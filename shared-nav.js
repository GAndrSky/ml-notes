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
        { path: "02_classic_ml/13_support_vector_machines.html", label: "2.13 SVM" },
        { path: "02_classic_ml/14_clustering.html", label: "2.14 Кластеризация" },
        { path: "02_classic_ml/15_dimensionality_reduction.html", label: "2.15 Снижение размерности" },
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
        { path: "04_training/04_regularization.html", label: "4.4 Регуляризация" }
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
        { path: "05_architectures/05_resnet_normalization.html", label: "5.5 ResNet / Norm" }
      ]
    }
  ];

  const rootUrl = new URL(
    ".",
    document.currentScript && document.currentScript.src
      ? document.currentScript.src
      : window.location.href
  );
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
    '<strong class="ml-page-nav__course-title">37 тем с общим меню из любого файла</strong>' +
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
