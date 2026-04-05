(function () {
  const pages = [
    { file: "block_2_1_perceptron_neuron.html", label: "2.1 Нейрон" },
    { file: "block_2_2_activation_functions.html", label: "2.2 Активации" },
    { file: "block_2_3_forward_pass.html", label: "2.3 Forward pass" },
    { file: "block_2_4_loss_functions.html", label: "2.4 Loss" },
    { file: "block_3_1_backpropagation.html", label: "3.1 Backprop" },
    { file: "block_3_2_optimizers.html", label: "3.2 Оптимизаторы" },
    { file: "block_3_3_adam_adamw_lion.html", label: "3.3 Adam / Lion" },
    { file: "block_3_4_regularization.html", label: "3.4 Регуляризация" },
    { file: "4_1_cnn_convolutional_networks.html", label: "4.1 CNN" },
    { file: "4_2_rnn_lstm.html", label: "4.2 RNN / LSTM" },
    { file: "4_3_transformer_part1_attention.html", label: "4.3 Attention" },
    { file: "4_3_transformer_part2_architecture.html", label: "4.3 Архитектура" },
    { file: "4_4_resnet_norm_v3.html", label: "4.4 ResNet / Norm" }
  ];

  const currentFile = window.location.pathname.split("/").pop();
  const currentIndex = pages.findIndex((page) => page.file === currentFile);

  if (currentIndex === -1) {
    return;
  }

  const buildPagerLink = (page, text) => {
    if (!page) {
      return '<span class="ml-page-nav__pager-link is-disabled">' + text + "</span>";
    }

    return (
      '<a class="ml-page-nav__pager-link" href="' +
      page.file +
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
    '<a class="ml-page-nav__home" href="index.html">На главную</a>' +
    "</div>" +
    '<div class="ml-page-nav__links">' +
    pages
      .map(function (page) {
        const currentClass = page.file === currentFile ? " is-current" : "";
        return (
          '<a class="ml-page-nav__link' +
          currentClass +
          '" href="' +
          page.file +
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
    '<a class="ml-page-nav__pager-link" href="index.html">На главную</a>' +
    buildPagerLink(pages[currentIndex + 1], "Далее") +
    "</div>";

  document.body.appendChild(bottomNav);
})();
