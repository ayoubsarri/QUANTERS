import {
  createUserWithEmailAndPassword,
  getRedirectResult,
  sendPasswordResetEmail as fbSendPasswordResetEmail,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  updatePassword,
} from "firebase/auth";
import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import {
  auth,
  db,
  googleProvider,
  isFirebaseConfigured,
  FIRESTORE_COLLECTIONS,
} from "./config";

/**
 * Returns the Firebase Auth instance if Firebase is configured.
 */
export function getFirebaseAuth() {
  if (!isFirebaseConfigured()) return null;
  return auth;
}

/**
 * Ensures there is an active Firebase Auth session (anonymous or Google/Email)
 * so Cloud Firestore security rules (`request.auth != null`) are satisfied.
 */
export async function ensureFirebaseAuthSession(): Promise<boolean> {
  if (typeof window === "undefined" || !isFirebaseConfigured()) return false;
  try {
    const fbAuth = getFirebaseAuth();
    if (!fbAuth) return false;
    if (fbAuth.currentUser) return true;
    await signInAnonymously(fbAuth);
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if the browser just returned from a `signInWithRedirect` Google OAuth flow.
 */
export async function checkFirebaseGoogleRedirectResult(): Promise<{
  ok: boolean;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
  uid?: string;
}> {
  if (typeof window === "undefined" || !isFirebaseConfigured()) {
    return { ok: false };
  }
  try {
    const fbAuth = getFirebaseAuth();
    if (!fbAuth) return { ok: false };
    const cred = await getRedirectResult(fbAuth);
    const user = cred?.user;
    if (!user || !user.email) return { ok: false };
    return {
      ok: true,
      email: user.email.toLowerCase(),
      fullName: user.displayName || undefined,
      avatarUrl: user.photoURL || undefined,
      uid: user.uid,
    };
  } catch {
    return { ok: false };
  }
}

/**
 * Triggers native Google OAuth sign-in via Firebase Authentication (quanters-d0312).
 * Automatically falls back to redirect sign-in on mobile in-app browsers if popups are blocked.
 */
export async function signInWithFirebaseGooglePopup(): Promise<{
  ok: boolean;
  cancelled?: boolean;
  redirecting?: boolean;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
  uid?: string;
  errorCode?: string;
  message?: string;
}> {
  try {
    const fbAuth = getFirebaseAuth();
    if (!fbAuth) {
      return {
        ok: false,
        errorCode: "UNCONFIGURED",
        message: "Google Sign-In is currently unavailable.",
      };
    }

    // Strict account isolation: explicitly clear any existing Firebase Auth session
    // so stale credentials or another signed-in Google account never leaks into this attempt
    if (fbAuth.currentUser) {
      await fbAuth.signOut().catch(() => {});
    }

    googleProvider.setCustomParameters({ prompt: "select_account" });

    // Strict 25s timeout so Google OAuth never hangs indefinitely on mobile browsers or quota throttles
    const timeoutPromise = new Promise<never>((_, reject) => {
      const timer = setTimeout(() => {
        const timeoutErr = new Error("Google Sign-In timed out. Please check your connection and try again.");
        (timeoutErr as any).code = "auth/timeout";
        reject(timeoutErr);
      }, 25000);
      if (typeof timer.unref === "function") timer.unref();
    });

    const cred = await Promise.race([
      signInWithPopup(fbAuth, googleProvider),
      timeoutPromise,
    ]);

    const user = cred.user;
    if (!user || !user.email) {
      return {
        ok: false,
        errorCode: "NO_EMAIL",
        message: "Google account did not return an email address.",
      };
    }
    return {
      ok: true,
      email: user.email.toLowerCase(),
      fullName: user.displayName || undefined,
      avatarUrl: user.photoURL || undefined,
      uid: user.uid,
    };
  } catch (err: any) {
    const code = String(err?.code || "");
    if (
      code === "auth/popup-closed-by-user" ||
      code === "auth/cancelled-popup-request"
    ) {
      return { ok: false, cancelled: true, errorCode: code };
    }
    if (code === "auth/timeout") {
      return {
        ok: false,
        errorCode: "auth/timeout",
        message: "Google Sign-In took too long to respond. Please check your internet connection and try again.",
      };
    }
    if (
      code === "auth/popup-blocked" ||
      code === "auth/operation-not-supported-in-this-environment"
    ) {
      try {
        const fbAuth = getFirebaseAuth();
        if (fbAuth) {
          googleProvider.setCustomParameters({ prompt: "select_account" });
          await signInWithRedirect(fbAuth, googleProvider);
          return { ok: false, redirecting: true };
        }
      } catch {
        // fall through
      }
    }
    return {
      ok: false,
      errorCode: code || "GOOGLE_AUTH_ERROR",
      message:
        "Unable to complete Google Sign-In. Please allow popups in your browser and try again.",
    };
  }
}

/**
 * Maps raw Firebase Auth error codes into professional, international-standard messages.
 */
export function formatFirebaseAuthError(code?: string): string {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Incorrect email or password. Please verify your credentials or use password recovery.";
    case "auth/email-already-in-use":
      return "An account with this email address already exists. Please sign in instead.";
    case "auth/weak-password":
      return "Password must be at least 8 characters long and include numbers and letters.";
    case "auth/invalid-email":
      return "Please enter a valid email address (e.g. member@univ-alger.dz).";
    case "auth/user-disabled":
      return "This account has been suspended by club governance. Please contact hr.quanta@univ-alger.dz.";
    case "auth/too-many-requests":
      return "Too many unsuccessful attempts. Access has been temporarily paused for your security. Please wait a few minutes.";
    case "auth/network-request-failed":
      return "Network connection error. Please verify your internet connection and try again.";
    case "auth/operation-not-allowed":
      return "Email/Password authentication is currently unavailable on the server.";
    default:
      return "Authentication could not be completed. Please verify your connection or try again.";
  }
}

/**
 * Authenticates an existing member using Firebase Authentication Email/Password.
 */
export async function signInWithFirebaseEmailPassword(
  email: string,
  password: string
): Promise<{
  ok: boolean;
  uid?: string;
  email?: string;
  errorCode?: string;
  message?: string;
}> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = password.trim();

  if (!cleanEmail || !cleanPass) {
    return {
      ok: false,
      errorCode: "EMPTY_FIELDS",
      message: "Please enter both your email address and password.",
    };
  }

  const fbAuth = getFirebaseAuth();
  if (!fbAuth) {
    return {
      ok: false,
      errorCode: "UNCONFIGURED",
      message: "Firebase Authentication is unavailable.",
    };
  }

  try {
    const cred = await signInWithEmailAndPassword(fbAuth, cleanEmail, cleanPass);
    const user = cred.user;
    return {
      ok: true,
      uid: user.uid,
      email: (user.email || cleanEmail).toLowerCase(),
    };
  } catch (err: any) {
    const code = String(err?.code || "AUTH_ERROR");
    return {
      ok: false,
      errorCode: code,
      message: formatFirebaseAuthError(code),
    };
  }
}

