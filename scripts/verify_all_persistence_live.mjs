import { chromium } from "playwright";

const URLS = [
  "https://quanters.web.app/admin/tasks",
  "https://quanters.web.app/admin/badges",
  "https://quanters.web.app/admin/points",
  "https://quanters.web.app/admin/proposals",
  "https://quanters.web.app/admin/messages",
  "https://quanters.web.app/admin/workshops",
  "https://quanters.web.app/admin/explore",
];

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const pageErrors = [];
  const consoleErrors = [];
  page.on("pageerror", (err) => pageErrors.push(String(err)));
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  // First load root to hydrate live Firestore snapshot and check store shape in localStorage
  await page.goto("https://quanters.web.app/login", { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(3500);

  const cacheCheck = await page.evaluate(() => {
    const raw = window.localStorage.getItem("quanters-offline-cache-v10");
    if (!raw) return { exists: false };
    try {
      const parsed = JSON.parse(raw);
      return {
        exists: true,
        hasInvitationsKey: "invitations" in parsed,
        hasExamCompletionsKey: "examCompletions" in parsed,
        membersCount: Array.isArray(parsed.members) ? parsed.members.length : 0,
        workshopsCount: Array.isArray(parsed.workshops) ? parsed.workshops.length : 0,
        tasksCount: Array.isArray(parsed.tasks) ? parsed.tasks.length : 0,
        badgesCount: Array.isArray(parsed.badges) ? parsed.badges.length : 0,
        messagesCount: Array.isArray(parsed.messages) ? parsed.messages.length : 0,
      };
    } catch (e) {
      return { exists: true, parseError: String(e) };
    }
  });

  const routeResults = [];
  for (const url of URLS) {
    const resp = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(1500);
    routeResults.push({
      url,
      status: resp?.status(),
      finalUrl: page.url(),
      title: await page.title(),
    });
  }

  console.log("Cache check:", JSON.stringify(cacheCheck, null, 2));
  console.log("Routes verified:");
  console.table(routeResults);
  console.log("Page errors:", pageErrors.length);
  if (pageErrors.length) console.log(pageErrors);
  console.log("Console errors:", consoleErrors.length);
  if (consoleErrors.length) console.log(consoleErrors);

  await browser.close();

  if (pageErrors.length > 0 || !cacheCheck.exists || !cacheCheck.hasInvitationsKey || !cacheCheck.hasExamCompletionsKey) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
