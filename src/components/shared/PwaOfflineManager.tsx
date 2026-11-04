"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, X } from "lucide-react";
import { useQuantersStore } from "@/lib/store/useQuantersStore";
import { subscribeToErpStateFirestore } from "@/lib/firebase/auth";

// On-demand route caching via Service Worker runtime stale-while-revalidate.
// Heavy routes are cached when visited, preserving hosting bandwidth quota (QUOTA-01).
export const OFFLINE_WARM_ROUTES: string[] = [];

export {
  type NotificationPrefs,
  NOTIFICATION_PREFS_KEY,
  loadNotificationPrefs,
  dispatchSystemNotification,
} from "@/lib/utils/notifications";
import { dispatchSystemNotification, loadNotificationPrefs, NOTIFICATION_PREFS_KEY } from "@/lib/utils/notifications";

export function PwaOfflineManager() {
  const router = useRouter();
  const isAuthenticated = useQuantersStore((s) => s.isAuthenticated);
  const currentMemberId = useQuantersStore((s) => s.currentMemberId);
  const members = useQuantersStore((s) => s.members);
  const userLowDataMode = useQuantersStore((s) => s.userLowDataMode);
  const activeLanguage = useQuantersStore((s) => s.activeLanguage);
  const settings = useQuantersStore((s) => s.settings);
  const messages = useQuantersStore((s) => s.messages);
  const setOnlineStatus = useQuantersStore((s) => s.setOnlineStatus);
  const hydrateFromLocalCache = useQuantersStore((s) => s.hydrateFromLocalCache);
  const saveToLocalCache = useQuantersStore((s) => s.saveToLocalCache);
  const syncWithServer = useQuantersStore((s) => s.syncWithServer);
  const pullExactUpdatesFromServer = useQuantersStore((s) => s.pullExactUpdatesFromServer);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dir = activeLanguage === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = activeLanguage;
    }
  }, [activeLanguage]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).__QUANTERS_STORE__ = useQuantersStore;
    }
  }, []);

  const [showPermPrompt, setShowPermPrompt] = useState(false);
  const prevMessagesCountRef = useRef<number>(messages.length);

  // Check first-time permission prompt (STRICTLY for authenticated admitted club members only)
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (!isAuthenticated || !currentMemberId) {
      setShowPermPrompt(false);
      return;
    }

    // Suppress notification banner if user is pending admission approval
    const currentMember = members.find((m) => m.id === currentMemberId);
    const isPending = Boolean(
      currentMember &&
      (currentMember.status === "Pending" ||
       (settings.onboardingAutoApprove === false &&
        !currentMember.onboardingTicks?.hrApproved &&
        currentMember.status !== "Active" &&
        currentMember.status !== "Alumni"))
    );

    if (isPending) {
      setShowPermPrompt(false);
      return;
    }

    try {
      const alreadyAsked = window.localStorage.getItem("quanters_perm_asked_v1");
      if (Notification.permission === "default" && !alreadyAsked) {
        const timer = setTimeout(() => {
          setShowPermPrompt(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, [isAuthenticated, currentMemberId, members, settings.onboardingAutoApprove]);

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
          if (isAuthenticated && currentMemberId) {
            dispatchSystemNotification({
              title: "QUANTERS",
              body: "Notifications enabled. You will receive live club updates.",
              url: "/notifications",
            });
          }
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
        })
        .catch(() => {});
    }

    // Fetch latest updates from /api/erp or Cloud Firestore on mount
    if (navigator.onLine) {
      window.sessionStorage.setItem("quanters-last-etag-check", String(Date.now()));
      pullExactUpdatesFromServer().catch(() => {});
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
      window.removeEventListener("focus", handleWindowFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 1b. Reactive Cloud Firestore real-time listener (starts as soon as authenticated)
  useEffect(() => {
    if (typeof window === "undefined" || !isAuthenticated) return;
    let unsubFirestoreFn: (() => void) | null = null;
    let isCancelled = false;

    // Pull fresh state on auth transition
    pullExactUpdatesFromServer().catch(() => {});

    subscribeToErpStateFirestore((cloudData) => {
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

    return () => {
      isCancelled = true;
      if (unsubFirestoreFn) unsubFirestoreFn();
    };
  }, [isAuthenticated, pullExactUpdatesFromServer]);

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

  // 3. Watch store messages for newly sent dispatches and notify (Authenticated and target-scoped only)
  useEffect(() => {
    if (!isAuthenticated || !currentMemberId) {
      prevMessagesCountRef.current = messages.length;
      return;
    }
    if (messages.length > prevMessagesCountRef.current) {
      const newest = messages[0];
      if (newest && newest.unread) {
        const currentMember = members.find((m) => m.id === currentMemberId);
        if (currentMember) {
          const scope = (newest.recipientScope || "").toLowerCase();
          const isTargetRecipient =
            scope.includes("everyone") ||
            scope.includes("all members") ||
            scope.includes("all active") ||
            scope.includes("whole club") ||
            (newest.targetMemberId ? newest.targetMemberId === currentMember.id : false) ||
            (newest.targetDepartmentId ? newest.targetDepartmentId === currentMember.departmentId : false) ||
            (newest.targetTeamId && currentMember.teamId ? newest.targetTeamId === currentMember.teamId : false) ||
            (scope.includes("trainee") && currentMember.status === "Trainee");

          if (isTargetRecipient) {
            dispatchSystemNotification({
              title: newest.title,
              body: newest.body,
              priority: newest.priority,
              url: "/notifications",
            });
          }
        }
      }
    }
    prevMessagesCountRef.current = messages.length;
  }, [messages, isAuthenticated, currentMemberId, members]);

  // 4. Persist auth session changes to local cache (mutations are synced directly by store actions)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const unsub = useQuantersStore.subscribe((state, prevState) => {
      const authMutated =
        state.isAuthenticated !== prevState.isAuthenticated ||
        state.currentMemberId !== prevState.currentMemberId ||
        state.activeAdminRole !== prevState.activeAdminRole;

      if (authMutated) {
        saveToLocalCache();
      }
    });
    return () => {
      unsub();
    };
  }, [saveToLocalCache]);

  if (showPermPrompt) {
    return (
      <div className="fixed bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-[90] px-3 w-full max-w-[420px] pointer-events-none transition-all duration-300">
        <div className="bg-[#0B192E]/95 backdrop-blur-xl text-white border border-[#38BDF8]/40 rounded-2xl p-3 shadow-[0_16px_40px_rgba(2,132,199,0.35)] flex items-center justify-between gap-3 animate-rise pointer-events-auto">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-8 h-8 rounded-xl bg-[#0284C7]/25 border border-[#38BDF8]/40 flex items-center justify-center text-[#7DD3FC] shrink-0">
              <Bell className="w-4 h-4 animate-bounce" />
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
