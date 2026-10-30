# QUANTERS ERP — Platform Hardening & Remediation Plan (Final)

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remediate all critical cybersecurity, database integrity, functional synchronization, and UI ergonomics issues without disrupting or altering any existing user features, options, or data structures.

**Custom Adjustments Applied:**
- ❌ *Department Financial Budget fields deleted* from plan per user directive.
- ❌ *Workshop Absence deduction penalty (-25 XP)* deleted from plan per user directive.

**Tech Stack:** Next.js 15, TypeScript 5, Cloud Firestore Security Rules, Zustand, Tailwind CSS, Service Workers (PWA).

---

## Final Issue to Option Mapping

| # | Vulnerability / Issue | Assigned Option / Tab | Root Cause / Function | Surgical Non-Breaking Fix |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **VULN-FS-01: Public Read on Database** | **All Routes** (`/welcome`, `/home`, `/workshops`, `/admin/*`) | In `firestore.rules`, `allow read: if true;` was left open on `/erp_state/{docId}` to allow guest catalog viewing during App Check testing. | Change to `allow read: if isAuthenticated();`. All legitimate users have a valid session via `ensureFirebaseAuthSession()`, so the app functions 100% identically while blocking unauthenticated data scrapers. |
| **2** | **VULN-FS-02: Field Omission Bypass** | **State Sync** (`syncWithServer`, `pushBatchUpdatesToServer`) | `isSafeErpStateUpdate()` checked `!('settings' in request.resource.data)`; omitting `settings` allowed unauthorized writes. | Require `isAuthenticated()` and use `request.resource.data.diff(resource.data).affectedKeys().hasOnly([...])` to restrict non-admin updates strictly to member-modifiable arrays (`members`, `workshops`, `tasks`, etc.). |
| **3** | **VULN-FS-03: Bootstrap Admin Email Spoofing** | **Admin Access Gate** (`/admin/*` all 14 modules) | `isBootstrapAdmin()` checked email list without checking `request.auth.token.email_verified == true`. | Add `request.auth.token.email_verified == true`. Legitimate bootstrap admins already have verified emails; spoofed accounts without verification are blocked. |
| **4** | **VULN-XSS-01: Markdown Stored XSS** | **Explore & Articles** (`/explore`, `/proposals`) | `MarkdownArticleRenderer.tsx` rendered `<a href={token.href}>` directly without checking URL protocols. | Add `sanitizeExternalUrl()` allowing only `http:`, `https:`, `mailto:`, and `#`. Harmful `javascript:` links are sanitized to `#`. All legitimate links continue to open normally. |
| **5** | **VULN-FS-04: PIN Sniffing in Workshops** | **Workshops & Check-In** (`/workshops`, `/checkin`, `/admin/workshops`) | `liveSixDigitCode` and `liveQrToken` are stored directly on the public workshop object. | Obfuscate the secret check-in token or restrict access so only organizers in `/admin/workshops` generate and see the live PIN, while check-in verification continues to work securely. |
| **6** | **1MB Document Limit Ceiling (~345 members)** | **Database Engine & Sharding** (`/erp_state/main`, `members_shard`) | `/erp_state/main` kept a full copy of all members instead of offloading extended profiles to `members_shard`. | In `pushShardedCloudUpdate`, ensure `main` stores only core roster summaries while `members_shard` stores full extended dossiers. Client hydrates both on boot with zero UI change. |
| **7** | **Mutual Recursion Stack Overflow Crash** | **Offline Cache & PWA** (`quanters-offline-cache-v10`) | `saveToLocalCache` calls `compactAndPruneQuota`, which in turn calls `saveToLocalCache` in line 1672, looping infinitely if quota > 5MB. | Add re-entrancy lock `let isCompactingQuota = false;`. If true, prevent recursive call and fallback cleanly to memory/session storage. Prevents tab freezing. |
| **8** | **Ghost Record Resurrection** | **Record Deletions** (`/admin/members`, `/admin/workshops`, `/admin/messages`) | Deletions were stored in local `localStorage` tombstones; other devices with stale cache re-uploaded deleted records. | Sync `deletedIds` array centrally in `/erp_state/main` so all devices recognize deletions and never resurrect them. |
| **9** | **SW Precache Partition Mismatch** | **PWA Offline Loading** (`public/sw.js`) | Precache placed assets in `PAGES_CACHE`, but fetch handler looked for `/brand/*` in `STATIC_CACHE`. | Cache brand assets and icons directly into `STATIC_CACHE` during Service Worker install, ensuring 100% offline icon/logo availability. |
| **10** | **Waitlist Auto-Promote Inactive by Default** | **Workshops & Labs** (`/workshops`, `/admin/settings`) | `cancelWorkshopRegistration` checked `Boolean(state.settings.waitlistAutoPromote)`. In seed data, this is `undefined`, evaluating to `false`. | Change to `Boolean(state.settings.waitlistAutoPromote ?? true)`. Waitlist members are automatically promoted upon cancellation as intended. |
| **11** | **Check-In Persistence Missing** | **QR Pass & Attendance** (`/checkin`, `/workshops`) | `verifyWorkshopCheckIn` updated Zustand memory state but omitted `saveToLocalCache()` and `syncWithServer(true)`. | Append `get().saveToLocalCache(); get().syncWithServer(true).catch(() => {});` to guarantee instant disk persistence and cloud sync upon scanning. |
| **12** | **Exam XP Omitted from Ledger** | **Skill Credentials & Badges** (`/badges`, `/exams/[badgeId]`, `/profile`) | `completeBadgeExam` awarded XP to `member.xpTotal` but did not create an entry in `state.ledger`. | Append a `PointsLedgerEntry` (`ruleLabel: "Skill Qualification Exam"`, `source: "Badge"`) to `state.ledger`. Balances XP with transaction history. |
| **13** | **Exam Timer Auto-Submit Missing** | **Exam Runner** (`/exams/[badgeId]`) | Timer reached `00:00` without triggering form submission. | Add `useEffect` listening to `secondsRemaining === 0` to call `handleSubmitExam()` automatically with a "Time expired" notice. |
| **14** | **Registration Status Gating** | **KYC & Onboarding** (`/welcome`, `/onboarding`, Waiting Screen) | `registerAccount` set `status: "Trainee"` by default instead of honoring `settings.onboardingAutoApprove`. | Set `status: (settings.onboardingAutoApprove ?? true) ? "Trainee" : "Pending"` at registration time. Pending members are correctly gated. |
| **15** | **Welcome Screen Touch Target** | **Welcome Portal** (`/welcome`) | Informational disclaimer banner measured 27px height in automated testing. | Set minimum height to 36px with comfortable touch padding. |

