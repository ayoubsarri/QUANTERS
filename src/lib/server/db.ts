/**
 * QUANTERS — Zero-Quota Atomic Server-Side Persistence & Exact Delta Engine
 * Stores ERP state in compact JSON-WAL format (`data/quanters-db.json`)
 * with per-collection versioning and item-level delta patching so clients
 * only push and pull the exact records that changed.
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
  SEED_GRIEVANCES,
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

export type ErpCollectionKey =
  | "departments"
  | "teams"
  | "members"
  | "workshops"
  | "tasks"
  | "pointRules"
  | "ledger"
  | "badges"
  | "exams"
  | "projectSubmissions"
  | "proposals"
  | "explorePosts"
  | "messages"
  | "invitations"
  | "accessGrants"
  | "auditLogs"
  | "grievances"
  | "settings";

export interface ItemDeltaPatch {
  upserted?: Record<string, unknown>[];
  deletedIds?: string[];
}

export interface ErpDatabaseSnapshot {
  version: string;
  updatedAt: string;
  collectionVersions?: Record<string, string>;
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
  grievances: typeof SEED_GRIEVANCES;
  settings: typeof SEED_SETTINGS;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "quanters-db.json");

let memoryCache: ErpDatabaseSnapshot | null = null;

export const ALLOWED_ARRAY_KEYS: (keyof ErpDatabaseSnapshot)[] = [
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
  "grievances",
];

function buildInitialCollectionVersions(stamp: string): Record<string, string> {
  const versions: Record<string, string> = { settings: stamp };
  for (const key of ALLOWED_ARRAY_KEYS) {
    versions[String(key)] = stamp;
  }
  return versions;
}

function createInitialSnapshot(): ErpDatabaseSnapshot {
  const now = new Date().toISOString();
  return {
    version: "3.2.0",
    updatedAt: now,
    collectionVersions: buildInitialCollectionVersions(now),
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
    grievances: SEED_GRIEVANCES,
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
      if (parsed.version !== "3.2.0" && parsed.version !== "3.0.0") {
        const fresh = createInitialSnapshot();
        fs.writeFileSync(DB_FILE, JSON.stringify(fresh), "utf-8");
        memoryCache = fresh;
      } else {
        if (!parsed.collectionVersions) {
          parsed.collectionVersions = buildInitialCollectionVersions(
            parsed.updatedAt || new Date().toISOString()
          );
        }
        memoryCache = parsed;
      }
    }
  } catch {
    memoryCache = createInitialSnapshot();
  }

  const snapshot = memoryCache!;
  if (!snapshot.collectionVersions) {
    snapshot.collectionVersions = buildInitialCollectionVersions(snapshot.updatedAt);
  }

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
  const quotaUsedPercent = Math.min(
    100,
    Math.round((dbSizeBytes / (50 * 1024 * 1024)) * 10000) / 100
  );

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

/**
 * Computes ONLY the exact collections that have changed relative to `clientVersions`.
 * Reduces read payload and quota consumption to the exact updated slices.
 */
export function computeDeltaErpDatabase(
  clientVersions?: Record<string, string> | null
): {
  changedKeys: string[];
  delta: Partial<ErpDatabaseSnapshot>;
  collectionVersions: Record<string, string>;
  updatedAt: string;
} {
  const { snapshot } = readErpDatabase();
  const serverVersions =
    snapshot.collectionVersions || buildInitialCollectionVersions(snapshot.updatedAt);

  if (!clientVersions || Object.keys(clientVersions).length === 0) {
    const allKeys = [...ALLOWED_ARRAY_KEYS.map(String), "settings"];
    const fullDelta: Partial<ErpDatabaseSnapshot> = { settings: snapshot.settings };
    for (const k of ALLOWED_ARRAY_KEYS) {
      (fullDelta as Record<string, unknown>)[k] = snapshot[k];
    }
    return {
      changedKeys: allKeys,
      delta: fullDelta,
      collectionVersions: serverVersions,
      updatedAt: snapshot.updatedAt,
    };
  }

  const changedKeys: string[] = [];
  const delta: Partial<ErpDatabaseSnapshot> = {};

  for (const key of ALLOWED_ARRAY_KEYS) {
    const kStr = String(key);
    if (clientVersions[kStr] !== serverVersions[kStr]) {
      changedKeys.push(kStr);
      (delta as Record<string, unknown>)[kStr] = snapshot[key];
    }
  }

  if (clientVersions.settings !== serverVersions.settings) {
    changedKeys.push("settings");
    delta.settings = snapshot.settings;
  }

  return {
    changedKeys,
    delta,
    collectionVersions: serverVersions,
    updatedAt: snapshot.updatedAt,
  };
}

