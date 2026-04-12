(function () {
  if (window.__mlNotesSearchInitialized) {
    return;
  }
  window.__mlNotesSearchInitialized = true;
  var script = document.currentScript;
  var rootUrl = new URL(".", script && script.src ? script.src : window.location.href);
  var indexScriptUrl = new URL("shared-search-index.js", rootUrl).href;
  var extraIndexScriptUrl = new URL("shared-search-extra-index.js", rootUrl).href;
  var searchCssUrl = new URL("shared-search.css", rootUrl).href;
  var fuseUrl = new URL("vendor/fuse.min.js", rootUrl).href;
  var MIN_QUERY_LENGTH = 2;
  var searchIndexPromise = null;
  var searchExtraIndexPromise = null;

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function normalizeWhitespace(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

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

  function ensureScript(src, testGlobal, id) {
    if (testGlobal && window[testGlobal]) {
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

  function ensureSearchIndex() {
    if (window.__mlNotesSearchIndex) {
      return Promise.resolve(window.__mlNotesSearchIndex);
    }

    if (!searchIndexPromise) {
      searchIndexPromise = ensureScript(indexScriptUrl, "__mlNotesSearchIndex", "ml-notes-search-index-script")
        .then(function () {
          return window.__mlNotesSearchIndex || [];
        });
    }

    return searchIndexPromise;
  }

  function ensureExtraSearchIndex() {
    if (window.__mlNotesSearchExtraIndex) {
      return Promise.resolve(window.__mlNotesSearchExtraIndex);
    }

    if (!searchExtraIndexPromise) {
      searchExtraIndexPromise = ensureScript(extraIndexScriptUrl, "__mlNotesSearchExtraIndex", "ml-notes-search-extra-index-script")
        .then(function () {
          return window.__mlNotesSearchExtraIndex || [];
        })
        .catch(function () {
          return [];
        });
    }

    return searchExtraIndexPromise;
  }

  function mergeSearchRecords(baseRecords, extraRecords) {
    var merged = [];
    var seen = Object.create(null);

    [baseRecords || [], extraRecords || []].forEach(function (records) {
      records.forEach(function (record) {
        if (!record || !record.path || seen[record.path]) {
          return;
        }
        seen[record.path] = true;
        merged.push(record);
      });
    });

    return merged;
  }

  function buildSnippet(record, query) {
    var source = normalizeWhitespace(record.summary || "") + " " + normalizeWhitespace(record.headings || "") + " " + normalizeWhitespace(record.content || "");
    var normalizedQuery = normalizeWhitespace(query);
    var lowerSource = source.toLowerCase();
    var lowerQuery = normalizedQuery.toLowerCase();
    var index = lowerSource.indexOf(lowerQuery);

    if (index === -1) {
      return source.slice(0, 180).trim() + (source.length > 180 ? "…" : "");
    }

    var start = Math.max(0, index - 70);
    var end = Math.min(source.length, index + normalizedQuery.length + 110);
    var snippet = source.slice(start, end).trim();

    if (start > 0) {
      snippet = "…" + snippet;
    }

    if (end < source.length) {
      snippet += "…";
    }

    return snippet;
  }

  function highlightQuery(text, query) {
    if (!query) {
      return escapeHtml(text);
    }

    var pattern = new RegExp("(" + escapeRegExp(query) + ")", "ig");
    return escapeHtml(text).replace(pattern, "<mark>$1</mark>");
  }

  function searchFallback(records, query) {
    var lowerQuery = query.toLowerCase();

    return records
      .map(function (record) {
        var haystack = [
          record.title,
          record.section,
          record.summary,
          record.headings,
          record.content
        ].join(" ").toLowerCase();

        var titleIndex = (record.title || "").toLowerCase().indexOf(lowerQuery);
        var contentIndex = haystack.indexOf(lowerQuery);

        if (contentIndex === -1) {
          return null;
        }

        return {
          item: record,
          score: titleIndex === -1 ? contentIndex + 1000 : titleIndex
        };
      })
      .filter(Boolean)
      .sort(function (left, right) {
        return left.score - right.score;
      })
      .slice(0, 8);
  }

  function createResultsMarkup(matches, query) {
    if (!matches.length) {
      return '<div class="ml-search__status">Ничего не нашлось. Попробуй короче запрос или другое ключевое слово.</div>';
    }

    return matches
      .map(function (match) {
        var record = match.item || match;
        var title = highlightQuery(record.title || record.label || record.path, query);
        var snippet = highlightQuery(buildSnippet(record, query), query);
        var section = escapeHtml(record.section || record.sectionTitle || "");

        return (
          '<a class="ml-search__result" href="' + new URL(record.path, rootUrl).href + '">' +
          '<div class="ml-search__meta"><span class="ml-search__badge">' + section + "</span></div>" +
          '<div class="ml-search__title">' + title + "</div>" +
          '<p class="ml-search__snippet">' + snippet + "</p>" +
          "</a>"
        );
      })
      .join("");
  }

  function mountSearch(container, options) {
    if (!container || container.querySelector(".ml-search")) {
      return;
    }

    var wrapper = document.createElement("div");
    wrapper.className = "ml-search " + (options.mode === "hero" ? "ml-search--hero" : "ml-search--nav");
    wrapper.innerHTML =
      '<label class="ml-search__label" for="' + options.id + '">Поиск по конспекту</label>' +
      '<input class="ml-search__input" id="' + options.id + '" type="search" placeholder="Например: Adam, Jacobian, dropout, attention" autocomplete="off" />' +
      '<div class="ml-search__hint">Ищет по названиям тем, подзаголовкам и тексту конспектов без сервера.</div>' +
      '<div class="ml-search__results" hidden></div>';

    if (options.mode === "nav") {
      var sections = container.querySelector(".ml-page-nav__sections");
      if (sections) {
        container.insertBefore(wrapper, sections);
      } else {
        container.appendChild(wrapper);
      }
    } else {
      container.appendChild(wrapper);
    }

    var input = wrapper.querySelector(".ml-search__input");
    var results = wrapper.querySelector(".ml-search__results");
    var docs = null;
    var fuse = null;
    var isLoading = false;

    function renderStatus(message) {
      results.hidden = false;
      results.innerHTML = '<div class="ml-search__status">' + escapeHtml(message) + "</div>";
    }

    function ensureSearchReady() {
      if (docs) {
        return Promise.resolve({ docs: docs, fuse: fuse });
      }

      if (isLoading) {
        return new Promise(function (resolve) {
          var timer = window.setInterval(function () {
            if (!isLoading && docs) {
              window.clearInterval(timer);
              resolve({ docs: docs, fuse: fuse });
            }
          }, 60);
        });
      }

      isLoading = true;
      renderStatus("Индексация конспектов…");

      return Promise.all([
        ensureSearchIndex(),
        ensureExtraSearchIndex(),
        ensureScript(fuseUrl, "Fuse", "ml-notes-fuse-script")
      ]).then(function (payload) {
        docs = mergeSearchRecords(payload[0], payload[1]);

        if (window.Fuse && docs.length) {
          fuse = new window.Fuse(docs, {
            includeScore: true,
            threshold: 0.32,
            ignoreLocation: true,
            minMatchCharLength: 2,
            keys: [
              { name: "title", weight: 0.42 },
              { name: "section", weight: 0.08 },
              { name: "summary", weight: 0.18 },
              { name: "headings", weight: 0.14 },
              { name: "content", weight: 0.18 }
            ]
          });
        }

        isLoading = false;
        return { docs: docs, fuse: fuse };
      }).catch(function () {
        isLoading = false;
        docs = mergeSearchRecords(window.__mlNotesSearchIndex || [], window.__mlNotesSearchExtraIndex || []);
        return { docs: docs, fuse: null };
      });
    }

    function runSearch(query) {
      var normalized = normalizeWhitespace(query);

      if (normalized.length < MIN_QUERY_LENGTH) {
        results.hidden = true;
        results.innerHTML = "";
        return;
      }

      ensureSearchReady().then(function (state) {
        var matches = state.fuse ? state.fuse.search(normalized, { limit: 8 }) : searchFallback(state.docs, normalized);
        results.hidden = false;
        results.innerHTML = createResultsMarkup(matches, normalized);
      });
    }

    input.addEventListener("focus", function () {
      ensureSearchReady();
    });

    input.addEventListener("input", function (event) {
      runSearch(event.target.value);
    });
  }

  function init() {
    ensureStylesheet(searchCssUrl, "ml-notes-search-stylesheet");

    var navPanel = document.querySelector(".ml-page-nav__panel");
    if (navPanel) {
      mountSearch(navPanel, { mode: "nav", id: "ml-notes-nav-search" });
    }

    var hero = document.querySelector(".hero");
    if (hero && document.body && !document.querySelector(".ml-page-nav")) {
      mountSearch(hero, { mode: "hero", id: "ml-notes-home-search" });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
