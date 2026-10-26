"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  CheckCheck,
  CheckCircle2,
  CloudOff,
  ExternalLink,
  Inbox,
  Mail,
  Orbit,
  RefreshCw,
  RotateCcw,
  Search,
  Settings2,
  ShieldAlert,
  Sparkles,
  Users,
  Wifi,
  X,
} from "lucide-react";
import { MobileAppShell } from "@/components/mobile/MobileAppShell";
import { useQuantersStore } from "@/lib/store/useQuantersStore";
import { ClubMessage, NotificationPriority } from "@/lib/types/erp";
import {
  dispatchSystemNotification,
  loadNotificationPrefs,
  NOTIFICATION_PREFS_KEY,
  NotificationPrefs,
  OFFLINE_WARM_ROUTES,
} from "@/components/shared/PwaOfflineManager";

type FilterTab = "Inbox" | "HR Notices" | "Archived";

const PRIORITY_BADGE_STYLES: Record<
  NotificationPriority,
  { bg: string; text: string }
> = {
  "Action needed": {
    bg: "#FEE2E2",
    text: "#DC2626",
  },
  "Official notice": {
    bg: "#FEF3C7",
    text: "#B45309",
  },
  Info: {
    bg: "#F0F6FF",
    text: "#0284C7",
  },
  Message: {
    bg: "#F0F6FF",
    text: "#182C4E",
  },
};

