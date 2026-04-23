(function () {
  if (window.__mlNotesInteractiveCoverageInitialized) {
    return;
  }
  window.__mlNotesInteractiveCoverageInitialized = true;

  var pagePath = window.__mlNotesCurrentPagePath || "";
  var pageShell = document.querySelector(".page");
  if (!pageShell || !pagePath || pagePath === "index.html" || pagePath === "course-roadmap.html") {
    return;
  }

  function hasExistingInteractive() {
    return !!pageShell.querySelector(
      "canvas, svg, img, input[type='range'], select, .chart, .plot, .heatmap, .diagram, .graph, .viz, .network, .ml-concept-lab"
    );
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function round(value) {
    return Math.round(value * 10) / 10;
  }

  var DEFINITIONS = {
    "05_architectures/09_object_detection.html": {
      title: "Мини-интерактив: confidence vs NMS",
      left: "confidence threshold",
      right: "NMS IoU threshold",
      leftHint: "выше threshold — меньше слабых boxes",
      rightHint: "ниже IoU — агрессивнее удаляем дубликаты",
      metrics: ["Оставшиеся boxes", "Риск дубликатов", "Риск пропуска объекта"],
      compute: function (a, b) {
        return [clamp(100 - a * 0.75 - (50 - b) * 0.2, 8, 100), clamp(b * 0.85 - a * 0.1, 2, 95), clamp(a * 0.72 + (35 - b) * 0.25, 3, 98)];
      },
      note: "Object detection почти всегда балансирует recall и чистоту предсказаний: confidence режет слабые boxes, а NMS решает, какие overlapping boxes считать одним объектом."
    },
    "05_architectures/10_segmentation.html": {
      title: "Мини-интерактив: threshold mask и вес foreground",
      left: "mask threshold",
      right: "foreground loss weight",
      leftHint: "выше threshold — маска становится строже",
      rightHint: "выше вес — модель сильнее штрафуется за пропуск объекта",
      metrics: ["Точность границ", "Ложные пиксели", "Фокус на малых объектах"],
      compute: function (a, b) {
        return [clamp(55 + a * 0.25 + b * 0.15, 20, 95), clamp(90 - a * 0.65 + b * 0.12, 5, 90), clamp(15 + b * 0.78 - a * 0.08, 5, 95)];
      },
      note: "В segmentation ошибка часто живёт на границах и малых объектах. Threshold управляет бинаризацией, а веса loss помогают не потерять редкие foreground-пиксели."
    },
    "05_architectures/11_contrastive_learning_clip.html": {
      title: "Мини-интерактив: temperature и число негативов",
      left: "temperature sharpness",
      right: "negative examples",
      leftHint: "выше — softmax острее различает пары",
      rightHint: "больше негативов — труднее задача сопоставления",
      metrics: ["Сила alignment", "Риск false match", "Требование к batch"],
      compute: function (a, b) {
        return [clamp(25 + a * 0.55 + b * 0.2, 10, 95), clamp(80 - a * 0.35 + b * 0.2, 8, 92), clamp(10 + b * 0.85, 10, 95)];
      },
      note: "Contrastive learning учит не абсолютную метку, а относительное совпадение. Temperature задаёт резкость сравнения, а негативы формируют давление различать похожие примеры."
    },
    "06_llm/04_rlhf.html": {
      title: "Мини-интерактив: reward pressure vs KL",
      left: "reward pressure",
      right: "KL penalty",
      leftHint: "выше — модель сильнее гонится за reward",
      rightHint: "выше — модель меньше уходит от base policy",
      metrics: ["Следование reward", "Стабильность policy", "Риск reward hacking"],
      compute: function (a, b) {
        return [clamp(15 + a * 0.75 - b * 0.18, 5, 98), clamp(20 + b * 0.78 - a * 0.22, 5, 95), clamp(a * 0.65 - b * 0.35 + 35, 3, 95)];
      },
      note: "RLHF не просто максимизирует reward. KL удерживает модель рядом с исходной LLM, чтобы полезность не покупалась деградацией языка и reward hacking."
    },
    "07_generative_models/01_variational_autoencoders.html": {
      title: "Мини-интерактив: reconstruction vs KL",
      left: "β в β-VAE",
      right: "latent capacity",
      leftHint: "выше β — сильнее давление к prior",
      rightHint: "больше latent — больше места для информации",
      metrics: ["Качество реконструкции", "Регулярность latent", "Риск posterior collapse"],
      compute: function (a, b) {
        return [clamp(20 + b * 0.65 - a * 0.35, 5, 95), clamp(15 + a * 0.72, 10, 95), clamp(20 + a * 0.45 - b * 0.25, 2, 90)];
      },
      note: "VAE постоянно торгуется между точной реконструкцией и гладким latent space. ELBO полезен именно потому, что держит обе силы в одной цели."
    },
    "07_generative_models/02_generative_adversarial_networks.html": {
      title: "Мини-интерактив: баланс Generator и Discriminator",
      left: "discriminator strength",
      right: "generator learning rate",
      leftHint: "выше — D быстрее отличает fake от real",
      rightHint: "выше — G агрессивнее меняет распределение",
      metrics: ["Стабильность игры", "Diversity samples", "Риск mode collapse"],
      compute: function (a, b) {
        var balance = 100 - Math.abs(a - b) * 1.2;
        return [clamp(balance, 5, 95), clamp(35 + b * 0.35 - a * 0.12, 5, 90), clamp(Math.abs(a - b) * 0.65 + a * 0.18, 5, 95)];
      },
      note: "GAN — это игра, а не обычная минимизация loss. Если D или G слишком сильный, градиент становится бесполезным или генератор схлопывается в несколько режимов."
    },
    "07_generative_models/04_normalizing_flows.html": {
      title: "Мини-интерактив: expressivity vs invertibility",
      left: "flow depth",
      right: "log-det scale",
      leftHint: "больше слоёв — гибче преобразование",
      rightHint: "сильнее масштаб — больше вклад Jacobian",
      metrics: ["Выразительность", "Стоимость inference", "Риск численной нестабильности"],
      compute: function (a, b) {
        return [clamp(20 + a * 0.62 + b * 0.2, 10, 98), clamp(12 + a * 0.75, 8, 95), clamp(8 + b * 0.62 + a * 0.15, 3, 92)];
      },
      note: "Normalizing flow должен быть одновременно выразительным и обратимым. Jacobian determinant — цена за то, что модель точно считает плотность после преобразования."
    },
    "07_generative_models/05_stable_diffusion_deep_dive.html": {
      title: "Мини-интерактив: guidance scale и sampling steps",
      left: "classifier-free guidance",
      right: "sampling steps",
      leftHint: "выше — сильнее следование prompt",
      rightHint: "больше шагов — аккуратнее denoising",
      metrics: ["Prompt adherence", "Детализация", "Риск артефактов"],
      compute: function (a, b) {
        return [clamp(20 + a * 0.72, 10, 98), clamp(18 + b * 0.62 + a * 0.08, 8, 95), clamp(a * 0.55 - b * 0.22 + 25, 2, 90)];
      },
      note: "Stable Diffusion управляет не пикселями напрямую, а denoising в latent space. Guidance усиливает условие prompt, но слишком большой scale может ломать естественность."
    },
    "10_projects/03_end_to_end_cv_pipeline.html": {
      title: "Мини-интерактив: CV project risk map",
      left: "dataset noise",
      right: "deployment complexity",
      leftHint: "выше — больше проблем с label quality",
      rightHint: "выше — строже latency и packaging",
      metrics: ["Риск качества модели", "Риск production", "Нужный объём валидации"],
      compute: function (a, b) {
        return [clamp(10 + a * 0.78, 5, 95), clamp(10 + b * 0.8, 5, 95), clamp(20 + a * 0.35 + b * 0.35, 10, 98)];
      },
      note: "End-to-end CV проект ломается не только на архитектуре. Данные, labels, метрики, latency и упаковка часто важнее выбора между соседними моделями."
    },
    "10_projects/04_rag_application.html": {
      title: "Мини-интерактив: chunking vs retrieval depth",
      left: "chunk size",
      right: "top-k retrieved",
      leftHint: "крупнее chunk — больше контекста, меньше точность",
      rightHint: "больше top-k — выше recall, больше шума",
      metrics: ["Recall фактов", "Шум в контексте", "Стоимость ответа"],
      compute: function (a, b) {
        return [clamp(25 + b * 0.45 + a * 0.18, 10, 95), clamp(a * 0.35 + b * 0.42, 5, 92), clamp(15 + a * 0.24 + b * 0.55, 8, 95)];
      },
      note: "В RAG качество часто определяется retrieval-частью. Chunk size и top-k решают, получит ли LLM нужный факт или утонет в нерелевантном контексте."
    },
    "10_projects/05_kaggle_competition_walkthrough.html": {
      title: "Мини-интерактив: feature work vs ensemble complexity",
      left: "feature engineering",
      right: "ensemble complexity",
      leftHint: "выше — больше ручной структуры в данных",
      rightHint: "выше — больше моделей и blending",
      metrics: ["Public LB gain", "Риск overfit leaderboard", "Maintenance cost"],
      compute: function (a, b) {
        return [clamp(20 + a * 0.35 + b * 0.32, 10, 92), clamp(10 + b * 0.55 + a * 0.1, 5, 95), clamp(8 + a * 0.25 + b * 0.58, 5, 95)];
      },
      note: "Kaggle учит быстрому экспериментированию, но public leaderboard легко обмануть. Хорошая стратегия проверяется cross-validation, а не одной удачной отправкой."
    },
    "job_prep/03_resume_portfolio_checklist.html": {
      title: "Мини-интерактив: портфолио signal strength",
      left: "technical depth",
      right: "presentation clarity",
      leftHint: "выше — больше кода, метрик и анализа ошибок",
      rightHint: "выше — понятнее README, demo и выводы",
      metrics: ["Сигнал для интервью", "Риск непонимания проекта", "Готовность к скринингу"],
      compute: function (a, b) {
        return [clamp(10 + a * 0.45 + b * 0.45, 10, 98), clamp(95 - b * 0.75, 5, 95), clamp(15 + b * 0.45 + a * 0.22, 10, 95)];
      },
      note: "Сильный проект должен быть не только сложным, но и читаемым. Рекрутер и интервьюер должны быстро понять задачу, результат, компромиссы и твою роль."
    }
  };

  function defaultDefinition() {
    return {
      title: "Мини-интерактив: карта понимания темы",
      left: "theory depth",
      right: "practice pressure",
      leftHint: "выше — больше внимания к выводу и предпосылкам",
      rightHint: "выше — больше внимания к ошибкам применения",
      metrics: ["Понимание механизма", "Готовность к интервью", "Риск поверхностного знания"],
      compute: function (a, b) {
        return [clamp(15 + a * 0.55 + b * 0.22, 10, 95), clamp(10 + b * 0.55 + a * 0.25, 10, 95), clamp(90 - a * 0.35 - b * 0.35, 5, 90)];
      },
      note: "Используй этот блок как проверку: если ты можешь объяснить, что меняется при движении каждой ручки, тема перестаёт быть набором терминов."
    };
  }

  function createLab(definition) {
    var lab = document.createElement("section");
    lab.className = "card ml-concept-lab";
    lab.innerHTML =
      '<span class="ml-concept-lab__eyebrow">Рабочая визуализация</span>' +
      "<h2>" + escapeHtml(definition.title) + "</h2>" +
      '<div class="ml-concept-lab__controls">' +
      '<label><span>' + escapeHtml(definition.left) + '</span><input type="range" min="0" max="100" value="50" data-lab-left><small>' + escapeHtml(definition.leftHint) + "</small></label>" +
      '<label><span>' + escapeHtml(definition.right) + '</span><input type="range" min="0" max="100" value="50" data-lab-right><small>' + escapeHtml(definition.rightHint) + "</small></label>" +
      "</div>" +
      '<div class="ml-concept-lab__bars" data-lab-bars></div>' +
      '<p class="ml-concept-lab__note">' + escapeHtml(definition.note) + "</p>";

    var left = lab.querySelector("[data-lab-left]");
    var right = lab.querySelector("[data-lab-right]");
    var bars = lab.querySelector("[data-lab-bars]");

    function render() {
      var values = definition.compute(Number(left.value), Number(right.value));
      bars.innerHTML = definition.metrics.map(function (metric, index) {
        var value = round(values[index]);
        return (
          '<div class="ml-concept-lab__bar">' +
          '<div class="ml-concept-lab__bar-head"><span>' + escapeHtml(metric) + '</span><strong>' + value + "%</strong></div>" +
          '<div class="ml-concept-lab__track"><i style="width:' + value + '%"></i></div>' +
          "</div>"
        );
      }).join("");
    }

    left.addEventListener("input", render);
    right.addEventListener("input", render);
    render();
    return lab;
  }

  function attachCoverageLab() {
    if (hasExistingInteractive()) {
      return;
    }
    var definition = DEFINITIONS[pagePath] || defaultDefinition();
    var anchor = pageShell.querySelector(".ml-study-header");
    var lab = createLab(definition);
    if (anchor && anchor.parentNode) {
      anchor.parentNode.insertBefore(lab, anchor.nextSibling);
    } else {
      pageShell.insertBefore(lab, pageShell.firstChild);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", attachCoverageLab);
  } else {
    attachCoverageLab();
  }
})();
