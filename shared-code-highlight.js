(function () {
  var hljsCssUrl = "https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/github-dark.min.css";
  var hljsJsUrl = "https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/lib/highlight.min.js";
  var pythonJsUrl = "https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/lib/languages/python.min.js";
  var javascriptJsUrl = "https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/lib/languages/javascript.min.js";
  var scheduled = false;

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

    if (/const\s+|let\s+|function\s*\(|=>|document\.|addEventListener|window\.|Math\./i.test(normalized)) {
      return "javascript";
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

    return /(import\s+\w+|from\s+\w+\s+import|torch\.|np\.|def\s+\w+\(|for\s+\w+\s+in|print\(|const\s+|let\s+|function\s*\(|=>|document\.|addEventListener|ctx\.|return\s+|class\s+\w+)/i.test(normalized);
  }

  function highlightFormula(element) {
    var text = element.textContent || "";
    var signature = text.trim();

    if (!isCodeBlockText(signature, element)) {
      return;
    }

    if (element.dataset.codeSignature === signature && element.dataset.codeHighlighted === "1") {
      return;
    }

    var language = detectLanguage(signature);
    var highlighted = language
      ? window.hljs.highlight(signature, { language: language, ignoreIllegals: true }).value
      : window.hljs.highlightAuto(signature).value;

    element.classList.add("ml-code-highlight");
    element.innerHTML = '<code class="hljs language-' + (language || "plaintext") + '">' + highlighted + "</code>";
    element.dataset.codeHighlighted = "1";
    element.dataset.codeSignature = signature;
  }

  function highlightPreCode(element) {
    if (element.dataset.codeHighlighted === "1") {
      return;
    }

    var language = detectLanguage(element.textContent || "");
    if (language) {
      element.classList.add("language-" + language);
    }
    window.hljs.highlightElement(element);
    element.dataset.codeHighlighted = "1";
  }

  function processAll() {
    scheduled = false;

    if (!window.hljs) {
      return;
    }

    Array.prototype.forEach.call(document.querySelectorAll("pre code"), highlightPreCode);
    Array.prototype.forEach.call(document.querySelectorAll(".formula"), highlightFormula);
  }

  function scheduleProcess() {
    if (scheduled) {
      return;
    }

    scheduled = true;
    window.setTimeout(processAll, 140);
  }

  function init() {
    ensureStylesheet(hljsCssUrl, "ml-notes-hljs-css");
    ensureInlineStyles();

    ensureScript(hljsJsUrl, "hljs", "ml-notes-hljs-js").then(function (loaded) {
      if (!loaded || !window.hljs) {
        return;
      }

      return Promise.all([
        ensureScript(pythonJsUrl, null, "ml-notes-hljs-python"),
        ensureScript(javascriptJsUrl, null, "ml-notes-hljs-javascript")
      ]).then(function () {
        processAll();
        window.setTimeout(processAll, 500);
        window.addEventListener("load", processAll);

        var observer = new MutationObserver(function () {
          scheduleProcess();
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true,
          characterData: true
        });
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
