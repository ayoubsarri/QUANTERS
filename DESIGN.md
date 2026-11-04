# QUANTERS — Elite Web UI Design Token System & Architecture Protocol (DESIGN.md)

> **Single Source of Truth (SSOT)** for all UI/UX architecture, visual design tokens, typography, component hierarchies, accessibility requirements, and motion curves across the entire QUANTERS platform.
> Strict adherence is mandatory for all frontend engineering. No arbitrary values (hex codes, margins, paddings, font sizes) are permitted outside of this token specification.

---

## 1. Brand Identity & Color Philosophy

QUANTERS is the digital platform for **QUANTA Club** — an elite scientific, academic, and technological innovation club. The aesthetic marries high-prestige scientific rigor with cosmic and quantum depth. It is inspired by the design excellence of **Stripe** (clarity, tactile micro-borders, deep contrast) and **Apple** (flawless typography, fluid ergonomics, meticulous spacing), coupled with a distinctive **Vox-style editorial punch** for scientific dissemination.

### 1.1 Brand Color Tokens (Semantic & Hex)

| Token Name | Hex Code | Role & Usage | Contrast Ratio (WCAG) |
| :--- | :--- | :--- | :--- |
| `quanta-cosmic` | `#041226` | Deepest cosmic canvas; page backgrounds in dark surfaces, modal underlays | $\ge 14:1$ with white text |
| `quanta-cobalt` | `#061E47` | High-prestige container background, card surfaces, top app shell headers | $\ge 11:1$ with white text |
| `quanta-deep` | `#094C9C` | Primary solid interactive elements, dark accents, badge geometry | $\ge 4.8:1$ with white text |
| `quanta-mid` | `#1A7EC2` | Secondary actions, active tab accents, vibrant focus rings | $\ge 3.5:1$ with white text |
| `quanta-royal` | `#1D63EB` | Primary CTA buttons, link text, verified student badges | $\ge 4.5:1$ on light canvas |
| `quanta-cyan` | `#29D2FF` / `#30C5F7` | Glowing quantum badges, active telemetry, laser indicators, focus outlines | Accent on cosmic canvas |
| `quanta-ice` | `#87D9F8` | Subdued scientific pill badges, secondary badge text | Accent |
| `quanta-amber` | `#FBB03B` | Season XP counters, leaderboard gold tier, star badges | Accent |
| `vox-yellow` | `#FFE500` | High-impact Vox editorial tags, breaking club announcements, urgent alerts | Bold editorial accent |
| `quanta-green` | `#80C342` / `#10B981`| Attendance verified, exam passed, admission approved, system online | Status success |
| `quanta-coral` | `#ED1C24` / `#EF4444`| Destructive action gates, rejected submissions, exam expired, errors | Status destructive |
| `canvas-light` | `#F4F7FB` | Main application background (Light mode default) | Clean, glare-free |
| `surface-white` | `#FFFFFF` | Card surfaces, interactive dropdowns, sheet panels | Maximum clarity |
| `sky-soft` | `#EBF3FC` | Subtle container background, secondary button fills | Subdued fill |
| `line-border` | `#DCE7F5` | Crisp, tactile card borders on light canvas | 1px border baseline |
| `line-border-dark` | `rgba(255,255,255,0.08)` | Micro-borders on dark cosmic surfaces | Layered tactile depth |

### 1.2 Anti-Slop Color Rules
- **FORBIDDEN:** Generic washed-out gray `#888888`, muddy `#ccc` borders, or uncoordinated pastel AI gradients.
- **MANDATORY:** Always pair deep navy `#061E47` or `#041226` with high-contrast text (`#FFFFFF` or `#F8FAFC`).
- **TACTILE BORDERS:** Every dark card must have an inner subtle border: `border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]`.
- **LIGHT SURFACE DISCIPLINE:** Every light card must have `border border-slate-200/80 bg-white shadow-card`.

---

## 2. Typography & Hierarchical Font Scales