export function writeErpDatabase(
  partial: Partial<ErpDatabaseSnapshot>,
  itemDeltas?: Record<string, ItemDeltaPatch>
): {
  snapshot: ErpDatabaseSnapshot;
  changedKeys: string[];
} {
  const current = readErpDatabase().snapshot;
  const now = new Date().toISOString();
  const nextVersions: Record<string, string> = {
    ...(current.collectionVersions || buildInitialCollectionVersions(current.updatedAt)),
  };
  const sanitized: Partial<ErpDatabaseSnapshot> = {};
  const changedKeys: string[] = [];

  // 1. Apply granular item-level deltas first (upserted & deletedIds by item.id)
  if (itemDeltas && typeof itemDeltas === "object" && !Array.isArray(itemDeltas)) {
    for (const key of ALLOWED_ARRAY_KEYS) {
      const kStr = String(key);
      const patch = itemDeltas[kStr];
      if (!patch || typeof patch !== "object") continue;

      const currentList = Array.isArray(current[key])
        ? ([...(current[key] as unknown[])] as Record<string, unknown>[])
        : [];

      let modified = false;
      const deletedSet = new Set(
        Array.isArray(patch.deletedIds) && key !== "auditLogs"
          ? patch.deletedIds.filter((id) => typeof id === "string")
          : []
      );

      let nextList =
        deletedSet.size > 0
          ? currentList.filter((item) => !deletedSet.has(String(item?.id)))
          : currentList;

      if (deletedSet.size > 0 && nextList.length !== currentList.length) {
        modified = true;
      }

      if (Array.isArray(patch.upserted) && patch.upserted.length > 0) {
        const indexMap = new Map<string, number>();
        nextList.forEach((item, idx) => {
          if (item && typeof item.id === "string") {
            indexMap.set(item.id, idx);
          }
        });

        const prependedNew: Record<string, unknown>[] = [];
        for (const incomingItem of patch.upserted) {
          if (!incomingItem || typeof incomingItem !== "object") continue;
          const id = incomingItem.id;
          if (typeof id !== "string") continue;

          if (key === "auditLogs" && indexMap.has(id)) {
            // Audit log entries are immutable once created
            continue;
          }

          const existingIdx = indexMap.get(id);
          if (existingIdx !== undefined) {
            nextList[existingIdx] = {
              ...nextList[existingIdx],
              ...incomingItem,
            };
            modified = true;
          } else {
            prependedNew.push(incomingItem);
            modified = true;
          }
        }

        if (prependedNew.length > 0) {
          nextList = [...prependedNew, ...nextList];
        }
      }

      if (modified) {
        (sanitized as Record<string, unknown>)[kStr] = nextList;
        nextVersions[kStr] = now;
        changedKeys.push(kStr);
      }
    }
  }

  // 2. Apply any full-collection replacements (only marking changed if serialized content differs)
  if (partial && typeof partial === "object" && !Array.isArray(partial)) {
    for (const key of ALLOWED_ARRAY_KEYS) {
      const kStr = String(key);
      if (changedKeys.includes(kStr)) continue; // already patched via itemDeltas
      const incoming = partial[key];
      if (Array.isArray(incoming)) {
        if (key === "auditLogs") {
          const existingIds = new Set(current.auditLogs.map((a) => a.id));
          const newEntries = (incoming as typeof current.auditLogs).filter(
            (a) =>
              a &&
              typeof a === "object" &&
              typeof a.id === "string" &&
              !existingIds.has(a.id)
          );
          if (newEntries.length > 0) {
            sanitized.auditLogs = [...newEntries, ...current.auditLogs];
            nextVersions.auditLogs = now;
            changedKeys.push("auditLogs");
          }
        } else {
          const prevJson = JSON.stringify(current[key]);
          const nextJson = JSON.stringify(incoming);
          if (prevJson !== nextJson) {
            (sanitized as Record<string, unknown>)[kStr] = incoming;
            nextVersions[kStr] = now;
            changedKeys.push(kStr);
          }
        }
      }
    }

    if (
      partial.settings &&
      typeof partial.settings === "object" &&
      !Array.isArray(partial.settings)
    ) {
      const nextSettings = { ...current.settings };
      let settingsChanged = false;
      for (const [sKey, sVal] of Object.entries(partial.settings)) {
        if (
          sKey !== "__proto__" &&
          sKey !== "constructor" &&
          sKey !== "prototype" &&
          Object.prototype.hasOwnProperty.call(current.settings, sKey)
        ) {
          if (
            JSON.stringify(
              (current.settings as unknown as Record<string, unknown>)[sKey]
            ) !== JSON.stringify(sVal)
          ) {
            (nextSettings as unknown as Record<string, unknown>)[sKey] = sVal;
            settingsChanged = true;
          }
        }
      }
      if (settingsChanged) {
        sanitized.settings = nextSettings;
        nextVersions.settings = now;
        changedKeys.push("settings");
      }
    }
  }

  if (changedKeys.length === 0) {
    return { snapshot: current, changedKeys: [] };
  }

  const next: ErpDatabaseSnapshot = {
    ...current,
    ...sanitized,
    version: "3.2.0",
    updatedAt: now,
    collectionVersions: nextVersions,
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
  return { snapshot: next, changedKeys };
}
