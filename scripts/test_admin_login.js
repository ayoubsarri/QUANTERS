import { chromium } from "playwright";

async function testWithBypassSW() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  // Block service workers so it always loads fresh production assets
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    serviceWorkers: "block",
  });

  await context.addInitScript(() => {
    // Clear any old caches
    if (window.caches) {
      caches.keys().then((names) => names.forEach((n) => caches.delete(n)));
    }
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
      badgeIds: ["b1", "b2"],
      xpTotal: 250,
      xpSeason: 250,
      xpMonth: 250,
      level: 1,
      attendanceRate: 100,
      onTimeTaskRate: 100,
      workshopsCompletedCount: 3,
      projectsCompletedCount: 1,
      onboardingTicks: { profileComplete: true, buddyAssigned: true, firstTaskBeforeDay30: true, firstWorkshopAttended: true }
    };
    const cache = {
      isAuthenticated: true,
      currentMemberId: "mem-super-quanta",
      activeAdminRole: "Super Admin",
      members: [superMember]
    };
    window.localStorage.setItem("quanters-offline-cache-v10", JSON.stringify(cache));
    window.localStorage.setItem("quanters_app_installed", "false");
  });

  const page = await context.newPage();

  console.log("Navigating to /admin/stats (Service Worker Blocked)...");
  await page.goto("https://quanters.web.app/admin/stats?t=" + Date.now(), { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3500);
  await page.screenshot({ path: "C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193/verify_admin_stats_rebuilt.png" });
  console.log("Saved stats screenshot!");

  console.log("Navigating to /admin/explore (Service Worker Blocked)...");
  await page.goto("https://quanters.web.app/admin/explore?t=" + Date.now(), { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  const pubBtn = page.locator('button:has-text("Publish Article")').first();
  if (await pubBtn.isVisible()) {
    await pubBtn.click();
    await page.waitForTimeout(1000);
  }
  await page.screenshot({ path: "C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193/verify_admin_explore_modal.png" });
  console.log("Saved explore screenshot!");

  // Mobile tests
  await page.setViewportSize({ width: 390, height: 844 });
  console.log("Navigating to mobile /home (Service Worker Blocked)...");
  await page.goto("https://quanters.web.app/home?t=" + Date.now(), { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193/verify_mobile_home_install.png" });

  console.log("Navigating to mobile /profile (Service Worker Blocked)...");
  await page.goto("https://quanters.web.app/profile?t=" + Date.now(), { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193/verify_mobile_profile_quote.png" });

  console.log("Navigating to mobile /notifications (Service Worker Blocked)...");
  await page.goto("https://quanters.web.app/notifications?t=" + Date.now(), { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193/verify_mobile_notifications_clean.png" });

  await browser.close();
  console.log("All fresh screenshots saved!");
}

testWithBypassSW().catch(console.error);
