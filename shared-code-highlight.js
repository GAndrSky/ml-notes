(function () {
  if (window.__mlNotesCodeHighlightInitialized) {
    return;
  }
  window.__mlNotesCodeHighlightInitialized = true;

  var rootUrl = new URL(
    ".",
    document.currentScript && document.currentScript.src
      ? document.currentScript.src
      : window.location.href
  );
  var hljsCssUrl = new URL("vendor/highlightjs/github-dark.min.css", rootUrl).href;
  var hljsJsUrl = new URL("vendor/highlightjs/highlight.min.js", rootUrl).href;

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
      ".formula.ml-code-highlight{border-left-color:var(--section-accent,#7eb8b8)!important;background:var(--code-bg,#252836)!important;padding:0!important;}" +
      ".formula.ml-code-highlight code,.formula.ml-code-highlight pre{display:block;margin:0;background:transparent!important;border:none!important;padding:14px 16px;white-space:pre;overflow:auto;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:14px;line-height:1.6;}" +
      ".formula.ml-code-highlight .hljs,pre code.hljs{background:transparent!important;color:#e8eaf0!important;border-radius:16px;padding:0;}" +
      ".hljs-keyword,.hljs-selector-tag,.hljs-literal,.hljs-section,.hljs-link{color:#c792ea!important;}" +
      ".hljs-title,.hljs-title.class_,.hljs-title.function_,.hljs-function .hljs-title{color:#82aaff!important;}" +
      ".hljs-string,.hljs-meta .hljs-string,.hljs-regexp,.hljs-symbol,.hljs-bullet{color:#c3e88d!important;}" +
      ".hljs-number,.hljs-built_in,.hljs-type,.hljs-attr,.hljs-template-variable{color:#f78c6c!important;}" +
      ".hljs-comment,.hljs-quote,.hljs-deletion{color:#6b7280!important;}" +
      ".hljs-variable,.hljs-params,.hljs-attribute,.hljs-subst{color:#e8eaf0!important;}" +
      "@media (max-width:700px){.formula.ml-code-highlight code,.formula.ml-code-highlight pre,pre code.hljs{font-size:13px!important;}}";
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

  function detectLanguage(text, className) {
    var normalized = normalizeWhitespace(text);
    var safeClass = String(className || "");

    if (/language-python|lang-python/i.test(safeClass) || /(^|\s)(import\s+\w+|from\s+\w+\s+import|def\s+\w+\(|class\s+\w+|print\(|torch\.|np\.|numpy|sklearn|pandas)(\s|$)/i.test(normalized)) {
      return "python";
    }

    if (/language-javascript|lang-javascript|language-js|lang-js/i.test(safeClass) || /(const\s+|let\s+|function\s+\w+\(|=>|document\.|window\.|console\.log|addEventListener\()/i.test(normalized)) {
      return "javascript";
    }

    if (/language-bash|lang-bash|language-shell|language-sh|lang-sh/i.test(safeClass) || /(^|\s)(echo\s+|export\s+|pip\s+install|python\s+-m|#!\/bin\/bash|cd\s+|ls\s+|grep\s+)(\s|$)/i.test(normalized)) {
      return "bash";
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

    return /(import\s+\w+|from\s+\w+\s+import|torch\.|np\.|def\s+\w+\(|for\s+\w+\s+in|print\(|class\s+\w+|sklearn|pandas|const\s+|let\s+|function\s+\w+\(|=>|document\.|console\.log|#!\/bin\/bash|echo\s+|export\s+|pip\s+install)/i.test(normalized);
  }

  function getCandidates() {
    var preCodeBlocks = Array.prototype.filter.call(document.querySelectorAll("pre code"), function (element) {
      return !!detectLanguage(element.textContent || "", element.className || "");
    });

    var formulaBlocks = Array.prototype.filter.call(document.querySelectorAll(".formula"), function (element) {
      var signature = String(element.textContent || "").trim();
      return isCodeBlockText(signature, element) && !!detectLanguage(signature, element.className || "");
    });

    return preCodeBlocks.concat(formulaBlocks);
  }

  function highlightFormula(element) {
    var source = element.textContent || "";
    var signature = source.trim();
    var language = detectLanguage(signature, element.className || "");

    if (!language || !isCodeBlockText(signature, element)) {
      return;
    }

    if (element.dataset.codeSignature === signature && element.dataset.codeHighlighted === "1") {
      return;
    }

    var highlighted = window.hljs.highlight(signature, { language: language, ignoreIllegals: true }).value;
    element.classList.add("ml-code-highlight");
    element.setAttribute("data-code-block", "");
    element.innerHTML = '<code class="hljs language-' + language + '">' + highlighted + "</code>";
    element.dataset.codeHighlighted = "1";
    element.dataset.codeSignature = signature;
  }

  function highlightPreCode(element) {
    if (element.dataset.codeHighlighted === "1") {
      return;
    }

    var language = detectLanguage(element.textContent || "", element.className || "");
    if (!language) {
      return;
    }

    element.classList.add("language-" + language);
    window.hljs.highlightElement(element);
    element.dataset.codeHighlighted = "1";
  }

  function processAll() {
    if (!window.hljs) {
      return;
    }

    getCandidates().forEach(function (element) {
      if (element.matches && element.matches("pre code")) {
        highlightPreCode(element);
      } else {
        highlightFormula(element);
      }
    });
  }

  function init() {
    if (!getCandidates().length) {
      return;
    }

    ensureStylesheet(hljsCssUrl, "ml-notes-hljs-css");
    ensureInlineStyles();

    ensureScript(hljsJsUrl, "hljs", "ml-notes-hljs-js").then(function (loaded) {
      if (!loaded || !window.hljs) {
        return;
      }

      processAll();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
