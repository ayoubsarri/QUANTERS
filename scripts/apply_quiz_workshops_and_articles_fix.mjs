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

// 2. Define the New 10 Daily Quizzes (2 XP each, Varied Answers: c, b, d, a, b, c, a, d, b, c)
const NEW_DAILY_QUIZZES = [
  {
    id: "quiz-2026-11-11-v2-01",
    domain: "الذكاء الاصطناعي والتفكير المنطقي (Gemini 4 Carbon)",
    icon: "ai-ml",
    question: "ما هو التقييم القياسي المعتمد في اختبارات الأمن السيبراني الذي تفوق فيه نموذج Google Gemini 4 Carbon بنسبة نجاح بلغت 88.2%؟",
    options: [
      {
        id: "a",
        label: "معيار توليد الصور الواقعية ImageNet"
      },
      {
        id: "b",
        label: "معيار ضغط ملفات الفيديو الرقمية MP4"
      },
      {
        id: "c",
        label: "معيار SEC-bench Pro لاكتشاف الثغرات البرمجية والتصحيح الذاتي"
      },
      {
        id: "d",
        label: "معيار الترجمة الصوتية الفورية للنصوص القديمة"
      }
    ],
    correctId: "c", // Correct is C
    verdictTitle: "تفوق Gemini 4 Carbon في معيار SEC-bench Pro",
    explanation: "حقق نموذج Gemini 4 Carbon نسبة نجاح استثنائية بلغت 88.2% على معيار SEC-bench Pro، متصدراً اختبارات كشف ثغرات الذاكرة والتصريح الأمني وتوليد الترقيعات الآمنة.",
    xpReward: 2,
    dateLabel: "2026-11-11",
    isPinnedToday: true,
    active: true
  },
  {
    id: "quiz-2026-11-11-v2-02",
    domain: "الأنظمة المستقلة والوكلاء الأذكياء (Claude Fable)",
    icon: "cybersecurity",
    question: "ما هي الخاصية المعمارية الأساسية التي تميز عائلة نماذج Claude Fable 5.2 في بيئات التطوير الهندسي المعقدة؟",
    options: [
      {
        id: "a",
        label: "اقتصار عملها على محادثات نصية قصيرة لا تتعدى بضعة أسطر"
      },
      {
        id: "b",
        label: "الاستقلالية طويلة المدى (Long-Horizon) وإدارة الوكلاء الفرعيين مع التفكير التكيفي"
      },
      {
        id: "c",
        label: "عدم قدرتها على فحص الكود البرمجي أو التعامل مع الأدوات الخارجية"
      },
      {
        id: "d",
        label: "حظر التفاعل مع بيئات الـ Terminal والحوسبة السحابية"
      }
    ],
    correctId: "b", // Correct is B
    verdictTitle: "الاستقلالية طويلة الأمد في Claude Fable 5.2",
    explanation: "صُممت عائلة Claude Fable 5.2 لإنجاز المهام الهندسية متعددة الساعات والأيام (Long-Horizon) عبر مستودعات برمجية معقدة وتصحيح الأخطاء تلقائياً بدعم آليات التفكير الممتد التكيفي.",
    xpReward: 2,
    dateLabel: "2026-11-11",
    isPinnedToday: false,
    active: true
  },
  {
    id: "quiz-2026-11-11-v2-03",
    domain: "أدوات التطوير وإدارة المستودعات (Git & GitHub)",
    icon: "git-open-source",
    question: "ما هو الأمر في Git الذي يُستخدم لاستعراض السجل الزمني للإيداعات (Commits) السابقة وتفاصيل مؤلفيها؟",
    options: [
      {
        id: "a",
        label: "git push --force-with-lease"
      },
      {
        id: "b",
        label: "git branch -D main"
      },
      {
        id: "c",
        label: "git stash drop"
      },
      {
        id: "d",
        label: "git log --oneline"
      }
    ],
    correctId: "d", // Correct is D
    verdictTitle: "استعراض سجل الإيداعات عبر git log",
    explanation: "يُستخدم الأمر git log (ومعه خيار --oneline للاختصار) لعرض التاريخ الزمني للمشروع، معرفات الـ Commits، وأسماء المساهمين ورسائل التعديل المعتمدة.",
    xpReward: 2,
    dateLabel: "2026-11-11",
    isPinnedToday: false,
    active: true
  },
  {
    id: "quiz-2026-11-11-v2-04",
    domain: "الفيزياء الفلكية وعلوم الفضاء (Astronomy)",
    icon: "astronomy",
    question: "ما هو التفاعل الفيزيائي الذي يُنتج الطاقة الهائلة المشعة من قلب الشمس وباقي النجوم النشطة في الكون؟",
    options: [
      {
        id: "a",
        label: "الاندماج النووي الحراري (Nuclear Fusion) لأنوية الهيدروجين لتشكيل الهيليوم"
      },
      {
        id: "b",
        label: "الاحتراق الكيميائي المباشر للغاز الطبيعي والفحم"
      },
      {
        id: "c",
        label: "الانشطار الإشعاعي لعنصر اليورانيوم والبلوتونيوم"
      },
      {
        id: "d",
        label: "الاحتكاك الميكانيكي بين جزيئات الغبار الكوني"
      }
    ],
    correctId: "a", // Correct is A
    verdictTitle: "الاندماج النووي: قلب الطاقة الشمسية",
    explanation: "تستمد الشمس طاقتها الجبارة من تفاعل الاندماج النووي الحراري، حيث تندمج بروتونات الهيدروجين لتكوين أنوية الهيليوم تحت ضغط فائق وحرارة تصل إلى 15 مليون كلفن.",
    xpReward: 2,
    dateLabel: "2026-11-11",
    isPinnedToday: false,
    active: true
  },
  {
    id: "quiz-2026-11-11-v2-05",
    domain: "البيولوجيا الجزيئية وعلم الوراثة (Genetics)",
    icon: "genetics",
    question: "في لولب الـ DNA المزدوج، ما هي القاعدة النيتروجينية المكملة التي ترتبط دائماً بالأدنين (Adenine) برابطتين هيدروجينيتين؟",
    options: [
      {
        id: "a",
        label: "الجوانين (Guanine)"
      },
      {
        id: "b",
        label: "الثايمين (Thymine)"
      },
      {
        id: "c",
        label: "السيتوزين (Cytosine)"
      },
      {
        id: "d",
        label: "اليوراسيل (Uracil)"
      }
    ],
    correctId: "b", // Correct is B
    verdictTitle: "التكامل الهيدروجيني: الأدنين والثايمين",
    explanation: "في الحمض النووي DNA، يرتبط الأدنين (A) حصرياً بالثايمين (T) بواسطة رابطتين هيدروجينيتين، بينما يرتبط الجوانين (G) بالسيتوزين (C) بثلاث روابط هيدروجينية وفق قواعد واطسون-كريك.",
    xpReward: 2,
    dateLabel: "2026-11-11",
    isPinnedToday: false,
    active: true
  },
  {
    id: "quiz-2026-11-11-v2-06",
    domain: "الميكانيكا وقوانين الحركة الكلاسيكية (Physics)",
    icon: "optics",
    question: "وفقاً لقانون نيوتن الثاني للحركة، ما هي العلاقة الرياضية التي تربط القوة المحصلة (F) بكتلة الجسم (m) وتسارعه (a)؟",
    options: [
      {
        id: "a",
        label: "F = m / a"
      },
      {
        id: "b",
        label: "F = m + a"
      },
      {
        id: "c",
        label: "F = m × a"
      },
      {
        id: "d",
        label: "F = a / m²"
      }
    ],
    correctId: "c", // Correct is C
    verdictTitle: "قانون نيوتن الثاني للحركة: F = m × a",
    explanation: "ينص قانون نيوتن الثاني على أن القوة المحصلة المؤثرة على جسم تساوي حاصل ضرب كتلته في التسارع المكتسب (F = ma)، وهو المبدأ التأسيسي للميكانيكا الكلاسيكية.",
    xpReward: 2,
    dateLabel: "2026-11-11",
    isPinnedToday: false,
    active: true
  },
  {
    id: "quiz-2026-11-11-v2-07",
    domain: "بيئة بايثون والبرمجيات الحرة (Python Ecosystem)",
    icon: "python",
    question: "ما هو الأمر القياسي في بايثون لإنشاء بيئة افتراضية معزولة (Virtual Environment) مخصصة لمشروع معين؟",
    options: [
      {
        id: "a",
        label: "python -m venv <env_name>"
      },
      {
        id: "b",
        label: "pip delete --all"
      },
      {
        id: "c",
        label: "python purge system"
      },
      {
        id: "d",
        label: "venv create --global"
      }
    ],
    correctId: "a", // Correct is A
    verdictTitle: "إنشاء البيئات الافتراضية عبر venv",
    explanation: "تتيح وحدة venv المدمجة في بايثون إنشاء بيئات معزولة تماماً تمنع تضارب إصدارات المكتبات وحزم البرمجيات بين المشاريع المختلفة.",
    xpReward: 2,
    dateLabel: "2026-11-11",
    isPinnedToday: false,
    active: true
  },
  {
    id: "quiz-2026-11-11-v2-08",
    domain: "الخوارزميات وهياكل البيانات (Computer Science)",
    icon: "mathematics",
    question: "ما هو التعقيد الزمني لأسوأ حالة (Worst-case Time Complexity) لخوارزمية البحث الثنائي (Binary Search) في مصفوفة مرتبة؟",
    options: [
      {
        id: "a",
        label: "O(n²)"
      },
      {
        id: "b",
        label: "O(n)"
      },
      {
        id: "c",
        label: "O(1)"
      },
      {
        id: "d",
        label: "O(log n)"
      }
    ],
    correctId: "d", // Correct is D
    verdictTitle: "التعقيد اللوغاريتمي O(log n) للبحث الثنائي",
    explanation: "نظراً لأن خوارزمية البحث الثنائي تقسم نطاق البحث إلى النصف في كل خطوة مقارنة، فإن تعقيدها الزمني لوغاريتمي O(log n)، مما يضمن كفاءة فائقة على البيانات الضخمة.",
    xpReward: 2,
    dateLabel: "2026-11-11",
    isPinnedToday: false,
    active: true
  },
  {
    id: "quiz-2026-11-11-v2-09",
    domain: "هندسة وتطوير واجهات الويب (Frontend Engineering)",
    icon: "web-dev",
    question: "ما هي اللغة القياسية المستخدمة لتحديد التنسيق البصري، الألوان، الخطوط، وتجاوب صفحات الويب مع مختلف الشاشات؟",
    options: [
      {
        id: "a",
        label: "بروتوكول نقل الملفات FTP"
      },
      {
        id: "b",
        label: "لغة صفائح الأنماط الانسيابية CSS (Cascading Style Sheets)"
      },
      {
        id: "c",
        label: "محرك قواعد البيانات SQLite"
      },
      {
        id: "d",
        label: "نظام التوزيع لشبكات DNS"
      }
    ],
    correctId: "b", // Correct is B
    verdictTitle: "لغة CSS لتصميم وهندسة واجهات الويب",
    explanation: "تتحكم لغة CSS بالجانب البصري لصفحات الإنترنت وتفصل بين هيكل المحتوى (HTML) وتنسيقات الألوان والخطوط والأبعاد والتجاوب مع الهواتف والحواسيب.",
    xpReward: 2,
    dateLabel: "2026-11-11",
    isPinnedToday: false,
    active: true
  },
  {
    id: "quiz-2026-11-11-v2-10",
    domain: "رسالة وقيم نادي QUANTA العلمي",
    icon: "leadership",
    question: "ما هو المعيار الأساسي المعتمد في نادي QUANTA لحساب ترقيات الأعضاء واختيار عضو الشهر واستحقاق الشارات؟",
    options: [
      {
        id: "a",
        label: "القرعة العشوائية والصدفة البحتة"
      },
      {
        id: "b",
        label: "الأقدمية الزمنية فقط دون أي نشاط علمي أو تقني"
      },
      {
        id: "c",
        label: "سجل النقاط الموثق والإنتاج العلمي المعتمد والمشاريع مفتوحة المصدر وحضور الفعاليات"
      },
      {
        id: "d",
        label: "عدد التفاعلات على شبكات التواصل الاجتماعي الشخصية"
      }
    ],
    correctId: "c", // Correct is C
    verdictTitle: "معايير الاستحقاق والنزاهة في QUANTA",
    explanation: "يرتكز نظام نادي كوانتا على سجل نقاط (Ledger) شفاف ومؤتمت يكافئ الجدارة الأكاديمية والعمل البحثي والبرمجي الجاد لضمان تكافؤ الفرص لجميع الأعضاء.",
    xpReward: 2,
    dateLabel: "2026-11-11",
    isPinnedToday: false,
    active: true
  }
];

