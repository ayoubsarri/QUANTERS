import { chromium } from "playwright";

async function run() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  console.log("Navigating to https://quanters.web.app/admin/alumni...");
  await page.goto("https://quanters.web.app/admin/alumni", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193/verify_admin_alumni_live.png", fullPage: true });
  console.log("Captured verify_admin_alumni_live.png");

  console.log("Navigating to https://quanters.web.app/admin/stats...");
  await page.goto("https://quanters.web.app/admin/stats", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193/verify_admin_stats_live.png", fullPage: true });
  console.log("Captured verify_admin_stats_live.png");

  console.log("Navigating to https://quanters.web.app/admin/org...");
  await page.goto("https://quanters.web.app/admin/org", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193/verify_admin_org_live.png" });
  console.log("Captured verify_admin_org_live.png");

  // Mobile viewport test
  const mobileContext = await browser.newContext({ viewport: { width: 420, height: 890 } });
  const mobilePage = await mobileContext.newPage();

  console.log("Navigating to mobile workshops...");
  await mobilePage.goto("https://quanters.web.app/workshops", { waitUntil: "domcontentloaded" });
  await mobilePage.waitForTimeout(2000);
  await mobilePage.screenshot({ path: "C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193/verify_mobile_workshops_mascot.png" });
  console.log("Captured verify_mobile_workshops_mascot.png");

  console.log("Navigating to mobile badges...");
  await mobilePage.goto("https://quanters.web.app/badges", { waitUntil: "domcontentloaded" });
  await mobilePage.waitForTimeout(2000);
  await mobilePage.screenshot({ path: "C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193/verify_mobile_badges_mascot.png" });
  console.log("Captured verify_mobile_badges_mascot.png");

  console.log("Navigating to mobile explore...");
  await mobilePage.goto("https://quanters.web.app/explore", { waitUntil: "domcontentloaded" });
  await mobilePage.waitForTimeout(2000);
  await mobilePage.screenshot({ path: "C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193/verify_mobile_explore_tabs.png" });
  console.log("Captured verify_mobile_explore_tabs.png");

  console.log("Navigating to welcome with deactivated flag...");
  await mobilePage.goto("https://quanters.web.app/welcome?deactivated=true", { waitUntil: "domcontentloaded" });
  await mobilePage.waitForTimeout(2000);
  await mobilePage.screenshot({ path: "C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193/verify_account_deleted_screen.png" });
  console.log("Captured verify_account_deleted_screen.png");

  await browser.close();
  console.log("All screenshots verified successfully!");
}

run().catch(console.error);