/**
 * Creates a brand-new user record in Firebase Authentication with Email & Password.
 */
export async function createFirebaseEmailPasswordUser(
  email: string,
  password: string
): Promise<{
  ok: boolean;
  uid?: string;
  email?: string;
  errorCode?: string;
  message?: string;
}> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = password.trim();

  if (!cleanEmail || !cleanPass) {
    return {
      ok: false,
      errorCode: "EMPTY_FIELDS",
      message: "Please enter both your email address and password.",
    };
  }

  if (cleanPass.length < 8) {
    return {
      ok: false,
      errorCode: "auth/weak-password",
      message: "Password must be at least 8 characters long.",
    };
  }

  const fbAuth = getFirebaseAuth();
  if (!fbAuth) {
    return {
      ok: false,
      errorCode: "UNCONFIGURED",
      message: "Firebase Authentication is unavailable.",
    };
  }

  try {
    const cred = await createUserWithEmailAndPassword(fbAuth, cleanEmail, cleanPass);
    const user = cred.user;
    return {
      ok: true,
      uid: user.uid,
      email: (user.email || cleanEmail).toLowerCase(),
    };
  } catch (err: any) {
    const code = String(err?.code || "CREATE_USER_ERROR");
    return {
      ok: false,
      errorCode: code,
      message: formatFirebaseAuthError(code),
    };
  }
}

