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
