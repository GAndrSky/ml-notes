(function () {
  var rootUrl = new URL(
    ".",
    document.currentScript && document.currentScript.src
      ? document.currentScript.src
      : window.location.href
  );
  var hljsCssUrl = new URL("vendor/highlightjs/github-dark.min.css", rootUrl).href;
  var hljsJsUrl = new URL("vendor/highlightjs/highlight.min.js", rootUrl).href;
  var pythonJsUrl = new URL("vendor/highlightjs/python.min.js", rootUrl).href;

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
    if (document.getElementById("ml-notes-code-highlight-overrides")) {
      return;
    }

    var style = document.createElement("style");
    style.id = "ml-notes-code-highlight-overrides";
    style.textContent =
      ".formula.ml-code-highlight{border-left-color:var(--blue,#60a5fa)!important;background:#0b1016!important;padding:0!important;}" +
      ".formula.ml-code-highlight code,.formula.ml-code-highlight pre{display:block;margin:0;background:transparent!important;border:none!important;padding:12px 14px;white-space:pre;overflow:auto;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;}" +
      ".formula.ml-code-highlight .hljs{background:transparent!important;padding:0;}" +
      "pre code.hljs{border-radius:10px;}";
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

  function detectLanguage(text) {
    var normalized = normalizeWhitespace(text);

    if (/torch\.|numpy|np\.|import\s+\w+|from\s+\w+\s+import|def\s+\w+\(/i.test(normalized)) {
      return "python";
    }

    return "";
  }

  function isCodeBlockText(text, element) {
    var normalized = normalizeWhitespace(text);

    if (!normalized || normalized.length < 12) {
      return false;
    }

    if (element && element.id && /code|snippet|source/i.test(element.id)) {
      return true;
    }

    return /(import\s+\w+|from\s+\w+\s+import|torch\.|np\.|def\s+\w+\(|for\s+\w+\s+in|print\(|class\s+\w+|sklearn|pandas)/i.test(normalized);
  }

  function getPythonCandidates() {
    var codeBlocks = Array.prototype.filter.call(document.querySelectorAll("pre code"), function (element) {
      var className = element.className || "";
      if (/language-python|lang-python/i.test(className)) {
        return true;
      }

      return detectLanguage(element.textContent || "") === "python";
    });

    var formulaBlocks = Array.prototype.filter.call(document.querySelectorAll(".formula"), function (element) {
      var signature = (element.textContent || "").trim();
      return isCodeBlockText(signature, element) && detectLanguage(signature) === "python";
    });

    return codeBlocks.concat(formulaBlocks);
  }

  function highlightFormula(element) {
    var text = element.textContent || "";
    var signature = text.trim();

    if (!isCodeBlockText(signature, element)) {
      return;
    }

    if (detectLanguage(signature) !== "python") {
      return;
    }

    if (element.dataset.codeSignature === signature && element.dataset.codeHighlighted === "1") {
      return;
    }

    var highlighted = window.hljs.highlight(signature, { language: "python", ignoreIllegals: true }).value;

    element.classList.add("ml-code-highlight");
    element.innerHTML = '<code class="hljs language-python">' + highlighted + "</code>";
    element.dataset.codeHighlighted = "1";
    element.dataset.codeSignature = signature;
  }

  function highlightPreCode(element) {
    if (element.dataset.codeHighlighted === "1") {
      return;
    }

    var language = detectLanguage(element.textContent || "");
    if (language !== "python" && !/language-python|lang-python/i.test(element.className || "")) {
      return;
    }

    element.classList.add("language-python");
    window.hljs.highlightElement(element);
    element.dataset.codeHighlighted = "1";
  }

  function processAll() {
    if (!window.hljs) {
      return;
    }

    getPythonCandidates().forEach(function (element) {
      if (element.matches && element.matches("pre code")) {
        highlightPreCode(element);
      } else {
        highlightFormula(element);
      }
    });
  }

  function scheduleInitialHighlight() {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(function () {
        processAll();
      }, { timeout: 700 });
      return;
    }

    window.setTimeout(processAll, 80);
  }

  function init() {
    if (!getPythonCandidates().length) {
      return;
    }

    ensureStylesheet(hljsCssUrl, "ml-notes-hljs-css");
    ensureInlineStyles();

    ensureScript(hljsJsUrl, "hljs", "ml-notes-hljs-js").then(function (loaded) {
      if (!loaded || !window.hljs) {
        return;
      }

      return ensureScript(pythonJsUrl, null, "ml-notes-hljs-python").then(function () {
        scheduleInitialHighlight();
        window.addEventListener("load", processAll, { once: true });
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
