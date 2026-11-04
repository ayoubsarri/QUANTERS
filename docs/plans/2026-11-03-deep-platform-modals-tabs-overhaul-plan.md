# Deep Platform Overhaul Plan: Modals, Popups, Tabs & Micro-Interactions

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Conduct an exhaustive visual and architectural overhaul of every single modal dialog, bottom sheet, popup window, tabbed navigation bar, and interactive box across all 32 routes of QUANTERS, strictly enforcing Apple/Stripe-level tactile design tokens, Fitts's Law ($\ge 44\times 44\text{px}$ touch targets), WCAG 2.2 accessibility (Escape key traps, ARIA roles), and capturing comprehensive screenshot proof of every interactive state without cloud deployment.

**Architecture:**
1. **Modal & Dialog Component Uniformity:** Standardize all 40+ modals across mobile and admin surfaces to follow the tactile Apple/Stripe modal specification defined in `DESIGN.md` (`bg-white dark:bg-[#061E47] border border-slate-200/90 dark:border-white/10 rounded-2xl shadow-2xl backdrop-blur-sm`).
2. **Tabbed Controls Standardization:** Standardize all tab bars across Member and Admin pages (`role="tablist"`, `role="tab"`, `aria-selected`, minimum 44px tap target, active pill gradient with micro-border).
3. **Keyboard & Touch Accessibility:** Ensure every popup closes on `Escape`, traps body scroll (`overflow-hidden`), and ensures close buttons have accessible labels and $44\times 44\text{px}$ tap bounding boxes.
4. **Interactive Playwright Modal Hunter & Screenshot Suite:** Build `scripts/tests/audit_all_modals_and_tabs.mjs` to programmatically open every modal, tab, and drawer, asserting layout integrity, zero overflow, and capturing before/after visual proof.
5. **Strictly Local Build & Verification:** Zero cloud deployment; all artifacts, screenshots, and builds tested and hosted on the local test server.

**Tech Stack:** Next.js 15.5 (React 19, TypeScript 5.7), Tailwind CSS 3.4, Zustand 5, Playwright 1.64 (Google Chrome channel).

---

## Complete Modals, Popups & Tabs Inventory

| Surface / Route | Modal / Popup / Tab Component | Interaction Scope | Compliance Targets |
| :--- | :--- | :--- | :--- |
| **`EditMemberModal.tsx`** | Admin Member Edit Dialog | Season XP, Academic Year, Roles, Department | Escape key, body scroll lock, 44px buttons |
| **`MilestoneCelebrationModal.tsx`** | Global Achievement / XP Pop | Confetti overlay, XP badge, Continue CTA | Backdrop blur, responsive scale, sound hook |
| **`PersonalQRModal.tsx`** | 3D Flip Digital Club Pass | QR code render, card flip, copy Quanter ID | High contrast, QR crispness, 44px close |
| **`SignOutConfirmModal.tsx`** | Destructive Sign Out Confirm | Blast radius warning, cancel / confirm buttons | Red destructive CTA, Escape key trap |
| **`MobileAppShell.tsx`** | Quota / Offline Notice Banner | Dismiss button, local workspace notice | Accessible X, smooth slide-down |
| **`BottomNavBar.tsx`** | 5-Tab Floating Mobile Dock | Workshops, Explore, Home, Badges, Profile | `min-h-[46px]`, `aria-current`, active pill |
| **`/(mobile)/home`** | Task Tabs & Delivery Modal | "Active" vs "History", Deliver task form | Tab selection, file/link inputs, 44px buttons |
| **`/(mobile)/explore`** | Magazine Feed Tabs & Quiz Stepper | "Latest", "Saved", "Top" + Multi-quiz flow | Step counter, answer radio cards, lock card |
| **`/(mobile)/profile`** | 9 Profile Modals | QR, Avatar, Password, Ledger, Pause, Grievance | Escape traps, scroll lock, clear action buttons |
| **`/(mobile)/manager`** | 6 Lead Modals & Tabs | Scoring, Task Form, Note, Scan, Team Edit | Manager controls, touch-friendly inputs |
| **`/(mobile)/notifications`**| Notification Tabs & Search/Settings | Filter tabs ("All", "Unread", "Dept"), Prefs modal| 44px tab targets, toggle switches |
| **`/(mobile)/welcome`** | Auth Gate & Deletion Modals | Sign In/Register tabs, Charter, Deleted Account| Tab switching, error recovery, mascot art |
| **`/(mobile)/checkin`** | Optical Camera & 6-Digit PIN | Camera viewfinder, Manual 6-digit code form | `h-11 min-h-[44px]`, numeric tracking |
| **`/admin/layout.tsx`** | Admin Header & Mobile Drawer | Search dropdown, Mobile navigation drawer | Drawer slide-in, focus trap, 44px links |
| **`/admin/access`** | Admission Status Tabs & Review Modal | "Pending", "Interview", "Approved" + Review | Batch confirm modal, RBAC grant picker |
| **`/admin/members`** | Members Table Tabs & Delete Modal | Status tabs, Add Member modal, Purge modal | Blast radius warning, sorting headers |
| **`/admin/explore`** | CMS Tabs, Article Studio & Quiz Form | Dynamic 2-4 options, Date picker, JSON modal | Append/replace mode, markdown live preview |
| **`/admin/badges`** | Badges Inventory Tabs & Exam Editor | Category manager, Exam question builder | Multiple choice options, passing score input |
| **`/admin/workshops`** | Scheduler Tabs & Category Manager | Workshop booking, 6-digit PIN attendance | Attendee roster modal, seat counter |
| **`/admin/tasks`** | Sprint Board Tabs & Bulk Task Modal | Backlog/In-progress/Review, Task creator | Assignee selector, XP reward pill |
| **`/admin/points`** | Points Tabs & Manual Adjust Modal | Leaderboard/Ledger, Manual adjustment form | Transaction type selector, audit reasoning |
| **`/admin/org`** | Org Chart & Appointment Modals | Exec board modal, Team structure modal | Leader assignment, department icon picker |
| **`/admin/stats`** | Analytics Tabs & Laureates Filter | Season analytics, Member vs Alumni tabs | Chart responsiveness, tab switching |
| **`/admin/settings`** | Settings Sections & Rank Thresholds | Season dates, Registration toggle, Rank modal | Numeric threshold inputs, domain tags |

