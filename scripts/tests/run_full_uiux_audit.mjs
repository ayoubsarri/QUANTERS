import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const ARTIFACT_DIR = "C:/Users/hp/.gemini/antigravity/brain/b184cbdc-5da7-4409-aa6c-78830a44303f";
const CALLER_DIR = "C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193";
const BASE_URL = "https://quanters.web.app";

const SUPER_ADMIN = {
  id: "mem-super-quanta",
  quanterId: "QT-00-0000",
  handle: "@quanta_admin",
  email: "quantaclubdz@gmail.com",
  fullName: "QUANTA Super Admin",
  university: "University of Algiers 1",
  major: "Computer Science",
  departmentId: "dept-it",
  roles: ["Super Admin", "Executive", "HR Head"],
  status: "Active",
  level: 1,
  levelTitle: "Quanta Initiate",
  xpSeason: 1250,
  xpTotal: 2500,
  badgeIds: ["bdg-react", "bdg-python"],
  onboardingTicks: { profileComplete: true, hrApproved: true },
};

const PENDING_MEMBER = {
  id: "mem-pending-01",
  quanterId: "QT-26-Pending",
  handle: "@candidate_sam",
  email: "candidate@univ-alger.dz",
  fullName: "Sami Benali",
  university: "University of Algiers 1",
  major: "Computer Science (L3)",
  departmentId: "dept-it",
  roles: ["Member"],
  status: "Pending",
  level: 1,
  levelTitle: "Applicant",
  xpSeason: 0,
  xpTotal: 0,
  badgeIds: [],
  onboardingTicks: { profileComplete: true, hrApproved: false },
};

function createOfflineCache(member, isAdmin = false) {
  return {
    isAuthenticated: true,
    currentMemberId: member.id,
    activeAdminRole: isAdmin ? "Super Admin" : "Member",
    members: [member],
    settings: {
      onboardingAutoApprove: false,
    },
    workshops: [
      {
        id: "ws-ai-science",
        title: "AI in Scientific Research & Discovery",
        summary: "Leveraging deep learning for structural genomics and materials discovery.",
        category: "Scientific Activity",
        level: "Advanced",
        status: "Upcoming",
        seatsTotal: 40,
        registeredCount: 28,
        dateTimeIso: "2026-11-15T14:00:00Z",
        location: "Auditorium Ibn Khaldoun, Faculty of Sciences",
        instructorName: "Dr. A. Sarri",
      },
      {
        id: "ws-quantum",
        title: "Quantum Computing Foundations",
        summary: "Hands-on quantum state manipulation with Qiskit.",
        category: "Lab Session",
        level: "Intermediate",
        status: "Completed",
        seatsTotal: 25,
        registeredCount: 25,
        dateTimeIso: "2026-10-10T10:00:00Z",
        location: "Computing Lab 4B",
        instructorName: "Prof. K. Mansour",
      }
    ],
    badges: [
      {
        id: "bdg-react",
        title: "Next.js & React Core",
        description: "Mastery of Server Components and client state architecture.",
        category: "Technical Skills",
        level: "Master",
        awardedCount: 14,
        unlocked: true,
      },
      {
        id: "bdg-python",
        title: "Scientific Python & NumPy",
        description: "Vectorized numerical simulation and data analysis.",
        category: "Core Scientific",
        level: "Specialist",
        awardedCount: 22,
        unlocked: true,
      },
      {
        id: "bdg-quantum",
        title: "Quantum Algorithms",
        description: "Shor and Grover algorithm implementation.",
        category: "Core Scientific",
        level: "Master",
        awardedCount: 5,
        unlocked: false,
      }
    ],
  };
}

