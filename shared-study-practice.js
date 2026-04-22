(function () {
  var pagePath = window.__mlNotesCurrentPagePath;
  var pageShell = document.querySelector(".page");
  var courseData = window.__mlNotesCourseData || { pages: [] };

  if (!pagePath || !pageShell || pageShell.querySelector(".ml-study-practice")) {
    return;
  }

  var pageMeta = (courseData.pages || []).find(function (item) {
    return item.path === pagePath;
  }) || { label: "this topic", sectionId: "" };

  var sectionLabel = {
    math: "mathematical object",
    "classic-ml": "model",
    "neural-basics": "neural network component",
    training: "training mechanism",
    architectures: "architecture",
    llm: "LLM mechanism",
    generative: "generative model",
    "training-practice": "training system",
    mlops: "production ML system",
    "job-prep": "interview answer",
    projects: "project artifact"
  };

  var sectionAction = {
    math: "derive the formula from definitions and check dimensions at every step",
    "classic-ml": "fit a tiny example by hand and explain what the model assumes about the data",
    "neural-basics": "trace one forward pass and one backward signal through the component",
    training: "write the update rule and explain how changing one hyperparameter changes the trajectory",
    architectures: "track tensor shapes through the block and identify the inductive bias",
    llm: "connect the mechanism to tokens, context length, data, alignment, or inference cost",
    generative: "write the probabilistic objective and explain what distribution is being learned",
    "training-practice": "estimate memory, compute, throughput, and failure modes for a realistic setup",
    mlops: "turn the idea into a reproducible, deployable, monitorable workflow",
    "job-prep": "answer as if an interviewer asked for assumptions, tradeoffs, and failure modes",
    projects: "turn the topic into a runnable portfolio deliverable with evaluation and a short README"
  };

  var noun = sectionLabel[pageMeta.sectionId] || "concept";
  var action = sectionAction[pageMeta.sectionId] || "explain the idea, implement a toy version, and name one failure mode";
  var topic = pageMeta.label || "this topic";

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function hasExercises() {
    return !!pageShell.querySelector(".ml-exercises-section, .ml-study-practice__exercises") ||
      /Exercises|Упражнения|Show solution|Foundational|Intermediate|Hard/i.test(pageShell.textContent || "");
  }

  function hasCheckpoint() {
    return !!pageShell.querySelector(".ml-checkpoint-section, .ml-study-practice__checkpoint, .ml-self-rating") ||
      /Learning checkpoint|Контрольные вопросы|rubber duck|I can explain/i.test(pageShell.textContent || "");
  }

  function exercise(title, difficulty, body, solution) {
    return (
      '<article class="ml-study-practice__item">' +
        '<div class="ml-study-practice__item-head">' +
          '<strong>' + escapeHtml(title) + "</strong>" +
          '<span>' + escapeHtml(difficulty) + "</span>" +
        "</div>" +
        "<p>" + escapeHtml(body) + "</p>" +
        '<details class="ml-study-practice__solution">' +
          "<summary>Show solution</summary>" +
          "<p>" + escapeHtml(solution) + "</p>" +
        "</details>" +
      "</article>"
    );
  }

  function buildExercises() {
    return (
      '<section class="card ml-study-practice ml-study-practice__exercises" data-study-practice="exercises">' +
        '<div class="ml-theory-header">' +
          "<h2>Exercises</h2>" +
          '<p class="muted">Do not skip exercises. The ability to reproduce the result is the test of understanding.</p>' +
        "</div>" +
        '<div class="ml-study-practice__grid">' +
          exercise(
            "Type A — derivation",
            "Foundational",
            "For " + topic + ", write the central equation or decision rule from memory. Then annotate every symbol and state which assumption makes the equation valid.",
            "A good answer names the variables, states the objective, checks shapes or units, and explains why the rule follows from the assumptions rather than from memorization."
          ) +
          exercise(
            "Type A — edge case",
            "Intermediate",
            "Construct a small case where this " + noun + " works well and a small case where it fails. Explain the difference without using code.",
            "The useful contrast usually comes from data shape, noise, scale, nonlinearity, distribution shift, class imbalance, memory cost, or an optimization failure."
          ) +
          exercise(
            "Type B — implement toy version",
            "Intermediate",
            "Implement the smallest runnable version of this topic on synthetic data. Keep the dataset in the snippet and print at least one diagnostic metric.",
            "The implementation should be self-contained, deterministic where possible, and include a sanity check that would fail if the core idea were implemented incorrectly."
          ) +
          exercise(
            "Type B — debug check",
            "Hard",
            "Add one intentional bug related to shape, leakage, numerical stability, or evaluation. Describe how you would detect it.",
            "A strong debugging answer uses an invariant: expected shape, monotonic loss trend, train/test split boundary, finite values, baseline comparison, or metric consistency."
          ) +
          exercise(
            "Type C — interview explanation",
            "Foundational",
            "Explain when you would use this topic in a real ML project, what you would measure, and what failure mode you would watch first.",
            "The answer should include problem setting, assumptions, metric, baseline, tradeoff, and one concrete failure signal."
          ) +
        "</div>" +
      "</section>"
    );
  }

  function buildCheckpoint() {
    var questions = [
      "What problem does " + topic + " solve, and what assumption does it rely on?",
      "Which quantity is optimized, estimated, normalized, or cached in this topic?",
      "What changes if the data scale, batch size, sequence length, or noise level changes?",
      "What is the first diagnostic you would check if this idea fails in practice?",
      "How does this topic connect to one previous and one next topic in the course?"
    ];

    return (
      '<section class="card ml-study-practice ml-study-practice__checkpoint" data-study-practice="checkpoint">' +
        '<div class="ml-theory-header">' +
          "<h2>Learning checkpoint</h2>" +
          '<p class="muted">Move on only if you can answer these without looking at the notes.</p>' +
        "</div>" +
        '<ol class="ml-study-practice__questions">' +
          questions.map(function (question) {
            return "<li>" + escapeHtml(question) + "</li>";
          }).join("") +
        "</ol>" +
        '<div class="ml-study-practice__rubber-duck">' +
          "<h3>Explain to a rubber duck</h3>" +
          "<p>Explain " + escapeHtml(topic) + " in three levels: one sentence for a beginner, one technical paragraph for an engineer, and one failure-mode explanation for an interviewer.</p>" +
          "<p>Then " + escapeHtml(action) + ".</p>" +
        "</div>" +
        '<div class="ml-self-rating" data-topic-id="' + escapeHtml(pagePath) + '">' +
          '<span class="ml-self-rating__label">I can explain this:</span>' +
          '<div class="ml-self-rating__buttons">' +
            [1, 2, 3, 4, 5].map(function (value) {
              return '<button type="button" data-rating="' + value + '">' + value + "</button>";
            }).join("") +
          "</div>" +
          '<span class="ml-self-rating__status" data-rating-status>Not rated</span>' +
        "</div>" +
      "</section>"
    );
  }

  var chunks = [];
  if (!hasExercises()) {
    chunks.push(buildExercises());
  }
  if (!hasCheckpoint()) {
    chunks.push(buildCheckpoint());
  }

  if (!chunks.length) {
    return;
  }

  var wrapper = document.createElement("div");
  wrapper.innerHTML = chunks.join("");
  Array.prototype.slice.call(wrapper.children).forEach(function (element) {
    var endcap = pageShell.querySelector(".ml-endcap-section");
    if (endcap) {
      pageShell.insertBefore(element, endcap);
    } else {
      pageShell.appendChild(element);
    }
  });

  window.dispatchEvent(new CustomEvent("ml-notes-study-practice-added", {
    detail: { pagePath: pagePath }
  }));
})();