QUANTERS uses a dual-engine Latin and Arabic typography system designed to ensure total legibility, academic authority, and micro-typographic beauty.

### 2.1 Font Families

| Typeface | Variable | Script | Usage Scope |
| :--- | :--- | :--- | :--- |
| **Outfit** | `var(--font-outfit)` | Latin | High-impact headings, stat counters, modal headers |
| **Syne** | `var(--font-syne)` | Latin | Editorial badges, hero titles, scientific magazine headings |
| **Plus Jakarta Sans** | `var(--font-jakarta)` | Latin | Body copy, forms, table data, telemetry, UI buttons |
| **Changa** | `var(--font-changa)` | Arabic | Display headings in RTL mode, bold club slogans, banner titles |
| **Cairo** | `var(--font-cairo)` | Arabic | Primary Arabic UI text, form inputs, button labels, article text |
| **Amiri** | `var(--font-amiri)` | Arabic | Classical literary quotes, cultural heritage text, laureate mottoes |
| **JetBrains Mono** | `var(--font-mono)` | Monospace | Code blocks, 6-digit PINs, UUIDs, timestamps, JSON schemas |

### 2.2 Hierarchical Scale & Weights

| Level | Size (Desktop / Mobile) | Line Height | Tracking | Recommended Classes |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Title** | `36px` / `28px` | `1.15` | `-0.03em` | `text-2xl sm:text-4xl font-extrabold font-display tracking-tight` |
| **Section H1** | `28px` / `22px` | `1.2` | `-0.025em` | `text-xl sm:text-2xl font-bold font-display tracking-tight` |
| **Card H2** | `20px` / `18px` | `1.3` | `-0.02em` | `text-lg sm:text-xl font-bold font-heading` |
| **Subhead H3** | `16px` / `15px` | `1.4` | `-0.01em` | `text-base font-semibold font-heading` |
| **Body Primary**| `15px` / `14px` | `1.55` | `normal` | `text-sm sm:text-base font-normal text-slate-700` |
| **Caption / Tag**| `12px` / `11px` | `1.4` | `+0.02em` | `text-xs font-medium uppercase tracking-wider` |
| **Telemetry** | `13px` / `12px` | `1.0` | `normal` | `font-mono text-xs tabular-nums` |

### 2.3 RTL Arabic Micro-Typography Rules
- Never use negative tracking (`letter-spacing: -...`) on Arabic text; it destroys Arabic cursive ligatures (`letter-spacing: normal !important`).
- Ensure all numbers in Arabic sentences use `dir="ltr"` or `<bdi>` tags to prevent punctuation flip.
- Always provide line-height $\ge 1.6$ for Arabic text due to ascender/descender heights.

---

## 3. Spacing, Ergonomics & Fitts's Law (Mobile-First)

### 3.1 8-Point Baseline Grid
All dimensions, margins, paddings, and component sizes MUST snap to multiples of **4px** and **8px**:
- `4px` (`gap-1`, `p-1`) — Micro spacing between icons and badge text.
- `8px` (`gap-2`, `p-2`) — Padding inside compact pills and list items.
- `12px` (`gap-3`, `p-3`) — Standard item gap in stacked cards.
- `16px` (`gap-4`, `p-4`) — Standard container internal padding.
- `24px` (`gap-6`, `p-6`) — Section padding and major card spacing.
- `32px` (`gap-8`, `p-8`) — Hero banner and modal dialog breathing room.
- `48px` / `64px` — Page-level structural separation.

### 3.2 Fitts's Law & Touch Target Minimums
- **NON-NEGOTIABLE:** Every interactive element (`<button>`, `<a>`, `<input>`, `<select>`, clickable card) MUST have an effective tap target of **at least $44 \times 44\text{px}$** (WCAG 2.5.5 / 2.5.8).
- When visual design calls for a smaller icon (e.g. 18px), expand the bounding box with `min-h-[44px] min-w-[44px] flex items-center justify-center p-2.5` or an absolute touch target pseudo-element.

