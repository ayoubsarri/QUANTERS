# QUANTERS v3.0 — Full-Stack, Human-Centric UI/UX & Zero-Quota ERP Master Plan

## 1. Architectural Vision & Human-Centric UX Audit
- **Human-Centric Visual Hierarchy:** Replace dense text blocks with scannable visual pills, tabular numerals (`tabular-nums`), clear primary/secondary button hierarchy, tactile hover/active states (`active:scale-[0.98]`), and 5-state completeness (Loading, Empty, Ideal, Filtered, Error).
- **True Device Adaptivity:**
  - **Mobile First (`< 768px`):** Native full-bleed mobile viewport (`100dvh`), thumb-zone bottom bar with raised center **Home** anchor, smooth bottom sheets, and zero horizontal overflow.
  - **PC First (`>= 1024px`):** Spacious desktop ERP tables, sticky filter headers, 4-role simplified switcher, and an optional toggle on mobile routes between **Phone Preview Frame (`396px`)** and **Full-Width Responsive Web App Mode**.
- **Zero-Quota & High-Efficiency Backend (`src/lib/server/db.ts` + `/api/erp`):**
  - Persistent atomic JSON-WAL backend store (`data/quanters-db.json`) with in-memory caching and automatic client-server hydration.
  - Client-side `160x160` WebP avatar compression (`~10–18 KB` per avatar) ensuring 1,000+ members consume `< 1.5 MB` total storage.

---

## 2. Step-by-Step Execution Plan

### Phase 1: Full-Stack Backend, Upgraded ERP Data Model & Creative Brand System
1. **Task 1 — Expanded ERP Types & Seed Data (`src/lib/types/erp.ts`, `src/lib/data/seed.ts`):**
   - Add complete HR registration fields: `wilaya`, `commune`, `housingType` (`Family Home | University Residence | Shared Apartment`), `commuteTime`, `canStayLate`, `hasLaptop`, `pcCapability`, `equipmentTags`, `githubUrl`, `linkedinUrl`, `portfolioUrl`, `cvUrl`.
   - Add 22+ Faculty of Sciences specialties list (`UNIVERSITY_SPECIALTIES`).
   - Add 20+ Workshop & Badge Icon Field keys (`FieldIconKey`).
   - Add `isArchived` to `ClubMessage` and `TaskItem` for automatic read-archiving and old-task history.
   - Add multiple Online Exams (`SEED_EXAMS`) so `/exams` is a full multi-exam hub.
   - Simplify `AdminRolePreview` to 4 clear roles: `Super Admin`, `HR & Executive`, `Dept Manager`, `Viewer`.
2. **Task 2 — Persistent Full-Stack API & Sync Engine (`src/lib/server/db.ts`, `src/app/api/erp/route.ts`, `src/lib/store/useQuantersStore.ts`):**
   - Build server-side atomic database persistence (`data/quanters-db.json`) with `GET /api/erp` and `POST /api/erp` + storage telemetry (`dbSizeKB`, `avgAvatarKB`).
   - Connect `useQuantersStore` with automatic backend hydration and debounced state persistence.
3. **Task 3 — Creative QUANTERS Logo & 20+ Field/Badge SVG Icon Engine (`src/components/shared/QuantaLogo.tsx`, `src/components/shared/FieldIcon.tsx`, `src/components/badges/HexagonBadgeCard.tsx`):**
   - Design an ultra-creative animated SVG + orbital `QuantaLogo` with 3 interlocking quantum orbits, glowing particles, and bespoke `QUANTERS` typography.
   - Build `FieldIcon.tsx` with 20+ crisp vector icons for every workshop and badge discipline.
   - Upgrade `HexagonBadgeCard.tsx` with double-layered hexagonal SVG borders, inner constellation glow, and field icons.

