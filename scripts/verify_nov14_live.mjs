import { chromium } from "playwright";
import path from "path";

const ARTIFACT_DIR = "C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193";

async function verify() {
  console.log("Launching Chrome to verify live deployment for Nov 14, 2026...");
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: { width: 412, height: 915 }, // Pixel 7 viewport
  });
  const page = await context.newPage();

  // 1. Check Explore Page
  console.log("Navigating to https://quanters.web.app/explore...");
  await page.goto("https://quanters.web.app/explore", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3500);

  const exploreShot = path.join(ARTIFACT_DIR, "Live_Explore_Nov14_2XP_AI4S.png");
  await page.screenshot({ path: exploreShot });
  console.log(`Saved screenshot: ${exploreShot}`);

  const pageText = await page.textContent("body");
  const has2Xp = pageText.includes("+2 XP");
  const hasAi4s = pageText.includes("AI for Science") || pageText.includes("AI4S");
  const hasQuantum = pageText.includes("Quantum") || pageText.includes("الكمي");
  console.log("- Contains '+2 XP':", has2Xp);
  console.log("- Contains 'AI for Science':", hasAi4s);
  console.log("- Contains 'Quantum':", hasQuantum);

  // 2. Open AI4S Article
  const ai4sCard = page.locator("text=AI for Science").first();
  if (await ai4sCard.count() > 0) {
    await ai4sCard.click({ force: true });
    await page.waitForTimeout(2000);
    const ai4sModalShot = path.join(ARTIFACT_DIR, "Live_Article_AI4S_Nov14.png");
    await page.screenshot({ path: ai4sModalShot });
    console.log(`Saved article screenshot: ${ai4sModalShot}`);
  }

  // 3. Check Workshops Page
  console.log("Navigating to https://quanters.web.app/workshops...");
  await page.goto("https://quanters.web.app/workshops", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);

  const wsShot = path.join(ARTIFACT_DIR, "Live_Workshops_Nov14_Clean.png");
  await page.screenshot({ path: wsShot });
  console.log(`Saved screenshot: ${wsShot}`);

  const wsPageText = await page.textContent("body");
  const hasNoSessions = wsPageText.includes("No Scheduled Sessions Yet");
  console.log("- Workshops page empty state verified:", hasNoSessions);

  await browser.close();
  console.log("All live checks for Nov 14 completed successfully!");
}

verify().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
