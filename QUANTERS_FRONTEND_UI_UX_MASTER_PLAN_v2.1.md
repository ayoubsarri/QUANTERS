# QUANTERS v2.1 — Full Frontend UI/UX Implementation Plan (Task-by-Task Blueprint)

> **For agentic workers:** REQUIRED SUB-SKILL: Use `writing-plans` and `frontend-design-systems` to execute this plan task-by-task **only when explicitly instructed by the user**. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete, interactive, production-grade Frontend UI/UX for the **QUANTERS v2.1 Ecosystem** — encompassing the **12-Screen Mobile Member & Manager PWA**, the **Dedicated Alumni Light Portal**, and the **Unified PC Admin / HR / Manager ERP Dashboard** — strictly adhering to the visual style of `quanters_12screens_master_reference.jpg`, the official `logo_quanta.png`, and 100% of the business rules, entities, workflows, and permissions in `QUANTERS_ERP_AND_STRUCTURE_PLAN_v2.1.md`.

**Architecture:** Next.js 15 (App Router) + React 19 + TypeScript 5 + Tailwind CSS + Lucide Icons, backed by a reactive, strongly-typed **Central ERP State & Audit Store** (`Zustand` + `localStorage` persistence + seeded QUANTA v2.1 data). Every action taken on the **PC Admin Dashboard** (e.g., pausing registration, moving a member between departments with a reason, publishing a workshop QR, scoring a task, awarding a badge, or approving Member of the Month) immediately updates the **Mobile Member PWA** in real time.

**Tech Stack:** Next.js 15, React 19, TypeScript 5, Tailwind CSS, Lucide React, HTML5 Canvas (client-side avatar auto-crop & WebP compression + QR generation).

---

## 1. Visual Style & Design Tokens Lock (Extracted from the 12-Screen Master Image)

Every component across all tasks MUST strictly enforce the following visual specifications from `quanters_12screens_master_reference.jpg`:

| Category | Token / Element | Exact Visual Value & Styling Instruction |
| :--- | :--- | :--- |
| **Surfaces (Daylight)** | App Canvas (`Screens 2,3,4,6,7,8,9,10,11,12`) | Crisp Ice-White `#F4F7FB` background; elevated pure white `#FFFFFF` cards (`rounded-2xl` / `16px`, `border: 1px solid #E2EDF8`, subtle shadow `0 4px 14px rgba(15,23,42,0.04)`); soft sky-tinted boxes `#EBF3FC`. |
| **Surfaces (Cosmic Dark)** | Splash (`Screen 1`) & QR Check-in (`Screen 5`) | Deep Space Navy gradient `linear-gradient(180deg, #041226 0%, #081E3A 60%, #031022 100%)` with starlight particles and glowing Earth/lunar horizon arc at the bottom. |
| **Hero Level Card** | `Lv. 7 Quantum Explorer` (`Screens 2 & 7`) | Deep Navy-to-Cobalt gradient `linear-gradient(135deg, #061E47 0%, #0A3780 55%, #0F4FB8 100%)`, cyan progress bar (`#29D2FF` fill on `#102C5E` track), top-right green status pill `★ Active Member` (`#10B981` / `#059669`), right glowing cyan ringed planet SVG. |
| **4 Quick-Action Tiles** | Home Screen Row (`Screen 2`) | **1. `Scan QR`:** Solid Royal Blue `#1D63EB` tile, white icon/text.<br>**2. `Exams`:** Soft Sky `#D6ECFA` tile, `#1D63B8` icon/text.<br>**3. `Submit Project`:** Warm Amber `#FDE68A` tile, `#92400E` icon/text.<br>**4. `Proposals`:** Mint Emerald `#BBF7D0` tile, `#15803D` icon/text. |
| **Semantic Micro-Pills** | Workshop & Badge Chips | • **Workshop XP Pill:** Mint `#D8F3E5` bg, `#15803D` bold text (`+150 XP`).<br>• **Badge Grid XP Pill (`Screen 6`):** Warm Gold `#FEF3C7` bg, `#B45309` bold text (`+150 XP`, `+120 XP`).<br>• **Level / Category Chip:** Soft Sky `#E0F0FF` bg, `#1D63B8` text (`Beginner`, `Intermediate`, `ASTRONOMY`).<br>• **Notification Tags (`Screen 11`):** `Action needed` (`#FEE2E2`/`#DC2626`), `Official notice` (`#FEF3C7`/`#B45309`), `Info` (`#E0F0FF`/`#1D63B8`), `Message` (`#E0E7FF`/`#4338CA`). |
| **Bottom Navigation Bar** | 5-Tab Bar (`Home in Center`) | Fixed bottom bar (`height: 68px`, `#FFFFFF` bg, `border-t border-slate-200/80`):<br>`[ 1. Workshops ] — [ 2. Explore ] — (( 3. HOME: Raised 48px Royal Blue #1D63EB Circle )) — [ 4. Badges ] — [ 5. Profile ]`.<br>*Live Workshop Rule (v2.1 §7):* When a registered workshop is live, the raised Center Home button displays a pulsing cyan QR badge so tapping it opens **Screen 5 (Workshop Check-in)** directly. |
| **Official Brand Emblem** | `logo_quanta.png` | Official 3-orbit quantum logo (`#094C9C`, `#1A7EC2`, `#30C5F7` rings + `#80C342` green, `#ED1C24` red, `#FBB03B` gold particle nodes) placed on Splash, Onboarding, Digital Quanter ID, and PC Admin Sidebar. |

---

## 2. Target File & Directory Architecture

```text
c:\Users\hp\QUANTERS\
├── public/
│   └── brand/
│       └── logo_quanta.png                  # Official QUANTA 3-orbit logo
├── src/
│   ├── app/
│   │   ├── layout.tsx                       # Root layout, Plus Jakarta Sans + IBM Plex Sans Arabic, Demo Mode Switcher
│   │   ├── globals.css                      # Exact color tokens, cosmic gradients, custom scrollbars, hexagon clip-paths
│   │   ├── page.tsx                         # Entry router (Splash / Mobile App / Admin Dashboard preview switcher)
│   │   ├── (mobile)/                        # Mobile Member & Manager PWA (390px-430px responsive phone frame on PC, full-screen on mobile)
│   │   │   ├── welcome/page.tsx             # Screen 1: Cosmic Splash & Registration Closed Gate
│   │   │   ├── onboarding/page.tsx          # 6-Step First-Time Profile Wizard (via HR Invitation Link)
│   │   │   ├── home/page.tsx                # Screen 2: Personalized Home Hub (Tab 3 - Center)
│   │   │   ├── explore/page.tsx             # Screen 3: Explore Carousel & 4-Category Feed (Tab 2)
│   │   │   ├── workshops/page.tsx           # Screen 4: Workshops & Events Hub + Detail Sheet (Tab 1)
│   │   │   ├── checkin/page.tsx             # Screen 5: Cosmic QR Check-In Scanner + 6-Digit Code + Timer
│   │   │   ├── badges/page.tsx              # Screen 6: My Badges Hexagonal Vault + Detail Sheet (Tab 4)
│   │   │   ├── profile/page.tsx             # Screen 7: Member Profile, Governance Rows, Personal QR & Ledger (Tab 5)
│   │   │   ├── proposals/page.tsx           # Screen 8: Proposals Engine (3x2 Type Grid + Dynamic Fields + My Proposals)
│   │   │   ├── exams/[badgeId]/page.tsx     # Screen 9: Online Exam Lobby & Timed MCQ Runner
│   │   │   ├── projects/submit/page.tsx     # Screen 10: Submit Project Form & File/Repo Dropzone
│   │   │   ├── notifications/page.tsx       # Screen 11: Notifications & Official HR Messages Inbox
│   │   │   └── manager/page.tsx             # Screen 12: Mobile Manager & Check-In Operator Workspace
│   │   ├── alumni/
│   │   │   └── page.tsx                     # Dedicated Alumni Light Portal (Special Access Link)
│   │   └── admin/                           # Unified PC Admin, HR, Manager & Super Admin Dashboard
│   │       ├── layout.tsx                   # Cosmic Navy Sidebar (Permission-Filtered) + Top Bar + Role Previewer
│   │       ├── overview/page.tsx            # §6.2: 7 KPI Tiles + "Alerts Today" 1-Click Action Queue
│   │       ├── members/page.tsx             # §6.1: Current Members Table, Filters, Availability Finder, "Copy All Emails"
│   │       ├── members/[id]/page.tsx        # §6.4: 6-Tab Member Card + Trainee 3-Ring Confirmation Tracker
│   │       ├── org/page.tsx                 # §2.1-2.2: 6 Fixed Departments (Move w/ Reason) + Scientific Teams CRUD
│   │       ├── former-members/page.tsx      # §4.2 & M11: Resigned / Removed / Alumni Tabs + Reactivate + Exit Modals
│   │       ├── invitations/page.tsx         # §3.1: Bulk Email Invitations, Pre-fill Dept, Resend/Cancel
│   │       ├── workshops/page.tsx           # §M3: Workshop CRUD, Rosters, Attendance Correction, Live Projector QR
│   │       ├── tasks/page.tsx               # §M4: Kanban Board, Per-Member Scoring, Bulk Score, Printable Task Matrix
│   │       ├── proposals/page.tsx           # §M8: Proposals Inbox, Law 2/3 Tag, Approve/Reject, 1-Click Convert
│   │       ├── points/page.tsx              # §M5: Immutable Points Ledger, Rules Editor, 48h Appeals, Member of the Month
│   │       ├── badges/page.tsx              # §M6: Badge CRUD, Exam Builder, Manual Multi-Award, Project Grading Desk
│   │       ├── stats/page.tsx               # §6.3: Club Totals, Fair Dept/Team Rankings (Total + Avg), Participation Charts
│   │       ├── messages/page.tsx            # §M7: Dual-Channel Composer (In-App ☐ / Email ☐) & Read/Delivery Tracking
│   │       ├── explore/page.tsx             # §M9: 4-Category Explore CMS (Draft -> Review -> Published -> Archived)
│   │       ├── access/page.tsx              # §8: 4-Part Smart Delegation Builder, 14 Role Templates, 1-Click Revoke
│   │       ├── settings/page.tsx            # §6.5: Super Admin Console (Registration Switch, Thresholds, Seasons, Templates)
│   │       └── audit/page.tsx               # §11: Immutable Audit Log Viewer (Who · When · What · Old->New · Reason)
│   ├── components/
│   │   ├── mobile/                          # Mobile Frame, BottomNav (Center Home), TopHeader, MilestoneModal, PersonalQRModal
│   │   ├── badges/                          # HexagonBadgeCard (Navy/Gold/Locked), BadgeDetailSheet
│   │   ├── shared/                          # QuantaLogo, PlanetEmblem, AvatarUploader (WebP Compressor), StatusPill, ReasonModal
│   │   └── admin/                           # AdminSidebar, KpiTile, AlertRow, AvailabilityHeatmap, ProjectorQRModal
│   ├── lib/
│   │   ├── types/erp.ts                     # All v2.1 ERP TypeScript interfaces & enums
│   │   ├── data/seed.ts                     # Authentic QUANTA v2.1 seed dataset (6 Depts, 6 Teams, Members, Workshops, Badges, Point Rules)
│   │   ├── store/useQuantersStore.ts        # Reactive Zustand store with audit-logged mutations & RBAC checks
│   │   └── utils/imageCompressor.ts         # Client-side HTML5 Canvas square crop + WebP compression (<35KB)
```

