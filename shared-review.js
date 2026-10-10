/* shared-review.js - spaced repetition over all lesson self-check questions (review.html).
 *
 * Leitner boxes 0..6 with intervals of 0, 1, 3, 7, 16, 35, 80 days. Grades:
 *   0 "не вспомнил" -> box 0, due again in 10 minutes
 *   1 "с трудом"    -> same box, due after half its interval (at least 1 day once learned)
 *   2 "вспомнил"    -> next box, due after that box's interval
 * State lives in localStorage ("ml_notes_review": {cardId: {box, due, reps}}).
 * Uses ml_notes_visited and ml_notes_self_rating written by the lesson pages.
 */
(function () {
  var data = window.__mlNotesReview || { sections: [], cards: [] };
  var DAY = 86400000;
  var INTERVALS = [0, 1, 3, 7, 16, 35, 80];
  var STORE = "ml_notes_review";

  function read(key, fallback) {
    try { var v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; } catch (e) { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage disabled: progress is not kept */ }
  }

  var state = read(STORE, {});
  var visited = read("ml_notes_visited", []);
  var ratings = read("ml_notes_self_rating", {});

  var el = function (id) { return document.getElementById(id); };
  var sectionSel = el("rvSection"), onlyVisited = el("rvVisited"), weakFirst = el("rvWeak");
  var queue = [], current = null, extraMode = false;

  data.sections.forEach(function (s) {
    var o = document.createElement("option");
    o.value = s.id; o.textContent = s.label + " · " + s.title;
    sectionSel.appendChild(o);
  });
  var prefs = read("ml_notes_review_prefs", {});
  if (prefs.section) sectionSel.value = prefs.section;
  onlyVisited.checked = !!prefs.visited;
  weakFirst.checked = prefs.weak !== false;

  function rating(path) {
    // lesson pages store ratings by path; older widgets use other topic ids, so missing = unknown
    var r = ratings[path];
    return typeof r === "number" ? r : null;
  }

  function pool() {
    return data.cards.filter(function (c) {
      if (sectionSel.value !== "all" && c.section !== sectionSel.value) return false;
      if (onlyVisited.checked && visited.indexOf(c.path) === -1) return false;
      return true;
    });
  }

  function buildQueue() {
    var now = Date.now();
    var cards = pool();
    var due = cards.filter(function (c) { return state[c.id] && state[c.id].due <= now; });
    var fresh = cards.filter(function (c) { return !state[c.id]; });
    due.sort(function (a, b) { return state[a.id].due - state[b.id].due; });
    if (weakFirst.checked) {
      var score = function (c) { var r = rating(c.path); return r == null ? 3 : r; };
      fresh.sort(function (a, b) { return score(a) - score(b); });
    }
    // all due cards, then up to 15 new ones per session
    queue = due.concat(fresh.slice(0, 15));
    extraMode = false;
    renderStats();
    next();
  }

  function renderStats() {
    var now = Date.now(), cards = pool();
    var due = 0, fresh = 0, learned = 0;
    cards.forEach(function (c) {
      var s = state[c.id];
      if (!s) fresh++;
      else { if (s.due <= now) due++; if (s.box >= 3) learned++; }
    });
    el("rvStats").innerHTML =
      "<span><b>" + cards.length + "</b> карточек</span>" +
      "<span><b>" + due + "</b> к повторению</span>" +
      "<span><b>" + fresh + "</b> новых</span>" +
      "<span><b>" + learned + "</b> выучено (интервал ≥ 7 дней)</span>";
  }

  function show(card) {
    current = card;
    el("rvCard").hidden = false;
    el("rvDone").hidden = true;
    var lesson = el("rvLesson");
    lesson.textContent = card.label;
    lesson.href = card.path;
    var s = state[card.id];
    el("rvBox").textContent = s ? "интервал: " + INTERVALS[s.box] + " дн." : "новая";
    el("rvQuestion").innerHTML = card.q;
    el("rvAnswer").innerHTML = card.a;
    el("rvAnswer").hidden = true;
    el("rvReveal").hidden = false;
    el("rvGrade").hidden = true;
    el("rvShow").focus({ preventScroll: true });
  }

  function next() {
    if (queue.length) { show(queue.shift()); return; }
    current = null;
    el("rvCard").hidden = true;
    el("rvDone").hidden = false;
    var upcoming = pool().map(function (c) { return state[c.id] && state[c.id].due; }).filter(Boolean).sort();
    var nextDue = upcoming.find(function (t) { return t > Date.now(); });
    el("rvDoneText").textContent = nextDue
      ? "Следующие карточки станут доступны " + new Date(nextDue).toLocaleString("ru-RU", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }) + "."
      : pool().length ? "Все карточки этого набора уже в работе." : "В выбранном наборе нет карточек — смени фильтр.";
  }

  function reveal() {
    if (!current) return;
    el("rvAnswer").hidden = false;
    el("rvReveal").hidden = true;
    el("rvGrade").hidden = false;
    var good = el("rvGrade").querySelector('[data-grade="2"]');
    if (good) good.focus({ preventScroll: true });
  }

  function grade(g) {
    if (!current || el("rvGrade").hidden) return;
    var s = state[current.id] || { box: 0, due: 0, reps: 0 };
    var now = Date.now();
    if (!extraMode) {
      if (g === 0) { s.box = 0; s.due = now + 10 * 60000; queue.push(current); }
      else if (g === 1) { s.due = now + Math.max(s.box ? DAY : 10 * 60000, INTERVALS[s.box] * DAY / 2); }
      else { s.box = Math.min(INTERVALS.length - 1, s.box + 1); s.due = now + INTERVALS[s.box] * DAY; }
      s.reps = (s.reps || 0) + 1;
      state[current.id] = s;
      write(STORE, state);
    }
    renderStats();
    next();
  }

  el("rvShow").addEventListener("click", reveal);
  el("rvGrade").addEventListener("click", function (e) {
    var b = e.target.closest("[data-grade]");
    if (b) grade(Number(b.getAttribute("data-grade")));
  });
  el("rvExtra").addEventListener("click", function () {
    var cards = pool().slice();
    for (var i = cards.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = cards[i]; cards[i] = cards[j]; cards[j] = t; }
    queue = cards.slice(0, 10);
    extraMode = true; // extra practice does not change the schedule
    next();
  });
  el("rvReset").addEventListener("click", function () {
    if (!window.confirm("Сбросить весь прогресс повторения в этом браузере?")) return;
    state = {};
    write(STORE, state);
    buildQueue();
  });
  [sectionSel, onlyVisited, weakFirst].forEach(function (c) {
    c.addEventListener("change", function () {
      write("ml_notes_review_prefs", { section: sectionSel.value, visited: onlyVisited.checked, weak: weakFirst.checked });
      buildQueue();
    });
  });
  document.addEventListener("keydown", function (e) {
    var t = e.target;
    if ((t && t.closest && t.closest("select, input, textarea")) || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === " " && !el("rvReveal").hidden && current) { e.preventDefault(); reveal(); }
    else if ((e.key === "1" || e.key === "2" || e.key === "3") && !el("rvGrade").hidden) { e.preventDefault(); grade(Number(e.key) - 1); }
  });

  buildQueue();
})();
