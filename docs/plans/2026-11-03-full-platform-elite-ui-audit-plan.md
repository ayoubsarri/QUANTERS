# Full Platform Elite UI & Architecture Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Conduct an exhaustive, multi-viewport audit and systematic enhancement of all 35+ routes and components across the QUANTERS platform, strictly enforcing the 4 pillars of the **Elite Web UI Protocol** (Design Token System via root `DESIGN.md`, Anti-Slop Art Direction, Vercel Web Design & Performance Standards, and automated Playwright Visual Self-Review Loop across 320px, 390px, and 1440px viewports).

**Architecture:** 
1. **Design Token Foundation:** Formalize `DESIGN.md` in the project root as the immutable single source of truth for all brand colors, typography, spacing, shadows, and Arabic-first micro-typographic rules.
2. **Automated Visual Audit Harness:** Build a dedicated headless Playwright script (`scripts/tests/run_elite_platform_audit.mjs`) that tests every page at 320px (ultra-narrow mobile), 390px (standard mobile), and 1440px (desktop), verifying zero horizontal overflow, trapping console/network errors, inspecting touch target minimums ($\ge 44\times 44\text{px}$), and checking ARIA landmarks.
3. **Domain-Segmented Code Audits & Remediation:** Execute focused audits across 6 distinct functional zones (Public/Auth Gateway, Mobile Member Core, Mobile Submissions & Onboarding, Admin Command & Members, Admin Academic/Content CMS, Universal Modals & Primitives), fixing design token drift, replacing AI slop layouts with high-contrast scientific art direction, and resolving a11y/performance gaps.
4. **Final Regression & Verification Gate:** Rerun the complete multi-viewport Playwright audit, compile a detailed before/after audit dossier, and deploy the verified build.

**Tech Stack:** Next.js 15.1 (React 19, TypeScript 5.7, App Router), Tailwind CSS 3.4, Zustand 5, Playwright 1.64 (Google Chrome channel), Cloud Firestore.

---

## Complete Route & Component Inventory

