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

// 2. Define the 10 Daily Quizzes (Easy, 2 XP each, for 2026-11-11)
const NEW_DAILY_QUIZZES = [
  {
    id: "quiz-2026-11-11-01",
    domain: "الذكاء الاصطناعي ونماذج التفكير (Gemini 4 Carbon)",
    icon: "ai-ml",
    question: "ما هي الميزة التقنية الأبرز لنموذج Gemini 4 Carbon التي مكنته من تصدر مؤشرات التفكير البرمجي لعام 2026؟",
    options: [
      {
        id: "a",
        label: "التفكير العميق والتحقق الذاتي واكتشاف الثغرات الأمنية بدقة 88.2% على SEC-bench Pro"
      },
      {
        id: "b",
        label: "العمل فقط كآلة حاسبة بسيطة للعمليات الحسابية المحدودة"
      },
      {
        id: "c",
        label: "توليد ملفات صوتية فقط دون دعم الأكواد البرمجية"
      }
    ],
    correctId: "a",
    verdictTitle: "ريادة Gemini 4 Carbon في التفكير البرمجي والأمن السيبراني",
    explanation: "تصدر نموذج Gemini 4 Carbon مؤشر Artificial Analysis v5 بنتيجة 59 بفضل قدرته على التفكير المنطقي متعدد الخطوات والتحقق الذاتي من الكود وكشف الثغرات الأمنية المعقدة بنسبة 88.2%.",
    xpReward: 2,
    dateLabel: "2026-11-11",
    isPinnedToday: true,
    active: true
  },
  {
    id: "quiz-2026-11-11-02",
    domain: "الأنظمة المستقلة والوكلاء الأذكياء (Claude Fable)",
    icon: "cybersecurity",
    question: "ما هي القدرة الأساسية التي تميز عائلة نماذج Claude Fable 5.2 المطورة للوكلاء البرمجيين؟",
    options: [
      {
        id: "a",
        label: "العمل المستقل طويل الأمد وتنسيق الوكلاء عبر مستودعات برمجية ضخمة مع التفكير الممتد"
      },
      {
        id: "b",
        label: "اقتصارها على كتابة رسائل بريد إلكتروني قصيرة جداً"
      },
      {
        id: "c",
        label: "توقفها عن العمل بمجرد تجاوز الكود 10 أسطر"
      }
    ],
    correctId: "a",
    verdictTitle: "الاستقلالية طويلة الأمد لنماذج Claude Fable 5.2",
    explanation: "صُممت عائلة Claude Fable لإنجاز المهام البرمجية والهندسية المعقدة متعددة الساعات (Long-Horizon Tasks) عبر مستودعات برمجية متعددة وتصحيح الأخطاء ذاتياً بدعم آليات التفكير التكيفي.",
    xpReward: 2,
    dateLabel: "2026-11-11",
    isPinnedToday: false,
    active: true
  },
  {
    id: "quiz-2026-11-11-03",
    domain: "إدارة النسخ والمستودعات البرمجية (Git)",
    icon: "git-open-source",
    question: "ما هو الأمر المختصر في Git لإنشاء فرع برمجي جديد (Branch) والانتقال إليه فوراً؟",
    options: [
      {
        id: "a",
        label: "git checkout -b <branch-name>"
      },
      {
        id: "b",
        label: "git reset --hard"
      },
      {
        id: "c",
        label: "git commit -m \"delete\""
      }
    ],
    correctId: "a",
    verdictTitle: "إنشاء الفروع والانتقال المباشر في Git",
    explanation: "يُستخدم الأمر `git checkout -b <branch-name>` (أو `git switch -c <branch-name>`) لإنشاء فرع عمل جديد والتبديل إليه في خطوة واحدة، مما يتيح تجربة الميزات بأمان.",
    xpReward: 2,
    dateLabel: "2026-11-11",
    isPinnedToday: false,
    active: true
  },
  {
    id: "quiz-2026-11-11-04",
    domain: "الفلك وعلوم الفضاء (Cosmology)",
    icon: "astronomy",
    question: "ما هو أقرب كوكب إلى الشمس في مجموعتنا الشمسية؟",
    options: [
      {
        id: "a",
        label: "عطارد (Mercury)"
      },
      {
        id: "b",
        label: "المريخ (Mars)"
      },
      {
        id: "c",
        label: "نبتون (Neptune)"
      }
    ],
    correctId: "a",
    verdictTitle: "كوكب عطارد: الجار الأقرب لشمسنا",
    explanation: "عطارد هو الكوكب الأقرب للشمس ويدور حولها في 88 يوماً فقط، ويتميز بفارق حراري هائل بين نهاره الحارق وليله شديد البرودة لانعدام الغلاف الجوي الكثيف.",
    xpReward: 2,
    dateLabel: "2026-11-11",
    isPinnedToday: false,
    active: true
  },
  {
    id: "quiz-2026-11-11-05",
    domain: "البيولوجيا الجزيئية وعلم الوراثة (Genetics)",
    icon: "genetics",
    question: "ما هو الجزيء الحيوي الحامل للتعليمات الوراثية الأساسية داخل خلايا الكائنات الحية؟",
    options: [
      {
        id: "a",
        label: "حمض الديوكسي ريبونوكليك (DNA)"
      },
      {
        id: "b",
        label: "سكر الجلوكوز"
      },
      {
        id: "c",
        label: "بيكربونات الصوديوم"
      }
    ],
    correctId: "a",
    verdictTitle: "جزيء الـ DNA وسر الحياة الجينية",
    explanation: "يحمل جزيء الـ DNA الشفرة الوراثية على هيئة تتابعات من القواعد النيتروجينية الأربع (A, T, C, G) المشفرة لبناء البروتينات الحيوية واستمرار الوظائف الخلوية.",
    xpReward: 2,
    dateLabel: "2026-11-11",
    isPinnedToday: false,
    active: true
  },
  {
    id: "quiz-2026-11-11-06",
    domain: "الفيزياء الكونية والثوابت الطبيعية (Physics)",
    icon: "optics",
    question: "كم تبلغ سرعة الضوء القصوى في الفراغ الكوني (c) تقريباً؟",
    options: [
      {
        id: "a",
        label: "300,000 كيلومتر في الثانية تقريباً (3 × 10⁸ م/ث)"
      },
      {
        id: "b",
        label: "340 متر في الثانية فقط"
      },
      {
        id: "c",
        label: "1,000 كيلومتر في الساعة"
      }
    ],
    correctId: "a",
    verdictTitle: "سرعة الضوء: الحد الأقصى للسرعة الكونية",
    explanation: "تبلغ سرعة الضوء في الفراغ 299,792,458 م/ث، وهي ثابت فيزيائي أساسي يمثل أقصى سرعة يمكن أن تنتقل بها المعلومات أو الطاقة في الكون وفق النسبية الخاصة.",
    xpReward: 2,
    dateLabel: "2026-11-11",
    isPinnedToday: false,
    active: true
  },
  {
    id: "quiz-2026-11-11-07",
    domain: "بيئة بايثون والبرمجيات الحرة (Python Ecosystem)",
    icon: "python",
    question: "ما هو مدير الحزم الافتراضي والرسمي لتثبيت المكتبات الخارجية في لغة بايثون؟",
    options: [
      {
        id: "a",
        label: "pip (Pip Installs Packages)"
      },
      {
        id: "b",
        label: "npm"
      },
      {
        id: "c",
        label: "cargo"
      }
    ],
    correctId: "a",
    verdictTitle: "أداة pip لإدارة مكتبات بايثون",
    explanation: "تعتبر أداة pip مدير الحزم القياسي المدمج مع بايثون، ويتيح للمطورين تثبيت وإدارة آلاف الحزم مفتوحة المصدر مباشرة من مستودع PyPI الرسمي.",
    xpReward: 2,
    dateLabel: "2026-11-11",
    isPinnedToday: false,
    active: true
  },
  {
    id: "quiz-2026-11-11-08",
    domain: "الخوارزميات وهياكل البيانات (Data Structures)",
    icon: "mathematics",
    question: "ما هو التعقيد الزمني (Time Complexity) للوصول إلى عنصر في مصفوفة (Array) عبر الفهرس (Index)؟",
    options: [
      {
        id: "a",
        label: "O(1) - وصول لحظي ثابت"
      },
      {
        id: "b",
        label: "O(n) - مسح خطي بطيء"
      },
      {
        id: "c",
        label: "O(n²) - زمن تربيعي"
      }
    ],
    correctId: "a",
    verdictTitle: "الوصول المباشر O(1) في المصفوفات",
    explanation: "تخزن المصفوفات عناصرها في خلايا ذاكرة متتالية، مما يتيح للمعالج حساب عنوان الذاكرة المباشر لأي فهرس في خطوة حسابية واحدة وثابتة O(1).",
    xpReward: 2,
    dateLabel: "2026-11-11",
    isPinnedToday: false,
    active: true
  },
  {
    id: "quiz-2026-11-11-09",
    domain: "بنية وتطوير الويب الحديث (Web Platform)",
    icon: "web-dev",
    question: "ما هي اللغة القياسية المستخدمة لبناء وتوصيف الهيكل الأساسي لصفحات الويب؟",
    options: [
      {
        id: "a",
        label: "HTML (HyperText Markup Language)"
      },
      {
        id: "b",
        label: "SQL"
      },
      {
        id: "c",
        label: "Assembly"
      }
    ],
    correctId: "a",
    verdictTitle: "لغة HTML ركيزة صفحات الإنترنت",
    explanation: "تمثل HTML لغة التوصيف القياسية العالمية التي تحدد هيكل صفحات الويب من نصوص وعناوين وصور ونماذج وروابط تشعبية.",
    xpReward: 2,
    dateLabel: "2026-11-11",
    isPinnedToday: false,
    active: true
  },
  {
    id: "quiz-2026-11-11-10",
    domain: "رسالة ورؤية نادي QUANTA العلمي",
    icon: "leadership",
    question: "ما هو الهدف الاستراتيجي الأسمى لنادي QUANTA العلمي في جامعة البليدة 1 والساحة الجامعية؟",
    options: [
      {
        id: "a",
        label: "ترسيخ التميز العلمي والبحثي، وتمكين الطلبة تقنياً، وتطوير مشاريع وابتكارات مفتوحة المصدر"
      },
      {
        id: "b",
        label: "تنظيم المسابقات الترفيهية الفردية فقط دون محتوى علمي"
      },
      {
        id: "c",
        label: "إغلاق المعامل البحثية والورش التقنية"
      }
    ],
    correctId: "a",
    verdictTitle: "رسالة نادي QUANTA: المعرفة والابتكار والمجتمع",
    explanation: "يهدف نادي كوانتا منذ انطلاقته إلى بناء مجتمع طلابي وبحثي رائد يعتمد أعلى معايير النزاهة العلمية وتطوير الحلول التقنية المبتكرة التي تخدم الوطن والمجتمع العلمي.",
    xpReward: 2,
    dateLabel: "2026-11-11",
    isPinnedToday: false,
    active: true
  }
];

