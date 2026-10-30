# QUANTERS Platform Security, Quota & Integrity Remediation Plan (v2.0)
*Tailored per Executive Instruction: Complete Implementation Excluding `sendEmailVerification`*

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permanently eliminate all critical security vulnerabilities, free-tier quota exhaustion risks, member PII leaks, and concurrency race conditions across QUANTERS ERP, while preserving 100% of existing features, keeping registration smooth and direct (without `sendEmailVerification`), and ensuring total backwards compatibility.

**Architecture:** Multi-layered defense-in-depth:
1. **Bandwidth & Quota Optimization Layer (`public/sw.js`):** Transform Service Worker precaching to on-demand runtime caching (`stale-while-revalidate`), cutting initial download from 9.75 MB to < 250 KB (capacity increases from 36/day to 1,400+ daily visitors on free tier).
2. **Privacy & Data Scoping Layer (`useQuantersStore.ts`):** Role-scoped PII masking in client-side storage so ordinary members only see public profiles, while admins retain full directory access.
3. **API Key Shielding & Registration Protection (`emailVerification.ts` & `welcome/page.tsx`):** Remove exposed third-party API keys from public client state. Use local 70+ disposable domain blacklist & typo correction. Direct registration and onboarding with ZERO email verification link interruptions.
4. **Security & Rules Layer (`firestore.rules`):** Constrain Firestore access rules to prevent unauthorized tampering, privilege escalation, and full database dumps while preserving seamless live sync.
5. **Data Partitioning & Integrity Layer (`useQuantersStore.ts` & `auth.ts`):** Transparent document partitioning (members shard, history shard) to eliminate the 1 MiB Firestore limit forever, coupled with item-level timestamp reconciliation to eliminate last-write-wins race hazards.

**Tech Stack:** Next.js 15 (Static Export), TypeScript 5.7, Zustand 5, Cloud Firestore (Firebase Web SDK v13), Service Worker API, Tailwind CSS.

---

## Detailed Task Breakdown

### Phase 1: Bandwidth Quota Protection & Service Worker Optimization (`public/sw.js`)
**Files:**
- Modify: `public/sw.js:12-70`
- Modify: `src/components/shared/PwaOfflineManager.tsx:9-25`

- [ ] **Step 1: Streamline `CORE_PRECACHE_URLS` in `public/sw.js`**
  Reduce `CORE_PRECACHE_URLS` from 25 heavy routes down to essential app shell and brand assets only:
  ```javascript
  const CORE_PRECACHE_URLS = [
    "/",
    "/manifest.json",
    "/apple-touch-icon.png",
    "/icons/icon-192.png",
    "/icons/icon-512.png",
    "/brand/logo_quanta_opt.webp",
    "/brand/quanters_vector_v2.svg",
    "/brand/univ_logo.svg",
    "/brand/univ_logo_d.svg",
    "/brand/welcome_keyframe_1.webp",
  ];
  ```
- [ ] **Step 2: Implement dynamic on-demand runtime caching (`stale-while-revalidate`)**
  When a user actually navigates to `/workshops`, `/profile`, `/checkin`, or `/explore`, the Service Worker caches THAT specific page and its assets in `caches.open(PAGES_CACHE)`. Once visited, it remains 100% available offline.
- [ ] **Step 3: Update `PwaOfflineManager.tsx`**
  Remove eager background warming of all 25 routes to avoid bandwidth thrashing.
- [ ] **Step 4: Verify bandwidth metrics**
  Verify that initial visit downloads < 250 KB instead of 9.75 MB, expanding daily visitor capacity from 36 to 1,400+ on the free tier.

---

### Phase 2: Role-Scoped Member PII Masking (`useQuantersStore.ts`)
**Files:**
- Modify: `src/lib/store/useQuantersStore.ts:1430-1465`

- [ ] **Step 1: Implement role-scoped PII masking in `saveToLocalCache()`**
  When saving members to `localStorage` under `quanters-offline-cache-v10`:
  - If the user is an administrator (`Super Admin`, `Executive`, `HR Head`, `Department Head`) OR viewing their own profile (`m.id === s.currentMemberId`): preserve full KYC fields (phone, wilaya, commune, housingType, commuteTime, cvUrl).
  - If an ordinary member or trainee is logged in: automatically mask other members' sensitive PII, keeping only public fields (id, quanterId, fullName, handle, avatarUrl, department, team, roles, level, XP, badges, public bio/quote).
