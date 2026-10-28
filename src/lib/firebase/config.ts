/**
 * Firebase, Analytics, Auth & Cloud Firestore Configuration for QUANTERS
 * Connected to official Firebase Project: quanters-d0312 (Site: "quanters")
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

// Official QUANTERS web app Firebase configuration (quanters-d0312)
export const firebaseConfig: FirebaseClientConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyC6pIhe81IqNuINx7Wd-TfgBLBJuW4Z6Yw",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "quanters-d0312.firebaseapp.com",
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "quanters-d0312",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "quanters-d0312.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "815338551488",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:815338551488:web:2494e9a885cfae6774d525",
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-VX6YS3CHCX",
};

// Initialize Firebase singleton
export const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// Initialize Firebase Analytics safely in browser environments
export const analyticsPromise: Promise<Analytics | null> =
  typeof window !== "undefined"
    ? isSupported()
        .then((yes) => (yes ? getAnalytics(app) : null))
        .catch(() => null)
    : Promise.resolve(null);

export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
}

/**
 * Official Super Admin Emails — HR & QUANTA Administration
 */
export const SUPER_ADMIN_EMAILS = [
  "quantaclubdz@gmail.com",
  "hr.quanta@univ-alger.dz",
  "quanta.hr.club@gmail.com",
  "hr.quantaclubdz@gmail.com",
  "quanta@univ-alger.dz",
  "hr@univ-alger.dz",
  "ayoubsarri1@gmail.com",
  "bellilisamy0@gmail.com",
] as const;

export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return (SUPER_ADMIN_EMAILS as readonly string[]).includes(clean);
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
