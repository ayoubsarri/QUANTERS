import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const ARTIFACTS_DIR = "C:\\Users\\hp\\.gemini\\antigravity\\brain\\cbe1c6fc-a21f-4850-b3e1-d2466cf74193";
const PUBLIC_DOCS_DIR = "C:\\Users\\hp\\QUANTERS\\public\\docs";

if (!fs.existsSync(PUBLIC_DOCS_DIR)) {
  fs.mkdirSync(PUBLIC_DOCS_DIR, { recursive: true });
}

function getImageDataUri(filename) {
  const filePath = path.join(ARTIFACTS_DIR, filename);
  if (fs.existsSync(filePath)) {
    const ext = path.extname(filename).replace(".", "");
    const base64 = fs.readFileSync(filePath).toString("base64");
    return `data:image/${ext};base64,${base64}`;
  }
  console.warn(`Warning: Image not found: ${filePath}`);
  return "";
}

console.log("Encoding 17 platform screenshots into base64...");

const img = {
  welcome: getImageDataUri("manual_01_welcome.png"),
  loginDrawer: getImageDataUri("manual_02_login_drawer.png"),
  resetPass: getImageDataUri("manual_03_reset_password.png"),
  onboarding: getImageDataUri("manual_04_onboarding.png"),
  home: getImageDataUri("manual_05_home.png"),
  workshops: getImageDataUri("manual_06_workshops.png"),
  checkin: getImageDataUri("manual_07_checkin.png"),
  badges: getImageDataUri("manual_08_badges.png"),
  explore: getImageDataUri("manual_09_explore.png"),
  profile: getImageDataUri("manual_10_profile.png"),
  digitalId: getImageDataUri("manual_11_digital_id.png"),
  adminOverview: getImageDataUri("manual_12_admin_overview.png"),
  adminMembers: getImageDataUri("manual_13_admin_members.png"),
  adminWorkshops: getImageDataUri("manual_14_admin_workshops.png"),
  adminTasks: getImageDataUri("manual_15_admin_tasks.png"),
  adminPoints: getImageDataUri("manual_16_admin_points.png"),
  adminSettings: getImageDataUri("manual_17_admin_settings.png"),
};

console.log("Generating LaTeX-styled publication manual with interactive anchor hyperlinks...");