- [ ] **Step 2: Verify Admin & Student views**
  Verify that an admin viewing `/admin/members/[id]` sees 100% of contact details, while a student viewing member directories or leaderboards on a university lab PC cannot dump other members' phone numbers from `localStorage`.

---

### Phase 3: API Key Shielding & Registration Protection (Excluding `sendEmailVerification`)
**Files:**
- Modify: `src/lib/data/seed.ts:970-985`
- Modify: `src/lib/utils/emailVerification.ts:220-270`
- Modify: `src/app/(mobile)/welcome/page.tsx:720-745`

- [ ] **Step 1: Remove exposed plaintext API keys from public client settings**
  Remove ZeroBounce and AbstractAPI secret keys from public seed settings so they are never leaked in client bundles or network requests.
- [ ] **Step 2: Bolster zero-cost local validation engine**
  Use the fast, local, zero-call disposable domain blacklist (70+ disposable domains) and typo fixer (`gmai.com` $\to$ `gmail.com`).
- [ ] **Step 3: Preserve direct registration flow**
  Per user instructions, strictly do NOT require `sendEmailVerification`. Registration immediately signs the user in and redirects to `/onboarding` seamlessly with zero email verification barriers.

---

### Phase 4: Firestore Rules Hardening via Specialist Subagent (`firestore.rules`)
**Files:**
- Delegate to: `firestore-rules-author` subagent
- Modify: `firestore.rules:1005-1030`

- [ ] **Step 1: Author hardened rules for `/erp_state/{docId}`**
  Replace `allow write: if true;` with structured zero-trust rules:
  1. Allow read for authenticated sessions.
  2. For state updates:
     - Privileged keys (`settings`, `accessGrants`, `pointRules`, `departments`, `auditLogs`) CANNOT be modified unless the caller is verified Admin.
     - Safe member writes (self-registration, KYC updates, workshop signups, daily quiz answers, task submissions) are permitted without privilege escalation (`roles` restricted to `['Member']` or `['Trainee']`).
- [ ] **Step 2: Validate rules syntax**
  Validate with `firebase_validate_security_rules` to ensure zero compilation or syntax errors.

---

### Phase 5: Document Partitioning & Concurrency Timestamp Merge (`useQuantersStore.ts` & `auth.ts`)
**Files:**
- Modify: `src/lib/firebase/auth.ts:550-730`
- Modify: `src/lib/store/useQuantersStore.ts:1860-1930`

- [ ] **Step 1: Partition monolithic document into shards**
  - Document 1: `/erp_state/main` (Catalog: departments, teams, active workshops, badges, explore posts, settings) $\to$ stays ~50 KB permanently.
  - Document 2: `/erp_state/members_shard` (Member roster and profiles).
  - Document 3: `/erp_state/history_shard` (Archived audit logs & ledger transactions).
  - Eliminates the 1 MiB document ceiling forever.
- [ ] **Step 2: Implement transparent shard merger in `pullErpStateFromFirestore()`**
  Fetch active shards in parallel and merge into the store state, maintaining 100% backwards compatibility with all UI components.
- [ ] **Step 3: Implement item-level timestamp reconciliation (`updatedAt`)**
  When applying cloud updates, reconcile each member/workshop/task by `updatedAt` timestamp, preventing concurrent writes from overwriting each other.

---

### Phase 6: Comprehensive Automated Testing & Validation Suite
*Automated verification scripts to guarantee zero regressions, complete security hardening, and quota survival before deployment.*

**Files:**
- Create: `scripts/tests/test_sw_bandwidth.mjs`
- Create: `scripts/tests/test_pii_masking.mjs`
- Create: `scripts/tests/test_direct_registration.mjs`
- Create: `scripts/tests/test_rules_penetration.mjs`
- Create: `scripts/tests/test_concurrency_merge.mjs`
- Create: `scripts/tests/test_offline_pwa.mjs`

- [ ] **Step 1: Test Suite 1 — Bandwidth & Precache Quota Test (`test_sw_bandwidth.mjs`)**
  - Launch clean Playwright browser session with empty cache.
  - Track total network byte transfer during initial visit to `/`.
  - **Assertion 1:** Total network download on clean first visit must be **$< 350\text{ KB}$** (down from $9.75\text{ MB}$).
  - **Assertion 2:** Service Worker must NOT eagerly download the 25 route bundles in the background.
  - **Result:** Daily visitor headroom confirmed at $> 1,400\text{ visitors/day}$ on Firebase free tier.