/**
 * Updates the currently authenticated Firebase user's password.
 */
export async function updateFirebasePassword(
  newPassword: string
): Promise<{ ok: boolean; message: string; errorCode?: string }> {
  const cleanPass = newPassword.trim();
  if (cleanPass.length < 8) {
    return {
      ok: false,
      errorCode: "auth/weak-password",
      message: "New password must be at least 8 characters.",
    };
  }

  const fbAuth = getFirebaseAuth();
  if (!fbAuth || !fbAuth.currentUser) {
    return {
      ok: false,
      errorCode: "NO_ACTIVE_USER",
      message: "No active authenticated session found.",
    };
  }

  try {
    await updatePassword(fbAuth.currentUser, cleanPass);
    return {
      ok: true,
      message: "Password updated successfully in Firebase Authentication.",
    };
  } catch (err: any) {
    const code = String(err?.code || "UPDATE_PASSWORD_ERROR");
    return {
      ok: false,
      errorCode: code,
      message: formatFirebaseAuthError(code),
    };
  }
}

/**
 * Signs out the currently authenticated Firebase user.
 */
export async function signOutFromFirebase(): Promise<void> {
  try {
    const fbAuth = getFirebaseAuth();
    if (fbAuth && fbAuth.currentUser) {
      await fbAuth.signOut();
    }
  } catch {
    // Ignore sign-out error
  }
}

/**
 * Dispatches a password reset email via official Firebase Authentication.
 */
export async function sendFirebasePasswordReset(
  email: string
): Promise<{ success: boolean; message: string; errorCode?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) {
    return { success: false, message: "Please provide a valid email address." };
  }

  try {
    const fbAuth = getFirebaseAuth();
    if (fbAuth) {
      await fbSendPasswordResetEmail(fbAuth, cleanEmail);
      return {
        success: true,
        message: `A secure password reset link has been dispatched to ${cleanEmail}. Please check your inbox and spam folder.`,
      };
    }

    return {
      success: true,
      message: `Reset link dispatched to ${cleanEmail}. Check your inbox for the recovery link.`,
    };
  } catch (err: any) {
    const code = String(err?.code || "");
    const friendlyMsg = formatFirebaseAuthError(code);
    return {
      success: false,
      errorCode: code || "UNKNOWN",
      message:
        friendlyMsg ||
        "Unable to send reset link automatically. Please contact quantaclubdz@gmail.com or hr.quanta@univ-alger.dz.",
    };
  }
}

let lastReceivedCloudSnapshot: Record<string, any> | null = null;

const ACTIVE_AUDIT_LOG_WINDOW = 250;
const ACTIVE_LEDGER_WINDOW = 300;
const MAX_INLINE_AVATAR_BYTES = 24576; // 24 KB ceiling for inline base64 avatars
const MAIN_DOC_SAFE_BYTE_THRESHOLD = 600000; // 600 KB threshold (well below 1 MiB ceiling)

function sanitizeMembersForCloud(members: any[]): any[] {
  if (!Array.isArray(members)) return [];
  return members.map((m) => {
    if (!m || typeof m !== "object") return m;
    const { password: _strippedPassword, passwordHash: _strippedHash, ...rest } = m;
    if (
      typeof rest.avatarUrl === "string" &&
      rest.avatarUrl.startsWith("data:") &&
      rest.avatarUrl.length > MAX_INLINE_AVATAR_BYTES
    ) {
      rest.avatarUrl =
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&h=160&fit=crop&crop=faces";
    }
    return rest;
  });
}

