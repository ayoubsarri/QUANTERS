# QUANTERS — Deep UI/UX Design Audit, Visual Style System & v2.1 ERP Screen Specification

> **Source Reference Audited:** `media_1792463526639_810e0d13.jpg` (8-Screen UI Mockup)  
> **Official Brand Assets:** `logo_quanta.png` · `QUANTA-LOGO-ORIGINAL.pdf`  
> **Adapted To:** `QUANTERS_ERP_AND_STRUCTURE_PLAN_v2.1.md`  
> **Generated UI/UX Visual Boards in Workspace:**
> - [`quanters_v2_mobile_ui_8screens.jpg`](file:///c:/Users/hp/QUANTERS/quanters_v2_mobile_ui_8screens.jpg) — Core 8-Screen Mobile App UI (v2.1 Adapted)
> - [`quanters_v2_special_flows_4screens.jpg`](file:///c:/Users/hp/QUANTERS/quanters_v2_special_flows_4screens.jpg) — 4 Special v2.1 ERP Flows (7-Day Availability Grid, Live QR Scanner Sheet, Star of the Month & Top 10, Digital Quanter ID & Flexible Badge Verification)
> - [`quanters_v2_pc_hr_admin_dashboard.jpg`](file:///c:/Users/hp/QUANTERS/quanters_v2_pc_hr_admin_dashboard.jpg) — Matching PC HR & Admin ERP Desktop Dashboard

---

## 1. Executive Visual Audit of the 8-Screen Mockup

### 1.1 The Visual DNA That Makes This Mockup Work (Preserve 100%)
The uploaded 8-screen design succeeds because it balances **academic clarity** with **space-age scientific gamification** without becoming a cluttered dark-mode video game:

1. **Dual-Polarity Surface Architecture (80% Crisp Daylight / 20% Cosmic Dark):**
   - **Cosmic Deep-Space Dark (`#06182C` -> `#001B36`):** Reserved strictly for high-emotion threshold moments — **Screen 1 (Onboarding Splash)** and **Screen 8 (Achievement Unlocked Celebration)**.
   - **Ice-White & Soft Sky Daylight (`#F4F7FB` canvas + `#FFFFFF` cards + `#E5EFF9` containers):** Used across all daily utility screens (**Screens 2–7**). This keeps text effortless to read in bright university courtyards and amphitheatres.
2. **The Signature Royal-Cobalt Hero Banner:**
   - Used on **Home (Screen 2)**, **My Badges (Screen 4)**, and **Profile (Screen 7)**. A rich cobalt-to-royal gradient (`#02388E` -> `#0B4BB8`) with a glowing cyan progress bar (`#2ED1FC`) and a stylized cyan ringed-planet illustration anchored on the right.
3. **Color-Coded Micro-Pills for Instant Scanning:**
   - **Mint-Emerald Pills (`#D8F3E5` bg / `#15803D` text):** Exclusively represent **points/XP rewards** (`+150 XP`, `+30 XP`, `+50 XP`).
   - **Soft Sky Pills (`#D6ECFA` bg / `#1D63B8` text):** Represent **skill levels & scientific categories** (`Beginner`, `Intermediate`, `ASTRONOMY`, `TECHNOLOGY`).
4. **Tactile 3D Hexagonal Badge Vault:**
   - Unlocked badges use deep navy hexagonal cores (`#0A1E3C`) with luminous blue, gold, or cyan metallic borders, while locked badges use muted slate-gray hexagons (`#64748B` at 50% opacity) with a centered padlock icon.
5. **Friendly Scientific Mascot ("Quanta Bot"):**
   - The 3D rounded white-and-blue robot astronaut on the splash screen gives the club a warm, memorable scientific character (similar to Duolingo's Duo, but tailored to space and physics).

---

### 1.2 Forensic Audit of Flaws in the Image & How Each is Fixed for v2.1

An inspection of every pixel and icon across the 8 screens reveals **6 structural and visual inconsistencies** in the mockup image that must be corrected when adapting the design to `QUANTERS_ERP_AND_STRUCTURE_PLAN_v2.1.md`:

| # | Flaw Spotted in the Uploaded Image | Exact Location in Image | Smart Fix & v2.1 ERP Adaptation |
| :--- | :--- | :--- | :--- |
| **1** | **Bottom Navigation Bar is inconsistent across screens & Home is not centered** | **Screen 2, 4, 5:** `[Home, Workshops, Explore, Badges, Profile]`<br>**Screen 3:** Tab 1 is mislabeled `"Menu"`!<br>**Screen 7:** `"Explore"` icon changes from a Compass to a Magnifying Glass! | Lock a single, consistent **5-Tab Bottom Bar** across all screens with **Home in the Center (Tab 3)** per v2.1:<br>`[ 1. Workshops ] [ 2. Explore ] (( 3. HOME / QR )) [ 4. Badges ] [ 5. Profile ]`. |
| **2** | **Home Screen conflates a "Workshop" with a "Mission"** | **Screen 2 (Middle Card):** Labeled `"Next Mission"` (`Python for Scientists · Room B12`), while bottom card is `"Today's Missions"` (checklist). | Keep the exact two-card visual layout, but separate their ERP roles:<br>• **Middle Card -> `"Upcoming Activity / Live Check-In"`** (shows next registered workshop/event; button switches to **`Scan QR Check-In ->`** when session starts).<br>• **Bottom Card -> `"My Assigned Tasks"`** (shows real tasks assigned by the member's Department/Team Manager + deadlines & points). |
| **3** | **Home Screen 4 Quick-Action Tiles duplicate the Bottom Nav** | **Screen 2:** The 4 square tiles are `Workshops`, `Badges`, `News`, `Forms` — 3 of which are already on the bottom bar. | Preserve the exact 4-tile soft-blue icon row design, but assign high-utility ERP actions:<br>1. **`Scan QR`** (Check-in camera)<br>2. **`My Tasks`** (Assigned club tasks)<br>3. **`Propose`** (Dynamic Proposal Form)<br>4. **`Top 10`** (Monthly Star & Leaderboard sheet) |
| **4** | **Screen 6 ("Organize an Event") has mismatched left-gutter icons & static fields** | **Screen 6:** `Category` has a shield icon; `Description` has a house icon; only supports Events. | Fix field icons (`Type` = layers, `Title` = edit/spark, `Date` = calendar, `Location` = map-pin, `Description` = document-text) and upgrade Screen 6 into the **v2.1 Dynamic Proposal Screen** where the top selector switches fields for `Event`, `Workshop`, `Activity`, `Law Amendment`, `Collaboration`, or `Idea`. |
| **5** | **Missing Official QUANTA Emblem (`logo_quanta.png`)** | **Screen 1 & Screen 7:** Uses plain text `"QUANTERS BY QUANTA"` without the official 3-orbit quantum rings logo. | Place the official **QUANTA 3-Orbit Logo** (`logo_quanta.png`) above the title on Screen 1, inside the Home top bar/Digital ID card, and in the Desktop Admin sidebar. |
| **6** | **Missing v2.1 Member Governance Metadata** | **Screen 2 & Screen 7:** Shows `@quanter0248` and `Applied Physics`, but lacks **Member Status** (`Trainee` vs. `Active`) and **Department / Scientific Team**. | Add a crisp **Status Pill** (`🟢 Active Member` or `🔵 Trainee · Month 2/3`) and a **Placement Subtitle** (`Logistics Dept · AI & Comp. Modeling Team`) on Profile and Home. |

---

## 2. Exact Color Palette, Gradients & Surface Tokens

All hex values below are extracted directly from pixel sampling of the uploaded mockup (`media_1792463526639_810e0d13.jpg`) and harmonized with the official `logo_quanta.png`.

### 2.1 Official QUANTA Brand Logo Colors (`logo_quanta.png`)
| Token Name | Hex Code | RGB | Usage in UI |
| :--- | :--- | :--- | :--- |
| `--quanta-orbit-deep` | `#094C9C` | `rgb(9, 76, 156)` | Deepest orbital ring & `"Quanta"` wordmark primary fill |
| `--quanta-orbit-mid` | `#1A7EC2` | `rgb(26, 126, 194)` | Middle orbital ring & secondary brand gradients |
| `--quanta-orbit-cyan` | `#30C5F7` | `rgb(48, 197, 247)` | Bright cyan orbital ring, XP bar glow, planet rings |
| `--quanta-orbit-ice` | `#87D9F8` | `rgb(135, 217, 248)` | Highlight orbital arc & glass reflections |
| `--quanta-node-green` | `#80C342` | `rgb(128, 195, 66)` | Top-left quantum node; echoed in online status dots & success states |
| `--quanta-node-coral` | `#ED1C24` | `rgb(237, 28, 36)` | Bottom-left quantum node; echoed in notification bell dot & urgent tags |
| `--quanta-node-amber` | `#FBB03B` | `rgb(251, 176, 59)` | Right quantum node; echoed in gold badge borders & Star of the Month |

### 2.2 Light App Mode Surfaces (Screens 2–7 & PC Admin Dashboard)
| Token Name | Hex Code | Usage in Screens 2–7 |
| :--- | :--- | :--- |
| `--bg-app-canvas` | `#F4F7FB` | Primary screen background (cool ice-gray tint) |
| `--bg-card-elevated` | `#FFFFFF` | Standard workshop cards, explore news cards, form inputs, bottom nav |
| `--bg-card-sky-tint` | `#E5EFF9` | Tinted container cards (e.g., Home `"Upcoming Activity"` box, `"Today's Missions"` wrapper, Quick Action icon wells, Profile stat boxes) |
| `--bg-input-field` | `#F8FAFC` | Form input interior fill (Screen 6) with `#DCE8F5` border |
| `--border-subtle` | `#DCE8F5` | Hairline `1px` card & input borders |
| `--border-focus` | `#2367FA` | `1.5px` active input border & selected card outline |

### 2.3 Cosmic Dark Mode Surfaces (Screens 1 & 8)
| Token Name | Hex Code | Usage in Screens 1 & 8 |
| :--- | :--- | :--- |
| `--bg-cosmic-top` | `#06182C` | Top sky of Splash (Screen 1) & Achievement Modal (Screen 8) |
| `--bg-cosmic-mid` | `#092241` | Mid-screen nebula blue glow |
| `--bg-cosmic-bottom` | `#001B36` | Deep abyssal navy at bottom of dark screens |
| `--surface-cosmic-glass` | `rgba(14, 42, 82, 0.65)` | Translucent dark glass for secondary buttons (`"Share"` on Screen 8) with `1px solid rgba(48, 197, 247, 0.35)` |

### 2.4 Brand Gradients & Interactive Accents
| Element | Exact CSS / Token Specification | Where Used |
| :--- | :--- | :--- |
| **Hero Level / Summary Banner Gradient** | `linear-gradient(135deg, #02388E 0%, #0747A6 55%, #0D5BD9 100%)` | Screen 2 (`Lv. 7 Quantum Explorer`), Screen 4 (`My Badges` counter card), Screen 7 (Profile `Lv. 7` card) |
| **Primary CTA Royal Blue** | Solid `#2367FA` (Hover/Active: `#1B54D4`) or `linear-gradient(90deg, #1E62F5 0%, #2B7BFB 100%)` | `"Join Mission ->"`, `"Submit"` button, Active filter pill (`All`, `News`), Active bottom nav icon |
| **XP Progress Bar Fill** | `linear-gradient(90deg, #22B8F0 0%, #38E4AE 100%)` on `#123E85` track | Inside the `Lv. 7` banner (`820 / 1000 XP`) |
| **Celebration Cyan CTA** | `linear-gradient(90deg, #1CB5E0 0%, #29D2FF 100%)` | Screen 8 `"Awesome !"` primary button & glowing badge frame |
| **Mint-Emerald XP Pill** | Background: `#D8F3E5` · Text: `#15803D` · Border: `#BBF7D0` | `+150 XP`, `+120 XP`, `+200 XP`, `+30 XP` pills across Screens 2 & 3 |
| **Dark-Mode XP Pill** | Background: `rgba(29, 122, 252, 0.25)` · Border: `#30C5F7` · Text: `#38E4FF` | `+150 XP` glowing pill on Screen 8 |
| **Soft Sky Category Pill** | Background: `#D6ECFA` · Text: `#1D63B8` | `Beginner`, `Intermediate`, `ASTRONOMY`, `TECHNOLOGY`, `SCIENCE`, skill chips |
| **Online / Verified Dot** | Fill: `#22C55E` with `2px solid #FFFFFF` ring | Avatar status dot (Screens 2 & 7) & completed mission checkmarks |

### 2.5 Typography & Hierarchy System
The mockup uses a clean, geometric humanist sans-serif with high x-height and rounded numerals:
- **Primary Latin / French Font:** **`Plus Jakarta Sans`** or **`Inter`** (Weights: `400 Regular`, `500 Medium`, `600 SemiBold`, `700 Bold`, `800 ExtraBold`).
- **Primary Arabic Font (RTL support):** **`IBM Plex Sans Arabic`** or **`Cairo`** (matched optically in weight and line height).
- **Accent Script Font (Screen 1 Tagline only):** **`Caveat`** or **`Dancing Script`** (`600 SemiBold`, `#A5D8FF`) for *"More than a club, a scientific journey."*

| Text Role | Size / Line-Height | Weight | Color (Light Mode) | Example from Mockup |
| :--- | :--- | :--- | :--- | :--- |
| **Splash Display Stack** | `28px / 34px` (`1.75rem`) | `800 ExtraBold` (Tracking `+0.08em`) | `#FFFFFF` (`LEARN` in `#30C5F7`) | `DISCOVER` / `LEARN` / `PROVE` / `BELONG` |
| **Screen Title (H1)** | `22px / 28px` (`1.375rem`) | `700 Bold` | `#0F172A` | `Workshops`, `My Badges`, `Explore`, `Profile` |
| **Screen Subtitle** | `13px / 18px` (`0.8125rem`) | `400 Regular` | `#64748B` | *"Learn. Practice. Get certified."* |
| **Section Header (H2)** | `16px / 22px` (`1.0rem`) | `700 Bold` | `#0F172A` | `Today's Missions`, `Skills` |
| **Card Title (H3)** | `15px / 20px` (`0.9375rem`) | `700 Bold` | `#0F172A` (`#FFFFFF` on Hero) | `Python for Scientists`, `Lv. 7 Quantum Explorer` |
| **Metadata / Secondary** | `12px / 16px` (`0.75rem`) | `500 Medium` | `#64748B` | `Today, 14:00 · Room B12 · 24 seats left` |
| **Micro Pill / Badge Tag** | `11px / 14px` (`0.6875rem`) | `700 Bold` | `#15803D` (XP) / `#1D63B8` (Tag) | `+150 XP`, `Beginner`, `ASTRONOMY` |
| **Bottom Nav Label** | `10px / 12px` (`0.625rem`) | `600 SemiBold` | `#2367FA` (Active) / `#94A3B8` (Idle) | `Workshops`, `Explore`, `Home`, `Badges`, `Profile` |

### 2.6 Layout Geometry, Radii, Shadows & Spacing
- **Mobile Viewport Grid:** `390px × 844px` logical reference frame; `16px` horizontal screen padding (`20px` on wider phones); `12px` vertical gap between stacked cards.
- **Border Radius Scale:**
  - **Hero & Tinted Container Cards:** `20px` (`--radius-xl`)
  - **Standard List Cards (Workshops, Explore, Tasks):** `16px` (`--radius-lg`)
  - **Form Inputs & Quick-Action Icon Squares:** `14px` (`--radius-md`)
  - **Primary CTA Buttons & Filter Chips:** `9999px` full pill (Splash `"Let's Start ->"`, filter tabs, XP pills) or `14px` rounded rectangle (`"Join Mission ->"`, `"Submit"`).
- **Elevation & Shadows:**
  - **Standard Card Shadow:** `0 4px 14px -2px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(15, 23, 42, 0.03)` with `1px solid #E2E8F0`.
  - **Hero Cobalt Card Shadow:** `0 10px 25px -5px rgba(2, 56, 142, 0.35)`.
  - **Bottom Navigation Bar:** `height: 68px` (+ safe area inset), `#FFFFFF` background, top border `1px solid #E2E8F0`, shadow `0 -4px 16px rgba(15, 23, 42, 0.04)`.

---

## 3. Official QUANTA Brand & Unified Navigation Architecture

### 3.1 Integrating the Official `logo_quanta.png`
The official QUANTA emblem consists of **three intersecting quantum ellipses** in gradient blues (`#094C9C`, `#1A7EC2`, `#30C5F7`) with **three colored quantum particles** (`#80C342` green, `#ED1C24` red, `#FBB03B` orange/gold).
- **Where it appears:**
  1. **Screen 1 (Splash Header):** Placed at `44px × 44px` above `"QUANTERS BY QUANTA"`, with a subtle cyan outer glow so the dark blue rings pop against the `#06182C` space sky.
  2. **Screen 2 (Home Top Bar):** Subtle miniature emblem or brand badge next to official club announcements.
  3. **Screen 7 (Digital Quanter ID Card):** Watermarked in the background of the member's flip-side QR ID card alongside the University of Algiers 1 & Faculty of Sciences emblems.
  4. **PC Admin/HR Dashboard:** Top-left sidebar header (`logo_quanta.png` + `"QUANTERS ERP"`).

### 3.2 Standardized 5-Tab Bottom Navigation Bar (v2.1 Center-Home Layout)
To fix the mockup's navigation inconsistencies while keeping its exact clean white bar aesthetic:

```
┌─────────────────────────────────────────────────────────────────────────┐
│   [ 🎓 ]          [ 🧭 ]         (( 🏠 / 📷 ))       [ 🛡️ ]       [ 👤 ]   │
│  Workshops        Explore            HOME            Badges       Profile │
│  (#94A3B8)       (#94A3B8)     (Raised #2367FA)     (#94A3B8)    (#94A3B8)│
└─────────────────────────────────────────────────────────────────────────┘
```

- **Tab 1 — `Workshops` (Graduation Cap / Calendar-Star outline icon):** Workshops & Major Club Events (`All | Upcoming | Completed | Mine`).
- **Tab 2 — `Explore` (Compass outline icon — standardized across all screens):** 4-Category Feed (`Scientific News | Events News | QUANTA News | Opportunities`).
- **Tab 3 (CENTER ANCHOR) — `Home` (Raised `48px` circular or squircle Royal Blue `#2367FA` pill with white Home icon):**
  - *Smart Context Behaviour:* When the member is on another tab, tapping Center returns to **Home**. When the member is **already on Home** (or when a registered workshop/event is currently live within 15 minutes), a small glowing cyan QR badge appears on the button so a single tap opens the **Member QR Check-In Camera**.
- **Tab 4 — `Badges` (Hexagon-Shield / Award outline icon):** The 3-column hexagonal `My Badges` vault & flexible evaluation paths.
- **Tab 5 — `Profile` (User outline icon):** Digital Quanter ID, Status (`Trainee`/`Active`), Department & Scientific Team, XP/KPI stats, and Skills.

---

## 4. Screen-by-Screen Exact Design Instructions (Adapted to v2.1 ERP)

### Screen 1: Cosmic Splash, Invitation Gate & First-Time Onboarding
*(Adapted from Top-Left Screen in Mockup)*

- **Canvas & Illustration:**
  - Full-bleed vertical gradient (`#06182C` -> `#092241` -> `#001B36`).
  - Top cosmic sky with tiny glowing starlight dots (`#FFFFFF` at 30–80% opacity), a muted blue ringed planet in the upper-left, and a bright cyan-ringed planet in the upper-right.
  - **Centerpiece Mascot:** Friendly 3D white-and-blue **"Quanta Bot"** astronaut sitting on a rocky lunar crater ridge in the upper third of the screen, waving with glowing cyan eyes (`#30C5F7`).
- **Typography & Branding Stack (Center-Aligned below the lunar ridge):**
  - **Official Logo:** `logo_quanta.png` (`42px` height) centered above `"QUANTERS"` (`13px`, bold, tracking `0.2em`, `#FFFFFF`) and `"BY QUANTA"` (`10px`, `#30C5F7`).
  - **Vertical Action Pillar:**
    - `DISCOVER` (`28px`, ExtraBold, `#FFFFFF`)
    - `LEARN` (`28px`, ExtraBold, `#30C5F7` — highlighted in electric cyan)
    - `PROVE` (`28px`, ExtraBold, `#FFFFFF`)
    - `BELONG` (`28px`, ExtraBold, `#FFFFFF`)
  - **Script Quote:** *"More than a club, a scientific journey."* (`18px` italic handwritten script, `#A5D8FF`, `margin-top: 12px`).
- **CTA & Footer:**
  - **Primary Button:** Full-width pill (`height: 52px`, `border-radius: 9999px`, background `#FFFFFF`, text `#06182C` Bold `16px`): **`Let's Start  →`**.
  - **Footer Caption:** `"QUANTA SCIENTIFIC CLUB"` (`10px`, tracking `0.18em`, `#64748B`).
- **v2.1 ERP Onboarding Flow Connected to `"Let's Start →"`:**
  1. **Login / Invitation Token Recognition:** If opened via an HR invitation email link (`/join?token=...`), pre-fills the member's email and opens the **6-Step First-Time Profile Wizard** (using Screen 6's clean card-input style):
     - *Step 1:* Identity & Photo Upload (auto-cropped & compressed to `256×256 WebP <= 35KB` on device).
     - *Step 2:* Academic Info (Major, Academic Year `L1–Doctorate`, Tenure).
     - *Step 3:* Placement Confirmation (1 Primary Department + 1 Scientific Team).
     - *Step 4:* 7-Day Availability Grid (`Saturday–Friday` tap-to-toggle `Morning | Afternoon | Evening | Not Available` pills).
     - *Step 5:* Skills & Portfolio Links + Combined *"Previous Volunteering & Other Clubs"* box.
     - *Step 6:* Internal Law Charter Acceptance checkbox.
  2. **Alumni Portal Link (`/alumni?token=...`):** Uses the same cosmic welcome screen with a gold-accented badge `"QUANTA ALUMNI NETWORK"` and a 1-step lightweight sign-in (Name, Graduation Year, Current Role/Affiliation, Photo).
  3. **Registration Closed Guard:** If the Super Admin toggles `Registration Open = OFF`, tapping `"Let's Start →"` without an active account shows a clean translucent glass sheet: *"Registration for the current cycle is currently closed. Existing members may sign in below."*

---

### Screen 2: Personalized Home Hub (Center Tab 3)
*(Adapted from Top-Mid-Left Screen in Mockup)*

- **Top Header Bar (`padding: 16px`):**
  - **Left:** Circular member avatar (`44px × 44px`, `#E5EFF9` border) with a bottom-right `#22C55E` online dot.
  - **Center-Left Stack:**
    - Greeting: **`Good evening, Ayoub 👋`** (`16px` Bold `#0F172A`).
    - Subtitle + v2.1 Status Pill: **`🟢 Active Member · Logistics Dept`** (`12px` Medium `#64748B`, replacing static text or alternating with *"Keep exploring. Science needs you."*).
  - **Right:** Circular notification bell button (`40px × 40px`, `#FFFFFF` fill, `#DCE8F5` border) with a `#ED1C24` red unread dot.
- **Widget 1 — Hero Level & KPI Progress Card (`border-radius: 20px`, Cobalt Gradient `#02388E` -> `#0D5BD9`):**
  - **Left Column:**
    - Micro-label: `CURRENT LEVEL` (`10px` Bold, tracking `0.08em`, `#93C5FD`).
    - Title: **`Lv. 7 Quantum Explorer`** (`18px` ExtraBold `#FFFFFF`).
    - Progress Bar: `height: 8px`, rounded pill track (`#123E85`), glowing cyan fill (`#2ED1FC`) at 82%.
    - Counter: `820 / 1000 XP` (`11px` SemiBold `#E0F2FE`) + v2.1 addition: `· 92% Attendance`.
  - **Right Graphic:** Stylized cyan ringed planet (`64px × 64px`) with subtle starlight sparkles.
  - **v2.1 Monthly Star Banner (Collapsible Strip below or inside Hero Card during Day 1–7 of each month):** A warm gold-tinted glass strip (`#FEF3C7` bg / `#B45309` text): **`🌟 Member of the Month: Sara M. (Scientific Dept) — View Top 10 →`**.
- **Widget 2 — Upcoming Activity / Live Check-In Card (`border-radius: 18px`, Sky-Tinted Container `#E5EFF9`, `padding: 14px`):**
  - *(Fixes the mockup's "Next Mission" naming confusion while preserving 100% of its visual layout)*
  - **Top Row:** Left tag `UPCOMING WORKSHOP` (`11px` Bold `#64748B`) · Right Mint Pill **`+150 XP`** (`#D8F3E5` bg, `#15803D` text).
  - **Title:** **`Python for Scientists`** (`16px` Bold `#0F172A`).
  - **Metadata Row:** `🕒 Today, 14:00 · Room B12` (`12px` `#475569`).
  - **Primary Action Button:** Full-width Royal Blue button (`#2367FA`, `height: 40px`, `border-radius: 12px`, white bold text):
    - *Before session:* **`View Details & Pass →`**
    - *During live session window:* **`📷 Scan QR to Check In →`**
- **Widget 3 — 4 Quick-Action ERP Shortcut Tiles (`grid-template-columns: repeat(4, 1fr)`, `gap: 10px`):**
  - Each tile is a `64px` square card (`#E5EFF9` bg, `border-radius: 16px`) with a centered `#1D63B8` duotone icon and a `11px` Medium `#334155` label below:
    1. **`Scan QR`** (QR viewfinder icon — opens attendance camera)
    2. **`My Tasks`** (Checklist icon — jumps to assigned department/team tasks)
    3. **`Propose`** (Document-spark icon — opens Screen 6 Dynamic Proposal Form)
    4. **`Top 10`** (Trophy/Star icon — opens Monthly Star & Department Leaderboard sheet)
- **Widget 4 — `"My Assigned Tasks"` (Adapted from `"Today's Missions"` at bottom of Screen 2):**
  - **Header Row:** **`My Assigned Tasks`** (`15px` Bold `#0F172A`) on left · **`1/3`** (`13px` Bold `#2367FA`) on right.
  - **Task Rows (`background: #FFFFFF` inside `#E5EFF9` wrapper, `border-radius: 12px`, `padding: 10px 12px`, `margin-bottom: 8px`):**
    - *Completed Row:* Green circle check (`#22C55E`) · ~~`Prepare Room B12 projector setup`~~ (`13px` `#94A3B8` strikethrough) · Right Mint Pill **`+30 XP`**.
    - *Active Row 1 (Assigned by Dept Manager):* Hollow blue circle (`2px solid #93C5FD`) · `Submit post-workshop attendance sheet` (`13px` Medium `#1E293B`) · Subtitle `Due Thu 18:00 · Logistics` (`11px` `#64748B`) · Right Mint Pill **`+50 XP`**.
    - *Active Row 2:* Hollow blue circle · `Confirm workshop speaker feedback` · Right Mint Pill **`+20 XP`**.
    - *Interaction:* Tapping an active task opens a clean half-sheet where the member marks it **`In Progress`** or **`Done (Submit Link/Note)`** for their Manager/Co-Manager to score.

---

### Screen 3: Workshops & Events Hub (Tab 1)
*(Adapted from Top-Mid-Right Screen in Mockup)*

- **Top Header:**
  - Left: **`Workshops & Events`** (`22px` Bold `#0F172A`) + Subtitle *"Learn. Practice. Get certified."* (`13px` `#64748B`).
  - Right: Circular search icon button (`40px × 40px`, `#FFFFFF` bg, `#DCE8F5` border).
- **Segmented Filter Pills (`margin: 12px 0`):**
  - Horizontal pill bar: **`All`** (Active: `#2367FA` fill, `#FFFFFF` text) · **`Upcoming`** (`#E5EFF9` fill, `#475569` text) · **`Completed`** · **`Mine`** *(added per v2.1 so members immediately see their registered sessions)*.
- **Vertical Card Stack (`gap: 12px`):**
  - Each card (`#FFFFFF` bg, `border-radius: 16px`, `padding: 12px`, `1px solid #DCE8F5`) uses a **3-zone horizontal layout**:
    1. **Left Thumbnail (`68px × 68px`, `border-radius: 14px`):** Rich thematic illustration or photo (`Python` code laptop, `Arduino` circuit board, `3D Printing` nozzle, `Astronomy` telescope under starry sky).
    2. **Center Info Stack:**
       - **Title:** e.g., **`Python for Scientists`** (`15px` Bold `#0F172A`).
       - **Pill Row (`margin: 4px 0`):** Soft Sky Level/Type Chip (`Beginner` or `Intermediate` or `Major Event` in `#D6ECFA` bg / `#1D63B8` text) + Mint XP Pill (`+150 XP` in `#D8F3E5` bg / `#15803D` text).
       - **Schedule & Venue:** `📅 Today, 14:00   📍 Room B12` (`11.5px` `#64748B`).
       - **Capacity Indicator:** `🟢 24 seats left` (`11.5px` Medium `#16A34A`; turns amber `#D97706` when `< 5 seats left`, or `Waitlist Open` when full).
    3. **Right Action Button:** Soft sky circular icon button (`34px × 34px`, `#E5EFF9` bg, `#2367FA` right arrow `→`).
- **v2.1 Workshop Detail & Check-In Bottom Sheet (On Card Tap):**
  - Displays syllabus, instructor/team (`AI & Computational Modeling Team`), prerequisites, and a single primary CTA:
    - **`Register (1 Tap)`** -> switches to **`Registered · Scan QR at Venue`** during the session window -> unlocks **Certificate / Badge Evaluation** after verified attendance.

---

### Screen 4: My Badges & Skill Verification Vault (Tab 4)
*(Adapted from Top-Right Screen in Mockup)*

- **Top Header:**
  - Title: **`My Badges`** (`22px` Bold `#0F172A`).
  - Subtitle: *"Skills you prove. A journey you own."* (`13px` `#64748B`).
- **Summary Counter Banner (`border-radius: 20px`, Cobalt Gradient `#02388E` -> `#0D5BD9`, `padding: 16px`):**
  - **Left 3-Column Metrics (divided by subtle vertical hairlines `rgba(255,255,255,0.18)`):**
    - **`12`** (`22px` ExtraBold `#FFFFFF`) / `Unlocked` (`11px` `#93C5FD`)
    - **`28`** (`22px` ExtraBold `#FFFFFF`) / `Locked` (`11px` `#93C5FD`)
    - **`6`** (`22px` ExtraBold `#FFFFFF`) / `Categories` (`11px` `#93C5FD`)
  - **Right Graphic:** Cyan ringed planet emblem (`56px × 56px`).
- **Category Filter Pills:**
  - Horizontal scroll: **`All`** (Active `#2367FA`) · **`Science`** · **`Technology`** · **`Soft Skills`** · **`Leadership`** (`#E5EFF9` idle pills).
- **3-Column Hexagonal Badge Grid (`grid-template-columns: repeat(3, 1fr)`, `gap: 14px 10px`):**
  - Each grid cell (`background: #E5EFF9` soft container or floating hex card, `border-radius: 16px`, `padding: 12px 6px`, centered) contains:
    - **Hexagon Emblem (`64px × 72px`):**
      - *Unlocked Tier 1 (Tech/Science — e.g., `Python`, `Astronomy`, `Lab Work`):* Deep navy hex interior (`#0A1E3C`), bright royal/cyan double border (`#2563EB` / `#30C5F7`), luminous center vector icon.
      - *Unlocked Tier 2 (Community/Leadership — e.g., `Team Player`, `Event Org`, `Lab Safety`):* Deep navy hex interior with warm Gold/Amber (`#F59E0B`) or Purple (`#8B5CF6`) glowing border.
      - *Locked Badges (Row 4 — `Locked`):* Desaturated slate-gray hex (`#94A3B8` border, `#CBD5E1` interior at 50% opacity) with a centered gray padlock icon.
    - **Badge Label:** `11.5px` SemiBold `#1E293B` (`#94A3B8` when locked) below the hexagon.
- **v2.1 Flexible Badge Evaluation Sheet (When Tapping Any Badge):**
  - Shows the badge criteria configured by the Admin/Scientific Team and the member's path to unlock it:
    - **Path A — Online Quiz/Exam:** Timed multiple-choice/coding check inside the app.
    - **Path B — Practical Project Submission:** Input field for GitHub/Drive/PDF link for Instructor review.
    - **Path C — On-Site Jury / Oral Evaluation:** Verified directly by the Workshop Lead or HR on their dashboard.
    - **Path D — Automatic Milestone:** Auto-minted upon hitting attendance/task thresholds (triggers **Screen 8**).

---

### Screen 5: Explore — Scientific & Club Horizon (Tab 2)
*(Adapted from Bottom-Left Screen in Mockup)*

- **Top Header:**
  - Title: **`Explore`** (`22px` Bold `#0F172A`).
  - Subtitle: *"Discover the world of science."* (`13px` `#64748B`).
  - Right: Search icon button (`40px × 40px`).
- **v2.1 4-Category Filter Pills:**
  - Updated from the mockup's 3 pills to the exact 4 categories in `QUANTERS_ERP_AND_STRUCTURE_PLAN_v2.1.md`:
    1. **`Scientific News`** (Active `#2367FA` pill)
    2. **`Events News`**
    3. **`QUANTA News`** *(includes Member of the Month spotlights, internal law updates, club communiqués)*
    4. **`Opportunities`** *(scholarships, internships, national/international competitions, research calls)*
- **Editorial Feed Cards (`gap: 12px`):**
  - Each card (`#FFFFFF` bg, `border-radius: 16px`, `padding: 12px`, `1px solid #DCE8F5`) features:
    - **Left Square Thumbnail (`76px × 76px`, `border-radius: 12px`, `object-fit: cover`):** High-contrast astronomy, laboratory, AI chip, or university campus photography.
    - **Right Content Column:**
      - **Category Micro-Pill:** Soft Sky pill (`ASTRONOMY`, `QUANTA NEWS`, `OPPORTUNITY`, `BIOLOGY` in `#D6ECFA` bg / `#1D63B8` Bold `10px`).
      - **Headline:** 2-line clamp, `14.5px` Bold `#0F172A` (e.g., *"James Webb discovers new exoplanet atmosphere"*, *"National AI Hackathon — Open for Teams"*).
      - **Footer Meta:** `🕒 4 min read · 2h ago` (for News) or `⏳ Deadline: Nov 15 · Algiers` (for Opportunities) in `11.5px` `#64748B`, with a subtle right chevron `›`.

---

### Screen 6: Dynamic Proposals Engine (Adapted from "Organize an Event")
*(Adapted from Bottom-Mid-Left Screen in Mockup — Fixes Mismatched Icons & Expands to All 6 v2.1 Proposal Types)*

- **Navigation Context:** Opens as a clean **pushed full-screen modal** (no bottom nav bar, preventing accidental tab switches while typing) triggered from the **`Propose`** quick-action tile on Home or the `+` button in Workshops/Profile.
- **Top Header Area (Centered):**
  - Top-Left: Circular back button (`←`, `36px × 36px`, `#FFFFFF` bg).
  - Center Icon Badge: `52px × 52px` rounded square (`#D6ECFA` bg) with a `#1D63B8` clipboard-spark icon.
  - Title: **`Submit a Proposal`** (`20px` Bold `#0F172A` — dynamically updates to *"Organize an Event"*, *"Propose a Workshop"*, *"Amend Internal Law"*, etc.).
  - Subtitle: *"Turn your idea into an impact."* (`13px` `#64748B`).
- **v2.1 Dynamic Form Fields (`gap: 12px`, `padding: 0 16px`):**
  - Every input uses the mockup's clean white container (`#FFFFFF` bg, `border-radius: 14px`, `1px solid #DCE8F5`, `padding: 12px 14px`) with a `32px × 32px` soft-blue left icon well (`#E5EFF9` bg, `#2367FA` icon):
  1. **Field 1 — Proposal Type Selector (Dropdown Pill Card):**
     - Left Icon: `Layers / Category` icon.
     - Options: **`Organize an Event`** · **`Propose a Workshop`** · **`Club Activity`** · **`Internal Law Amendment`** · **`External Collaboration`** · **`General Idea`**.
  2. **Field 2 — Title Input:**
     - Left Icon: `Spark / Edit` icon · Label: `Title` · Placeholder: `"Enter proposal title..."`.
  3. **Conditional Middle Fields (Swap smoothly based on Field 1 selection):**
     - *If Event / Workshop / Activity:*
       - **Target Domain / Team (Dropdown):** Left Icon `Tag` · (`AI & Comp. Modeling`, `Astrophysics`, `Biotech`, `Robotics`, `General`).
       - **Proposed Date (Date Picker):** Left Icon `Calendar` · `"Select date..."`.
       - **Proposed Venue / Location:** Left Icon `Map Pin` · `"Room, Hall, or Online"`.
     - *If Internal Law Amendment:*
       - **Article Number:** Left Icon `Book/Scale` · `"e.g., Article 14 — Points System"`.
       - **Proposed Wording & Justification:** Left Icon `Document`.
     - *If External Collaboration:*
       - **Partner Organization / Club & Contact:** Left Icon `Handshake/Building`.
  4. **Field 5 — Description & Needs (Multiline Textarea, `min-height: 96px`):**
     - Left Icon: `Align-Left / Document` icon *(fixing the mockup's accidental house icon)* · Label: `Description & Resource Needs` · Placeholder: `"Describe your goals, target audience, and logistics needed..."`.
- **Sticky Bottom CTA:**
  - Full-width Royal Blue button (`#2367FA`, `height: 50px`, `border-radius: 14px`, shadow `0 8px 20px rgba(35, 103, 250, 0.28)`): **`Submit Proposal`** (`16px` Bold `#FFFFFF`).
  - *ERP Routing:* Submitting creates a record in `Submitted` state routed to the HR/Bureau Proposals Queue on the PC Dashboard, and shows the member a live status tracker (`Submitted` -> `Under Review` -> `Approved / Needs Edit`).

---

### Screen 7: Scientific Identity & Member Profile (Tab 5)
*(Adapted from Bottom-Mid-Right Screen in Mockup)*

- **Top Header Bar:**
  - Left: **`Profile`** (`22px` Bold `#0F172A`).
  - Right: Two circular icon buttons (`38px × 38px`, `#FFFFFF` bg): **`QR ID Card Flip`** icon (shows scannable Quanter ID) + **`Settings Gear`** icon (edit availability grid, skills, avatar).
- **Centered Identity Block (`margin-top: 8px`):**
  - **Avatar (`88px × 88px` circle):** Crisp white `3px` border, subtle shadow, with `#22C55E` green active dot at bottom-right.
  - **Full Name:** **`Ayoub Sarri`** (`20px` ExtraBold `#0F172A`).
  - **Quanter ID & Status Row:** **`@quanter0248`** (`13px` SemiBold `#2367FA`) + **v2.1 Official Status Chip:** **`🟢 Active Member`** (`#D8F3E5` bg / `#15803D` text; or **`🔵 Trainee · 68 days`** in `#D6ECFA` bg / `#1D63B8` text).
  - **Academic & Club Placement:**
    - Line 1 (University): `Applied Physics · L3 · University of Algiers 1` (`12.5px` Medium `#475569`).
    - Line 2 (v2.1 Club Placement Pill): **`🏛️ Logistics Dept  ·  🔬 Astrophysics Team`** (`12px` SemiBold `#1D63B8` inside a `#E5EFF9` pill).
  - **Bio Quote:** *"Passionate about quantum mechanics & coding."* (`12.5px` Italic `#64748B`).
- **Level & KPI Progress Banner (`border-radius: 18px`, Cobalt Gradient `#02388E` -> `#0D5BD9`, `padding: 14px`):**
  - Matches Screen 2's hero card (`Lv. 7 Quantum Explorer`, `820 / 1000 XP` cyan progress bar, planet emblem on right).
- **3-Column Impact Stat Boxes (`grid-template-columns: repeat(3, 1fr)`, `gap: 10px`, `margin: 12px 0`):**
  - Three `#E5EFF9` sky-tinted cards (`border-radius: 14px`, `padding: 12px 8px`, centered):
    - **`12`** (`18px` ExtraBold `#0F172A`) / `Badges` (`11.5px` `#64748B`)
    - **`18`** (`18px` ExtraBold `#0F172A`) / `Workshops` (`11.5px` `#64748B`)
    - **`5`** (`18px` ExtraBold `#0F172A`) / `Events` (`11.5px` `#64748B`)
- **Verified & Self-Declared Skills Cloud:**
  - Section Header: **`Skills`** (`15px` Bold `#0F172A`).
  - Wrap-row of Soft Sky pills (`#D6ECFA` bg, `#1D63B8` SemiBold `12px`, `border-radius: 9999px`, `padding: 6px 12px`):
    `Python` · `Astronomy` · `Data Analysis` · `Lab Research` · `Public Speaking` · plus an interactive dashed/tinted **`+ Add`** button (`#E5EFF9` bg, `#2367FA` text).

---

### Screen 8: Celebratory Overlay Modals (Achievement Unlocked & Star of the Month)
*(Adapted from Bottom-Right Screen in Mockup)*

- **Canvas & Atmosphere:**
  - Full-screen dark cosmic overlay (`linear-gradient(180deg, #06182C 0%, #092241 50%, #001B36 100%)`).
  - Top-Right: Translucent circular close button (`✕`, `36px × 36px`, `rgba(255,255,255,0.12)`).
  - Background particle burst: Gold (`#FBB03B`), Cyan (`#30C5F7`), Coral (`#ED1C24`), and Green (`#80C342`) confetti ribbons and starlight sparkles (matching the 4 accent colors of `logo_quanta.png`!).
- **Centerpiece Celebration Stack:**
  - **Header:** **`Achievement Unlocked!`** (`24px` ExtraBold `#FFFFFF`, subtle cyan text-shadow).
  - **Giant 3D Hexagon Emblem (`168px × 188px`):**
    - Outer glowing neon-cyan hexagonal frame (`#29D2FF`, `box-shadow: 0 0 35px rgba(41, 210, 255, 0.55)`).
    - Inner deep-space navy core (`#071936`) with a high-detail 3D Python/Quantum emblem and a subtle ribbon banner across the bottom of the hex.
  - **Title:** **`Python Explorer`** (`22px` ExtraBold `#FFFFFF`).
  - **Description:** *"You completed the 'Python for Scientists' workshop and passed the challenge!"* (`14px` Regular `#CBD5E1`, max-width `280px`, centered).
  - **Glowing XP Reward Pill:** Rounded pill (`padding: 8px 24px`, `background: rgba(26, 126, 194, 0.3)`, `border: 1.5px solid #30C5F7`, `box-shadow: 0 0 16px rgba(48, 197, 247, 0.4)`): **`+150 XP`** (`18px` ExtraBold `#38E4FF`).
- **Dual Bottom Action Buttons (`padding: 0 20px 28px`, `gap: 12px`):**
  - **Left Secondary Button (`flex: 1`, `height: 48px`, `border-radius: 9999px`):** Dark translucent glass (`rgba(255,255,255,0.08)`, `border: 1px solid rgba(147, 197, 253, 0.35)`), share icon + **`Share`** (`15px` SemiBold `#FFFFFF`).
  - **Right Primary Button (`flex: 1.2`, `height: 48px`, `border-radius: 9999px`):** Luminous cyan-blue gradient (`linear-gradient(90deg, #1E90FF 0%, #29D2FF 100%)`, `box-shadow: 0 6px 20px rgba(41, 210, 255, 0.45)`): **`Awesome !`** (`15px` Bold `#FFFFFF`).
- **v2.1 Reuse of Screen 8's Template:**
  - This exact cosmic modal template powers **3 milestone moments** in v2.1:
    1. **Badge / Workshop Unlocked** (Cyan glow `#29D2FF`).
    2. **3-Month Promotion from `Trainee` -> `Active Official Member`** (Emerald-Cyan glow `#38E4AE`).
    3. **Monthly `"Member of the Month"` & `"Top 10"` Announcement** (Gold-Amber glow `#FBB03B` using the gold quantum node color from `logo_quanta.png`).

---

## 5. Additional v2.1 ERP Flows Styled in the Exact Same Design Language

### 5.1 Member-Initiated QR Check-In Sheet (Triggered from Center Home/Scan Button)
- Opens as an `85%` height rounded bottom sheet (`border-top-radius: 24px`) using **Cosmic Dark `#06182C`** so the camera viewfinder feels immersive:
  - Top handle pill + Title: **`Scan Session QR Code`** (`18px` Bold `#FFFFFF`) + Subtitle *"Point your camera at the projector or room code."*
  - Center `240px × 240px` rounded square camera cutout (`border-radius: 24px`) with animated glowing cyan corner brackets (`#30C5F7`).
  - Below viewfinder: Live session chip (`🟢 Python for Scientists · Room B12`).
  - Upon scan: Plays haptic chime and transitions immediately into a compact **Screen 8 Celebration state** (`✅ Attendance Verified! +150 XP`).

### 5.2 PC Admin & HR Dashboard Style Translation (Desktop Web)
To ensure the **PC HR/Admin Dashboard** feels like the exact sibling of the mobile app while remaining effortless for table and workflow management:
- **Canvas & Sidebar:**
  - **Left Navigation Sidebar (`250px` fixed width):** Deep Cosmic Navy (`#06182C` -> `#092241`) featuring `logo_quanta.png` at the top, active nav items highlighted in Royal Blue (`#2367FA`) with a left cyan accent bar (`#30C5F7`).
  - **Main Workspace Canvas:** Crisp Ice-Gray (`#F4F7FB`) with pure white cards (`#FFFFFF`, `border-radius: 16px`, `1px solid #DCE8F5`).
- **Top KPI Summary Row:** Uses the exact **Hero Cobalt Gradient (`#02388E` -> `#0D5BD9`)** for the primary club pulse card (Active Members, Monthly Attendance %, Pending Proposals) alongside 3 white metric cards with Mint-Emerald (`#D8F3E5`) and Soft Sky (`#D6ECFA`) trend pills.
- **Availability Explorer & Task Matrix:**
  - The `Saturday–Friday` availability heatmap uses the exact same Soft Sky (`#D6ECFA`) to Royal Blue (`#2367FA`) color ramp.
  - Member status chips use the exact same pills: `Trainee` (`#D6ECFA` / `#1D63B8`), `Active` (`#D8F3E5` / `#15803D`), `Suspended` (`#FEE2E2` / `#DC2626`), and `Star of the Month` (`#FEF3C7` / `#B45309`).
