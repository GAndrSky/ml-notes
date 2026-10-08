/**
 * course-manifest.js - single source of truth for the course structure.
 *
 * Read by shared-nav.js (sidebar, index cards, progress) and
 * shared-prevnext.js (prev/next pager). Order here = course order.
 *
 * section: id, label (sidebar badge), title (sidebar heading),
 *          pagerTitle (pager progress caption), accent (CSS colour)
 * page:    path (from site root), label (sidebar/index, numbered),
 *          title (short title on prev/next buttons)
 *
 * After editing, run scripts/build-bundle.ps1 and scripts/smoke-check-course.ps1.
 */
window.__mlNotesCourse = {
  sections: [
    {
      id: "math",
      label: "Блок 1",
      title: "Математика",
      pagerTitle: "01 Математика",
      accent: "#6c8ebf",
      pages: [
        { path: "01_math/01_linear_algebra.html", label: "1.1 Линейная алгебра", title: "Линейная алгебра" },
        { path: "01_math/02_calculus.html", label: "1.2 Матанализ", title: "Математический анализ" },
        { path: "01_math/03_probability_theory.html", label: "1.3 Теория вероятностей", title: "Теория вероятностей" },
        { path: "01_math/04_information_theory.html", label: "1.4 Теория информации", title: "Теория информации" },
        { path: "01_math/05_optimization_theory.html", label: "1.5 Optimization Theory", title: "Теория оптимизации" }
      ]
    },
    {
      id: "classic-ml",
      label: "Блок 2",
      title: "Классическое ML",
      pagerTitle: "02 Классический ML",
      accent: "#7eb87e",
      pages: [
        { path: "02_classic_ml/01_intro_to_classical_ml.html", label: "2.1 Классическое ML", title: "Введение в классический ML" },
        { path: "02_classic_ml/02_data_preprocessing.html", label: "2.2 Предобработка", title: "Препроцессинг данных" },
        { path: "02_classic_ml/03_linear_regression.html", label: "2.3 Линейная регрессия", title: "Линейная регрессия" },
        { path: "02_classic_ml/04_linear_model_regularization.html", label: "2.4 Регуляризация", title: "Регуляризация линейных моделей" },
        { path: "02_classic_ml/05_logistic_regression.html", label: "2.5 Логистическая регрессия", title: "Логистическая регрессия" },
        { path: "02_classic_ml/06_regression_metrics.html", label: "2.6 Метрики регрессии", title: "Метрики регрессии" },
        { path: "02_classic_ml/07_classification_metrics.html", label: "2.7 Метрики классификации", title: "Метрики классификации" },
        { path: "02_classic_ml/08_distance_based_models.html", label: "2.8 k-NN / Distance", title: "Модели на расстоянии (KNN)" },
        { path: "02_classic_ml/09_naive_bayes.html", label: "2.9 Naive Bayes", title: "Наивный Байес" },
        { path: "02_classic_ml/10_decision_trees.html", label: "2.10 Decision Trees", title: "Деревья решений" },
        { path: "02_classic_ml/11_bagging_random_forest.html", label: "2.11 Random Forest", title: "Бэггинг и Random Forest" },
        { path: "02_classic_ml/12_boosting.html", label: "2.12 Boosting", title: "Бустинг" },
        { path: "02_classic_ml/12a_gradient_boosting_theory.html", label: "2.12a GB Theory", title: "Gradient Boosting: теория" },
        { path: "02_classic_ml/12b_gradient_boosting_in_practice.html", label: "2.12b GBDT Practice", title: "Gradient Boosting: практика" },
        { path: "02_classic_ml/13_support_vector_machines.html", label: "2.13 SVM", title: "SVM" },
        { path: "02_classic_ml/13a_kernel_methods_deeper.html", label: "2.13a Kernels", title: "Kernel Methods" },
        { path: "02_classic_ml/14_clustering.html", label: "2.14 Кластеризация", title: "Кластеризация" },
        { path: "02_classic_ml/14a_gaussian_mixtures_em.html", label: "2.14a GMM / EM", title: "Гауссовы смеси (EM)" },
        { path: "02_classic_ml/15_dimensionality_reduction.html", label: "2.15 Снижение размерности", title: "Снижение размерности" },
        { path: "02_classic_ml/15a_kernel_pca_ica_autoencoders.html", label: "2.15a KPCA / ICA", title: "Kernel PCA, ICA, Автоэнкодеры" },
        { path: "02_classic_ml/16_ensembles.html", label: "2.16 Ансамбли", title: "Ансамблевые методы" },
        { path: "02_classic_ml/17_validation_and_hyperparameter_tuning.html", label: "2.17 Валидация / HPO", title: "Валидация и гиперпараметры" },
        { path: "02_classic_ml/18_imbalanced_classes.html", label: "2.18 Несбалансированные классы", title: "Дисбаланс классов" },
        { path: "02_classic_ml/19_model_interpretation.html", label: "2.19 Интерпретация", title: "Интерпретация моделей" },
        { path: "02_classic_ml/20_practical_pipeline.html", label: "2.20 Практический pipeline", title: "Практический pipeline" },
        { path: "02_classic_ml/21_anomaly_detection.html", label: "2.21 Anomaly Detection", title: "Обнаружение аномалий" },
        { path: "02_classic_ml/22_time_series_fundamentals.html", label: "2.22 Time Series", title: "Основы временных рядов" }
      ]
    },
    {
      id: "neural-basics",
      label: "Блок 3",
      title: "База нейросетей",
      pagerTitle: "03 Основы нейросетей",
      accent: "#c8956c",
      pages: [
        { path: "03_neural_basics/01_perceptron_and_neuron.html", label: "3.1 Нейрон", title: "Перцептрон и нейрон" },
        { path: "03_neural_basics/02_activation_functions.html", label: "3.2 Активации", title: "Функции активации" },
        { path: "03_neural_basics/03_forward_pass.html", label: "3.3 Forward pass", title: "Прямой проход" },
        { path: "03_neural_basics/04_loss_functions.html", label: "3.4 Loss", title: "Функции потерь" }
      ]
    },
    {
      id: "training",
      label: "Блок 4",
      title: "Обучение",
      pagerTitle: "04 Обучение",
      accent: "#b87eb8",
      pages: [
        { path: "04_training/01_backpropagation.html", label: "4.1 Backprop", title: "Backpropagation" },
        { path: "04_training/02_optimizers.html", label: "4.2 Оптимизаторы", title: "Оптимизаторы" },
        { path: "04_training/03_adam_adamw_lion.html", label: "4.3 Adam / Lion", title: "Adam, AdamW, Lion" },
        { path: "04_training/04_regularization.html", label: "4.4 Регуляризация", title: "Регуляризация" },
        { path: "04_training/05_learning_rate_scheduling.html", label: "4.5 LR Scheduling", title: "Learning Rate Scheduling" },
        { path: "04_training/06_gradient_clipping_and_stability.html", label: "4.6 Clipping / Stability", title: "Gradient Clipping" },
        { path: "04_training/07_mixed_precision_training.html", label: "4.7 Mixed Precision", title: "Mixed Precision" },
        { path: "04_training/08_weight_initialization_deeper.html", label: "4.8 Инициализация", title: "Инициализация весов" },
        { path: "04_training/09_numerical_stability.html", label: "4.9 Numerical Stability", title: "Численная стабильность" }
      ]
    },
    {
      id: "architectures",
      label: "Блок 5",
      title: "Архитектуры",
      pagerTitle: "05 Архитектуры",
      accent: "#7eb8b8",
      pages: [
        { path: "05_architectures/01_cnn_convolutional_networks.html", label: "5.1 CNN", title: "CNN" },
        { path: "05_architectures/02_rnn_lstm.html", label: "5.2 RNN / LSTM", title: "RNN и LSTM" },
        { path: "05_architectures/03_transformer_attention.html", label: "5.3 Attention", title: "Attention" },
        { path: "05_architectures/04_transformer_architecture.html", label: "5.4 Архитектура", title: "Архитектура трансформера" },
        { path: "05_architectures/05_resnet_normalization.html", label: "5.5 ResNet / Norm", title: "ResNet и нормализация" },
        { path: "05_architectures/06_positional_encodings.html", label: "5.6 Positional Encodings", title: "Позиционные кодировки" },
        { path: "05_architectures/07_efficient_attention.html", label: "5.7 Efficient Attention", title: "Efficient Attention" },
        { path: "05_architectures/08_vision_transformer.html", label: "5.8 ViT", title: "Vision Transformer (ViT)" },
        { path: "05_architectures/09_object_detection.html", label: "5.9 Object Detection", title: "Object Detection" },
        { path: "05_architectures/10_segmentation.html", label: "5.10 Segmentation", title: "Segmentation" },
        { path: "05_architectures/11_contrastive_learning_clip.html", label: "5.11 Contrastive / CLIP", title: "Contrastive Learning & CLIP" }
      ]
    },
    {
      id: "llm",
      label: "Блок 6",
      title: "LLM",
      pagerTitle: "06 LLM",
      accent: "#d497b8",
      pages: [
        { path: "06_llm/01_tokenization_bpe.html", label: "6.1 Tokenization / BPE", title: "Токенизация (BPE)" },
        { path: "06_llm/02_pretraining_objectives.html", label: "6.2 Pre-training", title: "Задачи предобучения" },
        { path: "06_llm/03_instruction_tuning.html", label: "6.3 Instruction tuning", title: "Instruction Tuning" },
        { path: "06_llm/04_rlhf.html", label: "6.4 RLHF", title: "RLHF" },
        { path: "06_llm/05_lora_qlora.html", label: "6.5 LoRA / QLoRA", title: "LoRA & QLoRA" },
        { path: "06_llm/06_scaling_laws.html", label: "6.6 Scaling laws", title: "Scaling Laws" },
        { path: "06_llm/07_kv_cache_inference_optimization.html", label: "6.7 KV-Cache / Inference", title: "KV-Cache & Inference" },
        { path: "06_llm/08_dpo_alignment_alternatives.html", label: "6.8 DPO / Alignment", title: "DPO и выравнивание" },
        { path: "06_llm/09_retrieval_augmented_generation.html", label: "6.9 RAG", title: "RAG" }
      ]
    },
    {
      id: "generative",
      label: "Блок 7",
      title: "Generative Models",
      pagerTitle: "07 Генеративные модели",
      accent: "#d58f79",
      pages: [
        { path: "07_generative_models/01_variational_autoencoders.html", label: "7.1 VAE", title: "VAE" },
        { path: "07_generative_models/02_generative_adversarial_networks.html", label: "7.2 GAN", title: "GAN" },
        { path: "07_generative_models/03_diffusion_models.html", label: "7.3 Diffusion", title: "Диффузионные модели" },
        { path: "07_generative_models/04_normalizing_flows.html", label: "7.4 Normalizing Flows", title: "Normalizing Flows" },
        { path: "07_generative_models/05_stable_diffusion_deep_dive.html", label: "7.5 Stable Diffusion", title: "Stable Diffusion" }
      ]
    },
    {
      id: "training-practice",
      label: "Блок 8",
      title: "Практика обучения",
      pagerTitle: "08 Практика обучения",
      accent: "#97a9d6",
      pages: [
        { path: "08_training_practice/01_distributed_training.html", label: "8.1 DDP / FSDP", title: "Distributed Training" },
        { path: "08_training_practice/02_gradient_checkpointing.html", label: "8.2 Checkpointing", title: "Gradient Checkpointing" },
        { path: "08_training_practice/03_profiling_and_performance.html", label: "8.3 Profiling", title: "Профилирование" },
        { path: "08_training_practice/04_debugging_loss_spikes.html", label: "8.4 Loss spikes", title: "Отладка Loss Spikes" }
      ]
    },
    {
      id: "mlops",
      label: "Блок 9",
      title: "MLOps / Deployment",
      pagerTitle: "09 MLOps",
      accent: "#6ea5ff",
      pages: [
        { path: "09_mlops_deployment/01_experiment_tracking.html", label: "9.1 Experiment Tracking", title: "Трекинг экспериментов" },
        { path: "09_mlops_deployment/02_model_serving.html", label: "9.2 Model Serving", title: "Model Serving" },
        { path: "09_mlops_deployment/03_docker_for_ml.html", label: "9.3 Docker for ML", title: "Docker для ML" },
        { path: "09_mlops_deployment/04_ml_system_design_patterns.html", label: "9.4 ML System Design", title: "Паттерны ML-систем" },
        { path: "09_mlops_deployment/05_interview_prep_system_design.html", label: "9.5 System Design Interview", title: "System Design: интервью" }
      ]
    },
    {
      id: "job-prep",
      label: "Job Prep",
      title: "Подготовка к собеседованиям",
      pagerTitle: "Подготовка к работе",
      accent: "#82d0b6",
      pages: [
        { path: "job_prep/01_interview_question_bank.html", label: "Interview Question Bank", title: "Банк вопросов" },
        { path: "job_prep/02_ml_system_design.html", label: "ML System Design Framework", title: "ML System Design" },
        { path: "job_prep/03_resume_portfolio_checklist.html", label: "Resume / Portfolio Checklist", title: "Резюме и портфолио" }
      ]
    },
    {
      id: "projects",
      label: "Блок 10",
      title: "Projects",
      pagerTitle: "10 Проекты",
      accent: "#8fd17f",
      pages: [
        { path: "10_projects/01_neural_net_from_scratch.html", label: "10.1 NN from Scratch", title: "Нейросеть с нуля" },
        { path: "10_projects/02_finetune_llm_lora.html", label: "10.2 LoRA Fine-tuning", title: "Fine-tune LLM (LoRA)" },
        { path: "10_projects/03_end_to_end_cv_pipeline.html", label: "10.3 CV Pipeline", title: "CV Pipeline" },
        { path: "10_projects/04_rag_application.html", label: "10.4 RAG Application", title: "RAG-приложение" },
        { path: "10_projects/05_kaggle_competition_walkthrough.html", label: "10.5 Kaggle Walkthrough", title: "Kaggle Walkthrough" }
      ]
    }
  ]
};
