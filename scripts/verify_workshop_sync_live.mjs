import { chromium } from "playwright";
import path from "path";

const ARTIFACT_DIR = "C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193";

async function verify() {
  console.log("Launching Chrome to verify Workshop creation & sync fixes on https://quanters.web.app ...");
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({ viewport: { width: 1366, height: 860 } });
  const page = await context.newPage();

  // 1. Open /welcome, hydrate store & pull live Firestore
  await page.goto("https://quanters.web.app/welcome", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3500);

  const testResult = await page.evaluate(async () => {
    const store = window.__QUANTERS_STORE__;
    await store.getState().pullExactUpdatesFromServer();
    const initialWorkshops = store.getState().workshops.length;

    // Sign in locally as Super Admin to test /admin/workshops UI & createWorkshop contract
    const admin = store.getState().members.find((m) => m.email === "quantaclubdz@gmail.com") || store.getState().members[0];
    store.setState({
      isAuthenticated: true,
      currentMemberId: admin.id,
      activeAdminRole: "Super Admin",
      sessionStartedAt: Date.now(),
    });
    store.getState().saveToLocalCache();

    // Test createWorkshop returns honest sync result and saves to localStorage immediately
    const createRes = await store.getState().createWorkshop({
      title: "Verification Probe Workshop",
      activityType: "Workshop",
      category: "Computer Science & Programming",
      iconType: "python",
      level: "Beginner",
      instructor: "Test Mentor",
      dateLabel: "20 Nov 2026",
      timeRange: "14:00 - 16:00",
      eventDate: "2026-11-20",
      location: "Lab A1",
      capacity: 30,
      xpReward: 100,
      description: "Test verification",
      status: "Published",
    });

    const cachedRaw = window.localStorage.getItem("quanters-erp-offline-cache-v4");
    const savedInCache = Boolean(cachedRaw && cachedRaw.includes(createRes.workshop.id));

    // Clean up local test probe before inspecting live cloud state
    store.setState({
      workshops: store.getState().workshops.filter((w) => w.id !== createRes.workshop.id),
    });
    store.getState().saveToLocalCache();

    return {
      initialWorkshops,
      createOk: createRes.ok,
      hasTimestamps: Boolean(createRes.workshop.createdAt && createRes.workshop.updatedAt && createRes.workshop.eventDate === "2026-11-20"),
      savedInCacheImmediately: savedInCache,
      honestSyncWarningWhenUnauth: createRes.syncedToCloud === false && Boolean(createRes.message),
      message: createRes.message,
    };
  });

  console.log("Live Workshop Sync Contract Test:", JSON.stringify(testResult, null, 2));

  await page.goto("https://quanters.web.app/admin/workshops", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  const wsAdminShot = path.join(ARTIFACT_DIR, "Live_Admin_Workshops_Verified.png");
  await page.screenshot({ path: wsAdminShot });
  console.log("Saved screenshot:", wsAdminShot);

  await browser.close();
}

verify().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
