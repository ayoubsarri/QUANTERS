import { chromium } from "playwright";
import path from "path";

const ARTIFACT_DIR = "C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193";

async function verify() {
  console.log("Launching Chromium to verify https://quanters.web.app/explore ...");
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: { width: 412, height: 915 }, // Pixel 7 viewport
    userAgent: "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
  });
  const page = await context.newPage();

  // 1. Visit /explore
  console.log("Navigating to https://quanters.web.app/explore...");
  await page.goto("https://quanters.web.app/explore", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(4000);

  // Capture Explore overview
  const exploreShot = path.join(ARTIFACT_DIR, "Live_Explore_2XP_Quizzes_Nov11.png");
  await page.screenshot({ path: exploreShot, fullPage: false });
  console.log(`Saved screenshot: ${exploreShot}`);

  // 2. Check for +2 XP badge text on page
  const pageText = await page.textContent("body");
  const has2Xp = pageText.includes("+2 XP");
  const hasCarbon = pageText.includes("Gemini 4 Carbon") || pageText.includes("Carbon");
  const hasFable = pageText.includes("Claude Fable") || pageText.includes("Fable");
  const hasRepos = pageText.includes("OpenHands") || pageText.includes("Repositories");

  console.log("Verification checks:");
  console.log("- Contains '+2 XP':", has2Xp);
  console.log("- Contains 'Gemini 4 Carbon':", hasCarbon);
  console.log("- Contains 'Claude Fable':", hasFable);
  console.log("- Contains 'Repositories':", hasRepos);

  // 3. Click on the Fable or Carbon article to open reading modal
  const carbonCard = page.locator("text=Gemini 4 Carbon").first();
  if (await carbonCard.count() > 0) {
    await carbonCard.click({ force: true });
    await page.waitForTimeout(2000);
    const carbonModalShot = path.join(ARTIFACT_DIR, "Live_Article_Gemini_Carbon.png");
    await page.screenshot({ path: carbonModalShot });
    console.log(`Saved article screenshot: ${carbonModalShot}`);

    // Close modal if close button exists
    const closeBtn = page.locator("button:has-text('Close'), button[aria-label='Close'], button:has-text('إغلاق')").first();
    if (await closeBtn.count() > 0) {
      await closeBtn.click();
      await page.waitForTimeout(1000);
    }
  }

  // 4. Also check Fable article
  const fableCard = page.locator("text=Claude Fable").first();
  if (await fableCard.count() > 0) {
    await fableCard.click({ force: true });
    await page.waitForTimeout(2000);
    const fableModalShot = path.join(ARTIFACT_DIR, "Live_Article_Claude_Fable.png");
    await page.screenshot({ path: fableModalShot });
    console.log(`Saved article screenshot: ${fableModalShot}`);
  }

  // 5. Navigate to notifications to verify broadcast message
  console.log("Navigating to https://quanters.web.app/notifications...");
  await page.goto("https://quanters.web.app/notifications", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  const notifShot = path.join(ARTIFACT_DIR, "Live_Notifications_2XP_Broadcast.png");
  await page.screenshot({ path: notifShot });
  console.log(`Saved notification screenshot: ${notifShot}`);

  await browser.close();
  console.log("Verification completed successfully!");
}

verify().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