---

## Task Decomposition

### Task 1: Standardize Global Shared Modals & Primitives
**Files:**
- Modify: `src/components/admin/EditMemberModal.tsx`
- Modify: `src/components/mobile/PersonalQRModal.tsx`
- Modify: `src/components/shared/SignOutConfirmModal.tsx`
- Modify: `src/components/mobile/MilestoneCelebrationModal.tsx`

- [ ] **Step 1: Upgrade `EditMemberModal.tsx`**
  - Add `Escape` key event listener to close modal automatically.
  - Lock document body scroll on open (`document.body.style.overflow = "hidden"`).
  - Standardize container to `max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl p-6`.
  - Ensure all form inputs and action buttons have minimum $44\text{px}$ height (`h-11`).
  - Add explicit `aria-label="Close dialog"` to the top-right X button.
- [ ] **Step 2: Upgrade `PersonalQRModal.tsx`**
  - Add `Escape` key dismiss listener and body scroll lock.
  - Ensure 3D card flip button is minimum $44\times 44\text{px}$.
  - Enhance QR container contrast and add clear "Copy Quanter ID" button.
- [ ] **Step 3: Upgrade `SignOutConfirmModal.tsx`**
  - Add `Escape` key dismiss listener.
  - Standardize destructive "Sign Out" CTA with high-contrast red gradient and 44px height.
  - Add blast radius explanation microcopy.
- [ ] **Step 4: Upgrade `MilestoneCelebrationModal.tsx`**
  - Add `Escape` key dismiss listener.
  - Ensure "Continue" button is $48\text{px}$ high with tactile press feedback.

---

### Task 2: Overhaul Mobile Member Modals, Drawers & Tabs
**Files:**
- Modify: `src/app/(mobile)/home/page.tsx`
- Modify: `src/app/(mobile)/profile/page.tsx`
- Modify: `src/app/(mobile)/manager/page.tsx`
- Modify: `src/app/(mobile)/notifications/page.tsx`

- [ ] **Step 1: Overhaul `/(mobile)/home` Task Tabs & Delivery Modal**
  - Upgrade tab buttons ("Active" vs "History") to `min-h-[44px]` with `role="tab"` and `aria-selected`.
  - Polish Task Delivery modal (`deliverModalTaskId`): add `Escape` listener, body scroll lock, 44px file/link inputs.