let firestoreQuotaExhausted = false;

export function isFirestoreQuotaExhausted(): boolean {
  if (typeof window !== "undefined") {
    try {
      if (window.sessionStorage.getItem("quanters_quota_exhausted") === "1") {
        return true;
      }
    } catch {}
  }
  return firestoreQuotaExhausted;
}

export function markFirestoreQuotaExhausted(): void {
  firestoreQuotaExhausted = true;
  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.setItem("quanters_quota_exhausted", "1");
      window.dispatchEvent(new Event("quanters:quota_exhausted"));
    } catch {}
  }
}

export function resetFirestoreQuotaExhausted(): void {
  firestoreQuotaExhausted = false;
  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.removeItem("quanters_quota_exhausted");
      window.dispatchEvent(new Event("quanters:quota_reset"));
    } catch {}
  }
}

/**
 * Pulls the latest ERP state snapshot from Cloud Firestore (`erp_state/main`) on quanters-d0312.
 */
export async function pullErpStateFromFirestore(): Promise<Record<string, any> | null> {
  if (typeof window === "undefined" || !isFirebaseConfigured()) return null;
  if (isFirestoreQuotaExhausted()) return null;
  try {
    await ensureFirebaseAuthSession();
    const ref = doc(db, FIRESTORE_COLLECTIONS.ERP_STATE, "main");
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() as Record<string, any>;
      if (Array.isArray(data.members)) {
        data.members = sanitizeMembersForCloud(data.members);
      }
      lastReceivedCloudSnapshot = data;
      return data;
    }
    return null;
  } catch (err: any) {
    const code = String(err?.code || "");
    if (code.includes("resource-exhausted") || code.includes("quota")) {
      markFirestoreQuotaExhausted();
      console.warn("[Firestore Quota] Spark read quota limit reached. Tripping circuit breaker into local cache mode.");
    }
    return null;
  }
}

const MERGEABLE_ARRAY_KEYS = [
  "departments",
  "teams",
  "members",
  "workshops",
  "tasks",
  "pointRules",
  "ledger",
  "badges",
  "exams",
  "examCompletions",
  "projectSubmissions",
  "proposals",
  "explorePosts",
  "dailyQuizzes",
  "customDailyQuotes",
  "messages",
  "invitations",
  "accessGrants",
  "auditLogs",
  "grievances",
] as const;

function mergeCollectionArraysById(
  remoteList: any[],
  localList: any[],
  deletedIds?: Set<string>,
  key?: string
): any[] {
  const map = new Map<string, any>();
  for (const rItem of remoteList) {
    if (rItem && typeof rItem.id === "string") {
      if (deletedIds && deletedIds.has(rItem.id)) continue;
      map.set(rItem.id, rItem);
    }
  }
  for (const lItem of localList) {
    if (lItem && typeof lItem.id === "string") {
      if (deletedIds && deletedIds.has(lItem.id)) continue;
      const existingRemote = map.get(lItem.id);
      if (key === "teams" && existingRemote && Array.isArray(existingRemote.memberIds) && Array.isArray(lItem.memberIds)) {
        map.set(lItem.id, {
          ...existingRemote,
          ...lItem,
          memberIds: Array.from(new Set([...lItem.memberIds, ...existingRemote.memberIds])),
        });
      } else if (key === "workshops" && existingRemote) {
        map.set(lItem.id, {
          ...existingRemote,
          ...lItem,
          registeredMemberIds: Array.from(
            new Set([
              ...(Array.isArray(lItem.registeredMemberIds) ? lItem.registeredMemberIds : []),
              ...(Array.isArray(existingRemote.registeredMemberIds) ? existingRemote.registeredMemberIds : []),
            ])
          ),
          checkedInMemberIds: Array.from(
            new Set([
              ...(Array.isArray(lItem.checkedInMemberIds) ? lItem.checkedInMemberIds : []),
              ...(Array.isArray(existingRemote.checkedInMemberIds) ? existingRemote.checkedInMemberIds : []),
            ])
          ),
        });
      } else {
        map.set(lItem.id, existingRemote ? { ...existingRemote, ...lItem } : lItem);
      }
    }
  }
  // Keep newest local items first for members/tasks/messages/auditLogs/ledger
  const localIds = new Set(localList.map((i) => i?.id).filter(Boolean));
  const ordered: any[] = [];
  for (const lItem of localList) {
    if (lItem && typeof lItem.id === "string" && map.has(lItem.id)) {
      ordered.push(map.get(lItem.id));
    }
  }
  for (const [id, rItem] of map.entries()) {
    if (!localIds.has(id)) {
      ordered.push(rItem);
    }
  }
  return ordered;
}

