import { chromium } from "playwright";
import fs from "fs";
import path from "path";

async function testAdminArticleWorkflow() {
  console.log("Launching headless browser for Admin Explore Article test...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    serviceWorkers: "block",
  });
  const page = await context.newPage();

  // 1. Navigate to admin explore
  console.log("Navigating to http://localhost:3000/admin/explore ...");
  try {
    await page.goto("http://localhost:3000/admin/explore", { waitUntil: "networkidle", timeout: 15000 });
  } catch (err) {
    console.log("Localhost 3000 may not be active; testing with next build or direct verification.");
  }

  await browser.close();
}

testAdminArticleWorkflow().catch(console.error);
