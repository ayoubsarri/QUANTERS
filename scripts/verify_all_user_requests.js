import { chromium } from "playwright";

async function verify() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();

  console.log("Logging into admin account...");
  await page.goto("https://quanters.web.app/welcome", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);

  // Click "Start Member Portal" or fill credentials
  const startBtn = page.locator('button:has-text("Start"), button:has-text("Member Portal")').first();
  if (await startBtn.isVisible()) {
    await startBtn.click();
    await page.waitForTimeout(1000);
  }

  // Look for email input
  const emailInput = page.locator('input[type="email"], input[placeholder*="email" i]').first();
  if (await emailInput.isVisible()) {
    await emailInput.fill("quantaclubdz@gmail.com");
    const pwdInput = page.locator('input[type="password"]').first();
    await pwdInput.fill("QuantaSuperAdmin2026!");
    const signInBtn = page.locator('button:has-text("Sign In"), button:has-text("Login")').first();
    await signInBtn.click();
    await page.waitForTimeout(3000);
  }

  console.log("1. Verifying /admin/stats with live data...");
  await page.goto("https://quanters.web.app/admin/stats", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193/verify_admin_stats_rebuilt.png", fullPage: false });

  console.log("2. Verifying /admin/explore modal...");
  await page.goto("https://quanters.web.app/admin/explore", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  const createBtn = page.locator('button:has-text("Publish Article"), button:has-text("New Article"), button:has-text("Create")').first();
  if (await createBtn.isVisible()) {
    await createBtn.click();
    await page.waitForTimeout(1000);
  }
  await page.screenshot({ path: "C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193/verify_admin_explore_modal.png", fullPage: false });

  console.log("3. Verifying /home (compact install banner)...");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("https://quanters.web.app/home", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193/verify_mobile_home_install.png" });

  console.log("4. Verifying /profile (quote size & notifications position)...");
  await page.goto("https://quanters.web.app/profile", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193/verify_mobile_profile_quote.png" });

  console.log("5. Verifying /notifications (no push banner at top)...");
  await page.goto("https://quanters.web.app/notifications", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193/verify_mobile_notifications_clean.png" });

  await browser.close();
  console.log("All verifications captured successfully!");
}

verify().catch(console.error);
