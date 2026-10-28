"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, X } from "lucide-react";
import { useQuantersStore } from "@/lib/store/useQuantersStore";
import { subscribeToErpStateFirestore } from "@/lib/firebase/auth";

export const OFFLINE_WARM_ROUTES = [
  "/",
  "/welcome",
  "/home",
  "/workshops",
  "/explore",
  "/badges",
  "/profile",
  "/checkin",
  "/exams",
  "/projects/submit",
  "/proposals",
  "/notifications",
  "/manager",
  "/onboarding",
];

export interface NotificationPrefs {
  pushEnabled: boolean;
  hrNotices: boolean;
  departmentTasks: boolean;
  workshopReminders: boolean;
  dailyQuizAndXp: boolean;
}

export const NOTIFICATION_PREFS_KEY = "quanters_notification_prefs_v1";

export function loadNotificationPrefs(): NotificationPrefs {
  if (typeof window === "undefined") {
    return {
      pushEnabled: true,
      hrNotices: true,
      departmentTasks: true,
      workshopReminders: true,
      dailyQuizAndXp: true,
    };
  }
  try {
    const raw = window.localStorage.getItem(NOTIFICATION_PREFS_KEY);
    if (raw) {
      return {
        pushEnabled: true,
        hrNotices: true,
        departmentTasks: true,
        workshopReminders: true,
        dailyQuizAndXp: true,
        ...JSON.parse(raw),
      };
    }
  } catch {
    // ignore
  }
  return {
    pushEnabled: true,
    hrNotices: true,
    departmentTasks: true,
    workshopReminders: true,
    dailyQuizAndXp: true,
  };
}

export async function dispatchSystemNotification(payload: {
  title: string;
  body: string;
  priority?: string;
  url?: string;
}) {
  if (typeof window === "undefined") return;

  const prefs = loadNotificationPrefs();
  if (!prefs.pushEnabled) return;

  if ("Notification" in window && Notification.permission === "granted") {
    try {
      const cleanTitle = payload.title || "QUANTERS";
      const cleanBody = payload.body || "New update in QUANTERS.";
      const targetUrl = payload.url || "/notifications";

      // 1. Trigger via Service Worker for native OS/Chrome/Safari integration (even when active)
      if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.ready;
        if (reg && reg.showNotification) {
          await reg.showNotification(cleanTitle, {
            body: cleanBody,
            icon: "/icons/icon-192.png",
            badge: "/icons/icon-96.png",
            tag: `quanters-${Date.now()}`,
            renotify: true,
            vibrate: [100, 50, 100],
            requireInteraction: payload.priority === "Action needed",
            data: { url: targetUrl },
          } as unknown as NotificationOptions);
          return;
        }
      }

      // 2. Fallback to direct Notification constructor
      const notif = new Notification(cleanTitle, {
        body: cleanBody,
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-96.png",
        tag: `quanters-${Date.now()}`,
        data: { url: targetUrl },
      });
      notif.onclick = () => {
        window.focus();
        if (targetUrl) {
          window.location.href = targetUrl;
        }
      };
    } catch {
      // Ignored
    }
  }
}