async function runAudit() {
  console.log("=== STARTING EXHAUSTIVE UI/UX & MICRO-TYPOGRAPHIC AUDIT ===");

  let browser;
  try {
    browser = await chromium.launch({ channel: "chrome", headless: true });
  } catch {
    browser = await chromium.launch({ headless: true });
  }

  const auditResults = {
    viewports: {},
    mascots: {},
    institutionalLockups: {},
    typography: {},
    directionality: {},
    modalsAndA11y: {},
    touchTargets: [],
    overflows: [],
  };

  // Helper to save screenshots in both dirs
  async function saveScreenshot(page, filename) {
    const p1 = path.join(ARTIFACT_DIR, filename);
    const p2 = path.join(CALLER_DIR, filename);
    await page.screenshot({ path: p1, fullPage: false });
    try {
      fs.copyFileSync(p1, p2);
    } catch {}
    console.log(`[Screenshot Saved] ${filename}`);
  }

  // Viewports to test
  const testConfigs = [
    { name: "iPhone 14 (390x844)", width: 390, height: 844, isMobile: true },
    { name: "Pixel 7 (412x915)", width: 412, height: 915, isMobile: true },
    { name: "Desktop (1440x900)", width: 1440, height: 900, isMobile: false },
  ];

  for (const config of testConfigs) {
    console.log(`\n--- Testing Viewport: ${config.name} ---`);
    const context = await browser.newContext({
      viewport: { width: config.width, height: config.height },
      userAgent: config.isMobile
        ? "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148"
        : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });

    const page = await context.newPage();

    // 1. Welcome Page (Guest LTR)
    await page.goto(`${BASE_URL}/welcome`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(2500);

    const prefix = config.name.split(" ")[0].toLowerCase();
    await saveScreenshot(page, `audit_${prefix}_welcome_ltr.png`);

    // Measure horizontal overflow
    const welcomeOverflow = await page.evaluate(() => {
      const docW = document.documentElement.scrollWidth;
      const winW = window.innerWidth;
      const overflowingElements = [];
      document.querySelectorAll("*").forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.right > winW + 1.5 && rect.width > 0) {
          overflowingElements.push({
            tag: el.tagName,
            cls: el.className ? String(el.className).slice(0, 50) : "",
            right: rect.right,
            width: rect.width,
          });
        }
      });
      return { docW, winW, hasOverflow: docW > winW + 1, overflowingElements: overflowingElements.slice(0, 5) };
    });

    // Check touch targets on welcome
    const welcomeTouchTargets = await page.evaluate(() => {
      const smallTargets = [];
      document.querySelectorAll("button, a, input, select").forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          if (rect.width < 44 || rect.height < 44) {
            smallTargets.push({
              tag: el.tagName,
              text: (el.innerText || el.getAttribute("aria-label") || "").trim().slice(0, 30),
              width: Math.round(rect.width),
              height: Math.round(rect.height),
              cls: el.className ? String(el.className).slice(0, 40) : "",
            });
          }
        }
      });
      return smallTargets;
    });

    auditResults.viewports[`${config.name}_welcome`] = {
      overflow: welcomeOverflow,
      touchTargetsCount: welcomeTouchTargets.length,
      sampleSmallTouchTargets: welcomeTouchTargets.slice(0, 6),
    };

    // 2. Account Deleted Modal (/welcome?deactivated=true)
    await page.goto(`${BASE_URL}/welcome?deactivated=true`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(2000);
    await saveScreenshot(page, `audit_${prefix}_modal_account_deleted.png`);

    // Verify mascot_account_deleted.png
    const mascotDeletedAudit = await page.evaluate(() => {
      const img = document.querySelector('img[src*="mascot_account_deleted"]');
      if (!img) return { found: false };
      const rect = img.getBoundingClientRect();
      const style = window.getComputedStyle(img);
      return {
        found: true,
        src: img.src,
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        renderedWidth: rect.width,
        renderedHeight: rect.height,
        aspectRatio: (img.naturalWidth / img.naturalHeight).toFixed(3),
        objectFit: style.objectFit,
      };
    });
    auditResults.mascots.accountDeleted = mascotDeletedAudit;

    // 3. Authenticated Member View (Workshops, Badges, Profile)
    // Inject authenticated offline cache
    const authContext = await browser.newContext({
      viewport: { width: config.width, height: config.height },
    });
    const authPage = await authContext.newPage();

    await authPage.addInitScript(({ cache, lang }) => {
      window.localStorage.setItem("quanters-offline-cache-v10", JSON.stringify(cache));
      window.localStorage.setItem("quanters_lang", lang);
    }, { cache: createOfflineCache(SUPER_ADMIN, !config.isMobile), lang: "en" });

    // Navigate to /workshops
    await authPage.goto(`${BASE_URL}/workshops`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await authPage.waitForTimeout(2500);
    await saveScreenshot(authPage, `audit_${prefix}_workshops_ltr.png`);

    // Audit Workshops mascot & text contrast
    const workshopsMascotAudit = await authPage.evaluate(() => {
      const img = document.querySelector('img[src*="mascot_workshops"]');
      if (!img) return { found: false };
      const rect = img.getBoundingClientRect();
      const hero = img.closest('.relative');
      const heroRect = hero ? hero.getBoundingClientRect() : null;
      const textContainer = hero ? hero.querySelector('.z-10') : null;
      const textRect = textContainer ? textContainer.getBoundingClientRect() : null;
      const style = window.getComputedStyle(img);

      return {
        found: true,
        src: img.src,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        renderedWidth: rect.width,
        renderedHeight: rect.height,
        objectFit: style.objectFit,
        objectPosition: style.objectPosition,
        heroWidth: heroRect?.width,
        textWidth: textRect?.width,
        textMaxWidthPercent: textRect && heroRect ? (textRect.width / heroRect.width * 100).toFixed(1) : null,
        mascotOnRight: rect.right >= (heroRect?.right || 0) - 2,
      };
    });
    auditResults.mascots[`workshops_${prefix}`] = workshopsMascotAudit;

    // Navigate to /badges
    await authPage.goto(`${BASE_URL}/badges`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await authPage.waitForTimeout(2500);
    await saveScreenshot(authPage, `audit_${prefix}_badges_ltr.png`);

    const badgesMascotAudit = await authPage.evaluate(() => {
      const img = document.querySelector('img[src*="mascot_badges"]');
      if (!img) return { found: false };
      const rect = img.getBoundingClientRect();
      const style = window.getComputedStyle(img);
      return {
        found: true,
        src: img.src,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        renderedWidth: rect.width,
        renderedHeight: rect.height,
        objectFit: style.objectFit,
        objectPosition: style.objectPosition,
      };
    });
    auditResults.mascots[`badges_${prefix}`] = badgesMascotAudit;

    // Navigate to /profile
    await authPage.goto(`${BASE_URL}/profile`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await authPage.waitForTimeout(2500);
    await saveScreenshot(authPage, `audit_${prefix}_profile_ltr.png`);

    const profileMascotAudit = await authPage.evaluate(() => {
      const img = document.querySelector('img[src*="mascot_profile"]');
      if (!img) return { found: false };
      const rect = img.getBoundingClientRect();
      const style = window.getComputedStyle(img);
      return {
        found: true,
        src: img.src,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        renderedWidth: rect.width,
        renderedHeight: rect.height,
        objectFit: style.objectFit,
        objectPosition: style.objectPosition,
      };
    });
    auditResults.mascots[`profile_${prefix}`] = profileMascotAudit;

    // 4. Pending Member -> Waiting for Approval Screen
    const pendingContext = await browser.newContext({
      viewport: { width: config.width, height: config.height },
    });
    const pendingPage = await pendingContext.newPage();
    await pendingPage.addInitScript(({ cache, lang }) => {
      window.localStorage.setItem("quanters-offline-cache-v10", JSON.stringify(cache));
      window.localStorage.setItem("quanters_lang", lang);
    }, { cache: createOfflineCache(PENDING_MEMBER, false), lang: "en" });

    await pendingPage.goto(`${BASE_URL}/home`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await pendingPage.waitForTimeout(2500);
    await saveScreenshot(pendingPage, `audit_${prefix}_waiting_screen.png`);

    const waitingMascotAudit = await pendingPage.evaluate(() => {
      const bgImg = document.querySelector('img[src*="hr_waiting_cosmic_bg"]');
      return {
        bgImgFound: Boolean(bgImg),
        bgSrc: bgImg?.src,
        complete: bgImg?.complete,
        naturalWidth: bgImg?.naturalWidth,
        naturalHeight: bgImg?.naturalHeight,
      };
    });
    auditResults.mascots[`waiting_${prefix}`] = waitingMascotAudit;

    // 5. Arabic RTL Mode Verification
    const arContext = await browser.newContext({
      viewport: { width: config.width, height: config.height },
    });
    const arPage = await arContext.newPage();
    await arPage.addInitScript(({ cache, lang }) => {
      window.localStorage.setItem("quanters-offline-cache-v10", JSON.stringify(cache));
      window.localStorage.setItem("quanters_lang", lang);
      document.documentElement.dir = "rtl";
      document.documentElement.lang = "ar";
    }, { cache: createOfflineCache(SUPER_ADMIN, !config.isMobile), lang: "ar" });

    await arPage.goto(`${BASE_URL}/workshops`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await arPage.waitForTimeout(2500);
    await saveScreenshot(arPage, `audit_${prefix}_workshops_rtl_arabic.png`);

    // Audit Arabic typography and directionality
    const arTypographyAudit = await arPage.evaluate(() => {
      const dir = document.documentElement.dir;
      const lang = document.documentElement.lang;
      const h1 = document.querySelector("h1");
      const h1Font = h1 ? window.getComputedStyle(h1).fontFamily : "";
      const body = document.body;
      const bodyFont = window.getComputedStyle(body).fontFamily;
      const letterSpacing = h1 ? window.getComputedStyle(h1).letterSpacing : "";

      // Check arrows mirroring
      const arrows = [];
      document.querySelectorAll("svg").forEach((s) => {
        const cls = String(s.className || "");
        if (cls.includes("rotate-180") || cls.includes("scale-x-[-1]")) {
          arrows.push({ cls, tag: "svg" });
        }
      });

      return {
        dir,
        lang,
        h1Font,
        bodyFont,
        letterSpacing,
        mirroredIconsFound: arrows.length,
      };
    });
    auditResults.typography[`${prefix}_arabic`] = arTypographyAudit;

    // 6. Desktop Specific Tests (1440x900)
    if (!config.isMobile) {
      console.log("--- Running Desktop Admin Overview & Institutional Lockup Audits ---");
      await authPage.goto(`${BASE_URL}/admin/overview`, { waitUntil: "domcontentloaded", timeout: 45000 });
      await authPage.waitForTimeout(2500);
      await saveScreenshot(authPage, `audit_desktop_admin_overview.png`);

      // Audit Institutional Lockup in Admin Overview and Sidebar
      const lockupAudit = await authPage.evaluate(() => {
        const asset2Imgs = Array.from(document.querySelectorAll('img[src*="univ_quanta_asset2.png"]'));
        const whiteLogoImgs = Array.from(document.querySelectorAll('img[src*="QUANTERS_white_logo.svg"]'));
        const oldLogos = Array.from(document.querySelectorAll('img[src*="univ_logo.svg"], img[src*="univ_logo_d.svg"], img[src*="univ_logo_darkmode.svg"]'));

        return {
          asset2Count: asset2Imgs.length,
          asset2Valid: asset2Imgs.every(i => i.complete && i.naturalWidth > 0),
          whiteLogoCount: whiteLogoImgs.length,
          whiteLogoValid: whiteLogoImgs.every(i => i.complete && i.naturalWidth > 0),
          oldLogosCount: oldLogos.length,
        };
      });
      auditResults.institutionalLockups.desktop = lockupAudit;

      // Audit Admin Data Tables & Sidebar layout
      const desktopLayoutAudit = await authPage.evaluate(() => {
        const sidebar = document.querySelector("aside");
        const sidebarRect = sidebar ? sidebar.getBoundingClientRect() : null;
        const main = document.querySelector("main");
        const mainRect = main ? main.getBoundingClientRect() : null;
        const tables = Array.from(document.querySelectorAll("table"));

        return {
          sidebarPresent: Boolean(sidebar),
          sidebarWidth: sidebarRect?.width,
          mainPresent: Boolean(main),
          mainLeft: mainRect?.left,
          tablesFound: tables.length,
        };
      });
      auditResults.viewports.desktopLayout = desktopLayoutAudit;

      // Navigate to /admin/members
      await authPage.goto(`${BASE_URL}/admin/members`, { waitUntil: "domcontentloaded", timeout: 45000 });
      await authPage.waitForTimeout(2500);
      await saveScreenshot(authPage, `audit_desktop_admin_members_table.png`);
    }

    await context.close();
    await authContext.close();
    await pendingContext.close();
    await arContext.close();
  }

  await browser.close();

  // Save JSON report of raw audit measurements
  const reportPath = path.join(ARTIFACT_DIR, "ui_ux_audit_measurements.json");
  fs.writeFileSync(reportPath, JSON.stringify(auditResults, null, 2), "utf-8");
  try {
    fs.copyFileSync(reportPath, path.join(CALLER_DIR, "ui_ux_audit_measurements.json"));
  } catch {}

  console.log("✔ AUDIT SCRIPT COMPLETED! Results saved to:", reportPath);
  console.log(JSON.stringify(auditResults, null, 2));
}

runAudit().catch((err) => {
  console.error("Audit script failed:", err);
  process.exit(1);
});
