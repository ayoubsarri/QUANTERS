# QUANTERS Enterprise System Architecture & Behavioral Blueprint
## High-Performance Mobile Ecosystem & Admin Operations Platform for QUANTA Scientific Club
**Faculty of Sciences, University of Algiers 1 Benyoucef Benkhedda (جامعة الجزائر 1 – بن يوسف بن خدة • كلية العلوم)**  
**Institutional Entity:** QUANTA Scientific Club (النادي العلمي كوانتا)  
**Motto:** «المستقبل لنا • THE FUTURE IS OURS»  
**Document Class:** System Architecture & Technical Master Reference  

---

## 1. System Vision & Core Value Proposition

The **QUANTERS** mobile ecosystem is engineered to transform scientific club membership into an accredited, gamified, and frictionless personal scientific journey. Grounded in the empirical realities of STEM students at the Faculty of Sciences, QUANTERS replaces unorganized messaging channels, paper attendance rosters, and ephemeral participation with an enterprise-grade platform.

```
                           ┌───────────────────────────────┐
                           │   QUANTERS MOBILE ECOSYSTEM   │
                           └───────────────┬───────────────┘
                                           │
         ┌───────────────────┬─────────────┴─────────────┬───────────────────┐
         │                   │                           │                   │
┌────────┴────────┐ ┌────────┴────────┐         ┌────────┴────────┐ ┌────────┴────────┐
│ 5-TAB LIGHT     │ │ CIVIC           │         │ ENTERPRISE      │ │ VERIFIED W3C    │
│ STRUCTURAL UX   │ │ GAMIFICATION    │         │ BPMN 2.0 ERP    │ │ OPEN BADGES     │
├─────────────────┤ ├─────────────────┤         ├─────────────────┤ ├─────────────────┤
│• Center Tab Home│ │• Duolingo Loop  │         │• Multi-Amphi Sched│• Track A / B    │
│• 2-Depth Cap    │ │• Streaks & Freeze│        │• AMPB Matching  │ │• AST Anti-Cheat │
│• Thumb Ergonomics│ • MotM S_MoM Eq. │         │• Projector Mode │ │• Ed25519 Sign   │
│• Member Scan QR │ │• 52-Wk Heatmap  │         │• Deanship Ledger│ │• Skill Portfolio│
└─────────────────┘ └─────────────────┘         └─────────────────┘ └─────────────────┘
```

---

## 2. Structural UI/UX Architecture & Mobile Information Hierarchy

### 2.1. The 5-Tab Center-Anchor Spine (Cognitive Load Minimization)

To keep the application light, easy, and intuitive for university students navigating campus between lectures and laboratories, the interface is anchored around exactly **5 bottom tabs**, with **Home positioned at Tab 3 (Center Anchor)**:

```
┌────────────────────────────────────────────────────────────────────────┐
│             QUANTERS 5-TAB MOBILE NAVIGATION SPINE (MODEL B)           │
├───────────────┬───────────────┬────────────────┬───────────────┬───────┤
│    Tab 1      │     Tab 2     │     Tab 3      │     Tab 4     │ Tab 5 │
│   الأنشطة     │     آفاق      │    الرئيسية    │ المهام/عمليات │ هويتي │
│  (Activities) │   (Explore)   │  (Home Hub)    │   (Missions)  │(Profile)│
├───────────────┴───────────────┼────────────────┼───────────────┴───────┤
│      DISCOVERY WING           │ CENTER ANCHOR  │   EXECUTION & ID WING │
└───────────────────────────────┴────────────────┴───────────────────────┘
```