| Category | Route / Component | Viewport Target | Key Compliance Focus |
| :--- | :--- | :--- | :--- |
| **Root & Gateway** | `/` (Home / Landing / Auth Gate) | 320px, 390px, 1440px | Dynamic hero, auth card, smooth tab toggling, high-contrast CTA |
| **Public Showcase** | `/alumni` (Public Laureates Directory) | 320px, 390px, 1440px | Laureates grid, search filter, responsive card sizing, badge icons |
| **Mobile Core** | `/(mobile)/home` (Member Command Deck) | 320px, 390px | Anti-slop hierarchy, XP progress ring, quest cards, zero overflow |
| **Mobile Core** | `/(mobile)/explore` (Magazine & Quizzes) | 320px, 390px | Multi-quiz stepper, lock card, article feed, category filters |
| **Mobile Core** | `/(mobile)/workshops` (Workshops & RSVP) | 320px, 390px | Workshop cards, seat caps, attendance PIN modal, filter tabs |
| **Mobile Core** | `/(mobile)/badges` (Hexagonal Badges) | 320px, 390px | Hexagonal SVG rendering, unlocked/locked states, criteria sheet |
| **Mobile Core** | `/(mobile)/exams` & `[badgeId]` | 320px, 390px | Exam timer, question cards, option touch targets $\ge 44\text{px}$, passing modal |
| **Mobile Core** | `/(mobile)/profile` (Member Dossier) | 320px, 390px | Letter-fallback avatar, season XP editor, QR pass flip, achievements |
| **Mobile Funnels** | `/(mobile)/checkin` (Live Check-in) | 320px, 390px | Event QR/GPS scanning interface, error states, telemetry |
| **Mobile Funnels** | `/(mobile)/proposals` (Initiative Incubator)| 320px, 390px | Proposal submission modal, vote cards, status badges |
| **Mobile Funnels** | `/(mobile)/projects/submit` (Project Wizard)| 320px, 390px | Form validation, GitHub URL inputs, touch-friendly file upload |
| **Mobile Funnels** | `/(mobile)/notifications` (Alerts Feed) | 320px, 390px | Toast list, mark-all-as-read button, empty state, auto-archive |
| **Mobile Funnels** | `/(mobile)/manager` (Lead Console) | 320px, 390px | Team task sign-off, attendance verification, trainee badges |
| **Mobile Funnels** | `/(mobile)/onboarding` (KYC Funnel) | 320px, 390px | Multi-step wizard, 320px phone inputs, tags selector, university grid |
| **Mobile Funnels** | `/(mobile)/welcome` (Orientation / Status) | 320px, 390px | Cosmic mascot illustration, admission status poller, contact CTA |
| **Admin Command** | `/admin` & `/admin/overview` (Executive HQ) | 1440px, 768px | Live KPIs, real-time counters, recent audit stream, alert banner |
| **Admin Command** | `/admin/members` & `[id]` (Dossier CMS) | 1440px, 768px | Member table, season XP inline edit, role selector, delete modal |
| **Admin Content** | `/admin/badges` (Badge Authoring) | 1440px, 768px | Criteria editor, tier selector, exam question authoring table |
| **Admin Content** | `/admin/explore` (Editorial CMS) | 1440px, 768px | Dynamic quiz builder, JSON import/export, article markdown studio |
| **Admin Content** | `/admin/workshops` (Scheduler) | 1440px, 768px | Workshop scheduling, 6-digit PIN generator, attendee roster |
| **Admin Content** | `/admin/tasks` (Club Sprint Board) | 1440px, 768px | Kanban/list view, assignee picker, XP reward tag, completion verification |
| **Admin Content** | `/admin/points` (XP Ledger & Leaderboard) | 1440px, 768px | Transaction log, manual XP grant/revoke, appeal adjudication |
| **Admin Gov** | `/admin/proposals` (Review Pipeline) | 1440px, 768px | Proposal card triage, approval modal, feedback notes |
| **Admin Gov** | `/admin/access` (Admission Pipeline) | 1440px, 768px | Application review cards, approve/reject buttons, interview notes |
| **Admin Gov** | `/admin/invitations` (VIP Magic Links) | 1440px, 768px | Token generator, copy link, expiration countdown |
| **Admin Gov** | `/admin/alumni` & `/admin/former-members` | 1440px, 768px | Archive table, reactivation button, permanent purge gate |
| **Admin Gov** | `/admin/messages` (Broadcast Publisher) | 1440px, 768px | Target group selector (All/Alumni/Department), markdown composer |
| **Admin Gov** | `/admin/org` (Organizational Hierarchy) | 1440px, 768px | Department tree, executive board list, leader assignment |
| **Admin Gov** | `/admin/stats` (Season Analytics) | 1440px, 768px | Activity charts, domain distribution, historical comparisons |
| **Admin Gov** | `/admin/audit` (Security Mutation Log) | 1440px, 768px | Firestore mutation log, user actor, timestamp, payload inspector |
| **Admin Gov** | `/admin/settings` (Club Parameters) | 1440px, 768px | Season dates, registration toggle, email domain pool, sync health |
| **Shells & Modals** | `AdminSidebar` & `BottomNavBar` | 320px, 390px, 1440px | Active tab glow, safe area padding, collapsible drawer, z-index |
| **Shells & Modals** | `EditMemberModal`, `PersonalQRModal`, etc. | 320px, 390px, 1440px | Keyboard escape trap, focus lock, mobile sheet slide-up |

---

## Task Decomposition

### Task 1: Establish Root `DESIGN.md` & Formal Design Token System
**Files:**
- Create: `DESIGN.md` (project root)
- Inspect: `tailwind.config.ts`, `src/app/globals.css`

- [ ] **Step 1: Codify the complete Single Source of Truth `DESIGN.md`**
  - Brand identity: QUANTA Club (Cosmic Navy `#041226`, Cobalt `#061E47`, Deep Blue `#094C9C`, Royal `#1D63EB`, Electric Cyan `#29D2FF` / `#30C5F7`, Laser Gold `#FFE500` / `#FBB03B`).
  - Typography scale: Display/Headings (`Outfit`, `Syne`, Arabic `Changa`), Body/UI (`Plus Jakarta Sans`, Arabic `Cairo`), Classical/Quotes (`Amiri`, `Georgia`).
  - Strict 4px/8px spacing rhythm & Fitts's Law ($\ge 44\times 44\text{px}$ touch targets).
  - Elevation & Micro-shadow tokens (`shadow-card`, `shadow-hero`, `shadow-nav`, `shadow-glow`).
  - Anti-Slop layout rules: Asymmetrical card weights, border highlights (`border-white/10`), layered depth, zero generic template cards.
  - Vercel performance rules: Semantic HTML, CLS=0 image sizing, focus-visible outlines, mobile-first constraints (320px to 420px zero horizontal overflow).
- [ ] **Step 2: Verify alignment between `DESIGN.md`, `tailwind.config.ts`, and `src/app/globals.css`**
  - Ensure CSS custom properties match tokens.
  - Enforce tabular numerals (`tabular-nums`) for numeric data.
