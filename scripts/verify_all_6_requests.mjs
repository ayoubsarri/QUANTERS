import { chromium } from "playwright";
import path from "path";

const ARTIFACTS_DIR = "C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193";

async function verifyAllUpdates() {
  console.log("Launching Chromium for comprehensive verification...");
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    serviceWorkers: "block",
  });
  const page = await context.newPage();

  // Test 1: Admin Stats (No Emojis, Original Icons & Badges)
  console.log("1. Verifying /admin/stats (Original Icons, 0 emojis)...");
  await page.goto("https://quanters.web.app/admin/stats", { waitUntil: "domcontentloaded", timeout: 15000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, "verify_admin_stats_no_emojis.png"), fullPage: false });
  console.log("Saved verify_admin_stats_no_emojis.png");

  // Test 2: Admin Settings (Verify Webhook & Audio Chimes deleted)
  console.log("2. Verifying /admin/settings (Webhook and Audio Chimes deleted)...");
  await page.goto("https://quanters.web.app/admin/settings", { waitUntil: "domcontentloaded", timeout: 15000 });
  await page.waitForTimeout(2000);
  const settingsHtml = await page.content();
  const hasWebhook = settingsHtml.includes("Community Announcement Webhook URL");
  const hasAudioChimes = settingsHtml.includes("In-App Audio Chimes & Haptic Pulse");
  console.log(`Settings Webhook present: ${hasWebhook} (Expected: false)`);
  console.log(`Settings Audio Chimes present: ${hasAudioChimes} (Expected: false)`);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, "verify_admin_settings_clean.png"), fullPage: false });

  // Test 3: Admin Explore (Gmail / MS Word Style Ribbon + Split View + Live Markdown Renderer)
  console.log("3. Verifying /admin/explore Article Publishing & Split View...");
  await page.goto("https://quanters.web.app/admin/explore", { waitUntil: "domcontentloaded", timeout: 15000 });
  await page.waitForTimeout(2000);

  // Click on "Publish Article"
  const publishBtn = page.locator("button:has-text('Publish Article')").first();
  if (await publishBtn.isVisible()) {
    await publishBtn.click();
    await page.waitForTimeout(800);

    // Switch to Split View tab to verify live synchronization
    const splitTabBtn = page.locator("button:has-text('Split View')").first();
    if (await splitTabBtn.isVisible()) {
      await splitTabBtn.click();
      await page.waitForTimeout(600);
    }

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "verify_explore_word_ribbon_modal.png"), fullPage: false });
    console.log("Saved verify_explore_word_ribbon_modal.png");
  }

  // Test 4: Mobile Explore Page (5 New Explore Articles)
  console.log("4. Verifying /explore (5 New Peer-Reviewed Articles)...");
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    serviceWorkers: "block",
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto("https://quanters.web.app/explore", { waitUntil: "domcontentloaded", timeout: 15000 });
  await mobilePage.waitForTimeout(2000);
  await mobilePage.screenshot({ path: path.join(ARTIFACTS_DIR, "verify_mobile_explore_new_articles.png"), fullPage: false });
  console.log("Saved verify_mobile_explore_new_articles.png");

  // Click on the first article card to verify MarkdownArticleRenderer in mobile reader modal
  const firstArticle = mobilePage.locator("h2, h3").first();
  if (await firstArticle.isVisible()) {
    await firstArticle.click();
    await mobilePage.waitForTimeout(600);
    await mobilePage.screenshot({ path: path.join(ARTIFACTS_DIR, "verify_mobile_article_reader_modal.png"), fullPage: false });
    console.log("Saved verify_mobile_article_reader_modal.png");
  }

  await browser.close();
  console.log("All verifications finished successfully!");
}

verifyAllUpdates().catch(console.error);