---

## 3. Complete Task-by-Task Implementation Plan (36 Tasks Across 7 Phases)

### Phase 0: Foundation, Design System Tokens, Brand Primitives & ERP Store (Tasks 1–4)

#### Task 1: Workspace Initialization & Multi-Surface Routing Topology
**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`

- [ ] **Step 1: Initialize Next.js 15 + TypeScript + Tailwind CSS + Lucide Icons + Zustand**
  Configure `Plus Jakarta Sans` (Latin) and `IBM Plex Sans Arabic` (Arabic RTL support) in `src/app/layout.tsx`.
- [ ] **Step 2: Build the Global Surface Switcher Bar (Top Floating Dev/Demo Dock)**
  Allow instant switching between:
  1. **`📱 Mobile Member App (12 Screens)`** (rendered inside a sleek `412px × 880px` phone frame on desktop, or edge-to-edge on mobile devices)
  2. **`📱 Mobile Manager Workspace (Screen 12)`**
  3. **`🎓 Alumni Portal (Special Link)`**
  4. **`🖥️ PC Admin / HR / Manager Dashboard (16 Pages)`** (with live Role Selector: `Super Admin`, `HR Head`, `Department Head`, `Executive`, `Check-in Operator`).

---

#### Task 2: Exact Design Tokens, Gradients, & CSS Primitives (`globals.css`)
**Files:**
- Create: `src/app/globals.css`
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Define Exact Color & Gradient Variables Matching the 12-Screen Master Image**
  - `--bg-canvas: #F4F7FB`, `--bg-card: #FFFFFF`, `--bg-sky-soft: #EBF3FC`, `--border-card: #E2EDF8`
  - `--bg-cosmic: linear-gradient(180deg, #041226 0%, #081E3A 60%, #031022 100%)`
  - `--bg-hero-level: linear-gradient(135deg, #061E47 0%, #0A3780 55%, #0F4FB8 100%)`
  - `--color-primary: #1D63EB`, `--color-cyan-glow: #29D2FF`
  - Quick Tile Tokens: `tile-scan (#1D63EB)`, `tile-exams (#D6ECFA)`, `tile-project (#FDE68A)`, `tile-proposals (#BBF7D0)`
  - Pill Tokens: Mint XP (`#D8F3E5` / `#15803D`), Gold Badge XP (`#FEF3C7` / `#B45309`), Sky Tag (`#E0F0FF` / `#1D63B8`), Urgent Red (`#FEE2E2` / `#DC2626`).
- [ ] **Step 2: Create Hexagon Clip-Path & Glowing Frame Utilities**
  Implement `.hex-badge-outer` and `.hex-badge-inner` CSS classes with 3D drop shadows, neon blue/gold/cyan borders, and tabular numerals (`font-variant-numeric: tabular-nums`).

---

#### Task 3: Official Brand Assets & Image Auto-Compression Utility (`v2.1 §3.3`)
**Files:**
- Create: `src/components/shared/QuantaLogo.tsx`
- Create: `src/components/shared/PlanetEmblem.tsx`
- Create: `src/components/shared/AvatarUploader.tsx`
- Create: `src/lib/utils/imageCompressor.ts`

- [ ] **Step 1: Build `<QuantaLogo />` & `<PlanetEmblem />`**
  Render `public/brand/logo_quanta.png` with light/dark mode adaptive glow, plus the vector Cyan Ringed Planet (`#29D2FF`) used on the `Lv. 7` hero cards.
- [ ] **Step 2: Build Client-Side Image Validator, Square Cropper & WebP Compressor (`v2.1 §3.3`)**
  Implement `compressAndResizeImage(file, maxDimension = 256, quality = 0.78)`:
  - Verifies MIME type (`image/jpeg`, `image/png`, `image/webp`).
  - Center-crops avatars to 1:1 square (`256×256 px`) or cover images to 16:9 (`640×360 px`).
  - Compresses via HTML5 `<canvas>` `toDataURL('image/webp', quality)` down to `~15–35 KB`, displays before/after byte savings badge (`e.g. 2.4 MB -> 24 KB WebP`), and discards the heavy original file.

---

#### Task 4: Complete v2.1 ERP Type System, Seed Dataset & Reactive Audit Store (`v2.1 §2–§11`)
**Files:**
- Create: `src/lib/types/erp.ts`
- Create: `src/lib/data/seed.ts`
- Create: `src/lib/store/useQuantersStore.ts`