- [ ] **Step 3: Commit**
  `git commit -m "docs: establish DESIGN.md single source of truth for elite web UI protocol"`

---

### Task 2: Build Automated Multi-Viewport Playwright Visual Audit Runner
**Files:**
- Create: `scripts/tests/run_elite_platform_audit.mjs`
- Test: `node scripts/tests/run_elite_platform_audit.mjs --smoke`

- [ ] **Step 1: Write the automated Playwright crawler script**
  - Launches Playwright with `{ channel: 'chrome' }`.
  - Configures 3 viewports:
    - Ultra-compact mobile: `320 × 568` (iPhone SE narrowest threshold).
    - Modern mobile: `390 × 844` (iPhone 14 standard mobile viewport).
    - Desktop workstation: `1440 × 900` (MacBook / Standard HD desktop).
  - Traps `pageerror`, `console.error`, and HTTP $\ge 400$ requests.
  - Automated DOM assertions:
    - Horizontal overflow check: `document.documentElement.scrollWidth > window.innerWidth`.
    - Touch target check: all `<button>`, `<a>`, `<input>` elements have bounding box $\ge 44 \times 44\text{px}$ (or adequate tap padding).
    - Accessibility check: all interactive buttons have text or `aria-label`.
    - Captures high-resolution screenshots to `docs/audit_screenshots/`.
- [ ] **Step 2: Run smoke test to verify crawler execution**
  Run: `node scripts/tests/run_elite_platform_audit.mjs --smoke`
  Expected: Launches server, navigates to `/` and `/alumni`, records zero console errors, outputs screenshot.
- [ ] **Step 3: Commit**
  `git commit -m "test: implement automated multi-viewport Playwright visual audit runner"`

---

### Task 3: Audit & Remediate Root & Public Gateway (`/`, `/alumni`)
**Files:**
- Audit & Modify: `src/app/page.tsx`, `src/app/alumni/page.tsx`
- Test: `node scripts/tests/run_elite_platform_audit.mjs --routes /,/alumni`

- [ ] **Step 1: Audit `/` Landing & Auth Gate**
  - Check 320px mobile layout: ensure sign-in card and tabs do not overflow horizontally.
  - Audit CTA buttons for tactile micro-shadows, subtle border highlights, and visible `:focus-visible` ring.
  - Check contrast ratios on hero headings against cosmic navy backgrounds ($\ge 4.5:1$).
- [ ] **Step 2: Audit `/alumni` Public Laureates Showcase**
  - Verify card grid transitions smoothly from 1-column on mobile (320px/390px) to 2-3 columns on desktop (1440px).
  - Ensure search input and category filter chips meet 44px touch target guidelines.
  - Verify alumni avatar fallback renders first letter cleanly with high-contrast badge.
- [ ] **Step 3: Run Playwright audit for `/` and `/alumni`**
- [ ] **Step 4: Fix any identified visual slop, overflow, or a11y issues**
- [ ] **Step 5: Commit**
  `git commit -m "refactor(ui): elevate landing and alumni pages to elite web UI standards"`

---

### Task 4: Audit & Remediate Mobile Shell & Navigation (`MobileAppShell`, `BottomNavBar`)
**Files:**
- Audit & Modify: `src/components/mobile/MobileAppShell.tsx`, `src/components/mobile/BottomNavBar.tsx`
- Test: `node scripts/tests/run_elite_platform_audit.mjs --routes /(mobile)/home`

- [ ] **Step 1: Audit `BottomNavBar`**
  - Check 320px viewport: verify 5 navigation icons fit comfortably without collision or text clipping.
  - Ensure touch targets for every nav button are $\ge 44\times 44\text{px}$.
  - Verify active tab indicator has refined cosmic glow and proper `aria-current="page"`.
  - Check iOS safe area padding (`pb-safe` / `env(safe-area-inset-bottom)`).
- [ ] **Step 2: Audit `MobileAppShell`**
  - Ensure top header branding and action icons (notifications, QR pass, sign out) have strict 44px touch bounding boxes.
  - Ensure offline PWA banner displays gracefully without jumping or pushing layout content abruptly.
- [ ] **Step 3: Run Playwright audit and capture screenshots**
- [ ] **Step 4: Commit**
  `git commit -m "refactor(mobile): optimize MobileAppShell and BottomNavBar for elite mobile-first standards"`

---

