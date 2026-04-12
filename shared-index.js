(function () {
  if (window.__mlNotesIndexInitialized) {
    return;
  }
  window.__mlNotesIndexInitialized = true;

  function readVisitedPaths() {
    try {
      var parsed = JSON.parse(window.localStorage.getItem("ml_notes_visited") || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function init() {
    if (!document.body || !document.body.classList.contains("ml-index-theme")) {
      return;
    }

    var courseData = window.__mlNotesCourseData || { sections: [], totalLessons: 0 };
    var sections = Array.prototype.slice.call(document.querySelectorAll(".section"));
    var hero = document.querySelector(".hero");
    var visited = readVisitedPaths();
    var visitedSet = {};
    visited.forEach(function (path) {
      visitedSet[path] = true;
    });

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

        var path = href.replace(/^\.\//, "");
        card.dataset.lessonCard = path;
        if (visitedSet[path]) {
          card.classList.add("is-visited");
        }
      });
    });

    var heroTitle = hero && hero.querySelector("h1");
    var heroSubtitle = hero && hero.querySelector(".hero-subtitle");
    var progressCount = hero && hero.querySelector(".hero-progress__count");
    var progressLabel = hero && hero.querySelector(".hero-progress__label");
    var progressBar = hero && hero.querySelector(".hero-progress__bar span");

    var totalLessons = Number(courseData.totalLessons || document.querySelectorAll("[data-lesson-card]").length || 0);
    var validVisitedCount = visited.filter(function (path) {
      return !!document.querySelector('[data-lesson-card="' + path + '"]');
    }).length;
    var progressPercent = totalLessons ? Math.round((validVisitedCount / totalLessons) * 100) : 0;

    if (heroTitle) {
      heroTitle.textContent = "Интерактивный ML-конспект";
    }

    if (heroSubtitle) {
      heroSubtitle.textContent = totalLessons + " тем · от линейной алгебры до LLM и diffusion · интерактивные визуализации и код";
    }

    if (progressCount) {
      progressCount.textContent = "Изучено: " + validVisitedCount + " из " + totalLessons;
    }

    if (progressLabel) {
      progressLabel.textContent = progressPercent + "% курса";
    }

    if (progressBar) {
      progressBar.style.width = progressPercent + "%";
    }

    var classicMlSection = sections[1];
    var classicGrid = classicMlSection && classicMlSection.querySelector(".grid");
    if (classicGrid && !classicGrid.querySelector(".index-subgroup")) {
      var subgroupMap = {
        "2.1": "Базовые модели",
        "2.6": "Метрики",
        "2.8": "Продвинутые модели",
        "2.17": "Практика"
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

    var visitedCards = document.querySelectorAll(".card.is-visited");
    Array.prototype.forEach.call(visitedCards, function (card) {
      if (card.querySelector(".index-card-check")) {
        return;
      }

      var check = document.createElement("span");
      check.className = "index-card-check";
      check.textContent = "✓";
      card.appendChild(check);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
