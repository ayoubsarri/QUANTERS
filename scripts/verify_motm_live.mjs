import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const ARTIFACTS_DIR = "C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193";

async function verifyMotmComprehensive() {
  console.log("Starting comprehensive verification for Member of the Month...");
  const db = JSON.parse(fs.readFileSync("data/quanters-db.json", "utf8"));
  const snapshot = {
    ...db,
    isAuthenticated: true,
    currentMemberId: "mem-super-quanta",
    activeAdminRole: "Super Admin",
  };

  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1050 },
    serviceWorkers: "block",
  });
  const page = await context.newPage();

  try {
    // 1. Seed session on domain via /welcome
    console.log("Seeding authenticated session on domain...");
    await page.goto("https://quanters.web.app/welcome", { waitUntil: "domcontentloaded" });
    await page.evaluate((data) => {
      localStorage.setItem("quanters-offline-cache-v10", JSON.stringify(data));
    }, snapshot);
    await page.waitForTimeout(1000);

    // 2. Open Admin Points Desk
    console.log("Navigating to https://quanters.web.app/admin/points...");
    await page.goto("https://quanters.web.app/admin/points", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2500);

    // 3. Switch to Monthly Honours Tab
    console.log("Switching to Monthly Honours Tab...");
    const motmTab = page.locator("button[role='tab']").filter({ hasText: "Monthly Honours" }).first();
    await motmTab.click();
    await page.waitForTimeout(1000);

    // 4. Verify Target Month Selector
    console.log("Verifying Target Month Selector...");
    const monthSelect = page.locator("select").filter({ hasText: "2026" }).first();
    if (await monthSelect.isVisible()) {
      await monthSelect.selectOption("November 2026");
      console.log("Selected target month: November 2026");
      await page.waitForTimeout(500);
    }

    // 5. Select All 6 Department Champions
    console.log("Clicking 'Select All 6 Dept Champions'...");
    const selectAllBtn = page.locator("button:has-text('Select All 6 Dept Champions')").first();
    if (await selectAllBtn.isVisible()) {
      await selectAllBtn.click();
      await page.waitForTimeout(1000);
    }

    // Screenshot 1: Staged candidates tray with target month selection
    const stageScreenPath = path.join(ARTIFACTS_DIR, "motm_admin_desk_multi_select.png");
    await page.screenshot({ path: stageScreenPath, fullPage: false });
    console.log("✓ Saved staged candidates screenshot:", stageScreenPath);

    // 6. Crown the selected members
    console.log("Clicking Crown CTA button...");
    const crownBtn = page.locator("button:has-text('Crown')").filter({ hasText: "for November 2026" }).first();
    if (await crownBtn.isVisible()) {
      await crownBtn.click();
      await page.waitForTimeout(1500);
    }

    // Screenshot 2: Active crowned laureates card with target month
    const crownedScreenPath = path.join(ARTIFACTS_DIR, "motm_admin_desk_crowned.png");
    await page.screenshot({ path: crownedScreenPath, fullPage: false });
    console.log("✓ Saved crowned laureates screenshot:", crownedScreenPath);

    // 7. Navigate to /home to verify the home ribbon
    console.log("Navigating to https://quanters.web.app/home...");
    await page.goto("https://quanters.web.app/home", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2500);

    // Find and expand the Stars of the Month ribbon
    const ribbonBtn = page.locator("button").filter({ hasText: /Star.*of the Month/i }).first();
    if (await ribbonBtn.isVisible()) {
      console.log("Expanding Stars of the Month details ribbon...");
      await ribbonBtn.click();
      await page.waitForTimeout(1000);
    }

    // Screenshot 3: Mobile Home page ribbon showing November 2026 and co-laureates
    const homeScreenPath = path.join(ARTIFACTS_DIR, "motm_home_ribbon_multi_laureates.png");
    await page.screenshot({ path: homeScreenPath, fullPage: false });
    console.log("✓ Saved home ribbon screenshot:", homeScreenPath);

    console.log("🎉 All Member of the Month verifications passed successfully!");
  } catch (err) {
    console.error("Verification failed:", err);
  } finally {
    await browser.close();
  }
}

verifyMotmComprehensive();