- [ ] **Step 1: Define Strict TypeScript Interfaces for All v2.1 Entities (`src/lib/types/erp.ts`)**
  - **Organization (`§2`):**
    - `Department` (6 fixed, undeletable IDs: `dept-events`, `dept-hr`, `dept-er`, `dept-media`, `dept-it`, `dept-logistics`; fields: `id`, `name`, `shortName`, `description`, `icon`, `headMemberId`, `coManagerMemberId`).
    - `ScientificTeam` (CRUD editable: `id`, `name`, `field`, `description`, `icon`, `leaderMemberId`, `memberIds`, `archived`).
  - **Membership & Statuses (`§3 & §4`):**
    - `MemberStatus`: `'Trainee' | 'Active' | 'Inactive' | 'Suspended' | 'Resigned' | 'Removed' | 'Alumni'`.
    - `RecognitionLabel`: `'Star Member' | 'Member of the Month' | 'Department Champion' | 'Senior Fellow'`.
    - `AvailabilityGrid`: `Record<'Saturday'|'Sunday'|'Monday'|'Tuesday'|'Wednesday'|'Thursday'|'Friday', ('Morning'|'Afternoon'|'Evening')[]>`.
    - `Member`: `id`, `quanterId` (`QT-26-0248`), `email`, `fullName`, `phone`, `avatarUrl`, `major`, `academicYear`, `tenure`, `departmentId` (**single department only**), `teamId` (optional single team), `roles`, `buddyId`, `status`, `statusSince`, `traineeStartDate`, `suspensionEndDate`, `outsideActivitiesAndVolunteering` (**single merged field per v2.1 §3.2**), `hasStudentOrgConflict` (flagged **only if member holds a Bureau role** per Law Art. 7), `xpTotal`, `xpSeason`, `xpMonth`, `level`, `attendanceRate`, `onTimeTaskRate`, `healthScore`, `onboardingTicks` (`profileComplete`, `buddyAssigned`, `firstTaskBeforeDay30`, `firstWorkshopAttended`), `traineeEvaluation` (`headApproved`, `coManagerApproved`, `notes`), `skills`.
  - **Modules (`§5 M1–M11`):**
    - `Invitation` (`Sent | Opened | Completed | Expired`, pre-filled department).
    - `Workshop` & `WorkshopSession` (rotating QR token, 6-digit fallback code, seats, XP reward, level, linkedBadgeId, lifecycle state).
    - `Task` & `TaskAssignment` (per-assignee line & individual score within category limits, status `To do | In progress | Delivered | Validated | Late | Cancelled`, proof attachment, manager feedback note).
    - `PointsLedgerEntry` (immutable, reversible only via a new reversal entry with reason; 48h appeal state) & `PointRule` (all 16 default rules from `§M5`).
    - `Badge` (CRUD, archive-only if awarded, 4 earning paths: `exam | manual | project | automatic`), `Exam` (MCQs, duration, pass mark, attempts), `ProjectSubmission`.
    - `Proposal` (7 types from `§M8`: `Event`, `Workshop`, `Activity`, `Internal Law Amendment`, `Collaboration`, `Idea`, `Other`, with type-specific field maps and 2/3 executive badge for law amendments).
    - `Message` (recipients filter, dual-channel `inApp: boolean`, `sendEmail: boolean`, priority `Info | Action needed | Official notice`, per-recipient read/email status).
    - `ExplorePost` (4 categories: `Scientific News | Events News | QUANTA News | Opportunities`).
    - `AccessGrant` (`capability`, `level: 'View'|'Edit'|'Approve'|'Manage'`, `scopeType: 'Club'|'Department'|'Team'|'Workshop'`, `scopeId`, `expiresAt`, `grantedBy`).
    - `AuditLogEntry` (`id`, `actorId`, `actorName`, `timestamp`, `actionType`, `targetEntity`, `oldValue`, `newValue`, `reason`).
- [ ] **Step 2: Populate Realistic QUANTA Seed Data (`src/lib/data/seed.ts`)**
  Include **Ayoub Sarri (`@quanter0248`, `Lv. 7 Quantum Explorer`, `820/1000 XP`, `IT and Technical Solutions` Dept, `Astronomy & Astrophysics` Team)**, **Lotfi (Head)**, **Nesrine (Co-Manager)**, **Sara M. (Star of the Month)**, all 6 fixed Departments, the 6 starting Scientific Teams (`Physics & Astronomy`, `Mathematics`, `CS & AI`, `Biology & Life Sciences`, `Health Sciences`, `Chemistry & Materials`), the 5 workshops from Screen 4 (`Python for Scientists`, `Arduino & Electronics`, `Astronomy Observation`, `3D Printing for Research`, `Data Analysis with Python`), the 12 badges from Screen 6, the Explore articles from Screen 3, the notifications from Screen 11, and the 16 default Point Rules from `§M5`.

---

### Phase 1: Mobile Member PWA Shell, Cosmic Splash, Invitation Wizard & Alumni Portal (Tasks 5–8)

#### Task 5: Mobile App Frame, Top Bar & Standardized 5-Tab Bottom Navigation (`Home in Center`)
**Files:**
- Create: `src/components/mobile/MobileAppShell.tsx`
- Create: `src/components/mobile/BottomNavBar.tsx`
- Create: `src/components/mobile/RequireReasonModal.tsx`

- [ ] **Step 1: Build `<BottomNavBar />` Matching Screens 2, 3, 4, 6, 7 of the 12-Screen Reference**
  - 5 Tabs in exact order:
    1. **`Workshops`** (Calendar/Presentation icon)
    2. **`Explore`** (Compass icon)
    3. **`Home` (CENTER TAB 3)** — Raised `50px × 50px` Royal Blue circle (`#1D63EB`, shadow `0 6px 16px rgba(29,99,235,0.4)`) with white Home icon and `"Home"` label in `#1D63EB` below.
    4. **`Badges`** (Shield-Check icon)
    5. **`Profile`** (User icon)
  - **Live Workshop Smart Behavior (`v2.1 §7`):** When the active user is registered for a workshop whose session is currently `Running / Live`, display a subtle pulsing cyan QR ring on the Center Home button; tapping it when already on Home opens **Screen 5 (`/checkin`)** immediately.

---

#### Task 6: Screen 1 — Cosmic Splash, Invitation Gate & Registration Pause Guard
**Files:**
- Create: `src/app/(mobile)/welcome/page.tsx`

- [ ] **Step 1: Build the Exact Screen 1 Cosmic Visual Layout**
  - Deep space starry canvas (`#041226` -> `#081E3A`) with glowing blue Earth/lunar horizon arc at the bottom and rocky lunar outcrop on the left.
  - Top status bar (`9:41`, signal, wifi, battery) + Official `<QuantaLogo />` above **`QUANTERS`** (`30px` ExtraBold tracking `0.06em`) and **`BY QUANTA`** (`11px` tracking `0.22em` `#93C5FD`).
  - Centered vertical stack: **`DISCOVER`** / **`LEARN`** (highlighted in `#38BDF8`) / **`PROVE`** / **`BELONG`**.
  - 3D Quanta Bot astronaut illustration on the left lunar rock + handwritten script on the right: *"More than a club, a scientific journey."*
  - Full-width white pill CTA button: **`Get Started  →`** (`height: 52px`, `#06182C` bold text).
  - Footer: **`QUANTA SCIENTIFIC CLUB · UNIVERSITY OF ALGIERS 1`**.
- [ ] **Step 2: Wire Registration Switch Guard (`v2.1 §3.1`)**
  - When `settings.registrationOpen === false`, tapping *"Use Invitation Link"* displays the official notice modal: *"Registration is currently closed by administration. Existing members can sign in below."*
  - When `settings.registrationOpen === true`, allows opening an HR Invitation token to launch the **6-Step First-Time Profile Wizard** (`/onboarding`) or signing in as an existing member (`/home`).

---

#### Task 7: 6-Step First-Time Profile Wizard (`/onboarding` — `v2.1 §3.2`)
**Files:**
- Create: `src/app/(mobile)/onboarding/page.tsx`

- [ ] **Step 1: Implement the 6-Step Progress Header & Stepper State**
  - **Step 1 — Identity:** Full Name, Phone Number, and `<AvatarUploader />` (live square crop + automatic WebP compression to `<35 KB`).
  - **Step 2 — Studies:** University Major / Department (`Applied Physics`, `Computer Science`, `Mathematics`, etc.) + Academic Year (`L1`, `L2`, `L3`, `M1`, `M2`, `Doctorate`).
  - **Step 3 — Club Placement:** How long in the club + **One Department** (pre-filled if specified in HR invitation; locked to single selection) + Optional **One Scientific Team** wish (`Physics & Astronomy`, `CS & AI`, etc.).
  - **Step 4 — Availability Grid (`Saturday … Thursday/Friday`):** Interactive tap-to-toggle matrix with `Morning`, `Afternoon`, and `Evening` pills per day.
  - **Step 5 — Outside Activities & Volunteering Experience (Merged Single Box per `v2.1 §3.2`):** One combined textarea + optional tag list for *"Other clubs / associations / organisations you belong to + your previous volunteering experience"*.
  - **Step 6 — Internal Law Commitment Pledge (`Law Art. 8`):** Official pledge summary card + required acceptance checkbox -> sets member status to **`Trainee`**, marks invitation `Completed`, checks `onboardingTicks.profileComplete = true`, and navigates to `/home`.

---

#### Task 8: Dedicated Alumni Light Portal (`/alumni` — `v2.1 §4.4`)
**Files:**
- Create: `src/app/alumni/page.tsx`

- [ ] **Step 1: Build the Special-Link Alumni Experience**
  - Accessible via `/alumni?token=...` (respects `settings.alumniAccessEnabled` global and per-member switch).
  - **Light Alumni Profile Card:** Photo, Full Name, Graduation Year (`Class of 2025`), Current Position & Institution/Company, Scientific Field, and Official `QUANTA ALUMNI` gold pill.
  - **Read-Only Achievement & Badge Vault:** Displays all badges, workshops, and honours earned during their active years at QUANTA.
  - **QUANTA News, Opportunities & Alumni Event Invitations Feed:** Allows RSVPing to alumni gatherings or proposing a guest lecture/mentorship session — with **zero** task boards, check-in requirements, or XP ranking pressure.

---

### Phase 2: Mobile Member PWA — Core 5 Tabs & Live Check-In (Screens 2–7 of the 12-Screen Master Image) (Tasks 9–15)

