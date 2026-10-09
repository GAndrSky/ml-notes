(function () {
  if (window.__mlNotesNavInitialized) {
    return;
  }
  window.__mlNotesNavInitialized = true;

  // Course structure lives in course-manifest.js (loaded first in bundle.js).
  var sections = (window.__mlNotesCourse && window.__mlNotesCourse.sections) || [];

  var visitedStorageKey = "ml_notes_visited";
  var collapsedStorageKey = "ml_notes_sidebar_collapsed";
  var rootUrl = new URL(
    ".",
    document.currentScript && document.currentScript.src
      ? document.currentScript.src
      : window.location.href
  );
  var siteBaseUrl = "https://gandrsky.github.io/ml-notes/";
  var indexHref = new URL("index.html", rootUrl).href;

  function pageHref(page) {
    return new URL(page.path, rootUrl).href;
  }

  var pages = [];
  sections.forEach(function (section, sectionIndex) {
    section.pages.forEach(function (page, pageIndexInSection) {
      pages.push({
        path: page.path,
        label: page.label,
        sectionId: section.id,
        sectionLabel: section.label,
        sectionTitle: section.title,
        sectionIndex: sectionIndex,
        pageIndexInSection: pageIndexInSection,
        sectionSize: section.pages.length
      });
    });
  });

  window.__mlNotesCourseData = {
    rootUrl: rootUrl.href,
    sections: sections.map(function (section) {
      return {
        id: section.id,
        label: section.label,
        title: section.title,
        accent: section.accent || "#7eb8b8",
        pages: section.pages.slice()
      };
    }),
    pages: pages.map(function (page) {
      return {
        path: page.path,
        label: page.label,
        sectionId: page.sectionId,
        sectionLabel: page.sectionLabel,
        sectionTitle: page.sectionTitle
      };
    }),
    totalLessons: pages.length
  };

  function readVisitedPaths() {
    var validPaths = Object.create(null);
    pages.forEach(function (page) {
      validPaths[page.path] = true;
    });

    try {
      var parsed = JSON.parse(window.localStorage.getItem(visitedStorageKey) || "[]");
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed.filter(function (path) {
        return typeof path === "string" && validPaths[path];
      });
    } catch (error) {
      return [];
    }
  }

  function writeVisitedPaths(paths) {
    try {
      window.localStorage.setItem(visitedStorageKey, JSON.stringify(paths));
    } catch (error) {
      // Ignore storage issues.
    }
  }

  function dispatchProgressChanged(paths) {
    window.dispatchEvent(
      new window.CustomEvent("ml-notes-progress-changed", {
        detail: { visitedPaths: paths.slice() }
      })
    );
  }

  function setVisited(path, shouldVisit) {
    var paths = readVisitedPaths();
    var index = paths.indexOf(path);

    if (shouldVisit && index === -1) {
      paths.push(path);
    }

    if (!shouldVisit && index !== -1) {
      paths.splice(index, 1);
    }

    writeVisitedPaths(paths);
    dispatchProgressChanged(paths);
    return paths;
  }

  function readCollapsedState() {
    try {
      return window.localStorage.getItem(collapsedStorageKey) === "1";
    } catch (error) {
      return false;
    }
  }

  function writeCollapsedState(value) {
    try {
      window.localStorage.setItem(collapsedStorageKey, value ? "1" : "0");
    } catch (error) {
      // Ignore storage issues.
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function ensureScript(relativePath, dataAttributeName, onLoad) {
    if (dataAttributeName && document.querySelector("script[" + dataAttributeName + '="1"]')) {
      if (typeof onLoad === "function") {
        window.setTimeout(onLoad, 0);
      }
      return;
    }

    var script = document.createElement("script");
    script.src = new URL(relativePath, rootUrl).href;
    script.defer = true;
    script.async = false;
    if (typeof onLoad === "function") {
      script.addEventListener("load", onLoad);
      script.addEventListener("error", onLoad);
    }
    if (dataAttributeName) {
      script.setAttribute(dataAttributeName, "1");
    }
    document.body.appendChild(script);
  }

  function upsertMeta(selector, builder) {
    var existing = document.head.querySelector(selector);
    if (existing) {
      return existing;
    }

    var element = builder();
    document.head.appendChild(element);
    return element;
  }

  function setMetaTag(name, content) {
    var meta = upsertMeta('meta[name="' + name + '"]', function () {
      var element = document.createElement("meta");
      element.setAttribute("name", name);
      return element;
    });
    meta.setAttribute("content", content);
  }

  function setOgTag(property, content) {
    var meta = upsertMeta('meta[property="' + property + '"]', function () {
      var element = document.createElement("meta");
      element.setAttribute("property", property);
      return element;
    });
    meta.setAttribute("content", content);
  }

  function ensureFavicon() {
    var icon = upsertMeta('link[rel="icon"]', function () {
      var element = document.createElement("link");
      element.setAttribute("rel", "icon");
      return element;
    });
    icon.setAttribute("type", "image/png");
    icon.setAttribute("href", new URL("favicon.png", rootUrl).href);
  }

  var currentUrl = new URL(window.location.href);
  currentUrl.search = "";
  currentUrl.hash = "";
  var currentHref = currentUrl.href;

  var currentIndex = pages.findIndex(function (page) {
    return pageHref(page) === currentHref;
  });

  if (currentIndex === -1) {
    return;
  }

  document.body.classList.add("ml-course-theme");

  var currentPage = pages[currentIndex];
  var currentSection = sections[currentPage.sectionIndex];
  var currentAccent = currentSection.accent || "#7eb8b8";
  var desktopQuery = window.matchMedia("(min-width: 960px)");
  var mobileOpen = false;
  var desktopCollapsed = readCollapsedState();

  document.body.dataset.mlSection = currentSection.id;
  document.body.style.setProperty("--section-accent", currentAccent);
  window.__mlNotesCurrentPagePath = currentPage.path;

  document.title = currentPage.label + " - ML notes";
  setMetaTag("description", currentPage.label + " - interactive ML notes with formulas, visualizations, and code.");
  setOgTag("og:title", currentPage.label + " - ML notes");
  setOgTag("og:description", currentPage.label + " - interactive ML notes with formulas, visualizations, and code.");
  setOgTag("og:url", new URL(currentPage.path, siteBaseUrl).href);
  ensureFavicon();

  var previousPage = pages[currentIndex - 1] || null;
  var nextPage = pages[currentIndex + 1] || null;

  function buildInlineAction(page, text, className) {
    if (!page) {
      return '<span class="' + className + ' is-disabled">' + escapeHtml(text) + "</span>";
    }

    return '<a class="' + className + '" href="' + pageHref(page) + '">' + escapeHtml(text) + "</a>";
  }

  function buildSidebarLink(page, visitedSet) {
    var isCurrent = page.path === currentPage.path;
    var isVisited = !!visitedSet[page.path];

    return (
      '<a class="ml-page-nav__link' +
      (isCurrent ? " is-current" : "") +
      '" data-path="' +
      escapeHtml(page.path) +
      '" data-label="' +
      escapeHtml(page.label.toLowerCase()) +
      '" href="' +
      pageHref(page) +
      '">' +
      '<span class="ml-page-nav__link-label">' +
      escapeHtml(page.label) +
      "</span>" +
      '<span class="ml-page-nav__link-check' +
      (isVisited ? " is-visible" : "") +
      '" aria-hidden="true">\u2713</span>' +
      "</a>"
    );
  }

  function buildSectionMarkup(section, visitedSet) {
    var sectionPages = pages.filter(function (page) {
      return page.sectionId === section.id;
    });
    var isCurrentSection = section.id === currentSection.id;

    return (
      '<details class="ml-page-nav__section"' +
      (isCurrentSection ? " open" : "") +
      ' data-section="' +
      escapeHtml(section.id) +
      '">' +
      '<summary class="ml-page-nav__section-summary">' +
      '<div class="ml-page-nav__section-meta">' +
      '<span class="ml-page-nav__section-kicker">' +
      escapeHtml(section.label) +
      "</span>" +
      '<strong class="ml-page-nav__section-title">' +
      escapeHtml(section.title) +
      "</strong>" +
      "</div>" +
      '<span class="ml-page-nav__section-count">' +
      sectionPages.length +
      "</span>" +
      "</summary>" +
      '<div class="ml-page-nav__section-links">' +
      sectionPages.map(function (page) { return buildSidebarLink(page, visitedSet); }).join("") +
      "</div>" +
      "</details>"
    );
  }

  function buildPagerCard(page, kicker, className, fallbackText) {
    if (!page) {
      return (
        '<span class="ml-page-pager__card ' +
        className +
        ' is-disabled">' +
        '<span class="ml-page-pager__kicker">' +
        escapeHtml(kicker) +
        "</span>" +
        '<strong class="ml-page-pager__title">' +
        escapeHtml(fallbackText) +
        "</strong>" +
        "</span>"
      );
    }

    return (
      '<a class="ml-page-pager__card ' +
      className +
      '" href="' +
      pageHref(page) +
      '">' +
      '<span class="ml-page-pager__kicker">' +
      escapeHtml(kicker) +
      "</span>" +
      '<strong class="ml-page-pager__title">' +
      escapeHtml(page.label) +
      "</strong>" +
      "</a>"
    );
  }

  var initialVisitedPaths = readVisitedPaths();
  if (initialVisitedPaths.indexOf(currentPage.path) === -1) {
    initialVisitedPaths.push(currentPage.path);
    writeVisitedPaths(initialVisitedPaths);
    dispatchProgressChanged(initialVisitedPaths);
  }

  var initialVisitedSet = {};
  initialVisitedPaths.forEach(function (path) {
    initialVisitedSet[path] = true;
  });

  var navShell = document.createElement("div");
  navShell.className = "ml-page-nav-shell";
  navShell.innerHTML =
    '<button class="ml-page-nav__mobile-toggle" type="button" aria-expanded="false" aria-controls="ml-course-sidebar" aria-label="\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u043d\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u044e">\u2630</button>' +
    '<div class="ml-page-nav__overlay" hidden></div>' +
    '<aside class="ml-page-nav" id="ml-course-sidebar" aria-label="\u041d\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u044f \u043f\u043e \u043a\u0443\u0440\u0441\u0443">' +
    '<div class="ml-page-nav__toolbar">' +
    '<div class="ml-page-nav__toolbar-meta">' +
    '<span class="ml-page-nav__current-kicker">' +
    escapeHtml(currentPage.sectionLabel) +
    " \u00b7 " +
    (currentPage.pageIndexInSection + 1) +
    " / " +
    currentPage.sectionSize +
    "</span>" +
    '<strong class="ml-page-nav__current-title">' +
    escapeHtml(currentPage.label) +
    "</strong>" +
    '<span class="ml-page-nav__course-subtitle">' +
    escapeHtml(currentSection.title) +
    "</span>" +
    "</div>" +
    '<div class="ml-page-nav__toolbar-actions-inline">' +
    '<button class="ml-page-nav__collapse" type="button" aria-label="\u0421\u0432\u0435\u0440\u043d\u0443\u0442\u044c \u0431\u043e\u043a\u043e\u0432\u043e\u0435 \u043c\u0435\u043d\u044e">\u00ab</button>' +
    '<button class="ml-page-nav__close" type="button" aria-label="\u0417\u0430\u043a\u0440\u044b\u0442\u044c \u043c\u0435\u043d\u044e">\u00d7</button>' +
    "</div>" +
    "</div>" +
    '<div class="ml-page-nav__panel">' +
    '<div class="ml-page-nav__course-meta">' +
    '<span class="ml-page-nav__course-kicker">\u0412\u0435\u0441\u044c \u043a\u0443\u0440\u0441</span>' +
    '<strong class="ml-page-nav__course-title">' +
    pages.length +
    " \u0442\u0435\u043c \u0432 \u043e\u0434\u043d\u043e\u043c \u043a\u043e\u043d\u0441\u043f\u0435\u043a\u0442\u0435" +
    "</strong>" +
    '<span class="ml-page-nav__course-subtitle ml-page-nav__progress-text"></span>' +
    '<div class="ml-page-nav__progress"><span></span></div>' +
    '<div class="ml-page-nav__utility-row">' +
    '<button class="ml-page-nav__visit-toggle" type="button"></button>' +
    "</div>" +
    "</div>" +
    '<div class="ml-page-nav__actions">' +
    buildInlineAction(previousPage, "\u2190 \u041d\u0430\u0437\u0430\u0434", "ml-page-nav__action-link") +
    '<a class="ml-page-nav__action-link" href="' +
    indexHref +
    '">\u0413\u043b\u0430\u0432\u043d\u0430\u044f</a>' +
    buildInlineAction(nextPage, "\u0414\u0430\u043b\u0435\u0435 \u2192", "ml-page-nav__action-link") +
    "</div>" +
    '<div class="ml-page-nav__sections">' +
    sections.map(function (section) { return buildSectionMarkup(section, initialVisitedSet); }).join("") +
    "</div>" +
    "</div>" +
    "</aside>";

  document.body.insertBefore(navShell, document.body.firstChild);

  var pageContainer = document.querySelector(".page");

  var detachedLessonContentSelector = [
    "main",
    "section",
    "article",
    "aside",
    "header",
    "footer",
    ".hero",
    ".card",
    ".grid-2",
    ".grid-3",
    ".formula",
    ".formula-anatomy",
    ".intuition",
    ".info",
    ".warn",
    ".success",
    ".step",
    ".concept-walkthrough",
    ".classic-theory-note",
    ".classic-viz-note",
    ".ml-practice-section",
    ".ml-theory-section",
    ".ml-explainer-section",
    ".ml-advanced-section",
    ".ml-endcap-section",
    ".ml-study-header",
    ".ml-formula-explainer"
  ].join(", ");

  function isDetachedLessonContent(element) {
    if (!element || element === pageContainer || element === navShell) {
      return false;
    }

    if (element.matches("script, style, link, template, noscript")) {
      return false;
    }

    if (
      element.classList.contains("ml-page-nav-shell") ||
      element.classList.contains("ml-page-pager")
    ) {
      return false;
    }

    return element.matches(detachedLessonContentSelector);
  }

  function normalizeDetachedLessonContent() {
    if (!pageContainer) {
      return;
    }

    Array.prototype.slice.call(document.body.children).forEach(function (element) {
      if (isDetachedLessonContent(element)) {
        pageContainer.appendChild(element);
      }
    });
  }

  var bottomNav = document.createElement("nav");
  bottomNav.className = "ml-page-pager";
  bottomNav.setAttribute("aria-label", "\u041f\u0435\u0440\u0435\u0445\u043e\u0434 \u043c\u0435\u0436\u0434\u0443 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0430\u043c\u0438");
  bottomNav.innerHTML =
    buildPagerCard(previousPage, "\u2190 \u041f\u0440\u0435\u0434\u044b\u0434\u0443\u0449\u0430\u044f \u0442\u0435\u043c\u0430", "is-previous", "\u041d\u0435\u0442 \u043f\u0440\u0435\u0434\u044b\u0434\u0443\u0449\u0435\u0439 \u0442\u0435\u043c\u044b") +
    '<a class="ml-page-pager__card is-home" href="' +
    indexHref +
    '">' +
    '<span class="ml-page-pager__kicker">\u041e\u0433\u043b\u0430\u0432\u043b\u0435\u043d\u0438\u0435</span>' +
    '<strong class="ml-page-pager__title">\u0412\u0435\u0440\u043d\u0443\u0442\u044c\u0441\u044f \u043d\u0430 \u0433\u043b\u0430\u0432\u043d\u0443\u044e</strong>' +
    "</a>" +
    buildPagerCard(nextPage, "\u0421\u043b\u0435\u0434\u0443\u044e\u0449\u0430\u044f \u0442\u0435\u043c\u0430 \u2192", "is-next", "\u041f\u043e\u0441\u043b\u0435\u0434\u043d\u044f\u044f \u0442\u0435\u043c\u0430 \u0431\u043b\u043e\u043a\u0430");

  function placeBottomPager() {
    if (pageContainer) {
      normalizeDetachedLessonContent();
      if (pageContainer.lastElementChild !== bottomNav) {
        pageContainer.appendChild(bottomNav);
      }
      return;
    }

    if (document.body.lastElementChild !== bottomNav) {
      document.body.appendChild(bottomNav);
    }
  }

  placeBottomPager();
  window.addEventListener("load", placeBottomPager);

  function readSelfRatings() {
    try {
      var parsed = JSON.parse(localStorage.getItem("ml_notes_self_rating") || "{}");
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch (error) {
      return {};
    }
  }

  function writeSelfRatings(ratings) {
    localStorage.setItem("ml_notes_self_rating", JSON.stringify(ratings || {}));
    window.dispatchEvent(new CustomEvent("ml-notes-self-rating-changed", { detail: { ratings: ratings || {} } }));
  }

  function initSelfRatings() {
    var widgets = Array.prototype.slice.call(document.querySelectorAll(".ml-self-rating[data-topic-id]"));
    if (!widgets.length) {
      return;
    }

    var ratings = readSelfRatings();

    widgets.forEach(function (widget) {
      // initSelfRatings runs more than once; a second set of handlers would undo every click.
      if (widget.getAttribute("data-rating-ready") === "1") {
        return;
      }
      widget.setAttribute("data-rating-ready", "1");

      var topicId = widget.getAttribute("data-topic-id");
      var buttons = Array.prototype.slice.call(widget.querySelectorAll("button[data-rating]"));
      var status = widget.querySelector("[data-rating-status]");

      function render(value) {
        buttons.forEach(function (button) {
          button.classList.toggle("is-active", String(value || "") === button.getAttribute("data-rating"));
        });
        if (status) {
          status.textContent = value
            ? "\u0422\u0435\u043a\u0443\u0449\u0430\u044f \u043e\u0446\u0435\u043d\u043a\u0430: " + value + "/5"
            : "\u041f\u043e\u043a\u0430 \u0431\u0435\u0437 \u043e\u0446\u0435\u043d\u043a\u0438";
        }
      }

      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          var nextValue = Number(button.getAttribute("data-rating"));
          ratings = readSelfRatings();
          if (ratings[topicId] === nextValue) {
            delete ratings[topicId];
            render(null);
          } else {
            ratings[topicId] = nextValue;
            render(nextValue);
          }
          writeSelfRatings(ratings);
        });
      });

      render(ratings[topicId]);
    });
  }

  var mobileToggle = navShell.querySelector(".ml-page-nav__mobile-toggle");
  var overlay = navShell.querySelector(".ml-page-nav__overlay");
  var closeButton = navShell.querySelector(".ml-page-nav__close");
  var collapseButton = navShell.querySelector(".ml-page-nav__collapse");
  var progressText = navShell.querySelector(".ml-page-nav__progress-text");
  var progressBar = navShell.querySelector(".ml-page-nav__progress span");
  var visitToggleButton = navShell.querySelector(".ml-page-nav__visit-toggle");
  var sectionNodes = Array.prototype.slice.call(navShell.querySelectorAll(".ml-page-nav__section"));

  function syncSidebarState() {
    var isDesktop = desktopQuery.matches;

    navShell.classList.toggle("is-open", !isDesktop && mobileOpen);
    navShell.classList.toggle("is-desktop-collapsed", isDesktop && desktopCollapsed);
    document.body.classList.toggle("ml-sidebar-open", !isDesktop && mobileOpen);
    document.body.classList.toggle("ml-sidebar-collapsed", isDesktop && desktopCollapsed);

    overlay.hidden = !(!isDesktop && mobileOpen);
    mobileToggle.setAttribute("aria-expanded", !isDesktop && mobileOpen ? "true" : "false");
    collapseButton.textContent = isDesktop && desktopCollapsed ? "\u00bb" : "\u00ab";
    collapseButton.setAttribute(
      "aria-label",
      isDesktop && desktopCollapsed
        ? "\u0420\u0430\u0437\u0432\u0435\u0440\u043d\u0443\u0442\u044c \u0431\u043e\u043a\u043e\u0432\u043e\u0435 \u043c\u0435\u043d\u044e"
        : "\u0421\u0432\u0435\u0440\u043d\u0443\u0442\u044c \u0431\u043e\u043a\u043e\u0432\u043e\u0435 \u043c\u0435\u043d\u044e"
    );
  }

  function refreshVisitedUi(paths) {
    var visitedSet = {};
    paths.forEach(function (path) {
      visitedSet[path] = true;
    });

    Array.prototype.slice.call(navShell.querySelectorAll(".ml-page-nav__link")).forEach(function (link) {
      var path = link.getAttribute("data-path");
      var check = link.querySelector(".ml-page-nav__link-check");
      if (!check) {
        return;
      }
      check.classList.toggle("is-visible", !!visitedSet[path]);
    });

    var visitedCount = paths.length;
    var progressPercent = pages.length ? Math.round((visitedCount / pages.length) * 100) : 0;
    var currentVisited = !!visitedSet[currentPage.path];

    progressText.textContent =
      "\u0418\u0437\u0443\u0447\u0435\u043d\u043e: " + visitedCount + " \u0438\u0437 " + pages.length + " \u00b7 " + progressPercent + "%";
    progressBar.style.width = progressPercent + "%";
    visitToggleButton.textContent = currentVisited
      ? "\u0421\u043d\u044f\u0442\u044c \u0433\u0430\u043b\u043e\u0447\u043a\u0443 \u0441 \u0442\u0435\u043a\u0443\u0449\u0435\u0439 \u0442\u0435\u043c\u044b"
      : "\u041e\u0442\u043c\u0435\u0442\u0438\u0442\u044c \u0442\u0435\u043a\u0443\u0449\u0443\u044e \u0442\u0435\u043c\u0443 \u043a\u0430\u043a \u043f\u0440\u043e\u0439\u0434\u0435\u043d\u043d\u0443\u044e";
  }

  function applyFilter(value) {
    var query = String(value || "").trim().toLowerCase();

    sectionNodes.forEach(function (sectionNode) {
      var links = Array.prototype.slice.call(sectionNode.querySelectorAll(".ml-page-nav__link"));
      var hasVisible = false;

      links.forEach(function (link) {
        var matches = !query || link.getAttribute("data-label").indexOf(query) !== -1;
        link.hidden = !matches;
        if (matches) {
          hasVisible = true;
        }
      });

      sectionNode.classList.toggle("is-empty", !hasVisible);
      sectionNode.open = query ? hasVisible : sectionNode.getAttribute("data-section") === currentSection.id;
    });
  }

  mobileToggle.addEventListener("click", function () {
    if (desktopQuery.matches) {
      desktopCollapsed = !desktopCollapsed;
      writeCollapsedState(desktopCollapsed);
      syncSidebarState();
      return;
    }

    mobileOpen = !mobileOpen;
    syncSidebarState();
  });

  closeButton.addEventListener("click", function () {
    mobileOpen = false;
    syncSidebarState();
  });

  collapseButton.addEventListener("click", function () {
    desktopCollapsed = !desktopCollapsed;
    writeCollapsedState(desktopCollapsed);
    syncSidebarState();
  });

  overlay.addEventListener("click", function () {
    mobileOpen = false;
    syncSidebarState();
  });

  visitToggleButton.addEventListener("click", function () {
    var currentlyVisited = !!navShell.querySelector('.ml-page-nav__link[data-path="' + currentPage.path + '"] .ml-page-nav__link-check.is-visible');
    var updated = setVisited(currentPage.path, !currentlyVisited);
    refreshVisitedUi(updated);
  });

  navShell.addEventListener("click", function (event) {
    var target = event.target;
    if (!target || !target.closest) {
      return;
    }

    if (target.closest(".ml-page-nav__link") && !desktopQuery.matches) {
      mobileOpen = false;
      syncSidebarState();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      mobileOpen = false;
      syncSidebarState();
    }
  });

  desktopQuery.addEventListener("change", function () {
    if (desktopQuery.matches) {
      mobileOpen = false;
    }
    syncSidebarState();
  });

  window.addEventListener("ml-notes-progress-changed", function (event) {
    var paths = event && event.detail && Array.isArray(event.detail.visitedPaths)
      ? event.detail.visitedPaths
      : readVisitedPaths();
    refreshVisitedUi(paths);
  });

  applyFilter("");
  refreshVisitedUi(readVisitedPaths());
  syncSidebarState();
  initSelfRatings();

  var hasMathCandidates = Array.prototype.some.call(
    document.querySelectorAll(".formula, .inline-math, [data-render-tex]"),
    function (element) {
      return !element.hasAttribute("data-no-tex");
    }
  );

  var hasFormulaExplainCandidates = document.querySelector(".formula, .fm, .inline-math, [data-render-tex]");

  var hasCodeCandidates = Array.prototype.some.call(
    document.querySelectorAll("pre code, .formula[data-code-block], .formula"),
    function (element) {
      var text = String(element.textContent || "").trim();
      if (!text) {
        return false;
      }
      return /(import\s+\w+|from\s+\w+\s+import|def\s+\w+\(|class\s+\w+|function\s+\w+\(|const\s+|let\s+|=>|#!\/bin\/bash|echo\s+|torch\.|np\.|numpy|console\.log)/im.test(text);
    }
  );

  if (currentPage.sectionId === "classic-ml") {
    ensureScript("shared-classic-ml-practice.js", "data-ml-practice-script", placeBottomPager);
  }

  ensureScript("shared-theory-notes.js", "data-ml-theory-script", placeBottomPager);

  if (currentPage.sectionId !== "math") {
    ensureScript("shared-explainer-notes.js", "data-ml-explainer-script", placeBottomPager);
  }

  ensureScript("shared-advanced-notes.js", "data-ml-advanced-script", placeBottomPager);

  ensureScript("shared-interactive-guides.js", "data-ml-interactive-guides-script", placeBottomPager);

  if (hasFormulaExplainCandidates) {
    ensureScript("shared-formula-explainers.js", "data-ml-formula-explainer-script", placeBottomPager);
  }

  if (hasMathCandidates) {
    ensureScript("shared-katex.js", "data-ml-katex-script", placeBottomPager);
  }

  if (hasCodeCandidates) {
    ensureScript("shared-code-highlight.js", "data-ml-code-highlight-script", placeBottomPager);
  }
})();
