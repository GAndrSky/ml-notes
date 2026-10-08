/**
 * shared-lesson-ui.js
 * Small UI helpers that lesson markup calls directly (onclick="...").
 * Part of bundle.js. A page that still defines its own version keeps it.
 */
(function () {
  'use strict';

  // Tabs: <button class="tab-btn" onclick="showTab('panelId', this)"> + <div class="tab-panel" id="panelId">
  if (typeof window.showTab !== 'function') {
    window.showTab = function (id, button) {
      document.querySelectorAll('.tab-panel').forEach(function (node) { node.classList.remove('active'); });
      document.querySelectorAll('.tab-btn').forEach(function (node) { node.classList.remove('active'); });
      document.getElementById(id).classList.add('active');
      button.classList.add('active');
    };
  }
})();