- [ ] **Step 2: Test Suite 2 — Privacy & PII Scoping Test (`test_pii_masking.mjs`)**
  - **Test 2A (Student Session):** Sign in as an ordinary member (`role: "Member"`). Inspect `localStorage.getItem("quanters-offline-cache-v10")`.
    - **Assertion:** Other members' `phone`, `wilaya`, `commune`, `housingType`, `commuteTime`, and `cvUrl` are `undefined` or masked.
  - **Test 2B (Admin Session):** Sign in as Super Admin (`quantaclubdz@gmail.com`).
    - **Assertion:** Full KYC details, phone numbers, and addresses remain 100% visible in `/admin/members/[id]`.
  - **Test 2C (Self Profile):** Member viewing their own `/profile`.
    - **Assertion:** The member still has 100% access to edit their own phone and address.

- [ ] **Step 3: Test Suite 3 — Direct Registration & API Shielding Test (`test_direct_registration.mjs`)**
  - **Test 3A (Direct Registration):** Register with a valid email.
    - **Assertion:** User is immediately signed in and redirected to `/onboarding`.
    - **Assertion:** Strictly ZERO `sendEmailVerification` prompts, barriers, or popups (per instruction).
  - **Test 3B (Disposable Email Blocking):** Register with `test@tempmail.com`.
    - **Assertion:** Registration blocked locally with clear message in 0ms without external API calls.
  - **Test 3C (Typo Correction):** Register with `user@gmai.com`.
    - **Assertion:** Local suggestion `user@gmail.com` offered without external API calls.
  - **Test 3D (Network Key Shielding):** Inspect all outgoing HTTP requests during registration.
    - **Assertion:** ZERO third-party API secret keys transmitted in query strings or headers.

- [ ] **Step 4: Test Suite 4 — Firestore Security Rules Penetration Test (`test_rules_penetration.mjs`)**
  - **Test 4A (Unauthenticated Overwrite Attack):** Send unauthenticated REST `PATCH` to `/erp_state/main` attempting to modify `settings` or `accessGrants`.
    - **Assertion:** Request rejected with `PERMISSION_DENIED` (403).
  - **Test 4B (Privilege Escalation Attack):** Attempt self-registration with payload containing `roles: ['Super Admin']`.
    - **Assertion:** Request rejected by database rules.
  - **Test 4C (Legitimate Student Action):** Authenticated member submits daily quiz answer or workshop registration.
    - **Assertion:** Request accepted with 200 OK.

- [ ] **Step 5: Test Suite 5 — Document Sharding & Concurrency Simulation (`test_concurrency_merge.mjs`)**
  - **Test 5A (Document Size Check):** Verify serialized byte size of `/erp_state/main`, `/erp_state/members_shard`, and `/erp_state/history_shard`.
    - **Assertion:** All documents are strictly $< 100\text{ KB}$ (far below the $1,048,576\text{ bytes}$ limit).
  - **Test 5B (Concurrent Edit Reconciliation):** Spawn two concurrent browser contexts:
    - Context A updates Member 1 status to `"Active"`.
    - Context B updates Task 1 assignee status to `"Validated"`.
    - Both contexts trigger `syncWithServer(true)` simultaneously.
    - **Assertion:** Both updates persist in cloud state without either update overwriting the other.

- [ ] **Step 6: Test Suite 6 — Offline PWA Dynamic Caching Test (`test_offline_pwa.mjs`)**
  - Navigate to `/workshops` and `/checkin` online (adds them to runtime cache).
  - Disconnect network using `page.context().setOffline(true)`.
  - Reload `/workshops` and `/checkin`.
  - **Assertion:** Both pages load, render QR check-in code, and remain fully functional offline.

---

### Phase 7: Production Build, Deployment & Live Verification
- [ ] **Step 1: Static typecheck (`npx tsc --noEmit`)** $\to$ Verify 0 errors.
- [ ] **Step 2: Production static build (`npm run build`)** $\to$ Export all 40 routes to `out/`.
- [ ] **Step 3: Live deploy (`firebase deploy --only hosting,firestore:rules`)**.
- [ ] **Step 4: Live production smoke test** $\to$ Execute all 6 test suites against `https://quanters.web.app` and capture verified screenshot artifacts.