export default function NotificationsPage() {
  const router = useRouter();
  const messages = useQuantersStore((s) => s.messages);
  const markMessageRead = useQuantersStore((s) => s.markMessageRead);
  const unarchiveMessage = useQuantersStore((s) => s.unarchiveMessage);
  const archiveAllReadMessages = useQuantersStore(
    (s) => s.archiveAllReadMessages
  );
  const isOnline = useQuantersStore((s) => s.isOnline);
  const setOnlineStatus = useQuantersStore((s) => s.setOnlineStatus);
  const saveToLocalCache = useQuantersStore((s) => s.saveToLocalCache);
  const syncWithServer = useQuantersStore((s) => s.syncWithServer);

  const [activeTab, setActiveTab] = useState<FilterTab>("Inbox");
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null
  );
  const [justArchivedBanner, setJustArchivedBanner] = useState<string | null>(
    null
  );
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>({
    pushEnabled: true,
    hrNotices: true,
    departmentTasks: true,
    workshopReminders: true,
    dailyQuizAndXp: true,
  });
  const [browserPerm, setBrowserPerm] = useState<string>("default");
  const [cachingOffline, setCachingOffline] = useState(false);

  useEffect(() => {
    setNotifPrefs(loadNotificationPrefs());
    if (typeof window !== "undefined" && "Notification" in window) {
      setBrowserPerm(Notification.permission);
    }
  }, []);

  const updatePref = (key: keyof NotificationPrefs, value: boolean) => {
    const next = { ...notifPrefs, [key]: value };
    setNotifPrefs(next);
    try {
      window.localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(next));
    } catch {}
  };

  const handleRequestPushPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      updatePref("pushEnabled", true);
      setJustArchivedBanner("In-App Notifications enabled on this device");
      return;
    }
    try {
      const perm = await Notification.requestPermission();
      setBrowserPerm(perm);
      updatePref("pushEnabled", perm === "granted");
      if (perm === "granted") {
        await dispatchSystemNotification({
          title: "QUANTERS Push Notifications Enabled",
          body: "You will now receive instant alerts for workshops, tasks, and HR notices.",
          priority: "Info",
          url: "/notifications",
        });
      }
    } catch {
      updatePref("pushEnabled", true);
    }
  };

  const handleSendTestAlert = async () => {
    await dispatchSystemNotification({
      title: "QUANTA Live Dispatch Test",
      body: "Push notifications & offline sync are active on your device.",
      priority: "Info",
      url: "/notifications",
    });
    setJustArchivedBanner("Test notification dispatched!");
  };

  const handleWarmOfflineCache = async () => {
    setCachingOffline(true);
    saveToLocalCache();
    try {
      if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.ready;
        reg.active?.postMessage({
          type: "WARM_ROUTES",
          routes: OFFLINE_WARM_ROUTES,
        });
      }
    } catch {}
    setTimeout(() => {
      setCachingOffline(false);
      setJustArchivedBanner(
        `Offline cache updated (${OFFLINE_WARM_ROUTES.length} screens cached on device)`
      );
    }, 600);
  };

  const unreadCount = messages.filter((m) => !m.archived && m.unread).length;
  const archivedCount = messages.filter((m) => m.archived || !m.unread).length;

  const selectedMessage =
    messages.find((m) => m.id === selectedMessageId) || null;

  const filteredMessages = messages.filter((msg) => {
    const matchesTab =
      activeTab === "Inbox"
        ? !msg.archived && msg.unread
        : activeTab === "HR Notices"
        ? msg.senderRole === "HR" || msg.senderLabel.includes("HR")
        : Boolean(msg.archived || !msg.unread);

    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      msg.title.toLowerCase().includes(q) ||
      msg.body.toLowerCase().includes(q) ||
      msg.senderLabel.toLowerCase().includes(q);

    return matchesTab && matchesSearch;
  });

  const handleOpenMessage = (msg: ClubMessage) => {
    const wasUnread = msg.unread || !msg.archived;
    markMessageRead(msg.id);
    setSelectedMessageId(msg.id);
    if (wasUnread) {
      setJustArchivedBanner(`"${msg.title}" — Read & Moved to Archive`);
    }
  };

  const handleMarkAllReadAndArchive = () => {
    messages.forEach((m) => {
      if (m.unread || !m.archived) {
        markMessageRead(m.id);
      }
    });
    archiveAllReadMessages();
    setJustArchivedBanner("All messages marked as read & moved to Archive");
  };

  const handleRestoreToInbox = (
    msgId: string,
    msgTitle: string,
    e?: React.MouseEvent
  ) => {
    if (e) e.stopPropagation();
    unarchiveMessage(msgId);
    setJustArchivedBanner(`Restored "${msgTitle}" back to Inbox`);
  };

  const renderSenderIcon = (msg: ClubMessage, compact = false) => {
    const sizeClass = compact ? "w-7 h-7 rounded-lg" : "w-9 h-9 rounded-lg";
    const iconSize = compact ? "w-3.5 h-3.5" : "w-4 h-4";
    if (msg.senderRole === "HR") {
      return (
        <div
          className={`${sizeClass} bg-[#F0F6FF] border border-[#D5E3F5] flex items-center justify-center text-[#182C4E] shrink-0`}
        >
          <Users className={iconSize} />
        </div>
      );
    }
    if (msg.senderRole === "Scientific Team") {
      return (
        <div
          className={`${sizeClass} bg-[#F0F6FF] border border-[#D5E3F5] flex items-center justify-center text-[#0284C7] shrink-0`}
        >
          <Orbit className={iconSize} />
        </div>
      );
    }
    return (
      <div
        className={`${sizeClass} bg-[#F0F6FF] border border-[#D5E3F5] flex items-center justify-center text-[#0284C7] shrink-0`}
      >
        <Sparkles className={iconSize} />
      </div>
    );
  };

  return (
    <MobileAppShell>
      <div className="flex-1 flex flex-col px-4 sm:px-5 pt-2 pb-6 animate-rise">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <p className="text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-[#0284C7]">
              MEMBER DISPATCHES
            </p>
            <h1 className="font-display text-xl font-black text-[#0F1E36] tracking-tight leading-tight">
              Notifications &amp; Messages
            </h1>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5">
              Reading a message automatically moves it to Archived
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleMarkAllReadAndArchive}
              title="Mark all read and move to Archive"
              className="px-2.5 py-1.5 rounded-lg bg-[#F0F6FF] border border-[#D5E3F5] text-[10px] font-bold text-[#182C4E] hover:bg-[#E2EEFC] active:scale-[0.98] flex items-center gap-1 transition cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5 text-[#0284C7]" />
              <span>
                {unreadCount > 0
                  ? "Mark All Read & Archive"
                  : "Archive All Read"}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setSettingsOpen((v) => !v)}
              className={`w-8 h-8 rounded-lg border flex items-center justify-center active:scale-[0.98] transition cursor-pointer ${
                settingsOpen
                  ? "bg-[#182C4E] text-white border-[#2B4875]"
                  : "bg-white border-slate-200/90 text-slate-600 hover:text-[#182C4E]"
              }`}
              aria-label="Notification and offline settings"
              title="Notifications & Offline Mode Settings"
            >
              <Settings2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200/90 flex items-center justify-center text-slate-600 hover:text-[#182C4E] active:scale-[0.98] transition cursor-pointer"
              aria-label="Search messages"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Compact Status & Config Strip */}
        <div className="mb-3 p-2.5 rounded-xl bg-white border border-slate-200/90 flex items-center justify-between gap-2 text-xs shadow-2xs">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                isOnline ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
            <span className="font-bold text-[#0F1E36] truncate">
              {isOnline ? "Online · Push & Offline Ready" : "Offline Mode Active"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleSendTestAlert}
              className="px-2.5 py-1 rounded-lg bg-[#F0F6FF] hover:bg-[#E2EEFC] border border-[#D5E3F5] text-[10.5px] font-bold text-[#182C4E] transition cursor-pointer"
            >
              Test Alert
            </button>
            <button
              type="button"
              onClick={() => setSettingsOpen((v) => !v)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-[10.5px] font-bold text-slate-700 transition cursor-pointer"
            >
              {settingsOpen ? "Hide Config" : "Configure"}
            </button>
          </div>
        </div>

        {/* Collapsible Notifications & Offline Mode Configuration Panel */}
        {settingsOpen && (
          <div className="mb-3.5 p-3.5 rounded-xl bg-white border border-[#2B4875]/35 shadow-sm space-y-3 animate-rise">
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div>
                <h2 className="font-display text-xs font-black uppercase tracking-wider text-[#0F1E36]">
                  Notifications &amp; Offline Mode
                </h2>
                <p className="text-[11px] text-slate-500">
                  Manage push alerts and local offline app caching
                </p>
              </div>
              <button
                type="button"
                onClick={handleRequestPushPermission}
                className="px-2.5 py-1 rounded-lg bg-[#182C4E] text-white text-[10.5px] font-bold cursor-pointer"
              >
                {browserPerm === "granted"
                  ? "Push Active"
                  : "Enable Push Alerts"}
              </button>
            </div>

            {/* Channel Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
              {(
                [
                  { key: "hrNotices", label: "Official HR & Club Notices" },
                  { key: "departmentTasks", label: "Department & Task Alerts" },
                  {
                    key: "workshopReminders",
                    label: "Workshop & Check-In Alerts",
                  },
                  { key: "dailyQuizAndXp", label: "Daily Quiz & XP Milestones" },
                ] as const
              ).map((item) => (
                <label
                  key={item.key}
                  className="p-2 rounded-lg bg-[#F8FAFC] border border-slate-200/80 flex items-center justify-between gap-2 cursor-pointer select-none"
                >
                  <span className="font-semibold text-slate-700 text-[11px]">
                    {item.label}
                  </span>
                  <input
                    type="checkbox"
                    checked={notifPrefs[item.key]}
                    onChange={(e) => updatePref(item.key, e.target.checked)}
                    className="w-3.5 h-3.5 accent-[#182C4E] rounded cursor-pointer"
                  />
                </label>
              ))}
            </div>

            {/* Offline Mode & Cache Controls */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <Wifi className="w-4 h-4 text-emerald-600" />
                ) : (
                  <CloudOff className="w-4 h-4 text-amber-600" />
                )}
                <span className="text-[11px] font-bold text-slate-700">
                  {isOnline
                    ? `${OFFLINE_WARM_ROUTES.length} screens cached for offline use`
                    : "Working offline from device storage"}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleWarmOfflineCache}
                  disabled={cachingOffline}
                  className="px-2.5 py-1 rounded-lg bg-[#F0F6FF] border border-[#D5E3F5] text-[10.5px] font-bold text-[#182C4E] inline-flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw
                    className={`w-3 h-3 ${cachingOffline ? "animate-spin" : ""}`}
                  />
                  <span>Refresh Cache</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const next = !isOnline;
                    setOnlineStatus(next);
                    try {
                      window.localStorage.setItem(
                        "quanters_offline_mode_manual",
                        next ? "0" : "1"
                      );
                    } catch {}
                    if (next) {
                      syncWithServer(true);
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold border transition cursor-pointer ${
                    !isOnline
                      ? "bg-amber-500 text-white border-amber-600"
                      : "bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  {!isOnline ? "Switch to Online" : "Simulate Offline"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search Input */}
        {searchOpen && (
          <div className="mb-3 relative animate-rise">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notifications or HR messages..."
              className="w-full pl-9 pr-8 py-2 rounded-lg bg-white border border-slate-200/90 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#182C4E]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Filter Tabs: Inbox | HR Notices | Archived */}
        <div className="flex items-center gap-1.5 mb-3.5 overflow-x-auto pb-0.5">
          {(
            [
              { key: "Inbox" as const, label: `Inbox (${unreadCount})` },
              { key: "HR Notices" as const, label: "HR Notices" },
              { key: "Archived" as const, label: `Archived (${archivedCount})` },
            ] as const
          ).map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold active:scale-[0.98] transition-all whitespace-nowrap cursor-pointer ${
                  active
                    ? "bg-gradient-to-b from-[#182C4E] to-[#101F38] text-white border border-[#2B4875]/60 shadow-2xs"
                    : "bg-white text-slate-600 border border-slate-200/90 hover:text-[#182C4E]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Compact Auto-Archive Status Bar */}
        {justArchivedBanner && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-[#F0F6FF] border border-[#D5E3F5] flex items-center justify-between gap-2 text-[11px] font-bold text-[#182C4E] animate-rise">
            <div className="flex items-center gap-1.5 min-w-0">
              <Check className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
              <span className="leading-snug">{justArchivedBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setJustArchivedBanner(null)}
              className="text-slate-500 hover:text-[#182C4E] shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Messages List */}
        <div className="space-y-2.5">
          {filteredMessages.length === 0 ? (
            <div className="p-6 rounded-xl bg-white border border-slate-200/90 text-center space-y-2">
              {activeTab === "Inbox" ? (
                <>
                  <Inbox className="w-8 h-8 text-[#0284C7] mx-auto" />
                  <p className="text-sm font-black text-[#0F1E36]">
                    Inbox Zero — All caught up!
                  </p>
                  <p className="text-xs text-slate-500">
                    Read notifications have been automatically moved to{" "}
                    <button
                      type="button"
                      onClick={() => setActiveTab("Archived")}
                      className="text-[#182C4E] font-bold underline cursor-pointer"
                    >
                      Archived ({archivedCount})
                    </button>
                    .
                  </p>
                </>
              ) : (
                <>
                  <Bell className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">
                    No notifications in this tab
                  </p>
                </>
              )}
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const badgeStyle =
                PRIORITY_BADGE_STYLES[msg.priority] ||
                PRIORITY_BADGE_STYLES.Info;
              const isArchivedOrRead = Boolean(msg.archived || !msg.unread);

              if (isArchivedOrRead) {
                /* Small, Compact Archived / Read Card */
                return (
                  <div
                    key={msg.id}
                    onClick={() => handleOpenMessage(msg)}
                    className="p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200/90 hover:border-[#2B4875]/40 active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-2.5">
                      {renderSenderIcon(msg, true)}
                      <div className="flex-1 min-w-0">
                        {/* Compact single-line header */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-extrabold text-[#0F1E36]">
                              {msg.title}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-500">
                              · {msg.senderLabel}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10px] font-mono text-slate-400">
                              {msg.timeAgo}
                            </span>
                            <button
                              type="button"
                              onClick={(e) =>
                                handleRestoreToInbox(msg.id, msg.title, e)
                              }
                              className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-bold text-[#182C4E] hover:bg-[#F0F6FF] active:scale-[0.98] transition inline-flex items-center gap-1 cursor-pointer"
                            >
                              <RotateCcw className="w-2.5 h-2.5 text-[#0284C7]" />
                              <span>Restore</span>
                            </button>
                          </div>
                        </div>

                        {/* Concise 1-line snippet */}
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 leading-snug">
                          {msg.body}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }

              /* Active Unread Message Card */
              return (
                <div
                  key={msg.id}
                  onClick={() => handleOpenMessage(msg)}
                  className="p-3.5 rounded-xl bg-white border border-[#2B4875]/40 ring-1 ring-[#182C4E]/10 hover:border-[#182C4E] active:scale-[0.99] transition-all cursor-pointer shadow-2xs"
                >
                  <div className="flex items-start gap-3">
                    {renderSenderIcon(msg)}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-black text-[#0F1E36]">
                            {msg.senderLabel}
                          </span>
                          <span
                            style={{
                              backgroundColor: badgeStyle.bg,
                              color: badgeStyle.text,
                            }}
                            className="px-2 py-0.5 rounded-md text-[10px] font-extrabold leading-tight border border-black/5"
                          >
                            {msg.priority}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[11px] font-medium text-slate-400">
                            {msg.timeAgo}
                          </span>
                          <span
                            className="w-2 h-2 rounded-full bg-[#0284C7]"
                            aria-label="Unread"
                          />
                        </div>
                      </div>

                      <h3 className="text-sm font-black text-[#0F1E36] mt-1 leading-snug">
                        {msg.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                        {msg.body}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-[100] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 pb-16 sm:pb-6">
          <div
            data-modal="true"
            role="dialog"
            aria-modal="true"
            className="w-full max-w-[420px] max-h-[76dvh] sm:max-h-[82dvh] overflow-y-auto bg-white rounded-xl p-4 shadow-2xl border border-slate-200/90 space-y-3.5 animate-rise"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                {renderSenderIcon(selectedMessage)}
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-extrabold text-[#0F1E36]">
                      {selectedMessage.senderLabel}
                    </span>
                    <span
                      style={{
                        backgroundColor:
                          PRIORITY_BADGE_STYLES[selectedMessage.priority].bg,
                        color:
                          PRIORITY_BADGE_STYLES[selectedMessage.priority].text,
                      }}
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold"
                    >
                      {selectedMessage.priority}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    To: {selectedMessage.recipientScope} ·{" "}
                    {selectedMessage.timeAgo}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMessageId(null)}
                className="w-7 h-7 rounded-lg bg-[#F8FAFC] border border-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Compact status bar confirming auto-archive on read */}
            <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-[#F8FAFC] border border-slate-200/90">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#182C4E]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0284C7]" />
                <span>
                  {selectedMessage.archived || !selectedMessage.unread
                    ? "Archived"
                    : "In Inbox (Unread)"}
                </span>
              </span>

              {(selectedMessage.archived || !selectedMessage.unread) && (
                <button
                  type="button"
                  onClick={() => {
                    unarchiveMessage(selectedMessage.id);
                    setJustArchivedBanner(
                      `Restored "${selectedMessage.title}" back to Inbox`
                    );
                    setSelectedMessageId(null);
                  }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-slate-200 text-[#182C4E] hover:bg-[#F0F6FF] text-[10px] font-bold active:scale-[0.98] transition cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3 text-[#0284C7]" />
                  <span>Restore</span>
                </button>
              )}
            </div>

            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-slate-200/90 space-y-1.5">
              <h3 className="text-sm font-extrabold text-[#0F1E36]">
                {selectedMessage.title}
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                {selectedMessage.body}
              </p>
            </div>

            {/* Channel & Governance Privacy Notice */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 px-0.5 flex-wrap gap-1">
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F0F6FF] border border-[#D5E3F5] text-[#182C4E] font-semibold">
                  <Bell className="w-3 h-3 text-[#0284C7]" />
                  In-App
                </span>
                {selectedMessage.channels.email && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F0F6FF] border border-[#D5E3F5] text-[#182C4E] font-semibold">
                    <Mail className="w-3 h-3 text-[#0284C7]" />
                    Email Dispatched
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" />
                Private to recipient
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSelectedMessageId(null)}
                className="py-2 rounded-lg bg-[#F8FAFC] border border-slate-200 text-slate-700 text-xs font-extrabold hover:bg-slate-100 active:scale-[0.98] transition cursor-pointer"
              >
                Close
              </button>
              {selectedMessage.actionLink ? (
                <button
                  type="button"
                  onClick={() => {
                    const target = selectedMessage.actionLink || "/home";
                    setSelectedMessageId(null);
                    router.push(target);
                  }}
                  className="py-2 rounded-lg bg-gradient-to-b from-[#182C4E] to-[#101F38] border border-[#2B4875]/60 text-white text-xs font-extrabold hover:opacity-95 active:scale-[0.98] transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Open Destination</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setSelectedMessageId(null)}
                  className="py-2 rounded-lg bg-gradient-to-b from-[#182C4E] to-[#101F38] border border-[#2B4875]/60 text-white text-xs font-extrabold hover:opacity-95 active:scale-[0.98] transition cursor-pointer"
                >
                  Acknowledge
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </MobileAppShell>
  );
}
