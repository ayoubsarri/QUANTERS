# Arabic Language & RTL Localization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate native Arabic (`ar`) language and bidirectional (RTL) layout support across the QUANTERS platform, allowing members to switch language from `/profile` and administrators from `/admin/settings`, with fully translated UI interfaces and daily quotes, while preserving database-driven entities (workshops, badge titles, exam questions, and level ranks) in their original entered format.

**Architecture:**
1. **Typography & Styling:** Inject Google Font `Cairo` alongside existing fonts in `src/app/layout.tsx` and configure RTL typography rules (disabling negative letter-spacing to protect Arabic cursive ligatures) in `src/app/globals.css`.
2. **State & Persistence:** Add `AppLanguage` (`"en" | "ar"`) to `Member` and `SystemSettings` in `src/lib/types/erp.ts`. In `src/lib/store/useQuantersStore.ts`, maintain `activeLanguage`, `setLanguage()`, and auto-sync with `localStorage` and Firestore member profiles.
3. **Reactive HTML `dir` and `lang`:** Dynamically sync `<html dir="rtl" lang="ar">` or `<html dir="ltr" lang="en">` on language change with automatic bi-directional isolation.
4. **Translation Core & Dictionary (`src/lib/i18n/`):** Implement a zero-runtime-overhead translation dictionary covering navigation, headers, forms, buttons, tooltips, dialogs, status pills, and empty states.
5. **Switchers:**
   - Member Profile (`src/app/(mobile)/profile/page.tsx`): 2-segment language switcher pill (`English` / `العربية`).
   - Admin Settings (`src/app/admin/settings/page.tsx`): System & interface language card with instant hot-reload.
6. **Bilingual Daily Quotes (`src/lib/data/dailyQuotes365.ts`):** Provide authentic Arabic texts (`textAr`, `authorAr`, `categoryAr`) for Quran, Hadith, Algerian Scholars, Muslim Scientists, and world thinkers.
7. **Database Content Boundary:** Workshops, badges, exams, and member custom texts remain un-tampered (bilingual-friendly as written by managers/organizers).

**Tech Stack:** Next.js 15 (Static Export), React 19, TypeScript 5, Tailwind CSS, Zustand, Google Font `Cairo`, Cloud Firestore.

---

### Task 1: Typography, Google Font `Cairo`, and RTL Global Styles

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Import Google Font `Cairo` in `src/app/layout.tsx`**
  Add `Cairo` with `subsets: ["arabic", "latin"]` and variable `--font-cairo`.
- [ ] **Step 2: Add `--font-cairo` to `html` className in `src/app/layout.tsx`**
- [ ] **Step 3: Update `tailwind.config.ts` font families**
  Add `var(--font-cairo)` to `sans` and `display` font family stacks.
- [ ] **Step 4: Configure RTL rules in `src/app/globals.css`**
  Add `[dir="rtl"]` font overrides with `letter-spacing: normal` to preserve Arabic script cursive ligatures. Add BiDi isolation classes for numbers and code.
- [ ] **Step 5: Verify build with `npm run build`**

---

### Task 2: Type Definitions and Zustand Store Integration

**Files:**
- Modify: `src/lib/types/erp.ts`
- Modify: `src/lib/store/useQuantersStore.ts`

- [ ] **Step 1: Define `AppLanguage` in `src/lib/types/erp.ts`**
  ```typescript
  export type AppLanguage = "en" | "ar";
  ```
  Add `preferredLanguage?: AppLanguage;` to `Member` interface and `defaultLanguage?: AppLanguage;` to `SystemSettings`.
- [ ] **Step 2: Expand `DailyQuoteItem` in `src/lib/types/erp.ts`**
  Add optional fields `textAr?: string; authorAr?: string; categoryAr?: string;`.
- [ ] **Step 3: Add `activeLanguage` and `setLanguage` to `useQuantersStore.ts`**
  - Initialize from `localStorage.getItem("quanters_lang")` with fallback to `member?.preferredLanguage || "en"`.
  - In `setLanguage(lang: AppLanguage)`:
    - Update store state.
    - Write to `localStorage.setItem("quanters_lang", lang)`.
    - If `isAuthenticated && currentMemberId`, update `member.preferredLanguage = lang` and trigger sync.
    - Synchronously set `document.documentElement.dir = lang === "ar" ? "rtl" : "ltr"` and `document.documentElement.lang = lang`.