// 3. Define the Explore Articles (Gemini 4 Carbon, Claude Fable, Top Repositories, etc.)
const UPDATED_EXPLORE_POSTS = [
  {
    id: "exp-google-gemini-carbon",
    title: "Google Gemini 4 Carbon: The New Benchmark Champion in Deep Reasoning, SEC-bench Pro & Agentic Coding",
    summary: "Ranked #1 on the Artificial Analysis Intelligence Index with an 88.2% SEC-bench Pro score, Google's Gemini 4 Carbon sets a new milestone in test-time compute, long-horizon coding, and automated vulnerability verification.",
    content: `# Google Gemini 4 Carbon: Benchmarks & Deep Reasoning Architecture

## 1. Breakthrough Across Frontier Industry Leaderboards
Google announced **Gemini 4 Carbon**, establishing undisputed top rankings across major independent AI benchmarks. Most notably, Carbon secured the **#1 overall position on the Artificial Analysis Intelligence Index (v5.0)** with an index rating of **59**, surpassing all competitive frontier reasoning models in structured multi-step logical deduction and test-time compute scaling.

Across 17 rigorous evaluation suites, Carbon ranked first in 15 categories, marking an architectural leap in autonomous software verification, complex symbolic mathematics, and extended context synthesis.

---

## 2. Quantitative Cybersecurity Performance: SEC-bench Pro
A defining characteristic of Carbon is its specialized capability in offensive and defensive cybersecurity evaluation, tested in partnership with Google's Fairwind Defense program:
- **SEC-bench Pro (Vulnerability Discovery):** **88.2%** success rate identifying zero-day memory corruption, logic flaws, and authorization bypasses in production C/C++, Rust, and Go codebases.
- **ExploitGym (Controlled Exploit Generation):** **54.8%**, demonstrating autonomous proof-of-concept construction under sandboxed environments.
- **CWE-bench (Automated Patch Synthesis):** **71.0%**, synthesizing verified secure patches that eliminate root causes without causing regression failures in adjacent test suites.
- **Secure Code Generation:** Generates verified vulnerability-free code at more than twice the success rate of the previous Argon architecture.

> *"Carbon was evaluated under rigorous safety guardrails through Google's Fairwind Program, partnering with cybersecurity defenders to stress-test automated vulnerability mitigation and formal verification."*

---

## 3. Agentic Software Engineering Leaderboard
| Benchmark Suite | Metric | Gemini 4 Carbon | Prior SOTA Baseline |
|:---|:---|:---|:---|
| **Artificial Analysis Index (v5.0)** | Composite Score | **59 (#1)** | 58 |
| **Terminal-Bench 4.0** | CLI Task Execution | **64.0%** | 52.4% |
| **FrontierCode v1.1** | Complex Algorithmic Code | **51.0%** | 43.8% |
| **SEC-bench Pro** | Bug & Vuln Identification | **88.2%** | 69.1% |
| **CWE-bench** | Patching & Verification | **71.0%** | 56.5% |
| **CursorBench 4.0** | Multi-File Agentic Coding | **#1 Globally** | Runner-up |

---

## 4. Architectural Significance for QUANTA Researchers
For the QUANTA AI, Modeling, and Cybersecurity divisions, Gemini 4 Carbon demonstrates that test-time search and iterative code self-verification are now essential paradigms. Autonomous coding agents are no longer just completion engines—they act as rigorous pair-programmers capable of compiling, executing, and auditing entire software architectures autonomously.`,
    category: "Scientific News",
    tagLabel: "FRONTIER AI & REASONING",
    tagTone: "indigo",
    source: "Google DeepMind & Artificial Analysis",
    readTime: "5 min read",
    date: "Nov 11, 2026",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80",
    featuredInCarousel: true,
    status: "Published",
    externalUrl: "https://blog.google"
  },
  {
    id: "exp-claude-fable-agentic-simulation",
    title: "Claude Fable & Multi-Agent Simulations: Long-Horizon Autonomy and Generative World-Building in 2026",
    summary: "Anthropic's Claude Fable 5.2 and Fable Studio's Showrunner platform redefine agentic computing—combining hours-long unattended codebase refactoring with persistent generative world-building.",
    content: `# Claude Fable & Multi-Agent Simulations: Long-Horizon Autonomy and Synthetic Worlds

## 1. Long-Horizon Autonomy in Claude Fable 5.2
Anthropic's announcement of **Claude Fable 5.2** represents a critical inflection point for autonomous systems. Engineered for demanding, long-horizon technical tasks, Fable is purpose-built to operate unattended for hours—and across complex workflows, for multiple days—while checking and correcting its own intermediate execution states.

Generating outputs up to **30% faster** than its predecessor with adaptive extended thinking modes, Fable 5.2 navigates massive multi-repository architectures, manages distributed sub-agents, and solves abstract physics and hardware problems without state drift.

---

## 2. The Dual Frontier: Claude Fable vs. Claude Mythos
Anthropic introduced a dual-tier model release strategy:
- **Claude Fable 5.2:** Built with industrial-grade cyber defense and biology safeguards, making it publicly available across major cloud providers (Amazon Bedrock, Google Cloud Vertex AI) and native APIs at optimized pricing ($8/M input tokens, $40/M output tokens).
- **Claude Mythos 5.2:** Built on the identical core frontier architecture, but reserved for verified sovereign and research institutions through specialized Life Sciences and Cyber Verification programs.

> *"Fable is targeted squarely at developers, researchers, and enterprises tackling the hardest open-ended technical challenges that push standard LLMs past their limits."*

---

## 3. Fable Studio & The Showrunner Platform (SHOW-1 Model)
In parallel with frontier reasoning models, **Fable Studio** (backed by Amazon's Alexa Fund) has pioneered generative multi-agent simulation through its **Showrunner** platform. Often dubbed the *"Netflix of AI"*, Showrunner utilizes the proprietary **SHOW-1** model to orchestrate complete episodic productions from text prompts and directorial constraints.

Key innovations in SHOW-1 include:
- **Persistent Character Canon & Worlds:** Unlike traditional video generation tools that generate disconnected clips, Showrunner maintains continuous spatial memories, narrative arcs, and character styles across full multi-season series.
- **Dynamic "Playable" Media:** Viewers can branch storylines in real time, with the simulation dynamically synthesizing dialogue, voice acting, camera angles, and animations on the fly.
- **Theatrical Milestones (*Gods Don't Give Gifts*):** Fable's sci-fi feature film, produced in collaboration with human artists and voiced by Grimes, demonstrated the viability of AI-augmented cinematic pipelines.

---

## 4. Synthesis: The Complementary AI Frontier of 2026
| Dimension | Google Gemini 4 Carbon | Anthropic Claude Fable 5.2 |
|:---|:---|:---|
| **Core Superpower** | Test-Time Compute & Formal Code Verification | Long-Horizon Autonomy & Asynchronous Sub-Agents |
| **Top Benchmark** | #1 Artificial Analysis Index (Score 59) | SOTA in Multi-Day Software Migration |
| **Cybersecurity** | SEC-bench Pro 88.2% / CWE-bench 71.0% | Adaptive Extended Thinking with Guardrails |
| **Deployment** | Antigravity AI Engine / Google Cloud | Claude Platform / Bedrock / Vertex AI |

---

## 5. QUANTA Workshop Integration
Members of the QUANTA Computer Science & Creative Tech divisions will explore Claude Fable's agentic APIs and Fable simulation patterns in our upcoming **Agentic Architectures & World-Building Masterclass**.`,
    category: "Scientific News",
    tagLabel: "AUTONOMOUS AGENTS & SIMULATION",
    tagTone: "cyan",
    source: "Anthropic Frontier Research & Fable Studio",
    readTime: "6 min read",
    date: "Nov 11, 2026",
    imageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&q=80",
    featuredInCarousel: true,
    status: "Published",
    externalUrl: "https://anthropic.com"
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

## 3. Deep-Dive: Architectural Breakdown

### A. Autonomous Coding & Visual Pipelines (OpenHands & Langflow)
- **OpenHands:** Integrates headless container execution with agentic reasoning loops. Coding assistants can spin up Docker environments, clone repositories, run unit tests, and iteratively rewrite code until all assertions pass.
- **Langflow:** Democratizes multi-agent orchestration by providing a drag-and-drop ReactFlow canvas. It natively exposes endpoints compatible with the Model Context Protocol (MCP), allowing visual agent pipelines to be consumed as local CLI tools.

### B. Local-First AI & Web Scraping (Ollama & Scrapling)
- **Ollama:** The de facto gold standard for running quantization-efficient LLMs (Llama 3, Mistral, DeepSeek) locally on Apple Silicon and CUDA GPUs. It delivers an OpenAI-compatible HTTP endpoint for zero-latency, private offline development.
- **Scrapling:** A cutting-edge Python library optimized for resilient scraping. It circumvents brittle XPath and CSS selectors by utilizing adaptive element matching and anti-fingerprinting stealth headers.

### C. Zero-Cost Infrastructure & Integrations (Free-for-dev & Public APIs)
- **Free-for-dev:** For student initiatives and club hackathons, this repository catalogues hundreds of IaaS, PaaS, DBaaS, and monitoring services providing generous persistent free tiers (Cloudflare, Supabase, Vercel, Neon).
- **Public APIs:** An exhaustive, community-maintained collection of thousands of free REST endpoints spanning astronomy, weather, biology, economics, and sports.

---

## 4. QUANTA Club Recommendations
All project teams participating in the upcoming **QUANTA Open Innovation Challenge** are strongly encouraged to integrate these repositories into their foundational architecture. Direct links are provided in the matrix above for easy cloning and bookmarking.`,
    category: "Opportunities",
    tagLabel: "DEVELOPER TOOLS & REPOS",
    tagTone: "sky",
    source: "QUANTA Open Source & Developer Directorate",
    readTime: "6 min read",
    date: "Nov 11, 2026",
    imageUrl: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=1200&q=80",
    featuredInCarousel: true,
    status: "Published",
    externalUrl: "https://github.com/ripienaar/free-for-dev"
  },
  {
    id: "exp-handy-offline-stt",
    title: "Handy: Open-Source Local-First Speech-to-Text Built with Rust & Tauri",
    summary: "A privacy-first cross-platform desktop application delivering instant, offline Whisper and Parakeet speech-to-text with global push-to-talk and zero cloud dependencies.",
    content: `# Handy: Local-First, Offline Speech-to-Text with Rust & Tauri\n\n## 1. The Architecture of Local Audio Inference\nIn an era where voice data is routinely routed through cloud APIs, **Handy** (\`cjpais/handy\`) presents a clean, open-source paradigm: completely offline, real-time speech transcription that never transmits audio packets off the local machine.\n\nBuilt with a lightweight **Rust backend** and **Tauri (TypeScript/React)** frontend, Handy bypasses heavy Chromium/Electron runtimes to deliver near-zero memory footprint and instantaneous global response.\n\n> *\"Your voice stays entirely on your computer. Zero cloud tokens, zero latency spikes, zero privacy compromises.\"*\n\n## 2. Core Technical Capabilities\n- **On-Device Whisper & Parakeet Models:** Evaluates multi-lingual acoustic and language models locally, leveraging CPU SIMD and GPU hardware acceleration (Metal, DirectML, CUDA).\n- **Global Push-to-Talk / Hotkey Listener:** Low-level OS hotkey hooks capture speech system-wide and automatically type/paste the recognized output into the active cursor context of any app (VS Code, Obsidian, Slack, Browser).\n- **LLM Cleanup Pipeline:** Optional post-processing hooks pipe raw transcriptions into local small language models to purge filler syllables, fix punctuation, and format code snippets in real time.\n- **Cross-Platform Compilation:** Native binaries for macOS, Linux, and Windows with minimal system footprint.\n\n## 3. Engineering Benchmark Summary\n| Metric | Cloud API (Whisper v3) | Handy (Local On-Device) |\n|---|---|---|\n| **Privacy / Data Egress** | Transmitted to 3rd party | **100% On-Device (Zero Egress)** |\n| **Median Latency** | 850 – 1400 ms | **180 – 320 ms (Local Buffer)** |\n| **Offline Reliability** | Requires Internet | **100% Functional Air-Gapped** |\n| **RAM Footprint** | Browser dependent | **< 65 MB base (Tauri/Rust)** |\n\n## 4. QUANTA Lab Deployment\nQUANTA Computer Science & AI members can inspect the repository, build custom phonetic dictionary extensions, and benchmark execution profiles during the upcoming Systems & Rust workshop track.`,
    category: "Scientific News",
    tagLabel: "AI & OPEN SOURCE",
    tagTone: "cyan",
    source: "GitHub Open Source (cjpais/handy)",
    readTime: "4 min read",
    date: "Nov 04, 2026",
    imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=1200&q=80",
    featuredInCarousel: true,
    status: "Published",
    externalUrl: "https://github.com/cjpais/handy"
  },
  {
    id: "exp-timimoun-short-film-festival-2026",
    title: "Timimoun International Short Film Festival 2026 (2nd Edition): Cinema, Gourara Lab & Media Masterclasses",
    summary: "The oasis city of Timimoun hosts its 2nd International Short Film Festival from Nov 26 to Dec 01, 2026, featuring the Gourara Media Lab and technical masterclasses for young Algerian creators.",
    content: `# Timimoun International Short Film Festival 2026 (2nd Edition)\n\n## 1. Cultural & Cinematographic Landmark in Gourara\nThe **Timimoun International Short Film Festival** returns for its second edition from **November 26 to December 01, 2026**, transforming the red oasis of the Algerian Sahara into a focal point for international cinema, digital media production, and cultural heritage.\n\n## 2. Core Pillars of the 2026 Edition\n- **Gourara Media Lab:** Intensive incubator workshops covering scriptwriting, sound design, visual editing, and color grading.\n- **International Competition:** 35 curated short films representing over 18 countries.\n- **Algerian Heritage in 4K:** Documenting traditional khattara water architecture and vernacular earthen architecture using modern cinematography.\n\n## 3. Student Participation\nQUANTA Audiovisual & Media Directorate is coordinating with festival organizers to sponsor delegate passes for student creators interested in masterclasses on drone cinematography and documentary sound recording.`,
    category: "Events",
    tagLabel: "CULTURE & MEDIA",
    tagTone: "amber",
    source: "Algerian Ministry of Culture & Arts",
    readTime: "4 min read",
    date: "Nov 04, 2026",
    imageUrl: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1200&q=80",
    featuredInCarousel: true,
    status: "Published",
    externalUrl: "https://www.m-culture.gov.dz"
  },
  {
    id: "exp-optogenetics-senolytics-nature",
    title: "Cellular Rejuvenation & Neural Circuit Control: Optogenetics and Targeted Senolytics in Nature",
    summary: "Landmark papers published in Nature and Science showcase light-sensitive microbial channelrhodopsins restoring visual circuits, paired with selective senolytic clearing of inflammatory 'zombie' cells.",
    content: `# Cellular Rejuvenation & Precision Neural Control: 2026 Biology Milestones\n\n## 1. Optogenetics Enters Clinical Restoration\nWork recognized in contemporary biological physics has elevated **optogenetics**—the genetic insertion of light-activated algal opsins into mammalian neurons—from laboratory circuit mapping to direct therapeutic translation.\n\nRecent clinical milestones reported in *Nature* demonstrate targeted channelrhodopsin gene therapies restoring functional contrast perception and visual evoke potentials in patients with end-stage retinal degeneration.\n\n## 2. Targeting Senescent \"Zombie\" Cells\nConcurrently, research published in *Science* has detailed selective metabolic vulnerabilities in senescent cells—damaged cells that irreversibly arrest replication yet remain hypermetabolic, continuously secreting the destructive **Senescence-Associated Secretory Phenotype (SASP)**.`,
    category: "Scientific News",
    tagLabel: "BIOLOGY & MEDICINE",
    tagTone: "sky",
    source: "Nature & Science Research Portals",
    readTime: "5 min read",
    date: "Nov 04, 2026",
    imageUrl: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=1200&q=80",
    featuredInCarousel: false,
    status: "Published",
    externalUrl: "https://www.nature.com"
  },
  {
    id: "exp-global-fellowships-grants-2027",
    title: "Global STEM Fellowships & Research Grants 2027: Application Windows Open for Algerian Students",
    summary: "Comprehensive roadmap for fully-funded international graduate fellowships: DAAD, Chevening, Fulbright STEM, Erasmus Mundus, and CERN Summer Student Program deadlines.",
    content: `# Global STEM Fellowships & Research Grants: 2027 Candidate Roadmap\n\n## 1. Strategic Timeline\nAlgerian undergraduate and master's students pursuing advanced research in artificial intelligence, biotechnology, quantum computing, and renewable energy can now access official application portals for major global research grants.\n\n## 2. Featured Fellowship Portfolios\n- **DAAD Research Internships in Science and Engineering (RISE):** Fully-funded 3-month research placements at leading German universities.\n- **Fulbright Science & Technology Awards:** Comprehensive graduate study funding in the United States.\n- **CERN Summer Student Programme (Geneva):** 8 to 13 weeks of hands-on experimental particle physics and computing work.\n- **Erasmus Mundus Joint Masters:** European Commission scholarships covering tuition, travel, and monthly living stipends.`,
    category: "Opportunities",
    tagLabel: "FELLOWSHIPS & GRANTS",
    tagTone: "sky",
    source: "QUANTA Academic Affairs Directorate",
    readTime: "6 min read",
    date: "Nov 02, 2026",
    imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80",
    featuredInCarousel: false,
    status: "Published",
    externalUrl: "https://www.daad.de/en/"
  },
  // Archived older articles
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

// 4. Define the Official Broadcast Message
const BROADCAST_MESSAGE = {
  id: `msg-launch-nov11-${Date.now()}`,
  senderLabel: "QUANTA Executive Administration",
  senderRole: "Executive",
  recipientScope: "All Members",
  priority: "Official notice",
  title: "⚡ تحديات اليوم العلمية الميسرة (+2 XP) ومقالات الذكاء الاصطناعي (Carbon 4 & Fable) متاحة الآن!",
  body: `تحية علمية طيبة لجميع أعضاء وباحثي نادي كوانتا،

يسر إدارة النادي الإعلان عن إطلاق حزمة التحديات اليومية الجديدة لليوم (11 نوفمبر 2026) بنظام مكافآت ميسر يمنح نقطتي خبرة (+2 XP) لكل إجابة صحيحة!

لقد صُممت أسئلة اليوم لتكون ممتعة، ميسرة وتثقيفية، وتغطي ركائز الحوسبة والعلوم الأساسية:
1. الذكاء الاصطناعي ونموذج Google Gemini 4 Carbon
2. الأنظمة المستقلة ونموذج Claude Fable 5.2
3. إدارة النسخ البرمجية باستخدام أداة Git
4. علم الفلك وأقرب الكواكب للشمس
5. البيولوجيا الجزيئية وحامل الشيفرة الوراثية (DNA)
6. الفيزياء الكونية وسرعة الضوء في الفراغ
7. بيئة بايثون ومدير الحزم pip
8. الخوارزميات وهياكل البيانات وسرعة الوصول O(1)
9. لغة الويب القياسية HTML
10. رسالة ورؤية نادي QUANTA العلمي

كما تم تحديث قسم الاستكشاف (Explore) بنشر مقالات تحليلية معمقة:
- "Google Gemini 4 Carbon: The New Benchmark Champion in Deep Reasoning, SEC-bench Pro & Agentic Coding"
- "Claude Fable & Multi-Agent Simulations: Long-Horizon Autonomy and Generative World-Building in 2026"
- "Top 10 Essential GitHub Repositories Every Developer & AI Engineer Should Star in 2026" (OpenHands, Langflow, Ollama, Free-for-dev, Scrapling...)

ندعو كافة الأعضاء لخوض التحديات العلمية اليومية والمشاركة في النقاشات التقنية عبر المنصة!`,
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
  console.log("=== UPDATING DAILY QUIZZES & EXPLORE POSTS ===");

  // 1. Update data/quanters-db.json
  const dbPath = path.join(process.cwd(), "data", "quanters-db.json");
  const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));

  db.dailyQuizzes = NEW_DAILY_QUIZZES;
  db.explorePosts = UPDATED_EXPLORE_POSTS;
  if (!Array.isArray(db.messages)) db.messages = [];
  // Keep broadcast clean: prepend new broadcast
  db.messages = [BROADCAST_MESSAGE, ...db.messages.filter(m => !m.id.startsWith("msg-launch-nov11"))];
  db.updatedAt = new Date().toISOString();

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");
  console.log("✓ data/quanters-db.json updated successfully.");

  // 2. Sync to Cloud Firestore erp_state/main
  console.log("Syncing directly to Cloud Firestore erp_state/main...");
  await patchDocFields("erp_state", "main", {
    dailyQuizzes: NEW_DAILY_QUIZZES,
    explorePosts: UPDATED_EXPLORE_POSTS,
    messages: db.messages,
    updatedAt: db.updatedAt,
  });
  console.log("✓ Cloud Firestore erp_state/main updated successfully!");

  // 3. Update src/lib/data/seed.ts SEED_DAILY_QUIZZES & SEED_EXPLORE_POSTS
  const seedPath = path.join(process.cwd(), "src", "lib", "data", "seed.ts");
  let seedCode = fs.readFileSync(seedPath, "utf8");

  // Replace SEED_DAILY_QUIZZES in seed.ts
  const quizStart = seedCode.indexOf("export const SEED_DAILY_QUIZZES: DailyQuizItem[] = [");
  if (quizStart !== -1) {
    const quizEnd = seedCode.indexOf("export const SEED_GRIEVANCES", quizStart);
    if (quizEnd !== -1) {
      const newQuizCode = `export const SEED_DAILY_QUIZZES: DailyQuizItem[] = ${JSON.stringify(NEW_DAILY_QUIZZES, null, 2)};\n\n`;
      seedCode = seedCode.slice(0, quizStart) + newQuizCode + seedCode.slice(quizEnd);
    }
  }

  // Replace SEED_EXPLORE_POSTS in seed.ts
  const postsStart = seedCode.indexOf("export const SEED_EXPLORE_POSTS: ExplorePost[] = [");
  if (postsStart !== -1) {
    const postsEnd = seedCode.indexOf("export const SEED_SETTINGS", postsStart);
    if (postsEnd !== -1) {
      const newPostsCode = `export const SEED_EXPLORE_POSTS: ExplorePost[] = ${JSON.stringify(UPDATED_EXPLORE_POSTS, null, 2)};\n\n`;
      seedCode = seedCode.slice(0, postsStart) + newPostsCode + seedCode.slice(postsEnd);
    }
  }

  fs.writeFileSync(seedPath, seedCode, "utf8");
  console.log("✓ src/lib/data/seed.ts SEED_DAILY_QUIZZES & SEED_EXPLORE_POSTS updated successfully.");
}

main().catch((err) => {
  console.error("Execution error:", err);
  process.exit(1);
});
