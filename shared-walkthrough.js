/**
 * shared-walkthrough.js
 * Powers .ml-walkthrough step-by-step algorithm components.
 * No dependencies. Auto-initialises on DOMContentLoaded.
 *
 * Markup contract:
 *   .ml-walkthrough              — root container
 *     .ml-walkthrough__step      — one step (hidden by default)
 *     .wt-active                 — active step class (added by JS)
 *     [data-wt-prev]             — Prev button
 *     [data-wt-next]             — Next button
 *     [data-wt-cur]              — current step number text node
 *     [data-wt-tot]              — total steps text node
 *     .ml-walkthrough__progress-bar — CSS progress bar
 */
(function () {
  'use strict';

  function initOne(root) {
    var steps    = root.querySelectorAll('.ml-walkthrough__step');
    var btnPrev  = root.querySelector('[data-wt-prev]');
    var btnNext  = root.querySelector('[data-wt-next]');
    var spanCur  = root.querySelector('[data-wt-cur]');
    var spanTot  = root.querySelector('[data-wt-tot]');
    var bar      = root.querySelector('.ml-walkthrough__progress-bar');
    var total    = steps.length;
    var current  = 0;

    if (!total) return;
    if (spanTot) spanTot.textContent = total;

    function show(idx) {
      // Bounds
      idx = Math.max(0, Math.min(idx, total - 1));
      // Swap active class
      steps[current].classList.remove('wt-active');
      current = idx;
      steps[current].classList.add('wt-active');
      // Update counter
      if (spanCur) spanCur.textContent = current + 1;
      // Update progress bar
      if (bar) bar.style.width = ((current + 1) / total * 100) + '%';
      // Update button states
      if (btnPrev) btnPrev.disabled = current === 0;
      if (btnNext) btnNext.disabled = current === total - 1;
    }

    // Initialise first step
    show(0);

    if (btnPrev) btnPrev.addEventListener('click', function () { show(current - 1); });
    if (btnNext) btnNext.addEventListener('click', function () { show(current + 1); });

    // Keyboard navigation (←/→) when focus is inside the component
    root.setAttribute('tabindex', '0');
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown')  { e.preventDefault(); show(current + 1); }
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')    { e.preventDefault(); show(current - 1); }
    });
  }

  function initAll() {
    document.querySelectorAll('.ml-walkthrough').forEach(initOne);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