| Tab Position | Identifier & Title | Domain Responsibility | Primary Screen Contents |
| :--- | :--- | :--- | :--- |
| **Tab 1** | **الأنشطة / Activities** | Learning & Events Engine | Filterable calendar of scientific workshops, symposiums, hackathons, and personal schedule with capacity progress bars. |
| **Tab 2** | **آفاق / Explore** | Scientific Horizon Radar | Curated 3-minute research digests, national student competitions, laboratory research internships, and peer networking. |
| **Tab 3** | **الرئيسية / Home (Center Anchor)** | Personal Command Hub | Daily agenda, Member of the Month spotlight banner, prominent **«مسح رمز الحضور» (Scan Attendance)** button, active mission preview, daily streak counter (`🔥`). |
| **Tab 4** | **المهام والعمليات / Missions** | Institutional Operations Engine | Open operational calls categorized by cell (Logistics, Media, Tech, HR, Scientific Divisions), active task boards with Proof-of-Work uploads. |
| **Tab 5** | **هويتي / Profile** | Quanter Identity & Portfolio | Virtual Membership ID Card (interactive 3D flip with encrypted dynamic QR), verified skill badge showcase, 52-week contribution heatmap, and 1-tap CV portfolio export. |

### 2.2. Navigation Rules & Screen States
* **Strict 2-Level Depth Cap:** No user flow exceeds two navigation pushes from the tab root (`Root Tab -> Detail View -> Modal/Sheet Action`).
* **Persistent Dynamic Header:** Includes contextual section title, active streak flame (`🔥 12d`), instant Quanter ID launcher (`💳 ID`), and categorized notification bell (`🔔 [3]`).
* **Consistent 4-State Lifecycle:** Every view strictly implements `Skeleton Loading`, `Empty State with Action`, `Active Content`, and `Offline Graceful Fallback`.

---

## 3. Civic Gamification & Behavioral Engine

### 3.1. Benchmarked Behavioral Loop (Duolingo, Strava, GitHub)

* **Duolingo Mechanics:**
  - Daily active streak loop (`🔥`) with 7-day retention cliff stabilization.
  - **Archimedes Shield:** Streak freeze mechanic consumable via earned Sparks or automatically granted during university exam periods.
  - Circadian Early-Bird and Night-Owl reward chests to encourage regular morning and evening engagement.
  - 30-member Dunbar-sized league cohorts with weekly promotion/relegation.
* **Strava Mechanics:**
  - Peer Kudos for mission deliverables and workshop participation.
  - Relative effort tracking and anti-burnout pacing.
* **GitHub Mechanics:**
  - 52-week contribution heatmap displaying attendance, mission hours, and badge milestones.
  - 1-tap verifiable portfolio export for academic and career opportunities.

### 3.2. Polynomial XP Progression Formula
Member levels (1 through 30) scale along a convex polynomial trajectory:
$$XP_{\text{req}}(L) = 120 \cdot L^{2.2} + 80 \cdot L$$

Five scientific ranks structure the student's multi-year progression:
* **Rank I: Novice Quanter (كوانتر مبتدئ — Lvl 1–5 | 0–1,250 XP):** Foundational workshops, peer onboarding, buddy matching.
* **Rank II: Scientific Apprentice (ممارس علمي — Lvl 6–12 | 1,251–6,800 XP):** Laboratory sessions, micro-missions, operational shadowing.
* **Rank III: Research Fellow (زميل باحث — Lvl 13–20 | 6,801–18,500 XP):** Research visits, workshop proposals (CFW), buddy mentoring.
* **Rank IV: Lead Innovator (مبتكر ريادي — Lvl 21–27 | 18,501–38,000 XP):** Mission dispatching, Track A peer grading, inter-club coordination.
* **Rank V: Quanta Laureate (لوريات كوانتا — Lvl 28–30 | 38,001–50,000+ XP):** Lifetime honorary status, Deanship advisory seat, hall-of-fame induction.

### 3.3. Member of the Month (عضو الشهر) Algorithm ($S_{\text{MoM}}$)
Evaluated on the final day of each calendar month across 5 weighted dimensions:
$$S_{\text{MoM}}(u) = 0.25 \cdot \widetilde{Z}(\text{XP}_{\text{mo}}(u)) + 0.35 \cdot \mathcal{R}_{\text{task}}(u) + 0.25 \cdot \mathcal{A}_{\text{att}}(u) + 0.15 \cdot \mathcal{K}_{\text{kudos}}(u) - \mathbf{\Phi}_{\text{cooldown}}(u)$$
* **50% Recency Dampener ($\mathbf{\Phi}_{\text{cooldown}}$):** Prevents senior members from dominating consecutive months.
* **Dual Recognition Brackets:** Global Club MVP (عضو الشهر العام) and Rising Star (النجم الصاعد) for first/second-year students.