#### Task 9: Screen 2 — Personalized Home Hub (`/home` — Center Tab 3)
**Files:**
- Create: `src/app/(mobile)/home/page.tsx`

- [ ] **Step 1: Build Top Greeting Header & Notification Bell**
  - Left: `44px` circular avatar with `#22C55E` online dot + *"Good evening,"* / **`Ayoub 👋`** + *"Keep exploring. Science needs you."*
  - Right: Notification bell button with red unread counter badge (links to **Screen 11 `/notifications`**) + subtle quick toggle to **Screen 12 (`Manager Workspace`)** if the member holds a Head / Co-Manager / Team Leader role.
- [ ] **Step 2: Build the Hero Level Card & 4-Column Mini Stats Strip (Exact Screen 2 Match)**
  - **Hero Card:** Deep Cobalt gradient (`#061E47` -> `#0F4FB8`), **`Lv. 7`** (`24px` ExtraBold), `Quantum Explorer`, top-right green status pill **`★ Active Member`** (or `🔵 Trainee · Month 2/3`), cyan progress bar `820 / 1000 XP`, and right ringed cyan planet.
  - **4-Column Stats Row directly below Hero Card:**
    `[ 12 Badges ]` · `[ 8 Workshops ]` · `[ 3 Projects ]` · `[ 1200 Total XP ]` inside crisp white/sky-tinted mini cards (`rounded-xl`).
  - **Monthly Honours Spotlight Banner (`v2.1 §M5`):** Collapsible gold-accented strip showing the current **Member of the Month** & **Department Champions**.
- [ ] **Step 3: Build `Next Workshop` Card + 4 Colored Quick-Action Tiles + `My Assigned Tasks` + `Latest News`**
  - **`Next Workshop` (`See all` -> `/workshops`):** Python icon on left, **`Python for Scientists`**, `Beginner` (sky pill) + `+150 XP` (mint pill), `📅 Tomorrow · 14:00 - 17:00`, `📍 Faculty of Sciences · Lab A1`, `👥 24 seats left`, and right royal blue **`Join`** button (or **`Check-in`** when live, opening **Screen 5**).
  - **4 Colored Quick-Action Tiles (Exact Screen 2 Colors & Icons):**
    1. **`Scan QR`** (`#1D63EB` solid royal blue card -> opens **Screen 5 `/checkin`**)
    2. **`Exams`** (`#D6ECFA` soft sky card -> opens **Screen 9 `/exams/astrophysics`**)
    3. **`Submit Project`** (`#FDE68A` warm amber card -> opens **Screen 10 `/projects/submit`**)
    4. **`Proposals`** (`#BBF7D0` mint emerald card -> opens **Screen 8 `/proposals`**)
  - **`My Assigned Tasks` Widget (`v2.1 §M4 & §7`):** Shows the member's assigned department/event tasks with point value (`+25 XP`), deadline, **`Confirm Receipt`** button, and **`Deliver / Attach Proof`** sheet.
  - **`Latest News` Card (`See all` -> `/explore`):** Space exoplanet thumbnail, `ASTRONOMY` tag, **"New exoplanet discovered with Earth-like conditions"**, `NASA · Sep 22, 2026`.

---

#### Task 10: Screen 3 — Explore Feed & Featured Carousel (`/explore` — Tab 2)
**Files:**
- Create: `src/app/(mobile)/explore/page.tsx`

- [ ] **Step 1: Build Header & 5 Filter Pills (`v2.1 §M9` + Screen 3 Match)**
  - Title **`Explore`**, subtitle *"Discover the world of science."*, right search button (live keyword search).
  - Filter pills: **`All`** · **`Scientific News`** · **`Events`** (`Events News`) · **`Opportunities`** · **`QUANTA News`**.
- [ ] **Step 2: Build the Interactive Top Hero Carousel + Categorized Article List**
  - **Featured Carousel Card (`height: 185px`, `rounded-2xl`):** Full-bleed space black-hole/exoplanet illustration, dark bottom gradient overlay, `ASTRONOMY` pill, white bold title **"New exoplanet discovered with Earth-like conditions"**, `NASA · 2 min read · Sep 22, 2026`, and interactive 5-dot pagination (`• ● • • •`).
  - **Vertical Feed List:**
    - `TECHNOLOGY` (sky pill): *"How AI is changing scientific research"* (`Nature · 3 min read · Sep 21, 2026`)
    - `SCIENCE` (sky pill): *"Algerian students shine at international competition"* (`The Science Times · Sep 18, 2026`)
    - `OPPORTUNITY` (amber pill `#FEF3C7`/`#B45309`): *"Fully funded research internships for 2027"* (`Research · Sep 15, 2026`)
    - `QUANTA CLUB` (cyan pill `#CFFAFE`/`#0E7490`): *"QSSC' 2026: Registration is now open!"* (`Quanta · Sep 14, 2026`)
  - **Article Reader Bottom Sheet:** Opens full summary, category, date, source, and external link CTA.

---

#### Task 11: Screen 4 — Workshops & Activities Hub (`/workshops` — Tab 1)
**Files:**
- Create: `src/app/(mobile)/workshops/page.tsx`

- [ ] **Step 1: Build Header, 4 Filter Tabs (`All | Upcoming | Completed | Mine`) & 5 Workshop Cards**
  - Exact card structure from Screen 4 & `v2.1 §M3`:
    - Left `64×64` rounded-xl icon/illustration (`Python` logo, `Arduino` board, `Astronomy` telescope, `3D Printing` machine, `Data Analysis` chart).
    - Title (`Python for Scientists`, etc.).
    - Level pill (`Beginner` / `Intermediate` / `Advanced`) + Mint XP pill (`+150 XP`, `+120 XP`, `+180 XP`, `+100 XP`).
    - Date & Time row (`Tomorrow · 14:00 - 17:00`) + Venue row (`Faculty of Sciences · Lab A1`) + Capacity (`24 seats left`).
    - Right soft-sky circular arrow button `→`.
- [ ] **Step 2: Build the 2-Level Workshop Detail, Registration, Check-in & Feedback Sheet (`v2.1 §M3 & §7`)**
  - Shows instructor, description, learning objectives, required materials, linked skill badge, and lifecycle state actions:
    - **`Register Now`** (or `Join Waitlist` if `seatsLeft === 0`, or `Cancel Registration`).
    - **`Open Live QR Check-In`** (navigates to **Screen 5 `/checkin`**).
    - **`Submit Post-Workshop Feedback`** & **`Download Materials`** (enabled when workshop status is `Completed`).

---

#### Task 12: Screen 5 — Cosmic Workshop Check-In Scanner, 6-Digit Code & Validity Timer (`/checkin`)
**Files:**
- Create: `src/app/(mobile)/checkin/page.tsx`

- [ ] **Step 1: Build the Exact Screen 5 Cosmic Dark Check-In UI**
  - Deep space background (`#041226`) with glowing planet horizon at bottom.
  - Top bar: `<` Back button + **`Workshop Check-in`**.
  - Session Info Stack: **`Python for Scientists`**, `📅 Today · 14:00 - 17:00`, `📍 Faculty of Sciences · Lab A1`, and glowing emerald pill **`● Live Session`** (`rgba(16,185,129,0.2)` bg, `#34D399` text).
  - **QR Scanner Viewfinder (`220px × 220px`):** Rounded square with glowing cyan corner brackets (`#29D2FF`), blurred QR preview inside, and an animated **golden-amber horizontal laser scan line (`#FBB03B`)**.
  - Prompt text: **`Scan the workshop QR`** / *"Ask the organizer to show the live QR code"* + interactive **`[ Simulate Camera Scan ]`** trigger button for desktop testing.
- [ ] **Step 2: Build the `OR` 6-Digit Manual Fallback Input & Live `04:58` Countdown Timer**
  - `OR` divider line.
  - Dark glass input row: **`Enter 6-digit code`** (`font-mono tracking-widest`) + Royal Blue submit button **`[ → ]`**.
  - Bottom dark glass timer box: Golden stopwatch icon + **`QR code is valid for 04 : 58`** (`minutes` / `seconds` live ticking countdown).
- [ ] **Step 3: Server Validation Rules (`v2.1 §M3`)**
  - Verifies session is `Running`, code matches the active session QR or 6-digit code, and member hasn't already checked in for this session -> records verified attendance, credits `+150 XP` to the Points Ledger, and triggers the **Celebratory XP / Badge Modal**.

---

#### Task 13: Screen 6 — My Badges Hexagonal Vault (`/badges` — Tab 4)
**Files:**
- Create: `src/app/(mobile)/badges/page.tsx`
- Create: `src/components/badges/HexagonBadgeCard.tsx`

