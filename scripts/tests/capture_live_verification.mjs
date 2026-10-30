import { chromium } from "playwright";
import path from "path";

async function captureLiveVerification() {
  console.log("=== CAPTURING LIVE PRODUCTION SCREENSHOTS ===");

  let browser;
  try {
    browser = await chromium.launch({ channel: "chrome", headless: true });
  } catch {
    browser = await chromium.launch({ headless: true });
  }

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // iPhone 14 / Mobile standard viewport
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1",
  });
  const page = await context.newPage();

  // 1. Welcome screen
  console.log("Navigating to https://quanters.web.app/welcome...");
  await page.goto("https://quanters.web.app/welcome", { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(3000);
  const welcomeShot = "C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193/verify_live_welcome_hardened.png";
  await page.screenshot({ path: welcomeShot });
  console.log("Saved screenshot:", welcomeShot);

  // 2. Workshops screen
  console.log("Navigating to https://quanters.web.app/workshops...");
  await page.goto("https://quanters.web.app/workshops", { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(3000);
  const workshopsShot = "C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193/verify_live_workshops_hardened.png";
  await page.screenshot({ path: workshopsShot });
  console.log("Saved screenshot:", workshopsShot);

  // 3. Desktop Admin Overview screen
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const desktopPage = await desktopContext.newPage();
  console.log("Navigating to desktop admin overview...");
  await desktopPage.goto("https://quanters.web.app/admin/overview", { waitUntil: "domcontentloaded", timeout: 45000 });
  await desktopPage.waitForTimeout(3000);
  const adminShot = "C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193/verify_live_admin_overview_hardened.png";
  await desktopPage.screenshot({ path: adminShot });
  console.log("Saved screenshot:", adminShot);

  await browser.close();
  console.log("✔ ALL VERIFICATION SCREENSHOTS CAPTURED!");
}

captureLiveVerification().catch((err) => {
  console.error("Screenshot capture error:", err);
  process.exit(1);
});
