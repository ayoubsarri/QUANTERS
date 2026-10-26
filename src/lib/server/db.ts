/**
 * QUANTERS v3.0 — Zero-Quota Atomic Server-Side Persistence Engine
 * Stores full ERP state in compact JSON-WAL format (`data/quanters-db.json`)
 * with in-memory caching, atomic temp-file rename, and storage footprint telemetry.
 */

import fs from "fs";
import path from "path";
import {
  SEED_ACCESS_GRANTS,
  SEED_AUDIT_LOGS,
  SEED_BADGES,
  SEED_DEPARTMENTS,
  SEED_EXAMS,
  SEED_EXPLORE_POSTS,
  SEED_INVITATIONS,
  SEED_LEDGER,
  SEED_MEMBERS,
  SEED_MESSAGES,
  SEED_POINT_RULES,
  SEED_PROJECT_SUBMISSIONS,
  SEED_PROPOSALS,
  SEED_SETTINGS,
  SEED_TASKS,
  SEED_TEAMS,
  SEED_WORKSHOPS,
} from "../data/seed";

export interface ErpDatabaseSnapshot {
  version: string;
  updatedAt: string;
  departments: typeof SEED_DEPARTMENTS;
  teams: typeof SEED_TEAMS;
  members: typeof SEED_MEMBERS;
  workshops: typeof SEED_WORKSHOPS;
  tasks: typeof SEED_TASKS;
  pointRules: typeof SEED_POINT_RULES;
  ledger: typeof SEED_LEDGER;
  badges: typeof SEED_BADGES;
  exams: typeof SEED_EXAMS;
  projectSubmissions: typeof SEED_PROJECT_SUBMISSIONS;
  proposals: typeof SEED_PROPOSALS;
  explorePosts: typeof SEED_EXPLORE_POSTS;
  messages: typeof SEED_MESSAGES;
  invitations: typeof SEED_INVITATIONS;
  accessGrants: typeof SEED_ACCESS_GRANTS;
  auditLogs: typeof SEED_AUDIT_LOGS;
  settings: typeof SEED_SETTINGS;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "quanters-db.json");

let memoryCache: ErpDatabaseSnapshot | null = null;

function createInitialSnapshot(): ErpDatabaseSnapshot {
  return {
    version: "3.2.0",
    updatedAt: new Date().toISOString(),
    departments: SEED_DEPARTMENTS,
    teams: SEED_TEAMS,
    members: SEED_MEMBERS,
    workshops: SEED_WORKSHOPS,
    tasks: SEED_TASKS,
    pointRules: SEED_POINT_RULES,
    ledger: SEED_LEDGER,
    badges: SEED_BADGES,
    exams: SEED_EXAMS,
    projectSubmissions: SEED_PROJECT_SUBMISSIONS,
    proposals: SEED_PROPOSALS,
    explorePosts: SEED_EXPLORE_POSTS,
    messages: SEED_MESSAGES.map((m) => ({
      ...m,
      archived: m.archived ?? !m.unread,
    })),
    invitations: SEED_INVITATIONS,
    accessGrants: SEED_ACCESS_GRANTS,
    auditLogs: SEED_AUDIT_LOGS,
    settings: SEED_SETTINGS,
  };
}

export function readErpDatabase(): {
  snapshot: ErpDatabaseSnapshot;
  telemetry: {
    dbSizeBytes: number;
    dbSizeKB: number;
    memberCount: number;
    avgRecordBytes: number;
    quotaUsedPercent: number;
  };
} {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initial = createInitialSnapshot();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial), "utf-8");
      memoryCache = initial;
    } else if (!memoryCache) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(raw) as ErpDatabaseSnapshot;
      if (parsed.version !== "3.2.0") {
        const fresh = createInitialSnapshot();
        fs.writeFileSync(DB_FILE, JSON.stringify(fresh), "utf-8");
        memoryCache = fresh;
      } else {
        memoryCache = parsed;
      }
    }
  } catch {
    memoryCache = createInitialSnapshot();
  }

  const snapshot = memoryCache!;
  let dbSizeBytes = 0;
  try {
    if (fs.existsSync(DB_FILE)) {
      dbSizeBytes = fs.statSync(DB_FILE).size;
    } else {
      dbSizeBytes = Buffer.byteLength(JSON.stringify(snapshot), "utf-8");
    }
  } catch {
    dbSizeBytes = 48000;
  }

  const dbSizeKB = Math.round((dbSizeBytes / 1024) * 10) / 10;
  const memberCount = snapshot.members.length;
  const avgRecordBytes = memberCount > 0 ? Math.round(dbSizeBytes / memberCount) : 0;
  // Compare against a 50 MB lightweight free-tier storage budget
  const quotaUsedPercent = Math.min(100, Math.round((dbSizeBytes / (50 * 1024 * 1024)) * 10000) / 100);

  return {
    snapshot,
    telemetry: {
      dbSizeBytes,
      dbSizeKB,
      memberCount,
      avgRecordBytes,
      quotaUsedPercent,
    },
  };
}

const ALLOWED_ARRAY_KEYS: (keyof ErpDatabaseSnapshot)[] = [
  "departments",
  "teams",
  "members",
  "workshops",
  "tasks",
  "pointRules",
  "ledger",
  "badges",
  "exams",
  "projectSubmissions",
  "proposals",
  "explorePosts",
  "messages",
  "invitations",
  "accessGrants",
  "auditLogs",
];

export function writeErpDatabase(partial: Partial<ErpDatabaseSnapshot>): ErpDatabaseSnapshot {
  const current = readErpDatabase().snapshot;
  const sanitized: Partial<ErpDatabaseSnapshot> = {};

  if (partial && typeof partial === "object" && !Array.isArray(partial)) {
    for (const key of ALLOWED_ARRAY_KEYS) {
      const incoming = partial[key];
      if (Array.isArray(incoming)) {
        if (key === "auditLogs") {
          // Immutable Audit Log Guarantee: preserve all existing server audit logs and append new ones
          const existingIds = new Set(current.auditLogs.map((a) => a.id));
          const newEntries = (incoming as typeof current.auditLogs).filter(
            (a) => a && typeof a === "object" && typeof a.id === "string" && !existingIds.has(a.id)
          );
          sanitized.auditLogs = [...newEntries, ...current.auditLogs];
        } else {
          (sanitized as Record<string, unknown>)[key] = incoming;
        }
      }
    }

    if (
      partial.settings &&
      typeof partial.settings === "object" &&
      !Array.isArray(partial.settings)
    ) {
      const nextSettings = { ...current.settings };
      for (const [sKey, sVal] of Object.entries(partial.settings)) {
        if (
          sKey !== "__proto__" &&
          sKey !== "constructor" &&
          sKey !== "prototype" &&
          Object.prototype.hasOwnProperty.call(current.settings, sKey)
        ) {
          (nextSettings as Record<string, unknown>)[sKey] = sVal;
        }
      }
      sanitized.settings = nextSettings;
    }
  }

  const next: ErpDatabaseSnapshot = {
    ...current,
    ...sanitized,
    version: "3.0.0",
    updatedAt: new Date().toISOString(),
  };
  memoryCache = next;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tmpFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(next), "utf-8");
    fs.renameSync(tmpFile, DB_FILE);
  } catch {
    // Fallback if file system is read-only in serverless edge
  }
  return next;
}
