# 100% Isolated Simultaneous Dual-Account (Admin & Member) Comprehensive Platform Testing Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Conduct an exhaustive, 100% cookie- and storage-isolated simultaneous end-to-end test of EVERY interactive option on the QUANTERS ERP platform across two concurrent Playwright browser sessions (Admin on Desktop 1440×900 and Member on Mobile iPhone 14 390×844), performing Add, Edit, Delete, Check-in, Exams, Proposals, Project Submissions, Daily Quiz, Broadcasts, and Archival, while immediately fixing any identified bugs.

**Architecture:** A unified Playwright dual-context test orchestrator (`scripts/tests/test_simultaneous_dual_session.mjs`) initializes two completely isolated browser contexts (Context A: Admin Desktop and Context B: Member Mobile iPhone 14) with zero shared cookies, local storage, or session storage. The two sessions run in parallel, triggering and observing state mutations in real time across Cloud Firestore dual-shard documents (`/erp_state/main` and `/erp_state/members_shard`).

**Tech Stack:** Next.js 15.5.28 (React 19, TypeScript 5.7, App Router), Zustand 5, Cloud Firestore (sharded sync), Playwright (multi-context 100% isolated storage), Node.js.

---

### Scope Directives & Permanent Exclusions
1. **2/3 Voting Quorum:** Permanently excluded per user instruction (`forget abt وتصويت أغلبية الثلثين 2/3`).
2. **Department Budget Fields:** Permanently excluded per user instruction.
3. **-25 XP Absence Penalties:** Permanently excluded per user instruction.
4. **100% Cookie & Storage Isolation:** Strict separation between Admin and Member browser contexts.

---

## File Structure Map

| Target File | Primary Responsibility |
| :--- | :--- |
| `scripts/tests/test_simultaneous_dual_session.mjs` | **Isolated Test Orchestrator**: Manages two independent Playwright contexts (`adminContext` & `memberContext`), driving 10 interactive operational cycles. |
| `src/lib/store/useQuantersStore.ts` | **State & Sync Engine**: State mutations, PIN token verification, exam scoring, waitlist replenishment, and tombstone ingestion. |
| `src/app/admin/workshops/page.tsx` & `src/app/(mobile)/workshops/page.tsx` | **Workshop Operations**: Workshop CRUD (Add, Edit, Delete), seat booking, waitlist, and live 6-digit PIN attendance. |
| `src/app/admin/badges/page.tsx` & `src/app/(mobile)/exams/[badgeId]/page.tsx` | **Badges & Timed Exams**: Badge CRUD (Add, Edit, Delete), multiple-choice authoring, timer auto-submit, passing threshold (80%). |
| `src/app/admin/proposals/page.tsx` & `src/app/(mobile)/proposals/page.tsx` | **Proposals Engine**: Proposal submission (Member +25 XP), review, approval, rejection with feedback (Admin). |
| `src/app/(mobile)/projects/submit/page.tsx` & `src/app/admin/tasks/page.tsx` | **Project Deliverables**: Member project submission (GitHub URL, demo link), Admin review, evaluation rubric, and XP awarding. |
| `src/app/admin/explore/page.tsx` & `src/app/(mobile)/explore/page.tsx` | **Explore & Daily Quiz**: Article CRUD (Add, Edit, Delete with markdown), daily quiz configuration, solving quiz (+10 XP lock), article auto-archiving (`READ`). |
| `src/app/admin/messages/page.tsx` & `src/app/(mobile)/notifications/page.tsx` | **Broadcast Communications**: Admin dispatches club-wide or departmental announcement; Member receives instant toast/notification. |
| `src/app/admin/org/page.tsx` & `src/app/manager/page.tsx` | **Organizational Units & Management**: Department CRUD (no budget fields), team assignment, department task validation, trainee endorsements. |
| `src/app/admin/points/page.tsx` & `src/app/(mobile)/profile/page.tsx` | **Points Ledger & Appeals**: Manual XP adjustments (+/-), member appeal submission, compensating transaction reversals, digital ID 3D flip. |
| `src/app/admin/members/page.tsx` & `src/app/admin/former-members/page.tsx` | **Member Lifecycle & Archival**: Onboarding approval (+50 XP), role promotion, deactivation (status `Removed` + mascot modal), reactivation. |

---

## Task Decomposition

