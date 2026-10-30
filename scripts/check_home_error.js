import { chromium } from "playwright";

async function checkHomeConsole() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    serviceWorkers: "block",
  });

  await context.addInitScript(() => {
    const superMember = {
      id: "mem-super-quanta",
      quanterId: "QT-00-0000",
      handle: "@quanta_admin",
      email: "quantaclubdz@gmail.com",
      fullName: "QUANTA Super Admin",
      roles: ["Super Admin", "Executive", "HR Head"],
      isBureauMember: true,
      status: "Active",
      departmentId: "dept-it",
      badgeIds: [],
      xpTotal: 250,
      xpSeason: 250,
      xpMonth: 250,
      level: 1,
      attendanceRate: 100,
      onTimeTaskRate: 100,
      workshopsCompletedCount: 3,
      projectsCompletedCount: 1,
      onboardingTicks: { profileComplete: true, buddyAssigned: true, firstTaskBeforeDay30: true, firstWorkshopAttended: true }
    };
    const cache = {
      isAuthenticated: true,
      currentMemberId: "mem-super-quanta",
      activeAdminRole: "Super Admin",
      members: [superMember]
    };
    window.localStorage.setItem("quanters-offline-cache-v10", JSON.stringify(cache));
  });

  const page = await context.newPage();
  page.on("console", (msg) => console.log("HOME LOG:", msg.type(), msg.text()));
  page.on("pageerror", (err) => console.log("HOME ERROR:", err.message, err.stack));

  console.log("Navigating to /home...");
  await page.goto("https://quanters.web.app/home", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);

  await browser.close();
}

checkHomeConsole().catch(console.error);