### 3.4. Academic Preservation & Anti-Burnout Gates
* **Diurnal XP Caps:** Maximum **350 XP per day** on weekdays (Sunday–Thursday); **600 XP** on Saturdays to prevent academic neglect.
* **Academic Quiet Hours:** Push notifications are strictly muted between **23:00 and 07:30**.
* **Automated 14-Day Exam-Mode Freeze:** Streaks, countdowns, and league standings pause during semester examination windows.

---

## 4. Member-Initiated QR Attendance Check-In

* **The Inversion:** The presenter displays a dynamic rolling TOTP QR code on the amphitheatre projector screen; **attendees scan from their seats simultaneously in under 45 seconds**.
* **15-Second Dynamic Seed:** Generated via `HMAC-SHA256(SessionSecret, floor(timestamp / 15))`. Any photograph sent via chat apps expires before arrival.
* **On-Device Campus Geofencing:** Verifies physical presence within the Faculty of Sciences boundary ($\Delta d \le 50\text{m}$, `mock_location == false`).
* **Dual-Window Gate:** Requires check-in during the opening 10 minutes and closing 10 minutes of a session.

---

## 5. Enterprise ERP & Admin Management Platform (QAMP)

### 5.1. Core Administrative Modules
1. **Workshops & Activities Manager:** Multi-session scheduling with PostgreSQL `btree_gist` temporal double-booking prevention.
2. **Amphi Projector Mode (`/admin/projector/[sessionId]`):** High-contrast full-screen view with 15s rotating dynamic TOTP QR code, live WebSockets attendee counter, canvas particle explosion, and Web Audio API synthesizer chime.
3. **Missions & Operations Dispatcher:** Posts operational tasks. The **AMPB matchmaker** pairs volunteers using Student KYC 5x9 timetable heatmaps:
   $$\mathcal{S}(u, m) = 0.30 \mathcal{A}_{\text{skill}} + 0.25 \mathcal{C}_{\text{cell}} + 0.20 \mathcal{L}_{\text{rel}} + 0.15 \sigma_{\text{KYC}} + \mathbf{\Omega}_{\text{buddy}} - \mathbf{\Phi}_{\text{load}}$$
4. **Member KYC 5x9 Heatmap Explorer:** Visualizes free-student density across Sunday–Thursday (08:00–22:00) with 1-click zero-conflict task dispatch.
5. **Gamification & MotM Arbitration Desk:** Computes $S_{\text{MoM}}$, facilitates blind board balloting, and generates branded social banners in 1 click.
6. **Skill Badges & Verification Desk:** Track A project reviews (4-axis rubric + AST code plagiarism detection) and Track B proctored exams. Issues W3C Open Badges v3.0 signed with Ed25519 institutional keys.
7. **Club Analytics & Annual Moral Report (التقرير الأدبي) Compiler:** Real-time cohort retention curves and 1-click bilingual official report synthesis.

---

## 6. Institutional Governance & Student Privacy

1. **Club Internal Charter & Operational Honor Code:**
   - Formal digital honor code accepted by every member.
   - Immutable audit trail of operational contribution hours, exportable as an official Dean-certified extra-curricular transcript for Master's applications, scholarships, and career portfolios.
   - Non-monetary, academic motivation driven by skill badges, peer recognition, and institutional impact.
2. **Personal Data Protection & Privacy Safeguards:**
   - University matricules stored as salted `HMAC-SHA256` hashes; displays masked IDs only (`2022****089`).
   - Edge GPS evaluation: Raw GPS coordinates are never transmitted or stored on central servers; only the boolean validation result `isWithinCampus == true` is recorded.
   - Local database hosted within institutional infrastructure with strict zero-knowledge privacy gates.
