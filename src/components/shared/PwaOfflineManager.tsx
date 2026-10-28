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

  // Dispatch custom in-app event so PwaOfflineManager shows a live toast banner
  window.dispatchEvent(
    new CustomEvent("quanters:live-notification", { detail: payload })
  );

  const prefs = loadNotificationPrefs();
  if (!prefs.pushEnabled) return;

  if ("Notification" in window && Notification.permission === "granted") {
    try {
      if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.ready;
        if (reg && reg.active) {
          reg.active.postMessage({
            type: "SHOW_NOTIFICATION",
            payload,
          });
          return;
        }
      }
      new Notification(payload.title, {
        body: payload.body,
        icon: "/icons/icon-192.png",
      });
    } catch {
      // Fallback to in-app toast only
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

  const [liveToast, setLiveToast] = useState<{
    title: string;
    body: string;
    url?: string;
  } | null>(null);

  const prevMessagesCountRef = useRef<number>(messages.length);

  // 1. Hydrate local cache, register Service Worker, and pull ONLY exact delta updates
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.removeItem("quanters_offline_mode_manual");
    } catch {}

    hydrateFromLocalCache();
    setOnlineStatus(navigator.onLine);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => {
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

    // Real-time Cloud Firestore listener + tab focus sync so new registrations appear live in Admin
    let unsubFirestoreFn: (() => void) | null = null;
    let isCancelled = false;
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

    const handleLiveNotif = (e: Event) => {
      const custom = e as CustomEvent<{
        title: string;
        body: string;
        url?: string;
      }>;
      if (custom.detail) {
        setLiveToast(custom.detail);
        setTimeout(() => {
          setLiveToast((curr) =>
            curr?.title === custom.detail.title ? null : curr
          );
        }, 4500);
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("quanters:live-notification", handleLiveNotif);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("quanters:live-notification", handleLiveNotif);
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

  if (!liveToast) {
    return null;
  }

  return (
    <div className="fixed top-2.5 left-1/2 -translate-x-1/2 z-[180] px-3 w-full max-w-[440px] space-y-2 pointer-events-none">
      <div
        onClick={() => {
          const target = liveToast.url || "/notifications";
          setLiveToast(null);
          router.push(target);
        }}
        role="button"
        tabIndex={0}
        className="pointer-events-auto bg-[#0B192E]/95 backdrop-blur-md text-white border border-[#38BDF8]/45 rounded-xl px-3.5 py-2.5 shadow-2xl flex items-start justify-between gap-2.5 text-xs cursor-pointer animate-rise"
      >
        <div className="flex items-start gap-2.5 min-w-0">
          <span className="w-7 h-7 rounded-lg bg-[#0284C7]/25 border border-[#38BDF8]/40 flex items-center justify-center text-[#7DD3FC] shrink-0 mt-0.5">
            <Bell className="w-3.5 h-3.5" />
          </span>
          <div className="min-w-0">
            <div className="font-display font-black text-xs text-white truncate">
              {liveToast.title}
            </div>
            <div className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">
              {liveToast.body}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setLiveToast(null);
          }}
          className="text-slate-400 hover:text-white p-0.5 cursor-pointer shrink-0"
          aria-label="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