- [ ] **Step 2: Overhaul `/(mobile)/profile` 9 Modals**
  - Add `Escape` key listener and scroll lock to:
    - Ledger Modal (XP history transaction table)
    - Schedule Availability Modal (7-day grid editor)
    - Password Change Modal
    - Pause / Resignation Modal
    - Confidential Grievance Modal
    - Admin / HR Quick Edit Modal
  - Ensure all modal close buttons have $\ge 44\times 44\text{px}$ bounding boxes and explicit aria labels.
- [ ] **Step 3: Overhaul `/(mobile)/manager` 6 Lead Modals**
  - Upgrade Lead Sub-tabs to `min-h-[44px]` with crisp active pill indicator.
  - Polish Task Scoring modal, Team Edit modal, and Leader Note modal with 44px buttons and `Escape` handlers.
- [ ] **Step 4: Overhaul `/(mobile)/notifications` Tabs & Settings Drawer**
  - Ensure category filter tabs have `min-h-[42px]` with horizontal scroll wrapper (`scrollbar-none`).
  - Polish Notification Preferences modal with accessible toggle switches ($\ge 44\text{px}$).

---

### Task 3: Overhaul Admin Portal Modals, Drawers & CMS Tabs
**Files:**
- Modify: `src/app/admin/layout.tsx`
- Modify: `src/app/admin/members/page.tsx`
- Modify: `src/app/admin/explore/page.tsx`
- Modify: `src/app/admin/badges/page.tsx`
- Modify: `src/app/admin/workshops/page.tsx`
- Modify: `src/app/admin/tasks/page.tsx`
- Modify: `src/app/admin/points/page.tsx`
- Modify: `src/app/admin/access/page.tsx`
- Modify: `src/app/admin/settings/page.tsx`

- [ ] **Step 1: Overhaul `AdminLayout.tsx` Mobile Drawer & Search Popover**
  - Ensure Mobile Navigation Drawer closes on `Escape` and background backdrop click.
  - Ensure all 16 drawer navigation links have `min-h-[46px]` touch targets.
  - Enhance Search Dropdown popover with clear keyboard arrow navigation hint.
- [ ] **Step 2: Overhaul `/admin/members` Delete Modal & Member Tabs**
  - Standardize Delete / Deactivate modal with explicit member name confirmation input.
  - Ensure Status Tabs ("All", "Active", "Trainees", "Alumni", "Removed") have `role="tab"` and `min-h-[44px]`.
- [ ] **Step 3: Overhaul `/admin/explore` Dynamic Quiz Modal & Markdown Studio**
  - Verify Dynamic Quiz editor modal (2-4 options, Date picker, Explanation): ensure `Escape` listener, clean keyboard tab order.
  - Polish JSON Import/Export modal with copy feedback toast.
  - Polish Markdown Article Editor tabs ("Compose" vs "Live Preview") with instant sync.
- [ ] **Step 4: Overhaul Badge Authoring, Workshops Scheduler, Tasks & Points Modals**
  - Ensure all authoring modals have consistent headers, 44px input fields, and sticky footer action bars.
  - Standardize Manual XP Adjustment modal on `/admin/points` with required audit reason field.

---

### Task 4: Build Automated Interactive Modal & Tab Playwright Audit Suite
**Files:**
- Create: `scripts/tests/audit_all_modals_and_tabs.mjs`

- [ ] **Step 1: Write interactive Playwright test orchestrator**
  - Launches headless Google Chrome on local server (`http://127.0.0.1:4000`).
  - Loops through each surface, clicks triggers to open each modal, takes high-res screenshot, tests `Escape` key close, and verifies body scroll restoration.
  - Switches through each tab list on both Mobile (390x844) and Desktop (1440x900), capturing screenshots of active tab states.
  - Saves all screenshots to `docs/audit_screenshots/modals_and_tabs/`.
- [ ] **Step 2: Run test suite to verify 100% modal open/close and tab switching**
  Run: `node scripts/tests/audit_all_modals_and_tabs.mjs`

---

### Task 5: Final Local Verification & Visual Evidence Compilation
**Files:**
- Create: `docs/AUDIT_MODALS_AND_TABS_REPORT.md`
- Update: Artifact `elite_ui_visual_audit_evidence.md`

- [ ] **Step 1: Execute complete local build**
  Run: `npx tsc --noEmit && node scripts/build_firebase_out.mjs`
- [ ] **Step 2: Copy modal screenshots to artifact directory and compile presentation artifact**
- [ ] **Step 3: Verify strictly ZERO cloud deployments were executed**