### Task 5: Audit & Remediate Member Core Screens (`home`, `explore`, `workshops`, `badges`, `exams`, `profile`)
**Files:**
- Audit & Modify:
  - `src/app/(mobile)/home/page.tsx`
  - `src/app/(mobile)/explore/page.tsx`
  - `src/app/(mobile)/workshops/page.tsx`
  - `src/app/(mobile)/badges/page.tsx`
  - `src/app/(mobile)/exams/page.tsx` & `[badgeId]/page.tsx`
  - `src/app/(mobile)/profile/page.tsx`
- Test: `node scripts/tests/run_elite_platform_audit.mjs --routes home,explore,workshops,badges,exams,profile`

- [ ] **Step 1: Audit `/(mobile)/home` (Command Deck)**
  - Eliminate repetitive card styles; implement dynamic visual weight (large hero status card, secondary compact ribbons).
  - Verify Season XP bar and Rank pill use `tabular-nums` and crisp gradient strokes.
- [ ] **Step 2: Audit `/(mobile)/explore` (Magazine & Daily Quiz Stepper)**
  - Verify daily quiz multi-question stepper on 320px viewport: ensure options don't clip text, radio checkmarks are centered.
  - Check completion celebration lock card: ensure accuracy percentage, XP badge, and "Review" button meet WCAG contrast.
  - Audit scientific magazine articles: verify typography uses Cairo/Changa, line-height is 1.6, and tags are accessible.
- [ ] **Step 3: Audit `/(mobile)/workshops` (Interactive Scheduler & Attendance)**
  - Check RSVP button states: Loading shimmer, "Book Seat", "Seat Reserved", "Waitlisted".
  - Verify 6-digit attendance PIN input modal is keyboard-friendly and centers properly on mobile viewports.
- [ ] **Step 4: Audit `/(mobile)/badges` & `/(mobile)/exams`**
  - Check SVG Hexagon badge grid: verify locked/unlocked shader aesthetics and tooltip/sheet accessibility.
  - Check timed exam interface: ensure countdown timer uses `tabular-nums` and does not cause layout shifts.
- [ ] **Step 5: Audit `/(mobile)/profile` (Member Dossier)**
  - Verify letter avatar fallback appears crisply when no photo is provided.
  - Verify Season XP editor in profile edit mode handles validation without crashing.
  - Check 3D flip card for Personal QR Pass on both mobile and desktop.
- [ ] **Step 6: Run Playwright audit across all 6 core screens, fix defects, and commit**
  `git commit -m "refactor(mobile): overhaul member core screens to anti-slop elite standards"`

---

### Task 6: Audit & Remediate Member Submission & Onboarding Funnels
**Files:**
- Audit & Modify:
  - `src/app/(mobile)/onboarding/page.tsx`
  - `src/app/(mobile)/welcome/page.tsx`
  - `src/components/mobile/WaitingForApprovalScreen.tsx`
  - `src/app/(mobile)/checkin/page.tsx`
  - `src/app/(mobile)/proposals/page.tsx`
  - `src/app/(mobile)/projects/submit/page.tsx`
  - `src/app/(mobile)/notifications/page.tsx`
  - `src/app/(mobile)/manager/page.tsx`
- Test: `node scripts/tests/run_elite_platform_audit.mjs --routes onboarding,welcome,checkin,proposals,projects/submit,notifications,manager`

- [ ] **Step 1: Audit `/(mobile)/onboarding` & `/(mobile)/welcome`**
  - Test all 6 KYC steps at 320px viewport (Wilaya selector, housing radio pills, PC specs, availability grid).
  - Verify `WaitingForApprovalScreen` mascot artwork scales cleanly without distorting or causing overflow.
- [ ] **Step 2: Audit Proposals, Project Submissions, Check-in & Manager Console**
  - Verify form fields have explicit labels, error recovery states, and touch targets $\ge 44\text{px}$.
  - Ensure notification list handles empty state gracefully with illustrated micro-copy.
- [ ] **Step 3: Run Playwright audit, resolve issues, and commit**
  `git commit -m "refactor(funnels): refine onboarding and submission funnels for mobile-first resilience"`

---

### Task 7: Audit & Remediate Admin Command & Member CMS (`/admin`, `/admin/overview`, `/admin/members`)
**Files:**
- Audit & Modify:
  - `src/components/admin/AdminSidebar.tsx`
  - `src/app/admin/overview/page.tsx`
  - `src/app/admin/members/page.tsx` & `[id]/page.tsx`
- Test: `node scripts/tests/run_elite_platform_audit.mjs --routes admin,admin/overview,admin/members`

- [ ] **Step 1: Audit `AdminSidebar`**
  - Test responsive behavior on desktop (1440px expanded), tablet (768px collapsed/drawer), and mobile.
  - Ensure all 16 navigation links have active state highlights and crisp icons.
