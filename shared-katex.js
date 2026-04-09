(function () {
  var rootUrl = new URL(
    ".",
    document.currentScript && document.currentScript.src
      ? document.currentScript.src
      : window.location.href
  );
  var katexCssUrl = new URL("vendor/katex/katex.min.css", rootUrl).href;
  var katexJsUrl = new URL("vendor/katex/katex.min.js", rootUrl).href;
  var selector = ".formula, .inline-math, [data-render-tex]";

  var unicodeMap = {
    "α": "\\alpha ",
    "β": "\\beta ",
    "γ": "\\gamma ",
    "δ": "\\delta ",
    "Δ": "\\Delta ",
    "θ": "\\theta ",
    "λ": "\\lambda ",
    "μ": "\\mu ",
    "σ": "\\sigma ",
    "Σ": "\\Sigma ",
    "π": "\\pi ",
    "ρ": "\\rho ",
    "η": "\\eta ",
    "ω": "\\omega ",
    "Ω": "\\Omega ",
    "∂": "\\partial ",
    "∇": "\\nabla ",
    "∞": "\\infty ",
    "∈": "\\in ",
    "∉": "\\notin ",
    "≤": "\\le ",
    "≥": "\\ge ",
    "≈": "\\approx ",
    "≠": "\\ne ",
    "→": "\\to ",
    "←": "\\leftarrow ",
    "↔": "\\leftrightarrow ",
    "⇒": "\\Rightarrow ",
    "⟹": "\\Rightarrow ",
    "·": "\\cdot ",
    "×": "\\times ",
    "⊙": "\\odot ",
    "√": "\\sqrt{}",
    "ℝ": "\\mathbb{R}",
    "ℕ": "\\mathbb{N}",
    "ℤ": "\\mathbb{Z}",
    "⊤": "^{\\top}",
    "ᵀ": "^{\\top}"
  };

  var superscriptMap = {
    "⁰": "0",
    "¹": "1",
    "²": "2",
    "³": "3",
    "⁴": "4",
    "⁵": "5",
    "⁶": "6",
    "⁷": "7",
    "⁸": "8",
    "⁹": "9",
    "⁺": "+",
    "⁻": "-",
    "⁼": "=",
    "⁽": "(",
    "⁾": ")",
    "ᵀ": "\\top",
    "ᵃ": "a",
    "ᵇ": "b",
    "ᶜ": "c",
    "ᵈ": "d",
    "ᵉ": "e",
    "ᶠ": "f",
    "ᵍ": "g",
    "ʰ": "h",
    "ᶦ": "i",
    "ʲ": "j",
    "ᵏ": "k",
    "ˡ": "l",
    "ᵐ": "m",
    "ⁿ": "n",
    "ᵒ": "o",
    "ᵖ": "p",
    "ʳ": "r",
    "ˢ": "s",
    "ᵗ": "t",
    "ᵘ": "u",
    "ᵛ": "v",
    "ʷ": "w",
    "ˣ": "x",
    "ʸ": "y",
    "ᶻ": "z"
  };

  var subscriptMap = {
    "₀": "0",
    "₁": "1",
    "₂": "2",
    "₃": "3",
    "₄": "4",
    "₅": "5",
    "₆": "6",
    "₇": "7",
    "₈": "8",
    "₉": "9",
    "₊": "+",
    "₋": "-",
    "₌": "=",
    "₍": "(",
    "₎": ")",
    "ₐ": "a",
    "ₑ": "e",
    "ₕ": "h",
    "ᵢ": "i",
    "ⱼ": "j",
    "ₖ": "k",
    "ₗ": "l",
    "ₘ": "m",
    "ₙ": "n",
    "ₒ": "o",
    "ₚ": "p",
    "ᵣ": "r",
    "ₛ": "s",
    "ₜ": "t",
    "ᵤ": "u",
    "ᵥ": "v",
    "ₓ": "x"
  };

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

  function ensureInlineStyles() {
    if (document.getElementById("ml-notes-katex-overrides")) {
      return;
    }

    var style = document.createElement("style");
    style.id = "ml-notes-katex-overrides";
    style.textContent =
      ".formula[data-katex-rendered='1'] .katex-display{margin:0;max-width:100%;}" +
      ".formula[data-katex-rendered='1'] .katex{font-size:1em;min-width:max-content;}" +
      ".inline-math[data-katex-rendered='1'] .katex{font-size:1em;}" +
      "@media (max-width:700px){.formula[data-katex-rendered='1'] .katex{font-size:.92em;}}";
    document.head.appendChild(style);
  }

  function ensureScript(src, globalName, id) {
    if (globalName && window[globalName]) {
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

  function normalizeWhitespace(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function isCodeLike(text, element) {
    var normalized = normalizeWhitespace(text);

    if (!normalized || normalized.length < 3) {
      return true;
    }

    if (element && element.id && /code|snippet|source/i.test(element.id)) {
      return true;
    }

    return /(import\s+\w+|from\s+\w+\s+import|torch\.|np\.|numpy|function\s*\(|const\s+|let\s+|document\.|addEventListener|ctx\.|return\s+|;\s*$|#\s)/im.test(normalized);
  }

  function getMathCandidates() {
    return Array.prototype.filter.call(document.querySelectorAll(selector), function (element) {
      var source = element.dataset.texSource || convertNode(element);
      var signature = normalizeWhitespace(source);
      return Boolean(signature) && !isCodeLike(signature, element);
    });
  }

  function convertSuperscripts(text) {
    var result = "";
    var i = 0;

    while (i < text.length) {
      var current = text.charAt(i);

      if (superscriptMap[current]) {
        var token = "";
        while (i < text.length && superscriptMap[text.charAt(i)]) {
          token += superscriptMap[text.charAt(i)];
          i += 1;
        }
        result += "^{" + token + "}";
        continue;
      }

      if (subscriptMap[current]) {
        var subToken = "";
        while (i < text.length && subscriptMap[text.charAt(i)]) {
          subToken += subscriptMap[text.charAt(i)];
          i += 1;
        }
        result += "_{" + subToken + "}";
        continue;
      }

      result += current;
      i += 1;
    }

    return result;
  }

  function mapUnicode(text) {
    var output = convertSuperscripts(text);
    Object.keys(unicodeMap).forEach(function (symbol) {
      output = output.split(symbol).join(unicodeMap[symbol]);
    });
    output = output.replace(/\u00a0/g, " ");
    output = output.replace(/‖/g, "\\Vert ");
    return output;
  }

  function convertNode(node) {
    if (node.nodeType === 3) {
      return mapUnicode(node.textContent || "");
    }

    if (node.nodeType !== 1) {
      return "";
    }

    var tag = node.tagName.toLowerCase();

    if (tag === "br") {
      return "\n";
    }

    if (tag === "sub") {
      return "_{" + Array.prototype.map.call(node.childNodes, convertNode).join("") + "}";
    }

    if (tag === "sup") {
      return "^{" + Array.prototype.map.call(node.childNodes, convertNode).join("") + "}";
    }

    return Array.prototype.map.call(node.childNodes, convertNode).join("");
  }

  function sourceToKatex(source) {
    var normalized = String(source || "").replace(/\r/g, "").trim();
    if (!normalized) {
      return "";
    }

    var lines = normalized
      .split(/\n+/)
      .map(function (line) { return normalizeWhitespace(line); })
      .filter(Boolean);

    if (!lines.length) {
      return "";
    }

    if (lines.length === 1) {
      return lines[0];
    }

    return "\\begin{aligned}" + lines.join(" \\\\ ") + "\\end{aligned}";
  }

  function renderElement(element) {
    if (!element) {
      return;
    }

    var source = element.dataset.texSource || convertNode(element);
    var signature = normalizeWhitespace(source);

    if (!signature || isCodeLike(signature, element)) {
      return;
    }

    if (element.dataset.katexSignature === signature && element.dataset.katexRendered === "1") {
      return;
    }

    if (!element.dataset.katexOriginalHtml) {
      element.dataset.katexOriginalHtml = element.innerHTML;
    }

    try {
      window.katex.render(sourceToKatex(signature), element, {
        throwOnError: true,
        displayMode: element.classList.contains("formula"),
        strict: "ignore"
      });
      element.dataset.katexRendered = "1";
      element.dataset.katexSignature = signature;
    } catch (error) {
      if (element.dataset.katexOriginalHtml) {
        element.innerHTML = element.dataset.katexOriginalHtml;
      }
    }
  }

  function processAll() {
    if (!window.katex) {
      return;
    }

    getMathCandidates().forEach(renderElement);
  }

  function scheduleInitialRender() {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(function () {
        processAll();
      }, { timeout: 700 });
      return;
    }

    window.setTimeout(processAll, 80);
  }

  function init() {
    if (!getMathCandidates().length) {
      return;
    }

    ensureStylesheet(katexCssUrl, "ml-notes-katex-css");
    ensureInlineStyles();

    ensureScript(katexJsUrl, "katex", "ml-notes-katex-js").then(function (loaded) {
      if (!loaded || !window.katex) {
        return;
      }

      scheduleInitialRender();
      window.addEventListener("load", processAll, { once: true });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
