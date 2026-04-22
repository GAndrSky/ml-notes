(function () {
  var pagePath = window.__mlNotesCurrentPagePath;
  var pageShell = document.querySelector(".page");
  var courseData = window.__mlNotesCourseData || { pages: [] };

  if (!pagePath || !pageShell || pageShell.querySelector(".ml-endcap-section")) {
    return;
  }

  var pageMeta = (courseData.pages || []).find(function (item) {
    return item.path === pagePath;
  }) || { sectionId: "" };

  var byPage = {
    "04_training/03_adam_adamw_lion.html": {
      mistakes: [
        "Считать AdamW просто переименованным L2-штрафом и не замечать, что decoupled weight decay меняет само правило обновления.",
        "Ставить learning rate для Lion на уровне Adam и получать слишком резкие скачки, потому что обновление у Lion жёстче и чувствительнее к масштабу шага.",
        "Сравнивать оптимизаторы только по train-loss, не проверяя устойчивость обучения, generalization и поведение на validation."
      ],
      apply: [
        "Если нужен сильный и универсальный старт для современных Transformer-подобных моделей, чаще всего начинай с AdamW.",
        "Если задача компактная и хорошо обусловленная, SGD с momentum может обобщать не хуже и даёт более прозрачную динамику обучения.",
        "Если экспериментируешь с очень крупными vision- или language-моделями и хочешь более дешёвое optimizer-state, Lion может быть интересен, но требует аккуратного lr."
      ],
      links: [
        "← Смотри [4.2 Оптимизаторы](../04_training/02_optimizers.html), чтобы закрепить momentum и базовую логику SGD.",
        "→ Почти всегда рядом идёт [4.5 Learning Rate Scheduling](../04_training/05_learning_rate_scheduling.html), потому что optimizer и schedule настраиваются вместе.",
        "→ Связано с [4.4 Регуляризация](../04_training/04_regularization.html), особенно через decoupled weight decay."
      ]
    }
  };

  var bySection = {
    math: {
      mistakes: [
        "Заучивать формулу как строку символов и не проверять, какую геометрию, вероятность или изменение функции она описывает.",
        "Игнорировать размерности и направление производной, а потом теряться в более поздних темах при матричных произведениях и градиентах.",
        "Считать, что здесь важна только строгая запись, а не переносимая интуиция, которая потом понадобится в моделях."
      ],
      apply: [
        "Возвращайся к этому блоку всякий раз, когда в следующей теме перестаёшь понимать размерности, распределения или смысл градиента.",
        "Используй математику как язык проверки здравого смысла: что растёт, что сжимается, что нормируется и где именно теряется информация.",
        "Особенно полезно читать этот блок параллельно с обучением и архитектурами, а не как полностью отдельный курс."
      ],
      links: [
        "→ Дальше эти идеи переходят в [Блок 3. База нейросетей](../03_neural_basics/01_perceptron_and_neuron.html).",
        "→ Производные и Якобиан особенно нужны перед [4.1 Backpropagation](../04_training/01_backpropagation.html).",
        "→ Вероятностные темы продолжаются в [2.9 Naive Bayes](../02_classic_ml/09_naive_bayes.html) и [7.1 VAE](../07_generative_models/01_variational_autoencoders.html)."
      ]
    },
    "classic-ml": {
      mistakes: [
        "Выбирать модель по привычке, не проверив, совпадает ли её inductive bias со структурой данных.",
        "Смотреть только на accuracy или одну удобную метрику и игнорировать leakage, imbalance и цену разных типов ошибок.",
        "Считать preprocessing и validation второстепенными деталями, а не частью самой модели."
      ],
      apply: [
        "Начинай с classical ML, если данные табличные, признаков не очень много и важны baseline, скорость итераций и интерпретируемость.",
        "Если задачу можно хорошо описать через расстояния, линейные зависимости, правила или вероятности, этот блок почти всегда даёт сильный старт.",
        "Переходи к более тяжёлым моделям только после того, как становится понятно, где именно классические методы уже упёрлись в потолок."
      ],
      links: [
        "← База для этого блока лежит в [1.1 Линейной алгебре](../01_math/01_linear_algebra.html) и [1.3 Теории вероятностей](../01_math/03_probability_theory.html).",
        "→ Многие идеи переходят в [3.4 Loss-функции](../03_neural_basics/04_loss_functions.html) и [4.4 Регуляризацию](../04_training/04_regularization.html).",
        "→ Для probabilistic continuation смотри [7.1 VAE](../07_generative_models/01_variational_autoencoders.html) и [6.4 RLHF](../06_llm/04_rlhf.html)."
      ]
    },
    "neural-basics": {
      mistakes: [
        "Считать нейрон, активацию и loss маленькими локальными деталями, а не фундаментом всей будущей динамики обучения.",
        "Смотреть на формулы слоёв отдельно от вопроса, как через них реально течёт сигнал и градиент.",
        "Путать хороший fit на одном шаге с правильной постановкой общей objective-функции."
      ],
      apply: [
        "Возвращайся к этому блоку всякий раз, когда более сложная тема начинает выглядеть как магия: почти всё потом распадается на эти базовые элементы.",
        "Он особенно полезен при чтении новых архитектур: сначала найди линейную часть, нелинейность и способ передачи ошибки назад.",
        "Если хочется понимать deep learning глубже, читай этот блок параллельно с оптимизацией и attention."
      ],
      links: [
        "→ Следующий логичный шаг — [4.1 Backpropagation](../04_training/01_backpropagation.html).",
        "→ Сигнал от loss связывается с [4.2 Оптимизаторами](../04_training/02_optimizers.html).",
        "→ Архитектурное продолжение начинается с [5.1 CNN](../05_architectures/01_cnn_convolutional_networks.html) и [5.3 Attention](../05_architectures/03_transformer_attention.html)."
      ]
    },
    training: {
      mistakes: [
        "Искать одну волшебную настройку и не видеть, что optimizer, lr, batch size и regularization связаны между собой.",
        "Судить режим обучения только по train-loss и игнорировать generalization и устойчивость траектории.",
        "Лечить NaN, loss spikes и divergence вслепую, не локализовав, это проблема математики, данных или инфраструктуры."
      ],
      apply: [
        "Этот блок нужен всякий раз, когда модель теоретически должна учиться, но на практике ведёт себя нестабильно или слишком медленно.",
        "Начинай с простейших диагностик: scale градиентов, learning rate, batch size, regularization и precision.",
        "Когда модель становится крупнее, темы этого блока переходят из nice-to-have в обязательный инженерный минимум."
      ],
      links: [
        "← Градиентная база приходит из [1.2 Матанализа](../01_math/02_calculus.html) и [4.1 Backpropagation](../04_training/01_backpropagation.html).",
        "→ После optimizer-ов почти всегда полезно смотреть [4.5 Learning Rate Scheduling](../04_training/05_learning_rate_scheduling.html) и [4.9 Numerical Stability](../04_training/09_numerical_stability.html).",
        "→ Связано с [5.5 ResNet / Normalization](../05_architectures/05_resnet_normalization.html), потому что архитектура тоже меняет динамику обучения."
      ]
    },
    architectures: {
      mistakes: [
        "Думать об архитектуре как о нейтральной оболочке, а не как о сильном inductive bias о структуре данных.",
        "Сравнивать модели только по числу параметров и FLOPs, игнорируя путь сигнала и градиента.",
        "Переносить архитектурные рецепты между задачами без вопроса, почему этот bias должен работать именно здесь."
      ],
      apply: [
        "Используй этот блок, когда задача упирается уже не в loss или optimizer, а в сам способ представления и передачи контекста.",
        "Выбор архитектуры особенно важен, когда данные имеют выраженную топологию: локальность, последовательность, глобальные зависимости или мультимодальность.",
        "Хороший вопрос здесь всегда такой: какой кратчайший путь должен пройти полезный сигнал между двумя частями входа."
      ],
      links: [
        "← Оптимизационный фундамент лежит в [Блоке 4](../04_training/01_backpropagation.html).",
        "→ Архитектурные идеи продолжаются в [Блоке 6 LLM](../06_llm/01_tokenization_bpe.html) и [Блоке 7 Generative Models](../07_generative_models/01_variational_autoencoders.html).",
        "→ Для attention-heavy тем особенно смотри [5.3 Attention](../05_architectures/03_transformer_attention.html) и [5.7 Efficient Attention](../05_architectures/07_efficient_attention.html)."
      ]
    },
    llm: {
      mistakes: [
        "Сводить поведение LLM только к масштабу и игнорировать роль tokenization, objective и alignment-stage.",
        "Путать знания модели, интерфейс ответа и режим дообучения, как будто это один и тот же слой системы.",
        "Считать, что prompt engineering может заменить понимание pre-training, data mixture и post-training."
      ],
      apply: [
        "Этот блок полезен, когда нужно понимать не только как пользоваться LLM, но и почему она вообще ведёт себя так, как ведёт.",
        "Его особенно важно читать вместе с архитектурами и практикой обучения, потому что LLM — это не отдельная магия, а развитие Transformer + scale + alignment.",
        "Если хочется строить собственные адаптации, здесь особенно важны tokenization, LoRA и reward modeling."
      ],
      links: [
        "← Архитектурная база начинается с [5.3 Attention](../05_architectures/03_transformer_attention.html) и [5.4 Transformer Architecture](../05_architectures/04_transformer_architecture.html).",
        "→ Для инженерной стороны смотри [8.1 Distributed Training](../08_training_practice/01_distributed_training.html) и [8.3 Profiling](../08_training_practice/03_profiling_and_performance.html).",
        "→ Вероятностное продолжение видно в [7.3 Diffusion Models](../07_generative_models/03_diffusion_models.html) и [1.4 Теории информации](../01_math/04_information_theory.html)."
      ]
    },
    generative: {
      mistakes: [
        "Судить generative-модель только по красивым выборкам, не думая о покрытии распределения и устойчивости objective.",
        "Смешивать разные генеративные семейства так, будто они решают одну и ту же задачу одинаковым способом.",
        "Пытаться понять VAE, GAN и diffusion без связи с вероятностью, latent variables и оптимизацией."
      ],
      apply: [
        "Этот блок особенно полезен, если важно не только классифицировать данные, но и моделировать саму их структуру, восстанавливать, сэмплировать или редактировать.",
        "Разные семейства стоит выбирать по компромиссу: tractability, sample quality, устойчивость обучения и интерпретируемость latent space.",
        "Чтение этого блока особенно хорошо заходит параллельно с probability theory и representation learning."
      ],
      links: [
        "← Вероятностная база лежит в [1.3 Probability](../01_math/03_probability_theory.html) и [1.4 Information Theory](../01_math/04_information_theory.html).",
        "→ Связано с [6.2 Pre-training](../06_llm/02_pretraining_objectives.html), потому что обе темы про моделирование распределения данных.",
        "→ Для практики обучения больших генеративных моделей смотри [4.9 Numerical Stability](../04_training/09_numerical_stability.html) и [8.4 Debugging Loss Spikes](../08_training_practice/04_debugging_loss_spikes.html)."
      ]
    },
    "training-practice": {
      mistakes: [
        "Сразу хвататься за системные оптимизации, не понимая, где именно bottleneck: память, compute, I/O или сама математика обучения.",
        "Пытаться лечить instability только инфраструктурой, когда проблема на самом деле в optimizer, schedule или данных.",
        "Думать, что profiling и debugging — это финальная косметика, а не часть самого цикла обучения."
      ],
      apply: [
        "Этот блок становится критичным, как только модель и данные вырастают настолько, что math и systems начинают ограничивать друг друга.",
        "Он особенно полезен в ситуациях, где одна и та же модель в теории должна работать, а на практике упирается в память, throughput или loss spikes.",
        "Если хочется реального production-level понимания, именно здесь появляется инженерная зрелость обучения."
      ],
      links: [
        "← Алгоритмическая база начинается с [Блока 4. Обучение](../04_training/01_backpropagation.html).",
        "→ Для крупномасштабных моделей особенно важны [6.6 Scaling Laws](../06_llm/06_scaling_laws.html) и [7.3 Diffusion Models](../07_generative_models/03_diffusion_models.html).",
        "→ Численная сторона напрямую связана с [4.7 Mixed Precision](../04_training/07_mixed_precision_training.html) и [4.9 Numerical Stability](../04_training/09_numerical_stability.html)."
      ]
    },
    mlops: {
      mistakes: [
        "Treating deployment as an afterthought instead of part of the ML system design.",
        "Logging only final metrics and losing the data, config, code version, and artifacts needed to reproduce a run.",
        "Optimizing model quality without checking latency, throughput, monitoring, drift, and rollback constraints."
      ],
      apply: [
        "Use this block when a notebook result needs to become a reproducible experiment, service, or monitored production component.",
        "It is especially important for ML engineer roles where model quality must survive packaging, serving, data drift, and operational constraints.",
        "The main habit is to make every model decision traceable: data version, code version, config, metric, artifact, and deployment state."
      ],
      links: [
        "← Training stability starts in [4.9 Numerical Stability](../04_training/09_numerical_stability.html).",
        "→ Production LLM systems connect directly to [6.9 RAG](../06_llm/09_retrieval_augmented_generation.html).",
        "→ Portfolio evidence continues in [10. Projects](../10_projects/01_neural_net_from_scratch.html)."
      ]
    },
    "job-prep": {
      mistakes: [
        "Memorizing definitions instead of preparing causal explanations, tradeoffs, and failure modes.",
        "Answering system design questions with model names before clarifying data, scale, latency, and evaluation.",
        "Listing projects without explaining constraints, metrics, debugging decisions, and what changed after analysis."
      ],
      apply: [
        "Use this block as the conversion layer between study notes and interview-ready answers.",
        "For every topic, the target is not recall but the ability to explain assumptions, derive the core idea, and defend tradeoffs.",
        "The strongest answers connect math, implementation details, evaluation, and production failure modes."
      ],
      links: [
        "← Core interview math starts in [1. Math](../01_math/01_linear_algebra.html).",
        "← Practical ML grounding starts in [2. Classical ML](../02_classic_ml/01_intro_to_classical_ml.html).",
        "→ Portfolio execution continues in [10. Projects](../10_projects/01_neural_net_from_scratch.html)."
      ]
    },
    projects: {
      mistakes: [
        "Building a demo that runs once but cannot be reproduced, evaluated, or explained.",
        "Skipping baselines and error analysis, which makes the final result impossible to interpret.",
        "Documenting only the happy path instead of showing failures, constraints, tradeoffs, and next steps."
      ],
      apply: [
        "Use project pages to turn theory into evidence: runnable code, clear metrics, artifacts, and a story an interviewer can inspect.",
        "A good project should show one complete loop: problem framing, data, baseline, model, evaluation, deployment or demo, and retrospective.",
        "The portfolio value comes from clarity and reproducibility, not from using the largest model."
      ],
      links: [
        "← Choose models from [2. Classical ML](../02_classic_ml/01_intro_to_classical_ml.html), [5. Architectures](../05_architectures/01_cnn_convolutional_networks.html), or [6. LLM](../06_llm/01_tokenization_bpe.html).",
        "← Training and debugging decisions connect to [4. Training](../04_training/01_backpropagation.html).",
        "→ Serving and reproducibility connect to [9. MLOps](../09_mlops_deployment/01_experiment_tracking.html)."
      ]
    }
  };

  var fallbackData = {
    mistakes: [
      "Reading the topic as isolated facts instead of asking what problem it solves and what assumptions it makes.",
      "Skipping the implementation details, which hides shape errors, numerical issues, and evaluation traps.",
      "Moving on before being able to explain the idea without looking at the page."
    ],
    apply: [
      "Use this page when the concept appears in a model, training loop, evaluation pipeline, or interview explanation.",
      "The practical test is whether you can identify when the idea helps, when it fails, and what you would measure.",
      "Before moving on, connect the formulas to a concrete example, a code path, and at least one failure mode."
    ],
    links: [
      "← Return to the course map on the [main page](../index.html) when the prerequisite chain is unclear.",
      "→ Use adjacent previous/next navigation to keep the topic in sequence.",
      "→ Add weak topics to My Progress by rating them below 3."
    ]
  };

  var data = byPage[pagePath] || bySection[pageMeta.sectionId] || fallbackData;

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function linkify(value) {
    return String(value).replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (_, label, href) {
      return '<a href="' + escapeHtml(href) + '">' + escapeHtml(label) + "</a>";
    });
  }

  function buildList(items, allowLinks) {
    return (
      '<ul class="ml-endcap-list">' +
      items.map(function (item) {
        return "<li>" + (allowLinks ? linkify(item) : escapeHtml(item)) + "</li>";
      }).join("") +
      "</ul>"
    );
  }

  var section = document.createElement("section");
  section.className = "card ml-endcap-section";
  section.innerHTML =
    '<div class="ml-theory-header">' +
    "<h2>Что важно вынести из темы</h2>" +
    '<p class="muted">Небольшой практический блок в конце страницы: где новички чаще всего ошибаются, когда этот подход уместен и с чем его полезно связать дальше по курсу.</p>' +
    "</div>" +
    '<div class="ml-endcap-grid">' +
      '<div class="ml-endcap-card">' +
        "<h3>Типичные ошибки</h3>" +
        buildList(data.mistakes, false) +
      "</div>" +
      '<div class="ml-endcap-card">' +
        "<h3>Когда применять</h3>" +
        buildList(data.apply, false) +
      "</div>" +
      '<div class="ml-endcap-card" style="grid-column: 1 / -1;">' +
        "<h3>Связи с другими темами</h3>" +
        buildList(data.links, true) +
      "</div>" +
    "</div>";

  pageShell.appendChild(section);
})();
