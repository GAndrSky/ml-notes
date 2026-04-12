window.__mlNotesSearchExtraIndex = [
  {
    path: "course-roadmap.html",
    title: "Roadmap углубления курса",
    section: "План развития",
    summary: "Страница с фазами развития курса: сначала углубление блоков 2–5, затем расширение математики и запуск новых треков LLM, generative models и инженерной практики.",
    headings: "Roadmap углубления курса | Главный принцип | Фаза 1 | Фаза 2 | Фаза 3 | Очередь добавления страниц",
    content: "roadmap курса план развития блок 2 классическое ml блок 3 база нейросетей блок 4 обучение блок 5 архитектуры блок 6 llm блок 7 generative models блок 8 практика обучения gradient boosting kernel methods lr scheduling mixed precision rope vit diffusion"
  },
  {
    path: "04_training/05_learning_rate_scheduling.html",
    title: "4.5 Learning Rate Scheduling",
    section: "Блок 4. Обучение",
    summary: "Warmup, cosine annealing, step decay, OneCycleLR и объяснение того, почему график learning rate влияет на устойчивость и финальное качество модели.",
    headings: "4.5 Learning Rate Scheduling | Почему одного lr недостаточно | Интерактив scheduler | Warmup | Cosine annealing | Step decay | OneCycleLR | PyTorch scheduler",
    content: "learning rate scheduling warmup cosine annealing onecyclelr step decay scheduler adamw optimizer training stability transformer warmup график lr"
  },
  {
    path: "04_training/06_gradient_clipping_and_stability.html",
    title: "4.6 Gradient Clipping и численная стабильность",
    section: "Блок 4. Обучение",
    summary: "Exploding gradients, clip by norm, clip by value, NaN-debugging и общая численная устойчивость training loop.",
    headings: "4.6 Gradient Clipping | exploding gradients | clip by norm | clip by value | численная стабильность | log-sum-exp | AMP + clipping",
    content: "gradient clipping exploding gradients clip by norm clip by value numerical stability nan inf loss spikes log-sum-exp optimizer stability"
  },
  {
    path: "04_training/07_mixed_precision_training.html",
    title: "4.7 Mixed Precision Training",
    section: "Блок 4. Обучение",
    summary: "FP16, BF16, autocast, GradScaler, loss scaling и практический разбор mixed precision в современном training loop.",
    headings: "4.7 Mixed Precision Training | FP16 vs BF16 | loss scaling | autocast | GradScaler | AMP | PyTorch mixed precision",
    content: "mixed precision training fp16 bf16 autocast gradscaler loss scaling amp underflow overflow tensor cores training speed memory"
  },
  {
    path: "04_training/08_weight_initialization_deeper.html",
    title: "4.8 Инициализация весов глубже",
    section: "Блок 4. Обучение",
    summary: "Variance propagation, Xavier / Glorot, He / Kaiming и объяснение того, как инициализация влияет на forward и backward сигнал.",
    headings: "4.8 Инициализация весов глубже | variance propagation | Xavier | He | Kaiming | Glorot | инициализация весов",
    content: "инициализация весов xavier he kaiming glorot variance propagation fan in fan out relu tanh forward backward signal"
  },
  {
    path: "02_classic_ml/12a_gradient_boosting_theory.html",
    title: "2.12a Теория Gradient Boosting",
    section: "Блок 2. Классическое ML",
    summary: "Functional gradient descent, pseudo-residuals, shrinkage и stage-wise взгляд на boosting как на оптимизацию в пространстве функций.",
    headings: "2.12a Теория Gradient Boosting | functional gradient descent | pseudo residuals | shrinkage | weak learner | stage-wise boosting",
    content: "gradient boosting theory functional gradient descent pseudo residuals shrinkage weak learner stage wise boosting trees residuals"
  },
  {
    path: "02_classic_ml/12b_gradient_boosting_in_practice.html",
    title: "2.12b XGBoost, LightGBM и CatBoost",
    section: "Блок 2. Классическое ML",
    summary: "Практический слой boosting: leaf weights, gain formula, XGBoost, LightGBM, CatBoost и чтение ключевых hyperparameters.",
    headings: "2.12b XGBoost LightGBM CatBoost | gain formula | histogram boosting | ordered boosting | hyperparameters",
    content: "xgboost lightgbm catboost gain formula histogram ordered boosting min child weight lambda gamma learning rate"
  },
  {
    path: "02_classic_ml/13a_kernel_methods_deeper.html",
    title: "2.13a Kernel Methods глубже",
    section: "Блок 2. Классическое ML",
    summary: "Mercer, Gram matrix, RBF kernel, hidden feature space и геометрия kernel methods за пределами базового SVM.",
    headings: "2.13a Kernel Methods глубже | Mercer | Gram matrix | RBF | kernel trick | kernel PCA",
    content: "kernel methods mercer gram matrix rbf kernel trick svm hidden feature space gamma kernel pca"
  },
  {
    path: "02_classic_ml/14a_gaussian_mixtures_em.html",
    title: "2.14a Gaussian Mixture Models и EM",
    section: "Блок 2. Классическое ML",
    summary: "GMM, soft assignments, responsibilities и EM как мост от кластеризации к вероятностным моделям с латентными переменными.",
    headings: "2.14a Gaussian Mixture Models и EM | responsibilities | E-step | M-step | latent variables",
    content: "gmm gaussian mixture em responsibilities e step m step latent variables probabilistic clustering density estimation"
  },
  {
    path: "02_classic_ml/15a_kernel_pca_ica_autoencoders.html",
    title: "2.15a Kernel PCA, ICA и Autoencoders",
    section: "Блок 2. Классическое ML",
    summary: "Нелинейное уменьшение размерности, разделение источников и learned representations как следующий слой после обычного PCA.",
    headings: "2.15a Kernel PCA ICA Autoencoders | nonlinear dimensionality reduction | source separation | representation learning",
    content: "kernel pca ica autoencoders nonlinear dimensionality reduction source separation representation learning pca"
  },
  {
    path: "05_architectures/06_positional_encodings.html",
    title: "5.6 Positional Encodings глубже",
    section: "Блок 5. Архитектуры",
    summary: "Sinusoidal, learned positional embeddings, RoPE, ALiBi и разный способ внесения позиции в Transformer.",
    headings: "5.6 Positional Encodings глубже | sinusoidal | learned embeddings | RoPE | ALiBi",
    content: "positional encodings sinusoidal learned rope alibi transformer long context rotary embeddings"
  },
  {
    path: "05_architectures/07_efficient_attention.html",
    title: "5.7 Efficient Attention",
    section: "Блок 5. Архитектуры",
    summary: "FlashAttention, sparse attention и Longformer-идеи как ответ на квадратичную стоимость полного attention.",
    headings: "5.7 Efficient Attention | FlashAttention | sparse attention | Longformer | memory bottleneck",
    content: "efficient attention flashattention sparse attention longformer memory bottleneck exact attention long context"
  },
  {
    path: "05_architectures/08_vision_transformer.html",
    title: "5.8 Vision Transformer",
    section: "Блок 5. Архитектуры",
    summary: "Патчи как токены, class token, positional encoding для изображений и компромиссы ViT по сравнению с CNN.",
    headings: "5.8 Vision Transformer | patch embeddings | class token | image positional encoding | vit vs cnn",
    content: "vision transformer vit patch embeddings class token positional encoding images vit vs cnn"
  },
  {
    path: "06_llm/01_tokenization_bpe.html",
    title: "6.1 Tokenization и BPE",
    section: "Блок 6. LLM",
    summary: "Subword tokenization, BPE, byte-level токенизация и компромисс между словарём и длиной последовательности.",
    headings: "6.1 Tokenization и BPE | subword tokenization | byte pair encoding | byte level tokens",
    content: "tokenization bpe byte pair encoding subword tokenizer byte level vocabulary context length llm"
  },
  {
    path: "06_llm/02_pretraining_objectives.html",
    title: "6.2 LLM Pre-training",
    section: "Блок 6. LLM",
    summary: "Next-token objective, data mixture и интуиция того, что именно учится в pre-training large language model.",
    headings: "6.2 Pre-training | next token prediction | data mixture | language modeling objective",
    content: "llm pretraining next token prediction data mixture language modeling objective pre train corpus"
  },
  {
    path: "06_llm/03_instruction_tuning.html",
    title: "6.3 Instruction Tuning",
    section: "Блок 6. LLM",
    summary: "Supervised fine-tuning на instruction-response данных и превращение pre-trained модели в полезного ассистента.",
    headings: "6.3 Instruction Tuning | supervised fine tuning | assistant behavior | chat format",
    content: "instruction tuning sft supervised fine tuning assistant behavior chat format alignment"
  },
  {
    path: "06_llm/04_rlhf.html",
    title: "6.4 RLHF",
    section: "Блок 6. LLM",
    summary: "Reward model, preference optimization, PPO и ограничения RLHF как способа alignment.",
    headings: "6.4 RLHF | reward model | PPO | preference optimization | KL penalty",
    content: "rlhf reward model ppo preference optimization kl penalty alignment llm"
  },
  {
    path: "06_llm/05_lora_qlora.html",
    title: "6.5 LoRA и QLoRA",
    section: "Блок 6. LLM",
    summary: "Low-rank adaptation, quantized base models и parameter-efficient fine-tuning больших LLM.",
    headings: "6.5 LoRA и QLoRA | low rank adaptation | parameter efficient fine tuning | quantization",
    content: "lora qlora low rank adaptation peft quantization adapters large language models"
  },
  {
    path: "06_llm/06_scaling_laws.html",
    title: "6.6 Scaling Laws",
    section: "Блок 6. LLM",
    summary: "Scaling laws, параметры, токены, compute-optimal режим и Chinchilla-интуиция.",
    headings: "6.6 Scaling Laws | compute optimal | Chinchilla | parameters vs tokens",
    content: "scaling laws chinchilla compute optimal parameters tokens llm scaling power law"
  },
  {
    path: "07_generative_models/01_variational_autoencoders.html",
    title: "7.1 Variational Autoencoders",
    section: "Блок 7. Generative Models",
    summary: "Latent variables, ELBO, KL term и reparameterization trick для вариационных автоэнкодеров.",
    headings: "7.1 Variational Autoencoders | ELBO | KL divergence | reparameterization trick",
    content: "vae variational autoencoder elbo kl divergence reparameterization latent variables generative model"
  },
  {
    path: "07_generative_models/02_generative_adversarial_networks.html",
    title: "7.2 GAN",
    section: "Блок 7. Generative Models",
    summary: "Minimax objective, generator vs discriminator и mode collapse в adversarial training.",
    headings: "7.2 GAN | minimax objective | generator discriminator | mode collapse",
    content: "gan minimax objective generator discriminator mode collapse adversarial training"
  },
  {
    path: "07_generative_models/03_diffusion_models.html",
    title: "7.3 Diffusion Models",
    section: "Блок 7. Generative Models",
    summary: "Forward noise process, reverse denoising и DDPM-идея как основа современных diffusion models.",
    headings: "7.3 Diffusion Models | DDPM | denoising | forward process | reverse process",
    content: "diffusion models ddpm denoising forward process reverse process noise prediction generative models"
  },
  {
    path: "08_training_practice/01_distributed_training.html",
    title: "8.1 Distributed Training",
    section: "Блок 8. Практика обучения",
    summary: "DDP, FSDP и базовая инженерная логика распределённого обучения больших моделей.",
    headings: "8.1 Distributed Training | DDP | FSDP | sharding | data parallel",
    content: "distributed training ddp fsdp sharding data parallel large model training"
  },
  {
    path: "08_training_practice/02_gradient_checkpointing.html",
    title: "8.2 Gradient Checkpointing",
    section: "Блок 8. Практика обучения",
    summary: "Trade-off между памятью и вычислениями за счёт recomputation activations.",
    headings: "8.2 Gradient Checkpointing | memory vs compute | recomputation",
    content: "gradient checkpointing activation recomputation memory compute training practice"
  },
  {
    path: "08_training_practice/03_profiling_and_performance.html",
    title: "8.3 Profiling и Performance",
    section: "Блок 8. Практика обучения",
    summary: "Поиск bottleneck-ов, step time, utilization и реальные причины медленного training loop.",
    headings: "8.3 Profiling и Performance | bottlenecks | utilization | step time",
    content: "profiling performance bottlenecks gpu utilization step time dataloader training loop"
  },
  {
    path: "08_training_practice/04_debugging_loss_spikes.html",
    title: "8.4 Debugging Loss Spikes",
    section: "Блок 8. Практика обучения",
    summary: "Чек-лист для всплесков loss, NaN, grad norm проблем и нестабильного optimizer state.",
    headings: "8.4 Debugging Loss Spikes | nan | grad norm | unstable training",
    content: "loss spikes nan grad norm unstable training optimizer state debugging training"
  }
];