- [ ] **Step 4: Add hydration listener in `src/components/shared/PwaOfflineManager.tsx` or Root App Shell**
  Ensure root `<html>` attribute reflects stored language immediately on client hydration.

---

### Task 3: Translation Dictionary Architecture (`src/lib/i18n/`)

**Files:**
- Create: `src/lib/i18n/translations.ts`
- Create: `src/lib/i18n/useTranslation.ts`

- [ ] **Step 1: Author comprehensive translation dictionary in `src/lib/i18n/translations.ts`**
  Structure into clear domains:
  - `common`: Save, Cancel, Delete, Edit, Search, Filter, Confirm, Close, Back, Next, Loading, Copied, Share, Verified...
  - `nav`: Workshops (الورشات), Explore (استكشف), Home (الرئيسية), Badges (الشارات), Profile (الملف الشخصي), Admin (لوحة التحكم), Settings (الإعدادات)...
  - `adminSidebar`: Overview, Members, Tasks, Workshops, Badges & Exams, Points, Proposals, Org Structure, Access & Roles, Audit Log, Messages, Settings, Former Members, Alumni Network, Stats...
  - `home`: Greeting, daily streak, season label, quick check-in, recent achievements, quote header...
  - `workshops`: Workshop catalog, upcoming, registered, seats remaining, check-in instructions, status pills...
  - `explore`: Daily quiz, verify answer, club departments, scientific teams, internal laws...
  - `badges`: Skill tree, requirements, exam countdown, take exam, status tags...
  - `profile`: Identity, university record, tenure, academic year, attendance, task on-time, health score, hardware KYC, change password, language switcher, logout...
  - `checkin`: QR scanner, session code input, verified check-in confirmation...
  - `settings`: System settings, language & direction, auto-approval, quota presets, season label...
- [ ] **Step 2: Create lightweight `useTranslation` hook in `src/lib/i18n/useTranslation.ts`**
  ```typescript
  import { useQuantersStore } from "@/lib/store/useQuantersStore";
  import { translations } from "./translations";

  export function useTranslation() {
    const lang = useQuantersStore((s) => s.activeLanguage || "en");
    const setLanguage = useQuantersStore((s) => s.setLanguage);
    const t = translations[lang] || translations.en;
    const isRtl = lang === "ar";
    return { t, lang, setLanguage, isRtl };
  }
  ```
- [ ] **Step 3: Verify TypeScript typing and completeness of keys**

---

### Task 4: Member Profile Language Switcher (`/profile`)

**Files:**
- Modify: `src/app/(mobile)/profile/page.tsx`

- [ ] **Step 1: Import `useTranslation` into `src/app/(mobile)/profile/page.tsx`**
- [ ] **Step 2: Add the "Language / اللغة" Segmented Control Card**
  Place in the Settings section (above Change Password / Sign Out):
  - Compact glass card with globe icon (`Globe`).
  - Dual pill toggle: `[ English ]` and `[ العربية ]`.
  - Active button highlighted in cyan/navy with subtle glow.
- [ ] **Step 3: Translate profile interface labels**
  Academic record, attendance rate, on-time tasks, health score, skills, hardware KYC, change password modal, sign out button.
- [ ] **Step 4: Verify switching language immediately updates UI and sets `dir="rtl"`**

---

### Task 5: Admin Settings Language Switcher (`/admin/settings`)

**Files:**
- Modify: `src/app/admin/settings/page.tsx`

- [ ] **Step 1: Import `useTranslation` into `src/app/admin/settings/page.tsx`**
- [ ] **Step 2: Add "Platform Language & Localization / لغة المنصة والواجهة" Card**
  In Section 1 (General & Governance Settings):
  - Language options: `English (LTR)` and `العربية (RTL)`.
  - Save to system settings (`settings.defaultLanguage`) so new admin sessions default to the selected language.
- [ ] **Step 3: Translate admin settings tabs, form labels, tooltips, and save banners**
- [ ] **Step 4: Verify switching updates admin UI and flips layout dynamically**

---

### Task 6: Mobile App Shell, Bottom Nav & Core Mobile Views

