import { chromium } from "playwright";
import path from "path";

const ARTIFACT_DIR = "C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193";

async function snapFable() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: { width: 412, height: 915 },
  });
  const page = await context.newPage();

  await page.goto("https://quanters.web.app/explore", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);

  // Click on the Claude Fable card in the story feed or carousel
  const fableCard = page.locator("text=Claude Fable").first();
  await fableCard.scrollIntoViewIfNeeded();
  await fableCard.click();
  await page.waitForTimeout(2000);

  const fableShot = path.join(ARTIFACT_DIR, "Live_Article_Claude_Fable_Dedicated.png");
  await page.screenshot({ path: fableShot });
  console.log("Saved dedicated Fable screenshot:", fableShot);

  await browser.close();
}

snapFable().catch(console.error);