- [ ] **Step 1: Build the 2-Row Filter System Matching Screen 6**
  - **Row 1 (Status & Counters):** **`All`** (active blue pill) · **`Unlocked 12`** · **`In Progress 6`** · **`Locked 10`**.
  - **Row 2 (Category Filter):** **`All`** (active blue pill) · **`Science`** · **`Technology`** · **`Soft Skills`** · **`Club`**.
- [ ] **Step 2: Build the 3-Column Hexagonal Badge Grid with Gold XP Pills (`Screen 6 Match`)**
  - Render all 12 badges from Screen 6 in a 3-column grid:
    - *Row 1:* `Astronomy Explorer` (`+150 XP`), `Python Explorer` (`+120 XP`), `Data Analysis` (`+120 XP`)
    - *Row 2:* `Electronics` (`+120 XP`), `Scientific Communication` (`+100 XP`), `Teamwork` (`+100 XP`)
    - *Row 3:* `Leadership` (`+150 XP`), `Laboratory Safety` (`+100 XP`), `Innovation` (`+120 XP`)
    - *Row 4 (Locked):* `AI Basics` (`🔒 Locked`), `Cybersecurity` (`🔒 Locked`), `Research Methods` (`🔒 Locked`)
  - Each unlocked/active badge card displays:
    1. Dark navy 3D hexagon (`#0A1E3C`) with glowing blue (`#2563EB`) or gold (`#F59E0B`) border and thematic icon.
    2. Bold 1-2 line badge title (`11.5px` `#0F172A`).
    3. **Warm Gold XP Pill underneath (`#FEF3C7` bg, `#B45309` bold text: `+150 XP`)**.
- [ ] **Step 3: Build the Flexible Badge Detail & Evaluation Launcher Sheet (`v2.1 §M6`)**
  - Tapping any badge opens a sheet displaying its description, criteria, XP reward, award date (if unlocked), and buttons for its configured earning methods:
    - **`Take Online Exam`** -> navigates to **Screen 9 (`/exams/[badgeId]`)**
    - **`Submit Project`** -> navigates to **Screen 10 (`/projects/submit`)**
    - **`On-Site / Manual Award Status`** (shows verification instructions).

---

#### Task 14: Screen 7 — Member Profile, Governance Rows & Personal QR Pass (`/profile` — Tab 5)
**Files:**
- Create: `src/app/(mobile)/profile/page.tsx`
- Create: `src/components/mobile/PersonalQRModal.tsx`