### Task 1: 100% Isolated Dual-Session Playwright Harness
**Files:**
- Create: `scripts/tests/test_simultaneous_dual_session.mjs`
- Test: `node scripts/tests/test_simultaneous_dual_session.mjs --phase auth`

- [ ] **Step 1: Write two completely isolated browser contexts**
  - Context A (Admin): `browser.newContext({ viewport: { width: 1440, height: 900 }, userAgent: "QUANTERS-Admin-Desktop" })`.
  - Context B (Member): `browser.newContext({ viewport: { width: 390, height: 844 }, userAgent: "QUANTERS-Member-Mobile-iPhone14", isMobile: true, hasTouch: true })`.
  - Verify zero storage sharing (separate cookies, separate `localStorage`, separate indexedDB).
- [ ] **Step 2: Concurrent Authentication Automation**
  - Admin logs in with `admin@quanta.club` / `ayoubsarri1@gmail.com` $\to$ lands on `/admin/overview`.
  - Member logs in with `member@quanta.club` (or registers new account) $\to$ lands on `/home`.
- [ ] **Step 3: Run auth isolation verification**
  Run: `node scripts/tests/test_simultaneous_dual_session.mjs --phase auth`
  Expected: Both sessions authenticate simultaneously, cookies and local cache are 100% independent.
- [ ] **Step 4: Fix any cross-context token leakage**
- [ ] **Step 5: Commit**
  `git commit -m "test: implement 100% isolated dual-context Playwright test harness"`

---

### Task 2: Real-Time Onboarding, KYC & HR Admission
**Files:**
- Modify: `scripts/tests/test_simultaneous_dual_session.mjs`
- Target: `src/app/(mobile)/onboarding/page.tsx`, `src/components/mobile/WaitingForApprovalScreen.tsx`, `src/app/admin/members/page.tsx`

- [ ] **Step 1: Write Onboarding & Admission test flow**
  1. Member context registers new account, navigates to `/onboarding`.
  2. Member fills 10 KYC fields (Academic year, Faculty, Wilaya, Housing, PC capability, 7-day availability grid), submits.
  3. Member arrives at `/home` gated by `WaitingForApprovalScreen` (`hr_waiting_cosmic_bg.png`).
  4. Concurrently, Admin context in `/admin/overview` observes pending approval counter increment by +1.
  5. Admin opens `/admin/members`, reviews member's dossier, clicks "Approve Admission".
  6. Member session updates in real-time, waiting gate dissolves, +50 XP welcome toast appears, full mobile navigation activates.
- [ ] **Step 2: Run test to verify admission pipeline**
  Run: `node scripts/tests/test_simultaneous_dual_session.mjs --phase onboarding`
- [ ] **Step 3: Fix any synchronization latency or missing welcome message**
- [ ] **Step 4: Verify test passes**
- [ ] **Step 5: Commit**
  `git commit -m "test: verify simultaneous onboarding, KYC submission, and real-time admission approval"`

---

### Task 3: Workshop Operations (Add, Edit, Seat Booking, Live PIN Check-In, Delete)
**Files:**
- Modify: `scripts/tests/test_simultaneous_dual_session.mjs`
- Target: `src/app/admin/workshops/page.tsx`, `src/app/(mobile)/workshops/page.tsx`, `src/app/(mobile)/checkin/page.tsx`

