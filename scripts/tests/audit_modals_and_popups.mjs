import { chromium } from "playwright";
import http from "http";
import fs from "fs";
import path from "path";

const PORT = 4000;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const OUT_DIR = path.resolve("out");
const SCREENSHOT_DIR = path.resolve("docs/audit_screenshots");

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
  ".mp4": "video/mp4",
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

    server.listen(PORT, "127.0.0.1", () => {
      console.log(`[MODAL AUDIT SERVER] Serving out/ at ${BASE_URL}`);
      resolve(server);
    });
  });
}

const AUTH_INIT_SCRIPT = () => {
  try {
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
          academicYear: "Master 2",
          xpSeason: 1250,
          xpTotal: 3400,
          level: 5,
          levelTitle: "Quantum Architect",
          onboardingTicks: {
            profileComplete: true,
            firstWorkshopAttended: true,
            firstTaskBeforeDay30: true,
            buddyAssigned: true
          }
        }
      ]
    };
    window.localStorage.setItem("quanters-offline-cache-v10", JSON.stringify(snapshot));
    window.localStorage.setItem("quanters_auth_user", JSON.stringify(snapshot.members[0]));
    window.localStorage.setItem("quanters_is_admin", "true");
  } catch (e) {}
};

async function auditModals() {
  console.log("\n=============================================================");
  console.log("  QUANTERS ELITE PROTOCOL: AUDITING EVERY SINGLE MODAL & TAB");
  console.log("=============================================================\n");

  const server = await startServer();
  const browser = await chromium.launch({ channel: "chrome", headless: true });

  const modalAudits = [
    {
      name: "Admin_Members_AddModal",
      url: `${BASE_URL}/admin/members`,
      triggerSelector: "button:has-text('Add Member')",
      modalSelector: "div.fixed.inset-0",
      viewport: { width: 1440, height: 900, isMobile: false }
    },
    {
      name: "Admin_Explore_ArticleModal",
      url: `${BASE_URL}/admin/explore`,
      triggerSelector: "button:has-text('Create Explore Post')",
      modalSelector: "div.fixed.inset-0",
      viewport: { width: 1440, height: 900, isMobile: false }
    },
    {
      name: "Admin_Badges_CreateBadgeModal",
      url: `${BASE_URL}/admin/badges`,
      triggerSelector: "button:has-text('Create Badge')",
      modalSelector: "div.fixed.inset-0",
      viewport: { width: 1440, height: 900, isMobile: false }
    },
    {
      name: "Admin_Workshops_CreateModal",
      url: `${BASE_URL}/admin/workshops`,
      triggerSelector: "button:has-text('New Workshop')",
      modalSelector: "div.fixed.inset-0",
      viewport: { width: 1440, height: 900, isMobile: false }
    },
    {
      name: "Admin_Tasks_CreateModal",
      url: `${BASE_URL}/admin/tasks`,
      triggerSelector: "button:has-text('New Task')",
      modalSelector: "div.fixed.inset-0",
      viewport: { width: 1440, height: 900, isMobile: false }
    },
    {
      name: "Admin_Points_ManualAwardModal",
      url: `${BASE_URL}/admin/points`,
      triggerSelector: "button:has-text('Manual Entry')",
      modalSelector: "div.fixed.inset-0",
      viewport: { width: 1440, height: 900, isMobile: false }
    },
    {
      name: "Admin_Access_GrantModal",
      url: `${BASE_URL}/admin/access`,
      triggerSelector: "button:has-text('Grant Role')",
      modalSelector: "div.fixed.inset-0",
      viewport: { width: 1440, height: 900, isMobile: false }
    },
    {
      name: "Admin_Org_BureauModal",
      url: `${BASE_URL}/admin/org`,
      triggerSelector: "button:has-text('Change Officers'), button:has-text('Change Executive')",
      modalSelector: "div.fixed.inset-0",
      viewport: { width: 1440, height: 900, isMobile: false }
    },
    {
      name: "Member_Profile_PasswordModal",
      url: `${BASE_URL}/profile`,
      triggerSelector: "button:has-text('Password'), button:has-text('Change Password')",
      modalSelector: "div.fixed.inset-0",
      viewport: { width: 390, height: 844, isMobile: true }
    }
  ];

  const results = [];

  for (const item of modalAudits) {
    console.log(`Auditing Modal: ${item.name}...`);
    const context = await browser.newContext({
      viewport: item.viewport,
      isMobile: item.viewport.isMobile,
      hasTouch: item.viewport.isMobile,
      deviceScaleFactor: 2
    });

    await context.addInitScript(AUTH_INIT_SCRIPT);
    const page = await context.newPage();

    try {
      await page.goto(item.url, { waitUntil: "commit", timeout: 8000 });
      await page.waitForTimeout(1000);

      // Attempt to find and click trigger
      const triggers = item.triggerSelector.split(",").map((s) => s.trim());
      let clicked = false;
      for (const sel of triggers) {
        const btn = page.locator(sel).first();
        if ((await btn.count()) > 0 && (await btn.isVisible())) {
          await btn.click();
          clicked = true;
          break;
        }
      }

      await page.waitForTimeout(500);

      const modal = page.locator(item.modalSelector).first();
      const isVisible = (await modal.count()) > 0 && (await modal.isVisible());

      const screenshotPath = path.join(SCREENSHOT_DIR, `${item.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });

      let escapeWorks = false;
      if (isVisible) {
        await page.keyboard.press("Escape");
        await page.waitForTimeout(300);
        escapeWorks = !(await modal.isVisible());
      }

      results.push({
        modal: item.name,
        triggerClicked: clicked,
        modalOpened: isVisible,
        escapeDismissed: escapeWorks,
        screenshot: screenshotPath
      });

      console.log(`  ✓ ${item.name}: Opened=${isVisible}, EscapeDismissed=${escapeWorks}`);
    } catch (err) {
      console.log(`  ⚠ ${item.name} check failed: ${err.message}`);
      results.push({
        modal: item.name,
        error: err.message
      });
    } finally {
      await context.close();
    }
  }

  await browser.close();
  server.close();

  fs.writeFileSync(
    path.resolve("docs/modal_audit_results.json"),
    JSON.stringify(results, null, 2),
    "utf8"
  );
  console.log("\n[AUDIT COMPLETE] Results saved to docs/modal_audit_results.json\n");
}

auditModals().catch((e) => {
  console.error("FATAL AUDIT ERROR:", e);
  process.exit(1);
});
