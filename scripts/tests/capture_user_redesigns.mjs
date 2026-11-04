import { chromium } from "playwright";
import http from "http";
import fs from "fs";
import path from "path";

const PORT = 4001;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const OUT_DIR = path.resolve("out");
const SCREENSHOT_DIR = path.resolve("docs/audit_screenshots");
const ARTIFACT_DIR = "C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193";

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff2": "font/woff2"
};

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let reqPath = req.url.split("?")[0];
      if (reqPath === "/") reqPath = "/index.html";

      let filePath = path.join(OUT_DIR, reqPath);
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        if (fs.existsSync(filePath + ".html")) {
          filePath = filePath + ".html";
        } else if (fs.existsSync(path.join(filePath, "index.html"))) {
          filePath = path.join(filePath, "index.html");
        } else {
          filePath = path.join(OUT_DIR, "index.html");
        }
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || "application/octet-stream";

      try {
        const data = fs.readFileSync(filePath);
        res.writeHead(200, {
          "Content-Type": contentType,
          "Access-Control-Allow-Origin": "*"
        });
        res.end(data);
      } catch (err) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
      }
    });

    server.listen(PORT, () => {
      resolve(server);
    });
  });
}

function copyToArtifacts(filename) {
  const src = path.join(SCREENSHOT_DIR, filename);
  const dest = path.join(ARTIFACT_DIR, filename);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
}

async function run() {
  console.log("Starting static server on port", PORT);
  const server = await startServer();

  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:\\Users\\hp\\AppData\\Local\\ms-playwright\\chromium-1200\\chrome-win64\\chrome.exe"
  });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // iPhone 14 / standard mobile viewport
    deviceScaleFactor: 2
  });

  // Inject session credentials so pages load fully
  await context.addInitScript(() => {
    try {
      localStorage.setItem("quanters_session_role", "admin");
      localStorage.setItem("quanters_active_admin_role", "Super Admin");
      localStorage.setItem("quanters_current_member_id", "mem-super-quanta");
      localStorage.setItem("quanters_is_admin", "true");
      const snapshot = {
        savedAt: new Date().toISOString(),
        isAuthenticated: true,
        currentMemberId: "mem-super-quanta",
        activeAdminRole: "Super Admin",
        members: [
          {
            id: "mem-super-quanta",
            quanterId: "QT-00-0000",
            handle: "@quanta_admin",
            email: "quantaclubdz@gmail.com",
            fullName: "Ayoub Sarri (QUANTA Admin)",
            roles: ["Super Admin", "Executive", "HR Head"],
            badgeIds: ["b-founding", "b-python-core"],
            isBureauMember: true,
            status: "Active",
            departmentId: "dept-it",
            teamId: "team-web",
            academicYear: "Master 2",
            xpSeason: 1250,
            xpTotal: 3400,
            level: 5,
            levelTitle: "Quantum Architect",
            workshopsCompletedCount: 4,
            projectsCompletedCount: 2,
            seniorityYears: 2,
            clubJoinYear: 2024,
            tenure: "Bureau Leadership (2026/2027)",
            hasLaptop: true,
            major: "Computer Science",
            university: "University of Algiers 1",
            onboardingTicks: {
              profileComplete: true,
              firstWorkshopAttended: true,
              firstTaskBeforeDay30: true,
              buddyAssigned: true
            }
          }
        ]
      };
      localStorage.setItem("quanters-offline-cache-v10", JSON.stringify(snapshot));
      localStorage.setItem("quanters_auth_user", JSON.stringify(snapshot.members[0]));
    } catch {}
  });

  const page = await context.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  async function captureCleanFullPage(filename) {
    await page.evaluate(() => {
      const nav = document.querySelector('nav[aria-label="Primary Mobile Navigation"]');
      if (nav) nav.style.display = 'none';
    });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, filename), fullPage: true });
    copyToArtifacts(filename);
    await page.evaluate(() => {
      const nav = document.querySelector('nav[aria-label="Primary Mobile Navigation"]');
      if (nav) nav.style.display = '';
    });
  }

  console.log("1. Capturing Home Page (Full Page)...");
  await page.goto(`${BASE_URL}/home`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("button, a", { timeout: 10000 });
  await page.waitForTimeout(800);
  await captureCleanFullPage("Home_FullPage.png");
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "Home_SplitQR_Activities.png"), fullPage: false });
  copyToArtifacts("Home_SplitQR_Activities.png");

  console.log("2. Capturing Profile Page (Full Page with Separated XP Box & Official Mascot)...");
  await page.goto(`${BASE_URL}/profile`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("button", { timeout: 15000 });
  await page.waitForTimeout(800);
  console.log("Profile URL after hydration:", page.url());
  await captureCleanFullPage("Profile_FullPage.png");
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "Profile_Decluttered.png"), fullPage: false });
  copyToArtifacts("Profile_Decluttered.png");

  console.log("3. Capturing Profile - Pause or Resign Membership Modal...");
  const membershipBtn = page.locator("button:has-text('Membership'), button:has-text('Resume (Paused)')").first();
  await membershipBtn.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await membershipBtn.click({ force: true });
  await page.waitForSelector("div.fixed.inset-0", { timeout: 5000 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "Profile_PauseResign_Modal.png") });
  copyToArtifacts("Profile_PauseResign_Modal.png");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);

  console.log("4. Capturing Profile - Confidential Grievance Modal...");
  const grievanceBtn = page.locator("button:has-text('Grievance')").first();
  await grievanceBtn.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await grievanceBtn.click({ force: true });
  await page.waitForSelector("div.fixed.inset-0", { timeout: 5000 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "Profile_Grievance_Modal.png") });
  copyToArtifacts("Profile_Grievance_Modal.png");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);

  console.log("5. Capturing Badges Page (Full Page)...");
  await page.goto(`${BASE_URL}/badges`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("button", { timeout: 10000 });
  await page.waitForTimeout(800);
  await captureCleanFullPage("Badges_FullPage.png");
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "Badges_UnifiedFilter.png"), fullPage: false });
  copyToArtifacts("Badges_UnifiedFilter.png");

  console.log("6. Capturing Explore Page (Full Page)...");
  await page.goto(`${BASE_URL}/explore`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("button", { timeout: 10000 });
  await page.waitForTimeout(800);
  await captureCleanFullPage("Explore_FullPage.png");
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "Explore_QuizClean.png"), fullPage: false });
  copyToArtifacts("Explore_QuizClean.png");

  console.log("7. Capturing Notifications Page (Full Page with Apple/Linear-Grade Tabs)...");
  await page.goto(`${BASE_URL}/notifications`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("button", { timeout: 10000 });
  await page.waitForTimeout(800);
  await captureCleanFullPage("Notifications_FullPage.png");
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "Notifications_Restructured.png"), fullPage: false });
  copyToArtifacts("Notifications_Restructured.png");

  console.log("8. Capturing Onboarding Page (Full Page)...");
  await page.goto(`${BASE_URL}/onboarding`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("button", { timeout: 10000 });
  await page.waitForTimeout(800);
  await captureCleanFullPage("Onboarding_FullPage.png");
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "Onboarding_StepClean.png"), fullPage: false });
  copyToArtifacts("Onboarding_StepClean.png");

  console.log("Screenshots captured successfully!");
  await browser.close();
  server.close();
}

run().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