const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>دليل التشغيل والمستخدم الشامل لمنصة كوانترز — QUANTERS</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Cairo:wght@400;600;700;800;900&family=Fira+Code:wght@400;500;600;700&family=EB+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@400;500;600;700;800&display=swap');

    @page {
      size: A4;
      margin: 11mm 11mm 13mm 11mm;
      @bottom-right {
        content: "صفحة " counter(page);
        font-family: 'Amiri', serif;
        font-size: 8pt;
        color: #475569;
      }
      @bottom-left {
        content: "QUANTA Scientific Club · Platform Operating Manual 2026/2027";
        font-family: 'EB Garamond', serif;
        font-size: 8pt;
        color: #64748b;
      }
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    body {
      font-family: 'Amiri', 'Cairo', serif;
      direction: rtl;
      text-align: justify;
      color: #1e293b;
      background-color: #ffffff;
      line-height: 1.55;
      font-size: 9.8pt;
      margin: 0;
      padding: 0;
    }

    /* LaTeX Typography & Headings */
    h1, h2, h3, h4 {
      font-family: 'Cairo', 'Amiri', sans-serif;
      color: #091e42;
      margin-top: 14px;
      margin-bottom: 6px;
      line-height: 1.3;
    }

    h1.chapter-title {
      font-size: 16pt;
      font-weight: 900;
      color: #0f172a;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 4px;
      margin-top: 22px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }

    h2.section-title {
      font-size: 12pt;
      font-weight: 800;
      color: #0284c7;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 3px;
      margin-top: 16px;
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    h3.subsection-title {
      font-size: 10.5pt;
      font-weight: 700;
      color: #1e293b;
      margin-top: 10px;
      margin-bottom: 4px;
    }

    p {
      margin: 0 0 8px;
    }

    a {
      color: #0284c7;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }

    /* Back to TOC button */
    .back-to-toc {
      font-size: 7.5pt;
      font-family: 'Cairo', sans-serif;
      font-weight: 700;
      color: #64748b;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 2px 7px;
      border-radius: 4px;
      text-decoration: none;
    }
    .back-to-toc:hover {
      background: #e2e8f0;
      color: #0284c7;
    }

    /* LaTeX Styled English Inline Pill */
    .en-term {
      direction: ltr;
      display: inline-block;
      font-family: 'Inter', sans-serif;
      font-weight: 700;
      font-size: 8.5pt;
      color: #0369a1;
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      padding: 0.5px 5px;
      border-radius: 3px;
      margin: 0 2px;
      vertical-align: baseline;
    }

    .en-code {
      direction: ltr;
      display: inline-block;
      font-family: 'Fira Code', monospace;
      font-weight: 600;
      font-size: 8pt;
      color: #0f766e;
      background: #f0fdfa;
      border: 1px solid #99f6e4;
      padding: 0 4px;
      border-radius: 3px;
    }

    /* LaTeX Environments: tcolorbox */
    .latex-box {
      border-radius: 6px;
      margin: 10px 0;
      padding: 9px 12px;
      font-size: 9.2pt;
      line-height: 1.5;
      break-inside: avoid;
    }

    .box-definition {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-right: 4px solid #0284c7;
    }
    .box-definition .box-header {
      font-family: 'Cairo', sans-serif;
      font-weight: 800;
      color: #0284c7;
      margin-bottom: 4px;
      font-size: 9.5pt;
    }

    .box-theorem {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-right: 4px solid #16a34a;
    }
    .box-theorem .box-header {
      font-family: 'Cairo', sans-serif;
      font-weight: 800;
      color: #15803d;
      margin-bottom: 4px;
      font-size: 9.5pt;
    }

    .box-warning {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-right: 4px solid #f59e0b;
    }
    .box-warning .box-header {
      font-family: 'Cairo', sans-serif;
      font-weight: 800;
      color: #b45309;
      margin-bottom: 4px;
      font-size: 9.5pt;
    }

    /* Mathematical LaTeX Display */
    .latex-math-block {
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      border-bottom: 1px solid #e2e8f0;
      padding: 6px 12px;
      margin: 8px 0;
      font-family: 'EB Garamond', serif;
      font-size: 11pt;
      display: flex;
      justify-content: space-between;
      align-items: center;
      direction: ltr;
      text-align: center;
    }
    .math-eq {
      flex: 1;
      font-style: italic;
    }
    .math-num {
      color: #64748b;
      font-size: 9pt;
      font-weight: 600;
    }

    /* LaTeX Figures & Floats */
    .latex-figure {
      margin: 12px auto;
      text-align: center;
      background: #fcfcfd;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px;
      break-inside: avoid;
      max-width: 96%;
    }

    .latex-figure img {
      max-width: 100%;
      height: auto;
      max-height: 380px;
      border-radius: 4px;
      border: 1px solid #cbd5e1;
      object-fit: contain;
      box-shadow: 0 3px 10px rgba(0,0,0,0.06);
    }

    .latex-figure.desktop img {
      max-height: 310px;
    }

    .figure-caption {
      margin-top: 6px;
      font-size: 8.5pt;
      color: #334155;
      font-family: 'Cairo', sans-serif;
      line-height: 1.4;
    }
    .figure-caption strong {
      color: #0f172a;
    }

    /* LaTeX booktabs Tables */
    table.booktabs {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
      font-size: 8.8pt;
      break-inside: avoid;
      border-top: 2px solid #0f172a;
      border-bottom: 2px solid #0f172a;
    }

    table.booktabs th {
      border-bottom: 1px solid #475569;
      padding: 5px 8px;
      text-align: right;
      font-family: 'Cairo', sans-serif;
      font-weight: 800;
      color: #0f172a;
      background: #f8fafc;
    }

    table.booktabs td {
      padding: 5px 8px;
      border-bottom: 0.5px solid #e2e8f0;
      vertical-align: middle;
    }

    table.booktabs tr:last-child td {
      border-bottom: none;
    }

    /* Page Breaks */
    .page-break {
      page-break-before: always;
      break-before: page;
    }

    /* Cover Page (LaTeX Formal Monograph Style) */
    .latex-cover {
      height: 96vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border: 2px solid #0f172a;
      padding: 30px 24px;
      background: #ffffff;
      text-align: center;
      position: relative;
    }

    .cover-inner-border {
      border: 0.75px solid #0284c7;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 24px 20px;
    }

    .cover-inst-header {
      font-family: 'Cairo', sans-serif;
      font-weight: 700;
      font-size: 11pt;
      color: #0f172a;
      line-height: 1.4;
    }

    .cover-platform-logo {
      font-family: 'Inter', sans-serif;
      font-size: 34pt;
      font-weight: 900;
      letter-spacing: 3px;
      color: #0284c7;
      margin: 10px 0 2px;
    }

    .cover-doc-title {
      font-family: 'Cairo', sans-serif;
      font-size: 24pt;
      font-weight: 900;
      color: #0f172a;
      line-height: 1.25;
      margin: 15px 0 10px;
    }

    .cover-doc-subtitle {
      font-family: 'Amiri', serif;
      font-size: 12pt;
      color: #475569;
      max-width: 85%;
      margin: 0 auto;
      line-height: 1.6;
    }

    .cover-meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      border-top: 1px solid #cbd5e1;
      border-bottom: 1px solid #cbd5e1;
      padding: 10px 0;
      margin: 20px 0;
      font-size: 8.5pt;
      text-align: center;
    }

    .cover-meta-item strong {
      display: block;
      color: #0284c7;
      font-family: 'Inter', sans-serif;
      font-size: 8pt;
      text-transform: uppercase;
    }

    /* Table of Contents: LaTeX Dots Leader */
    .toc-container {
      background: #ffffff;
      margin: 15px 0;
    }

    .toc-entry {
      display: flex;
      align-items: baseline;
      margin-bottom: 4px;
      font-size: 9.2pt;
    }

    .toc-entry a {
      color: #0f172a;
      font-family: 'Cairo', sans-serif;
      font-weight: 700;
      text-decoration: none;
      display: flex;
      align-items: baseline;
      width: 100%;
    }

    .toc-entry a:hover {
      color: #0284c7;
    }

    .toc-title {
      white-space: nowrap;
    }

    .toc-dots {
      flex: 1;
      border-bottom: 1px dotted #94a3b8;
      margin: 0 8px;
      height: 1px;
    }

    .toc-tag {
      font-family: 'Fira Code', monospace;
      font-size: 8pt;
      color: #0284c7;
      font-weight: 700;
      white-space: nowrap;
    }

    .toc-subentry {
      margin-right: 18px;
      font-size: 8.6pt;
    }
    .toc-subentry a {
      font-weight: 600;
      color: #334155;
    }
  </style>
</head>
<body>

  <!-- =====================================================================
       FRONT MATTER: LATEX COVER PAGE
       ===================================================================== -->
  <div class="latex-cover">
    <div class="cover-inner-border">
      <div>
        <div class="cover-inst-header">
          الجمهورية الجزائرية الديمقراطية الشعبية · وزارة التعليم العالي والبحث العلمي<br>
          <strong>جامعة الجزائر 1 بن يوسف بن خدة · كلية العلوم</strong><br>
          النادي العلمي كوانتا · QUANTA RESEARCH &amp; SCIENTIFIC CLUB
        </div>
        <div class="cover-platform-logo">QUANTERS</div>
        <div style="font-size: 10pt; font-family: 'Cairo', sans-serif; font-weight: 700; color: #64748b; letter-spacing: 1px;">
          THE SCIENTIFIC CLUB ENTERPRISE RESOURCE PLATFORM
        </div>
      </div>

      <div>
        <div style="display: inline-block; background: #0284c7; color: white; padding: 3px 14px; border-radius: 12px; font-size: 8.5pt; font-weight: 800; font-family: 'Cairo', sans-serif; margin-bottom: 10px;">
          دليل التشغيل والسياسات الأكاديمية الرسمية · EDITION 2.1
        </div>
        <div class="cover-doc-title">
          دليل المستخدم والتشغيل الشامل<br>
          <span style="font-size: 16pt; font-weight: 700; color: #0284c7; font-family: 'EB Garamond', serif;">
            Comprehensive Platform Operating Manual &amp; Reference Guide
          </span>
        </div>
        <div class="cover-doc-subtitle">
          المرجع الموحد للطلاب، المتدربين، رؤساء الأقسام، قادة الفرق، وأعضاء المكتب التنفيذي · شرح شامل لكافة البوابات، أنظمة الحوكمة، تسجيل الحضور الميداني، ومحرك نقاط الخبرة والامتحانات
        </div>
      </div>

      <div>
        <div class="cover-meta-grid">
          <div class="cover-meta-item">
            <strong>Platform Core</strong>
            <span>QUANTERS v2.1.0</span>
          </div>
          <div class="cover-meta-item">
            <strong>Academic Cycle</strong>
            <span>2026 / 2027</span>
          </div>
          <div class="cover-meta-item">
            <strong>Target Roles</strong>
            <span>Members &amp; Execs</span>
          </div>
          <div class="cover-meta-item">
            <strong>Status</strong>
            <span>Official Standard</span>
          </div>
        </div>

        <div style="font-size: 8pt; color: #64748b; font-family: 'Cairo', sans-serif;">
          المكتب الأكاديمي والتقني للنادي العلمي كوانتا · شارع بن مهيدي، كلية العلوم، الجزائر العاصمة
        </div>
      </div>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- =====================================================================
       TABLE OF CONTENTS (INTERACTIVE LATEX ANCHORS)
       ===================================================================== -->
  <div id="table-of-contents"></div>
  <h1 class="chapter-title">
    <span>فهرس المحتويات التفاعلي (Table of Contents)</span>
    <span style="font-size: 8.5pt; color: #64748b; font-family: 'Cairo', sans-serif;">انقر على أي قسم للانتقال المباشر</span>
  </h1>

  <div class="latex-box box-definition">
    <div class="box-header">📌 ميزة الروابط التفاعلية المباشرة (Active PDF Hyperlinks)</div>
    تم بناء هذا الفهرس بتقنية الإشارات المرجعية المتوافقة مع معايير الـ <span class="en-term">PDF</span> العالمية. بمجرد النقر فوق أي عنوان أو بند في هذا الفهرس، سينتقل قارئ الـ PDF فوراً وبدقة متناهية إلى الصفحة والفقرة المحددة. كما يتوفر في أعلى كل قسم رابط <span class="en-term">↑ الفهرس</span> للرجوع المباشر إلى هذه الصفحة.
  </div>

  <div class="toc-container">
    <div class="toc-entry">
      <a href="#sec-overview">
        <span class="toc-title"><strong>§ 1.0 الملخص التنفيذي وفلسفة كوانترز ومصفوفة الصلاحيات</strong></span>
        <span class="toc-dots"></span>
        <span class="toc-tag">Overview</span>
      </a>
    </div>
    <div class="toc-entry toc-subentry">
      <a href="#sec-role-matrix">
        <span class="toc-title">مصفوفة الرتب والمسؤوليات الأكاديمية (Stakeholder Role Matrix)</span>
        <span class="toc-dots"></span>
        <span class="toc-tag">Roles</span>
      </a>
    </div>

    <div class="toc-entry" style="margin-top: 8px;">
      <a href="#chap-auth">
        <span class="toc-title"><strong>§ 2.0 الباب الأول: بوابة الدخول والأمان والتأهيل الأكاديمي</strong></span>
        <span class="toc-dots"></span>
        <span class="toc-tag">Auth &amp; Access</span>
      </a>
    </div>
    <div class="toc-entry toc-subentry">
      <a href="#sec-2-1">
        <span class="toc-title">2.1 شاشة الترحيب وتثبيت التطبيق (Welcome Screen &amp; PWA Offline Mode)</span>
        <span class="toc-dots"></span>
        <span class="toc-tag">§ 2.1</span>
      </a>
    </div>
    <div class="toc-entry toc-subentry">
      <a href="#sec-2-2">
        <span class="toc-title">2.2 تسجيل الدخول والتحصين ضد الهجمات (Sign In &amp; Security Shield)</span>
        <span class="toc-dots"></span>
        <span class="toc-tag">§ 2.2</span>
      </a>
    </div>
    <div class="toc-entry toc-subentry">
      <a href="#sec-2-3">
        <span class="toc-title">2.3 الوصول السريع بنقرة واحدة والحذف الفوري (1-Tap Saved Login)</span>
        <span class="toc-dots"></span>
        <span class="toc-tag">§ 2.3</span>
      </a>
    </div>
    <div class="toc-entry toc-subentry">
      <a href="#sec-2-4">
        <span class="toc-title">2.4 استعادة وتعيين كلمة المرور ذاتياً (Self-Service Password Recovery)</span>
        <span class="toc-dots"></span>
        <span class="toc-tag">§ 2.4</span>
      </a>
    </div>
    <div class="toc-entry toc-subentry">
      <a href="#sec-2-5">
        <span class="toc-title">2.5 مساعد الإعداد الأكاديمي ومسار الخريجين (Onboarding Wizard &amp; Alumni Path)</span>
        <span class="toc-dots"></span>
        <span class="toc-tag">§ 2.5</span>
      </a>
    </div>

    <div class="toc-entry" style="margin-top: 8px;">
      <a href="#chap-mobile">
        <span class="toc-title"><strong>§ 3.0 الباب الثاني: تجربة العضو اليومية عبر الهاتف المحمول</strong></span>
        <span class="toc-dots"></span>
        <span class="toc-tag">Mobile Portal</span>
      </a>
    </div>
    <div class="toc-entry toc-subentry">
      <a href="#sec-3-1">
        <span class="toc-title">3.1 شريط التنقل السفلي والتحكم (Bottom Navigation Bar)</span>
        <span class="toc-dots"></span>
        <span class="toc-tag">§ 3.1</span>
      </a>
    </div>
    <div class="toc-entry toc-subentry">
      <a href="#sec-3-2">
        <span class="toc-title">3.2 لوحة التحكم ومحرك نقاط الخبرة (Home Dashboard &amp; XP Progression)</span>
        <span class="toc-dots"></span>
        <span class="toc-tag">§ 3.2</span>
      </a>
    </div>
    <div class="toc-entry toc-subentry">
      <a href="#sec-3-3">
        <span class="toc-title">3.3 بوابة الورشات المخبرية وحجز المقاعد (Workshops &amp; Waitlist)</span>
        <span class="toc-dots"></span>
        <span class="toc-tag">§ 3.3</span>
      </a>
    </div>
    <div class="toc-entry toc-subentry">
      <a href="#sec-3-4">
        <span class="toc-title">3.4 الحضور الميداني المباشر بالـ QR والرمز (Live Check-In System)</span>
        <span class="toc-dots"></span>
        <span class="toc-tag">§ 3.4</span>
      </a>
    </div>
    <div class="toc-entry toc-subentry">
      <a href="#sec-3-5">
        <span class="toc-title">3.5 شجرة المهارات وامتحانات الاعتماد (Skills, Badges &amp; Exams)</span>
        <span class="toc-dots"></span>
        <span class="toc-tag">§ 3.5</span>
      </a>
    </div>
    <div class="toc-entry toc-subentry">
      <a href="#sec-3-6">
        <span class="toc-title">3.6 مجتمع الاستكشاف والتحدي اليومي (Explore &amp; Daily Quiz)</span>
        <span class="toc-dots"></span>
        <span class="toc-tag">§ 3.6</span>
      </a>
    </div>
    <div class="toc-entry toc-subentry">
      <a href="#sec-3-7">
        <span class="toc-title">3.7 الملف الشخصي وتبديل اللغة وسجل الـ XP (Profile &amp; Language Toggle)</span>
        <span class="toc-dots"></span>
        <span class="toc-tag">§ 3.7</span>
      </a>
    </div>
    <div class="toc-entry toc-subentry">
      <a href="#sec-3-8">
        <span class="toc-title">3.8 بطاقة الهوية الرقمية وجواز السفر الذكي (Official Digital ID Pass)</span>
        <span class="toc-dots"></span>
        <span class="toc-tag">§ 3.8</span>
      </a>
    </div>

    <div class="toc-entry" style="margin-top: 8px;">
      <a href="#chap-tasks">
        <span class="toc-title"><strong>§ 4.0 الباب الثالث: إدارة المشاريع والمهام العلمية</strong></span>
        <span class="toc-dots"></span>
        <span class="toc-tag">Tasks &amp; Projects</span>
      </a>
    </div>
    <div class="toc-entry toc-subentry">
      <a href="#sec-4-1">
        <span class="toc-title">4.1 دورة حياة المهمة التراكمية (Lifecycle: Assigned → Validated)</span>
        <span class="toc-dots"></span>
        <span class="toc-tag">§ 4.1</span>
      </a>
    </div>
    <div class="toc-entry toc-subentry">
      <a href="#sec-4-2">
        <span class="toc-title">4.2 معايير إرفاق روابط الإثبات (Proof URLs &amp; Evidence)</span>
        <span class="toc-dots"></span>
        <span class="toc-tag">§ 4.2</span>
      </a>
    </div>
    <div class="toc-entry toc-subentry">
      <a href="#sec-4-3">
        <span class="toc-title">4.3 معادلة احتساب النقاط ومكافأة الإنجاز المبكر (Scoring Formula)</span>
        <span class="toc-dots"></span>
        <span class="toc-tag">§ 4.3</span>
      </a>
    </div>

    <div class="toc-entry" style="margin-top: 8px;">
      <a href="#chap-managers">
        <span class="toc-title"><strong>§ 5.0 الباب الرابع: دليل مسؤولي الأقسام ونوابهم</strong></span>
        <span class="toc-dots"></span>
        <span class="toc-tag">Manager Suite</span>
      </a>
    </div>
    <div class="toc-entry toc-subentry">
      <a href="#sec-5-1">
        <span class="toc-title">5.1 هيكلية الأقسام الخمسة والفرق العلمية (Department Architecture)</span>
        <span class="toc-dots"></span>
        <span class="toc-tag">§ 5.1</span>
      </a>
    </div>
    <div class="toc-entry toc-subentry">
      <a href="#sec-5-2">
        <span class="toc-title">5.2 إدارة مهام القسم وتحكيم التسليمات (Task Validation Pipeline)</span>
        <span class="toc-dots"></span>
        <span class="toc-tag">§ 5.2</span>
      </a>
    </div>

    <div class="toc-entry" style="margin-top: 8px;">
      <a href="#chap-admin">
        <span class="toc-title"><strong>§ 6.0 الباب الخامس: مركز الإدارة العامة والمشرفين الكبار (/admin)</strong></span>
        <span class="toc-dots"></span>
        <span class="toc-tag">Admin Center</span>
      </a>
    </div>
    <div class="toc-entry toc-subentry">
      <a href="#sec-6-1">
        <span class="toc-title">6.1 لوحة المراقبة الكونية والتليمتري (Cosmic Telemetry Dashboard)</span>
        <span class="toc-dots"></span>
        <span class="toc-tag">§ 6.1</span>
      </a>
    </div>
    <div class="toc-entry toc-subentry">
      <a href="#sec-6-2">
        <span class="toc-title">6.2 دليل الأعضاء والصلاحيات والترقيات (Members Directory &amp; RBAC)</span>
        <span class="toc-dots"></span>
        <span class="toc-tag">§ 6.2</span>
      </a>
    </div>
    <div class="toc-entry toc-subentry">
      <a href="#sec-6-3">
        <span class="toc-title">6.3 جدولة الورشات وتوليد رمز الحضور (Workshops &amp; PIN Generation)</span>
        <span class="toc-dots"></span>
        <span class="toc-tag">§ 6.3</span>
      </a>
    </div>
    <div class="toc-entry toc-subentry">
      <a href="#sec-6-4">
        <span class="toc-title">6.4 لوحة كانبان والتحكيم المزدوج للمهام (Tasks Kanban Pipeline)</span>
        <span class="toc-dots"></span>
        <span class="toc-tag">§ 6.4</span>
      </a>
    </div>
    <div class="toc-entry toc-subentry">
      <a href="#sec-6-5">
        <span class="toc-title">6.5 دفتر الأستاذ وتدقيق النقاط المحاسبي (Points Immutable Ledger)</span>
        <span class="toc-dots"></span>
        <span class="toc-tag">§ 6.5</span>
      </a>
    </div>
    <div class="toc-entry toc-subentry">
      <a href="#sec-6-6">
        <span class="toc-title">6.6 حوكمة اللائحة الداخلية وصندوق الشكاوى (Governance &amp; Grievances)</span>
        <span class="toc-dots"></span>
        <span class="toc-tag">§ 6.6</span>
      </a>
    </div>
    <div class="toc-entry toc-subentry">
      <a href="#sec-6-7">
        <span class="toc-title">6.7 إعدادات النظام وتجزئة قواعد البيانات (Settings &amp; Cloud Sharding)</span>
        <span class="toc-dots"></span>
        <span class="toc-tag">§ 6.7</span>
      </a>
    </div>

    <div class="toc-entry" style="margin-top: 8px;">
      <a href="#chap-faq">
        <span class="toc-title"><strong>§ 7.0 الملحق: بنك الأسئلة الشائعة والدعم الفني (FAQ &amp; Support)</strong></span>
        <span class="toc-dots"></span>
        <span class="toc-tag">Appendix</span>
      </a>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- =====================================================================
       CHAPTER 1: OVERVIEW & STAKEHOLDER MATRIX
       ===================================================================== -->
  <div id="sec-overview"></div>
  <h1 class="chapter-title">
    <span>§ 1.0 الملخص التنفيذي وفلسفة كوانترز ومصفوفة الصلاحيات</span>
    <a href="#table-of-contents" class="back-to-toc">↑ الفهرس</a>
  </h1>

  <p>
    منصة <span class="en-term">QUANTERS</span> هي منظومة سحابية متكاملة مصممة خصيصاً للنادي العلمي كوانتا (<span class="en-term">QUANTA Scientific Club</span>) بكلية العلوم، جامعة الجزائر 1. تجمع المنصة بين ثلاثة أبعاد تشغيلية مترابطة:
  </p>
  <ol>
    <li><strong>الحوكمة الإدارية الرصينة (<span class="en-term">Institutional Governance</span>):</strong> إدارة رقمية كاملة لملفات العضوية، اللجان، التكليفات، ومحاضر الاجتماعات مع حماية تشريعية صارمة للائحة الداخلية.</li>
    <li><strong>التطوير الأكاديمي والتحفيز بالألعاب (<span class="en-term">Gamification Engine</span>):</strong> نظام متصاعد لنقاط الخبرة (<span class="en-term">XP</span>)، الشارات الأكاديمية المعتمدة على الامتحانات، والرتب العلمية التي تفتح صلاحيات إدارية تدريجياً.</li>
    <li><strong>العمليات الميدانية والهوية الرقمية (<span class="en-term">Field Operations &amp; Identity</span>):</strong> تسجيل الحضور اللحظي في قاعات ومخابر الكلية عبر خوارزميات الـ QR والرمز السداسي، مع إصدار جواز سفر رقمي مشفر لكل عضو.</li>
  </ol>

  <div id="sec-role-matrix"></div>
  <h2 class="section-title">
    <span>مصفوفة الرتب والمسؤوليات الأكاديمية (Stakeholder Role Matrix)</span>
    <a href="#table-of-contents" class="back-to-toc">↑ الفهرس</a>
  </h2>

  <table class="booktabs">
    <thead>
      <tr>
        <th style="width: 18%;">الرتبة في النظام (Role)</th>
        <th style="width: 18%;">المسمى الأكاديمي</th>
        <th style="width: 20%;">طريقة التعيين / الترقية</th>
        <th>نطاق الصلاحيات التشغيلية داخل المنصة</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><span class="en-term">Member</span></td>
        <td>عضو عامل</td>
        <td>اجتياز معالج التأهيل <span class="en-code">Onboarding</span></td>
        <td>حجز مقاعد الورشات، تسجيل الحضور بالـ QR والرمز، خوض امتحانات الشارات، تسليم المهام ورفع روابط الإثبات، واستخراج جواز السفر الرقمي.</td>
      </tr>
      <tr>
        <td><span class="en-term">Trainee</span></td>
        <td>عضو متدرب</td>
        <td>تسجيل حساب جديد تحت الاختبار</td>
        <td>حساب تمهيدي يتيح المشاركة في الورشات التأسيسية والمسابقة اليومية، ويخضع لتقييم رئيس القسم قبل التثبيت.</td>
      </tr>
      <tr>
        <td><span class="en-term">Alumni</span></td>
        <td>خريج النادي</td>
        <td>تفعيل مسار الخريج (2023–2026)</td>
        <td>صفة شرفية تمنح خريجي كوانتا حق حضور الفعاليات المتخصصة، تقديم الإرشاد الأكاديمي للطلبة الجدد، وعقد الجلسات التوجيهية.</td>
      </tr>
      <tr>
        <td><span class="en-term">Team Leader</span></td>
        <td>قائد فريق علمي</td>
        <td>ترقية من رئيس القسم المعني</td>
        <td>الإشراف الميداني على فرق العمل المصغرة داخل القسم، متابعة إنجاز مشاريع الهاكاثون، وتوجيه الأعضاء في إعداد التقارير.</td>
      </tr>
      <tr>
        <td><span class="en-term">Co-Manager</span></td>
        <td>نائب رئيس قسم</td>
        <td>اعتماد من رئيس القسم ومكتب الـ HR</td>
        <td>معاونة رئيس القسم في إدارة الأعضاء، تحكيم المهام المسلمة وإسناد النقاط، والمساعدة في إدارة سجلات الحضور الميداني.</td>
      </tr>
      <tr>
        <td><span class="en-term">Department Head</span></td>
        <td>رئيس قسم تخصصي</td>
        <td>تعيين رسمي من المشرف العام</td>
        <td>إدارة متكاملة لأعضاء القسم، إنشاء مهام القسم وجدولتها، تحكيم مخرجات الطلاب واعتماد نقاط الخبرة في دفتر الأستاذ.</td>
      </tr>
      <tr>
        <td><span class="en-term">HR Head</span></td>
        <td>مسؤول الموارد البشرية</td>
        <td>تعيين تنفيذي من إدارة النادي</td>
        <td>الإشراف المركزي على سجلات الأعضاء، مراجعة ملفات التأهيل (<span class="en-code">KYC</span>)، إدارة ترقيات الأدوار، وتلقي الشكاوى السرية.</td>
      </tr>
      <tr>
        <td><span class="en-term">Executive</span></td>
        <td>عضو المكتب التنفيذي</td>
        <td>انتخاب من الجمعية العامة</td>
        <td>حق التصويت التشريعي على تعديلات اللائحة الداخلية (القوانين الأساسية) مع اشتراط تصويت أغلبية الثلثين (<span class="en-term">2/3 Approval</span>).</td>
      </tr>
      <tr>
        <td><span class="en-term">Super Admin</span></td>
        <td>المشرف العام على المنصة</td>
        <td>صلاحية النظام المطلقة</td>
        <td>إدارة قواعد البيانات السحابية، دفتر الأستاذ العام، التراجع عن العمليات الخاطئة، وضبط الإعدادات الشاملة للمنظومة.</td>
      </tr>
    </tbody>
  </table>

  <div class="page-break"></div>

  <!-- =====================================================================
       CHAPTER 2: ACCESS, AUTH & ONBOARDING
       ===================================================================== -->
  <div id="chap-auth"></div>
  <h1 class="chapter-title">
    <span>§ 2.0 الباب الأول: بوابة الدخول والأمان والتأهيل الأكاديمي</span>
    <a href="#table-of-contents" class="back-to-toc">↑ الفهرس</a>
  </h1>

  <div id="sec-2-1"></div>
  <h2 class="section-title">
    <span>2.1 شاشة الترحيب وتثبيت التطبيق (Welcome Screen &amp; PWA Offline Mode)</span>
    <a href="#table-of-contents" class="back-to-toc">↑ الفهرس</a>
  </h2>
  <p>
    شاشة الترحيب هي الواجهة الافتتاحية للمنظومة، وتتكون من خلفية فضائية كوانتية متحركة عالية الدقة تُظهر رائد الفضاء الكروشيه مستكشفاً سدم المجرات. توفر الشاشة خيارين محوريين:
  </p>
  <ul>
    <li><span class="en-term">Start MEMBER PORTAL</span>: يفتح النافذة المنبثقة السفلية المجهزة بنماذج المصادقة السريعة.</li>
    <li><span class="en-term">DOWNLOAD APP</span>: يتيح تنصيب المنصة فورياً كتطبيق تقدمي (<span class="en-term">Progressive Web App - PWA</span>). يتم تخزين واجهات التطبيق محلياً في الذاكرة المخبأة (<span class="en-code">Service Worker Cache</span>)، ما يتيح فتحه واستعراض بطاقة الهوية الرقمية والورشات المسجلة حتى داخل المخابر الأرضية التي تفتقر لتغطية شبكة الإنترنت.</li>
  </ul>

  <div class="latex-figure">
    <img src="${img.welcome}" alt="Welcome Screen">
    <div class="figure-caption"><strong>الشكل (1):</strong> واجهة الترحيب الرسمية مع بانر الرصد الفضائي وأزرار الدخول والتثبيت المباشر.</div>
  </div>

  <div id="sec-2-2"></div>
  <h2 class="section-title">
    <span>2.2 تسجيل الدخول والتحصين ضد الهجمات (Sign In &amp; Security Shield)</span>
    <a href="#table-of-contents" class="back-to-toc">↑ الفهرس</a>
  </h2>
  <p>
    تعتمد المنصة على نظام مصادقة مزدوج يضمن سهولة الاستخدام مع أعلى معايير الحماية السيبرانية:
  </p>
  <ul>
    <li><strong>المصادقة بالبريد الأكاديمي/الشخصي وكلمة المرور:</strong> يتم مطابقة كلمة المرور باستخدام تجزئة مشفرة مدعمة بملح عشوائي خاص (<span class="en-code">Salted Digest</span>).</li>
    <li><strong>درع الإيقاف الأمني المؤقت (<span class="en-term">Brute-Force Lockout Shield</span>):</strong>
      يقوم النظام بمراقبة محاولات تسجيل الدخول الفاشلة على مستوى الجهاز وعنوان الشبكة. عند تسجيل 5 محاولات خاطئة متتالية، يُقفل النموذج تلقائياً لمدة 60 ثانية تتضاعف مع استمرار المحاولات غير المصرح بها لمنع أي هجوم تخميني.
    </li>
    <li><strong>المصادقة السريعة عبر Google (<span class="en-term">Continue with Google</span>):</strong>
      تسجيل الدخول الآمن بنقرة واحدة عبر حسابات Google الرسمية المرتبطة بالجامعة دون الحاجة لكتابة أو تذكر كلمة مرور.
    </li>
  </ul>

  <div class="latex-figure">
    <img src="${img.loginDrawer}" alt="Login Drawer">
    <div class="figure-caption"><strong>الشكل (2):</strong> نافذة تسجيل الدخول المنبثقة مع شريط الحسابات المحفوظة وخيارات المصادقة.</div>
  </div>

  <div class="page-break"></div>

  <div id="sec-2-3"></div>
  <h2 class="section-title">
    <span>2.3 الوصول السريع بنقرة واحدة والحذف الفوري (1-Tap Saved Login)</span>
    <a href="#table-of-contents" class="back-to-toc">↑ الفهرس</a>
  </h2>
  <p>
    لإلغاء مشقة كتابة البيانات عند كل دخول على الهواتف والأجهزة الشخصية، طوّرت المنصة نظام تخزين الجلسات الذكي:
  </p>
  <ul>
    <li><strong>الولوج الفوري بلمسة واحدة (<span class="en-term">1-Tap Direct Login</span>):</strong> بمجرد نجاح تسجيل الدخول لأول مرة، يُعرض الحساب في شريط <span class="en-term">SAVED LOGIN</span>. النقر على بطاقة الاسم ينشط جلسة العضو الموثقة فورياً ويوجهه مباشرة إلى لوحة التحكم (<span class="en-code">/home</span> أو <span class="en-code">/admin/overview</span>) دون توقف أو طلب لكلمة المرور مجدداً.</li>
    <li><strong>زر الحذف الأمني السريع <span class="en-term">(X)</span>:</strong> عند استخدام جهاز مشترك في قاعات الكلية، يمكن للعضو النقر على زر <span class="en-term">X</span> الملحق ببطاقته، حيث يقوم معالج الأحداث فورياً (<span class="en-code">e.stopPropagation()</span>) بمسح الحساب من الذاكرة المحلية نهائياً دون تشغيل عملية الولوج.</li>
  </ul>

  <div id="sec-2-4"></div>
  <h2 class="section-title">
    <span>2.4 استعادة وتعيين كلمة المرور ذاتياً (Self-Service Password Recovery)</span>
    <a href="#table-of-contents" class="back-to-toc">↑ الفهرس</a>
  </h2>
  <p>
    تمت إعادة هندسة واجهة استعادة كلمة المرور لتكون في غاية البساطة والوضوح دون أي نصوص أو أزرار مكررة:
  </p>
  <ol>
    <li>ينقر العضو على رابط <span class="en-term">Forgot password?</span> داخل نافذة الدخول.</li>
    <li>تفتح بطاقة موحدة بعنوان <span class="en-term">Reset Password</span> تطلب كتابة البريد الإلكتروني المسجل.</li>
    <li>النقر على زر <span class="en-term">SEND PASSWORD RESET LINK</span> يؤدي إلى إرسال رابط تأكيد مشفر إلى بريد العضو صالح للاستخدام مرة واحدة.</li>
    <li>في حال رغبة العضو في العودة، يتوفر زر نصي واحد وأنيق <span class="en-term">← Back to Sign In</span> أسفل حقل الإرسال.</li>
    <li>كما يتوفر زر خفي لفتح قنوات الدعم الأكاديمي (<span class="en-code">quantaclubdz@gmail.com</span>) لحل أي إشكال مستعصٍ.</li>
  </ol>

  <div class="latex-figure">
    <img src="${img.resetPass}" alt="Reset Password Modal">
    <div class="figure-caption"><strong>الشكل (3):</strong> بطاقة استعادة كلمة المرور الموحدة والخالية من أي حشو أو تعقيد بصري.</div>
  </div>

  <div class="page-break"></div>

  <div id="sec-2-5"></div>
  <h2 class="section-title">
    <span>2.5 مساعد الإعداد الأكاديمي ومسار الخريجين (Onboarding Wizard &amp; Alumni Path)</span>
    <a href="#table-of-contents" class="back-to-toc">↑ الفهرس</a>
  </h2>
  <p>
    يمر كل عضو جديد بمراحل تأهيل دقيقة تبني ملفه الرقمي خطوة بخطوة:
  </p>
  <ul>
    <li><strong>البيانات الشخصية والأكاديمية:</strong> الاسم الكامل الرسمي (المطابق للشهادة الجامعية)، رقم الهاتف، الولاية، الكلية، التخصص الأكاديمي، والمستوى الدراسي (من السنة الأولى ليسانس حتى الدكتوراه).</li>
    <li><strong>تحديد القسم والاهتمامات:</strong> اختيار التخصص داخل لجان النادي (تقني، علمي، تصميم، تنظيم، إعلام).</li>
    <li><strong>مسار خريجي النادي المتكيف (<span class="en-term">QUANTA Alumni Path</span>):</strong>
      يوفر النظام مساراً ذكياً خاصاً بالطلبة المتخرجين من النادي، يطلب تحديد سنة التخرج بدقة من القائمة المحصورة (<span class="en-term">2023, 2024, 2025, 2026</span>)، مع تحديد طبيعة عمل الخريج الحالي واستعداده لتقديم دورات إرشادية وتدريبية (<span class="en-term">Mentorship</span>) للأعضاء الجدد.
    </li>
  </ul>

  <div class="latex-figure">
    <img src="${img.onboarding}" alt="Onboarding Wizard">
    <div class="figure-caption"><strong>الشكل (4):</strong> معالج الإعداد الأكاديمي وتوثيق بيانات الطالب واختيار مسار الخريج المتكيف.</div>
  </div>

  <div class="page-break"></div>

  <!-- =====================================================================
       CHAPTER 3: MEMBER MOBILE EXPERIENCE
       ===================================================================== -->
  <div id="chap-mobile"></div>
  <h1 class="chapter-title">
    <span>§ 3.0 الباب الثاني: تجربة العضو اليومية عبر الهاتف المحمول</span>
    <a href="#table-of-contents" class="back-to-toc">↑ الفهرس</a>
  </h1>

  <div id="sec-3-1"></div>
  <h2 class="section-title">
    <span>3.1 شريط التنقل السفلي والتحكم (Bottom Navigation Bar)</span>
    <a href="#table-of-contents" class="back-to-toc">↑ الفهرس</a>
  </h2>
  <p>
    يستقر شريط التنقل المحمول في أسفل الشاشة بارتفاع مدروس يوفر وصولاً سريعاً لكافة البوابات اليومية. تم تصميم التبويبات باللغة العربية مع الالتزام بكلمة واحدة لكل تبويب لمنع تكسر الأسطر نهائياً على الشاشات الصغيرة:
  </p>
  <ul>
    <li><span class="en-term">الورشات / Workshops</span>: استكشاف الجداول وحجز المقاعد.</li>
    <li><span class="en-term">استكشف / Explore</span>: الإعلانات المجتمعية والمسابقة اليومية.</li>
    <li><span class="en-term">الرئيسية / Home</span>: الشاشة المركزية للرتبة والمهام والمؤشرات السريعة.</li>
    <li><span class="en-term">الشارات / Badges</span>: شجرة المهارات وامتحانات الترقي.</li>
    <li><span class="en-term">حسابي / Profile</span>: بطاقة العضوية، إعدادات الحساب، وتوليد بطاقة الهوية الرقمية.</li>
  </ul>

  <div id="sec-3-2"></div>
  <h2 class="section-title">
    <span>3.2 لوحة التحكم ومحرك نقاط الخبرة (Home Dashboard &amp; XP Progression)</span>
    <a href="#table-of-contents" class="back-to-toc">↑ الفهرس</a>
  </h2>
  <p>
    تمنح لوحة التحكم الرئيسية العضو رؤية شاملة لمكانته الأكاديمية ونشاطه التراكمي:
  </p>
  <ul>
    <li><strong>بطاقة الرتبة الكونية (<span class="en-term">Cosmic Rank Card</span>):</strong> تظهر لقب العضو الأكاديمي (مثال: <span class="en-term">Quanta Initiate</span> للمستوى الأول حتى رتبة <span class="en-term">Quanta Master</span> للمستوى العاشر)، مع نسبة مئوية دقيقة ورسم بياني لمقدار الـ XP المطلوب للارتقاء للمستوى التالي.</li>
    <li><strong>العدادات الإحصائية الأربعة:</strong>
      <ul>
        <li><span class="en-term">Badges</span>: إجمالي الشارات المكتسبة باجتياز الاختبارات المعتمدة.</li>
        <li><span class="en-term">Sessions</span>: عدد الورشات والمحاضرات التي تم تسجيل الحضور الفعلي فيها.</li>
        <li><span class="en-term">Projects</span>: المشاريع العلمية والبرمجية المنجزة والمحققة.</li>
        <li><span class="en-term">Total XP</span>: الرصيد الإجمالي التراكمي الموثق في دفتر الأستاذ المحاسبي.</li>
      </ul>
    </li>
    <li><strong>بطاقة الجلسة القادمة (<span class="en-term">Next Session Card</span>):</strong> تبرز أقرب ورشة مجدولة للطالب مع بيان اسم القاعة (مثل <span class="en-code">Lab B12</span>)، التوقيت بالساعة، والمقاعد المتبقية، مع زر مباشر لتسجيل الحضور الميداني (<span class="en-term">Check-in</span>).</li>
  </ul>

  <div class="latex-figure">
    <img src="${img.home}" alt="Member Dashboard">
    <div class="figure-caption"><strong>الشكل (5):</strong> لوحة التحكم الرئيسية للعضو وبطاقة الرتبة الكونية والعدادات الإحصائية الأربعة.</div>
  </div>

  <div class="page-break"></div>

  <div id="sec-3-3"></div>
  <h2 class="section-title">
    <span>3.3 بوابة الورشات المخبرية وحجز المقاعد (Workshops &amp; Waitlist)</span>
    <a href="#table-of-contents" class="back-to-toc">↑ الفهرس</a>
  </h2>
  <p>
    تُنظم الورشات المخبرية وفق نظام حجز دقيق يراعي الطاقة الاستيعابية لمخابر كلية العلوم:
  </p>
  <ul>
    <li><strong>بطاقة الورشة التفصيلية:</strong> توضح التخصص الأكاديمي، المستوى المطلوب (<span class="en-term">Beginner, Intermediate, Advanced</span>)، اسم المؤطر المخبري، القاعة، والمقاعد الشاغرة (مثلاً 24 مقعداً متاحاً).</li>
    <li><strong>مكافأة الحضور (<span class="en-term">+150 XP</span>):</strong> يُمنح كل عضو يحضر الجلسة ويُسجل حضوره رسمياً 150 نقطة خبرة تضاف فورياً لرصيده.</li>
    <li><strong>الحجز الفوري وإلغاء الاشتراك:</strong> يمكن حجز المقعد بنقرة واحدة عبر <span class="en-term">Reserve Seat</span>. وإذا اضطر العضو للغياب، يمكنه إلغاء حجزه لفتح المقعد تلقائياً للمنتظرين في قائمة الانتظار (<span class="en-term">Automated Waitlist Promotion</span>).</li>
  </ul>

  <div class="latex-figure">
    <img src="${img.workshops}" alt="Workshops Portal">
    <div class="figure-caption"><strong>الشكل (6):</strong> جدول الورشات المخبرية وخيارات حجز وإلغاء المقاعد مع بيان نقاط الـ XP المكتسبة.</div>
  </div>

  <div id="sec-3-4"></div>
  <h2 class="section-title">
    <span>3.4 الحضور الميداني المباشر بالـ QR والرمز (Live Check-In System)</span>
    <a href="#table-of-contents" class="back-to-toc">↑ الفهرس</a>
  </h2>
  <p>
    للقضاء على التوقيعات الورقية وتفادي التلاعب، وضعت كوانترز آلية حضور رقمية مزدوجة التحقق:
  </p>
  <ol>
    <li><strong>مسح رمز الاستجابة السريعة (<span class="en-term">Camera QR Scanner</span>):</strong> فتح كاميرا الهاتف المدمجة داخل التطبيق ومسح الـ QR الديناميكي المعروض على شاشة القاعة بواسطة المدرب.</li>
    <li><strong>الرمز السداسي المؤقت (<span class="en-term">6-Digit Session Code</span>):</strong> كتابة الرمز الرقمي المؤقت المكون من 6 خانات والذي يُنشئه المشرف حصرياً لتلك الجلسة وتنتهي صلاحيته تلقائياً بانتهاء الورشة.</li>
  </ol>

  <div class="latex-figure">
    <img src="${img.checkin}" alt="Live Check-in Portal">
    <div class="figure-caption"><strong>الشكل (7):</strong> بوابة تسجيل الحضور الميداني المباشر عبر الماسح البصري أو الرمز السداسي.</div>
  </div>

  <div class="page-break"></div>

  <div id="sec-3-5"></div>
  <h2 class="section-title">
    <span>3.5 شجرة المهارات وامتحانات الاعتماد (Skills, Badges &amp; Exams)</span>
    <a href="#table-of-contents" class="back-to-toc">↑ الفهرس</a>
  </h2>
  <p>
    تُمنح شارات كوانترز بناءً على براهين علمية واختبارات حقيقية مؤتمتة:
  </p>
  <ul>
    <li><strong>فئات الشارات:</strong> تشمل البرمجة وعلوم البيانات (<span class="en-term">Scientific Python, Data Analysis</span>)، الذكاء الاصطناعي، التصميم الجرافيكي، والبحث الأكاديمي.</li>
    <li><strong>الامتحانات المؤتمتة (<span class="en-term">Skill Exams</span>):</strong>
      لكل شارة امتحان إلكتروني محدد بوقت زمني وأسئلة متعددة الخيارات يتم اختيارها عشوائياً من بنك الأسئلة الأكاديمي. تتطلب الترقية نيل 70% فأعلى، وعند النجاح تُمنح الشارة مباشرة لملف العضو مع إضافة رصيد الـ XP المخصص.
    </li>
  </ul>

  <div class="latex-figure">
    <img src="${img.badges}" alt="Skills and Badges Tree">
    <div class="figure-caption"><strong>الشكل (8):</strong> شجرة المهارات والشارات الأكاديمية وبوابة دخول الامتحانات المؤتمتة.</div>
  </div>

  <div id="sec-3-6"></div>
  <h2 class="section-title">
    <span>3.6 مجتمع الاستكشاف والتحدي اليومي (Explore &amp; Daily Quiz)</span>
    <a href="#table-of-contents" class="back-to-toc">↑ الفهرس</a>
  </h2>
  <p>
    يمثل قسم الاستكشاف الساحة التفاعلية لتبادل المعرفة والتنافس الإيجابي بين الأعضاء:
  </p>
  <ul>
    <li><strong>المسابقة العلمية اليومية (<span class="en-term">Daily Scientific Quiz</span>):</strong> سؤال علمي متجدد كل 24 ساعة في مجالات الكيمياء، الفيزياء، الرياضيات، والفلك، تمنح إجابته الصحيحة نقاط خبرة فورية، مع قفل محاولة العضو لليوم ذاته منعاً للتكرار.</li>
    <li><strong>حكمة اليوم العلمية (<span class="en-term">Daily Quote</span>):</strong> اقتباس علمي يومي من كبار علماء الحضارة الإسلامية والعالمية (مثل جابر بن حيان، الخوارزمي، ابن الهيثم، وريتشارد فاينمان).</li>
    <li><strong>الإعلانات المجتمعية:</strong> استعراض إعلانات الفعاليات والهاكاثونات القادمة.</li>
  </ul>

  <div class="latex-figure">
    <img src="${img.explore}" alt="Explore Feed">
    <div class="figure-caption"><strong>الشكل (9):</strong> منصة الاستكشاف المجتمعي ومسابقة اليوم العلمية واقتباسات التراث الأكاديمي.</div>
  </div>

  <div class="page-break"></div>

  <div id="sec-3-7"></div>
  <h2 class="section-title">
    <span>3.7 الملف الشخصي وتبديل اللغة وسجل الـ XP (Profile &amp; Language Toggle)</span>
    <a href="#table-of-contents" class="back-to-toc">↑ الفهرس</a>
  </h2>
  <p>
    يجمع الملف الشخصي السجل الأكاديمي والمهني الكامل للطالب داخل النادي:
  </p>
  <ul>
    <li><strong>المعرف الرقمي الموحد (<span class="en-term">Quanter ID</span>):</strong> كود فريد وثابت (مثل <span class="en-code">QT-26-0582</span>) يُعد الرقم التعريفي الأكاديمي للعضو في كافة أنشطة ومراسلات النادي.</li>
    <li><strong>مسار الرتبة والأقدمية (<span class="en-term">Standing &amp; Tenure Roadmap</span>):</strong> يوضح تاريخ انضمام العضو، حالته الحالية (<span class="en-term">Active Member, Trainee, Alumni</span>)، والقسم العلمي المنتمي إليه.</li>
    <li><strong>تبديل اللغة بنقرة واحدة (<span class="en-term">Language Toggle: English / العربية</span>):</strong>
      تغيير لغة المنصة فورياً بين العربية والإنجليزية مع ضبط اتجاه النصوص والقوائم وحفظ خيار العضو للمستقبل.
    </li>
    <li><strong>سجل نقاط الخبرة التفصيلي (<span class="en-term">XP Ledger</span>):</strong> كشف حساب تدقيقي يعرض تفاصيل كل نقطة كسبها العضو وتاريخها والمهمة المرتبطة بها.</li>
  </ul>

  <div class="latex-figure">
    <img src="${img.profile}" alt="Member Profile Screen">
    <div class="figure-caption"><strong>الشكل (10):</strong> شاشة الملف الشخصي ومسار الأقدمية وأزرار تبديل اللغة وتعديل البيانات.</div>
  </div>

  <div id="sec-3-8"></div>
  <h2 class="section-title">
    <span>3.8 بطاقة الهوية الرقمية وجواز السفر الذكي (Official Digital ID Pass)</span>
    <a href="#table-of-contents" class="back-to-toc">↑ الفهرس</a>
  </h2>
  <p>
    تمثل بطاقة الهوية الرقمية لجواز سفر كوانترز نقلة نوعية في موثوقية العضوية الأكاديمية:
  </p>
  <ul>
    <li><strong>تصميم مدمج ثابت دون أي تمرير (<span class="en-term">Zero-Scroll Ergonomic Design</span>):</strong>
      تم ضبط أبعاد البطاقة بدقة (<span class="en-code">max-h-[min(90dvh,560px)]</span>) لتتوسط شاشة الهاتف تماماً دون الحاجة للتمرير العمودي، ما يضمن سرعة إبرازها عند بوابات المخابر والملتقيات.
    </li>
    <li><strong>العناصر الأمنية الرسمية:</strong>
      <ul>
        <li>ختم جامعة الجزائر 1 وشعار كوانتا مع شارة <span class="en-term">QUANTA PASSPORT 2026/2027</span> المضاءة بنبض أخضر حي.</li>
        <li>الشريحة الإلكترونية الذهبية ثلاثية الأبعاد (<span class="en-term">Simulated Smart Security Chip</span>).</li>
        <li>صورة العضو المعتمدة محاطة بحلقة كوانتا المشعة وشارة التحقق الخضراء (<span class="en-term">Verified Badge</span>).</li>
        <li>الاسم الثلاثي، المعرف الرقمي <span class="en-term">Quanter ID</span>، الرتبة، والقسم التخصصي.</li>
      </ul>
    </li>
    <li><strong>رمز الاستجابة السريعة عالي التباين (<span class="en-term">Ultra-Clean Scannable QR</span>):</strong>
      لوحة QR نقية على أرضية بيضاء عاكسة تتضمن الرابط الرقمي المشفر للتحقق من العضوية وصلاحية الجواز بنقرة كاميرا واحدة.
    </li>
    <li><strong>التنزيل كصورة عالية الدقة (<span class="en-term">Save PNG</span>):</strong> زر مخصص يحفظ البطاقة فورياً كصورة فائقة الدقة في استوديو الهاتف.</li>
  </ul>

  <div class="latex-figure">
    <img src="${img.digitalId}" alt="Official Digital ID Pass">
    <div class="figure-caption"><strong>الشكل (11):</strong> جواز السفر وبطاقة الهوية الرقمية المعتمدة بالشريحة الهولوغرافية والرمز النقي.</div>
  </div>

  <div class="page-break"></div>

  <!-- =====================================================================
       CHAPTER 4: TASKS & PROJECTS MANAGEMENT
       ===================================================================== -->
  <div id="chap-tasks"></div>
  <h1 class="chapter-title">
    <span>§ 4.0 الباب الثالث: إدارة المشاريع والمهام العلمية</span>
    <a href="#table-of-contents" class="back-to-toc">↑ الفهرس</a>
  </h1>

  <div id="sec-4-1"></div>
  <h2 class="section-title">
    <span>4.1 دورة حياة المهمة التراكمية (Lifecycle: Assigned → Validated)</span>
    <a href="#table-of-contents" class="back-to-toc">↑ الفهرس</a>
  </h2>
  <p>
    تخضع المشاريع والمهام التخصصية لدورة حياة برمجية وأكاديمية صارمة:
  </p>
  <div class="latex-box box-definition">
    <div class="box-header">📋 المراحل الأربع للمهمة العلمية</div>
    <ol>
      <li><strong>التكليف الإداري (<span class="en-term">Assigned</span>):</strong> ينشئ رئيس القسم أو المشرف المهمة ويحدد النقاط الأساسية والموعد النهائي (<span class="en-term">Deadline</span>).</li>
      <li><strong>قيد الإنجاز (<span class="en-term">In Progress</span>):</strong> يبدأ العضو في تنفيذ المتطلبات البرمجية أو التصميمية أو البحثية.</li>
      <li><strong>التسليم الرقمي (<span class="en-term">Submitted</span>):</strong> يرفع العضو رابط العمل المنجز ويضغط <span class="en-term">Submit Task</span> لتنتقل المهمة للتحكيم.</li>
      <li><strong>التحكيم والاعتماد (<span class="en-term">Validated</span>):</strong> يفحص المشرف المخرجات، ويحدد علامة الجودة وضخ النقاط في حساب الطالب.</li>
    </ol>
  </div>

  <div id="sec-4-2"></div>
  <h2 class="section-title">
    <span>4.2 معايير إرفاق روابط الإثبات (Proof URLs &amp; Evidence)</span>
    <a href="#table-of-contents" class="back-to-toc">↑ الفهرس</a>
  </h2>
  <p>
    لا تعتمد المنصة أي تسليم دون رابط إثبات رقمي مباشر (<span class="en-term">Proof URL</span>) يخضع للشروط التالية:
  </p>
  <ul>
    <li>مشاريع البرمجة والذكاء الاصطناعي: مستودع عام على <span class="en-term">GitHub</span> يحتوي على كود سليم وملف <span class="en-code">README.md</span> توضيحي.</li>
    <li>مشاريع التصميم الجرافيكي والميديا: رابط <span class="en-term">Figma</span> أو <span class="en-term">Google Drive</span> مفتوح الصلاحية للعرض والمراجعة.</li>
    <li>التقارير العلمية والبحوث: مستند منسق بصيغة <span class="en-term">PDF</span> يلتزم بمعايير الاقتباس والتوثيق الأكاديمي.</li>
  </ul>

  <div id="sec-4-3"></div>
  <h2 class="section-title">
    <span>4.3 معادلة احتساب النقاط ومكافأة الإنجاز المبكر (Scoring Formula)</span>
    <a href="#table-of-contents" class="back-to-toc">↑ الفهرس</a>
  </h2>
  <p>
    تُحتسب نقاط الخبرة النهائية لأي مهمة عبر المعادلة الرياضية المعيارية المعتمدة في اللائحة الداخلية للنادي:
  </p>

  <div class="latex-math-block">
    <span class="math-eq">
      \mathrm{XP}_{\mathrm{awarded}} = \left\lfloor \mathrm{XP}_{\mathrm{base}} \times \left( \frac{\mathrm{Quality}}{100} \right) \times (1 + \beta_{\mathrm{speed}}) - \delta_{\mathrm{late}} \right\rfloor
    </span>
    <span class="math-num">(1)</span>
  </div>

  <table class="booktabs">
    <thead>
      <tr>
        <th>المتغير في المعادلة</th>
        <th>المدى الرياضي</th>
        <th>الشرح والمعنى الأكاديمي</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>$\mathrm{XP}_{\mathrm{base}}$</td>
        <td>50 – 500 XP</td>
        <td>النقاط الأساسية المخصصة للمهمة عند إنشائها من قِبل رئيس القسم.</td>
      </tr>
      <tr>
        <td>$\mathrm{Quality}$</td>
        <td>0 – 100%</td>
        <td>تقييم دقة واحترافية العمل المسلّم من قِبل المشرف المحكّم.</td>
      </tr>
      <tr>
        <td>$\beta_{\mathrm{speed}}$</td>
        <td>0.10 – 0.25</td>
        <td>مكافأة التسليم المبكر قبل الموعد بـ 48 ساعة فأكثر (+10% إلى +25%).</td>
      </tr>
      <tr>
        <td>$\delta_{\mathrm{late}}$</td>
        <td>10 XP / day</td>
        <td>خصم التأخير التراكمي عن كل 24 ساعة تأخير بعد الموعد النهائي دون عذر معتمد.</td>
      </tr>
    </tbody>
  </table>

  <div class="page-break"></div>

  <!-- =====================================================================
       CHAPTER 5: MANAGERS & DEPARTMENT HEADS
       ===================================================================== -->
  <div id="chap-managers"></div>
  <h1 class="chapter-title">
    <span>§ 5.0 الباب الرابع: دليل مسؤولي الأقسام ونوابهم</span>
    <a href="#table-of-contents" class="back-to-toc">↑ الفهرس</a>
  </h1>

  <div id="sec-5-1"></div>
  <h2 class="section-title">
    <span>5.1 هيكلية الأقسام الخمسة والفرق العلمية (Department Architecture)</span>
    <a href="#table-of-contents" class="back-to-toc">↑ الفهرس</a>
  </h2>
  <p>
    تنتظم الأعمال التخصصية داخل كوانتا عبر خمسة أقسام رئيسية يرأس كلاً منها <span class="en-term">Department Head</span> يعاونه <span class="en-term">Co-Manager</span>:
  </p>
  <ul>
    <li><strong>قسم الإعلام الآلي والحلول التقنية (<span class="en-term">IT &amp; Technical Solutions</span>):</strong> تطوير الأنظمة، الذكاء الاصطناعي، أمن المعلومات، وإدارة البنية السحابية.</li>
    <li><strong>قسم البحث العلمي والفيزياء (<span class="en-term">Scientific Research &amp; Physics</span>):</strong> الفيزياء التطبيقية، علوم الفضاء، النمذجة الرياضية، والمحاكاة المخبرية.</li>
    <li><strong>قسم التصميم والملتيميديا (<span class="en-term">Design &amp; Multimedia</span>):</strong> تصميم الهوية البصرية، واجهات الويب، موشن غرافيك، ومونتاج الوثائقيات العلمية.</li>
    <li><strong>قسم اللوجستيك والتنظيم (<span class="en-term">Logistics &amp; Event Operations</span>):</strong> إدارة مدرجات ومخابر الكلية، استقبال المشاركين، واللوجستيك الميداني.</li>
    <li><strong>قسم العلاقات والاتصال (<span class="en-term">External Relations &amp; Communication</span>):</strong> العلاقات الأكاديمية مع أساتذة الكلية والمخابر، الرعاة، والتغطية الصحفية.</li>
  </ul>

  <div id="sec-5-2"></div>
  <h2 class="section-title">
    <span>5.2 إدارة مهام القسم وتحكيم التسليمات (Task Validation Pipeline)</span>
    <a href="#table-of-contents" class="back-to-toc">↑ الفهرس</a>
  </h2>
  <p>
    يمتلك مسؤولو الأقسام لوحة متابعة خاصة تتيح لهم:
  </p>
  <ol>
    <li>الاطلاع على قائمة المهام المسلمة في تبويب <span class="en-term">Submitted</span>.</li>
    <li>فحص رابط المشروع المرفق والتحقق من التزام العضو بالمعايير الفنية المطلوبة.</li>
    <li>إدخال علامة الجودة من 0 إلى 100 وتحديد ما إذا كان العضو يستحق مكافأة السرعة.</li>
    <li>النقر على زر <span class="en-term">Validate &amp; Score Task</span>، ليتم تحديث حالة المهمة فورياً إلى <span class="en-term">Validated</span> وقيد النقاط في حساب العضو وإرسال إشعار فوري له.</li>
    <li>في حال وجود نقص، ينقر المشرف على <span class="en-term">Request Revision</span> مع كتابة الملاحظات لتتاح للطالب فرصة التعديل وإعادة التسليم.</li>
  </ol>

  <div class="page-break"></div>

  <!-- =====================================================================
       CHAPTER 6: EXECUTIVE ADMINISTRATION (/admin SUITE)
       ===================================================================== -->
  <div id="chap-admin"></div>
  <h1 class="chapter-title">
    <span>§ 6.0 الباب الخامس: مركز الإدارة العامة والمشرفين الكبار (/admin)</span>
    <a href="#table-of-contents" class="back-to-toc">↑ الفهرس</a>
  </h1>

  <div id="sec-6-1"></div>
  <h2 class="section-title">
    <span>6.1 لوحة المراقبة الكونية والتليمتري (Cosmic Telemetry Dashboard)</span>
    <a href="#table-of-contents" class="back-to-toc">↑ الفهرس</a>
  </h2>
  <p>
    واجهة <span class="en-code">/admin/overview</span> هي غرفة العمليات المركزية لمشرفي النادي:
  </p>
  <ul>
    <li><strong>بانر الرصد الكوني العريض (<span class="en-term">Widescreen Cosmic Hero Banner</span>):</strong> عمل فني رقمي عريض مستوحى من قبة الرصد الفضائي لكوانتا، يدمج مؤشرات وقت التشغيل وحالة الخادم السحابي اللحظية.</li>
    <li><strong>بطاقات التيليمتري الحية (<span class="en-term">Live Telemetry Metric Cards</span>):</strong> تعرض بدقة أعداد المسجلين، عدد الورشات الجارية، معدل إنجاز المهام، ومتوسط الحضور الميداني في مخابر كلية العلوم.</li>
  </ul>

  <div class="latex-figure desktop">
    <img src="${img.adminOverview}" alt="Admin Overview Dashboard">
    <div class="figure-caption"><strong>الشكل (12):</strong> لوحة المراقبة الإدارية العامة والتحليلات الحية وبانر الرصد الكوني.</div>
  </div>

  <div id="sec-6-2"></div>
  <h2 class="section-title">
    <span>6.2 دليل الأعضاء والصلاحيات والترقيات (Members Directory &amp; RBAC)</span>
    <a href="#table-of-contents" class="back-to-toc">↑ الفهرس</a>
  </h2>
  <p>
    صفحة <span class="en-code">/admin/members</span> تمنح المشرفين إدارة محكمة لقاعدة بيانات النادي:
  </p>
  <ul>
    <li><strong>محرك البحث والتصفية المتطورة:</strong> تصفية الأعضاء حسب التخصص الجامعي، القسم، أو الدور الإداري (<span class="en-term">Member, Leader, Manager, Executive</span>).</li>
    <li><strong>منح الصلاحيات وترقية الرتب (<span class="en-term">Role Assignment</span>):</strong> ترقية وتعيين رؤساء الأقسام ونوابهم وقادة الفرق بنقرة واحدة، مع تسجيل العملية فورياً في سجل التدقيق الأمني لمنع أي تجاوز.</li>
    <li><strong>تدقيق ملفات العضوية (<span class="en-term">KYC Verification</span>):</strong> مراجعة أرقام الهواتف، الإقامة الجامعية، التخصصات، والمستندات الثبوتية.</li>
  </ul>

  <div class="latex-figure desktop">
    <img src="${img.adminMembers}" alt="Admin Members Directory">
    <div class="figure-caption"><strong>الشكل (13):</strong> دليل الأعضاء الشامل وإدارة الصلاحيات وتعيين الأدوار القيادية.</div>
  </div>

  <div class="page-break"></div>

  <div id="sec-6-3"></div>
  <h2 class="section-title">
    <span>6.3 جدولة الورشات وتوليد رمز الحضور (Workshops &amp; PIN Generation)</span>
    <a href="#table-of-contents" class="back-to-toc">↑ الفهرس</a>
  </h2>
  <p>
    تتيح واجهة <span class="en-code">/admin/workshops</span> إدارة الأنشطة المخبرية والمحاضرات:
  </p>
  <ul>
    <li><strong>جدولة ورشة جديدة:</strong> إدخال العنوان، التخصص، القاعة، السعة القصوى للمقاعد، والمدرب المسؤول.</li>
    <li><strong>توليد رمز الحضور اللحظي (<span class="en-term">Generate 6-Digit PIN</span>):</strong>
      إنشاء كود رقمي مؤقت محمي ضد التخمين يُعرض على عاكس القاعة ليتمكن الطلاب من تسجيل حضورهم ميدانياً.
    </li>
    <li><strong>سجل الحضور اللحظي (<span class="en-term">Live Attendance Roster</span>):</strong> متابعة قوائم الحاضرين ثانية بثانية، مع إمكانية التحضير اليدوي الاستثنائي في الحالات الطارئة.</li>
  </ul>

  <div class="latex-figure desktop">
    <img src="${img.adminWorkshops}" alt="Admin Workshops Scheduler">
    <div class="figure-caption"><strong>الشكل (14):</strong> لوحة إدارة الورشات وجدولة المقاعد وتوليد رموز التحقق للجلسات.</div>
  </div>

  <div id="sec-6-4"></div>
  <h2 class="section-title">
    <span>6.4 لوحة كانبان والتحكيم المزدوج للمهام (Tasks Kanban Pipeline)</span>
    <a href="#table-of-contents" class="back-to-toc">↑ الفهرس</a>
  </h2>
  <p>
    توفر واجهة <span class="en-code">/admin/tasks</span> متابعة مركزية لجميع اللجان والأقسام عبر لوحة كانبان تفاعلية:
  </p>
  <ul>
    <li>استعراض المهام حسب مراحل العمل: جديدة، جارية، بانتظار التحكيم، ومعتمدة.</li>
    <li>التحكيم المزدوج للمهام الحساسة ومشاريع النادي الكبرى التي تشترك فيها عدة أقسام معاً لضمان الحياد والعدالة الأكاديمية.</li>
  </ul>

  <div class="latex-figure desktop">
    <img src="${img.adminTasks}" alt="Admin Tasks Pipeline">
    <div class="figure-caption"><strong>الشكل (15):</strong> لوحة إدارة وتحكيم المهام الأكاديمية والمشاريع العلمية الشاملة.</div>
  </div>

  <div class="page-break"></div>

  <div id="sec-6-5"></div>
  <h2 class="section-title">
    <span>6.5 دفتر الأستاذ وتدقيق النقاط المحاسبي (Points Immutable Ledger)</span>
    <a href="#table-of-contents" class="back-to-toc">↑ الفهرس</a>
  </h2>
  <p>
    تطبق كوانترز معايير الحوكمة المالية الدقيقة على نقاط الخبرة عبر دفتر محاسبي غير قابل للتلاعب (<span class="en-term">Append-Only Immutable Ledger</span>):
  </p>
  <ul>
    <li><strong>توثيق كل حركة بالمللي ثانية:</strong> كل قيد يتضمن هوية العضو، نوع الحركة، قيمة النقاط، التاريخ والوقت بدقة، والبريد الإلكتروني للمسؤول المنفذ.</li>
    <li><strong>الإضافة اليدوية المبررة (<span class="en-term">Manual Points Adjustment</span>):</strong>
      يُشترط كتابة سبب إداري وأكاديمي مفصل لإتمام أي تعديل يدوي للنقاط، ويُحفظ السبب في السجل العام بشكل دائم.
    </li>
    <li><strong>نظام التراجع المحاسبي (<span class="en-term">Reverse Entry</span>):</strong>
      في حال حدوث أي خطأ، يمنع النظام حذف السجل الأصلي تماماً، بل يتم توليد قيد تراجع معاكس يلغي الأثر الحسابي مع توثيق سبب التراجع واسم المشرف المسؤول.
    </li>
  </ul>

  <div class="latex-figure desktop">
    <img src="${img.adminPoints}" alt="Points Ledger System">
    <div class="figure-caption"><strong>الشكل (16):</strong> دفتر الأستاذ المحاسبي لنقاط الخبرة ونظام التراجع والتدقيق الأمني.</div>
  </div>

  <div id="sec-6-6"></div>
  <h2 class="section-title">
    <span>6.6 حوكمة اللائحة الداخلية وصندوق الشكاوى (Governance &amp; Grievances)</span>
    <a href="#table-of-contents" class="back-to-toc">↑ الفهرس</a>
  </h2>
  <p>
    تنفرد كوانترز بنظام حوكمة تشريعي متين يحافظ على استقلالية ونزاهة النادي العلمي:
  </p>
  <ul>
    <li><strong>تعديل اللائحة الداخلية واشتراط أغلبية الثلثين (<span class="en-term">2/3 Executive Vote Approval</span>):</strong>
      لا يمكن تعديل بنود القانون الأساسي للنادي إلا بمقترح تشريعي يخضع لاقتراع أعضاء المكتب التنفيذي. يشترط النظام برمجياً تحقيق المعادلة التالية قبل اعتماد التعديل آلياً:
      <div class="latex-math-block">
        <span class="math-eq">
          \mathcal{V}_{\mathrm{approval}} \ge \left\lceil \frac{2}{3} \cdot N_{\mathrm{executives}} \right\rceil
        </span>
        <span class="math-num">(2)</span>
      </div>
    </li>
    <li><strong>صندوق التظلمات والشكاوى السرية المجهولة (<span class="en-term">Anonymous Grievance Desk</span>):</strong>
      بوابة سرية تتيح لأي طالب إرسال شكوى أو ملاحظة حول التسيير أو الورشات دون الكشف عن اسمه أو بريده، وتصل حصرياً إلى مكتب التحكيم لضمان بيئة أكاديمية عادلة.
    </li>
  </ul>

  <div id="sec-6-7"></div>
  <h2 class="section-title">
    <span>6.7 إعدادات النظام وتجزئة قواعد البيانات (Settings &amp; Cloud Sharding)</span>
    <a href="#table-of-contents" class="back-to-toc">↑ الفهرس</a>
  </h2>
  <p>
    تتضمن صفحة <span class="en-code">/admin/settings</span> الأدوات الهندسية المتطورة للتحكم في المنظومة:
  </p>
  <ul>
    <li><strong>التشغيل دون اتصال (<span class="en-term">Offline-First Caching</span>):</strong>
      تخزين بيانات النادي الحيوية في الذاكرة المخبأة للمتصفح (<span class="en-code">IndexedDB / LocalStorage</span>) لضمان العمل بسلاسة عند انقطاع الإنترنت ومزامنتها تلقائياً عند الاتصال.
    </li>
    <li><strong>تجزئة سجلات التدقيق السحابية (<span class="en-term">Cloud Sharding</span>):</strong>
      آلية تلقائية لتدوير ونقل السجلات التاريخية القديمة إلى شظايا تخزين مستقلة (<span class="en-code">history_shard</span>) لضمان بقاء وثيقة الحالة الرئيسية أقل من 1 ميغابايت وحماية المنظومة من استهلاك حصص التخزين السحابي مجاناً.
    </li>
    <li><strong>النسخ الاحتياطي الكامل (<span class="en-term">Full Database JSON Backup</span>):</strong> تصدير كامل قاعدة البيانات بنقرة زر واحدة كملف JSON مشفر للحفظ الدوري.</li>
  </ul>

  <div class="latex-figure desktop">
    <img src="${img.adminSettings}" alt="Admin Settings Dashboard">
    <div class="figure-caption"><strong>الشكل (17):</strong> إعدادات المنظومة وتجزئة قواعد البيانات السحابية وضبط الحوكمة.</div>
  </div>

  <div class="page-break"></div>

  <!-- =====================================================================
       CHAPTER 7: APPENDIX & FAQ
       ===================================================================== -->
  <div id="chap-faq"></div>
  <h1 class="chapter-title">
    <span>§ 7.0 الملحق: بنك الأسئلة الشائعة والدعم الفني (FAQ &amp; Support)</span>
    <a href="#table-of-contents" class="back-to-toc">↑ الفهرس</a>
  </h1>

  <div class="latex-box box-definition">
    <div class="box-header">❓ س 1: كيف أستعيد حسابي في حال نسيان كلمة المرور؟</div>
    توجه إلى شاشة الترحيب وافتح لوحة تسجيل الدخول، ثم انقر على <span class="en-term">Forgot password?</span> وأدخل بريدك المسجل. سيصلك رابط فوري في بريدك الإلكتروني صالح لمدة ساعة لإعادة تعيين كلمة مرور جديدة. وإذا كان حسابك مسجلاً عبر Google، يكفي النقر على <span class="en-term">Continue with Google</span> للولوج المباشر دون الحاجة لكلمة مرور.
  </div>

  <div class="latex-box box-definition">
    <div class="box-header">❓ س 2: لماذا لم يُقبل تسجيلي للحضور في الورشة؟</div>
    يتحقق النظام برمجياً من شرطين أساسيين:
    <ul>
      <li>أن تكون قد حجزت مقعداً رسمياً مسبقاً في الورشة قبل بدئها.</li>
      <li>أن يتم التسجيل خلال النافذة الزمنية المسموح بها (من 15 دقيقة قبل انطلاق الجلسة وحتى 30 دقيقة بعد بدئها).</li>
      <li>في حال وجود مشكلة في كاميرا الهاتف، اطلب من المدرب الرمز السداسي المؤقت (<span class="en-term">6-Digit PIN</span>) وأدخله يدوياً.</li>
    </ul>
  </div>

  <div class="latex-box box-definition">
    <div class="box-header">❓ س 3: كيف أستخرج بطاقة الهوية الرقمية وما فائدتها؟</div>
    ادخل إلى تبويب <span class="en-term">حسابي / Profile</span>، ثم اضغط على أيقونة الـ <span class="en-term">QR</span> الموجودة بجانب صورتك الشخصية. ستظهر لك فورياً بطاقة الهوية الرقمية الذكية متضمنة الشريحة الإلكترونية والرمز النقي. تُستخدم البطاقة كجواز سفر رسمي لإثبات العضوية في مخابر الكلية، ويمكنك حفظها في الهاتف بنقر زر <span class="en-term">Save PNG</span>.
  </div>

  <div class="latex-box box-definition">
    <div class="box-header">❓ س 4: كيف أغير لغة المنصة من الإنجليزية إلى العربية أو العكس؟</div>
    في أسفل صفحة <span class="en-term">Profile</span>، توجد أزرار تبديل اللغة بوضوح (<span class="en-term">🇬🇧 English</span> و <span class="en-term">🇩🇿 العربية</span>). بمجرد النقر عليها، يتم تحويل كامل واجهات المنصة فورياً مع الحفظ التلقائي للاختيار لجميع الزيارات القادمة.
  </div>

  <div class="latex-box box-theorem">
    <div class="box-header">💡 س 5: كيفية تثبيت كوانترز كتطبيق سريع على هواتف أندرويد وآيفون؟</div>
    افتح الموقع على المتصفح:
    <ul>
      <li><strong>على نظام Android (متصفح Chrome):</strong> انقر على زر <span class="en-term">DOWNLOAD APP</span> في شاشة الترحيب أو اختر <em>"تثبيت التطبيق" (Install App)</em> من قائمة المتصفح.</li>
      <li><strong>على نظام iOS (متصفح Safari):</strong> انقر على زر المشاركة في أسفل الشاشة، ثم اختر <em>"إضافة إلى الشاشة الرئيسية" (Add to Home Screen)</em>. سيظهر التطبيق على هاتفك بأيقونته الرسمية وسرعته الكاملة.</li>
    </ul>
  </div>

  <div style="margin-top: 30px; text-align: center; border-top: 1px solid #cbd5e1; padding-top: 15px; font-size: 8pt; color: #64748b; font-family: 'Cairo', sans-serif;">
    <strong>المكتب الأكاديمي والتقني لنادي كوانتا العلمي — QUANTA Scientific Club</strong><br>
    كلية العلوم · جامعة الجزائر 1 بن يوسف بن خدة · الجزائر العاصمة<br>
    البريد الرسمي: <span class="en-code">quantaclubdz@gmail.com</span> | الشؤون التنظيمية والـ HR: <span class="en-code">hr.quanta@univ-alger.dz</span>
  </div>

</body>
</html>
`;

const htmlFilePath = path.join(PUBLIC_DOCS_DIR, "QUANTERS_Platform_User_Manual.html");
const brainHtmlPath = path.join(ARTIFACTS_DIR, "QUANTERS_Platform_User_Manual.html");

fs.writeFileSync(htmlFilePath, html, "utf8");
fs.writeFileSync(brainHtmlPath, html, "utf8");

console.log(`✓ HTML Manual created successfully at: ${htmlFilePath}`);

console.log("Compiling LaTeX-styled PDF via Microsoft Edge headless with interactive PDF links...");

const pdfFilePath = path.join(PUBLIC_DOCS_DIR, "QUANTERS_Platform_User_Manual.pdf");
const brainPdfPath = path.join(ARTIFACTS_DIR, "QUANTERS_Platform_User_Manual.pdf");
const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

try {
  const edgeCmd = `"${edgePath}" --headless --disable-gpu --no-sandbox --no-pdf-header-footer --print-to-pdf="${pdfFilePath}" "file:///${htmlFilePath.replace(/\\\\/g, "/")}"`;
  execSync(edgeCmd, { stdio: "inherit" });

  if (fs.existsSync(pdfFilePath)) {
    fs.copyFileSync(pdfFilePath, brainPdfPath);
    const stats = fs.statSync(pdfFilePath);
    console.log(`\n======================================================`);
    console.log(`✓ COMPILATION COMPLETE: Publication-Grade PDF Generated!`);
    console.log(`  File Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`  PDF Location 1: ${pdfFilePath}`);
    console.log(`  PDF Location 2: ${brainPdfPath}`);
    console.log(`======================================================\n`);
  } else {
    console.error("PDF generation failed: Output file was not found.");
    process.exit(1);
  }
} catch (err) {
  console.error("Error executing Edge headless print-to-pdf:", err);
  process.exit(1);
}
