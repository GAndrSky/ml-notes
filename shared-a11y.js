/* shared-a11y.js - accessible names for interactive widgets.
 *
 * Many lesson widgets show their label as plain text next to the control
 * ("x₀ = <span>1.00</span>" followed by <input type="range">), which screen readers
 * do not associate with the control. This pass, run on load and for widgets added
 * later, gives every unnamed form control an aria-label taken from that visible text,
 * marks canvases as images labelled by the nearest heading, and names icon-only buttons.
 * It never overrides an existing accessible name.
 */
(function () {
  if (window.__mlNotesA11yInitialized) return;
  window.__mlNotesA11yInitialized = true;

  var VALUE_SELECTOR = '[id$="Val"],[id$="val"],[id$="Value"],[id$="Disp"],[id$="-disp"],.val-display,.ml-slider-lab__param-value,output,input,select,textarea,button,canvas,svg';

  function clean(text) {
    return String(text || "").replace(/\s+/g, " ").replace(/[\s:=≈]+$/, "").trim().slice(0, 90);
  }

  function visibleText(el) {
    var copy = el.cloneNode(true);
    Array.prototype.forEach.call(copy.querySelectorAll(VALUE_SELECTOR), function (x) { x.remove(); });
    return clean(copy.textContent);
  }

  function hasName(el) {
    if (el.getAttribute("aria-label") || el.getAttribute("aria-labelledby") || el.getAttribute("title")) return true;
    if (el.closest("label")) return true;
    if (el.id && document.querySelector('label[for="' + el.id.replace(/"/g, '\\"') + '"]')) return true;
    return false;
  }

  function nameControl(el) {
    if (hasName(el)) return;
    var label = "";
    for (var p = el.previousElementSibling; p && !label; p = p.previousElementSibling) label = visibleText(p);
    for (var par = el.parentElement, k = 0; par && !label && k < 2; par = par.parentElement, k++) label = visibleText(par);
    if (!label && el.placeholder) label = clean(el.placeholder);
    if (label) { el.setAttribute("aria-label", label); el.setAttribute("data-a11y-auto", ""); }
  }

  function nameCanvas(canvas) {
    if (canvas.getAttribute("aria-label") || canvas.getAttribute("aria-labelledby")) return;
    // nearest heading that comes before the canvas, searching outwards through its containers
    var heading = "";
    for (var p = canvas.parentElement; p && !heading; p = p.parentElement) {
      var hs = p.querySelectorAll("h2, h3, .ml-slider-lab__title");
      for (var i = hs.length - 1; i >= 0 && !heading; i--) {
        if (hs[i].compareDocumentPosition(canvas) & Node.DOCUMENT_POSITION_FOLLOWING) heading = clean(hs[i].textContent);
      }
      if (p === document.body) break;
    }
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", heading ? "Интерактивный график: " + heading : "Интерактивный график");
  }

  function nameIconButton(btn) {
    if (hasName(btn) || clean(btn.textContent).replace(/[←→↑↓×✕▶◀‹›«»]/g, "").trim()) return;
    if (btn.hasAttribute("data-wt-prev")) btn.setAttribute("aria-label", "Предыдущий шаг");
    else if (btn.hasAttribute("data-wt-next")) btn.setAttribute("aria-label", "Следующий шаг");
    else if (/←|‹|«|◀/.test(btn.textContent)) btn.setAttribute("aria-label", "Назад");
    else if (/→|›|»|▶/.test(btn.textContent)) btn.setAttribute("aria-label", "Вперёд");
    else if (/×|✕/.test(btn.textContent)) btn.setAttribute("aria-label", "Закрыть");
  }

  function run(root) {
    if (!root || !root.querySelectorAll) return;
    var controls = root.querySelectorAll('input:not([type="hidden"]):not([type="button"]):not([type="submit"]), select, textarea');
    Array.prototype.forEach.call(controls, nameControl);
    // controls that got the same generated name inside one container (matrix cells, etc.) get numbered
    var groups = new Map();
    Array.prototype.forEach.call(controls, function (el) {
      if (!el.hasAttribute("data-a11y-auto")) return;
      var key = (el.parentElement && el.parentElement.parentElement) ? el.parentElement.parentElement : el.parentElement;
      var name = el.getAttribute("data-a11y-base") || el.getAttribute("aria-label");
      if (!groups.has(key)) groups.set(key, {});
      (groups.get(key)[name] = groups.get(key)[name] || []).push(el);
    });
    groups.forEach(function (byName) {
      Object.keys(byName).forEach(function (name) {
        var list = byName[name];
        if (list.length < 2) return;
        list.forEach(function (el, i) { el.setAttribute("data-a11y-base", name); el.setAttribute("aria-label", name + ", ячейка " + (i + 1)); });
      });
    });
    Array.prototype.forEach.call(root.querySelectorAll("canvas"), nameCanvas);
    Array.prototype.forEach.call(root.querySelectorAll("button"), nameIconButton);
  }

  function start() {
    run(document.body);
    var pending = false;
    new MutationObserver(function () {
      if (pending) return;
      pending = true;
      // batch DOM changes from widgets that rebuild their markup
      setTimeout(function () { pending = false; run(document.body); }, 200);
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
