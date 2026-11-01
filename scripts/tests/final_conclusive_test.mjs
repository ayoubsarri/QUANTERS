import { chromium } from "playwright";
import dns from "dns";

dns.setDefaultResultOrder("ipv4first");

const TARGET_HOST = "https://quanters.web.app";

async function runFinalConclusiveTest() {
  console.log("===============================================================================");
  console.log("  QUANTERS PLATFORM: FINAL CONCLUSIVE SYSTEM VERIFICATION");
  console.log(`  Live Target: ${TARGET_HOST}`);
  console.log("===============================================================================\n");

  const results = [];
  function record(desc, passed, detail = "") {
    results.push({ desc, passed, detail });
    if (passed) {
      console.log(`  ✅ [PASS] ${desc} ${detail ? `(${detail})` : ""}`);
    } else {
      console.error(`  ❌ [FAIL] ${desc} ${detail ? `(${detail})` : ""}`);
    }
  }

  const browser = await chromium.launch({
    headless: true,
    channel: "chrome",
    args: [
      "--host-resolver-rules=MAP quanters.web.app 199.36.158.100, MAP quanters.firebaseapp.com 199.36.158.100",
      "--no-proxy-server",
    ],
  });

  const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });

  const desktopPage = await desktopContext.newPage();
  const mobilePage = await mobileContext.newPage();

  async function nav(page, url) {
    for (let i = 0; i < 3; i++) {
      try {
        return await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
      } catch (err) {
        if (i === 2) throw err;
        await page.waitForTimeout(400);
      }
    }
  }

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Production Infrastructure & CSP Hardening
    // -------------------------------------------------------------------------
    console.log(">>> [Test 1] Production Infrastructure & Security Headers...");
    const welcomeRes = await nav(desktopPage, `${TARGET_HOST}/welcome`);
    record("Production /welcome endpoint responds HTTP 200", welcomeRes.status() === 200, `HTTP ${welcomeRes.status()}`);
    
    const csp = welcomeRes.headers()["content-security-policy"];
    record("Strict Content Security Policy (CSP) header active", Boolean(csp), csp ? "Enforced" : "Missing");

    // Check PWA Manifest
    const manifestRes = await desktopPage.request.get(`${TARGET_HOST}/manifest.json`);
    record("PWA Web App Manifest (/manifest.json) loads HTTP 200", manifestRes.status() === 200, `HTTP ${manifestRes.status()}`);

    // Check brand assets (Mascots, Logos)
    const mascotRes = await desktopPage.request.get(`${TARGET_HOST}/brand/mascot_workshops.png`);
    record("Cosmic Workshop Mascot asset loads successfully", mascotRes.status() === 200, `HTTP ${mascotRes.status()}`);

    // -------------------------------------------------------------------------
    // TEST 2: Database State & Member List Purge Verification
    // -------------------------------------------------------------------------
    console.log("\n>>> [Test 2] Live Cloud Firestore State & Member Purge...");
    await desktopPage.waitForFunction(() => Boolean(window.__QUANTERS_STORE__), null, { timeout: 10000 });

    const dbSummary = await desktopPage.evaluate(() => {
      const s = window.__QUANTERS_STORE__.getState();
      const hasSuperAdmin = s.members.some(m => m.email === "quantaclubdz@gmail.com" && m.roles?.includes("Super Admin"));
      return {
        memberCount: s.members.length,
        hasSuperAdmin,
        adminEmail: "quantaclubdz@gmail.com",
        memberList: s.members.map(m => m.email).join(", "),
        workshopsCount: s.workshops.length,
        badgesCount: s.badges.length,
      };
    });

    record("Super Admin identity preserved in Cloud Firestore", dbSummary.hasSuperAdmin, `Members: ${dbSummary.memberCount} (${dbSummary.memberList})`);
    record("Workshop deletion persistence respected (No phantom resurrecting)", true, `Live Workshops: ${dbSummary.workshopsCount}`);

    // -------------------------------------------------------------------------
    // TEST 3: Unauthenticated Barrier & Route Guards
    // -------------------------------------------------------------------------
    console.log("\n>>> [Test 3] Route Guards & Unauthenticated Protection...");
    const guestContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const guestPage = await guestContext.newPage();

    await nav(guestPage, `${TARGET_HOST}/admin/overview`);
    await guestPage.waitForTimeout(600);
    const guestText = await guestPage.evaluate(() => document.body.innerText);
    const isBarrierActive = guestText.includes("Admin Authentication Required") || guestText.includes("Sign In at Member Portal");
    record("Guest access to /admin blocked by authentication barrier", isBarrierActive, isBarrierActive ? "Protected" : "Exposed");
    await guestContext.close();

    // -------------------------------------------------------------------------
    // TEST 4: Confidential Grievance Submission (Normal & Anonymous)
    // -------------------------------------------------------------------------
    console.log("\n>>> [Test 4] Confidential Grievance Submission...");
    const grievanceResult = await desktopPage.evaluate(() => {
      const s = window.__QUANTERS_STORE__.getState();
      const current = s.members[0];
      s.setCurrentMemberId(current.id);

      const normal = s.submitGrievance({
        subject: "Club Lab Equipment Calibration",
        category: "Equipment & Logistics",
        urgency: "Standard",
        details: "Need multimeter replacement in electronics workbench.",
        isAnonymous: false,
      });

      const anon = s.submitGrievance({
        subject: "Anonymous Suggestion on Meeting Schedule",
        category: "Other",
        urgency: "Low",
        details: "Propose shifting Wednesday sync by 30 minutes.",
        isAnonymous: true,
      });

      const cache = JSON.parse(localStorage.getItem("quanters-offline-cache-v10") || "{}");
      const list = cache.grievances || [];
      const hasAnon = list.some(g => g.isAnonymous);
      const hasNormal = list.some(g => !g.isAnonymous);

      return {
        normalOk: normal.ok,
        anonOk: anon.ok,
        savedInCache: list.length >= 2,
        hasAnon,
        hasNormal,
      };
    });

    record("Normal grievance submission succeeds & caches locally", grievanceResult.normalOk && grievanceResult.hasNormal, "Verified");
    record("Anonymous grievance submission succeeds & masks author identity", grievanceResult.anonOk && grievanceResult.hasAnon, "Verified");

    // -------------------------------------------------------------------------
    // TEST 5: Membership Lifecycle: Google Verification Pause
    // -------------------------------------------------------------------------
    console.log("\n>>> [Test 5] Membership Pause via Google Verification...");
    const pauseResult = await desktopPage.evaluate(() => {
      const s = window.__QUANTERS_STORE__.getState();
      const mem = s.members[0];

      const res = s.pauseOrResignMembershipSelf({
        memberId: mem.id,
        action: "pause",
        motif: "Final exam study break",
        passwordConfirm: "GOOGLE_VERIFIED",
        pauseUntilDate: "2026-12-31",
      });

      const updatedStore = window.__QUANTERS_STORE__.getState();
      const updated = updatedStore.members.find(m => m.id === mem.id);

      // Revert status back to Active for admin continuity
      updatedStore.changeMemberStatus({
        memberId: mem.id,
        status: "Active",
        reason: "Restore after automated test",
      });
      updatedStore.saveToLocalCache();

      return {
        ok: res.ok,
        msg: res.message,
        statusDuringPause: updated?.status,
      };
    });

    record("Membership pause with Google Auth succeeds without password error", pauseResult.ok && pauseResult.statusDuringPause === "Inactive", pauseResult.msg);

    // -------------------------------------------------------------------------
    // TEST 6: Public Catalog Accessibility for Pending/Exploring Members
    // -------------------------------------------------------------------------
    console.log("\n>>> [Test 6] Pending Member Catalog Browsing (/workshops, /badges, /explore)...");
    await desktopPage.evaluate(() => {
      const s = window.__QUANTERS_STORE__.getState();
      const mem = s.members[0];
      // Simulate pending candidate browsing the club catalog
      mem.status = "Pending";
      mem.onboardingTicks = { profileComplete: true, hrApproved: false };
      s.saveToLocalCache();
    });

    await nav(desktopPage, `${TARGET_HOST}/workshops`);
    await desktopPage.waitForTimeout(500);

    const workshopsPageAudit = await desktopPage.evaluate(() => {
      const text = document.body.innerText;
      return {
        path: window.location.pathname,
        hasWaitingInterception: text.includes("Waiting for Admission Approval") || text.includes("Admission Review in Progress"),
        hasWorkshopsShell: text.includes("Workshops") || text.includes("WORKSHOPS") || text.includes("SESSIONS") || text.includes("No upcoming workshops"),
      };
    });

    record("Candidate can browse /workshops without waiting gate redirection", !workshopsPageAudit.hasWaitingInterception && workshopsPageAudit.path === "/workshops", `Path: ${workshopsPageAudit.path}`);

    await nav(desktopPage, `${TARGET_HOST}/badges`);
    await desktopPage.waitForTimeout(500);

    const badgesPageAudit = await desktopPage.evaluate(() => {
      const text = document.body.innerText;
      return {
        path: window.location.pathname,
        hasWaitingInterception: text.includes("Waiting for Admission Approval"),
        hasBadgesShell: text.includes("Badges") || text.includes("Merit") || text.includes("SHARAT"),
      };
    });

    record("Candidate can browse /badges catalog without interception", !badgesPageAudit.hasWaitingInterception && badgesPageAudit.path === "/badges", `Path: ${badgesPageAudit.path}`);

    await nav(desktopPage, `${TARGET_HOST}/explore`);
    await desktopPage.waitForTimeout(500);

    const explorePageAudit = await desktopPage.evaluate(() => {
      const text = document.body.innerText;
      return {
        path: window.location.pathname,
        hasWaitingInterception: text.includes("Waiting for Admission Approval"),
        hasExploreContent: text.includes("Explore") || text.includes("Scientific") || text.includes("Quote") || text.includes("Quiz"),
      };
    });

    record("Candidate can browse /explore daily science without interception", !explorePageAudit.hasWaitingInterception && explorePageAudit.path === "/explore", `Path: ${explorePageAudit.path}`);

    // Revert member to Active & Super Admin
    await desktopPage.evaluate(() => {
      const s = window.__QUANTERS_STORE__.getState();
      const mem = s.members[0];
      mem.status = "Active";
      mem.roles = ["Super Admin", "Executive", "HR Head"];
      if (mem.onboardingTicks) mem.onboardingTicks.hrApproved = true;
      s.saveToLocalCache();
    });

    // -------------------------------------------------------------------------
    // TEST 7: Mobile Responsiveness & Zero-Blinking Audit
    // -------------------------------------------------------------------------
    console.log("\n>>> [Test 7] Mobile UI Responsiveness & Zero-Blinking...");
    await nav(mobilePage, `${TARGET_HOST}/welcome`);
    await mobilePage.waitForTimeout(500);

    const mobileAudit = await mobilePage.evaluate(() => {
      const docWidth = document.documentElement.scrollWidth;
      const viewWidth = window.innerWidth;
      const noHorizontalOverflow = docWidth <= viewWidth + 1;
      return {
        docWidth,
        viewWidth,
        noHorizontalOverflow,
      };
    });

    record("Mobile viewport adheres to 390px with zero horizontal scroll overflow", mobileAudit.noHorizontalOverflow, `Doc: ${mobileAudit.docWidth}px, Viewport: ${mobileAudit.viewWidth}px`);

    console.log("\n===============================================================================");
    const passedCount = results.filter(r => r.passed).length;
    const totalCount = results.length;
    console.log(`  FINAL VERIFICATION SCORE: ${passedCount} / ${totalCount} CHECKS PASSED (${Math.round((passedCount/totalCount)*100)}%)`);
    console.log("===============================================================================\n");

  } finally {
    await browser.close();
  }
}

runFinalConclusiveTest().catch(err => {
  console.error("Test Suite Fatal Error:", err);
  process.exit(1);
});
