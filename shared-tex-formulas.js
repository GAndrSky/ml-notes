(function () {
  var SELECTOR = ".formula, .inline-math, [data-render-tex]";
  var COMMANDS = {
    alpha: "\u03b1",
    beta: "\u03b2",
    gamma: "\u03b3",
    delta: "\u03b4",
    Delta: "\u0394",
    mu: "\u03bc",
    sigma: "\u03c3",
    Sigma: "\u03a3",
    lambda: "\u03bb",
    rho: "\u03c1",
    theta: "\u03b8",
    eta: "\u03b7",
    varepsilon: "\u03b5",
    epsilon: "\u03b5",
    pi: "\u03c0",
    Omega: "\u03a9",
    omega: "\u03c9",
    ell: "\u2113",
    partial: "\u2202",
    nabla: "\u2207",
    in: "\u2208",
    mid: "|",
    perp: "\u22a5",
    propto: "\u221d",
    approx: "\u2248",
    sim: "\u223c",
    cdot: "\u00b7",
    times: "\u00d7",
    Rightarrow: "\u21d2",
    leftarrow: "\u2190",
    rightarrow: "\u2192",
    to: "\u2192",
    iff: "\u21d4",
    leftrightarrow: "\u2194",
    longleftrightarrow: "\u27f7",
    uparrow: "\u2191",
    downarrow: "\u2193",
    infty: "\u221e",
    ge: "\u2265",
    geq: "\u2265",
    le: "\u2264",
    leq: "\u2264",
    pm: "\u00b1",
    dots: "\u2026",
    ldots: "\u2026",
    sum: "\u03a3",
    prod: "\u220f",
    min: "min",
    max: "max",
    arg: "arg ",
    log: "log",
    exp: "exp",
    det: "det",
    sin: "sin",
    cos: "cos",
    tan: "tan"
  };
  var DOUBLE_STRUCK = {
    R: "\u211d"
  };

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function ensureStyles() {
    if (document.getElementById("shared-tex-formulas-style")) {
      return;
    }

    var style = document.createElement("style");
    style.id = "shared-tex-formulas-style";
    style.textContent =
      ".tex-frac{display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;line-height:1.05;margin:0 .18em;}" +
      ".tex-frac__num{padding:0 .28em;border-bottom:1px solid currentColor;}" +
      ".tex-frac__den{padding:0 .28em;}" +
      ".tex-matrix{display:inline-flex;align-items:stretch;gap:.4em;vertical-align:middle;}" +
      ".tex-matrix__bracket{font-size:1.55em;line-height:1;display:flex;align-items:center;}" +
      ".tex-matrix__rows{display:flex;flex-direction:column;gap:.2em;}" +
      ".tex-matrix__row{white-space:nowrap;display:flex;gap:.75em;}" +
      ".tex-cases{display:inline-flex;align-items:stretch;gap:.4em;vertical-align:middle;}" +
      ".tex-cases__brace{font-size:1.8em;line-height:1;display:flex;align-items:center;}" +
      ".tex-cases__rows{display:flex;flex-direction:column;gap:.2em;}" +
      ".tex-cases__row{white-space:nowrap;display:flex;gap:.75em;}" +
      ".tag{text-decoration:none;}";
    document.head.appendChild(style);
  }

  function htmlToText(html) {
    var temp = document.createElement("div");
    temp.innerHTML = html;
    return temp.textContent || "";
  }

  function accentText(text, accent) {
    var chars = Array.from((text || "").trim());
    var index = chars.length - 1;

    while (index >= 0 && /\s/.test(chars[index])) {
      index -= 1;
    }

    if (index >= 0) {
      chars[index] += accent;
    }

    return escapeHtml(chars.join(""));
  }

  function buildFraction(numerator, denominator) {
    return (
      '<span class="tex-frac"><span class="tex-frac__num">' +
      numerator +
      '</span><span class="tex-frac__den">' +
      denominator +
      "</span></span>"
    );
  }

  function buildRowCells(row, rowClass) {
    return (
      '<span class="' +
      rowClass +
      '">' +
      row
        .split("&")
        .map(function (cell) {
          return '<span class="tex-matrix__cell">' + renderMath(cell.trim()) + "</span>";
        })
        .join("") +
      "</span>"
    );
  }

  function buildMatrix(rows) {
    return (
      '<span class="tex-matrix"><span class="tex-matrix__bracket">[</span><span class="tex-matrix__rows">' +
      rows
        .map(function (row) {
          return buildRowCells(row, "tex-matrix__row");
        })
        .join("") +
      '</span><span class="tex-matrix__bracket">]</span></span>'
    );
  }

  function buildCases(rows) {
    return (
      '<span class="tex-cases"><span class="tex-cases__brace">{</span><span class="tex-cases__rows">' +
      rows
        .map(function (row) {
          return buildRowCells(row, "tex-cases__row");
        })
        .join("") +
      "</span></span>"
    );
  }

  function renderMath(source) {
    var input = String(source || "").replace(/\r/g, "");
    var index = 0;

    function skipInlineSpaces() {
      while (index < input.length && /[ \t]/.test(input[index])) {
        index += 1;
      }
    }

    function extractGroupSource() {
      skipInlineSpaces();

      if (input[index] !== "{") {
        return "";
      }

      index += 1;
      var start = index;
      var depth = 1;

      while (index < input.length && depth > 0) {
        if (input[index] === "{") {
          depth += 1;
        } else if (input[index] === "}") {
          depth -= 1;
        }
        index += 1;
      }

      return input.slice(start, index - 1);
    }

    function parseScriptValue() {
      skipInlineSpaces();

      if (input[index] === "{") {
        return renderMath(extractGroupSource());
      }

      if (input[index] === "\\") {
        return parseCommand();
      }

      if (index >= input.length) {
        return "";
      }

      var char = input[index];
      index += 1;
      return escapeHtml(char);
    }

    function parseCommand() {
      index += 1;

      if (index >= input.length) {
        return "";
      }

      var next = input[index];

      if (next === "\\") {
        index += 1;
        return "<br>";
      }

      if (next === " " || next === "," || next === ";" || next === ":") {
        index += 1;
        return " ";
      }

      if (next === "!") {
        index += 1;
        return "";
      }

      if (next === "{" || next === "}") {
        index += 1;
        return escapeHtml(next);
      }

      if (next === "|") {
        index += 1;
        return "\u2016";
      }

      if (!/[A-Za-z]/.test(next)) {
        index += 1;
        return escapeHtml(next);
      }

      var start = index;

      while (index < input.length && /[A-Za-z]/.test(input[index])) {
        index += 1;
      }

      var name = input.slice(start, index);

      if (name === "frac") {
        return buildFraction(renderMath(extractGroupSource()), renderMath(extractGroupSource()));
      }

      if (name === "text" || name === "mathbf" || name === "mathcal" || name === "mathrm") {
        return renderMath(extractGroupSource());
      }

      if (name === "mathbb") {
        var plain = htmlToText(renderMath(extractGroupSource())).trim();
        return escapeHtml(DOUBLE_STRUCK[plain] || plain);
      }

      if (name === "hat") {
        return accentText(htmlToText(renderMath(extractGroupSource())), "\u0302");
      }

      if (name === "bar") {
        return accentText(htmlToText(renderMath(extractGroupSource())), "\u0304");
      }

      if (name === "tilde") {
        return accentText(htmlToText(renderMath(extractGroupSource())), "\u0303");
      }

      if (name === "sqrt") {
        return "\u221a(" + renderMath(extractGroupSource()) + ")";
      }

      if (name === "begin") {
        var environment = htmlToText(renderMath(extractGroupSource())).trim();
        var endToken = "\\end{" + environment + "}";
        var endIndex = input.indexOf(endToken, index);

        if (endIndex === -1) {
          return "";
        }

        var matrixSource = input.slice(index, endIndex);
        index = endIndex + endToken.length;

        if (environment === "bmatrix") {
          return buildMatrix(
            matrixSource
              .split(/\\\\/)
              .map(function (row) { return row.trim(); })
              .filter(Boolean)
          );
        }

        if (environment === "cases") {
          return buildCases(
            matrixSource
              .split(/\\\\/)
              .map(function (row) { return row.trim(); })
              .filter(Boolean)
          );
        }

        return "";
      }

      if (name === "end" || name === "left" || name === "right" || name === "Big" || name === "big" || name === "Bigl" || name === "Bigr" || name === "bigl" || name === "bigr") {
        if (name === "end") {
          extractGroupSource();
        }
        return "";
      }

      if (name === "quad") {
        return "&nbsp;&nbsp;";
      }

      if (name === "qquad") {
        return "&nbsp;&nbsp;&nbsp;&nbsp;";
      }

      if (Object.prototype.hasOwnProperty.call(COMMANDS, name)) {
        return COMMANDS[name];
      }

      return escapeHtml(name);
    }

    function parseAtom() {
      var base = "";
      var char = input[index];

      if (char === "{") {
        base = renderMath(extractGroupSource());
      } else if (char === "\\") {
        base = parseCommand();
      } else {
        index += 1;
        base = escapeHtml(char);
      }

      while (index < input.length && (input[index] === "^" || input[index] === "_")) {
        var type = input[index];
        index += 1;
        base += type === "^" ? "<sup>" + parseScriptValue() + "</sup>" : "<sub>" + parseScriptValue() + "</sub>";
      }

      return base;
    }

    var html = "";

    while (index < input.length) {
      var current = input[index];

      if (current === "\n") {
        html += "<br>";
        index += 1;
        continue;
      }

      if (/[ \t]/.test(current)) {
        skipInlineSpaces();
        html += " ";
        continue;
      }

      html += parseAtom();
    }

    return html
      .replace(/ ?<br> ?/g, "<br>")
      .replace(/(<br>){3,}/g, "<br><br>")
      .trim();
  }

  function renderElement(element) {
    if (!element || element.dataset.texRendered === "1") {
      return;
    }

    var source = (element.textContent || "").trim();

    if (!/[\\_^]/.test(source)) {
      return;
    }

    element.innerHTML = renderMath(source);
    element.dataset.texRendered = "1";
  }

  function renderTree(root) {
    if (!root || root.nodeType !== 1) {
      return;
    }

    if (root.matches && root.matches(SELECTOR)) {
      renderElement(root);
    }

    if (!root.querySelectorAll) {
      return;
    }

    root.querySelectorAll(SELECTOR).forEach(renderElement);
  }

  ensureStyles();
  renderTree(document.body);

  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      mutation.addedNodes.forEach(function (node) {
        renderTree(node);
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