**Files:**
- Modify: `src/components/mobile/BottomNavBar.tsx`
- Modify: `src/components/mobile/MobileAppShell.tsx`
- Modify: `src/app/(mobile)/home/page.tsx`
- Modify: `src/app/(mobile)/workshops/page.tsx`
- Modify: `src/app/(mobile)/explore/page.tsx`
- Modify: `src/app/(mobile)/badges/page.tsx`
- Modify: `src/app/(mobile)/checkin/page.tsx`

- [ ] **Step 1: Update `BottomNavBar.tsx`**
  Translate bottom tab labels: Workshops (الورشات), Explore (استكشف), Home (الرئيسية), Badges (الشارات), Profile (الملف الشخصي).
- [ ] **Step 2: Update `MobileAppShell.tsx`**
  Support RTL modal backdrops, top header bar, and quota alert banner.
- [ ] **Step 3: Localize `home/page.tsx` interface**
  Welcome header, quick actions, check-in shortcut, quote card header, stats indicators.
- [ ] **Step 4: Localize `workshops/page.tsx` interface**
  Search box, filter pills, seats left pill, register/cancel buttons (preserve dynamic workshop titles/descriptions as entered).
- [ ] **Step 5: Localize `explore/page.tsx` & `checkin/page.tsx`**
  Daily quiz UI buttons, scanner instructions, code input labels.

---

### Task 7: Admin Layout & Admin Sidebar RTL Support

**Files:**
- Modify: `src/components/admin/AdminSidebar.tsx`
- Modify: `src/app/admin/layout.tsx`
- Modify: `src/app/admin/overview/page.tsx`

- [ ] **Step 1: Localize `AdminSidebar.tsx` labels**
  Translate all 16 navigation links, department section headers, and collapse toggle.
- [ ] **Step 2: Adjust `AdminSidebar` and `AdminLayout` for RTL**
  In RTL mode, position sidebar on the right (`right-0`), mirror border lines, and adjust main content margin (`rtl:mr-64 rtl:ml-0`).
- [ ] **Step 3: Localize `admin/overview/page.tsx`**
  KPI card titles (Active Members, Retention, Attendance, On-Time Tasks), activity feed headers, quick action buttons.

---

### Task 8: Bilingual 365-Day Daily Quotes (`dailyQuotes365.ts`)

**Files:**
- Modify: `src/lib/data/dailyQuotes365.ts`
- Modify: `src/app/(mobile)/home/page.tsx` (Quote display)
- Modify: `src/app/admin/explore/page.tsx` (Quote manager)

- [ ] **Step 1: Add Arabic fields (`textAr`, `authorAr`, `categoryAr`) to quotes**
  - Quran & Hadith quotes: Provide verified Arabic Quranic verses and Hadiths.
  - Algerian Scholars: Provide authentic Arabic statements for Malek Bennabi, Abdelhamid Ben Badis, Emir Abdelkader, Ahmed Zabana.
  - Muslim Golden Age Scientists: Provide Arabic originals for Ibn al-Haytham, Al-Khwarizmi, Al-Biruni, Ibn Sina, Al-Razi.
  - World Scientists & Thinkers: Provide recognized standard Arabic translations for Newton, Einstein, Curie, Feynman, Sagan.
- [ ] **Step 2: Update quote rendering components to pick `textAr` when `lang === 'ar'`, falling back to `text`**

---

### Task 9: End-to-End Build, Verification & DevTools Testing

**Files:**
- Test via Playwright / Chrome DevTools MCP
- Build: `node scripts/build_firebase_out.mjs`

- [ ] **Step 1: Run production build and static export to confirm 0 compilation/type errors**
- [ ] **Step 2: Test Member Language Switch on `/profile` in browser**
  - Switch to Arabic: Verify `dir="rtl"`, Cairo font loaded, bottom navigation translated, profile cards mirrored cleanly.
  - Switch back to English: Verify `dir="ltr"` restored cleanly.
- [ ] **Step 3: Test Admin Language Switch on `/admin/settings` in browser**
  - Switch to Arabic: Verify Admin Sidebar moves to right, menu items translated, table layouts intact.
- [ ] **Step 4: Verify dynamic content resilience**
  - Workshop with English title renders legibly in Arabic interface.
  - Badge titles and exam questions render cleanly without corruption.
  - Quotes render authentic Arabic text in Arabic mode.
- [ ] **Step 5: Git commit and summarize deployment**
