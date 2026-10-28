# Alumni Onboarding Path & Registration Decoupling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Decouple Student Member vs. Alumni selection from the initial Welcome page registration, relocate the role choice to the Club Tenure step in Onboarding, and dynamically branch Alumni users into a dedicated, professional Alumni Onboarding form while bypassing student-specific operational requirements (such as 7-day campus availability shifts and trainee placement).

**Architecture:** 
1. Remove the "Student Member" / "QUANTA Alumni" toggle from `src/app/(mobile)/welcome/page.tsx` so all new registrations are unified and streamlined.
2. In `src/app/(mobile)/onboarding/page.tsx`, expand `TENURE_OPTIONS` to include `"QUANTA Alumni"`.
3. In `OnboardingWizardPage`, introduce dynamic path branching: if `tenure === "QUANTA Alumni"`, steps 4–5 adapt to Alumni Career, Mentorship, and Professional Networks (asking for graduation year, current workplace/position, mentorship willingness, and professional links), completely skipping student-only steps (7-day physical shift grid, department trainee placement, and student club declaration).
4. Update `completeFirstTimeProfile` in `src/lib/store/useQuantersStore.ts` to assign Alumni status, roles, laureate titles, and graduation metadata.
5. Update `firestore.rules` via the `firestore-rules-author` subagent to permit self-updating `graduationYear`, `alumniPosition`, and `alumniAccessEnabled`.

**Tech Stack:** Next.js 15, React 19, TypeScript 5, Tailwind CSS, Zustand, Firebase Firestore & Hosting.

---

### Task 1: Streamline Welcome Page Registration

**Files:**
- Modify: `src/app/(mobile)/welcome/page.tsx:265-275, 620-630, 730-740, 1715-1745`

- [ ] **Step 1: Inspect Welcome page registration state**
- [ ] **Step 2: Remove the "Student Member" / "QUANTA Alumni" button toggle in `welcome/page.tsx`**
- [ ] **Step 3: Update `handleRegister` and Google OAuth callback in `welcome/page.tsx` to default `isAlumni: false`**
- [ ] **Step 4: Verify welcome page registration modal renders cleanly without the toggle**

---

### Task 2: Firestore Security Rules Authorization for Alumni Profile Fields

**Files:**
- Delegate to: `firestore-rules-author` subagent
- Modify: `firestore.rules:548-580`

- [ ] **Step 1: Check `isSafeMemberSelfUpdate()` in `firestore.rules`**
- [ ] **Step 2: Add `'graduationYear'`, `'alumniPosition'`, and `'alumniAccessEnabled'` to `safeSelfEditableFields`**
- [ ] **Step 3: Validate rules with `firebase_validate_security_rules`**

---

### Task 3: Store & Member Profile Completion for Alumni

**Files:**
- Modify: `src/lib/store/useQuantersStore.ts:176-204, 2143-2240`

- [ ] **Step 1: Add `graduationYear?: string`, `alumniPosition?: string`, `alumniAccessEnabled?: boolean` to `completeFirstTimeProfile` type definition**
- [ ] **Step 2: In `completeFirstTimeProfile` implementation, check if `payload.tenure === "QUANTA Alumni"` or `payload.isAlumni`**
- [ ] **Step 3: When Alumni, set `status: "Alumni"`, `roles: ["Alumni"]`, `levelTitle: "Quanta Laureate"`, `academicYear: "Graduated"`, `graduationYear`, and `alumniPosition`**
- [ ] **Step 4: Save to local cache and trigger background Firestore sync**

---

### Task 4: Dynamic Onboarding Flow & Dedicated Alumni Form

**Files:**
- Modify: `src/app/(mobile)/onboarding/page.tsx`

- [ ] **Step 1: Add `"QUANTA Alumni"` to `TENURE_OPTIONS`**
- [ ] **Step 2: Add Alumni state variables (`graduationYear`, `alumniPosition`, `isMentorWilling`, `industry`)**
- [ ] **Step 3: Add `isAlumniPath` computation (`tenure === "QUANTA Alumni"`)**
- [ ] **Step 4: Adapt Step indicator: for Alumni show 5 steps (Identity -> Location -> Alma Mater & Tenure -> Career & Mentorship -> Network Charter & Finish)**
- [ ] **Step 5: Create Step 4 Alumni Component: Career, Workplace/Position, Mentorship, Professional Links**
- [ ] **Step 6: Create Step 5 Alumni Component: Distinguished Alumni Laureate Review & Confirmation**
- [ ] **Step 7: In `handleFinish`, branch based on `isAlumniPath` to save Alumni credentials and redirect to `/home`**

---

### Task 5: End-to-End Build, Verification & Production Deployment

**Files:**
- Build: `scripts/build_firebase_out.mjs`
- Deploy: `firebase deploy --only hosting`

- [ ] **Step 1: Run production build `node scripts/build_firebase_out.mjs`**
- [ ] **Step 2: Verify zero TypeScript or linting errors**
- [ ] **Step 3: Bump `public/sw.js` to `v8.2`**
- [ ] **Step 4: Deploy to Firebase Hosting**
- [ ] **Step 5: Perform DevTools MCP browser verification of both the Student path and Alumni path**
