/**
 * shared-prevnext.js
 * Injects prev/next navigation + section progress bar into every page.
 * Auto-initialises when DOM is ready.
 *
 * Page order and titles come from course-manifest.js.
 */
(function () {
  'use strict';

  if (window.__mlNotesPrevNextInitialized) return;
  window.__mlNotesPrevNextInitialized = true;

  // Flatten course-manifest.js into [pagerTitle, path, title] entries.
  var PAGES = [];
  ((window.__mlNotesCourse && window.__mlNotesCourse.sections) || []).forEach(function (section) {
    section.pages.forEach(function (page) {
      PAGES.push([section.pagerTitle, page.path, page.title]);
    });
  });

  /** Relative URL from one page to another (both in section/page.html format). */
  function relUrl(fromPath, toPath) {
    var fromDir = fromPath.split('/')[0];
    var toDir   = toPath.split('/')[0];
    var toFile  = toPath.split('/')[1];
    return (fromDir === toDir) ? toFile : ('../' + toDir + '/' + toFile);
  }

  /** Detect which page we're on by matching pathname to PAGES entries. */
  function detectCurrent() {
    var pn = window.location.pathname.replace(/\\/g, '/');
    for (var i = 0; i < PAGES.length; i++) {
      var rel  = PAGES[i][1];
      var dir  = rel.split('/')[0];
      var file = rel.split('/')[1];
      if (pn.indexOf('/' + dir + '/' + file) !== -1) return i;
    }
    return -1;
  }

  function init() {
    var cur = detectCurrent();
    if (cur === -1) return;

    var section = PAGES[cur][0];
    var fromPath = PAGES[cur][1];

    // Section bounds
    var sStart = cur, sEnd = cur;
    while (sStart > 0 && PAGES[sStart - 1][0] === section) sStart--;
    while (sEnd < PAGES.length - 1 && PAGES[sEnd + 1][0] === section) sEnd++;
    var posInSection  = cur - sStart + 1;
    var sectionTotal  = sEnd - sStart + 1;
    var pct = Math.round(posInSection / sectionTotal * 100);

    var prevEntry = cur > 0 ? PAGES[cur - 1] : null;
    var nextEntry = cur < PAGES.length - 1 ? PAGES[cur + 1] : null;

    function makeBtn(entry, isPrev) {
      var cls = 'ml-prevnext__btn ml-prevnext__btn--' + (isPrev ? 'prev' : 'next');
      var lbl = isPrev ? '← Назад' : 'Вперёд →'; // ← Назад / Вперёд →
      var titleEl = '<span class="ml-prevnext__title">' + (entry ? entry[2] : '') + '</span>';
      var labelEl = '<span class="ml-prevnext__label">' + lbl + '</span>';
      var inner   = isPrev ? (labelEl + titleEl) : (titleEl + labelEl);

      if (!entry) {
        return '<span class="' + cls + ' ml-prevnext__btn--ghost">' + inner + '</span>';
      }
      var href = relUrl(fromPath, entry[1]);
      return '<a href="' + href + '" class="' + cls + '">' + inner + '</a>';
    }

    var html = '<nav class="ml-prevnext" aria-label="Навигация по курсу">'
      + makeBtn(prevEntry, true)
      + '<div class="ml-prevnext__progress">'
      +   '<span class="ml-prevnext__pos">' + posInSection + ' / ' + sectionTotal + '</span>'
      +   '<div class="ml-prevnext__bar"><div class="ml-prevnext__fill" style="width:' + pct + '%"></div></div>'
      +   '<span class="ml-prevnext__section">' + section + '</span>'
      + '</div>'
      + makeBtn(nextEntry, false)
      + '</nav>';

    var nav = document.createElement('div');
    nav.innerHTML = html;
    document.body.appendChild(nav.firstChild);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
