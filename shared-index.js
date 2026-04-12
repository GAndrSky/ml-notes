(function () {
  if (window.__mlNotesIndexInitialized) {
    return;
  }
  window.__mlNotesIndexInitialized = true;

  var visitedKey = "ml_notes_visited";

  function readVisitedPaths() {
    try {
      var parsed = JSON.parse(window.localStorage.getItem(visitedKey) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function writeVisitedPaths(paths) {
    try {
      window.localStorage.setItem(visitedKey, JSON.stringify(paths));
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
    var paths = readVisitedPaths().filter(Boolean);
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

  function init() {
    if (!document.body || !document.body.classList.contains("ml-index-theme")) {
      return;
    }

    var courseData = window.__mlNotesCourseData || { sections: [], totalLessons: 0 };
    var sections = Array.prototype.slice.call(document.querySelectorAll(".section"));
    var hero = document.querySelector(".hero");
    var accentMap = {
      1: "#6c8ebf",
      2: "#7eb87e",
      3: "#c8956c",
      4: "#b87eb8",
      5: "#7eb8b8",
      6: "#d497b8",
      7: "#d58f79",
      8: "#97a9d6"
    };

    sections.forEach(function (section, index) {
      var blockNumber = index + 1;
      section.classList.add("section--block-" + blockNumber);
      section.dataset.block = String(blockNumber);
      section.style.setProperty("--block-accent", accentMap[blockNumber] || "#7eb8b8");

      Array.prototype.slice.call(section.querySelectorAll(".card")).forEach(function (card) {
        var href = card.getAttribute("href");
        if (!href) {
          return;
        }

        card.dataset.lessonCard = href.replace(/^\.\//, "");

        if (!card.querySelector(".index-card-check")) {
          var checkButton = document.createElement("button");
          checkButton.type = "button";
          checkButton.className = "index-card-check";
          checkButton.setAttribute("aria-label", "\u041e\u0442\u043c\u0435\u0442\u0438\u0442\u044c \u0442\u0435\u043c\u0443 \u043a\u0430\u043a \u043f\u0440\u043e\u0439\u0434\u0435\u043d\u043d\u0443\u044e");
          card.appendChild(checkButton);
        }
      });
    });

    var heroTitle = hero && hero.querySelector("h1");
    var heroSubtitle = hero && hero.querySelector(".hero-subtitle");
    var progressCount = hero && hero.querySelector(".hero-progress__count");
    var progressLabel = hero && hero.querySelector(".hero-progress__label");
    var progressBar = hero && hero.querySelector(".hero-progress__bar span");
    var totalLessons = Number(courseData.totalLessons || document.querySelectorAll("[data-lesson-card]").length || 0);

    if (heroTitle) {
      heroTitle.textContent = "\u0418\u043d\u0442\u0435\u0440\u0430\u043a\u0442\u0438\u0432\u043d\u044b\u0439 ML-\u043a\u043e\u043d\u0441\u043f\u0435\u043a\u0442";
    }

    if (heroSubtitle) {
      heroSubtitle.textContent =
        totalLessons +
        " \u0442\u0435\u043c \u00b7 \u043e\u0442 \u043b\u0438\u043d\u0435\u0439\u043d\u043e\u0439 \u0430\u043b\u0433\u0435\u0431\u0440\u044b \u0434\u043e LLM \u0438 diffusion \u00b7 \u0438\u043d\u0442\u0435\u0440\u0430\u043a\u0442\u0438\u0432\u043d\u044b\u0435 \u0432\u0438\u0437\u0443\u0430\u043b\u0438\u0437\u0430\u0446\u0438\u0438 \u0438 \u043a\u043e\u0434";
    }

    function refreshUi(paths) {
      var visitedSet = {};
      paths.forEach(function (path) {
        visitedSet[path] = true;
      });

      Array.prototype.slice.call(document.querySelectorAll("[data-lesson-card]")).forEach(function (card) {
        var path = card.dataset.lessonCard;
        var isVisited = !!visitedSet[path];
        card.classList.toggle("is-visited", isVisited);

        var button = card.querySelector(".index-card-check");
        if (!button) {
          return;
        }

        button.textContent = isVisited ? "\u2713" : "";
        button.setAttribute(
          "aria-label",
          isVisited
            ? "\u0421\u043d\u044f\u0442\u044c \u043e\u0442\u043c\u0435\u0442\u043a\u0443 \u0441 \u0442\u0435\u043c\u044b"
            : "\u041e\u0442\u043c\u0435\u0442\u0438\u0442\u044c \u0442\u0435\u043c\u0443 \u043a\u0430\u043a \u043f\u0440\u043e\u0439\u0434\u0435\u043d\u043d\u0443\u044e"
        );
      });

      var validVisitedCount = paths.filter(function (path) {
        return !!document.querySelector('[data-lesson-card="' + path + '"]');
      }).length;
      var progressPercent = totalLessons ? Math.round((validVisitedCount / totalLessons) * 100) : 0;

      if (progressCount) {
        progressCount.textContent =
          "\u0418\u0437\u0443\u0447\u0435\u043d\u043e: " + validVisitedCount + " \u0438\u0437 " + totalLessons;
      }

      if (progressLabel) {
        progressLabel.textContent = progressPercent + "% \u043a\u0443\u0440\u0441\u0430";
      }

      if (progressBar) {
        progressBar.style.width = progressPercent + "%";
      }
    }

    var classicMlSection = sections[1];
    var classicGrid = classicMlSection && classicMlSection.querySelector(".grid");
    if (classicGrid && !classicGrid.querySelector(".index-subgroup")) {
      var subgroupMap = {
        "2.1": "\u0411\u0430\u0437\u043e\u0432\u044b\u0435 \u043c\u043e\u0434\u0435\u043b\u0438",
        "2.6": "\u041c\u0435\u0442\u0440\u0438\u043a\u0438",
        "2.8": "\u041f\u0440\u043e\u0434\u0432\u0438\u043d\u0443\u0442\u044b\u0435 \u043c\u043e\u0434\u0435\u043b\u0438",
        "2.17": "\u041f\u0440\u0430\u043a\u0442\u0438\u043a\u0430"
      };

      Array.prototype.slice.call(classicGrid.querySelectorAll(".card")).forEach(function (card) {
        var badge = card.querySelector(".badge");
        var key = badge ? badge.textContent.trim() : "";
        if (!subgroupMap[key]) {
          return;
        }

        var divider = document.createElement("div");
        divider.className = "index-subgroup";
        divider.innerHTML =
          '<span class="index-subgroup__line"></span>' +
          '<span class="index-subgroup__label">' + subgroupMap[key] + "</span>" +
          '<span class="index-subgroup__line"></span>';
        classicGrid.insertBefore(divider, card);
      });
    }

    document.addEventListener("click", function (event) {
      var button = event.target && event.target.closest ? event.target.closest(".index-card-check") : null;
      if (!button) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      var card = button.closest("[data-lesson-card]");
      if (!card) {
        return;
      }

      var path = card.dataset.lessonCard;
      var shouldVisit = !card.classList.contains("is-visited");
      var updatedPaths = setVisited(path, shouldVisit);
      refreshUi(updatedPaths);
    });

    window.addEventListener("ml-notes-progress-changed", function (event) {
      var paths = event && event.detail && Array.isArray(event.detail.visitedPaths)
        ? event.detail.visitedPaths
        : readVisitedPaths();
      refreshUi(paths);
    });

    refreshUi(readVisitedPaths());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
