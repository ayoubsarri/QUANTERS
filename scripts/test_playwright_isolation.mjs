import { chromium } from "playwright";

async function main() {
  console.log("Launching headless browser to test context isolation...");
  const browser = await chromium.launch({ headless: true, channel: "chrome" });
  
  const ctxA = await browser.newContext();
  const ctxB = await browser.newContext();
  
  const pageA = await ctxA.newPage();
  const pageB = await ctxB.newPage();
  
  await pageA.goto("https://quanters.web.app/welcome");
  await pageB.goto("https://quanters.web.app/welcome");
  
  // Set localStorage in A
  await pageA.evaluate(() => {
    localStorage.setItem("test_key", "value_A");
  });
  
  // Verify B cannot see A's localStorage
  const valB = await pageB.evaluate(() => localStorage.getItem("test_key"));
  console.log("Value in Context B (must be null):", valB);
  
  await browser.close();
  if (valB === null) {
    console.log("SUCCESS: Browser contexts are 100% isolated!");
  } else {
    throw new Error("Context isolation failure!");
  }
}

main().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
