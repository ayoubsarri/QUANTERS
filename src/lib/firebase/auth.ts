import {
  ActionCodeSettings,
  applyActionCode,
  createUserWithEmailAndPassword,
  getRedirectResult,
  sendEmailVerification as fbSendEmailVerification,
  sendPasswordResetEmail as fbSendPasswordResetEmail,
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
  isSuperAdminEmail,
} from "./config";

/**
 * Returns the Firebase Auth instance if Firebase is configured.
 */
export function getFirebaseAuth() {
  if (!isFirebaseConfigured()) return null;
  return auth;
}

/**
 * Ensures Firebase Auth is initialized and ready.
 * Does NOT create anonymous accounts so authentication user pool remains clean.
 */
export async function ensureFirebaseAuthSession(): Promise<boolean> {
  if (typeof window === "undefined" || !isFirebaseConfigured()) return false;
  try {
    const fbAuth = getFirebaseAuth();
    if (!fbAuth) return false;
    if (typeof (fbAuth as any).authStateReady === "function") {
      await (fbAuth as any).authStateReady();
    }
    return !!fbAuth.currentUser;
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
 * Invoked synchronously within the user click gesture to prevent browser popup blockers.
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
    if (typeof (fbAuth as any).authStateReady === "function") {
      await (fbAuth as any).authStateReady();
    }

    // Always prompt account selection so the user can choose their desired Google account
    googleProvider.setCustomParameters({ prompt: "select_account" });

    // Strict 35s timeout so Google OAuth never hangs indefinitely on mobile browsers
    const timeoutPromise = new Promise<never>((_, reject) => {
      const timer = setTimeout(() => {
        const timeoutErr = new Error("Google Sign-In timed out. Please check your connection and try again.");
        (timeoutErr as any).code = "auth/timeout";
        reject(timeoutErr);
      }, 35000);
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

    // Dispatches the official verification email to the newly registered member's inbox
    try {
      const actionCodeSettings: ActionCodeSettings = {
        url: "https://quanters.web.app/welcome?emailVerified=true",
        handleCodeInApp: true,
      };
      await fbSendEmailVerification(user, actionCodeSettings).catch(async () => {
        await fbSendEmailVerification(user);
      });
    } catch (verErr) {
      console.warn("[Firebase Auth] Initial email verification dispatch notice:", verErr);
    }

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
      const actionCodeSettings: ActionCodeSettings = {
        url: "https://quanters.web.app/welcome?mode=signin",
        handleCodeInApp: true,
      };
      try {
        await fbSendPasswordResetEmail(fbAuth, cleanEmail, actionCodeSettings);
      } catch {
        await fbSendPasswordResetEmail(fbAuth, cleanEmail);
      }
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

/**
 * Dispatches an official email verification link to the active user's inbox.
 */
export async function sendFirebaseEmailVerification(
  user?: any
): Promise<{ success: boolean; message: string; errorCode?: string }> {
  try {
    const fbAuth = getFirebaseAuth();
    const target = user || fbAuth?.currentUser;
    if (!target) {
      return {
        success: false,
        errorCode: "NO_ACTIVE_USER",
        message: "No active user session to send verification email.",
      };
    }
    const actionCodeSettings: ActionCodeSettings = {
      url: "https://quanters.web.app/welcome?emailVerified=true",
      handleCodeInApp: true,
    };
    try {
      await fbSendEmailVerification(target, actionCodeSettings);
    } catch {
      await fbSendEmailVerification(target);
    }
    return {
      success: true,
      message: `An official verification email has been dispatched to ${target.email}. Please check your inbox and spam folder.`,
    };
  } catch (err: any) {
    const code = String(err?.code || "");
    return {
      success: false,
      errorCode: code || "UNKNOWN",
      message: formatFirebaseAuthError(code),
    };
  }
}

/**
 * Verifies an action code from an email verification link (oobCode).
 */
export async function verifyEmailActionCode(
  oobCode: string
): Promise<{ ok: boolean; message: string }> {
  try {
    const fbAuth = getFirebaseAuth();
    if (!fbAuth) return { ok: false, message: "Firebase Authentication is unavailable." };
    await applyActionCode(fbAuth, oobCode);
    if (fbAuth.currentUser) {
      await fbAuth.currentUser.reload().catch(() => {});
    }
    return { ok: true, message: "Email address verified successfully!" };
  } catch (err: any) {
    const code = String(err?.code || "");
    return { ok: false, message: formatFirebaseAuthError(code) };
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
 * Transparently merges partitioned shards (members_shard, history_shard) into the unified state.
 */
export async function pullErpStateFromFirestore(): Promise<Record<string, any> | null> {
  if (typeof window === "undefined" || !isFirebaseConfigured()) return null;
  if (isFirestoreQuotaExhausted()) return null;
  try {
    await ensureFirebaseAuthSession();
    const mainRef = doc(db, FIRESTORE_COLLECTIONS.ERP_STATE, "main");
    const membersShardRef = doc(db, FIRESTORE_COLLECTIONS.ERP_STATE, "members_shard");
    const historyShardRef = doc(db, FIRESTORE_COLLECTIONS.ERP_STATE, "history_shard");

    const [mainSnap, membersSnap, historySnap] = await Promise.all([
      getDoc(mainRef),
      getDoc(membersShardRef).catch(() => null),
      getDoc(historyShardRef).catch(() => null),
    ]);

    if (!mainSnap.exists()) return null;

    const data = mainSnap.data() as Record<string, any>;

    // Transparently merge members_shard if present (LIMIT-01)
    if (membersSnap && membersSnap.exists()) {
      const shardData = membersSnap.data() as Record<string, any>;
      if (Array.isArray(shardData.members)) {
        data.members = mergeCollectionArraysById(shardData.members, data.members || [], undefined, "members");
      }
    }

    // Transparently merge history_shard if present (LIMIT-01)
    if (historySnap && historySnap.exists()) {
      const historyData = historySnap.data() as Record<string, any>;
      if (Array.isArray(historyData.auditLogs)) {
        data.auditLogs = mergeCollectionArraysById(historyData.auditLogs, data.auditLogs || [], undefined, "auditLogs");
      }
      if (Array.isArray(historyData.ledger)) {
        data.ledger = mergeCollectionArraysById(historyData.ledger, data.ledger || [], undefined, "ledger");
      }
    }

    if (Array.isArray(data.members)) {
      data.members = sanitizeMembersForCloud(data.members);
    }

    // Apply cloud-stored tombstones to localStorage BEFORE returning data
    // This ensures deletions propagate to ALL devices, not just the one that deleted
    if (data.deletedIdsByCollection && typeof data.deletedIdsByCollection === "object") {
      if (typeof window !== "undefined") {
        const TOMBSTONES_KEY = "quanters-tombstones-v3";
        try {
          const raw = window.localStorage.getItem(TOMBSTONES_KEY);
          const existing = raw ? JSON.parse(raw) : {};
          const cloudTombstones = data.deletedIdsByCollection as Record<string, string[]>;
          let changed = false;
          for (const [col, ids] of Object.entries(cloudTombstones)) {
            if (!Array.isArray(ids)) continue;
            if (!Array.isArray(existing[col])) existing[col] = [];
            for (const id of ids) {
              const already = existing[col].some((item: any) =>
                typeof item === "string" ? item === id : item?.id === id
              );
              if (!already) {
                existing[col].push({ id, deletedAt: Date.now() });
                changed = true;
              }
              // Also mark in-memory recently-deleted to prevent resurrection this session
              registerRecentDeletion(id as string);
            }
          }
          if (changed) {
            window.localStorage.setItem(TOMBSTONES_KEY, JSON.stringify(existing));
          }
        } catch {
          // Ignore storage errors
        }
      }
    }

    lastReceivedCloudSnapshot = data;
    return data;
  } catch (err: any) {
    const code = String(err?.code || "");
    if (code.includes("resource-exhausted") || code.includes("quota")) {
      markFirestoreQuotaExhausted();
      console.warn("[Firestore Quota] Spark read quota limit reached. Tripping circuit breaker into local cache mode.");
    }
    return null;
  }
}

// In-memory deletion lease to guarantee 0ms resurrection prevention & eliminate item blinking
const recentlyDeletedIdSet = new Set<string>();
const recentlyDeletedTimestamps = new Map<string, number>();
const RECENT_DELETION_LEASE_MS = 60000; // 60s lease

export function registerRecentDeletion(id: string) {
  if (!id) return;
  recentlyDeletedIdSet.add(id);
  recentlyDeletedTimestamps.set(id, Date.now());
}

export function isRecentlyDeleted(id: string): boolean {
  if (!id) return false;
  if (recentlyDeletedIdSet.has(id)) {
    const ts = recentlyDeletedTimestamps.get(id);
    if (ts && Date.now() - ts < RECENT_DELETION_LEASE_MS) {
      return true;
    }
    recentlyDeletedIdSet.delete(id);
    recentlyDeletedTimestamps.delete(id);
  }
  return false;
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
  key?: string,
  isAuthoritativeWrite = false
): any[] {
  const map = new Map<string, any>();
  for (const rItem of remoteList) {
    if (rItem && typeof rItem.id === "string") {
      if (deletedIds && deletedIds.has(rItem.id)) continue;
      if (isRecentlyDeleted(rItem.id)) continue;
      map.set(rItem.id, rItem);
    }
  }
  for (const lItem of localList) {
    if (lItem && typeof lItem.id === "string") {
      if (deletedIds && deletedIds.has(lItem.id)) continue;
      if (isRecentlyDeleted(lItem.id)) continue;
      const existingRemote = map.get(lItem.id);
      if (existingRemote) {
        // Concurrency reconciliation: Compare updatedAt / statusSince timestamp
        const remoteTime = existingRemote.updatedAt
          ? new Date(existingRemote.updatedAt).getTime()
          : existingRemote.statusSince
          ? new Date(existingRemote.statusSince).getTime()
          : 0;
        const localTime = lItem.updatedAt
          ? new Date(lItem.updatedAt).getTime()
          : lItem.statusSince
          ? new Date(lItem.statusSince).getTime()
          : 0;

        // If remote has a strictly newer timestamp, remote item wins over stale local write (ARCH-01)
        if (remoteTime > 0 && localTime > 0 && remoteTime > localTime && !isAuthoritativeWrite) {
          continue;
        }

        if (key === "teams" && Array.isArray(existingRemote.memberIds) && Array.isArray(lItem.memberIds)) {
          map.set(lItem.id, {
            ...existingRemote,
            ...lItem,
            memberIds: Array.from(new Set([...lItem.memberIds, ...existingRemote.memberIds])),
          });
        } else if (key === "workshops") {
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
          map.set(lItem.id, { ...existingRemote, ...lItem });
        }
      } else {
        map.set(lItem.id, lItem);
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
      // If this write is authoritative (Admin explicitly managing catalog/deleting items), do NOT resurrect remote deleted items!
      if (isAuthoritativeWrite) continue;
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
    let fbAuth = getFirebaseAuth();
    if (!fbAuth) return null;
    if (typeof (fbAuth as any).authStateReady === "function") {
      await (fbAuth as any).authStateReady();
    }
    if (!fbAuth.currentUser) {
      await ensureFirebaseAuthSession().catch(() => {});
      fbAuth = getFirebaseAuth();
    }

    const ref = doc(db, FIRESTORE_COLLECTIONS.ERP_STATE, "main");
    const sanitizedPayload: Record<string, any> = { ...payload };

    // Strip administrative governance keys ONLY if explicitly marked as restricted member write
    const userEmail = (fbAuth?.currentUser?.email || payload._actorEmail || "").toLowerCase();
    const isUserAdmin = isSuperAdminEmail(userEmail) || payload._isAdmin === true;
    if (!isUserAdmin && payload._isRestrictedMemberWrite === true) {
      delete sanitizedPayload.settings;
      delete sanitizedPayload.accessGrants;
      delete sanitizedPayload.pointRules;
      delete sanitizedPayload.departments;
      delete sanitizedPayload.auditLogs;
    }

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
            ? mergeCollectionArraysById(remoteArr, sanitizedPayload[key], delSet, key, isUserAdmin)
            : sanitizedPayload[key].filter(
                (item: any) =>
                  !item || !item.id || (!delSet.has(item.id) && !isRecentlyDeleted(item.id))
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

    // Embed global tombstones in the Firestore document so ALL devices see deletions
    // This is the only way deleted workshops/badges don't come back on fresh sessions
    if (deletedIdsByCollection && Object.keys(deletedIdsByCollection).length > 0) {
      const filteredTombstones: Record<string, string[]> = {};
      for (const [col, ids] of Object.entries(deletedIdsByCollection)) {
        if (Array.isArray(ids) && ids.length > 0) {
          filteredTombstones[col] = ids;
        }
      }
      if (Object.keys(filteredTombstones).length > 0) {
        (cleanPayload as any).deletedIdsByCollection = filteredTombstones;
      }
    }

    await setDoc(ref, cleanPayload, { merge: true });

    // Always mirror members to partitioned members_shard (LIMIT-01)
    if (Array.isArray(cleanPayload.members) && cleanPayload.members.length > 0) {
      const membersShardRef = doc(db, FIRESTORE_COLLECTIONS.ERP_STATE, "members_shard");
      setDoc(
        membersShardRef,
        JSON.parse(
          JSON.stringify({
            shardId: "members_shard",
            updatedAt: nowIso,
            members: cleanPayload.members,
          })
        ),
        { merge: true }
      ).catch(() => {});
    }

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
            data.members = sanitizeMembersForCloud(data.members).filter(
              (m: any) => !isRecentlyDeleted(m?.id)
            );
          }
          if (Array.isArray(data.workshops)) {
            data.workshops = data.workshops.filter(
              (w: any) => !isRecentlyDeleted(w?.id)
            );
          }
          if (Array.isArray(data.messages)) {
            data.messages = data.messages.filter(
              (m: any) => !isRecentlyDeleted(m?.id)
            );
          }
          if (Array.isArray(data.tasks)) {
            data.tasks = data.tasks.filter(
              (t: any) => !isRecentlyDeleted(t?.id)
            );
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
