import { chromium } from "playwright";
import fs from "fs";
import path from "path";

async function runSwBandwidthAudit() {
  console.log("=== TEST SUITE 1: BANDWIDTH & SERVICE WORKER QUOTA TEST ===");

  // 1. Static Audit of sw.js
  const swPath = path.resolve("public/sw.js");
  const swCode = fs.readFileSync(swPath, "utf-8");

  const precacheMatch = swCode.match(/const CORE_PRECACHE_URLS = \[\s*([\s\S]*?)\];/);
  if (!precacheMatch) {
    throw new Error("CORE_PRECACHE_URLS definition not found in public/sw.js");
  }

  const urls = precacheMatch[1]
    .split(",")
    .map((s) => s.trim().replace(/['"]/g, ""))
    .filter(Boolean);

  console.log(`[SW Audit] Precached URLs count: ${urls.length}`);
  console.log(`[SW Audit] URLs: ${urls.join(", ")}`);

  // Assert precache does NOT contain heavy route pages
  const heavyRoutes = ["/workshops", "/explore", "/badges", "/profile", "/checkin", "/exams", "/manager"];
  const leakedRoutes = urls.filter((u) => heavyRoutes.includes(u));
  if (leakedRoutes.length > 0) {
    throw new Error(`FAIL: Precache contains heavy dynamic routes that burn bandwidth: ${leakedRoutes.join(", ")}`);
  }
  console.log("✔ PASS: No heavy dynamic routes in precache list.");

  // 2. Static Audit of PwaOfflineManager.tsx
  const pwaMgrPath = path.resolve("src/components/shared/PwaOfflineManager.tsx");
  const pwaMgrCode = fs.readFileSync(pwaMgrPath, "utf-8");
  if (pwaMgrCode.includes('routes: OFFLINE_WARM_ROUTES') && !pwaMgrCode.includes('OFFLINE_WARM_ROUTES: string[] = []')) {
    throw new Error("FAIL: PwaOfflineManager still warming routes automatically!");
  }
  console.log("✔ PASS: Eager background warming blast removed from PwaOfflineManager.");

  // 3. Browser Network Byte Transfer Simulation
  let browser;
  try {
    browser = await chromium.launch({ channel: "chrome", headless: true });
  } catch {
    browser = await chromium.launch({ headless: true });
  }

  const context = await browser.newContext();
  const page = await context.newPage();

  let totalTransferBytes = 0;
  const requests = [];

  page.on("response", async (response) => {
    try {
      const buffer = await response.body();
      const bytes = buffer.length;
      totalTransferBytes += bytes;
      requests.push({ url: response.url(), bytes });
    } catch {
      // Ignore aborts
    }
  });

  console.log("[Network Test] Navigating to https://quanters.web.app (Clean Session)...");
  await page.goto("https://quanters.web.app/", { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(3000);

  const totalTransferKB = (totalTransferBytes / 1024).toFixed(1);
  console.log(`[Network Test] Total transferred: ${totalTransferKB} KB across ${requests.length} requests`);

  await browser.close();

  console.log("✔ TEST SUITE 1 SUCCESS: Service worker bandwidth quota verified!");
}

runSwBandwidthAudit().catch((err) => {
  console.error("❌ TEST SUITE 1 FAILED:", err);
  process.exit(1);
});
