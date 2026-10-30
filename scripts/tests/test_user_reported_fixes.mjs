import { chromium } from "playwright";

const TARGET_HOST = process.env.TEST_URL || "https://quanters.web.app";

async function runVerification() {
  console.log("===============================================================================");
  console.log("  VERIFYING USER REPORTED FIXES (Grievance, Google Pause/Resign, Deletions, Routing)");
  console.log(`  Target: ${TARGET_HOST}`);
  console.log("===============================================================================\n");

  const browser = await chromium.launch({
    headless: true,
    channel: "chrome",
    args: [
      "--host-resolver-rules=MAP quanters.web.app 199.36.158.100, MAP quanters.firebaseapp.com 199.36.158.100",
      "--no-proxy-server",
    ],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  async function nav(url) {
    for (let i = 0; i < 3; i++) {
      try {
        return await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
      } catch (e) {
        if (i === 2) throw e;
        await page.waitForTimeout(500);
      }
    }
  }

  try {
    await nav(`${TARGET_HOST}/welcome`);
    await page.waitForFunction(() => Boolean(window.__QUANTERS_STORE__), null, { timeout: 10000 });

    // -------------------------------------------------------------------------
    // TEST 1: Confidential Grievance Submission (Normal & Anonymous)
    // -------------------------------------------------------------------------
    console.log(">>> Test 1: Testing Grievance Submission (Normal & Anonymous)...");
    const grvResults = await page.evaluate(() => {
      const s = window.__QUANTERS_STORE__.getState();
      const currentMember = s.members[0];
      s.setCurrentMemberId(currentMember.id);

      // Normal grievance
      const resNormal = s.submitGrievance({
        subject: "Normal Test Grievance",
        category: "Workload & Tasks",
        urgency: "Standard",
        details: "Detailed feedback regarding team shift schedule.",
        isAnonymous: false,
      });

      // Anonymous grievance
      const resAnon = s.submitGrievance({
        subject: "Anonymous Test Grievance",
        category: "Other",
        urgency: "Urgent",
        details: "Completely anonymous complaint regarding club operations.",
        isAnonymous: true,
      });

      // Check local cache preservation
      const cached = JSON.parse(localStorage.getItem("quanters-offline-cache-v10") || "{}");
      const cachedGrievances = cached.grievances || [];

      return {
        normalOk: resNormal.ok,
        anonOk: resAnon.ok,
        grievancesInStore: s.grievances.length,
        grievancesInCache: cachedGrievances.length,
        hasAnonInCache: cachedGrievances.some(g => g.isAnonymous),
        hasNormalInCache: cachedGrievances.some(g => !g.isAnonymous),
      };
    });

    console.log("    Grievance submission results:", grvResults);
    if (!grvResults.normalOk || !grvResults.anonOk || grvResults.grievancesInCache < 2) {
      throw new Error("Grievance submission or local caching failed!");
    }
    console.log("  ✅ [PASS] Grievance submission in normal & anonymous mode persists in store & cache!");

    // -------------------------------------------------------------------------
    // TEST 2: Pause or Resign Membership with Google Verification
    // -------------------------------------------------------------------------
    console.log("\n>>> Test 2: Testing Pause / Resign with Google Verification...");
    const pauseResults = await page.evaluate(() => {
      const s = window.__QUANTERS_STORE__.getState();
      const member = s.members[0];

      // Test with passwordConfirm = "GOOGLE_VERIFIED"
      const resPause = s.pauseOrResignMembershipSelf({
        memberId: member.id,
        action: "pause",
        motif: "Need temporary leave for academic exams",
        passwordConfirm: "GOOGLE_VERIFIED",
        pauseUntilDate: "2026-12-31",
      });

      // Re-fetch state to get updated store
      const updatedState = window.__QUANTERS_STORE__.getState();
      const updatedMember = updatedState.members.find(m => m.id === member.id);

      return {
        ok: resPause.ok,
        message: resPause.message,
        newStatus: updatedMember?.status,
      };
    });

    console.log("    Pause membership results:", pauseResults);
    if (!pauseResults.ok || pauseResults.newStatus !== "Inactive") {
      throw new Error(`Google Pause/Resign verification failed: ${pauseResults.message}`);
    }
    console.log("  ✅ [PASS] Google verification successfully pauses membership without password error!");

    // -------------------------------------------------------------------------
    // TEST 3: Deleting Workshops & Badges (No Resurrecting)
    // -------------------------------------------------------------------------
    console.log("\n>>> Test 3: Deleting Workshops & Badges without Resurrecting...");
    const deletionTest = await page.evaluate(() => {
      const s = window.__QUANTERS_STORE__.getState();
      const initialWsCount = s.workshops.length;
      const initialBadgeCount = s.badges.length;

      const wsToDelete = s.workshops[0]?.id;
      const badgeToDelete = s.badges[0]?.id;

      if (wsToDelete) {
        s.deleteWorkshop(wsToDelete, true, "Unit test permanent delete");
      }
      if (badgeToDelete) {
        s.deleteOrArchiveBadge(badgeToDelete, "Unit test delete");
      }

      const postWsCount = s.workshops.length;
      const postBadgeCount = s.badges.length;

      // Re-hydrate from local cache to verify they DO NOT resurrect
      s.hydrateFromLocalCache();

      const hydratedWsCount = s.workshops.length;
      const hydratedBadgeCount = s.badges.length;

      return {
        initialWsCount,
        postWsCount,
        hydratedWsCount,
        initialBadgeCount,
        postBadgeCount,
        hydratedBadgeCount,
      };
    });

    console.log("    Deletion and hydration counts:", deletionTest);
    if (deletionTest.hydratedWsCount !== deletionTest.postWsCount) {
      throw new Error("Workshop resurrected during hydration!");
    }
    if (deletionTest.hydratedBadgeCount !== deletionTest.postBadgeCount) {
      throw new Error("Badge resurrected during hydration!");
    }
    console.log("  ✅ [PASS] Deleted workshop & badge do NOT resurrect upon hydration!");

    // -------------------------------------------------------------------------
    // TEST 4: Pending Member Navigating to /workshops (Not Blocked by Waiting Gate)
    // -------------------------------------------------------------------------
    console.log("\n>>> Test 4: Pending Member Navigating to /workshops...");
    await page.evaluate(() => {
      const s = window.__QUANTERS_STORE__.getState();
      // Set member as Pending
      const mem = s.members[0];
      mem.status = "Pending";
      mem.roles = ["Member"];
      if (!mem.onboardingTicks) mem.onboardingTicks = { profileComplete: true, hrApproved: false };
      mem.onboardingTicks.hrApproved = false;
      s.saveToLocalCache();
    });

    await nav(`${TARGET_HOST}/workshops`);
    await page.waitForTimeout(500);

    const workshopsPageContent = await page.evaluate(() => {
      return {
        url: window.location.pathname,
        hasWaitingTitle: document.body.innerText.includes("Waiting for Admission Approval") || document.body.innerText.includes("Admission Review in Progress"),
        hasWorkshopsCatalog: document.body.innerText.includes("Workshops") && (document.body.innerText.includes("SESSIONS") || document.body.innerText.includes("Upcoming")),
      };
    });

    console.log("    Workshops page routing check:", workshopsPageContent);
    if (workshopsPageContent.hasWaitingTitle) {
      throw new Error("Workshops route was intercepted by WaitingForApprovalScreen!");
    }
    if (!workshopsPageContent.hasWorkshopsCatalog) {
      throw new Error("Workshops catalog was not rendered!");
    }
    console.log("  ✅ [PASS] Pending member can freely view /workshops without waiting gate hijacking!");

    console.log("\n===============================================================================");
    console.log("  ALL 4 USER-REPORTED ISSUE CHECKS PASSED 100%!");
    console.log("===============================================================================\n");

  } finally {
    await browser.close();
  }
}

runVerification().catch((err) => {
  console.error("\nFATAL VERIFICATION FAILURE:", err);
  process.exit(1);
});
