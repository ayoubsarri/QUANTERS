# Algerian Phone Formatting, Visual Commute Cards & HR Approval Waiting Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement strict real-format Algerian phone validation, visual tactile campus commute time cards, and a creative mascot-powered "Waiting for HR Approval" admission gate controlled by the "Onboarding Admission Mode" setting in `/admin/settings`.

**Architecture:** 
- A dedicated phone utility (`phoneValidation.ts`) formats Algerian mobile numbers (`+213 (5|6|7)XX XX XX XX`), detects carriers (Mobilis, Djezzy, Ooredoo), and blocks fake dummy numbers.
- Step 2 in `/onboarding` is upgraded with visual cards for commute time and housing.
- `SystemSettings.onboardingAutoApprove` links to member admission status. When set to `HR Approval Required`, completing onboarding places accounts into `status: "Pending"` (`hrApproved: false`), guarded in `MobileAppShell.tsx` by a creative `WaitingForApprovalScreen` featuring the handcrafted amigurumi astronaut mascot generated via Nano Banana.
- Admins in `/admin/members` gain a dedicated "Pending Approval" filter and 1-click "Approve Admission" button.

**Tech Stack:** Next.js 15, React 19, TypeScript 5, Tailwind CSS, Zustand 5, Cloud Firestore, Nano Banana image generator.

---

### Task 1: Algerian Phone Number Live Formatter & Strict Validation
**Files:**
- Create: `src/lib/utils/phoneValidation.ts`
- Modify: `src/app/(mobile)/onboarding/page.tsx:180-230,615-635`

- [ ] **Step 1: Create `src/lib/utils/phoneValidation.ts`**
  - Implement `formatAlgerianPhone(input: string): string` to format as `+213 5XX XX XX XX`, `+213 6XX XX XX XX`, or `+213 7XX XX XX XX`.
  - Implement `validateAlgerianPhone(phone: string): { isValid: boolean; carrier?: "Mobilis" | "Djezzy" | "Ooredoo"; formatted: string; error?: string }`.
  - Block dummy / mock sequences (`00 00 00 00`, repeated digits `55555555`, `12345678`).

- [ ] **Step 2: Integrate into Step 1 of `src/app/(mobile)/onboarding/page.tsx`**
  - Add real-time carrier badge (Mobilis 💚, Djezzy 🔴, Ooredoo 🟡).
  - Add inline error message if phone is incomplete or invalid.
  - Guard the Step 1 "Continue" button so user cannot proceed with an invalid phone number.

---

### Task 2: Visual Tactile Campus Commute Time & Housing Cards
**Files:**
- Modify: `src/app/(mobile)/onboarding/page.tsx:685-740`

- [ ] **Step 1: Redesign Campus Commute Time into 3 rich interactive cards**
  - `< 30 min`: Icon `Zap`, title `< 30 min`, subtitle "Walking / Quick Metro", green accent badge "Nearby Campus".
  - `30–60 min`: Icon `Timer`, title `30–60 min`, subtitle "Transit / Tramway / Bus", cyan accent badge "Moderate Commute".
  - `> 1 hour`: Icon `Compass`, title `> 1 hour`, subtitle "Train / Inter-Wilaya Travel", amber accent badge "Extended Commute".
  - Active state: `#182C4E` gradient, cyan border ring, checkmark badge, tactile micro-animation.

- [ ] **Step 2: Upgrade Housing Type into matching interactive cards**
  - `Family Home` (Icon `Home`), `University Residence (Cité)` (Icon `Building2`), `Shared Apartment` (Icon `Building`).

---

### Task 3: Data Model & Store Actions for HR Approval Workflow
**Files:**
- Modify: `src/lib/types/erp.ts:290-305,340-380,855-865`
- Modify: `src/lib/store/useQuantersStore.ts:180-210,1360-1410,3450-3580`

- [ ] **Step 1: Update `OnboardingChecklist` and `Member` in `src/lib/types/erp.ts`**
  - Add `hrApproved?: boolean`, `hrApprovedAt?: string`, `hrApprovedBy?: string` to `OnboardingChecklist`.
  - Ensure `MemberStatus` includes `"Pending"` alongside `"Trainee"`, `"Active"`, `"Suspended"`, `"Removed"`, `"Alumni"`.

- [ ] **Step 2: Update `completeFirstTimeProfile` in `src/lib/store/useQuantersStore.ts`**
  - Read `state.settings.onboardingAutoApprove`.
  - If `false`, set `status: "Pending"` and `onboardingTicks.hrApproved = false`.
  - If `true`, set `status: "Trainee"` and `onboardingTicks.hrApproved = true`.

- [ ] **Step 3: Add `approveMemberAdmission` and `rejectMemberAdmission` store actions**
  - `approveMemberAdmission(memberId, notes)`: sets `status: "Trainee"`, `hrApproved: true`, logs audit entry, syncs with Firestore.
  - `rejectMemberAdmission(memberId, reason)`: sets `status: "Removed"`, logs audit entry, syncs with Firestore.

---

### Task 4: Creative Mascot-Powered "Waiting for HR Approval" Gate Screen
**Files:**
- Create: `src/components/mobile/WaitingForApprovalScreen.tsx`
- Modify: `src/components/mobile/MobileAppShell.tsx:35-110`

- [ ] **Step 1: Create `WaitingForApprovalScreen.tsx`**
  - Use Nano Banana generated mascot illustration (`/brand/hr_approval_waiting_mascot.png`).
  - Render deep cosmic backdrop with ambient starlight.
  - Display applicant dossier summary: Quanter ID, Name, Department candidate, Submission timestamp.
  - Display animated progress pill: "Dossier Received · Executive Review in Progress".
  - Include "Check Approval Status" button (calls `pullExactUpdatesFromServer()`).
  - Include "Sign Out / Switch Account" button.

- [ ] **Step 2: Wire into `MobileAppShell.tsx`**
  - If member has `status === "Pending"` or `(!onboardingAutoApprove && !hrApproved && !isPrivilegedRole)`:
    Render `WaitingForApprovalScreen` on protected routes.

---

### Task 5: Admin Settings & Admin Members Review Interface
**Files:**
- Modify: `src/app/admin/settings/page.tsx:540-585`
- Modify: `src/app/admin/members/page.tsx:150-250`

- [ ] **Step 1: Polish Onboarding Admission Mode in `/admin/settings`**
  - Buttons: "Auto-Accepted" (`Auto-Trainee`) vs "HR Approval Required" (`Manual Review`).
  - Show active explanatory status badge.

- [ ] **Step 2: Add "Pending Approval" filter and 1-click Approval in `/admin/members`**
  - Add "Pending Approval" pill in member status filter tab.
  - Add prominent "Approve Admission" button on pending rows with 1-click confirmation.

---

### Task 6: Compile, Deploy & Live End-to-End Verification
- [ ] **Step 1: Compile check** (`npx tsc --noEmit`).
- [ ] **Step 2: Static build** (`$env:FIREBASE_STATIC_EXPORT="1"; npm run build`).
- [ ] **Step 3: Deploy to Firebase Hosting** (`npx firebase deploy --only hosting`).
- [ ] **Step 4: Live browser test with Chrome DevTools**:
  - Test phone number validation in `/onboarding`.
  - Verify enhanced campus commute cards.
  - Toggle admission mode to `HR Approval Required` in `/admin/settings`.
  - Register new member -> verify Waiting Gate with mascot.
  - Approve member from admin -> verify automatic entry into `/home`.
