import fs from "fs";
import os from "os";
import path from "path";

// 1. Firebase auth & REST setup
const configPath = path.join(os.homedir(), ".config", "configstore", "firebase-tools.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const token = config.tokens?.access_token;
const projectId = "quanters-d0312";

if (!token) {
  console.error("No access token found in firebase-tools.json");
  process.exit(1);
}

function toFirestoreValue(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === "boolean") return { booleanValue: val };
  if (typeof val === "number") {
    if (Number.isInteger(val)) return { integerValue: String(val) };
    return { doubleValue: val };
  }
  if (typeof val === "string") return { stringValue: val };
  if (Array.isArray(val)) {
    return {
      arrayValue: {
        values: val.map(toFirestoreValue),
      },
    };
  }
  if (typeof val === "object") {
    const fields = {};
    for (const [k, v] of Object.entries(val)) {
      if (v !== undefined) {
        fields[k] = toFirestoreValue(v);
      }
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

async function patchDocFields(collection, docId, fieldsObj) {
  const fieldPaths = Object.keys(fieldsObj).map((k) => `updateMask.fieldPaths=${k}`).join("&");
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}/${docId}?${fieldPaths}`;
  
  const fields = {};
  for (const [k, v] of Object.entries(fieldsObj)) {
    fields[k] = toFirestoreValue(v);
  }

  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields }),
  });

  const data = await res.json();
  if (data.error) {
    throw new Error(`Firestore patch error: ${JSON.stringify(data.error)}`);
  }
  return data;
}

// 2. New 10 Daily Quizzes for 2026-11-14 (+2 XP each, Varied Answers: b, d, a, c, b, d, a, c, d, b)
const NEW_DAILY_QUIZZES_NOV14 = [
  {
    id: "quiz-2026-11-14-01",
    domain: "الذكاء الاصطناعي للعلوم (AI for Science)",
    icon: "ai-ml",
    question: "ما هو الهدف الاستراتيجي الأبرز لمنظومات 'AI for Science' الحديثة لعام 2026 في المعامل البحثية؟",
    options: [
      {
        id: "a",
        label: "الاستغناء الكامل عن القوانين الفيزيائية والكيميائية المعتمدة"
      },
      {
        id: "b",
        label: "أتمتة صياغة الفرضيات، تسريع تصميم الجزيئات واختصار مسارات التجارب المخبرية المعقدة"
      },
      {
        id: "c",
        label: "توليد ملفات الفيديو الترفيهية الفردية فقط"
      },
      {
        id: "d",
        label: "إغلاق المعامل الجامعية وقواعد البيانات العلمية"
      }
    ],
    correctId: "b", // Correct: B
    verdictTitle: "تسريع الاكتشاف العلمي عبر وكلاء الذكاء الاصطناعي",
    explanation: "تعتمد ثورة 'AI for Science' على وكلاء أذكياء متعددي النماذج قادرين على قراءة ملايين الأوراق البحثية، صياغة فرضيات كيميائية وفيزيائية واختبارها محاكاةً في ثوانٍ معدودة.",
    xpReward: 2,
    dateLabel: "2026-11-14",
    isPinnedToday: true,
    active: true
  },
  {
    id: "quiz-2026-11-14-02",
    domain: "الحوسبة والفيزياء الكمية (Quantum Physics)",
    icon: "quantum",
    question: "ما هي الظاهرة الفيزيائية الكمية التي تتيح للبت الكمي (Qubit) التواجد في حالتي 0 و 1 معاً في نفس اللحظة؟",
    options: [
      {
        id: "a",
        label: "الانكسار الضوئي الكلاسيكي"
      },
      {
        id: "b",
        label: "التوصيل الحراري المباشر"
      },
      {
        id: "c",
        label: "الاحتكاك الكهرومغناطيسي السطحي"
      },
      {
        id: "d",
        label: "التراكب الكمي (Quantum Superposition)"
      }
    ],
    correctId: "d", // Correct: D
    verdictTitle: "التراكب الكمي: قوة المعالجة الخارقة",
    explanation: "تتيح خاصية التراكب الكمي للكيوبت تمثيل حالات متعددة متزامنة، مما يمنح الحواسيب الكمية قدرة فائقة على حل معادلات التشفير والمحاكاة الجزيئية المعقدة.",
    xpReward: 2,
    dateLabel: "2026-11-14",
    isPinnedToday: false,
    active: true
  },
  {
    id: "quiz-2026-11-14-03",
    domain: "الفلك والفيزياء الفضائية (JWST Astrophysics)",
    icon: "astronomy",
    question: "في أي نطاق من الطيف الكهرومغناطيسي يرصد تلسكوب جيمس ويب (JWST) لاختراق سحب الغبار الكوني ورصد بدايات الكون؟",
    options: [
      {
        id: "a",
        label: "الأشعة تحت الحمراء (Infrared Spectrum)"
      },
      {
        id: "b",
        label: "أشعة غاما ذات الطاقة المدمرة"
      },
      {
        id: "c",
        label: "الموجات الصوتية الميكانيكية"
      },
      {
        id: "d",
        label: "الأشعة فوق البنفسجية القصيرة فقط"
      }
    ],
    correctId: "a", // Correct: A
    verdictTitle: "رصد أعماق الكون بالأشعة تحت الحمراء",
    explanation: "صُمم تلسكوب جيمس ويب للرصد في نطاق الأشعة تحت الحمراء القريبة والمتوسطة، لأن أطوالها الموجية تنفذ عبر الغبار الفضائي وتكشف الضوء المنزاح نحو الأحمر من أقدم المجرات.",
    xpReward: 2,
    dateLabel: "2026-11-14",
    isPinnedToday: false,
    active: true
  },
  {
    id: "quiz-2026-11-14-04",
    domain: "البيولوجيا الجزيئية وعلم الوراثة (PCR Diagnostics)",
    icon: "genetics",
    question: "ما هي التقنية المخبرية الثورية التي تتيح مضاعفة وتكبير قطعة محددة من الـ DNA ملايين المرات في وقت قياسي؟",
    options: [
      {
        id: "a",
        label: "التقطير التجزيئي للبترول"
      },
      {
        id: "b",
        label: "التحليل الطيفي بالأشعة السينية"
      },
      {
        id: "c",
        label: "تفاعل البوليمراز المتسلسل (Polymerase Chain Reaction - PCR)"
      },
      {
        id: "d",
        label: "التبريد المغناطيسي الفائق"
      }
    ],
    correctId: "c", // Correct: C
    verdictTitle: "تقنية PCR لمضاعفة الحمض النووي",
    explanation: "تعتمد تقنية PCR على دورات حرارية متكررة وأنزيم بلمرة مقاوم للحرارة لمضاعفة تسلسلات جينية محددة أسيّاً، وتعد ركيزة التشخيص الفيروسي والبحث الجيني الحديث.",
    xpReward: 2,
    dateLabel: "2026-11-14",
    isPinnedToday: false,
    active: true
  },
  {
    id: "quiz-2026-11-14-05",
    domain: "شبكات الحاسوب والإنترنت (Network Protocols)",
    icon: "web-dev",
    question: "ما هو بروتوكول طبقة النقل الذي يضمن وصول الحزم البرمجية بالترتيب الصحيح ودون أي فقدان للبيانات؟",
    options: [
      {
        id: "a",
        label: "بروتوكول UDP غير الموجه"
      },
      {
        id: "b",
        label: "بروتوكول التحكم في النقل TCP (Transmission Control Protocol)"
      },
      {
        id: "c",
        label: "بروتوكول ICMP للرسائل التشخيصية"
      },
      {
        id: "d",
        label: "بروتوكول ARP لعناوين الذاكرة"
      }
    ],
    correctId: "b", // Correct: B
    verdictTitle: "موثوقية نقل البيانات عبر TCP",
    explanation: "يضمن بروتوكول TCP عبر آلية المصافحة الثلاثية (Three-way Handshake) وإعادة الإرسال عند الفقدان وصول البيانات كاملة ومرتبة، وهو أساس تصفح الويب الآمن ونقل الملفات.",
    xpReward: 2,
    dateLabel: "2026-11-14",
    isPinnedToday: false,
    active: true
  },
  {
    id: "quiz-2026-11-14-06",
    domain: "النسبية الخاصة والفيزياء النظرية (Relativity)",
    icon: "optics",
    question: "وفقاً للنظرية النسبية الخاصة لآينشتاين، ماذا يحدث لتدفق الزمن لجسم يتحرك بسرعة تقترب من سرعة الضوء بالنسبة لراصد ساكن؟",
    options: [
      {
        id: "a",
        label: "يتسارع الزمن بشكل لانهائي"
      },
      {
        id: "b",
        label: "ينعكس الزمن ليعود للماضي فوراً"
      },
      {
        id: "c",
        label: "لا يتأثر الزمن إطلاقاً ويبقى مطلقاً"
      },
      {
        id: "d",
        label: "يتباطأ تدفق الزمن (تمدد الزمن - Time Dilation)"
      }
    ],
    correctId: "d", // Correct: D
    verdictTitle: "تمدد الزمن النسبي عند السرعات العالية",
    explanation: "تثبت النسبية الخاصة أن الزمن ليس مطلقاً، فكلما اقتربت سرعة المراقب من سرعة الضوء c يتباطأ معدل مرور ساعته مقارنة بالمراقب الساكن نتيجة تمدد نسيج الزمكان.",
    xpReward: 2,
    dateLabel: "2026-11-14",
    isPinnedToday: false,
    active: true
  },
  {
    id: "quiz-2026-11-14-07",
    domain: "هياكل البيانات والبرمجة (Data Structures)",
    icon: "competitive-programming",
    question: "أي من هياكل البيانات التالية يعمل بصرامة وفق مبدأ 'ما يدخل آخراً يخرج أولاً' (LIFO - Last In First Out)؟",
    options: [
      {
        id: "a",
        label: "المكدس البرمجي (Stack)"
      },
      {
        id: "b",
        label: "طابور الانتظار (Queue)"
      },
      {
        id: "c",
        label: "المصفوفة الدائرية (Ring Buffer)"
      },
      {
        id: "d",
        label: "شجرة البحث الثنائية (Binary Search Tree)"
      }
    ],
    correctId: "a", // Correct: A
    verdictTitle: "المكدس البرمجي ومبدأ LIFO",
    explanation: "يعتمد هيكل المكدس (Stack) على مبدأ LIFO حيث تتم عمليتا الإضافة (Push) والحذف (Pop) من قمة المكدس فقط، وهو الهيكل المستخدم في سجل استدعاء الدوال (Call Stack) وتراجع التحرير (Undo).",
    xpReward: 2,
    dateLabel: "2026-11-14",
    isPinnedToday: false,
    active: true
  },
  {
    id: "quiz-2026-11-14-08",
    domain: "الأمن السيبراني والتشفير (Cryptography)",
    icon: "cybersecurity",
    question: "ما هو نمط التشفير الذي يستخدم زوجاً من المفاتيح: مفتاحاً عاماً للتشفير ومفتاحاً سرياً خاصاً لفك التشفير؟",
    options: [
      {
        id: "a",
        label: "التشفير التماثلي البسيط (Symmetric Cipher)"
      },
      {
        id: "b",
        label: "خوارزمية قيصر للإزاحة الخطية"
      },
      {
        id: "c",
        label: "التشفير غير المتماثل بالمفتاح العام (Asymmetric Public-Key Cryptography)"
      },
      {
        id: "d",
        label: "دالة التجزئة أحادية الاتجاه (One-way Hash)"
      }
    ],
    correctId: "c", // Correct: C
    verdictTitle: "التشفير بالمفتاح العام والخاص",
    explanation: "يعتمد التشفير غير المتماثل (مثل RSA ومنحنيات إهليلجية ECC) على زوج مفاتيح رياضي، مما يسمح بتبادل البيانات الآمن وإنشاء التوقيعات الرقمية عبر شبكات مفتوحة دون مشاركة المفتاح السري.",
    xpReward: 2,
    dateLabel: "2026-11-14",
    isPinnedToday: false,
    active: true
  },
  {
    id: "quiz-2026-11-14-09",
    domain: "الكيمياء الحيوية والطاقة الخلوية (Biochemistry)",
    icon: "biotech",
    question: "ما هو الجزيء الحيوي الذي يُعد عملة الطاقة الأساسية لجميع العمليات الحيوية داخل خلايا الكائنات الحية؟",
    options: [
      {
        id: "a",
        label: "حمض الفوليك"
      },
      {
        id: "b",
        label: "الكيراتين"
      },
      {
        id: "c",
        label: "الهيموغلوبين"
      },
      {
        id: "d",
        label: "أدينوسين ثلاثي الفوسفات (ATP - Adenosine Triphosphate)"
      }
    ],
    correctId: "d", // Correct: D
    verdictTitle: "جزيء ATP: عملة الطاقة الحيوية",
    explanation: "يخزن جزيء ATP الطاقة الكيميائية في روابط الفوسفات عالية الطاقة، ويتم تحريرها عند تكسير رابطة لتغذية الانقباض العضلي، نقل الأيونات وتصنيع الجزيئات الحيوية.",
    xpReward: 2,
    dateLabel: "2026-11-14",
    isPinnedToday: false,
    active: true
  },
  {
    id: "quiz-2026-11-14-10",
    domain: "رسالة ونشاطات نادي QUANTA العلمي",
    icon: "leadership",
    question: "ما الذي يميز نهج ورشات ومشاريع نادي QUANTA العلمي في إعداد الطلبة والباحثين؟",
    options: [
      {
        id: "a",
        label: "الاكتفاء بالمحاضرات النظرية السمعية دون تطبيق حاسوبي أو تجريبي"
      },
      {
        id: "b",
        label: "العمل العملي المباشر، البرمجيات مفتوحة المصدر، وحل المشكلات الهندسية والبحثية الواقعية"
      },
      {
        id: "c",
        label: "حظر المشاركة في المسابقات العلمية والهاكاثونات الوطنية والدولية"
      },
      {
        id: "d",
        label: "منع تبادل الخبرات بين الأجيال والأعضاء القدامى"
      }
    ],
    correctId: "b", // Correct: B
    verdictTitle: "النهج التطبيقي الرائد لنادي QUANTA",
    explanation: "يتبنى نادي QUANTA منهجية التعلم بالأقران والتطبيق التقني الفعلي في مجالات الذكاء الاصطناعي، الروبوتات والعلوم الدقيقة لخلق جيل باحث قادر على الابتكار والمنافسة عالمياً.",
    xpReward: 2,
    dateLabel: "2026-11-14",
    isPinnedToday: false,
    active: true
  }
];

// 3. Updated Explore Posts for Nov 14, 2026:
// 4 Fresh Published dispatches on carousel & feed, older ones archived!
const ALL_EXPLORE_POSTS_NOV14 = [
  {
    id: "exp-ai4s-scientific-discovery-2026",
    title: "AI for Science (AI4S): How Autonomous Generalist Agents are Accelerating Molecular Discovery & Quantum Physics",
    summary: "The convergence of frontier reasoning models and physical sciences ushers in autonomous hypothesis generation, non-destructive quantum readouts, and automated enzyme design across global labs.",
    content: `# AI for Science (AI4S): The 2026 Frontier of Autonomous Scientific Discovery

## 1. The Paradigm Shift from Text LLMs to Generalist Scientific Agents
The era of viewing Artificial Intelligence merely as a code assistant or conversational interface has given way to **AI for Science (AI4S)**. In late 2026, scientific discovery is governed by multi-modal scientific reasoning agents capable of parsing topological manifolds, processing cryo-EM protein density maps, and formulating falsifiable hypotheses with minimal human intervention.

Rather than relying on brute-force trial-and-error laboratory screening, research institutions leverage closed-loop co-scientist platforms that continuously coordinate literature synthesis, simulation kernel executions, and robotic experiment planning.

---

## 2. Key 2026 Breakthrough Pillars

### A. Non-Destructive Quantum Sensor Readouts
A historic barrier in quantum computing and quantum biology has been the wave-function collapse during state measurement. Recent breakthroughs in micro-supercurrent sensor arrays allow quantum states in diamond nitrogen-vacancy (NV) lattices to be read without annihilating fragile qubit coherences, opening new avenues for room-temperature quantum memory.

### B. Generative Enzyme Design & Variant Lethality Mapping
Following the maturation of structural co-folding engines, models such as **PopEVE** and next-generation generative sequence-to-structure diffusion networks are now capable of predicting disease variant lethality directly from raw genomic callsets, reducing early-stage oncology target discovery timelines from four years to six weeks.

### C. Formal Mathematical Proof Synthesis
Frontier reasoning models regularly achieve benchmark-topping results in formal mathematics, automatically translating informal human lemmas into verified Lean 4 and Isabelle/HOL proofs and discovering novel bounds in harmonic analysis.

---

## 3. Quantitative Impact on Experimental Pipelines
| Scientific Domain | Classical Time-to-Result | AI4S Accelerated Pipeline (2026) | Primary Methodology |
|:---|:---|:---|:---|
| **Protein-Ligand Interaction** | 6 - 18 Months (Assay) | **4 - 8 Hours (Predicted & Scored)** | Diffusion PLIF & Co-folding |
| **Material Bandgap Optimization** | 9 Months (Synthesis) | **48 Hours (DFT + Surrogates)** | Graph Neural Operators |
| **Quantum Qubit Decoherence Modeling** | Weeks (Numerical PDE) | **Real-Time (< 500 ms)** | Physics-Informed Neural Nets |
| **Zero-Day Code Vulnerability Discovery** | Months (Manual Audit) | **Minutes (SEC-bench 88.2%)** | Test-Time Compute Reasoning |

---

## 4. QUANTA Research Directorate Integration
Within QUANTA Scientific Club, the Modeling, AI, and Biotechnology tracks are launching dedicated co-scientist sandbox environments. Students and researchers can connect their computational notebooks directly to verified open-source models, running high-throughput molecular dynamics and quantum calculations on our university cluster.`,
    category: "Scientific News",
    tagLabel: "AI FOR SCIENCE (AI4S)",
    tagTone: "cyan",
    source: "Nature, Science & Google DeepMind Research",
    readTime: "5 min read",
    date: "Nov 14, 2026",
    imageUrl: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=1200&q=80",
    featuredInCarousel: true,
    status: "Published",
    externalUrl: "https://deepmind.google/technologies/gemini/"
  },
  {
    id: "exp-quantum-diamond-acoustic-readout",
    title: "Room-Temperature Quantum Systems: Acoustic Diamond Flaws and Non-Destructive Qubit Readouts",
    summary: "Physicists achieve coherent qubit preservation at ambient temperatures using microscopic vibrational memories in diamond lattices coupled with non-destructive supercurrent sensors.",
    content: `# Room-Temperature Quantum Systems: Diamond Acoustic Memories & Sensor Breakthroughs

## 1. Overcoming the Cryogenic Bottleneck
For decades, practical quantum computation has been tethered to multimillion-dollar dilution refrigerators operating near absolute zero ($15\\text{ mK}$). In late 2026, experimental condensed matter physicists achieved a milestone in ambient quantum coherence by harnessing **optically active nitrogen-vacancy (NV) centers in diamond** coupled to microscopic acoustic resonators.

> *"By treating atomic lattice vibrations like the harmonic strings of an instrument, quantum information can be stored in mechanical phononic states that resist thermal noise at room temperature."*

---

## 2. Core Technological Architecture
- **Acoustic Phonon Storage:** High-frequency surface acoustic wave (SAW) resonators fabricated directly onto ultra-pure synthetic diamond crystals trap phononic energy with quality factors exceeding $Q > 10^7$.
- **Non-Destructive Supercurrent Probing:** Superconducting quantum interference devices (SQUIDs) engineered with sub-micron weak links probe the stray magnetic dipole of individual NV electron spins without inducing decoherence.
- **Spin-Phonon Coherence Times:** Hyperfine coherence lifetimes ($T_2$) at room temperature have crossed the millisecond threshold, sufficient to execute thousands of fault-tolerant Clifford gate operations.

---

## 3. Implications for Quantum Sensing & Biology
1. **Intra-Cellular Magnetic Metrology:** Nanodiamonds functionalized with biocompatible lipid bilayers can measure action potentials inside living neurons with nanometer spatial precision.
2. **Decentralized Quantum Repeaters:** Ambient quantum memories eliminate cryogenic infrastructure from quantum key distribution (QKD) nodes, accelerating metropolitan quantum internet rollouts.`,
    category: "Scientific News",
    tagLabel: "QUANTUM COMPUTING",
    tagTone: "indigo",
    source: "Physical Review Letters & ScienceDaily",
    readTime: "5 min read",
    date: "Nov 14, 2026",
    imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&q=80",
    featuredInCarousel: true,
    status: "Published",
    externalUrl: "https://journals.aps.org/prl/"
  },
  {
    id: "exp-google-gemini-carbon",
    title: "Google Gemini 4 Carbon & Claude Fable 5.2: The Frontier Benchmark in Automated Verification & Long-Horizon Agents",
    summary: "Comparing the two landmark architectures defining late 2026 AI: Gemini 4 Carbon's 88.2% SEC-bench verification alongside Claude Fable's multi-day unattended codebase refactoring.",
    content: `# Google Gemini 4 Carbon & Claude Fable 5.2: The 2026 Frontier Comparison

## 1. Executive Benchmark Overview
November 2026 marks the consolidation of two distinct paradigms in frontier artificial intelligence:
1. **Google Gemini 4 Carbon:** The undisputed champion of formal mathematical deduction, test-time compute scaling, and autonomous cybersecurity verification (#1 Artificial Analysis Index, Score 59).
2. **Anthropic Claude Fable 5.2:** The premier long-horizon agentic orchestrator designed for multi-day, unattended software migrations and cross-repository engineering workflows.

---

## 2. Quantitative Performance Matrix

| Evaluation Benchmark | Metric | Gemini 4 Carbon | Claude Fable 5.2 | Industry Baseline |
|:---|:---|:---:|:---:|:---:|
| **Artificial Analysis v5.0** | Composite Reasoning Index | **59 (#1)** | 58 | 52 |
| **SEC-bench Pro** | Vulnerability Identification | **88.2%** | 76.4% | 61.2% |
| **CWE-bench** | Verified Automated Patching | **71.0%** | 68.5% | 49.0% |
| **Multi-Day Refactor Drift** | Context Fidelity over 72h | 94.2% | **98.6% (#1)** | 71.0% |
| **CursorBench 4.0** | Agentic IDE Engineering | **#1 Globally** | Runner-up | Baseline |

---

## 3. Practical Guidance for QUANTA Developers
- **For Formal Audits & Security:** Use Gemini 4 Carbon when writing unit tests, fuzzing network interfaces, or verifying smart contracts.
- **For Large Monorepo Migrations:** Use Claude Fable when refactoring legacy libraries across dozens of microservices where contextual drift must be avoided.`,
    category: "Scientific News",
    tagLabel: "FRONTIER REASONING",
    tagTone: "sky",
    source: "Google DeepMind & Anthropic Research",
    readTime: "5 min read",
    date: "Nov 14, 2026",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80",
    featuredInCarousel: true,
    status: "Published",
    externalUrl: "https://blog.google"
  },
  {
    id: "exp-top-10-developer-repositories-2026",
    title: "Top 10 Essential GitHub Repositories Every Developer & AI Engineer Should Star in 2026",
    summary: "From OpenHands and Langflow to Ollama and Scrapling: A curated, essential directory of open-source frameworks, visual builders, and developer resources accelerating AI engineering.",
    content: `# The Essential Developer & AI Builder Arsenal: Top 10 High-Impact GitHub Repositories

## 1. Executive Overview
In modern software engineering and applied AI research, developer velocity depends heavily on selecting the right open-source foundation. Rather than reinventing distributed agents, custom scraping engines, or hosting budgets, engineering teams leverage battle-tested open-source repositories to accelerate production timelines.

Below is the official curated reference guide compiled by the **QUANTA Open Source & Developer Directorate**, detailing the ten most versatile repositories every student, software engineer, and researcher in the club should bookmark and leverage.

---

## 2. Core Repository Reference Matrix

| Repository | What it does | Useful for |
|:---|:---|:---|
| [**OpenHands**](https://github.com/OpenHands/OpenHands) | A workspace for coding agents that can write code, run tests, fix errors, and automate development tasks. | **AI-assisted software development** |
| [**Langflow**](https://github.com/langflow-ai/langflow) | A visual builder for AI agents and workflows. Supports RAG—answering questions using your documents—and publishing workflows through API or MCP. | **Building chatbots and AI workflows** |
| [**Ollama**](https://github.com/ollama/ollama) | Runs supported language models locally and provides an API for your applications. Models need separate downloads. | **Local AI and experimenting without per-request API fees** |
| [**Free-for-dev**](https://github.com/ripienaar/free-for-dev) | A directory of developer services offering free tiers, including hosting, databases, authentication, and APIs. | **Finding services for a low-budget project** |
| [**Scrapling**](https://github.com/D4Vinci/Scrapling) | A Python framework for fetching webpages, extracting information, and building web crawlers. | **Collecting website data** |
| [**Awesome**](https://github.com/sindresorhus/awesome) | A large directory of curated resource lists covering programming, science, design, and many other subjects. | **Discovering tools and learning resources** |
| [**Awesome LLM Apps**](https://github.com/Shubhamsaboo/awesome-llm-apps) | A collection of example AI agents, skills, and RAG applications with source code. Individual examples may require paid APIs. | **Learning from working examples and adapting them** |
| [**Open Design**](https://github.com/nexu-io/open-design) | An open-source AI design workspace for prototypes, websites, presentations, and other creative work. | **Combining design work with AI agents** |
| [**Awesome MCP Servers**](https://github.com/punkpeye/awesome-mcp-servers) | A directory of MCP servers: connectors that let compatible AI assistants interact with tools and data sources. | **Finding integrations for AI assistants** |
| [**Public APIs**](https://github.com/public-apis/public-apis) | A categorized directory of public APIs. Authentication requirements, free allowances, and restrictions vary by service. | **Finding data and services for an app** |

---

## 3. QUANTA Club Recommendations
All project teams participating in the upcoming **QUANTA Open Innovation Challenge** are strongly encouraged to integrate these repositories into their foundational architecture. Direct links are provided in the matrix above for easy cloning and bookmarking.`,
    category: "Opportunities",
    tagLabel: "DEVELOPER TOOLS & REPOS",
    tagTone: "sky",
    source: "QUANTA Open Source & Developer Directorate",
    readTime: "6 min read",
    date: "Nov 14, 2026",
    imageUrl: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=1200&q=80",
    featuredInCarousel: true,
    status: "Published",
    externalUrl: "https://github.com/ripienaar/free-for-dev"
  },
  // Archived secondary/older articles:
  {
    id: "exp-claude-fable-agentic-simulation",
    title: "Claude Fable & Multi-Agent Simulations: Long-Horizon Autonomy and Generative World-Building in 2026",
    summary: "Anthropic's Claude Fable 5.2 and Fable Studio's Showrunner platform redefine agentic computing—combining hours-long unattended codebase refactoring with persistent generative world-building.",
    category: "Scientific News",
    tagLabel: "AUTONOMOUS AGENTS & SIMULATION",
    tagTone: "cyan",
    source: "Anthropic Frontier Research & Fable Studio",
    readTime: "6 min read",
    date: "Nov 11, 2026",
    imageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&q=80",
    featuredInCarousel: false,
    status: "Archived",
    externalUrl: "https://anthropic.com"
  },
  {
    id: "exp-handy-offline-stt",
    title: "Handy: Open-Source Local-First Speech-to-Text Built with Rust & Tauri",
    summary: "A privacy-first cross-platform desktop application delivering instant, offline Whisper and Parakeet speech-to-text with global push-to-talk and zero cloud dependencies.",
    category: "Scientific News",
    tagLabel: "AI & OPEN SOURCE",
    tagTone: "cyan",
    source: "GitHub Open Source (cjpais/handy)",
    readTime: "4 min read",
    date: "Nov 04, 2026",
    imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=1200&q=80",
    featuredInCarousel: false,
    status: "Archived",
    externalUrl: "https://github.com/cjpais/handy"
  },
  {
    id: "exp-timimoun-short-film-festival-2026",
    title: "Timimoun International Short Film Festival 2026 (2nd Edition): Cinema, Gourara Lab & Media Masterclasses",
    summary: "The oasis city of Timimoun hosts its 2nd International Short Film Festival from Nov 26 to Dec 01, 2026, featuring the Gourara Media Lab and technical masterclasses for young Algerian creators.",
    category: "Events",
    tagLabel: "CULTURE & MEDIA",
    tagTone: "amber",
    source: "Algerian Ministry of Culture & Arts",
    readTime: "4 min read",
    date: "Nov 04, 2026",
    imageUrl: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1200&q=80",
    featuredInCarousel: false,
    status: "Archived",
    externalUrl: "https://www.m-culture.gov.dz"
  },
  {
    id: "exp-optogenetics-senolytics-nature",
    title: "Cellular Rejuvenation & Neural Circuit Control: Optogenetics and Targeted Senolytics in Nature",
    summary: "Landmark papers published in Nature and Science showcase light-sensitive microbial channelrhodopsins restoring visual circuits, paired with selective senolytic clearing of inflammatory 'zombie' cells.",
    category: "Scientific News",
    tagLabel: "BIOLOGY & MEDICINE",
    tagTone: "sky",
    source: "Nature & Science Research Portals",
    readTime: "5 min read",
    date: "Nov 04, 2026",
    imageUrl: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=1200&q=80",
    featuredInCarousel: false,
    status: "Archived",
    externalUrl: "https://www.nature.com"
  },
  {
    id: "exp-global-fellowships-grants-2027",
    title: "Global STEM Fellowships & Research Grants 2027: Application Windows Open for Algerian Students",
    summary: "Comprehensive roadmap for fully-funded international graduate fellowships: DAAD, Chevening, Fulbright STEM, Erasmus Mundus, and CERN Summer Student Program deadlines.",
    category: "Opportunities",
    tagLabel: "FELLOWSHIPS & GRANTS",
    tagTone: "sky",
    source: "QUANTA Academic Affairs Directorate",
    readTime: "6 min read",
    date: "Nov 02, 2026",
    imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80",
    featuredInCarousel: false,
    status: "Archived",
    externalUrl: "https://www.daad.de/en/"
  },
  {
    id: "exp-neural-operators-fluids",
    title: "Fourier Neural Operators: Zero-Shot Super-Resolution in Non-Linear Fluid Dynamics",
    summary: "Parametrizing partial differential equations directly in infinite-dimensional function space allows Fourier Neural Operators to simulate Navier-Stokes turbulence 10,000 times faster than classical mesh solvers.",
    category: "Scientific News",
    tagLabel: "AI & COMPUTATIONAL PHYSICS",
    tagTone: "cyan",
    source: "QUANTA AI & Modeling Lab",
    readTime: "5 min read",
    date: "Oct 30, 2026",
    imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&q=80",
    featuredInCarousel: false,
    status: "Archived",
    externalUrl: "https://arxiv.org/abs/2010.08895"
  },
  {
    id: "exp-crispr-cas12a-diagnostics",
    title: "CRISPR-Cas12a Electrochemical Aptasensors: Femtomolar Viral RNA Detection at Room Temperature",
    summary: "Coupling collateral single-stranded DNA cleavage with gold nanoparticle microelectrodes yields ultra-portable, reagent-free diagnostic platforms for rapid infectious disease screening.",
    category: "Scientific News",
    tagLabel: "BIOMEDICAL ENGINEERING",
    tagTone: "sky",
    source: "QUANTA Biotechnology Division",
    readTime: "5 min read",
    date: "Oct 29, 2026",
    imageUrl: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=1200&q=80",
    featuredInCarousel: false,
    status: "Archived",
    externalUrl: "https://www.nature.com/articles/s41587-020-00803-x"
  },
  {
    id: "exp-polariton-halide-lasers",
    title: "Bose-Einstein Condensation of Exciton-Polaritons in Perovskite Optical Microcavities",
    summary: "Demonstrating macroscopic quantum phase coherence at room temperature using all-inorganic lead-halide perovskite microcrystals paves the way for ultra-low threshold polariton lasers.",
    category: "Scientific News",
    tagLabel: "QUANTUM OPTICS & CONDENSED MATTER",
    tagTone: "indigo",
    source: "QUANTA Photonics & Nanotech Lab",
    readTime: "6 min read",
    date: "Oct 27, 2026",
    imageUrl: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=1200&q=80",
    featuredInCarousel: false,
    status: "Archived",
    externalUrl: "https://www.science.org/doi/10.1126/science.aay6662"
  },
  {
    id: "exp-jwst-exoplanet-coronagraphy",
    title: "Atmospheric Methane & Carbon Isotopes in Directly Imaged Exoplanets with JWST NIRCam",
    summary: "Direct coronagraphic spectroscopy of young gas giants reveals non-equilibrium carbon chemistry and isotopic ratios constraining planet formation pathways beyond the snow line.",
    category: "Scientific News",
    tagLabel: "ASTROPHYSICS & EXOPLANETS",
    tagTone: "amber",
    source: "QUANTA Astrophysics Working Group",
    readTime: "5 min read",
    date: "Oct 24, 2026",
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80",
    featuredInCarousel: false,
    status: "Archived",
    externalUrl: "https://webbtelescope.org"
  },
  {
    id: "exp-swarm-robotics-consensus",
    title: "Decentralized Byzantine Consensus in Autonomous Aerial Robot Swarms via Asynchronous Gossip",
    summary: "Novel distributed algorithms ensure collision-free formation flight and target tracking even when up to 30% of drones experience adversarial GPS spoofing or communication dropouts.",
    category: "Opportunities",
    tagLabel: "ROBOTICS & AUTONOMOUS SYSTEMS",
    tagTone: "cyan",
    source: "QUANTA Robotics & Control Group",
    readTime: "5 min read",
    date: "Oct 21, 2026",
    imageUrl: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=1200&q=80",
    featuredInCarousel: false,
    status: "Archived",
    externalUrl: "https://ieeexplore.ieee.org"
  }
];

// 4. Official Executive Broadcast Message
const BROADCAST_MESSAGE_NOV14 = {
  id: `msg-launch-nov14-${Date.now()}`,
  senderLabel: "QUANTA Executive Administration",
  senderRole: "Executive",
  recipientScope: "All Members",
  priority: "Official notice",
  title: "⚡ تحديات اليوم العلمية الجديدة (+2 XP) ومستجدات AI for Science والحوسبة الكمية متاحة الآن!",
  body: `تحية علمية طيبة لجميع أعضاء وباحثي نادي كوانتا،

يسر إدارة النادي الإعلان عن إطلاق حزمة التحديات اليومية الجديدة لليوم (14 نوفمبر 2026) بنظام مكافآت ميسر يمنح نقطتي خبرة (+2 XP) لكل إجابة صحيحة مع خيارات متنوعة ومدروسة!

تشمل مجالات التحدي لليوم:
1. ثورة الذكاء الاصطناعي للعلوم (AI for Science)
2. الحوسبة الكمية ومبدأ التراكب الكمي
3. فيزياء الفضاء وتلسكوب جيمس ويب (JWST)
4. البيولوجيا الجزيئية وتقنية PCR
5. شبكات الحاسوب وموثوقية بروتوكول TCP
6. النسبية الخاصة وتمدد الزمن
7. هياكل البيانات والمكدس البرمجي (Stack)
8. التشفير الحديث بالمفتاح العام (Asymmetric Cryptography)
9. الكيمياء الحيوية وجزيء الطاقة الخلوية (ATP)
10. منهجية الابتكار التطبيقي لنادي QUANTA

كما تم تحديث قسم الاستكشاف (Explore) بنشر مقالات تحليلية جديدة:
- "AI for Science (AI4S): How Autonomous Generalist Agents are Accelerating Molecular Discovery & Quantum Physics"
- "Room-Temperature Quantum Systems: Acoustic Diamond Flaws and Non-Destructive Qubit Readouts"
- "Google Gemini 4 Carbon & Claude Fable 5.2: The Frontier Benchmark in Automated Verification & Long-Horizon Agents"
- "Top 10 Essential GitHub Repositories Every Developer & AI Engineer Should Star in 2026"

ندعو كافة الأعضاء لخوض التحديات العلمية اليومية والمشاركة في الفعاليات والبحث المستمر!`,
  timeAgo: "Just now",
  unread: true,
  archived: false,
  channels: {
    inApp: true,
    email: true,
  },
  actionLabel: "افتح الاستكشاف والتحديات",
  linkUrl: "/explore",
};

async function main() {
  console.log("=== EXECUTING UPDATE FOR NOV 14, 2026: QUIZZES (2 XP) & NEWS ARTICLES ===");

  // 1. Update data/quanters-db.json
  const dbPath = path.join(process.cwd(), "data", "quanters-db.json");
  const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));

  db.workshops = []; // Guarantee zero phantom workshops
  db.dailyQuizzes = NEW_DAILY_QUIZZES_NOV14;
  db.explorePosts = ALL_EXPLORE_POSTS_NOV14;
  if (!Array.isArray(db.messages)) db.messages = [];
  db.messages = [BROADCAST_MESSAGE_NOV14, ...db.messages.filter(m => !m.id.startsWith("msg-launch-nov14"))];
  db.updatedAt = new Date().toISOString();

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");
  console.log("✓ data/quanters-db.json updated successfully with Nov 14 quizzes, articles, and broadcast.");

  // 2. Sync to Cloud Firestore erp_state/main
  console.log("Syncing directly to Cloud Firestore erp_state/main...");
  await patchDocFields("erp_state", "main", {
    workshops: [],
    dailyQuizzes: NEW_DAILY_QUIZZES_NOV14,
    explorePosts: ALL_EXPLORE_POSTS_NOV14,
    messages: db.messages,
    updatedAt: db.updatedAt,
  });
  console.log("✓ Cloud Firestore erp_state/main updated successfully!");

  // 3. Update src/lib/data/seed.ts: SEED_DAILY_QUIZZES & SEED_EXPLORE_POSTS
  const seedPath = path.join(process.cwd(), "src", "lib", "data", "seed.ts");
  let seedCode = fs.readFileSync(seedPath, "utf8");

  // A. Replace SEED_WORKSHOPS with empty array if not already
  const wsStart = seedCode.indexOf("export const SEED_WORKSHOPS: Workshop[] =");
  if (wsStart !== -1) {
    const wsEnd = seedCode.indexOf("export const SEED_BADGES", wsStart);
    if (wsEnd !== -1) {
      const newWsCode = `export const SEED_WORKSHOPS: Workshop[] = [];\n\n`;
      seedCode = seedCode.slice(0, wsStart) + newWsCode + seedCode.slice(wsEnd);
    }
  }

  // B. Replace SEED_DAILY_QUIZZES in seed.ts
  const quizStart = seedCode.indexOf("export const SEED_DAILY_QUIZZES: DailyQuizItem[] =");
  if (quizStart !== -1) {
    const quizEnd = seedCode.indexOf("export const SEED_GRIEVANCES", quizStart);
    if (quizEnd !== -1) {
      const newQuizCode = `export const SEED_DAILY_QUIZZES: DailyQuizItem[] = ${JSON.stringify(NEW_DAILY_QUIZZES_NOV14, null, 2)};\n\n`;
      seedCode = seedCode.slice(0, quizStart) + newQuizCode + seedCode.slice(quizEnd);
    }
  }

  // C. Replace SEED_EXPLORE_POSTS in seed.ts
  const postsStart = seedCode.indexOf("export const SEED_EXPLORE_POSTS: ExplorePost[] =");
  if (postsStart !== -1) {
    const postsEnd = seedCode.indexOf("export function getCurrentDayOfYear", postsStart);
    if (postsEnd !== -1) {
      const newPostsCode = `export const SEED_EXPLORE_POSTS: ExplorePost[] = ${JSON.stringify(ALL_EXPLORE_POSTS_NOV14, null, 2)};\n\n`;
      seedCode = seedCode.slice(0, postsStart) + newPostsCode + seedCode.slice(postsEnd);
    }
  }

  fs.writeFileSync(seedPath, seedCode, "utf8");
  console.log("✓ src/lib/data/seed.ts updated successfully with Nov 14 data.");
}

main().catch((err) => {
  console.error("Execution error:", err);
  process.exit(1);
});
