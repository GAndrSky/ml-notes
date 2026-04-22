(function () {
  if (window.__mlNotesVisualStandardsInitialized) {
    return;
  }
  window.__mlNotesVisualStandardsInitialized = true;

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

  function textOf(element) {
    return String((element && element.textContent) || "").replace(/\s+/g, " ").trim();
  }

  function hasVisual(element) {
    if (!element) {
      return false;
    }
    return !!element.querySelector(
      "canvas, svg, img, .chart, .plot, .diagram, .graph, .heatmap, .network, .viz, [class*='chart'], [class*='plot'], [class*='diagram'], [class*='graph'], [class*='heatmap'], [class*='viz']"
    );
  }

  function hasCaption(element) {
    if (!element) {
      return false;
    }
    return !!element.querySelector(".ml-visual-caption, figcaption, .caption, .figure-caption") ||
      /what to notice|caption|диаграмма показывает|что смотреть|визуализация показывает/i.test(textOf(element));
  }

  function captionFor(element) {
    var text = textOf(element).toLowerCase();

    if (/attention|heatmap|token|query|key/.test(text)) {
      return "What to notice: darker attention cells show which tokens exchange the strongest information; rows usually read as the token asking the question.";
    }
    if (/gradient|loss|optimizer|learning rate|adam|sgd|clipping|stability/.test(text)) {
      return "What to notice: red/loss and gradient movement show whether training is stable, too slow, or jumping through the landscape.";
    }
    if (/tree|split|gini|entropy|forest|boosting|svm|cluster|pca|metric|regression|classification/.test(text)) {
      return "What to notice: focus on how the boundary, grouping, metric, or validation curve changes when model complexity or threshold changes.";
    }
    if (/cnn|conv|rnn|lstm|resnet|normalization|transformer|vit|architecture/.test(text)) {
      return "What to notice: follow tensor flow through the block and identify where information is mixed, compressed, skipped, or normalized.";
    }
    if (/vector|matrix|derivative|probability|entropy|jacobian|hessian|calculus|linear/.test(text)) {
      return "What to notice: read the picture as geometry first: direction, scale, curvature, projection, or probability mass.";
    }

    return "What to notice: identify the input, the parameter being changed, the output, and the failure mode the visual is meant to reveal.";
  }

  function buildLegend() {
    var legend = document.createElement("section");
    legend.className = "card ml-visual-legend";
    legend.setAttribute("aria-label", "Visual color legend");
    legend.innerHTML =
      '<div class="ml-visual-legend__head">' +
        "<span>Visual standard</span>" +
        "<h2>Color legend for diagrams</h2>" +
        '<p class="muted">Use the same color vocabulary while reading diagrams, plots, and interactives across the course.</p>' +
      "</div>" +
      '<div class="ml-visual-legend__items">' +
        '<span style="--legend-color:#6ea5ff">Inputs / data</span>' +
        '<span style="--legend-color:#f4a261">Parameters / weights</span>' +
        '<span style="--legend-color:#7bd88f">Outputs / predictions</span>' +
        '<span style="--legend-color:#ff6b6b">Loss / errors</span>' +
        '<span style="--legend-color:#b794f4">Hidden representations</span>' +
      "</div>";
    return legend;
  }

  function ensureLegend() {
    if (pageShell.querySelector(".ml-visual-legend")) {
      return;
    }

    var hasAnyVisual = Array.prototype.some.call(pageShell.querySelectorAll(".card, section, article"), hasVisual);
    if (!hasAnyVisual) {
      return;
    }

    var header = pageShell.querySelector(".ml-study-header");
    var legend = buildLegend();
    if (header && header.parentNode === pageShell) {
      header.insertAdjacentElement("afterend", legend);
    } else {
      pageShell.insertBefore(legend, pageShell.firstElementChild);
    }
  }

  function attachCaptions() {
    var containers = Array.prototype.slice.call(pageShell.querySelectorAll(".card, section, article, figure"));
    containers.forEach(function (container) {
      if (container.classList.contains("hero") || container.classList.contains("ml-visual-legend")) {
        return;
      }
      if (!hasVisual(container) || hasCaption(container)) {
        return;
      }

      var caption = document.createElement("p");
      caption.className = "ml-visual-caption";
      caption.textContent = captionFor(container);
      container.appendChild(caption);
    });
  }

  function run() {
    ensureLegend();
    attachCaptions();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
  window.addEventListener("load", run);
})();
