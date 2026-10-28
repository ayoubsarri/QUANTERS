# QUANTERS 🚀
### Enterprise Resource Planning & Civic Operations Management Operating System
**QUANTA Scientific Club** · *Faculty of Sciences, University of Algiers 1 (Benyoucef Benkhedda)*

<div align="center">

![QUANTERS Cosmic Observatory Hero](public/brand/admin_overview_banner_bg.webp)

[![Production Live](https://img.shields.io/badge/Production-Live%20v4.4-00E5FF?style=for-the-badge&logo=googlecloud&logoColor=black)](https://quanters.web.app)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.28%20App%20Router-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Google_Cloud-Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Security Benchmark](https://img.shields.io/badge/Security-Level--4%20Forensic%20Hardened-emerald?style=for-the-badge&logo=shield&logoColor=white)](docs/screenshots/admin-settings.png)
[![License](https://img.shields.io/badge/License-Proprietary%20%2F%20Internal-red?style=for-the-badge)](LICENSE)

[**Live Web Application**](https://quanters.web.app) · [**ERP Architecture Graph**](#-erp-system-architecture-graph) · [**RBAC Capability Matrix**](#-role-based-access-control-rbac-capability-matrix) · [**Core Capabilities**](#-core-erp-capabilities) · [**Deployment**](#-deployment--setup)

</div>

---

## 📌 Executive Overview

**QUANTERS** is an enterprise-grade Civic Operations and Resource Planning (ERP) platform custom-architected for **QUANTA Scientific Club** at the Faculty of Sciences, University of Algiers 1.

Engineered to operate reliably under variable mobile network bandwidths and rigorous academic schedules, QUANTERS unifies the governance, talent lifecycle, event operations, academic scheduling, and financial/points accounting of a 500+ member scientific organization across two specialized interfaces:

1. **The Executive ERP Command Center (`/admin/**`)**: A desktop-optimized, high-density operations suite empowering the Executive Bureau, HR Directorate, and Department Heads to coordinate member pipelines, resolve academic schedule overlaps through an availability heatmap, validate deliverables, audit append-only ledgers, and execute constitutional amendments requiring formal quorums.
2. **The Mobile Member Progressive Web App (`src/app/(mobile)/**`)**: A resilient, offline-first smartphone client enabling club members to access live workshop schedules, verify attendance via dynamic QR and 6-digit session tokens, sit for timed STEM certification exams, submit project deliverables, and track their civic rank progression.

---

## 📸 Platform Interface Gallery

### Executive ERP Command Center
The administrative cockpit provides live situational awareness across all club divisions. It integrates operational telemetry, points solvency monitors, active workshop registration loads, and the proprietary **7-Day Member Availability Heatmap**.

<div align="center">
  <img src="docs/screenshots/admin-overview.png" alt="Executive ERP Command Center" width="95%" style="border-radius: 12px; box-shadow: 0 12px 40px rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.1);" />
</div>

<br/>

### 7-Day Academic Member Availability Heatmap
Aggregates hourly university course schedules across five faculty departments to pinpoint optimal masterclass and hackathon windows with zero timetable collisions.

<div align="center">
  <img src="docs/screenshots/admin-heatmap.png" alt="7-Day Availability Heatmap" width="95%" style="border-radius: 12px; box-shadow: 0 12px 40px rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.1);" />
</div>

<br/>

### Member Administration & Probation Machine (`/admin/members`)
Enforces the mandatory 30-day Trainee probation lifecycle, performance evaluations, disciplinary status freezes, and alumni archival with an immutable audit log.

<div align="center">
  <img src="docs/screenshots/admin-members.png" alt="Member Administration Directory" width="95%" style="border-radius: 12px; box-shadow: 0 12px 40px rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.1);" />
</div>

<br/>

### STEM Badges & Certification Exams (`/admin/badges`)
Skill taxonomy management supporting five certification tracks (Python Core, Applied Data Science, Web Development, Embedded Systems, and Scientific Journalism) with timed examinations and passing grade thresholds.

<div align="center">
  <img src="docs/screenshots/admin-badges.png" alt="STEM Certification Badges" width="95%" style="border-radius: 12px; box-shadow: 0 12px 40px rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.1);" />
</div>

<br/>

### Double-Entry Points Ledger & Appeals Tribunal (`/admin/points`)
Audit trail capturing every transaction across tasks, workshops, and exams, backed by transparent member appeals and administrative reversals.

<div align="center">
  <img src="docs/screenshots/admin-points-modal.png" alt="Points Ledger Adjustment Modal" width="95%" style="border-radius: 12px; box-shadow: 0 12px 40px rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.1);" />
</div>

<br/>

### Constitutional Governance & Internal Laws (`/admin/settings`)
Automates the enforcement of QUANTA's official Internal Law (*Règlement Intérieur*), featuring automated 2/3 executive board supermajority quorum requirements for amendments, quota saving profiles, and system telemetry controls.

<div align="center">
  <img src="docs/screenshots/admin-settings.png" alt="Governance and Internal Laws Console" width="95%" style="border-radius: 12px; box-shadow: 0 12px 40px rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.1);" />
</div>

<br/>

### Mobile Member Progressive Web App (`/home` & `/profile`)
Optimized for mobile touchscreens with offline-first persistence, native biometric/credential prompts, dynamic attendance QR scanning, and personalized academic portfolios.

<div align="center">
  <img src="docs/screenshots/mobile-home.png" alt="Mobile Member Home Feed" width="47%" style="border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.3); margin-right: 2%;" />
  <img src="docs/screenshots/mobile-profile.png" alt="Mobile Member Academic Profile" width="47%" style="border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.3);" />
</div>

---

## 🏛️ ERP System Architecture Graph

```mermaid
flowchart TD
    classDef client fill:#0B192C,stroke:#00E5FF,stroke-width:2px,color:#FFFFFF
    classDef core fill:#1E293B,stroke:#38BDF8,stroke-width:2px,color:#FFFFFF
    classDef sync fill:#0F172A,stroke:#10B981,stroke-width:2px,color:#FFFFFF
    classDef sec fill:#2D1B4E,stroke:#A855F7,stroke-width:2px,color:#FFFFFF
    classDef gcp fill:#1A2332,stroke:#F59E0B,stroke-width:2px,color:#FFFFFF

    subgraph PresentationTier["1. PRESENTATION TIER (DUAL-SURFACE UI)"]
        ADMIN["Executive ERP Command Center<br/>(/admin/** Desktop Viewport)"]:::client
        PWA["Member Progressive Web App<br/>(/(mobile)/** Mobile Viewport)"]:::client
        SW["Service Worker v5<br/>(CacheStorage / Stale-While-Revalidate)"]:::client
    end

    subgraph StateTier["2. DISTRIBUTED STATE & SYNC TIER"]
        STORE["Zustand In-Memory Store<br/>(Optimistic UI Mutations)"]:::sync
        LOCAL["Scrubbed Local Storage<br/>(Quota-Safe Persistence & TTL)"]:::sync
        TOMB["Tombstone Engine v3<br/>(14-Day Automated Purge)"]:::sync
        DELTA["Delta Versioning Engine<br/>(Collection-Level ETag Diffing)"]:::sync
    end

    subgraph ErpCoreTier["3. ERP SUBSYSTEMS & DOMAIN ENGINES"]
        HEATMAP["Academic Timetable Heatmap<br/>(70-Slot Conflict Matrix)"]:::core
        ROSTER["Talent Pipeline & Probation Engine<br/>(Trainee ➔ Active ➔ Alumni)"]:::core
        LEDGER["Double-Entry Points Accounting<br/>(Append-Only Ledger & Appeals)"]:::core
        GOVERNANCE["Bylaws & Voting Engine<br/>(2/3 Executive Supermajority Quorum)"]:::core
        DISPATCH["Task Matrix & Evaluation Engine<br/>(Rubric Scoring & Proof Audit)"]:::core
    end

    subgraph SecurityTier["4. DEFENSE-IN-DEPTH & ANTI-CHEAT TIER"]
        RULES["Cloud Firestore Security Rules<br/>(RBAC & Schema Validators)"]:::sec
        TIMING["Constant-Time Crypto Auth<br/>(crypto.timingSafeEqual)"]:::sec
        REDACT["Server-Side Redaction Engine<br/>(Answer Keys & Sensitive PII Stripped)"]:::sec
        LOCKOUT["Anti-Farming & Self-Scoring Guards<br/>(Task Assignee Lockouts)"]:::sec
    end

    subgraph CloudTier["5. GOOGLE CLOUD PLATFORM INFRASTRUCTURE"]
        FS_MAIN["Firestore Primary Document<br/>(/erp_state/main Active Window)"]:::gcp
        FS_SHARD["Firestore History Shard<br/>(/erp_state/history_shard Partition)"]:::gcp
        FS_COLLS["Firestore Subcollections<br/>(/members, /tasks, /workshops...)"]:::gcp
        AUTH["Firebase Identity & Authentication<br/>(PBKDF2 / OAuth 2.0 Google SSO)"]:::gcp
        CDN["Firebase Hosting Edge CDN<br/>(Brotli / HTTP/3 Global Edge)"]:::gcp
    end

    ADMIN --> STORE
    PWA --> STORE
    PWA -.-> SW
    SW -.-> CDN

    STORE <--> LOCAL
    STORE <--> TOMB
    STORE <--> DELTA

    STORE --> HEATMAP
    STORE --> ROSTER
    STORE --> LEDGER
    STORE --> GOVERNANCE
    STORE --> DISPATCH

    DELTA <--> RULES
    DELTA <--> TIMING
    DELTA <--> REDACT
    DISPATCH --> LOCKOUT

    RULES <--> FS_MAIN
    RULES <--> FS_SHARD
    RULES <--> FS_COLLS
    AUTH <--> PresentationTier
    CDN --> PresentationTier
```

---

## 🛡️ Role-Based Access Control (RBAC) Capability Matrix

QUANTERS implements a granular, role-based capability matrix across eleven organizational roles. All privileges are validated both in client route guards and server-side Cloud Firestore Security Rules:

| Organizational Role | App Access Scope | Member Management | Task Assignment & Scoring | Workshop Operations | Points Ledger Adjustments | Governance & Internal Laws | Exam & Badge Authoring | Audit Log Access |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Super Admin** | Full System (`/admin`, `/`, API) | Full (CRUD, Roles, Bans) | Full (Assign, Score, Override) | Full (Create, Edit, Archive) | Full (Manual Adjust, Reverse) | Full (Vote, Force Enact, Quorum) | Full (Create, Edit, Publish) | Full Immutable Access |
| **Executive** | Executive ERP (`/admin`, `/`) | Full (Promote, Freeze, Review) | Full (Assign, Score, Validate) | Full (Create, Check-in, Manage) | Propose & Approve Reversals | Supermajority Voting ($\lceil \frac{2N}{3} \rceil$) | Full Access | Full Access |
| **HR Head** | HR & Talent Suite (`/admin/members`) | Full Lifecycle (Trainee ➔ Active) | View & Assign HR Tasks | Create & Coordinate | Propose Adjustments | View Laws | Review Applicants | View Talent Logs |
| **Department Head** | Department Cockpit (`/admin/**`) | Department Members Only | Dept Tasks Only (Anti-Self-Score) | Dept Workshops Only | Propose Dept Points | View Laws | Author Dept Exams | View Dept Logs |
| **Co-Manager** | Operational Suite (`/admin/**`) | Review Trainees (Endorsement) | Assign & Review Deliverables | Session Coordination | View Ledger | View Laws | Assist Exams | View Operational Logs |
| **Scientific Team Leader** | Scientific Workspace (`/admin/tasks`) | Scientific Team Members | Scientific Tasks (Anti-Self-Score) | Scientific Sessions | View Ledger | View Laws | Author Team Badges | View Team Logs |
| **Member (Active)** | Member PWA (`/(mobile)/**`) | Self Profile KYC Only | Claim Tasks, Submit Deliverables | Register & Check-In (QR/Code) | View Own Ledger & Appeal | View Enacted Laws | Take Exams & Quizzes | Self History Only |
| **Trainee (Probationary)** | Member PWA (`/(mobile)/**`) | Self Profile KYC Only | Assigned Onboarding Tasks Only | Attend Registered Sessions | View Own Trainee XP | View Enacted Laws | Take Novice Quizzes | Self History Only |
| **Alumni** | Member PWA (Read-Only Archive) | Legacy Profile Only | Historical Archives Only | Observer Attendance | View Lifetime Ledger | View Enacted Laws | View Earned Badges | Self Archive Only |
| **KPI Viewer** | Read-Only Admin (`/admin/**`) | View Directory Only | View Matrix (No Mutation) | View Registrations | View Solvency Graphs | View Law Status | View Analytics | Read-Only Audit |
| **Editor** | Content Management (`/admin/**`) | Read-Only Directory | View Tasks | Edit Workshop Descriptions | View Ledger | View Laws | Edit Badge Text | Content Logs Only |

---

## 💼 Core ERP Capabilities

### 1. 7-Day Academic Availability Engine
Scheduling cross-disciplinary workshops in a university with five departments is notoriously challenging. QUANTERS resolves this through:
- **Ten Hourly Slots (08:00 to 18:00)**: Members configure recurring availability across Saturday through Thursday.
- **Cross-Department Indexing**: Schedules map across Computer Science, Mathematics, Physics, Chemistry, and Biology.
- **Overlap Prevention**: The engine flags timetable clashes with academic laboratory rotations and Friday prayer times.

### 2. Member Lifecycle State Machine
```mermaid
stateDiagram-v2
    [*] --> Trainee: Initial Registration & KYC
    Trainee --> Active: 30-Day Evaluation & Endorsement
    Active --> Paused: Disciplinary Review / Academic Freeze
    Paused --> Active: Executive Review & Re-Activation
    Active --> Alumni: Academic Graduation
    Active --> Resigned: Voluntary Resignation
    Active --> Removed: Executive Expulsion
    Trainee --> Removed: Failed Probation Review
    Alumni --> [*]
    Removed --> [*]
    Resigned --> [*]
```
- **Trainee**: 30-day probationary status requiring mentor assignment, profile completion, and two leadership endorsements.
- **Active**: Full voting rights, task claiming, workshop enrollment, and exam sitting.
- **Paused**: Temporary freeze during university exam seasons or disciplinary inquiries; XP accrual halted.
- **Alumni**: Preserves verified badges and lifetime accomplishments while vacating operational duties.

### 3. Double-Entry Points Accounting & Appeals Tribunal
- **Append-Only Ledger**: Every XP addition, task award, or attendance point writes to `ledger` with rule name, timestamp, and actor identity.
- **Reversal Adjudication**: Erroneous or disputed points cannot be deleted; they must be reversed via compensating ledger entries.
- **Member Appeals**: Members can submit formal appeals with justification notes directly from their mobile ledger view.

### 4. Constitutional Governance & Supermajority Quorums
- **Internal Law Amendments**: Modifying club bylaws requires an executive board supermajority vote:
  $$\text{Required Votes} = \left\lceil \frac{2 \times N_{\text{eligible}}}{3} \right\rceil$$
- **Cryptographic Ballot Record**: Votes are stamped in a verifiable record (`ProposalVote`), preventing duplicate votes, submitter conflict-of-interest votes, or unauthorized executive approvals.

---

## 🔒 Level-4 Forensic Cybersecurity & Anti-Cheat Controls

The platform implements defense-in-depth across every layer:

| Security Vector | Threat Vector | Applied Forensic Remediation | Code Location |
| :--- | :--- | :--- | :--- |
| **Bearer Authentication** | Timing side-channel attacks | Enforced `crypto.timingSafeEqual` with a minimum 16-character secret length floor. | [`src/app/api/erp/route.ts`](file:///c:/Users/hp/QUANTERS/src/app/api/erp/route.ts) |
| **API State Mutations** | Unauthorized script overwriting settings | Enforced strict privilege guards on `POST /api/erp`, rejecting unauthorized writes to sensitive collections. | [`src/app/api/erp/route.ts`](file:///c:/Users/hp/QUANTERS/src/app/api/erp/route.ts) |
| **Memory Exhaustion (DoS)** | Multi-megabyte request body floods | Validated `Content-Length` headers against a 2 MB ceiling before reading request streams. | [`src/app/api/erp/route.ts`](file:///c:/Users/hp/QUANTERS/src/app/api/erp/route.ts) |
| **Firestore Document Limit** | 1 MiB hard ceiling in Cloud Firestore | Implemented delta updates and partitioned older audit records into `/erp_state/history_shard`. | [`firestore.rules`](file:///c:/Users/hp/QUANTERS/firestore.rules) |
| **Workshop Seat Exhaustion** | Malicious users zeroing out workshop capacity | Added `!(uid in oldList)` check in `isSafeMemberIdListUpdate` to block duplicate registration entries. | [`firestore.rules`](file:///c:/Users/hp/QUANTERS/firestore.rules) |
| **Attendance Forgery** | Deleting existing attendance records during check-in | Required preservation of all existing records via `request.resource.data.attendanceRecords.hasAll(...)`. | [`firestore.rules`](file:///c:/Users/hp/QUANTERS/firestore.rules) |
| **Exam Answer Leakage** | Inspecting client payloads for exam answers | Server-side redaction strips `correctIndex` from exams and `correctId` from daily quizzes on all unprivileged endpoints. | [`src/lib/server/db.ts`](file:///c:/Users/hp/QUANTERS/src/lib/server/db.ts) |
| **Daily Quiz XP Farming** | Replay farming by clearing browser storage | Created `submitDailyQuizAnswer` with server-side ledger deduplication and reward caps. | [`src/lib/store/useQuantersStore.ts`](file:///c:/Users/hp/QUANTERS/src/lib/store/useQuantersStore.ts) |
| **Task Self-Scoring** | Assignees awarding themselves unearned points | Added strict self-validation lockouts (`currentMemberId !== memberId`) across all administrative roles. | [`src/lib/store/useQuantersStore.ts`](file:///c:/Users/hp/QUANTERS/src/lib/store/useQuantersStore.ts) |
| **Tombstone Storage Leak** | Unbounded growth in local storage deletion lists | Migrated to `quanters-tombstones-v3` with an automated 14-day Time-To-Live auto-purge. | [`src/lib/store/useQuantersStore.ts`](file:///c:/Users/hp/QUANTERS/src/lib/store/useQuantersStore.ts) |

---

## 🛠️ Technology Stack

```
QUANTERS Enterprise Technology Stack
├── Framework:            Next.js 15.5.28 (React 19, TypeScript 5.7, App Router)
├── Styling & Design:     Tailwind CSS 3.4.17, Lucide React Icons
├── Client State:         Zustand 5.0.2 (Optimistic UI & Custom Delta Synchronization)
├── Cloud Infrastructure: Google Cloud Platform / Firebase
│   ├── Database:         Cloud Firestore (Multi-Shard Partitioning)
│   ├── Authentication:   Firebase Auth (PBKDF2 & Google Identity OAuth 2.0)
│   └── Edge Hosting:     Firebase Hosting (Brotli Compression, Global CDN)
├── Offline & PWA:        Service Worker v5, Web App Manifest V3, CacheStorage API
└── Verification & E2E:   Playwright Test Suite, Python 3 Forensic Test Harness
```

---

## 🚀 Deployment & Setup

### Prerequisites
- **Node.js**: `v18.18.0` or higher (Node 20+ recommended)
- **Firebase CLI**: `npm install -g firebase-tools`

### 1. Clone & Install
```bash
git clone https://github.com/ayoubsarri/QUANTERS.git
cd QUANTERS
npm install
```

### 2. Configure Environment Variables
Create `.env.local` in the project root:
```env
# Administrative API Secret (Must be 16+ characters)
QUANTERS_ADMIN_SECRET=your_secure_admin_secret_token_here

# Firebase Web Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_web_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=quanters-d0312.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=quanters-d0312
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=quanters-d0312.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=815338551488
NEXT_PUBLIC_FIREBASE_APP_ID=1:815338551488:web:2494e9a885cfae6774d525
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-VX6YS3CHCX
```

### 3. Build & Typecheck
```bash
# Verify 100% clean TypeScript compilation (0 errors)
npx tsc --noEmit

# Compile production bundles (out/ for Firebase Hosting + .next/)
node scripts/build_firebase_out.mjs
```

### 4. Deploy to Firebase
```bash
# Authenticate CLI
firebase login

# Deploy Security Rules and Edge Hosting
firebase deploy --only firestore:rules,hosting
```

---

## 📂 Repository File Structure

```
QUANTERS
├── data/
│   └── quanters-db.json              # Server persistent fallback database
├── docs/
│   └── screenshots/                  # Verified high-resolution platform screenshots
├── public/
│   ├── brand/                        # Brand identity assets, logos, and WebP media
│   │   ├── admin_overview_banner_bg.webp # Handcrafted amigurumi mascot hero banner
│   │   ├── welcome_loop.mp4          # Optimized 1.6 MB looped branding video
│   │   └── QUANTERS_white_logo.svg   # Official club vector emblem
│   ├── icons/                        # PWA maskable icons
│   ├── manifest.json                 # Web App Manifest V3 specification
│   └── sw.js                         # Service Worker v5 with cache segregation
├── scripts/
│   └── build_firebase_out.mjs        # Production build pipeline (Static out/ + .next/)
├── src/
│   ├── app/
│   │   ├── (mobile)/                 # Member smartphone PWA routes
│   │   ├── admin/                    # Executive ERP Command Center routes
│   │   └── api/
│   │       └── erp/route.ts          # Server API with timing-safe auth & deltas
│   ├── components/
│   │   ├── admin/                    # Administrative dashboard components
│   │   ├── mobile/                   # Mobile shell and QR scanners
│   │   └── shared/                   # Field icons, logos, offline alerts
│   └── lib/
│       ├── data/                     # Seed data and constitutional laws
│       ├── firebase/                 # Firebase SDK client initialization & auth
│       ├── server/db.ts              # Server DB engine & answer redaction
│       ├── store/                    # Zustand store with optimistic synchronization
│       ├── types/erp.ts              # Comprehensive TypeScript type system
│       └── utils/                    # Cryptography, auth, and image compressors
├── firestore.rules                   # Cloud Firestore Security Rules
├── next.config.ts                    # Next.js configuration & CSP HTTP headers
├── tailwind.config.ts                # Tailwind design tokens & typography
├── LICENSE                           # Proprietary Club License
└── README.md                         # Platform Documentation
```

---

## 👥 Scientific Club Leadership & Credits

**QUANTA Scientific Club**  
*Faculty of Sciences, University of Algiers 1 (Benyoucef Benkhedda)*  
- **Official Inquiries**: `contact@quanta-club.dz` · `quantaclubdz@gmail.com`
- **Lead Architecture & Engineering**: Developed by the QUANTA Executive & IT Technical Committee.

---

## 📄 License & Governance

Copyright (c) 2026 **QUANTA Scientific Club**. Faculty of Sciences, University of Algiers 1. All Rights Reserved.  
This software platform, design assets, and administrative documentation are proprietary and confidential to QUANTA Scientific Club. Unauthorized copying, distribution, modification, or commercial use is strictly prohibited. See [LICENSE](LICENSE) for terms.
