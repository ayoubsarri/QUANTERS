import { chromium } from "playwright";
import path from "path";

const ARTIFACTS_DIR = "C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193";

async function snapStats() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    serviceWorkers: "block",
  });

  await context.addInitScript(() => {
    const superMember = {
      id: "mem-super-quanta",
      quanterId: "QT-00-0000",
      handle: "@quanta_admin",
      email: "quantaclubdz@gmail.com",
      fullName: "QUANTA Super Admin",
      roles: ["Super Admin", "Executive", "HR Head"],
      isBureauMember: true,
      status: "Active",
      departmentId: "dept-it",
      badgeIds: [],
      xpTotal: 250,
      xpSeason: 250,
      xpMonth: 250,
      level: 1,
      skills: ["Executive Strategy"],
    };
    window.localStorage.setItem("quanters_perm_asked_v1", "true");
    window.localStorage.setItem(
      "quanters-offline-cache-v10",
      JSON.stringify({
        isAuthenticated: true,
        currentMemberId: superMember.id,
        activeAdminRole: "Super Admin",
        members: [superMember],
      })
    );
  });

  const page = await context.newPage();
  console.log("Navigating to https://quanters.web.app/admin/stats ...");
  await page.goto("https://quanters.web.app/admin/stats", { waitUntil: "domcontentloaded", timeout: 15000 });
  await page.waitForTimeout(2000);

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, "verify_admin_stats_no_emojis.png"), fullPage: false });
  console.log("Saved verify_admin_stats_no_emojis.png");

  // Also snapshot settings
  await page.goto("https://quanters.web.app/admin/settings", { waitUntil: "domcontentloaded", timeout: 15000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, "verify_admin_settings_clean.png"), fullPage: false });
  console.log("Saved verify_admin_settings_clean.png");

  await browser.close();
}

snapStats().catch(console.error);
