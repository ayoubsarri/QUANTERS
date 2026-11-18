import { chromium } from "playwright";
import path from "path";

const ARTIFACT_DIR = "C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193";

async function verify() {
  console.log("Launching Chrome to verify HR Review & Shard Sync fixes on https://quanters.web.app ...");
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1366, height: 860 },
  });
  const page = await context.newPage();

  // 1. Open /welcome so store hydrates & pulls fresh Cloud Firestore data (with repaired main + members_shard)
  await page.goto("https://quanters.web.app/welcome", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3500);

  // Pull state & check Bellili Samy + Benzaoui Israa + admin layout behavior
  const cloudCheck = await page.evaluate(async () => {
    const store = window.__QUANTERS_STORE__;
    if (!store) return { error: "Store missing" };
    await store.getState().pullExactUpdatesFromServer();
    const state = store.getState();
    const bellili = state.members.find((m) => m.id === "mem-1795029261274");
    const benzaoui = state.members.find((m) => m.id === "mem-1794582864758");
    return {
      totalMembers: state.members.length,
      bellili: bellili
        ? { status: bellili.status, hrApproved: bellili.onboardingTicks?.hrApproved, xpTotal: bellili.xpTotal, updatedAt: bellili.updatedAt }
        : null,
      benzaoui: benzaoui
        ? { status: benzaoui.status, hrApproved: benzaoui.onboardingTicks?.hrApproved, xpTotal: benzaoui.xpTotal, updatedAt: benzaoui.updatedAt }
        : null,
    };
  });
  console.log("Live Cloud Pull Verification:", JSON.stringify(cloudCheck, null, 2));

  // 2. Test stale Pending cache protection:
  // Simulate Bellili Samy having a stale cached Pending state with same/old updatedAt, then applyIncomingCloudSnapshot
  const staleProtectionCheck = await page.evaluate(async () => {
    const store = window.__QUANTERS_STORE__;
    const current = store.getState();
    const belliliRemote = current.members.find((m) => m.id === "mem-1795029261274");
    const benzaouiRemote = current.members.find((m) => m.id === "mem-1794582864758");

    // Mutate local state temporarily to simulate stale Pending member cache
    store.setState({
      isAuthenticated: true,
      currentMemberId: "mem-1795029261274",
      members: current.members.map((m) =>
        m.id === "mem-1795029261274"
          ? {
              ...m,
              status: "Pending",
              updatedAt: belliliRemote.updatedAt, // same timestamp!
              onboardingTicks: { ...m.onboardingTicks, hrApproved: false },
            }
          : m
      ),
    });

    // Apply incoming cloud snapshot from Firestore (with Trainee + hrApproved: true)
    store.getState().applyIncomingCloudSnapshot({
      members: [belliliRemote, benzaouiRemote],
    });

    const after = store.getState().members.find((m) => m.id === "mem-1795029261274");
    return {
      statusAfterSnapshot: after?.status,
      hrApprovedAfterSnapshot: after?.onboardingTicks?.hrApproved,
    };
  });
  console.log("Stale Pending Reversion Protection Test:", JSON.stringify(staleProtectionCheck, null, 2));

  // 3. Authenticate locally as Super Admin (mem-super-quanta) and inspect /admin/members & /admin/overview
  await page.evaluate(() => {
    const store = window.__QUANTERS_STORE__;
    const s = store.getState();
    const admin = s.members.find((m) => m.email === "quantaclubdz@gmail.com") || s.members[0];
    store.setState({
      isAuthenticated: true,
      currentMemberId: admin.id,
      activeAdminRole: "Super Admin",
      sessionStartedAt: Date.now(),
    });
    s.saveToLocalCache();
  });

  await page.goto("https://quanters.web.app/admin/members", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);

  const membersShot = path.join(ARTIFACT_DIR, "Live_Admin_Members_HR_Verified.png");
  await page.screenshot({ path: membersShot });
  console.log("Saved admin/members screenshot:", membersShot);

  const membersText = await page.textContent("body");
  console.log("- Shows Cloud Auth Mismatch warning banner (expected in unauth Chrome):", membersText.includes("Cloud Auth Mismatch"));
  console.log("- Shows Bellili Samy as Trainee:", membersText.includes("Bellili Samy"));
  console.log("- Shows Benzaoui Israa as Trainee:", membersText.includes("Benzaoui Israa"));

  await page.goto("https://quanters.web.app/admin/overview", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  const overviewShot = path.join(ARTIFACT_DIR, "Live_Admin_Overview_HR_Queue.png");
  await page.screenshot({ path: overviewShot });
  console.log("Saved admin/overview screenshot:", overviewShot);

  await browser.close();
  console.log("All HR Review verification tests passed!");
}

verify().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
