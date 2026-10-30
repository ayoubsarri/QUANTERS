"use client";

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

export function isNotificationSessionActive(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem("quanters-offline-cache-v10");
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Boolean(
      parsed &&
      parsed.isAuthenticated === true &&
      typeof parsed.currentMemberId === "string" &&
      parsed.currentMemberId.length > 0
    );
  } catch {
    return false;
  }
}

export async function clearAllSystemNotifications() {
  if (typeof window === "undefined") return;
  try {
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.getNotifications) {
        const notifs = await reg.getNotifications();
        notifs.forEach((n) => n.close());
      }
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: "CLEAR_NOTIFICATIONS" });
      }
    }
  } catch {
    // ignore
  }
}

export async function dispatchSystemNotification(payload: {
  title: string;
  body: string;
  priority?: string;
  url?: string;
}) {
  if (typeof window === "undefined") return;
  // Strictly prevent unauthenticated visitors or logged-out sessions from receiving system notifications
  if (!isNotificationSessionActive()) return;

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
