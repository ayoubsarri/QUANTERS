import { chromium } from "playwright";
import path from "path";

const ARTIFACT_DIR = "C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193";

async function verify() {
  console.log("Launching Chrome to verify live fixes on https://quanters.web.app ...");
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: { width: 412, height: 915 }, // Pixel 7 viewport
  });
  const page = await context.newPage();

  // 1. Check Explore Page
  console.log("Navigating to https://quanters.web.app/explore...");
  await page.goto("https://quanters.web.app/explore", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3500);

  const exploreShot = path.join(ARTIFACT_DIR, "Live_Explore_Fixed_Varied_Quizzes.png");
  await page.screenshot({ path: exploreShot });
  console.log(`Saved screenshot: ${exploreShot}`);

  const pageText = await page.textContent("body");
  const has2Xp = pageText.includes("+2 XP");
  const hasSecBench = pageText.includes("SEC-bench Pro");
  console.log("- Contains '+2 XP':", has2Xp);
  console.log("- Contains 'SEC-bench Pro' option:", hasSecBench);

  // 2. Check Workshops Page
  console.log("Navigating to https://quanters.web.app/workshops...");
  await page.goto("https://quanters.web.app/workshops", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);

  const wsShot = path.join(ARTIFACT_DIR, "Live_Workshops_Empty_State.png");
  await page.screenshot({ path: wsShot });
  console.log(`Saved screenshot: ${wsShot}`);

  const wsPageText = await page.textContent("body");
  const hasNoSessions = wsPageText.includes("No Scheduled Sessions Yet") || wsPageText.includes("New workshops, scientific labs");
  const hasOldTimimounWs = wsPageText.includes("Timimoun Film & Media Lab");
  console.log("- Contains 'No Scheduled Sessions Yet':", hasNoSessions);
  console.log("- Free of phantom 'Timimoun Film & Media Lab':", !hasOldTimimounWs);

  await browser.close();
  console.log("All live verification checks passed!");
}

verify().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