### Phase 2: Mobile App UX Upgrade (Welcome Video, Full HR Registration, Exams Hub, Alumni Unified Mode, Auto-Archive)
4. **Task 4 — Welcome Screen with Infinite Loop Video (`src/app/(mobile)/welcome/page.tsx`):**
   - Embed `/brand/welcome_loop.mp4` (`C:\Users\hp\Downloads\gemini_generated_video_14376121.mp4`) in an infinite muted loop (`autoPlay loop muted playsInline`), paired with the new creative `QuantaLogo`, glassmorphic badges, and 1-tap entry to Member App, Direct Registration Form, or Alumni Mode.
5. **Task 5 — Comprehensive 6-Step Direct Registration Form (`src/app/(mobile)/onboarding/page.tsx`):**
   - Direct channel registration (no email invitation tokens required; gated only by `settings.registrationOpen`).
   - Includes 22+ University Specialties dropdown, Where They Live (`Wilaya`, `Commune`, `Housing Type`, `Commute Time`), PC & Equipment (`Has Laptop`, `PC Capability`, `Equipment Tags`), Digital Links (`GitHub`, `LinkedIn`, `Portfolio`, `CV`), 1 Department + 1 Team, 7-Day Availability Matrix, and Merged Outside Activities Box.
6. **Task 6 — Unified Home Screen (Member + Alumni Mode + Active/Done Tasks) (`src/app/(mobile)/home/page.tsx`):**
   - When `currentMember.status === 'Alumni'`, renders the tailored **Alumni Home View** inside the same 5-tab app (Alumni Honors card, Mentorship & Speaking, Open Workshops & Activities, Earned Badges, Club News).
   - Fixes the `[Exams]` quick-action tile to route to `/exams` (the Exams Hub) instead of a hardcoded exam.
   - Adds `Active Tasks` vs. `Done & Old Tasks` toggle directly inside the `My Assigned Tasks` section.
7. **Task 7 — Dedicated Exams Hub (`src/app/(mobile)/exams/page.tsx`) & Exam Runner (`src/app/(mobile)/exams/[badgeId]/page.tsx`):**
   - Create `/exams` listing all 6 available badge exams with search, category filter, difficulty, duration, pass mark, XP, and status (`Available`, `Passed ✓`). Clicking any exam opens `/exams/[badgeId]`.
8. **Task 8 — Workshops & Activities, Badges, Explore & Profile (`workshops/page.tsx`, `badges/page.tsx`, `explore/page.tsx`, `profile/page.tsx`):**
   - Rename page header to **"Workshops & Activities"** (keeping bottom tab label as **"Workshops"**), using the new 20+ `FieldIcon` vectors.
   - Fix `[Take Exam]` in Badges to open `/exams` or the selected badge's exam lobby cleanly.
   - Display the member's PC/Equipment, Residence/Commune, and Links cleanly inside `/profile`.
9. **Task 9 — Auto-Archiving Notifications (`notifications/page.tsx`), Proposals (`proposals/page.tsx`), & Manager Workspace (`manager/page.tsx`):**
   - In `/notifications`: Reading a message automatically moves it from `Inbox (Unread)` to `Archived (Read)`, with 1-click unarchive or archive-all.
   - In `/manager`: Add `Active Tasks` vs. `Done & Old Tasks` tabs with 1-click archive for completed tasks.

### Phase 3: PC Admin & HR ERP Refinement
10. **Task 10 — Simplified 4-Role Admin Sidebar, Removed Invitations & Upgraded Member Views (`AdminSidebar.tsx`, `admin/members/page.tsx`, `admin/members/[id]/page.tsx`, `admin/tasks/page.tsx`, `admin/settings/page.tsx`):**
    - Remove `Invitations` from Admin Sidebar and delete the `"Start New Season / Semester"` option in Settings.
    - Simplify Role Preview Mode to 4 clear roles (`Super Admin`, `HR & Executive`, `Dept Manager`, `Viewer`).
    - Show Residence/Commune, Laptop/Equipment availability, and Portfolio/GitHub links in the Member Directory & 6-Tab Member Card.
    - Add `Active Tasks` vs. `Done & Archived Tasks` filter tab in `/admin/tasks`.
    - Add live Backend Storage & Quota Footprint card in `/admin/settings`.
