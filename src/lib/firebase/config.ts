/**
 * Firebase & Cloud Firestore Configuration for QUANTERS
 * Ready for Firebase Hosting / Firebase App Hosting + Firestore Spark/Blaze tiers.
 * Automatically activates when NEXT_PUBLIC_FIREBASE_PROJECT_ID is configured,
 * and gracefully falls back to the local /api/erp WAL engine when running offline/locally.
 */

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export const firebaseConfig: FirebaseClientConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "quanters-quanta-algiers1.firebaseapp.com",
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "quanters-quanta-algiers1",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "quanters-quanta-algiers1.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

export function isFirebaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
}

/**
 * Firestore Spark Quota-Optimized Collection Paths
 * Matches `firestore.rules` and `firestore.indexes.json`
 */
export const FIRESTORE_COLLECTIONS = {
  ERP_STATE: "erp_state",
  MEMBERS: "members",
  TASKS: "tasks",
  WORKSHOPS: "workshops",
  PROPOSALS: "proposals",
  BADGES: "badges",
  MESSAGES: "messages",
  AUDIT_LOGS: "audit_logs",
} as const;