// 3. Update Explore Posts: Keep Carbon 4, Claude Fable, and Top 10 Repos Published; Archive the rest!
const ALL_EXPLORE_POSTS = [
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
  // Archived secondary/older articles
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

async function main() {
  console.log("=== EXECUTING USER REQUEST: FIX QUIZ ANSWERS, ARCHIVE ARTICLES & CLEAR WORKSHOPS ===");

  // 1. Update data/quanters-db.json
  const dbPath = path.join(process.cwd(), "data", "quanters-db.json");
  const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));

  // Clear workshops completely so no phantom workshop is shown on member app
  db.workshops = [];
  db.dailyQuizzes = NEW_DAILY_QUIZZES;
  db.explorePosts = ALL_EXPLORE_POSTS;
  db.updatedAt = new Date().toISOString();

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");
  console.log("✓ data/quanters-db.json updated: workshops cleared (0), dailyQuizzes updated (10, varied answers), explorePosts archived.");

  // 2. Sync to Cloud Firestore erp_state/main
  console.log("Syncing directly to Cloud Firestore erp_state/main...");
  await patchDocFields("erp_state", "main", {
    workshops: [],
    dailyQuizzes: NEW_DAILY_QUIZZES,
    explorePosts: ALL_EXPLORE_POSTS,
    updatedAt: db.updatedAt,
  });
  console.log("✓ Cloud Firestore erp_state/main updated successfully!");

  // 3. Update src/lib/data/seed.ts: SEED_WORKSHOPS, SEED_DAILY_QUIZZES & SEED_EXPLORE_POSTS
  const seedPath = path.join(process.cwd(), "src", "lib", "data", "seed.ts");
  let seedCode = fs.readFileSync(seedPath, "utf8");

  // A. Replace SEED_WORKSHOPS with empty array
  const wsStart = seedCode.indexOf("export const SEED_WORKSHOPS: Workshop[] = [");
  if (wsStart !== -1) {
    const wsEnd = seedCode.indexOf("export const SEED_BADGES", wsStart);
    if (wsEnd !== -1) {
      const newWsCode = `export const SEED_WORKSHOPS: Workshop[] = [];\n\n`;
      seedCode = seedCode.slice(0, wsStart) + newWsCode + seedCode.slice(wsEnd);
      console.log("✓ SEED_WORKSHOPS set to empty array in seed.ts.");
    }
  }

  // B. Replace SEED_DAILY_QUIZZES in seed.ts
  const quizStart = seedCode.indexOf("export const SEED_DAILY_QUIZZES: DailyQuizItem[] = [");
  if (quizStart !== -1) {
    const quizEnd = seedCode.indexOf("export const SEED_GRIEVANCES", quizStart);
    if (quizEnd !== -1) {
      const newQuizCode = `export const SEED_DAILY_QUIZZES: DailyQuizItem[] = ${JSON.stringify(NEW_DAILY_QUIZZES, null, 2)};\n\n`;
      seedCode = seedCode.slice(0, quizStart) + newQuizCode + seedCode.slice(quizEnd);
      console.log("✓ SEED_DAILY_QUIZZES updated in seed.ts.");
    }
  }

  // C. Replace SEED_EXPLORE_POSTS in seed.ts
  const postsStart = seedCode.indexOf("export const SEED_EXPLORE_POSTS: ExplorePost[] = [");
  if (postsStart !== -1) {
    const postsEnd = seedCode.indexOf("export function getCurrentDayOfYear", postsStart);
    if (postsEnd !== -1) {
      const newPostsCode = `export const SEED_EXPLORE_POSTS: ExplorePost[] = ${JSON.stringify(ALL_EXPLORE_POSTS, null, 2)};\n\n`;
      seedCode = seedCode.slice(0, postsStart) + newPostsCode + seedCode.slice(postsEnd);
      console.log("✓ SEED_EXPLORE_POSTS updated in seed.ts.");
    }
  }

  fs.writeFileSync(seedPath, seedCode, "utf8");
  console.log("✓ src/lib/data/seed.ts updated successfully.");
}

main().catch((err) => {
  console.error("Execution error:", err);
  process.exit(1);
});