---

## Action Checklist

### Task 1: Security Rules Lockdown (`firestore.rules`)
- [ ] Require `isAuthenticated()` for `/erp_state/{docId}`.
- [ ] Require `request.auth.token.email_verified == true` in `isBootstrapAdmin()`.
- [ ] Harden `isSafeErpStateUpdate()` against field omissions.
- [ ] Validate rules via `firebase_validate_security_rules`.

### Task 2: Markdown XSS Sanitization (`MarkdownArticleRenderer.tsx`)
- [ ] Implement URL protocol verification for markdown links (`sanitizeExternalUrl`).
- [ ] Prevent execution of `javascript:...` links.

### Task 3: Local Storage & Quota Re-entrancy Lock (`useQuantersStore.ts`)
- [ ] Add re-entrancy lock variable to prevent recursion in `compactAndPruneQuota()`.
- [ ] Synchronize tombstones centrally to prevent ghost records.

### Task 4: Functional Logic Fixes (`useQuantersStore.ts`)
- [ ] Add `saveToLocalCache()` and `syncWithServer(true)` in `verifyWorkshopCheckIn()`.
- [ ] Add `waitlistAutoPromote ?? true` fallback in `cancelWorkshopRegistration()`.
- [ ] Create `PointsLedgerEntry` upon exam passing in `completeBadgeExam()`.
- [ ] Initialize `status: (settings.onboardingAutoApprove ?? true) ? "Trainee" : "Pending"` in `registerAccount()`.

### Task 5: Exam Auto-Submit (`src/app/(mobile)/exams/[badgeId]/page.tsx`)
- [ ] Auto-submit exam when `secondsRemaining === 0`.

### Task 6: PWA Service Worker Cache (`public/sw.js`)
- [ ] Direct `/brand/*` and `/icons/*` assets into `STATIC_CACHE`.

### Task 7: Verification & End-to-End Testing
- [ ] Playwright verification across mobile and desktop routes.
- [ ] Production build (`npm run build`).
- [ ] Git commit and push to `origin/main` + Firebase deploy.