- [ ] **Step 1: Write complete Workshop CRUD & Check-in test flow**
  1. **ADD:** Admin creates workshop "Quantum Computing & Qiskit Lab" (Capacity: 1 seat, Date, Time, Instructor).
  2. Member navigates to `/workshops`, sees new workshop immediately in catalog.
  3. Member clicks "Register" $\to$ books Seat #1.
  4. Second test registration placed on Waitlist (#1).
  5. **EDIT:** Admin edits workshop description and room location $\to$ Member sees updated room instantly.
  6. **CHECK-IN:** Admin opens workshop session, generates 6-digit live PIN (e.g. `839104`).
  7. Member navigates to `/checkin`, enters PIN $\to$ success chime $\to$ +30 XP recorded in ledger.
  8. Duplicate check-in with same PIN $\to$ blocked ("Already Checked In").
  9. Member cancels seat $\to$ Waitlisted member auto-promoted to confirmed seat.
  10. **DELETE:** Admin deletes/archives workshop $\to$ workshop removed from member feed.
- [ ] **Step 2: Run test to verify workshop CRUD and check-in bounds**
  Run: `node scripts/tests/test_simultaneous_dual_session.mjs --phase workshops`
- [ ] **Step 3: Fix any seat calculation or check-in state discrepancies**
- [ ] **Step 4: Verify test passes**
- [ ] **Step 5: Commit**
  `git commit -m "test: verify workshop Add, Edit, Delete, seat booking, PIN check-in, and waitlist promotion"`

---

### Task 4: Skill Badges & Timed Exams (Add, Edit, Answering, Auto-Submit, Delete)
**Files:**
- Modify: `scripts/tests/test_simultaneous_dual_session.mjs`
- Target: `src/app/admin/badges/page.tsx`, `src/app/(mobile)/badges/page.tsx`, `src/app/(mobile)/exams/[badgeId]/page.tsx`

- [ ] **Step 1: Write complete Badge & Exam CRUD test flow**
  1. **ADD:** Admin navigates to `/admin/badges`, creates badge "Quantum Cryptography Master" (50 XP, 3 multiple-choice questions, 80% passing threshold).
  2. Member navigates to `/badges`, sees badge locked with prerequisites.
  3. **EDIT:** Admin edits exam questions, updates question text $\to$ member sees updated questions.
  4. **EXAM PASS:** Member clicks "Take Examination", enters timed exam room `/exams/[badgeId]`.
  5. Member answers questions correctly, submits $\to$ score 100% $\to$ confetti animation $\to$ badge unlocked (+50 XP).
  6. **TIMER AUTO-SUBMIT:** Member starts second exam, waits for timer to reach 00:00 $\to$ auto-submits answers.
  7. **DELETE:** Admin deletes an obsolete badge $\to$ verified removed from catalog.
- [ ] **Step 2: Run test to verify badge CRUD, exam scoring, and redaction**
  Run: `node scripts/tests/test_simultaneous_dual_session.mjs --phase badges`
- [ ] **Step 3: Fix any answer key leakage or exam timer bugs**
- [ ] **Step 4: Verify test passes**
- [ ] **Step 5: Commit**
  `git commit -m "test: verify badge Add, Edit, Delete, timed exam room, auto-submit, and credential unlocking"`

---

### Task 5: Proposals Engine & Project Deliverables (Submit, Review, Grade, Delete)
**Files:**
- Modify: `scripts/tests/test_simultaneous_dual_session.mjs`
- Target: `src/app/(mobile)/proposals/page.tsx`, `src/app/admin/proposals/page.tsx`, `src/app/(mobile)/projects/submit/page.tsx`, `src/app/admin/tasks/page.tsx`

- [ ] **Step 1: Write Proposals & Project Submissions test flow**
  1. **PROPOSAL ADD:** Member navigates to `/proposals`, submits proposal "AI Hackathon on Quantum Circuits" (+25 XP pending review).
  2. Admin navigates to `/admin/proposals`, reviews proposal details, clicks "Approve Proposal" $\to$ proposal marked Approved, +25 XP confirmed in ledger.
  3. Admin tests proposal rejection with feedback note.
  4. **PROJECT SUBMISSION:** Member navigates to `/projects/submit`, submits project deliverable (Title, GitHub URL, live demo URL, description).
  5. Admin views project in `/admin/tasks` / submissions queue, reviews repository link.
  6. Admin grades project (Full Score 100), validates $\to$ +XP awarded to member.
  7. **TASK CRUD:** Admin creates new task, edits requirements, deletes obsolete task.
- [ ] **Step 2: Run test to verify proposal and project submission pipelines**
  Run: `node scripts/tests/test_simultaneous_dual_session.mjs --phase proposals`
- [ ] **Step 3: Fix any proposal submission or project status bugs**
- [ ] **Step 4: Verify test passes**
- [ ] **Step 5: Commit**
  `git commit -m "test: verify proposals submission, approval, project deliverables, and task grading"`

---

### Task 6: Explore Library, Markdown Articles & Daily Quiz (Add, Edit, Lock, Delete)
**Files:**
- Modify: `scripts/tests/test_simultaneous_dual_session.mjs`
- Target: `src/app/admin/explore/page.tsx`, `src/app/(mobile)/explore/page.tsx`

- [ ] **Step 1: Write Explore Article & Quiz test flow**
  1. **ARTICLE ADD:** Admin navigates to `/admin/explore`, publishes article "Superconducting Qubits Explained" with markdown headers, code snippets, and tags.
  2. Member opens `/explore`, reads the article to the bottom $\to$ article auto-tagged with `READ` badge and archived.
  3. **ARTICLE EDIT:** Admin edits article markdown text $\to$ member sees live updates.
  4. **QUIZ CONFIG & LOCK:** Admin configures Daily Quiz question ("What is quantum superposition?") with 4 choices.
  5. Member solves daily quiz correctly $\to$ +10 XP awarded $\to$ subsequent attempt on the same day blocked ("Completed Today").
  6. **ARTICLE DELETE:** Admin deletes an article $\to$ tombstone recorded, article disappears from member catalog.
- [ ] **Step 2: Run test to verify article CRUD, auto-archival, and daily quiz single-attempt lock**
  Run: `node scripts/tests/test_simultaneous_dual_session.mjs --phase explore`
- [ ] **Step 3: Fix any markdown rendering or quiz lock bugs**
- [ ] **Step 4: Verify test passes**
- [ ] **Step 5: Commit**
  `git commit -m "test: verify article Add, Edit, Delete, auto-archival, and daily quiz single-attempt lockout"`

---

### Task 7: Broadcast Communications & Notifications (Dispatch & Receive)
**Files:**
- Modify: `scripts/tests/test_simultaneous_dual_session.mjs`
- Target: `src/app/admin/messages/page.tsx`, `src/app/(mobile)/notifications/page.tsx`, `src/components/mobile/BottomNavBar.tsx`

- [ ] **Step 1: Write Broadcast Message test flow**
  1. **DISPATCH:** Admin navigates to `/admin/messages`, composes broadcast "Special General Assembly Announcement" (Priority: High, Target: All Members), clicks "Dispatch Announcement".
  2. **RECEIVE:** Member session on mobile receives notification banner / unread badge indicator on bottom nav bar.
  3. Member opens `/notifications`, reads announcement, clicks "Mark as Read".
  4. Badge counter on bottom nav bar decrements to 0.
  5. Admin tests deleting a dispatched broadcast.
- [ ] **Step 2: Run test to verify message dispatch and notification read status**
  Run: `node scripts/tests/test_simultaneous_dual_session.mjs --phase messages`
- [ ] **Step 3: Fix any notification delivery or unread badge calculation bugs**
- [ ] **Step 4: Verify test passes**
- [ ] **Step 5: Commit**
  `git commit -m "test: verify broadcast announcement dispatch, notification receipt, and read badge updates"`

---

### Task 8: Organizational Units & Manager Portal (Add Dept, Team, Task Validation)
**Files:**
- Modify: `scripts/tests/test_simultaneous_dual_session.mjs`
- Target: `src/app/admin/org/page.tsx`, `src/app/manager/page.tsx`

- [ ] **Step 1: Write Organizational Structure test flow**
  1. **DEPT ADD:** Admin navigates to `/admin/org`, creates new department "Quantum Engineering Division" (NO budget fields).
  2. **TEAM ADD:** Admin creates scientific team "Hardware & Nanodevices" under the department.
  3. Admin assigns Member to the new department.
  4. **MANAGER PORTAL:** Department Head logs into `/manager`, views assigned department roster and task queue.
  5. Manager endorses Member Trainee for graduation to Active status.
  6. **DEPT EDIT & DELETE:** Admin edits department name and archives obsolete team.
- [ ] **Step 2: Run test to verify organizational CRUD and manager validation**
  Run: `node scripts/tests/test_simultaneous_dual_session.mjs --phase org`
- [ ] **Step 3: Fix any department routing or manager filtering bugs**
- [ ] **Step 4: Verify test passes**
- [ ] **Step 5: Commit**
  `git commit -m "test: verify department and team Add, Edit, Delete, and manager portal endorsement"`

---

### Task 9: Points Ledger Adjustments, Member Appeals & Profile ID Card
**Files:**
- Modify: `scripts/tests/test_simultaneous_dual_session.mjs`
- Target: `src/app/admin/points/page.tsx`, `src/app/(mobile)/profile/page.tsx`

- [ ] **Step 1: Write Points Adjustment, Appeals & Profile test flow**
  1. **MANUAL ADJUSTMENT:** Admin navigates to `/admin/points`, issues manual adjustment (+20 XP, reason: "Outstanding Science Fair Volunteer").
  2. Member checks `/profile` points history ledger, sees +20 XP entry with timestamp and reason.
  3. **APPEAL:** Member clicks "Submit Appeal" on an erroneous transaction, inputs justification note.
  4. Admin views appeal in `/admin/points`, clicks "Approve & Reverse" $\to$ compensating ledger transaction executed.
  5. **PROFILE DIGITAL ID:** Member tests digital student ID 3D flip (front/back), Standing & Qualification 3-ring roadmap, edits phone contact.
  6. **SIGN-OUT MODAL:** Member tests Sign-Out confirmation modal $\to$ clicks "Cancel" (session stays active) $\to$ clicks "Confirm Sign Out" $\to$ clean redirect to `/welcome`.
  7. Admin tests admin sign-out confirmation modal.
- [ ] **Step 2: Run test to verify points ledger reversibility, appeals, and profile ID interactions**
  Run: `node scripts/tests/test_simultaneous_dual_session.mjs --phase points`
- [ ] **Step 3: Fix any ledger arithmetic or profile modal bugs**
- [ ] **Step 4: Verify test passes**
- [ ] **Step 5: Commit**
  `git commit -m "test: verify points manual adjustment, member appeals, profile ID card, and sign-out confirmation modals"`

---

### Task 10: Account Deactivation, Archival & Former Members
**Files:**
- Modify: `scripts/tests/test_simultaneous_dual_session.mjs`
- Target: `src/app/admin/members/page.tsx`, `src/app/admin/former-members/page.tsx`, `src/app/admin/alumni/page.tsx`

- [ ] **Step 1: Write Account Deactivation & Former Members test flow**
  1. Admin navigates to `/admin/members`, selects test Member, clicks "Move to Former Members" (status = `Removed`).
  2. Member active session receives real-time snapshot $\to$ immediately displays Deactivated Account modal with `mascot_account_deleted.png` and farewell message.
  3. Member attempts login with same credentials $\to$ blocked ("Account Deactivated").
  4. Admin navigates to `/admin/former-members`, inspects archived member dossier.
  5. Admin clicks "Restore Member" $\to$ account status returns to `Active`.
  6. Member logs back in successfully.
  7. Admin tests moving graduated member to `/admin/alumni`.
- [ ] **Step 2: Run test to verify deactivation, former members, and alumni transitions**
  Run: `node scripts/tests/test_simultaneous_dual_session.mjs --phase archival`
- [ ] **Step 3: Fix any deactivation gate bypasses or restore bugs**
- [ ] **Step 4: Verify test passes**
- [ ] **Step 5: Commit**
  `git commit -m "test: verify account deactivation, former members archival, and alumni transition"`

---

### Task 11: Full End-to-End Simultaneous Execution & Defect Fixing
**Files:**
- Test: `node scripts/tests/test_simultaneous_dual_session.mjs --all`
- All modified components across `src/`

- [ ] **Step 1: Execute all 10 operational cycles in sequence with 100% isolation**
- [ ] **Step 2: Capture screenshots and failure logs for any regression**
- [ ] **Step 3: Implement exact, minimal code fixes for any failing tests**
- [ ] **Step 4: Re-run full test suite until 100% pass (0 failures, 0 console errors)**
- [ ] **Step 5: Commit**
  `git commit -m "fix: resolve all defects discovered during 100% isolated simultaneous dual-account testing"`

---

### Task 12: Production Build, Cloud Deploy & GitHub Sync
**Files:**
- Build: `npm run build`
- Deploy: `npx firebase-tools deploy --only hosting`
- Git: `git push origin main`

- [ ] **Step 1: Run production Next.js build (`npm run build`)**
  Verify 40 static routes compile cleanly in <10s with 0 errors and lean bundle.
- [ ] **Step 2: Deploy to Firebase Hosting**
  Execute `npx firebase-tools deploy --only hosting`.
- [ ] **Step 3: Commit and push all test scripts and code fixes to GitHub `main`**
- [ ] **Step 4: Deliver exhaustive test report with screenshots and verification telemetry**

---

## Execution Handoff

Plan updated with 100% isolation and all platform features (Workshops, Exams, Proposals, Projects, Explore, Quiz, Messages, Org, Points, Archival) while completely excluding 2/3 voting quorum and budget fields.

**Shall I proceed with executing this plan step-by-step now?**
