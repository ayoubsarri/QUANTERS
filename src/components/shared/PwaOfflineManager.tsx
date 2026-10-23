"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, CloudOff, RefreshCw, Wifi } from "lucide-react";
import { useQuantersStore } from "@/lib/store/useQuantersStore";

const OFFLINE_WARM_ROUTES = [
  "/home",
  "/workshops",
  "/explore",
  "/badges",
  "/profile",
  "/checkin",
  "/exams",
  "/proposals",
  "/notifications",
  "/manager",
];

export function PwaOfflineManager() {
  const {
    isOnline,
    pendingSyncCount,
    userLowDataMode,
    lastServerEtag,
    settings,
    setOnlineStatus,
    hydrateFromLocalCache,
    saveToLocalCache,
    syncWithServer,
  } = useQuantersStore();

  const [reconnectedToast, setReconnectedToast] = useState(false);
  const [syncingNow, setSyncingNow] = useState(false);

  // 1. Hydrate local cache & register Service Worker
  useEffect(() => {
    if (typeof window === "undefined") return;

    hydrateFromLocalCache();
    setOnlineStatus(navigator.onLine);

    // Register Offline-First Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => {
          // Warm core routes in background when on normal connection
          const conn = (navigator as unknown as { connection?: { saveData?: boolean } })
            .connection;
          const saveData = Boolean(conn?.saveData) || userLowDataMode;
          if (!saveData && navigator.onLine) {
            setTimeout(() => {
              reg.active?.postMessage({
                type: "WARM_ROUTES",
                routes: OFFLINE_WARM_ROUTES,
              });
            }, 2500);
          }
        })
        .catch(() => {
          // Ignore SW registration error in restricted environments
        });
    }

    // Conditional ETag check respecting Client Cache TTL (Quota-Saver)
    const ttlMs = (settings.clientCacheTtlMinutes || 15) * 60 * 1000;
    const lastCheck = Number(
      window.sessionStorage.getItem("quanters-last-etag-check") || "0"
    );
    if (navigator.onLine && Date.now() - lastCheck > ttlMs) {
      window.sessionStorage.setItem("quanters-last-etag-check", String(Date.now()));
      const headers: Record<string, string> = {};
      if (lastServerEtag) {
        headers["If-None-Match"] = lastServerEtag;
      }
      fetch("/api/erp", { headers })
        .then(async (res) => {
          if (res.status === 304) {
            // 0 KB transferred — local cache is already up-to-date!
            return;
          }
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

  // 2. Listen to network Online / Offline transitions & auto-replay queued actions
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = async () => {
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

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [setOnlineStatus, saveToLocalCache, syncWithServer]);

  // 3. Auto-save store changes to localStorage so offline refreshes never lose state
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

  if (isOnline && !reconnectedToast && pendingSyncCount === 0) {
    return null;
  }

  return (
    <div className="fixed top-2.5 left-1/2 -translate-x-1/2 z-[180] px-3 w-full max-w-[440px] pointer-events-none">
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
                  ? `${pendingSyncCount} action(s) saved locally · Will auto-sync when online`
                  : "Working from device cache · All screens available"}
              </div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-white/10 font-mono text-[10px] font-bold text-amber-300 shrink-0">
            LOCAL
          </span>
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