### 3.3 Zero Horizontal Overflow Constraint
- The application MUST render flawlessly down to **320px viewport width** (iPhone SE, narrow Android) without a single pixel of horizontal overflow.
- **Rule:** Never apply fixed widths exceeding 280px without `max-w-full`.
- **Rule:** All table containers MUST be wrapped in an overflow container: `<div className="w-full overflow-x-auto pb-2 scrollbar-thin">`.
- **Rule:** Long text and email addresses MUST include `break-all` or `truncate`.

---

## 4. Anti-Slop Art Direction & Component Patterns

### 4.1 Card Architecture (Tactile Depth vs. AI Flatness)
- **Forbidden:** Generic white rectangular boxes with faint grey borders and flat 3-card repeating grids.
- **Prescribed:**
  - **Dynamic Card Sizing:** Hero cards dominate 60-70% visual weight; secondary items appear as sleek data ribbons or hexagonal badges.
  - **Layered Micro-Shadows:** `shadow-[0_4px_20px_-4px_rgba(9,25,47,0.08),0_1px_4px_rgba(9,25,47,0.04)]`.
  - **Tactile Accent Badges:** Corner emblems (`FieldIcon`, `PlanetEmblem`, or `HexagonBadgeCard`) providing instant cognitive anchoring.

### 4.2 High-Fidelity Call-to-Action (CTA) Buttons
- **Primary CTA:**
  - Gradient fill: `bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 hover:from-blue-500 hover:to-indigo-700`.
  - Tactile border: `border border-blue-400/30`.
  - Shadow: `shadow-md shadow-blue-900/20 active:scale-[0.98] transition-all duration-150`.
  - Focus Ring: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2`.
- **Destructive Action:**
  - Explicit confirmation modal (never a single accidental click).
  - Clear red outline with high contrast text.

### 4.3 5-State UI Completeness Gate
Every asynchronous or data-driven surface MUST implement:
1. **Loading State:** Shimmer skeleton matching exact layout dimensions (Zero CLS).
2. **Empty State:** Distinct illustrated mascot artwork + clear educational message + primary action button.
3. **Ideal State:** Populated data with crisp typography and `tabular-nums`.
4. **Partial/Extreme State:** Tested with 1 item, 100 items, ultra-long strings (50+ characters), and 0-result filter queries.
5. **Error State:** Human-readable inline recovery banner with a "Retry" or "Refresh" button.

---

## 5. Vercel Web Design & Performance Standards

1. **Semantic HTML:**
   - Every page MUST have a single `<main>` element.
   - Use `<nav>` for navigation bars (`AdminSidebar`, `BottomNavBar`).
   - Use `<header>` and `<footer>` appropriately.
   - Buttons MUST use `<button type="button">`, not `<div onClick>`.
2. **Accessible Names (a11y):**
   - Every icon button MUST have an `aria-label` (e.g. `aria-label="Toggle Navigation"`).
   - Expandable menus MUST carry `aria-expanded` and `aria-controls`.
3. **Image Optimization:**
   - Explicit `width` and `height` on all `<img>` or `next/image` to guarantee `CLS = 0`.
   - Provide descriptive `alt` text for all informative images; use `alt=""` and `aria-hidden="true"` for decorative icons.
4. **React 19 & Next.js 15 Render Discipline:**
   - Selective Zustand subscriptions (never destructure the entire store in high-frequency leaf components).
   - Memoize heavy derived calculations (`useMemo`) to prevent needless re-renders.

---

## 6. Playwright Automated Verification Protocol

Before any code is committed or deployed:
1. Launch the local build server.
2. Execute automated multi-viewport crawler (`320px`, `390px`, `1440px`).
3. Assert:
   - `scrollWidth === innerWidth` on every page.
   - Console error count is `0`.
   - Unhandled network failures count is `0`.
   - All interactive controls have bounding box $\ge 44 \times 44\text{px}$.