export function PwaOfflineManager() {
  const router = useRouter();
  const userLowDataMode = useQuantersStore((s) => s.userLowDataMode);
  const settings = useQuantersStore((s) => s.settings);
  const messages = useQuantersStore((s) => s.messages);
  const setOnlineStatus = useQuantersStore((s) => s.setOnlineStatus);
  const hydrateFromLocalCache = useQuantersStore((s) => s.hydrateFromLocalCache);
  const saveToLocalCache = useQuantersStore((s) => s.saveToLocalCache);
  const syncWithServer = useQuantersStore((s) => s.syncWithServer);
  const pullExactUpdatesFromServer = useQuantersStore((s) => s.pullExactUpdatesFromServer);

  const [showPermPrompt, setShowPermPrompt] = useState(false);
  const prevMessagesCountRef = useRef<number>(messages.length);

  // Check first-time permission prompt
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    try {
      const alreadyAsked = window.localStorage.getItem("quanters_perm_asked_v1");
      if (Notification.permission === "default" && !alreadyAsked) {
        const timer = setTimeout(() => {
          setShowPermPrompt(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

  const handleRequestPerm = async () => {
    setShowPermPrompt(false);
    try {
      window.localStorage.setItem("quanters_perm_asked_v1", "true");
      if ("Notification" in window) {
        const res = await Notification.requestPermission();
        if (res === "granted") {
          const prefs = loadNotificationPrefs();
          prefs.pushEnabled = true;
          window.localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(prefs));
          dispatchSystemNotification({
            title: "QUANTERS",
            body: "Notifications enabled. You will receive live club updates.",
            url: "/notifications",
          });
        }
      }
    } catch {}
  };

  const handleDismissPerm = () => {
    setShowPermPrompt(false);
    try {
      window.localStorage.setItem("quanters_perm_asked_v1", "dismissed");
    } catch {}
  };

  // 1. Hydrate local cache, register Service Worker, and pull ONLY exact delta updates
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.removeItem("quanters_offline_mode_manual");
    } catch {}

    hydrateFromLocalCache();
    setOnlineStatus(navigator.onLine);

    if ("serviceWorker" in navigator) {
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });

      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => {
          reg.update().catch(() => {});
          const conn = (navigator as unknown as { connection?: { saveData?: boolean } })
            .connection;
          const saveData = Boolean(conn?.saveData) || userLowDataMode;
          if (!saveData && navigator.onLine) {
            setTimeout(() => {
              reg.active?.postMessage({
                type: "WARM_ROUTES",
                routes: OFFLINE_WARM_ROUTES,
              });
            }, 1800);
          }
        })
        .catch(() => {});
    }

    // Fetch latest updates from /api/erp or Cloud Firestore on mount
    if (navigator.onLine) {
      window.sessionStorage.setItem("quanters-last-etag-check", String(Date.now()));
      pullExactUpdatesFromServer().catch(() => {});
    }

    // Real-time Cloud Firestore listener: only start when user is authenticated to preserve Spark quotas
    let unsubFirestoreFn: (() => void) | null = null;
    let isCancelled = false;
    const isAuth = useQuantersStore.getState().isAuthenticated;
    if (isAuth) {
      subscribeToErpStateFirestore((cloudData) => {
        // Ingest directly into store WITHOUT triggering pull or write loop!
        if (cloudData && typeof cloudData === "object") {
          useQuantersStore.getState().applyIncomingCloudSnapshot(cloudData);
        }
      }).then((fn) => {
        if (isCancelled && fn) {
          fn();
        } else {
          unsubFirestoreFn = fn;
        }
      });
    }

    let lastFocusCheck = Date.now();
    const handleWindowFocus = () => {
      const now = Date.now();
      // Quota-friendly: only check server on focus if at least 5 minutes have elapsed
      if (navigator.onLine && now - lastFocusCheck > 300_000) {
        lastFocusCheck = now;
        pullExactUpdatesFromServer().catch(() => {});
      }
    };
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      isCancelled = true;
      if (unsubFirestoreFn) unsubFirestoreFn();
      window.removeEventListener("focus", handleWindowFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Silently auto-sync delta updates when connection returns
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = async () => {
      setOnlineStatus(true);
      if (useQuantersStore.getState().pendingSyncCount > 0) {
        await syncWithServer(true);
      } else {
        await pullExactUpdatesFromServer();
      }
    };

    const handleOffline = () => {
      setOnlineStatus(false);
      saveToLocalCache();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [
    setOnlineStatus,
    saveToLocalCache,
    syncWithServer,
    pullExactUpdatesFromServer,
  ]);

  // 3. Watch store messages for newly sent dispatches and notify
  useEffect(() => {
    if (messages.length > prevMessagesCountRef.current) {
      const newest = messages[0];
      if (newest && newest.unread) {
        dispatchSystemNotification({
          title: newest.title,
          body: newest.body,
          priority: newest.priority,
          url: "/notifications",
        });
      }
    }
    prevMessagesCountRef.current = messages.length;
  }, [messages]);

  // 4. Persist local data mutations to localStorage & auto-sync to Server / Cloud Firestore
  useEffect(() => {
    if (typeof window === "undefined") return;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const DATA_KEYS = [
      "departments",
      "teams",
      "members",
      "invitations",
      "workshops",
      "workshopCategories",
      "tasks",
      "pointRules",
      "ledger",
      "badges",
      "badgeCategories",
      "exams",
      "examCompletions",
      "projectSubmissions",
      "projectCategories",
      "proposals",
      "explorePosts",
      "dailyQuizzes",
      "dailyQuotes",
      "messages",
      "accessGrants",
      "auditLogs",
      "grievances",
      "settings",
    ] as const;

    const unsub = useQuantersStore.subscribe((state, prevState) => {
      // If lastSyncedAt or lastServerEtag changed in this set(), it came from a server/cloud pull/push
      if (
        state.lastSyncedAt !== prevState.lastSyncedAt ||
        state.lastServerEtag !== prevState.lastServerEtag
      ) {
        return;
      }

      const dataMutated = DATA_KEYS.some((k) => state[k] !== prevState[k]);
      const authMutated =
        state.isAuthenticated !== prevState.isAuthenticated ||
        state.currentMemberId !== prevState.currentMemberId ||
        state.activeAdminRole !== prevState.activeAdminRole;

      if (dataMutated || authMutated) {
        saveToLocalCache();
      }

      if (dataMutated) {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          syncWithServer(true).catch(() => {});
        }, 250);
      }
    });
    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      unsub();
    };
  }, [saveToLocalCache, syncWithServer]);

  if (showPermPrompt) {
    return (
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[200] px-3 w-full max-w-[400px]">
        <div className="bg-[#0B192E]/95 backdrop-blur-md text-white border border-[#38BDF8]/40 rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-3 animate-rise">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-8 h-8 rounded-xl bg-[#0284C7]/25 border border-[#38BDF8]/40 flex items-center justify-center text-[#7DD3FC] shrink-0">
              <Bell className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <div className="font-extrabold text-xs text-white">Enable Notifications</div>
              <div className="text-[10px] text-slate-300 truncate">Receive instant workshop & task alerts</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleRequestPerm}
              className="h-7 px-3 rounded-lg bg-gradient-to-r from-[#0284C7] to-[#00E5FF] text-[#051326] text-[11px] font-black cursor-pointer active:scale-95 shadow-sm"
            >
              Enable
            </button>
            <button
              type="button"
              onClick={handleDismissPerm}
              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center cursor-pointer"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
