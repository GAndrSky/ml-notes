# ML Notes — maintenance guide

How the site is built, how to change it safely, and what the checks do.
Live site: https://gandrsky.github.io/ml-notes/ (GitHub Pages, deployed from `main`).

## Project layout

| Path | What it is |
|---|---|
| `01_math/` … `10_projects/`, `job_prep/` | Lesson pages (static HTML, 87 lessons) |
| `index.html`, `index.css` | Main page |
| `review.html`, `review.css`, `shared-review.js` | Spaced-repetition review page |
| `course-manifest.js` | **Single source of truth** for course order, sections and titles |
| `shared-*.js`, `shared-*.css` | Shared scripts and styles used by lessons |
| `bundle.js` | Generated: several `shared-*.js` files concatenated (see below) |
| `shared-search-index.js` | Generated: full-text search index |
| `shared-review-data.js` | Generated: all quiz questions for the review page |
| `vendor/` | KaTeX, highlight.js, Fuse.js (loaded only when a page needs them) |
| `scripts/` | Build and check scripts |
| `scripts/ci/` | Scripts used by GitHub Actions |
| `.github/workflows/` | CI configuration |

## After you edit something — rebuild generated files

Run from the repo root (PowerShell):

```powershell
.\scripts\build-bundle.ps1          # only if you changed a shared-*.js that is in the bundle
.\scripts\build-search-index.ps1    # after any lesson content change
node scripts\build-review-data.mjs  # after changing quiz questions (ml-quiz) or the manifest
.\scripts\smoke-check-course.ps1    # always, before committing
```

Then commit the regenerated files together with your change. CI fails if
`shared-search-index.js` or `shared-review-data.js` are out of date, or if `bundle.js`
does not match its sources.

Files that go into `bundle.js` (list in `scripts/build-bundle.ps1`):
`course-manifest.js`, `shared-nav.js`, `shared-prevnext.js`, `shared-walkthrough.js`,
`shared-lesson-ui.js`, `shared-a11y.js`, `shared-search.js`, `shared-index.js`.

## Adding or renaming a lesson

1. Create/rename the HTML file (copy an existing lesson to get the same head and scripts).
2. Add/update the entry in `course-manifest.js` (order there = order in the course).
3. Rebuild everything listed above and run the smoke check.

## Checks (CI)

Two GitHub Actions workflows run automatically:

**Site checks** (`.github/workflows/site-checks.yml`) — on every push and PR, ~20 s:
- `scripts/smoke-check-course.ps1`: links, manifest, bundle freshness, unstyled classes,
  raw `<` in text, curly-quoted attributes, etc.
- JavaScript syntax of all root `*.js` files.
- Search index is up to date (compared as data, so Windows/Linux PowerShell output
  differences don't matter).
- Review cards are up to date.

**Lesson code examples** (`.github/workflows/code-examples.yml`) — when HTML or `scripts/ci`
changes, weekly (catches library API changes), or manually; ~10 min:
- `scripts/ci/extract-code-blocks.mjs` extracts every Python block from the lessons.
- `scripts/ci/run-code-blocks.py` runs each one on CPU with a small prelude
  (numpy/pandas/torch imports, synthetic `X`, `y`, `X_train`, `X_valid`, `feature_names`, …)
  plus the earlier blocks of the same lesson.
- Blocks that cannot run standalone are listed in `scripts/ci/expected-failures.txt`
  with a reason (fragments using names from the text, need GPU/network/a real dataset).
  **If you add such a block, add it to that file**, otherwise CI fails. If a listed block
  starts passing, the run tells you to remove it from the list.

Run the code check locally:

```bash
npm install --prefix scripts/ci
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
pip install -r scripts/ci/requirements.txt
node scripts/ci/extract-code-blocks.mjs . /tmp/code-blocks
python scripts/ci/run-code-blocks.py /tmp/code-blocks            # all blocks
python scripts/ci/run-code-blocks.py /tmp/code-blocks --filter 09_object_detection
```

## Writing content — conventions

- Lessons are in Russian; standard ML terms (batch, latency, recall, RAG…) stay in English.
  Lesson titles/navigation names are English term names on purpose. The interview question
  bank (`job_prep/01`) keeps its questions in English on purpose.
- **Formulas**: `<div class="formula" data-render-tex data-tex-source="...TeX...">plain fallback</div>`
  renders with KaTeX. `data-no-tex` keeps the block as plain text (use for prose/pipelines,
  not for real math). Inline math in text: `\( ... \)`.
- Never put a raw `<` in text — write `&lt;` (the smoke check catches it).
- Quiz questions (`ml-quiz`) automatically become review cards; keep one question per
  `<details class="ml-quiz__entry">`.
- Practice items: `<details><summary>[Level] Title</summary><p>Task</p><p><strong>Решение.</strong> …</p></details>`.
  Code in solutions goes in `<pre><code class="language-python">` — it is run by CI.
- **Interactive widgets must compute real things** (real model fits, exact formulas,
  seeded simulations). Don't show metrics from made-up formulas. If a widget is
  only a "what if" calculator, the user must set the numbers themselves.
- Accessibility: `shared-a11y.js` names unlabeled controls from their visible text and labels
  canvases from the nearest heading. Prefer a real `<label for>` when writing new widgets.
- Mobile: pages must not scroll horizontally at 390 px; break long code tokens with `<wbr>`.

## Review page (`review.html`)

- Cards = all `ml-quiz` questions (395), generated into `shared-review-data.js`.
- Leitner scheduling, intervals 0/1/3/7/16/35/80 days; grades: не вспомнил / с трудом / вспомнил
  (keys 1/2/3, Space shows the answer).
- Progress is stored only in the browser (`localStorage` key `ml_notes_review`); it uses
  `ml_notes_visited` and `ml_notes_self_rating` from lesson pages for the filters.
- Card ids are a hash of lesson path + question text: editing a question's text resets its progress.

## Publishing

Work on a branch, push it (CI runs on every branch), merge into `main` when CI is green.
Pushing `main` deploys the site via GitHub Pages within ~1 minute.

## Change history (2026-10)

- Content review of all blocks: factual errors fixed, template filler removed.
- Duplicate English/Russian self-checks merged; course unified to Russian.
- Fake slider demos replaced with real computations (boosting, SVM, k-means, t-SNE, GD, dropout,
  stacking/CV leakage, class weights/threshold, validation curve, Chinchilla scaling laws with the
  Besiroglu et al. 2024 constants, DDPM noise schedule).
- All 129 lesson code blocks run; bugs fixed (NMS, AMP on CPU, SHAP API, LoRA bf16/EOS).
- ASCII formulas converted to KaTeX; inline-math double rendering fixed.
- Full solutions for all Hard exercises and for every exercise that had none.
- CI added; review page added; accessibility and contrast pass.

Ideas not done yet: split `shared-advanced-notes.js` / `shared-theory-notes.js` /
`shared-explainer-notes.js` per lesson (≈240 KB loaded on each lesson page), deepen the
remaining Foundational/Intermediate one-line solutions.
