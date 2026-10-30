import { chromium } from "playwright";
import path from "path";

const ARTIFACTS_DIR = "C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193";

async function snapExploreModal() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
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
      skills: ["Executive Strategy"],
    };
    window.localStorage.setItem("quanters_perm_asked_v1", "true");
    window.localStorage.setItem(
      "quanters-offline-cache-v10",
      JSON.stringify({
        isAuthenticated: true,
        currentMemberId: superMember.id,
        activeAdminRole: "Super Admin",
        members: [superMember],
      })
    );
  });

  const page = await context.newPage();
  console.log("Navigating to https://quanters.web.app/admin/explore ...");
  await page.goto("https://quanters.web.app/admin/explore", { waitUntil: "domcontentloaded", timeout: 15000 });
  await page.waitForTimeout(2000);

  // Click on "Create Explore Post"
  const publishBtn = page.locator("button:has-text('Create Explore Post')").first();
  await publishBtn.waitFor({ state: "visible", timeout: 10000 });
  await publishBtn.click();
  await page.waitForTimeout(800);

  // Fill in sample headline & lead summary
  await page.fill("input[type='text'][required]", "Quantum Coherence & Topological Superconductors");
  await page.fill("textarea[required]", "Experimental observation of non-Abelian anyons in hybrid semiconductor-superconductor nanowires.");

  // Type full markdown article
  const textarea = page.locator("textarea[placeholder*='Write the full in-depth article']").first();
  await textarea.fill(`## Topological Protection and Non-Abelian Anyons
Quantum computing architectures suffer from environmental decoherence. In contrast, **topological quantum computing** stores logical states non-locally in pairs of Majorana zero modes:

> *"Majorana modes are immune to local perturbations, providing intrinsic hardware fault tolerance."*

### Key Experimental Observations
1. Zero-bias conductance peaks reaching quantized $2e^2/h$ limits
2. Parity lifetime exceeding 100 milliseconds
3. Non-local state transfer across superconducting junctions

\`\`\`typescript
interface MajoranaQubit {
  braidingPhase: number;
  parityObservable: "even" | "odd";
}
\`\`\`

Learn more at [QUANTA Research Repository](https://quanters.web.app)`);

  // 1. Snapshot Write Mode
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, "verify_admin_explore_word_ribbon.png"), fullPage: false });
  console.log("Saved verify_admin_explore_word_ribbon.png");

  // 2. Switch to Split View and snapshot
  const splitBtn = page.locator("button:has-text('Split View')").first();
  await splitBtn.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, "verify_admin_explore_split_view.png"), fullPage: false });
  console.log("Saved verify_admin_explore_split_view.png");

  // 3. Switch to Full Newspaper Preview and snapshot
  const previewBtn = page.locator("button:has-text('Newspaper Preview')").first();
  await previewBtn.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, "verify_admin_explore_newspaper_preview.png"), fullPage: false });
  console.log("Saved verify_admin_explore_newspaper_preview.png");

  await browser.close();
  console.log("Done snapping explore modal!");
}

snapExploreModal().catch(console.error);