- [ ] **Step 1: Build the Identity Header Card with Mini Personal QR Button (Exact Screen 7 Match)**
  - Left: `76px` circular avatar with `#22C55E` dot.
  - Center: **`Ayoub Sarri`**, `@quanter0248` (`QT-26-0248`), `Applied Physics`, `University of Algiers 1`, *"Exploring today, a brighter tomorrow."*
  - Right: **Scannable Mini QR Code Box (`44×44px`)** — tapping opens the full-screen **Personal Quanter ID & QR Pass Modal** (used when an Organizer scans the member's QR under **Check-in Mode 2**, `v2.1 §M3`!).
- [ ] **Step 2: Build Hero `Lv. 7` Card, 4-Column Stat Strip, & Club Governance Info Rows**
  - `Lv. 7 Quantum Explorer` (`820 / 1000 XP`) card.
  - 4-Column Stat Strip: **`12 Badges`** | **`18 Workshops`** | **`3 Projects`** | **`1200 Total XP`**.
  - **Club Governance Card (3 Structured Rows matching Screen 7):**
    1. `🏛️ Department` -> **`IT and Technical Solutions  ›`** (tapping shows department head, co-manager, and placement history).
    2. `🔬 Scientific Team` -> **`Astronomy & Astrophysics  ›`** (tapping shows team leader & fellow members).
    3. `🛡️ Member Status` -> **`🟢 Active Member`** · `Since Oct 2026` (if `Trainee`, tapping expands the **3-Ring Confirmation Tracker**: `Time 3m`, `Attendance ≥75%`, `Tasks on time`).
  - **Skills Row:** `Python` · `Data Analysis` · `Astronomy` · **`+ Add`** button.
- [ ] **Step 3: Add Self-Service Profile Sheets (`v2.1 §3.5 & §M5`)**
  - **`My Points Ledger & 48h Appeal` Sheet:** Shows every `+ / −` XP ledger entry and a **`Contest / Appeal (48h window)`** button next to recent deductions/entries.
  - **`Edit Profile & Availability` Sheet:** Edit avatar (auto-compressed), 7-day availability grid, and outside activities box.

---

#### Task 15: Celebratory Milestone & Recognition Modals (Badge Unlocked, Active Confirmation, Member of the Month)
**Files:**
- Create: `src/components/mobile/MilestoneCelebrationModal.tsx`

- [ ] **Step 1: Build the Cosmic Celebration Overlay**
  - Supports 3 celebratory triggers: **Badge Unlocked** (`Python Explorer +150 XP`), **3-Month Official Confirmation (`Trainee -> Active Member`)**, and **Monthly Honours (`Member of the Month / Department Champion +50 XP`)**.

---

### Phase 3: Mobile Member PWA — Proposals, Online Exam, Project Submission, Notifications & Manager Workspace (Screens 8–12) (Tasks 16–20)

#### Task 16: Screen 8 — Proposals Engine with 3×2 Visual Type Grid (`/proposals` — `v2.1 §M8`)
**Files:**
- Create: `src/app/(mobile)/proposals/page.tsx`

- [ ] **Step 1: Build Header & Top 3-Segment Mode Bar (`New Proposal | My Proposals | History`)**
  - Title **`Proposals`**, subtitle *"Turn your idea into an impact."*, search icon.
- [ ] **Step 2: Build the Exact 3×2 `Proposal Type` Visual Selector Grid from Screen 8**
  - 6 interactive icon cards (`rounded-xl`, selected card has `#1D63EB` border and `#EBF3FC` fill):
    1. **`Event`** (Calendar-star icon)
    2. **`Workshop`** (Easel/presentation icon)
    3. **`Activity`** (Pulse/outing icon)
    4. **`Collaboration`** (Nodes/partnership icon)
    5. **`Internal Law Amendment`** (Document-text icon — displays Law Art. 33 badge: *"Requires 2/3 Executive Board Approval"*)
    6. **`Other`** (`...` icon — includes `Idea / Improvement`)
- [ ] **Step 3: Render Dynamic Fields Per Proposal Type (`v2.1 §M8`)**
  - Base fields shown in Screen 8 (`Title`, `Description`, `Expected Date`, `Location`) plus dynamic type-specific fields from `v2.1 §M8`:
    - *Event:* Goal, Target Audience, Expected Attendance, Budget Estimate, Needed Departments, Partners.
    - *Workshop:* Instructor, Level (`Beginner/Intermediate/Advanced`), Objectives, Sessions, Materials Needed, Capacity, Linked Badge.
    - *Activity:* Activity Type, Participants Count, Transport/Logistics Needs, Estimated Cost.
    - *Internal Law Amendment:* Article Concerned (`e.g. Art. 14`), Current Text, Proposed Text, Justification.
    - *Collaboration:* Partner Name & Type (`Club/Lab/Company/Association`), Contact, Form of Cooperation, Benefits & Obligations.
    - *Idea / Other:* Area, Problem, Proposed Solution.
  - **`My Proposals` Tab:** Displays submitted proposals with status chips (`Draft`, `Submitted`, `Under Review`, `Approved`, `Changes Requested`, `Rejected`) and reviewer comments.

---

#### Task 17: Screen 9 — Online Badge Exam Lobby & Timed MCQ Runner (`/exams/[badgeId]` — `v2.1 §M6.1`)
**Files:**
- Create: `src/app/(mobile)/exams/[badgeId]/page.tsx`

- [ ] **Step 1: Build the Exact Screen 9 Pre-Exam Lobby View**
  - Top bar: `< Online Exam` + search/help icon.
  - **Badge Exam Header Card:** Left dark-navy hexagon icon (`Astrophysics Basics`), title **`Astrophysics Basics`**, `Intermediate` (sky pill) + `+100 XP` (mint pill).
  - **2×2 Exam Metrics Box (`#F8FAFC` / `#EBF3FC` card):**
    - `Duration`: **`60 minutes`** | **`40 MCQs`**
    - `Passing Score`: **`70%`** | `Attempts`: **`1/2`**
  - **`Rules:` Card:**
    - `• Stable internet connection`
    - `• No other tabs or apps`
    - `• Camera monitoring (if required)`
    - `• Submit before the time ends`
  - Full-width Royal Blue button: **`Start Exam`**.
- [ ] **Step 2: Build the Interactive Timed MCQ Exam Runner & Auto-Grader**
  - Clicking **`Start Exam`** switches to the live question stepper with countdown timer, question progress bar, selectable answer cards, **`Submit Exam`** button, automatic score calculation (`>= 70%` pass check), automatic `+100 XP` ledger entry, and immediate **Badge Unlocked Celebration Modal**.

---

#### Task 18: Screen 10 — Badge Project Submission Screen (`/projects/submit` — `v2.1 §M6.3`)
**Files:**
- Create: `src/app/(mobile)/projects/submit/page.tsx`

- [ ] **Step 1: Build the Exact Screen 10 Project Submission Form**
  - Top bar: `< Submit Project` + search icon.
  - **`Project Title` Input:** `"e.g. Exoplanet Data Analysis"`.
  - **`Category / Linked Badge` Dropdown:** `"Select category ⌄"` (`Python Explorer`, `Data Analysis`, `Arduino & Electronics`, `Astrophysics`, etc.).
  - **`Description` Textarea:** `"Describe your project..."` + optional `Repository / Demo URL` field (`v2.1 §M6.3`).
  - **`Team Members (optional)` Field:** Input `"Add team member"` with blue **`+`** button and removable member chips.
  - **`Files` Cloud Dropzone Card:** Dashed border (`border-dashed border-sky-300 bg-sky-50/50`), blue cloud-upload icon, **`Upload files`**, *"PDF, ZIP, images (max 50 MB)"* (images automatically run through `compressAndResizeImage`).
  - Full-width Royal Blue button: **`Submit Project`** (routes submission to the Admin/Reviewer Badges Grading Desk).

---

#### Task 19: Screen 11 — Notifications & Official HR Messages Center (`/notifications` — `v2.1 §M7`)
**Files:**
- Create: `src/app/(mobile)/notifications/page.tsx`

- [ ] **Step 1: Build Header, 3 Filter Tabs (`All | HR | System`) & Notification Cards (Exact Screen 11 Match)**
  - **Filter Pills:** **`All`** (active blue) · **`HR`** (private HR & official notices) · **`System`** (workshops, badges, tasks, points).
  - **5 Notification Archetypes from Screen 11:**
    1. **HR Team** + red pill **`Action needed`** (`2h ago`): **"Complete your profile information"** — *"Dear member, please complete your profile..."* + unread blue dot.
    2. **System** + sky pill **`Info`** (`1d ago`): **"Workshop registration confirmed"** — *"You are registered for Python for Scientists..."*
    3. **HR Team** + amber pill **`Official notice`** (`2d ago`): **"Department meeting"** — *"A department meeting will be held this Saturday..."*
    4. **System** + sky pill **`Info`** (`3d ago`): **"New badge unlocked!"** — *"You have unlocked the Python Explorer badge..."*
    5. **Scientific Team** + indigo pill **`Message`** (`4d ago`): **"Astronomy observation this weekend"** — *"Meet at 18:00 at the observatory..."*
  - **Interactive Detail Sheet:** Tapping any message marks it `Read` (updating the Admin Message Tracking table in real time) and provides a direct action button (e.g., `Open Profile`, `View Workshop`, `View Badge`).

---

#### Task 20: Screen 12 — Mobile Manager Workspace (`/manager` — `v2.1 §M4 & §7`)
**Files:**
- Create: `src/app/(mobile)/manager/page.tsx`

- [ ] **Step 1: Build the Exact Screen 12 Department/Team Manager Mobile UI**
  - Header: **`Manager Workspace`**, subtitle *"Department Overview"*, search icon.
  - **Scope Switcher Dropdown Card:** `IT and Technical Solutions ⌄` (allows switching between managed departments/teams) + Manager avatar on right.
  - **4 Sub-Navigation Pills:** **`Overview`** (active blue) · **`Members`** · **`Tasks`** · **`Teams`**.
  - **4-Column Department KPI Row:**
    `[ 24 Members ]` · `[ 8 Active Tasks ]` · `[ 5 Ongoing Events ]` · `[ 12 Proposals ]`.
- [ ] **Step 2: Build `My Tasks` Validation List & `Department Members` Roster (Screen 12 Match)**
  - **`My Tasks` (`See all`):**
    - `☑️ Validate workshop attendance` — red pill **`Today`**
    - `☑️ Review project submissions` — amber pill **`2 days left`**
    - `☐ Prepare department meeting` — green pill **`In progress`**
    - `☐ Update team members list` — gray **`✓ To do`**
    - *Interaction:* Tapping a delivered task opens the **Quick Task Validation & Scoring Sheet** (`v2.1 §M4.3`: give full score, partial score, or bonus within category limits + required feedback note!).
  - **`Department Members` (`See all`):**
    - `Lotfi` (`Head · 🟢 Active`) + message `✉️` and action menu `⋮`
    - `Nesrine` (`Co-Manager · 🟢 Active`) + message `✉️` and action menu `⋮`
  - **Dedicated Manager Bottom Nav Bar (as shown at bottom of Screen 12):**
    `[ Home ] — [ Members ] — (( Tasks - Raised Center Circle )) — [ Stats ] — [ More / Scan Member QR ]`.

---

### Phase 4: Unified PC Admin, HR & Manager Dashboard — Shell, Overview, People & Org (v2.1 §2, §3, §4, §6) (Tasks 21–26)

#### Task 21: Unified Desktop Dashboard Layout & Permission-Aware Sidebar (`/admin/layout.tsx`)
**Files:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/components/admin/AdminSidebar.tsx`

- [ ] **Step 1: Build the Cosmic Navy Sidebar (`#06182C`) with the Exact 6 Navigation Groups from `v2.1 §6.1`**
  - Top Brand Header: Official `<QuantaLogo />` + **`QUANTERS ERP`** + active role badge.
  - **6 Grouped Menus (dynamically filtered by the active user's permissions per `§6.1 & §8`):**
    - **Home:** `Overview`
    - **People:** `Members` · `Departments & Teams` · `Former Members` · `Invitations`
    - **Activity:** `Workshops` · `Tasks & Matrix` · `Proposals`
    - **Growth:** `Points & MotM` · `Badges & Exams` · `Stats`
    - **Communication:** `Messages (In-App & Email)` · `Explore CMS`
    - **Control:** `Access & Roles` · `Settings 🔒` · `Audit Log 🔒`
  - **Bottom Quick Status Indicator:** Shows live **`Registration: OPEN / PAUSED`** pill + **Role Preview Switcher** (`Super Admin (15 pages)` | `HR Head (9 pages)` | `Dept Head (4 pages)` | `Executive` | `KPI Viewer (1 page)`).

---

#### Task 22: Admin Overview Page — 7 Single-Number KPI Tiles & "Alerts Today" Queue (`/admin/overview`)
**Files:**
- Create: `src/app/admin/overview/page.tsx`

- [ ] **Step 1: Build the 7 Color-Coded Overview Tiles (`v2.1 §6.2`)**
  - Royal Cobalt Club Pulse Banner at top + 7 clean tiles (one number + one semantic color each):
    1. **Current Members by Status** (`Active / Trainee / Inactive / Suspended`)
    2. **Trainees Ready to Confirm** (`🟢 Green` — 3m + ≥75% attendance + tasks on time)
    3. **Trainees Without a First Task (Day ≥ 25)** (`🟠 Amber`)
    4. **Members at Risk (Health Score < 50)** (`🔴 Red`)
    5. **Attendance Rate This Month** (`91%`)
    6. **Days Left to Member of the Month** (`Day 25 / 28 countdown`)
    7. **Pending Reviews** (`Tasks · Badges · Proposals`)
- [ ] **Step 2: Build the "Alerts Today" Action List (One Direct Action Button Per Alert — `v2.1 §6.4`)**
  - Renders every active system alert from `§6.4` (`No first task`, `No buddy`, `Trainee off-track`, `Silent member 30d`, `Missed deadlines`, `Ready to confirm`, `Team size out of 5–8 range`) with its single one-click resolution modal (`[Assign Task]`, `[Assign Buddy]`, `[Message]`, `[Confirm Active]`, `[Rebalance Team]`).

---

#### Task 23: Current Members Table, Multi-Filter, Availability Explorer & "Copy All Emails" (`/admin/members`)
**Files:**
- Create: `src/app/admin/members/page.tsx`

- [ ] **Step 1: Build the Filter Bar & One-Click `[ 📋 Copy All Emails ]` Action (`v2.1 §6.1`)**
  - Filters: Search (name/ID/email), Department (6 fixed), Scientific Team, Academic Year, Major, Status (`Trainee | Active | Inactive | Suspended`), Health Score Color (`🟢 ≥70 | 🟠 50–69 | 🔴 <50`), and **Free Slot Filter** (`Day + Morning/Afternoon/Evening`).
  - **Top Action Bar:**
    - **`[ 📋 Copy All Emails (N) ]`:** Copies the comma/newline-separated email addresses of all currently filtered members to the clipboard in one click with visual confirmation.
    - **`[ ✉️ Message Filtered ]`** (opens Dual-Channel Composer pre-loaded with filtered recipients).
    - **`[ 📥 Export CSV ]`** (logs data export to Audit Log).

---

#### Task 24: Unified 6-Tab Member Card & Trainee 3-Ring Confirmation Tracker (`/admin/members/[id]`)
**Files:**
- Create: `src/app/admin/members/[id]/page.tsx`

- [ ] **Step 1: Build Member Header & Trainee Confirmation Box (`v2.1 §M2 & §6.4`)**
  - Header: Avatar, Full Name, `QT-26-XXXX`, Status Pill, Department, Scientific Team, Level/XP, Health Score Badge (`🟢 86 — 50% Attendance + 35% On-Time Tasks + 15% Recent Activity`), Recognition Labels (`Star Member`, `Department Champion`), and Onboarding 4-Tick Checklist (`Profile · Buddy · First Task · First Workshop`).
  - **Trainee 3-Ring Tracker:** Visual SVG progress rings for **Time (`3 months`)**, **Attendance (`≥75%`)**, and **Tasks On Time**, plus Head & Co-Manager evaluation checkboxes and **`[ ✓ Confirm as Official Active Member ]`** button.
- [ ] **Step 2: Build the 6 Member Card Tabs (`v2.1 §6.4`)**
  1. **`Profile`:** Wizard answers, phone/email, academic info, and the **Merged Outside Activities & Volunteering Box** (shows automatic **Law Art. 7 Warning Banner** if the member holds a Bureau role and declared an external student organization!).
  2. **`Activity`:** Full attendance log, assigned tasks history, and personal points ledger.
  3. **`Badges`:** Awarded badges, exam attempts, and manual badge award button.
  4. **`Availability`:** Visual `Saturday … Friday × Morning/Afternoon/Evening` heatmap grid.
  5. **`History`:** Complete chronological audit trail of status transitions, department moves, and team changes (showing `Old -> New`, `Who`, `Date`, and `Reason`).
  6. **`HR 🔒`:** Health score formula breakdown, risk flags, and status transition buttons (`Set Inactive`, `Suspend [with end date]`, `Record Resignation [with reason + manager name]`, `Record Removal [with reason + decision ref]`, `Move to Alumni [with graduation year]`).

---

#### Task 25: Fixed 6 Departments (Move with Reason) & Editable Scientific Teams CRUD (`/admin/org`)
**Files:**
- Create: `src/app/admin/org/page.tsx`

- [ ] **Step 1: Build the 6 Permanent Departments Panel (`v2.1 §2.1`)**
  - Displays all 6 fixed departments (`Events and Scientific Activities`, `HR and Internal Development`, `External Relations and Sponsorship`, `Media and Digital Marketing`, `IT and Technical Solutions`, `Finance, Logistics and Equipment`).
  - **No Delete button exists** (enforcing `v2.1 §2.1`). Super Admin can edit name/description/icon; Admin/HR can assign **Department Head** and **Co-Manager**.
  - **Move Member Modal:** Moving any member between departments opens a mandatory dialog: `From Department` -> `To Department`, **Required Reason Textarea**, auto-filled Actor & Timestamp -> updates member record and appends to `PlacementChange` history & Audit Log.
- [ ] **Step 2: Build the Scientific Teams CRUD & Roster Manager (`v2.1 §2.2`)**
  - Create new team, edit name/field/description/icon/leader, add member to team, remove member from team (**prompts for required reason**).
  - **Smart Delete / Archive Guard:** If `team.memberIds.length === 0`, shows **`Delete Team`**; if `team.memberIds.length > 0`, replaces Delete with **`Archive Team`** so historical member links are never broken.
  - Displays a soft amber indicator badge when a team is outside the configured **`5–8 members`** optimal range.

---

#### Task 26: Former Members (`Resigned · Removed · Alumni`) & Invitations Console (`/admin/former-members` & `/admin/invitations`)
**Files:**
- Create: `src/app/admin/former-members/page.tsx`
- Create: `src/app/admin/invitations/page.tsx`

- [ ] **Step 1: Build the 3-Tab Former Members Archive (`v2.1 §4.2 & §M11`)**
  - Tabs: **`Resigned`** (shows Reason + **Name of Manager who filled it** + Date) · **`Removed`** (shows Reason + Decision Reference + Actor + Date) · **`Alumni`** (shows Graduation Year + Alumni Portal Access status + **`Resend Alumni Link`**).
  - **`Reactivate Member` Action:** Prompts for reactivation reason, restores member to `Active` or `Trainee`, and preserves all prior history.
- [ ] **Step 2: Build the HR Invitations Manager (`v2.1 §3.1`)**
  - Bulk paste email list or add one-by-one, optional pre-selected Department, status pills (`Sent | Opened | Completed | Expired`), **`Resend Link`**, **`Cancel Invitation`**, and **`Preview Invitation Link`** (opens `/onboarding` as that invitee).

---

### Phase 5: Unified PC Admin Dashboard — Activity, Growth, Communication & Control Modules (Tasks 27–34)

#### Task 27: Admin Workshops Manager, Attendance Corrections & Projector QR View (`/admin/workshops`)
**Files:**
- Create: `src/app/admin/workshops/page.tsx`

- [ ] **Step 1: Build Workshop CRUD, Lifecycle Controls & Roster Manager (`v2.1 §M3`)**
  - Create/edit workshop (with auto-compressed cover/icon, level, capacity, XP reward, linked badge).
  - **Full-Screen Amphi Projector QR Modal:** Displays the large rotating QR code, the **6-digit manual fallback code**, the `04:58` validity countdown timer, and live scanned attendees ticker.
  - **Attendance Roster & Audited Correction Modal:** Holders of `Check-in` permission can manually mark a member Present/Absent/Excused — **requires a written reason** and writes directly to the Audit Log.

---

#### Task 28: Manager Task Kanban Board, Per-Member Scoring & Printable Event Task Matrix (`/admin/tasks`)
**Files:**
- Create: `src/app/admin/tasks/page.tsx`

- [ ] **Step 1: Build the 4-Column Task Board & Validated Scoring Flow (`v2.1 §M4.1–4.3`)**
  - Columns: **`To do`** -> **`In progress`** -> **`Delivered`** -> **`Validated`** (plus `Late` / `Cancelled` filter).
  - Create Task Modal: Title, Description, Category (`Logistics`, `Media`, `Scientific`, etc.), Score value (validated against category min/max limits, e.g., `5–50 XP`), Assignees (each assignee gets their own independent assignment row & score), Linked Event/Workshop, Deadline, Shift/Location, Task Template selector.
  - **Validate & Score Modal:** Manager selects **Full Score**, **Partial Score**, or **Bonus**, writes a **required feedback note**, and confirms -> automatically credits the Points Ledger.
  - **Bulk Scoring Tool (`§M4.5`):** Award points to all organizers/participants of an event at once with a single reason.
- [ ] **Step 2: Build the Event Task Matrix Table View (`v2.1 §M4.4`)**
  - Toggle from Kanban to **Task Matrix Table (`Member — Role — Time — Location — Receipt Status`)**.
  - Includes **`[ 📢 Publish Matrix ]`** (sends notifications to all listed members and checks the `≥ 5 days before event` Law Art. 19 rule) and **`[ 🖨️ Print / Export Matrix ]`**.

---

#### Task 29: Proposals Inbox, Law Amendment 2/3 Badge & 1-Click Conversion (`/admin/proposals`)
**Files:**
- Create: `src/app/admin/proposals/page.tsx`

- [ ] **Step 1: Build the Multi-Type Proposals Review Desk (`v2.1 §M8`)**
  - Filter by type (`Event`, `Workshop`, `Activity`, `Internal Law Amendment`, `Collaboration`, `Idea`, `Other`) and state (`Submitted`, `Under Review`, `Approved`, `Changes Requested`, `Rejected`).
  - Displays reviewer authority (`Department Head` vs. `Executive Board`) and highlights `Internal Law Amendment` proposals with **`⚖️ Needs 2/3 Executive Approval (Law Art. 33)`**.
  - **Review Drawer:** Requires a reviewer comment on `Approve`, `Request Changes`, or `Reject`.
  - **1-Click Convert (`§M8`):** Approved proposals show **`[ ⚡ Convert to Workshop / Task Board ]`**, pre-filling a new Workshop or Event Task Board from the proposal fields.

---

#### Task 30: Immutable Points Ledger, Point Rules Editor, 48h Appeals & Member of the Month (`/admin/points`)
**Files:**
- Create: `src/app/admin/points/page.tsx`

- [ ] **Step 1: Build the Immutable Points Ledger & Reversal Modal (`v2.1 §M5`)**
  - Displays every ledger transaction (`Member · Amount (+/-) · Rule/Reason · Source · Validated By · Date`).
  - **No Edit/Delete button exists on ledger rows** — only **`[ ↩ Reverse Entry ]`** (prompts for a required reason and appends an offsetting `+ / −` reversal row) and **`[ + Manual Point Entry ]`** (selects a rule from the Point Rules table or custom reason).
- [ ] **Step 2: Build the Editable Point Rules Table & 48h Appeals Queue (`v2.1 §M5`)**
  - Editable table containing all 16 default rules (`General meeting +15`, `Weekly meeting +10`, `Early delivery +25`, `On-time delivery +15`, `Covering a shift +30`, `Giving a workshop +40`, `Internal test +35`, `Sponsorship +50`, `Buddy +30`, `Scientific article +25`, `Member of the Month +50`, `Late -10`, `Unjustified absence -25`, `Late delivery -20`, `Premises breach -30`, `Unprofessional conduct -40`).
  - **Appeals Tab:** Shows member point appeals submitted within 48h with `Accept Appeal (Reverse Entry)` or `Reject Appeal` actions.
- [ ] **Step 3: Build the Monthly "Member of the Month" & "6 Department Champions" Arbitration Desk (`v2.1 §M5`)**
  - Visualizes the `Day 25 -> Day 28 -> End of Month` cycle: ranks top candidates per department by monthly XP, allows Department Heads to input their qualitative score, and lets HR click **`[ 🏆 Approve & Publish Monthly Winners ]`** (awards `+50 XP`, assigns `Member of the Month` and 6 `Department Champion` labels for 30 days, and updates the Home banner).

---

#### Task 31: Admin Badges Library, Exam Builder, Manual Multi-Award & Project Grading Desk (`/admin/badges`)
**Files:**
- Create: `src/app/admin/badges/page.tsx`

- [ ] **Step 1: Build the Flexible Badge Manager (`v2.1 §M6`)**
  - **Tab 1 — Badge Library (CRUD):** Create/edit badges (auto-compressed icon, category, XP, earning paths). Badges with `awardCount > 0` show `Archive` instead of `Delete`. Includes **`[ 🎖️ Assign Badge Manually ]`** (select one or multiple members after an on-site test, attach note/proof) and **`[ Revoke Badge ]`** (requires reason).
  - **Tab 2 — Online Exam Builder:** Manage MCQ questions, pass percentage (`70%`), duration (`60 min`), and max attempts (`2`).
  - **Tab 3 — Project Submissions Review Queue:** View member project submissions (from **Screen 10**), inspect uploaded files/links, and click `Approve (Mint Badge + XP)`, `Request Revision`, or `Reject`.

---

#### Task 32: Club Stats & Fair Department/Team Analytics Page (`/admin/stats`)
**Files:**
- Create: `src/app/admin/stats/page.tsx`

- [ ] **Step 1: Build the 5 Stats Blocks with Total vs. Per-Member Average Toggle (`v2.1 §6.3`)**
  - **Period Selector:** `This Month` · `Semester` · `Season` · `Custom Range` + `[ Export Report ]`.
  - **Block 1 — Club Total:** Total XP earned, Workshops held, Total check-ins, Tasks validated, Badges awarded.
  - **Block 2 — Departments Ranking (Fairness Engine):** Side-by-side ranking and bar visualization by **Total Department Score** AND **Average Score per Member** (so smaller departments compete fairly against larger ones) + trend line.
  - **Block 3 — Scientific Teams Ranking:** Total score, Average score per member, Member count (`5–8` indicator), Activity rate.
  - **Block 4 — Top Members Leaderboard:** Filterable by Department, Team, and Academic Year.
  - **Block 5 — Participation Health Charts:** Monthly attendance curve, task on-time delivery rate, and badge category distribution.

---

#### Task 33: Dual-Channel Messages (`In-App ☐ / Email ☐`) & Explore CMS (`/admin/messages` & `/admin/explore`)
**Files:**
- Create: `src/app/admin/messages/page.tsx`
- Create: `src/app/admin/explore/page.tsx`

- [ ] **Step 1: Build the Dual-Channel Official Message Composer & Delivery Tracker (`v2.1 §M7`)**
  - **Recipient Selector:** `Single Member` · `Multiple Members` · `Department` · `Scientific Team` · `Status Group (e.g. All Trainees)` · `Everyone`.
  - **Priority Selector:** `Info` · `Action needed` · `Official notice`.
  - **Dual-Channel Checkboxes:** **`☑ In-App Notification`** and/or **`☑ Send via Email`**.
  - **Sent Messages Log:** Shows exact `Read / Unread` count (for In-App) and `Sent / Failed` count (for Email), and pushes the message immediately into **Screen 11 (`/notifications`)** of the Mobile PWA.
- [ ] **Step 2: Build the 4-Category Explore Content Manager (`v2.1 §M9`)**
  - Create, review, publish, and archive posts across `Scientific News`, `Events News`, `QUANTA News`, and `Opportunities` with auto-compressed cover images.

---

#### Task 34: Smart Access Delegation Console, Super Admin Settings 🔒 & Audit Log 🔒 (`/admin/access`, `/admin/settings`, `/admin/audit`)
**Files:**
- Create: `src/app/admin/access/page.tsx`
- Create: `src/app/admin/settings/page.tsx`
- Create: `src/app/admin/audit/page.tsx`

- [ ] **Step 1: Build the 4-Part Access & Smart Delegation Console (`v2.1 §8.1–8.3`)**
  - **Grant Access Builder:**
    1. **Who:** Select member
    2. **What (Capability):** `Members | Workshops | Check-in | Tasks | Points | Badges | Stats/KPI | Messages | Explore | Proposals | Former members | Cases | Settings | Audit`
    3. **Level:** `View | Edit | Approve | Manage`
    4. **Where (Scope):** `Whole Club | One Department | One Team | Single Workshop/Event (e.g. Python for Scientists)`
    5. **Until:** `Permanent` or **`Expiry Date`** (`e.g. 14 Nov 2026` — auto-expires!).
  - **14 Role Templates Library (`§8.2`):** One-click assignment of `Super Admin`, `Executive`, `HR Head`, `HR Member`, `Department Head`, `Co-Manager`, `Team Leader`, `Workshop Organizer`, `Check-in Operator`, `Reviewer`, `Editor`, `KPI Viewer`, `Member`, `Alumni`.
  - **Enforced Delegation Rules (`§8.3`):** Users can only grant capabilities they already hold, within their own scope, at the same level or lower; sensitive rights require `Super Admin` or `HR Head`; 1-click **`Revoke`** logs directly to the Audit Log.
- [ ] **Step 2: Build the Super Admin Settings Console (`v2.1 §6.5 & §10`)**
  - **Registration & Access Switches:** **`⏯ Pause / Reopen Registration`**, Invitation link validity (`7 days`), Alumni portal global switch.
  - **Business Rules Register Editor (`§10`):** Trainee duration (`3 months`), Confirmation attendance (`75%`), Confirmation XP (`150`), Inactivity flag (`30 days`), First task deadline (`Day 30`), Buddy deadline (`7 days`), Max active tasks (`2`), Points appeal window (`48h`), Task matrix publication lead time (`5 days`), Optimal team size (`5–8`), Season rollover button (`Start New Season`), Email templates editor, and Image compression limits.
- [ ] **Step 3: Build the Immutable Audit Log Viewer (`v2.1 §11`)**
  - Filterable by actor, action category (all 12 audited actions in `§11`), and date; displays `Timestamp · Actor · Action · Target · Old Value -> New Value · Reason` with CSV/JSON export.

---

### Phase 6: 5-State UI Completeness Gate, RTL Arabic Support & End-to-End Verification (Tasks 35–36)

#### Task 35: 5-State UI Completeness Gate & Bilingual (`EN / FR / AR` RTL) Polish
**Files:**
- Create: `src/components/shared/EmptyStateCard.tsx`, `src/components/shared/SkeletonLoader.tsx`

- [ ] **Step 1: Verify Loading, Empty, Ideal, Overflow & Error States Across All Screens**
  Ensure zero layout shift (`CLS = 0`), clean empty-state illustrations with primary CTAs when filters match 0 items, and inline form validation.

---

#### Task 36: End-to-End Cross-Surface Verification & Demo Control Bar
**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Verify Real-Time Synchronization Between Mobile App & PC Admin Dashboard**
  - Test Flow 1: Pause Registration in `/admin/settings` -> verify `/welcome` shows Registration Closed banner.
  - Test Flow 2: Move Ayoub Sarri to another Department with a reason in `/admin/org` -> verify `/profile` (Screen 7) and `/admin/audit` update immediately.
  - Test Flow 3: Open Live Projector QR in `/admin/workshops` -> copy 6-digit code -> enter it in `/checkin` (Screen 5) -> verify `+150 XP` is added to `/home` (Screen 2) and `/admin/points`.
  - Test Flow 4: Submit a Proposal in `/proposals` (Screen 8) -> approve and convert it in `/admin/proposals`.
