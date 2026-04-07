(function () {
  const pages = [
    { path: "01_math/01_linear_algebra.html", label: "1.1 Линейная алгебра" },
    { path: "01_math/02_calculus.html", label: "1.2 Матанализ" },
    { path: "01_math/03_probability_theory.html", label: "1.3 Теория вероятностей" },
    { path: "01_math/04_information_theory.html", label: "1.4 Теория информации" },
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
    { path: "02_classic_ml/20_practical_pipeline.html", label: "2.20 Практический pipeline" },
    { path: "03_neural_basics/01_perceptron_and_neuron.html", label: "3.1 Нейрон" },
    { path: "03_neural_basics/02_activation_functions.html", label: "3.2 Активации" },
    { path: "03_neural_basics/03_forward_pass.html", label: "3.3 Forward pass" },
    { path: "03_neural_basics/04_loss_functions.html", label: "3.4 Loss" },
    { path: "04_training/01_backpropagation.html", label: "4.1 Backprop" },
    { path: "04_training/02_optimizers.html", label: "4.2 Оптимизаторы" },
    { path: "04_training/03_adam_adamw_lion.html", label: "4.3 Adam / Lion" },
    { path: "04_training/04_regularization.html", label: "4.4 Регуляризация" },
    { path: "05_architectures/01_cnn_convolutional_networks.html", label: "5.1 CNN" },
    { path: "05_architectures/02_rnn_lstm.html", label: "5.2 RNN / LSTM" },
    { path: "05_architectures/03_transformer_attention.html", label: "5.3 Attention" },
    { path: "05_architectures/04_transformer_architecture.html", label: "5.4 Архитектура" },
    { path: "05_architectures/05_resnet_normalization.html", label: "5.5 ResNet / Norm" }
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
  const currentIndex = pages.findIndex((page) => new URL(page.path, rootUrl).href === currentHref);

  if (currentIndex === -1) {
    return;
  }

  const pageHref = (page) => new URL(page.path, rootUrl).href;

  const buildPagerLink = (page, text) => {
    if (!page) {
      return '<span class="ml-page-nav__pager-link is-disabled">' + text + "</span>";
    }

    return (
      '<a class="ml-page-nav__pager-link" href="' +
      pageHref(page) +
      '">' +
      text +
      ": " +
      page.label +
      "</a>"
    );
  };

  const topNav = document.createElement("nav");
  topNav.className = "ml-page-nav";
  topNav.setAttribute("aria-label", "Навигация по темам");
  topNav.innerHTML =
    '<div class="ml-page-nav__bar">' +
    '<span class="ml-page-nav__label">Навигация по темам</span>' +
    '<a class="ml-page-nav__home" href="' + indexHref + '">На главную</a>' +
    "</div>" +
    '<div class="ml-page-nav__links">' +
    pages
      .map(function (page) {
        const currentClass = new URL(page.path, rootUrl).href === currentHref ? " is-current" : "";
        return (
          '<a class="ml-page-nav__link' +
          currentClass +
          '" href="' +
          pageHref(page) +
          '">' +
          page.label +
          "</a>"
        );
      })
      .join("") +
    "</div>";

  document.body.insertBefore(topNav, document.body.firstChild);

  const bottomNav = document.createElement("nav");
  bottomNav.className = "ml-page-nav ml-page-nav--bottom";
  bottomNav.setAttribute("aria-label", "Переход между страницами");
  bottomNav.innerHTML =
    '<div class="ml-page-nav__pager">' +
    buildPagerLink(pages[currentIndex - 1], "Назад") +
    '<a class="ml-page-nav__pager-link" href="' + indexHref + '">На главную</a>' +
    buildPagerLink(pages[currentIndex + 1], "Далее") +
    "</div>";

  document.body.appendChild(bottomNav);
})();
