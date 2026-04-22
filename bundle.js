// BEGIN shared-nav.js
(function () {
  if (window.__mlNotesNavInitialized) {
    return;
  }
  window.__mlNotesNavInitialized = true;

  var sections = [
    {
      id: "math",
      label: "\u0411\u043b\u043e\u043a 1",
      title: "\u041c\u0430\u0442\u0435\u043c\u0430\u0442\u0438\u043a\u0430",
      pages: [
        { path: "01_math/01_linear_algebra.html", label: "1.1 \u041b\u0438\u043d\u0435\u0439\u043d\u0430\u044f \u0430\u043b\u0433\u0435\u0431\u0440\u0430" },
        { path: "01_math/02_calculus.html", label: "1.2 \u041c\u0430\u0442\u0430\u043d\u0430\u043b\u0438\u0437" },
        { path: "01_math/03_probability_theory.html", label: "1.3 \u0422\u0435\u043e\u0440\u0438\u044f \u0432\u0435\u0440\u043e\u044f\u0442\u043d\u043e\u0441\u0442\u0435\u0439" },
        { path: "01_math/04_information_theory.html", label: "1.4 \u0422\u0435\u043e\u0440\u0438\u044f \u0438\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u0438" },
        { path: "01_math/05_optimization_theory.html", label: "1.5 Optimization Theory" }
      ]
    },
    {
      id: "classic-ml",
      label: "\u0411\u043b\u043e\u043a 2",
      title: "\u041a\u043b\u0430\u0441\u0441\u0438\u0447\u0435\u0441\u043a\u043e\u0435 ML",
      pages: [
        { path: "02_classic_ml/01_intro_to_classical_ml.html", label: "2.1 \u041a\u043b\u0430\u0441\u0441\u0438\u0447\u0435\u0441\u043a\u043e\u0435 ML" },
        { path: "02_classic_ml/02_data_preprocessing.html", label: "2.2 \u041f\u0440\u0435\u0434\u043e\u0431\u0440\u0430\u0431\u043e\u0442\u043a\u0430" },
        { path: "02_classic_ml/03_linear_regression.html", label: "2.3 \u041b\u0438\u043d\u0435\u0439\u043d\u0430\u044f \u0440\u0435\u0433\u0440\u0435\u0441\u0441\u0438\u044f" },
        { path: "02_classic_ml/04_linear_model_regularization.html", label: "2.4 \u0420\u0435\u0433\u0443\u043b\u044f\u0440\u0438\u0437\u0430\u0446\u0438\u044f" },
        { path: "02_classic_ml/05_logistic_regression.html", label: "2.5 \u041b\u043e\u0433\u0438\u0441\u0442\u0438\u0447\u0435\u0441\u043a\u0430\u044f \u0440\u0435\u0433\u0440\u0435\u0441\u0441\u0438\u044f" },
        { path: "02_classic_ml/06_regression_metrics.html", label: "2.6 \u041c\u0435\u0442\u0440\u0438\u043a\u0438 \u0440\u0435\u0433\u0440\u0435\u0441\u0441\u0438\u0438" },
        { path: "02_classic_ml/07_classification_metrics.html", label: "2.7 \u041c\u0435\u0442\u0440\u0438\u043a\u0438 \u043a\u043b\u0430\u0441\u0441\u0438\u0444\u0438\u043a\u0430\u0446\u0438\u0438" },
        { path: "02_classic_ml/08_distance_based_models.html", label: "2.8 k-NN / Distance" },
        { path: "02_classic_ml/09_naive_bayes.html", label: "2.9 Naive Bayes" },
        { path: "02_classic_ml/10_decision_trees.html", label: "2.10 Decision Trees" },
        { path: "02_classic_ml/11_bagging_random_forest.html", label: "2.11 Random Forest" },
        { path: "02_classic_ml/12_boosting.html", label: "2.12 Boosting" },
        { path: "02_classic_ml/12a_gradient_boosting_theory.html", label: "2.12a GB Theory" },
        { path: "02_classic_ml/12b_gradient_boosting_in_practice.html", label: "2.12b GBDT Practice" },
        { path: "02_classic_ml/13_support_vector_machines.html", label: "2.13 SVM" },
        { path: "02_classic_ml/13a_kernel_methods_deeper.html", label: "2.13a Kernels" },
        { path: "02_classic_ml/14_clustering.html", label: "2.14 \u041a\u043b\u0430\u0441\u0442\u0435\u0440\u0438\u0437\u0430\u0446\u0438\u044f" },
        { path: "02_classic_ml/14a_gaussian_mixtures_em.html", label: "2.14a GMM / EM" },
        { path: "02_classic_ml/15_dimensionality_reduction.html", label: "2.15 \u0421\u043d\u0438\u0436\u0435\u043d\u0438\u0435 \u0440\u0430\u0437\u043c\u0435\u0440\u043d\u043e\u0441\u0442\u0438" },
        { path: "02_classic_ml/15a_kernel_pca_ica_autoencoders.html", label: "2.15a KPCA / ICA" },
        { path: "02_classic_ml/16_ensembles.html", label: "2.16 \u0410\u043d\u0441\u0430\u043c\u0431\u043b\u0438" },
        { path: "02_classic_ml/17_validation_and_hyperparameter_tuning.html", label: "2.17 \u0412\u0430\u043b\u0438\u0434\u0430\u0446\u0438\u044f / HPO" },
        { path: "02_classic_ml/18_imbalanced_classes.html", label: "2.18 \u041d\u0435\u0441\u0431\u0430\u043b\u0430\u043d\u0441\u0438\u0440\u043e\u0432\u0430\u043d\u043d\u044b\u0435 \u043a\u043b\u0430\u0441\u0441\u044b" },
        { path: "02_classic_ml/19_model_interpretation.html", label: "2.19 \u0418\u043d\u0442\u0435\u0440\u043f\u0440\u0435\u0442\u0430\u0446\u0438\u044f" },
        { path: "02_classic_ml/20_practical_pipeline.html", label: "2.20 \u041f\u0440\u0430\u043a\u0442\u0438\u0447\u0435\u0441\u043a\u0438\u0439 pipeline" },
        { path: "02_classic_ml/21_anomaly_detection.html", label: "2.21 Anomaly Detection" },
        { path: "02_classic_ml/22_time_series_fundamentals.html", label: "2.22 Time Series" }
      ]
    },
    {
      id: "neural-basics",
      label: "\u0411\u043b\u043e\u043a 3",
      title: "\u0411\u0430\u0437\u0430 \u043d\u0435\u0439\u0440\u043e\u0441\u0435\u0442\u0435\u0439",
      pages: [
        { path: "03_neural_basics/01_perceptron_and_neuron.html", label: "3.1 \u041d\u0435\u0439\u0440\u043e\u043d" },
        { path: "03_neural_basics/02_activation_functions.html", label: "3.2 \u0410\u043a\u0442\u0438\u0432\u0430\u0446\u0438\u0438" },
        { path: "03_neural_basics/03_forward_pass.html", label: "3.3 Forward pass" },
        { path: "03_neural_basics/04_loss_functions.html", label: "3.4 Loss" }
      ]
    },
    {
      id: "training",
      label: "\u0411\u043b\u043e\u043a 4",
      title: "\u041e\u0431\u0443\u0447\u0435\u043d\u0438\u0435",
      pages: [
        { path: "04_training/01_backpropagation.html", label: "4.1 Backprop" },
        { path: "04_training/02_optimizers.html", label: "4.2 \u041e\u043f\u0442\u0438\u043c\u0438\u0437\u0430\u0442\u043e\u0440\u044b" },
        { path: "04_training/03_adam_adamw_lion.html", label: "4.3 Adam / Lion" },
        { path: "04_training/04_regularization.html", label: "4.4 \u0420\u0435\u0433\u0443\u043b\u044f\u0440\u0438\u0437\u0430\u0446\u0438\u044f" },
        { path: "04_training/05_learning_rate_scheduling.html", label: "4.5 LR Scheduling" },
        { path: "04_training/06_gradient_clipping_and_stability.html", label: "4.6 Clipping / Stability" },
        { path: "04_training/07_mixed_precision_training.html", label: "4.7 Mixed Precision" },
        { path: "04_training/08_weight_initialization_deeper.html", label: "4.8 \u0418\u043d\u0438\u0446\u0438\u0430\u043b\u0438\u0437\u0430\u0446\u0438\u044f" },
        { path: "04_training/09_numerical_stability.html", label: "4.9 Numerical Stability" }
      ]
    },
    {
      id: "architectures",
      label: "\u0411\u043b\u043e\u043a 5",
      title: "\u0410\u0440\u0445\u0438\u0442\u0435\u043a\u0442\u0443\u0440\u044b",
      pages: [
        { path: "05_architectures/01_cnn_convolutional_networks.html", label: "5.1 CNN" },
        { path: "05_architectures/02_rnn_lstm.html", label: "5.2 RNN / LSTM" },
        { path: "05_architectures/03_transformer_attention.html", label: "5.3 Attention" },
        { path: "05_architectures/04_transformer_architecture.html", label: "5.4 \u0410\u0440\u0445\u0438\u0442\u0435\u043a\u0442\u0443\u0440\u0430" },
        { path: "05_architectures/05_resnet_normalization.html", label: "5.5 ResNet / Norm" },
        { path: "05_architectures/06_positional_encodings.html", label: "5.6 Positional Encodings" },
        { path: "05_architectures/07_efficient_attention.html", label: "5.7 Efficient Attention" },
        { path: "05_architectures/08_vision_transformer.html", label: "5.8 ViT" },
        { path: "05_architectures/09_object_detection.html", label: "5.9 Object Detection" },
        { path: "05_architectures/10_segmentation.html", label: "5.10 Segmentation" },
        { path: "05_architectures/11_contrastive_learning_clip.html", label: "5.11 Contrastive / CLIP" }
      ]
    },
    {
      id: "llm",
      label: "\u0411\u043b\u043e\u043a 6",
      title: "LLM",
      pages: [
        { path: "06_llm/01_tokenization_bpe.html", label: "6.1 Tokenization / BPE" },
        { path: "06_llm/02_pretraining_objectives.html", label: "6.2 Pre-training" },
        { path: "06_llm/03_instruction_tuning.html", label: "6.3 Instruction tuning" },
        { path: "06_llm/04_rlhf.html", label: "6.4 RLHF" },
        { path: "06_llm/05_lora_qlora.html", label: "6.5 LoRA / QLoRA" },
        { path: "06_llm/06_scaling_laws.html", label: "6.6 Scaling laws" },
        { path: "06_llm/07_kv_cache_inference_optimization.html", label: "6.7 KV-Cache / Inference" },
        { path: "06_llm/08_dpo_alignment_alternatives.html", label: "6.8 DPO / Alignment" },
        { path: "06_llm/09_retrieval_augmented_generation.html", label: "6.9 RAG" }
      ]
    },
    {
      id: "generative",
      label: "\u0411\u043b\u043e\u043a 7",
      title: "Generative Models",
      pages: [
        { path: "07_generative_models/01_variational_autoencoders.html", label: "7.1 VAE" },
        { path: "07_generative_models/02_generative_adversarial_networks.html", label: "7.2 GAN" },
        { path: "07_generative_models/03_diffusion_models.html", label: "7.3 Diffusion" },
        { path: "07_generative_models/04_normalizing_flows.html", label: "7.4 Normalizing Flows" },
        { path: "07_generative_models/05_stable_diffusion_deep_dive.html", label: "7.5 Stable Diffusion" }
      ]
    },
    {
      id: "training-practice",
      label: "\u0411\u043b\u043e\u043a 8",
      title: "\u041f\u0440\u0430\u043a\u0442\u0438\u043a\u0430 \u043e\u0431\u0443\u0447\u0435\u043d\u0438\u044f",
      pages: [
        { path: "08_training_practice/01_distributed_training.html", label: "8.1 DDP / FSDP" },
        { path: "08_training_practice/02_gradient_checkpointing.html", label: "8.2 Checkpointing" },
        { path: "08_training_practice/03_profiling_and_performance.html", label: "8.3 Profiling" },
        { path: "08_training_practice/04_debugging_loss_spikes.html", label: "8.4 Loss spikes" }
      ]
    },
    {
      id: "mlops",
      label: "\u0411\u043b\u043e\u043a 9",
      title: "MLOps / Deployment",
      pages: [
        { path: "09_mlops_deployment/01_experiment_tracking.html", label: "9.1 Experiment Tracking" },
        { path: "09_mlops_deployment/02_model_serving.html", label: "9.2 Model Serving" },
        { path: "09_mlops_deployment/03_docker_for_ml.html", label: "9.3 Docker for ML" },
        { path: "09_mlops_deployment/04_ml_system_design_patterns.html", label: "9.4 ML System Design" },
        { path: "09_mlops_deployment/05_interview_prep_system_design.html", label: "9.5 System Design Interview" }
      ]
    },
    {
      id: "job-prep",
      label: "Job Prep",
      title: "\u041f\u043e\u0434\u0433\u043e\u0442\u043e\u0432\u043a\u0430 \u043a \u0441\u043e\u0431\u0435\u0441\u0435\u0434\u043e\u0432\u0430\u043d\u0438\u044f\u043c",
      pages: [
        { path: "job_prep/01_interview_question_bank.html", label: "Interview Question Bank" },
        { path: "job_prep/02_ml_system_design.html", label: "ML System Design Framework" },
        { path: "job_prep/03_resume_portfolio_checklist.html", label: "Resume / Portfolio Checklist" }
      ]
    },
    {
      id: "projects",
      label: "\u0411\u043b\u043e\u043a 10",
      title: "Projects",
      pages: [
        { path: "10_projects/01_neural_net_from_scratch.html", label: "10.1 NN from Scratch" },
        { path: "10_projects/02_finetune_llm_lora.html", label: "10.2 LoRA Fine-tuning" },
        { path: "10_projects/03_end_to_end_cv_pipeline.html", label: "10.3 CV Pipeline" },
        { path: "10_projects/04_rag_application.html", label: "10.4 RAG Application" },
        { path: "10_projects/05_kaggle_competition_walkthrough.html", label: "10.5 Kaggle Walkthrough" }
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
    "training-practice": "#97a9d6",
    mlops: "#6ea5ff",
    "job-prep": "#82d0b6",
    projects: "#8fd17f"
  };

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
        accent: sectionAccentMap[section.id] || "#7eb8b8",
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
  var currentAccent = sectionAccentMap[currentSection.id] || "#7eb8b8";
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

  function getStudyMeta() {
    var sectionMeta = {
      math: {
        time: "90-120 min",
        job: "Medium",
        depth: "Deep",
        tldr: "Mathematics is the language for shapes, gradients, probabilities, and information; without it ML becomes a list of recipes.",
        why: "This topic helps you read formulas, check dimensions, understand algorithm limits, and explain decisions in interviews without memorizing scripts."
      },
      "classic-ml": {
        time: "75-120 min",
        job: "High",
        depth: "Solid",
        tldr: "Classical ML builds core engineering intuition: data, features, metrics, baselines, overfitting, and validation.",
        why: "Most practical ML work starts with problem framing, clean validation, a strong baseline, and the correct metric rather than a large neural model."
      },
      "neural-basics": {
        time: "90-120 min",
        job: "High",
        depth: "Solid",
        tldr: "Neural basics explain how layers transform signals into representations and why nonlinearities make models expressive.",
        why: "This is the bridge to backprop, initialization, activations, losses, and the reasons some networks train stably while others fail."
      },
      training: {
        time: "100-140 min",
        job: "High",
        depth: "Deep",
        tldr: "Training answers the practical question: how parameters move, why optimization breaks, and how to debug it.",
        why: "In real projects, quality is often limited by optimizer choice, learning rate, gradient stability, precision, and loss diagnostics."
      },
      architectures: {
        time: "100-150 min",
        job: "High",
        depth: "Deep",
        tldr: "Architectures show which inductive biases we put into models for images, sequences, and attention-based systems.",
        why: "This topic helps you choose models for data, track tensor shapes, and explain why CNNs, RNNs, and Transformers solve different problems."
      },
      llm: {
        time: "100-150 min",
        job: "High",
        depth: "Deep",
        tldr: "The LLM block connects tokenization, pre-training, alignment, adaptation, inference, and scaling laws.",
        why: "Modern ML roles increasingly require understanding tokenization, fine-tuning, LoRA, RLHF, and limitations of large language models."
      },
      generative: {
        time: "120-160 min",
        job: "Medium",
        depth: "Deep",
        tldr: "Generative models explain how a model learns a data distribution and then samples new objects from it.",
        why: "VAE, GAN, and Diffusion connect probability, optimization, and representation learning, which makes them important for research depth."
      },
      "training-practice": {
        time: "90-130 min",
        job: "High",
        depth: "Solid",
        tldr: "Training practice turns theory into a real pipeline: distributed training, memory tradeoffs, profiling, and debugging.",
        why: "Production ML requires training models under GPU, memory, time, and unstable-data constraints, not just knowing the equations."
      },
      mlops: {
        time: "90-150 min",
        job: "High",
        depth: "Solid",
        tldr: "MLOps connects models to reproducible experiments, deployment, monitoring, and system design decisions.",
        why: "For ML engineer roles, knowing how to train a model is not enough: you must track experiments, serve models, package environments, and reason about production tradeoffs."
      },
      "job-prep": {
        time: "120-180 min",
        job: "High",
        depth: "Solid",
        tldr: "Interview prep converts course knowledge into clear answers, derivations, tradeoffs, and system-design reasoning.",
        why: "A strong ML engineer interview answer is not a definition: it shows assumptions, failure modes, practical tradeoffs, and the ability to explain why the method works."
      },
      projects: {
        time: "4-12 hours",
        job: "High",
        depth: "Deep",
        tldr: "Projects convert isolated notes into portfolio-grade evidence: runnable code, experiments, evaluation, and documented tradeoffs.",
        why: "A project proves that you can turn theory into an end-to-end ML artifact, debug it, evaluate it, and explain engineering decisions under constraints."
      }
    };

    var meta = sectionMeta[currentSection.id] || sectionMeta.math;
    var focus = currentPage.label.replace(/^\d+(?:\.\d+)?[a-z]?\s+/i, "");

    if (/backprop|adam|optimizer|regularization|stability|mixed precision|clipping|initialization/i.test(currentPage.label)) {
      meta = Object.assign({}, meta, { job: "High", depth: "Deep" });
    }

    return Object.assign({}, meta, { focus: focus });
  }

  function buildPrerequisiteMarkup() {
    var prerequisiteItems = [];
    var neuronPage = pages.find(function (page) {
      return page.path === "03_neural_basics/01_perceptron_and_neuron.html";
    });

    if (previousPage) {
      prerequisiteItems.push(
        '<a class="ml-study-header__link" href="' +
        pageHref(previousPage) +
        '">' +
        escapeHtml(previousPage.label) +
        "</a>"
      );
    }

    if (currentSection.id !== "math") {
      prerequisiteItems.push(
        '<a class="ml-study-header__link" href="' +
        pageHref(pages[0]) +
        '">1.1 Linear algebra</a>'
      );
    }

    if (
      neuronPage &&
      (currentSection.id === "training" ||
        currentSection.id === "architectures" ||
        currentSection.id === "llm" ||
        currentSection.id === "generative")
    ) {
      prerequisiteItems.push(
        '<a class="ml-study-header__link" href="' +
        pageHref(neuronPage) +
        '">3.1 Neuron</a>'
      );
    }

    if (!prerequisiteItems.length) {
      return "Course start: school algebra is enough.";
    }

    return prerequisiteItems.join('<span class="ml-study-header__separator">-></span>');
  }

  function buildStudyHeaderMarkup() {
    var meta = getStudyMeta();

    return (
      '<section class="ml-study-header" data-study-header="1" aria-label="Study structure">' +
      '<div class="ml-study-header__top">' +
      '<div>' +
      '<span class="ml-study-header__kicker">Study brief</span>' +
      '<h2 class="ml-study-header__title">' +
      escapeHtml(meta.focus) +
      "</h2>" +
      "</div>" +
      '<div class="ml-study-header__badges">' +
      '<span class="ml-study-header__badge">Time: ' +
      escapeHtml(meta.time) +
      "</span>" +
      '<span class="ml-study-header__badge">Job: ' +
      escapeHtml(meta.job) +
      "</span>" +
      '<span class="ml-study-header__badge">Research: ' +
      escapeHtml(meta.depth) +
      "</span>" +
      "</div>" +
      "</div>" +
      '<p class="ml-study-header__tldr"><strong>TL;DR:</strong> ' +
      escapeHtml(meta.tldr) +
      "</p>" +
      '<div class="ml-study-header__grid">' +
      '<div class="ml-study-header__panel">' +
      '<span class="ml-study-header__label">Prerequisites</span>' +
      '<div class="ml-study-header__links">' +
      buildPrerequisiteMarkup() +
      "</div>" +
      "</div>" +
      '<div class="ml-study-header__panel">' +
      '<span class="ml-study-header__label">Why this matters</span>' +
      '<p>' +
      escapeHtml(meta.why) +
      "</p>" +
      "</div>" +
      "</div>" +
      '<div class="ml-study-header__flow" aria-label="11-step page structure">' +
      "<span>1. TL;DR</span>" +
      "<span>2. Prerequisites</span>" +
      "<span>3. Why this matters</span>" +
      "<span>4. Core theory</span>" +
      "<span>5. Intuition</span>" +
      "<span>6. Code / interactive</span>" +
      "<span>7. Pitfalls</span>" +
      "<span>8. Connections</span>" +
      "<span>9. Exercises</span>" +
      "<span>10. Checkpoint</span>" +
      "<span>11. Go deeper</span>" +
      "</div>" +
      "</section>"
    );
  }

  function insertStudyHeader() {
    if (!pageContainer || pageContainer.querySelector('.ml-study-header[data-study-header="1"]')) {
      return;
    }

    var wrapper = document.createElement("div");
    wrapper.innerHTML = buildStudyHeaderMarkup();
    var studyHeader = wrapper.firstElementChild;
    var hero = pageContainer.querySelector(".hero");

    if (hero && hero.parentNode === pageContainer) {
      hero.insertAdjacentElement("afterend", studyHeader);
      return;
    }

    pageContainer.insertBefore(studyHeader, pageContainer.firstElementChild);
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

  insertStudyHeader();
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

  ensureScript("shared-study-practice.js", "data-ml-study-practice-script", function () {
    initSelfRatings();
    placeBottomPager();
  });

  ensureScript("shared-endcap-notes.js", "data-ml-endcap-script", placeBottomPager);
  ensureScript("shared-interactive-guides.js", "data-ml-interactive-guides-script", placeBottomPager);
  ensureScript("shared-visual-standards.js", "data-ml-visual-standards-script", placeBottomPager);

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

  function readSelfRatings() {
    try {
      var parsed = JSON.parse(window.localStorage.getItem("ml_notes_self_rating") || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (error) {
      return {};
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

  function init() {
    if (!document.body || !document.body.classList.contains("ml-index-theme")) {
      return;
    }

    var courseData = window.__mlNotesCourseData || { sections: [], totalLessons: 0 };
    var sections = Array.prototype.slice.call(document.querySelectorAll(".section"));
    var hero = document.querySelector(".hero");
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
    var progressDashboard = document.querySelector("[data-progress-dashboard]");
    var progressTotal = progressDashboard && progressDashboard.querySelector("[data-progress-total]");
    var progressRevisitCount = progressDashboard && progressDashboard.querySelector("[data-progress-revisit-count]");
    var progressRemaining = progressDashboard && progressDashboard.querySelector("[data-progress-remaining]");
    var progressBlocks = progressDashboard && progressDashboard.querySelector("[data-progress-blocks]");
    var progressRevisit = progressDashboard && progressDashboard.querySelector("[data-progress-revisit]");

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
      heroTitle.textContent = "\u0418\u043d\u0442\u0435\u0440\u0430\u043a\u0442\u0438\u0432\u043d\u044b\u0439 ML-\u043a\u043e\u043d\u0441\u043f\u0435\u043a\u0442";
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

      refreshProgressDashboard(paths);
    }

    function refreshProgressDashboard(paths) {
      if (!progressDashboard || !Array.isArray(courseData.sections)) {
        return;
      }

      var ratings = readSelfRatings();
      var visitedSet = {};
      paths.forEach(function (path) {
        visitedSet[path] = true;
      });

      var ratedGood = 0;
      var revisitItems = [];
      var allPages = [];

      courseData.sections.forEach(function (section) {
        (section.pages || []).forEach(function (page) {
          allPages.push(page);
          var rating = Number(ratings[page.path] || 0);
          if (rating >= 3) {
            ratedGood += 1;
          } else if (rating > 0 && rating < 3) {
            revisitItems.push({ page: page, rating: rating });
          }
        });
      });

      var total = allPages.length || totalLessons || 0;
      var understandingPercent = total ? Math.round((ratedGood / total) * 100) : 0;
      var unratedOrWeak = Math.max(0, total - ratedGood);
      var remainingHours = Math.ceil((unratedOrWeak * 75) / 60);

      if (progressTotal) {
        progressTotal.textContent = understandingPercent + "%";
      }

      if (progressRevisitCount) {
        progressRevisitCount.textContent = String(revisitItems.length);
      }

      if (progressRemaining) {
        progressRemaining.textContent = remainingHours + "h";
      }

      if (progressBlocks) {
        progressBlocks.innerHTML = courseData.sections.map(function (section) {
          var pages = section.pages || [];
          var blockGood = pages.filter(function (page) {
            return Number(ratings[page.path] || 0) >= 3;
          }).length;
          var blockVisited = pages.filter(function (page) {
            return !!visitedSet[page.path];
          }).length;
          var blockPercent = pages.length ? Math.round((blockGood / pages.length) * 100) : 0;
          var title = section.title || section.id || "Block";

          return (
            '<article class="progress-block-card">' +
              "<strong>" + title + "</strong>" +
              '<div class="progress-block-card__bar"><span style="width:' + blockPercent + '%"></span></div>' +
              "<small>" + blockGood + "/" + pages.length + " explainable · " + blockVisited + " visited</small>" +
            "</article>"
          );
        }).join("");
      }

      if (progressRevisit) {
        if (!revisitItems.length) {
          progressRevisit.innerHTML =
            '<article class="revisit-item"><strong>No weak self-ratings yet</strong><small>Rate topics with 1-2 when they need a second pass.</small></article>';
        } else {
          progressRevisit.innerHTML = revisitItems.slice(0, 12).map(function (item) {
            return (
              '<a class="revisit-item" href="' + item.page.path + '">' +
                "<strong>" + item.page.label + "</strong>" +
                "<small>Self-rating: " + item.rating + "/5 · revisit before moving deeper</small>" +
              "</a>"
            );
          }).join("");
        }
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

    window.addEventListener("ml-notes-self-rating-changed", function () {
      refreshUi(readVisitedPaths());
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