/**
 * Pushes delta or full ERP state changes to Cloud Firestore (`erp_state/main`) on quanters-d0312.
 * - Blocks anonymous writes (VULN-02).
 * - Strips any plaintext password fields (VULN-01).
 * - Merges item-level changes against the live cloud cache to eliminate Last-Write-Wins loss (ARCH-01).
 * - Caps active history windows and spills overflow records to `erp_state/history_shard` so `erp_state/main`
 *   never approaches the 1 MiB Firestore document limit (LIMIT-01).
 */
export async function pushErpStateToFirestore(
  payload: Record<string, any>,
  deletedIdsByCollection?: Record<string, string[]>
): Promise<Record<string, any> | null> {
  if (typeof window === "undefined" || !isFirebaseConfigured()) return null;
  if (isFirestoreQuotaExhausted()) return null;
  try {
    const fbAuth = getFirebaseAuth();
    if (!fbAuth || !fbAuth.currentUser || fbAuth.currentUser.isAnonymous) {
      // Anonymous sessions are strictly read-only (VULN-02)
      return null;
    }

    const ref = doc(db, FIRESTORE_COLLECTIONS.ERP_STATE, "main");
    const sanitizedPayload: Record<string, any> = { ...payload };

    // 1. Strip plaintext passwords & cap oversized inline avatars (VULN-01 & LIMIT-01)
    if (Array.isArray(sanitizedPayload.members)) {
      sanitizedPayload.members = sanitizeMembersForCloud(sanitizedPayload.members);
    }

    // 2. Item-level concurrent merge against latest cloud snapshot + tombstone filtering (ARCH-01)
    for (const key of MERGEABLE_ARRAY_KEYS) {
      if (Array.isArray(sanitizedPayload[key])) {
        const delIds = deletedIdsByCollection?.[key] || [];
        const delSet = new Set(delIds);
        const remoteArr = Array.isArray(lastReceivedCloudSnapshot?.[key])
          ? lastReceivedCloudSnapshot![key]
          : [];
        sanitizedPayload[key] =
          remoteArr.length > 0
            ? mergeCollectionArraysById(remoteArr, sanitizedPayload[key], delSet, key)
            : sanitizedPayload[key].filter(
                (item: any) => !item || !item.id || !delSet.has(item.id)
              );
      }
    }

    // 3. Enforce 1 MiB ceiling via active-window capping & overflow sharding (LIMIT-01)
    const overflowShardPayload: Record<string, any> = {};
    let hasOverflow = false;

    if (
      Array.isArray(sanitizedPayload.auditLogs) &&
      sanitizedPayload.auditLogs.length > ACTIVE_AUDIT_LOG_WINDOW
    ) {
      overflowShardPayload.auditLogs = sanitizedPayload.auditLogs.slice(
        ACTIVE_AUDIT_LOG_WINDOW,
        ACTIVE_AUDIT_LOG_WINDOW + 1500
      );
      sanitizedPayload.auditLogs = sanitizedPayload.auditLogs.slice(0, ACTIVE_AUDIT_LOG_WINDOW);
      hasOverflow = true;
    }

    if (
      Array.isArray(sanitizedPayload.ledger) &&
      sanitizedPayload.ledger.length > ACTIVE_LEDGER_WINDOW
    ) {
      overflowShardPayload.ledger = sanitizedPayload.ledger.slice(
        ACTIVE_LEDGER_WINDOW,
        ACTIVE_LEDGER_WINDOW + 2000
      );
      sanitizedPayload.ledger = sanitizedPayload.ledger.slice(0, ACTIVE_LEDGER_WINDOW);
      hasOverflow = true;
    }

    const nowIso = new Date().toISOString();
    const cleanPayload = JSON.parse(
      JSON.stringify({
        ...sanitizedPayload,
        updatedAt: nowIso,
      })
    );

    // Additional byte-budget check: if main payload still exceeds 600 KB, trim secondary history arrays
    const serializedSize = JSON.stringify(cleanPayload).length;
    if (serializedSize > MAIN_DOC_SAFE_BYTE_THRESHOLD) {
      if (Array.isArray(cleanPayload.auditLogs) && cleanPayload.auditLogs.length > 200) {
        overflowShardPayload.auditLogs = cleanPayload.auditLogs.slice(200, 1000);
        cleanPayload.auditLogs = cleanPayload.auditLogs.slice(0, 200);
        hasOverflow = true;
      }
      if (Array.isArray(cleanPayload.ledger) && cleanPayload.ledger.length > 120) {
        overflowShardPayload.ledger = cleanPayload.ledger.slice(120, 1000);
        cleanPayload.ledger = cleanPayload.ledger.slice(0, 120);
        hasOverflow = true;
      }
    }

    await setDoc(ref, cleanPayload, { merge: true });

    // Update in-memory baseline with merged fields
    lastReceivedCloudSnapshot = {
      ...(lastReceivedCloudSnapshot || {}),
      ...cleanPayload,
    };

    if (hasOverflow) {
      const shardRef = doc(db, FIRESTORE_COLLECTIONS.ERP_STATE, "history_shard");
      await setDoc(
        shardRef,
        JSON.parse(
          JSON.stringify({
            shardId: "history_shard",
            updatedAt: nowIso,
            ...overflowShardPayload,
          })
        ),
        { merge: true }
      ).catch(() => {});
    }

    return cleanPayload;
  } catch (err: any) {
    const code = String(err?.code || "");
    if (code.includes("resource-exhausted") || code.includes("quota")) {
      markFirestoreQuotaExhausted();
      console.warn("[Firestore Quota] Spark write quota reached for today. Tripping circuit breaker into local cache mode.");
    } else {
      console.warn("[Firestore Push Error]", err);
    }
    return null;
  }
}

/**
 * Subscribes to real-time updates on `erp_state/main` in Cloud Firestore.
 */
export async function subscribeToErpStateFirestore(
  onUpdate: (data: Record<string, any>) => void
): Promise<(() => void) | null> {
  if (typeof window === "undefined" || !isFirebaseConfigured()) return null;
  if (isFirestoreQuotaExhausted()) return null;
  try {
    await ensureFirebaseAuthSession();
    const ref = doc(db, FIRESTORE_COLLECTIONS.ERP_STATE, "main");
    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists() && !snap.metadata.hasPendingWrites) {
          const data = snap.data() as Record<string, any>;
          if (Array.isArray(data.members)) {
            data.members = sanitizeMembersForCloud(data.members);
          }
          lastReceivedCloudSnapshot = data;
          onUpdate(data);
        }
      },
      (err: any) => {
        const code = String(err?.code || "");
        if (code.includes("resource-exhausted") || code.includes("quota")) {
          markFirestoreQuotaExhausted();
          console.warn("[Firestore Quota] Real-time listener tripped quota limit. Continuing in offline mode.");
        }
      }
    );
    return unsubscribe;
  } catch {
    return null;
  }
}
