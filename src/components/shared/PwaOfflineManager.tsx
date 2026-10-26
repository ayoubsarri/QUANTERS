"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCircle2, CloudOff, RefreshCw, Wifi, X } from "lucide-react";
import { useQuantersStore } from "@/lib/store/useQuantersStore";

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
  const {
    isOnline,
    pendingSyncCount,
    userLowDataMode,
    lastServerEtag,
    settings,
    messages,
    setOnlineStatus,
    hydrateFromLocalCache,
    saveToLocalCache,
    syncWithServer,
  } = useQuantersStore();

  const [reconnectedToast, setReconnectedToast] = useState(false);
  const [syncingNow, setSyncingNow] = useState(false);
  const [liveToast, setLiveToast] = useState<{
    title: string;
    body: string;
    url?: string;
  } | null>(null);

  const prevMessagesCountRef = useRef<number>(messages.length);

  // 1. Hydrate local cache & register Service Worker
  useEffect(() => {
    if (typeof window === "undefined") return;

    hydrateFromLocalCache();

    const manualOffline =
      window.localStorage.getItem("quanters_offline_mode_manual") === "1";
    setOnlineStatus(manualOffline ? false : navigator.onLine);

    // Register Offline-First Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => {
          const conn = (navigator as unknown as { connection?: { saveData?: boolean } })
            .connection;
          const saveData = Boolean(conn?.saveData) || userLowDataMode;
          if (!saveData && navigator.onLine && !manualOffline) {
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

    // Conditional ETag check respecting Client Cache TTL
    const ttlMs = (settings.clientCacheTtlMinutes || 15) * 60 * 1000;
    const lastCheck = Number(
      window.sessionStorage.getItem("quanters-last-etag-check") || "0"
    );
    if (navigator.onLine && !manualOffline && Date.now() - lastCheck > ttlMs) {
      window.sessionStorage.setItem("quanters-last-etag-check", String(Date.now()));
      const headers: Record<string, string> = {};
      if (lastServerEtag) {
        headers["If-None-Match"] = lastServerEtag;
      }
      fetch("/api/erp", { headers })
        .then(async (res) => {
          if (res.status === 304) return;
          if (res.ok) {
            const json = await res.json();
            if (json?.etag) {
              useQuantersStore.setState({ lastServerEtag: json.etag });
              saveToLocalCache();
            }
          }
        })
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Listen to network Online / Offline transitions & live notifications
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = async () => {
      window.localStorage.setItem("quanters_offline_mode_manual", "0");
      setOnlineStatus(true);
      setReconnectedToast(true);
      if (useQuantersStore.getState().pendingSyncCount > 0) {
        await syncWithServer(true);
      }
      setTimeout(() => setReconnectedToast(false), 3500);
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
  }, [setOnlineStatus, saveToLocalCache, syncWithServer]);

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

  // 4. Auto-save store changes to localStorage so offline refreshes never lose state
  useEffect(() => {
    if (typeof window === "undefined") return;
    const unsub = useQuantersStore.subscribe(() => {
      saveToLocalCache();
    });
    return () => unsub();
  }, [saveToLocalCache]);

  const handleManualFlush = async () => {
    setSyncingNow(true);
    await syncWithServer(true);
    setSyncingNow(false);
  };

  const handleGoOnlineFromBanner = async () => {
    try {
      window.localStorage.setItem("quanters_offline_mode_manual", "0");
    } catch {}
    setOnlineStatus(true);
    setReconnectedToast(true);
    if (pendingSyncCount > 0) {
      await syncWithServer(true);
    }
    setTimeout(() => setReconnectedToast(false), 3200);
  };

  if (isOnline && !reconnectedToast && pendingSyncCount === 0 && !liveToast) {
    return null;
  }

  return (
    <div className="fixed top-2.5 left-1/2 -translate-x-1/2 z-[180] px-3 w-full max-w-[440px] space-y-2 pointer-events-none">
      {liveToast && (
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
      )}

      {!isOnline ? (
        <div className="pointer-events-auto bg-[#06182C]/95 backdrop-blur-md text-white border border-amber-400/40 rounded-xl px-3.5 py-2 shadow-lg flex items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
              <CloudOff className="w-3.5 h-3.5" />
            </span>
            <div className="truncate">
              <div className="font-extrabold text-[11px] text-amber-200 leading-tight">
                Offline Mode Active
              </div>
              <div className="text-[10px] text-slate-300 truncate">
                {pendingSyncCount > 0
                  ? `${pendingSyncCount} action(s) saved locally · Auto-syncs when online`
                  : "Working from device cache · All screens available"}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleGoOnlineFromBanner}
            className="px-2 py-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 font-mono text-[10px] font-bold text-amber-200 shrink-0 cursor-pointer transition"
          >
            Reconnect
          </button>
        </div>
      ) : reconnectedToast ? (
        <div className="pointer-events-auto bg-emerald-950/95 backdrop-blur-md text-white border border-emerald-400/40 rounded-xl px-3.5 py-2 shadow-lg flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-bold text-[11px]">
              Back Online · Local offline changes synced
            </span>
          </div>
          <Wifi className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        </div>
      ) : pendingSyncCount > 0 ? (
        <div className="pointer-events-auto bg-[#06182C]/95 backdrop-blur-md text-white border border-sky-400/30 rounded-xl px-3.5 py-1.5 shadow-lg flex items-center justify-between gap-2 text-xs">
          <span className="text-[11px] font-semibold text-sky-200">
            Quota-Saver: {pendingSyncCount} batched change(s) queued
          </span>
          <button
            type="button"
            onClick={handleManualFlush}
            disabled={syncingNow}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1D63EB] hover:bg-blue-600 text-white text-[10.5px] font-bold cursor-pointer transition"
          >
            <RefreshCw className={`w-3 h-3 ${syncingNow ? "animate-spin" : ""}`} />
            <span>Sync Now</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
