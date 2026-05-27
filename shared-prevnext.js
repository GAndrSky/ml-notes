/**
 * shared-prevnext.js
 * Injects prev/next navigation + section progress bar into every page.
 * No dependencies. Auto-initialises when DOM is ready.
 *
 * Each entry: [sectionLabel, relativePath, pageTitle]
 * relativePath is always "section/filename.html" from the project root.
 */
(function () {
  'use strict';

  var PAGES = [
    // ── 01 Математика ─────────────────────────────────────────────────
    ['01 Математика', '01_math/01_linear_algebra.html',        'Линейная алгебра'],
    ['01 Математика', '01_math/02_calculus.html',              'Математический анализ'],
    ['01 Математика', '01_math/03_probability_theory.html',    'Теория вероятностей'],
    ['01 Математика', '01_math/04_information_theory.html',    'Теория информации'],
    ['01 Математика', '01_math/05_optimization_theory.html',   'Теория оптимизации'],
    // ── 02 Классический ML ────────────────────────────────────────────
    ['02 Классический ML', '02_classic_ml/01_intro_to_classical_ml.html',          'Введение в классический ML'],
    ['02 Классический ML', '02_classic_ml/02_data_preprocessing.html',             'Препроцессинг данных'],
    ['02 Классический ML', '02_classic_ml/03_linear_regression.html',              'Линейная регрессия'],
    ['02 Классический ML', '02_classic_ml/04_linear_model_regularization.html',    'Регуляризация линейных моделей'],
    ['02 Классический ML', '02_classic_ml/05_logistic_regression.html',            'Логистическая регрессия'],
    ['02 Классический ML', '02_classic_ml/06_regression_metrics.html',             'Метрики регрессии'],
    ['02 Классический ML', '02_classic_ml/07_classification_metrics.html',         'Метрики классификации'],
    ['02 Классический ML', '02_classic_ml/08_distance_based_models.html',          'Модели на расстоянии (KNN)'],
    ['02 Классический ML', '02_classic_ml/09_naive_bayes.html',                    'Наивный Байес'],
    ['02 Классический ML', '02_classic_ml/10_decision_trees.html',                 'Деревья решений'],
    ['02 Классический ML', '02_classic_ml/11_bagging_random_forest.html',          'Бэггинг и Random Forest'],
    ['02 Классический ML', '02_classic_ml/12_boosting.html',                       'Бустинг'],
    ['02 Классический ML', '02_classic_ml/12a_gradient_boosting_theory.html',      'Gradient Boosting: теория'],
    ['02 Классический ML', '02_classic_ml/12b_gradient_boosting_in_practice.html', 'Gradient Boosting: практика'],
    ['02 Классический ML', '02_classic_ml/13_support_vector_machines.html',        'SVM'],
    ['02 Классический ML', '02_classic_ml/13a_kernel_methods_deeper.html',         'Kernel Methods'],
    ['02 Классический ML', '02_classic_ml/14_clustering.html',                     'Кластеризация'],
    ['02 Классический ML', '02_classic_ml/14a_gaussian_mixtures_em.html',          'Гауссовы смеси (EM)'],
    ['02 Классический ML', '02_classic_ml/15_dimensionality_reduction.html',       'Снижение размерности'],
    ['02 Классический ML', '02_classic_ml/15a_kernel_pca_ica_autoencoders.html',   'Kernel PCA, ICA, Автоэнкодеры'],
    ['02 Классический ML', '02_classic_ml/16_ensembles.html',                      'Ансамблевые методы'],
    ['02 Классический ML', '02_classic_ml/17_validation_and_hyperparameter_tuning.html', 'Валидация и гиперпараметры'],
    ['02 Классический ML', '02_classic_ml/18_imbalanced_classes.html',             'Дисбаланс классов'],
    ['02 Классический ML', '02_classic_ml/19_model_interpretation.html',           'Интерпретация моделей'],
    ['02 Классический ML', '02_classic_ml/20_practical_pipeline.html',             'Практический pipeline'],
    ['02 Классический ML', '02_classic_ml/21_anomaly_detection.html',              'Обнаружение аномалий'],
    ['02 Классический ML', '02_classic_ml/22_time_series_fundamentals.html',       'Основы временных рядов'],
    // ── 03 Основы нейросетей ──────────────────────────────────────────
    ['03 Основы нейросетей', '03_neural_basics/01_perceptron_and_neuron.html',  'Перцептрон и нейрон'],
    ['03 Основы нейросетей', '03_neural_basics/02_activation_functions.html',   'Функции активации'],
    ['03 Основы нейросетей', '03_neural_basics/03_forward_pass.html',           'Прямой проход'],
    ['03 Основы нейросетей', '03_neural_basics/04_loss_functions.html',         'Функции потерь'],
    // ── 04 Обучение ───────────────────────────────────────────────────
    ['04 Обучение', '04_training/01_backpropagation.html',              'Backpropagation'],
    ['04 Обучение', '04_training/02_optimizers.html',                   'Оптимизаторы'],
    ['04 Обучение', '04_training/03_adam_adamw_lion.html',              'Adam, AdamW, Lion'],
    ['04 Обучение', '04_training/04_regularization.html',               'Регуляризация'],
    ['04 Обучение', '04_training/05_learning_rate_scheduling.html',     'Learning Rate Scheduling'],
    ['04 Обучение', '04_training/06_gradient_clipping_and_stability.html', 'Gradient Clipping'],
    ['04 Обучение', '04_training/07_mixed_precision_training.html',     'Mixed Precision'],
    ['04 Обучение', '04_training/08_weight_initialization_deeper.html', 'Инициализация весов'],
    ['04 Обучение', '04_training/09_numerical_stability.html',          'Численная стабильность'],
    // ── 05 Архитектуры ────────────────────────────────────────────────
    ['05 Архитектуры', '05_architectures/01_cnn_convolutional_networks.html', 'CNN'],
    ['05 Архитектуры', '05_architectures/02_rnn_lstm.html',                   'RNN и LSTM'],
    ['05 Архитектуры', '05_architectures/03_transformer_attention.html',      'Attention'],
    ['05 Архитектуры', '05_architectures/04_transformer_architecture.html',   'Архитектура трансформера'],
    ['05 Архитектуры', '05_architectures/05_resnet_normalization.html',       'ResNet и нормализация'],
    ['05 Архитектуры', '05_architectures/06_positional_encodings.html',       'Позиционные кодировки'],
    ['05 Архитектуры', '05_architectures/07_efficient_attention.html',        'Efficient Attention'],
    ['05 Архитектуры', '05_architectures/08_vision_transformer.html',         'Vision Transformer (ViT)'],
    ['05 Архитектуры', '05_architectures/09_object_detection.html',           'Object Detection'],
    ['05 Архитектуры', '05_architectures/10_segmentation.html',               'Segmentation'],
    ['05 Архитектуры', '05_architectures/11_contrastive_learning_clip.html',  'Contrastive Learning & CLIP'],
    // ── 06 LLM ────────────────────────────────────────────────────────
    ['06 LLM', '06_llm/01_tokenization_bpe.html',                 'Токенизация (BPE)'],
    ['06 LLM', '06_llm/02_pretraining_objectives.html',           'Задачи предобучения'],
    ['06 LLM', '06_llm/03_instruction_tuning.html',               'Instruction Tuning'],
    ['06 LLM', '06_llm/04_rlhf.html',                             'RLHF'],
    ['06 LLM', '06_llm/05_lora_qlora.html',                       'LoRA & QLoRA'],
    ['06 LLM', '06_llm/06_scaling_laws.html',                     'Scaling Laws'],
    ['06 LLM', '06_llm/07_kv_cache_inference_optimization.html',  'KV-Cache & Inference'],
    ['06 LLM', '06_llm/08_dpo_alignment_alternatives.html',       'DPO и выравнивание'],
    ['06 LLM', '06_llm/09_retrieval_augmented_generation.html',   'RAG'],
    // ── 07 Генеративные модели ────────────────────────────────────────
    ['07 Генеративные модели', '07_generative_models/01_variational_autoencoders.html', 'VAE'],
    ['07 Генеративные модели', '07_generative_models/02_generative_adversarial_networks.html', 'GAN'],
    ['07 Генеративные модели', '07_generative_models/03_diffusion_models.html',         'Диффузионные модели'],
    ['07 Генеративные модели', '07_generative_models/04_normalizing_flows.html',        'Normalizing Flows'],
    ['07 Генеративные модели', '07_generative_models/05_stable_diffusion_deep_dive.html','Stable Diffusion'],
    // ── 08 Практика обучения ──────────────────────────────────────────
    ['08 Практика обучения', '08_training_practice/01_distributed_training.html',    'Distributed Training'],
    ['08 Практика обучения', '08_training_practice/02_gradient_checkpointing.html',  'Gradient Checkpointing'],
    ['08 Практика обучения', '08_training_practice/03_profiling_and_performance.html','Профилирование'],
    ['08 Практика обучения', '08_training_practice/04_debugging_loss_spikes.html',   'Отладка Loss Spikes'],
    // ── 09 MLOps & Deployment ─────────────────────────────────────────
    ['09 MLOps', '09_mlops_deployment/01_experiment_tracking.html',        'Трекинг экспериментов'],
    ['09 MLOps', '09_mlops_deployment/02_model_serving.html',              'Model Serving'],
    ['09 MLOps', '09_mlops_deployment/03_docker_for_ml.html',              'Docker для ML'],
    ['09 MLOps', '09_mlops_deployment/04_ml_system_design_patterns.html',  'Паттерны ML-систем'],
    ['09 MLOps', '09_mlops_deployment/05_interview_prep_system_design.html','System Design: интервью'],
    // ── 10 Проекты ────────────────────────────────────────────────────
    ['10 Проекты', '10_projects/01_neural_net_from_scratch.html',     'Нейросеть с нуля'],
    ['10 Проекты', '10_projects/02_finetune_llm_lora.html',           'Fine-tune LLM (LoRA)'],
    ['10 Проекты', '10_projects/03_end_to_end_cv_pipeline.html',      'CV Pipeline'],
    ['10 Проекты', '10_projects/04_rag_application.html',             'RAG-приложение'],
    ['10 Проекты', '10_projects/05_kaggle_competition_walkthrough.html','Kaggle Walkthrough'],
    // ── Job Prep ──────────────────────────────────────────────────────
    ['Подготовка к работе', 'job_prep/01_interview_question_bank.html',  'Банк вопросов'],
    ['Подготовка к работе', 'job_prep/02_ml_system_design.html',         'ML System Design'],
    ['Подготовка к работе', 'job_prep/03_resume_portfolio_checklist.html','Резюме и портфолио']
  ];

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