- [ ] **Step 2: Audit `/admin/overview`**
  - Verify metrics cards: replace bland boxes with structured telemetry cards featuring subtle inner borders and trend tags.
  - Verify pending admission queue and real-time audit ledger.
- [ ] **Step 3: Audit `/admin/members`**
  - Verify table density, horizontal scrolling wrapper for narrow screens, and column sorting.
  - Check Season XP editing capability and letter-fallback avatar rendering in member rows.
- [ ] **Step 4: Run Playwright audit, fix issues, and commit**
  `git commit -m "refactor(admin): elevate admin command and member CMS to Stripe-grade enterprise standard"`

---

### Task 8: Audit & Remediate Admin Academic, Content & Event Management
**Files:**
- Audit & Modify:
  - `src/app/admin/badges/page.tsx`
  - `src/app/admin/explore/page.tsx`
  - `src/app/admin/workshops/page.tsx`
  - `src/app/admin/tasks/page.tsx`
  - `src/app/admin/points/page.tsx`
- Test: `node scripts/tests/run_elite_platform_audit.mjs --routes admin/badges,admin/explore,admin/workshops,admin/tasks,admin/points`

- [ ] **Step 1: Audit Daily Quiz & Editorial CMS (`/admin/explore`)**
  - Ensure dynamic 2-4 options builder, date picker, and explanation textarea have zero visual glitches.
  - Verify JSON import/export modal layout and copy buttons.
- [ ] **Step 2: Audit Workshops Scheduler, Badge Authoring & Sprint Tasks**
  - Verify modal forms, seat counters, and status badges adhere to `DESIGN.md` tokens.
- [ ] **Step 3: Run Playwright audit, fix issues, and commit**
  `git commit -m "refactor(admin): polish academic, quiz CMS and workshop management interfaces"`

---

### Task 9: Audit & Remediate Admin Governance, HR & Analytics
**Files:**
- Audit & Modify:
  - `src/app/admin/proposals/page.tsx`
  - `src/app/admin/access/page.tsx`
  - `src/app/admin/invitations/page.tsx`
  - `src/app/admin/alumni/page.tsx`
  - `src/app/admin/former-members/page.tsx`
  - `src/app/admin/messages/page.tsx`
  - `src/app/admin/org/page.tsx`
  - `src/app/admin/stats/page.tsx`
  - `src/app/admin/audit/page.tsx`
  - `src/app/admin/settings/page.tsx`
- Test: `node scripts/tests/run_elite_platform_audit.mjs --routes admin/access,admin/stats,admin/audit,admin/settings`

- [ ] **Step 1: Audit Admission & HR Access Pipeline (`/admin/access`)**
  - Verify application cards, approve/reject modal dialogs, and blast-radius warnings.
- [ ] **Step 2: Audit Broadcast Publisher, Org Chart, Analytics & Audit Logs**
  - Verify charts on `/admin/stats` render cleanly with zero overflow.
  - Verify mutation logs on `/admin/audit` format JSON payloads cleanly.
- [ ] **Step 3: Run Playwright audit, fix issues, and commit**
  `git commit -m "refactor(admin): harden governance, audit ledger, and analytics interfaces"`

---

### Task 10: Full Multi-Viewport Playwright Visual Verification & Audit Dossier
**Files:**
- Modify: `scripts/tests/run_elite_platform_audit.mjs`
- Create: `docs/AUDIT_REPORT_ELITE_UI.md`

- [ ] **Step 1: Execute full automated multi-viewport crawl across all 35+ routes**
  Run: `node scripts/tests/run_elite_platform_audit.mjs --full`
  Expected:
  - 3 viewports tested per route (320px, 390px, 1440px) $\to >100$ visual checks.
  - 0 horizontal overflow defects (`scrollWidth === innerWidth`).
  - 0 uncaught runtime or console errors.
  - 100% of interactive elements meet minimum 44px touch targets.
- [ ] **Step 2: Compile the official `docs/AUDIT_REPORT_ELITE_UI.md` dossier**
  - Executive summary and audit score.
  - Detailed before/after compliance matrix against all 4 protocol pillars.
  - Visual gallery of desktop and mobile screenshots.
- [ ] **Step 3: Run final TypeScript verification and Firebase production build**
  Run: `npx tsc --noEmit && node scripts/build_firebase_out.mjs`
- [ ] **Step 4: Commit and deploy**
  `git commit -m "chore(audit): complete full platform elite UI audit and generate verification dossier"`
  `npx firebase-tools deploy --only hosting`
