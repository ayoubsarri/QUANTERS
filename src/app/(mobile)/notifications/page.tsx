"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  Bell,
  Check,
  CheckCheck,
  CheckCircle2,
  ExternalLink,
  Inbox,
  Mail,
  Orbit,
  RotateCcw,
  Search,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { MobileAppShell } from "@/components/mobile/MobileAppShell";
import { useQuantersStore } from "@/lib/store/useQuantersStore";
import { ClubMessage, NotificationPriority } from "@/lib/types/erp";
import { isMessageEligibleForRecipient } from "@/lib/utils/messageUtils";
import {
  dispatchSystemNotification,
  loadNotificationPrefs,
  NOTIFICATION_PREFS_KEY,
  NotificationPrefs,
} from "@/components/shared/PwaOfflineManager";

type FilterTab = "All" | "Unread" | "Announcements" | "Archived";

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
  const archiveClubMessage = useQuantersStore((s) => s.archiveClubMessage);
  const unarchiveMessage = useQuantersStore((s) => s.unarchiveMessage);
  const archiveAllReadMessages = useQuantersStore(
    (s) => s.archiveAllReadMessages
  );
  const currentMemberId = useQuantersStore((s) => s.currentMemberId);
  const members = useQuantersStore((s) => s.members);
  const teams = useQuantersStore((s) => s.teams);
  const departments = useQuantersStore((s) => s.departments);
  const activeAdminRole = useQuantersStore((s) => s.activeAdminRole);

  const currentMember = members.find((m) => m.id === currentMemberId);
  const isSuperOrExecutive =
    activeAdminRole === "Super Admin" ||
    activeAdminRole === "HR Head" ||
    activeAdminRole === "Executive" ||
    Boolean(currentMember?.roles?.some((r) => ["Super Admin", "Executive", "HR Head"].includes(r)));

  const isEligibleRecipient = (msg: ClubMessage) =>
    isMessageEligibleForRecipient(msg, currentMember, {
      isSuperOrExecutive,
      departments,
      teams,
    });

  const isMessageReadByMe = (msg: ClubMessage) => {
    if (Boolean(msg.archived)) return true;
    if (currentMemberId && Array.isArray(msg.readMemberIds)) {
      return msg.readMemberIds.includes(currentMemberId);
    }
    return Boolean(!msg.unread);
  };

  const [activeTab, setActiveTab] = useState<FilterTab>("All");
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

  useEffect(() => {
    setNotifPrefs(loadNotificationPrefs());
    if (typeof window !== "undefined" && "Notification" in window) {
      setBrowserPerm(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (selectedMessageId) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedMessageId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedMessageId(null);
        setSettingsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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
      body: "Push notifications are active on your device.",
      priority: "Info",
      url: "/notifications",
    });
    setJustArchivedBanner("Test notification dispatched!");
  };

  const eligibleMessages = messages.filter(isEligibleRecipient);
  const unreadCount = eligibleMessages.filter((m) => !isMessageReadByMe(m) && !m.archived).length;
  const isAnnouncement = (msg: ClubMessage) =>
    msg.senderRole === "HR" ||
    msg.senderLabel.includes("HR") ||
    msg.senderRole === "Executive" ||
    msg.priority === "Official notice" ||
    msg.priority === "Action needed";
  const announcementsCount = eligibleMessages.filter(isAnnouncement).length;
  const archivedCount = eligibleMessages.filter((m) => isMessageReadByMe(m) || m.archived).length;

  const selectedMessage =
    messages.find((m) => m.id === selectedMessageId) || null;

  const filteredMessages = eligibleMessages.filter((msg) => {
    const isRead = isMessageReadByMe(msg) || Boolean(msg.archived);
    const matchesTab =
      activeTab === "All"
        ? true
        : activeTab === "Unread"
        ? !isRead
        : activeTab === "Announcements"
        ? isAnnouncement(msg)
        : isRead;

    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      msg.title.toLowerCase().includes(q) ||
      msg.body.toLowerCase().includes(q) ||
      msg.senderLabel.toLowerCase().includes(q);

    return matchesTab && matchesSearch;
  });

  const handleOpenMessage = (msg: ClubMessage) => {
    const wasUnread = !isMessageReadByMe(msg);
    markMessageRead(msg.id, currentMemberId);
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

  const handleArchiveMessage = (
    msgId: string,
    msgTitle: string,
    e?: React.MouseEvent
  ) => {
    if (e) e.stopPropagation();
    archiveClubMessage(msgId);
    setJustArchivedBanner(`"${msgTitle || "Notification"}" moved to Archive`);
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
    if (msg.priority === "Official notice" || msg.senderRole === "Executive") {
      return (
        <div
          className={`${sizeClass} bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-700 shrink-0`}
        >
          <Bell className={iconSize} />
        </div>
      );
    }
    return (
      <div
        className={`${sizeClass} bg-[#F0F6FF] border border-[#D5E3F5] flex items-center justify-center text-[#182C4E] shrink-0`}
      >
        <Mail className={iconSize} />
      </div>
    );
  };

  return (
    <MobileAppShell>
      <div className="flex-1 flex flex-col px-4 sm:px-5 pt-2 pb-6 animate-rise">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-black text-[#0F1E36] tracking-tight leading-tight">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#0284C7] text-white text-[11px] font-bold shadow-2xs">
                  {unreadCount} new
                </span>
              )}
            </div>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              {unreadCount > 0 ? "You have unread updates" : "Updates, announcements, and team alerts"}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllReadAndArchive}
                title="Mark all notifications as read"
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 active:scale-95 flex items-center gap-1.5 transition cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5 text-[#0284C7]" />
                <span className="hidden xs:inline">Mark all read</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setSettingsOpen((v) => !v)}
              className={`w-9 h-9 rounded-xl border flex items-center justify-center active:scale-95 transition cursor-pointer ${
                settingsOpen
                  ? "bg-[#182C4E] text-white border-[#2B4875]"
                  : "bg-white border-slate-200/90 text-slate-600 hover:text-[#182C4E] hover:bg-slate-50"
              }`}
              aria-label="Notification settings"
              title="Preferences"
            >
              <Settings2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              className="w-9 h-9 rounded-xl bg-white border border-slate-200/90 flex items-center justify-center text-slate-600 hover:text-[#182C4E] hover:bg-slate-50 active:scale-95 transition cursor-pointer"
              aria-label="Search notifications"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Collapsible Notification Preferences Panel (No Manual Offline Mode Button) */}
        {settingsOpen && (
          <div className="mb-3.5 p-3.5 rounded-xl bg-white border border-[#2B4875]/35 shadow-sm space-y-3 animate-rise">
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div>
                <h2 className="font-display text-xs font-black uppercase tracking-wider text-[#0F1E36]">
                  Notification Preferences
                </h2>
                <p className="text-[11px] text-slate-500">
                  Manage push alerts and club announcement channels
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleSendTestAlert}
                  className="px-3 py-1.5 min-h-[38px] rounded-lg bg-[#F0F6FF] hover:bg-[#E2EEFC] border border-[#D5E3F5] text-xs font-bold text-[#182C4E] transition cursor-pointer active:scale-95 flex items-center justify-center"
                >
                  Test Alert
                </button>
                <button
                  type="button"
                  onClick={handleRequestPushPermission}
                  className="px-3.5 py-1.5 min-h-[38px] rounded-lg bg-[#182C4E] hover:bg-[#101F38] text-white text-xs font-bold cursor-pointer transition active:scale-95 flex items-center justify-center shadow-xs"
                >
                  {browserPerm === "granted"
                    ? "Push Active"
                    : "Enable Push Alerts"}
                </button>
              </div>
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
                  className="p-2.5 min-h-[44px] rounded-xl bg-[#F8FAFC] border border-slate-200/80 hover:bg-slate-100 flex items-center justify-between gap-2 cursor-pointer select-none transition"
                >
                  <span className="font-semibold text-slate-700 text-xs">
                    {item.label}
                  </span>
                  <input
                    type="checkbox"
                    checked={notifPrefs[item.key]}
                    onChange={(e) => updatePref(item.key, e.target.checked)}
                    className="w-4 h-4 accent-[#182C4E] rounded cursor-pointer"
                  />
                </label>
              ))}
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

        {/* Filter Tabs: Segmented Control (All | Unread | Announcements | Archived) */}
        <div
          role="tablist"
          aria-label="Notification Categories"
          className="p-1 rounded-2xl bg-slate-100/90 border border-slate-200/90 grid grid-cols-4 gap-1 mb-4"
        >
          {(
            [
              { key: "All" as const, label: "All", count: eligibleMessages.length },
              { key: "Unread" as const, label: "Unread", count: unreadCount },
              { key: "Announcements" as const, label: "Notices", count: announcementsCount },
              { key: "Archived" as const, label: "Archive", count: archivedCount },
            ] as const
          ).map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.key)}
                className={`min-h-[36px] py-1.5 px-1 rounded-xl text-xs font-bold font-sans active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1 truncate ${
                  active
                    ? "bg-white text-[#0F1E36] shadow-xs border border-slate-200 font-extrabold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span className="truncate">{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      active
                        ? "bg-slate-100 text-[#0F1E36]"
                        : tab.key === "Unread"
                        ? "bg-[#0284C7] text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
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
            <div className="py-12 px-6 rounded-2xl bg-white border border-slate-200/90 text-center space-y-3 shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center mx-auto text-[#0284C7] shadow-2xs">
                {activeTab === "Unread" ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                ) : (
                  <Inbox className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-[#0F1E36]">
                  {activeTab === "Unread"
                    ? "You're all caught up"
                    : activeTab === "Announcements"
                    ? "No official announcements"
                    : activeTab === "Archived"
                    ? "No archived notifications"
                    : "No notifications"}
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
                  {activeTab === "Unread"
                    ? "No unread alerts right now. We'll notify you as soon as new workshops, tasks, or announcements arrive."
                    : "Notifications for your department and club activities will appear here."}
                </p>
              </div>
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
                            <span className="text-[10px] font-sans font-medium text-slate-400">
                              {msg.timeAgo}
                            </span>
                            <button
                              type="button"
                              onClick={(e) =>
                                handleRestoreToInbox(msg.id, msg.title, e)
                              }
                              title="Restore to Inbox"
                              aria-label="Restore"
                              className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-[#182C4E] hover:bg-[#F0F6FF] active:scale-[0.95] transition flex items-center justify-center cursor-pointer shadow-2xs"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-[#0284C7]" />
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
                  className="p-3.5 rounded-xl bg-white border border-slate-200/90 border-l-4 border-l-[#0284C7] hover:border-[#182C4E] active:scale-[0.99] transition-all cursor-pointer shadow-[0_3px_12px_rgba(15,30,54,0.06)]"
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
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold font-sans leading-tight border border-black/5"
                          >
                            {msg.priority}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] font-medium text-slate-400 font-sans">
                            {msg.timeAgo}
                          </span>
                          <span
                            className="w-2 h-2 rounded-full bg-[#0284C7]"
                            aria-label="Unread"
                          />
                          <button
                            type="button"
                            onClick={(e) => handleArchiveMessage(msg.id, msg.title, e)}
                            title="Push to Archive"
                            aria-label="Archive notification"
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition flex items-center justify-center cursor-pointer active:scale-95"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
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

          {/* Bottom discreet push alert prompt when ungranted */}
          {browserPerm !== "granted" && (
            <div className="pt-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <Bell className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
                  <span className="text-slate-600 font-medium truncate">
                    Instant alerts for workshops &amp; announcements
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRequestPushPermission}
                  className="px-2.5 py-1 rounded-lg bg-[#182C4E] hover:bg-[#101F38] text-white text-[10.5px] font-bold shrink-0 transition cursor-pointer"
                >
                  Enable Push
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 pb-20 sm:pb-6 animate-fade-in">
          <div
            data-modal="true"
            role="dialog"
            aria-modal="true"
            className="w-full max-w-[460px] max-h-[85dvh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden animate-rise"
          >
            {/* Header: Sender details, Priority badge, & Close button */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-start justify-between gap-3 bg-gradient-to-b from-[#F8FAFC] to-white">
              <div className="flex items-center gap-3 min-w-0">
                {renderSenderIcon(selectedMessage)}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-black text-[#0F1E36] truncate">
                      {selectedMessage.senderLabel}
                    </span>
                    <span
                      style={{
                        backgroundColor:
                          PRIORITY_BADGE_STYLES[selectedMessage.priority]?.bg || "#F0F6FF",
                        color:
                          PRIORITY_BADGE_STYLES[selectedMessage.priority]?.text || "#0284C7",
                      }}
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold font-sans border border-black/5"
                    >
                      {selectedMessage.priority}
                    </span>
                  </div>
                  <p className="text-[11px] font-sans font-medium text-slate-400 mt-0.5 flex items-center gap-1.5 truncate">
                    <span>To: {selectedMessage.recipientScope}</span>
                    <span>·</span>
                    <span>{selectedMessage.timeAgo}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMessageId(null)}
                aria-label="Close notification"
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition active:scale-95 cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Message Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1">
              {/* Status pill (Archive vs Inbox) */}
              <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-[#F0F6FF]/70 border border-[#D5E3F5]/80">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#182C4E]">
                  {selectedMessage.archived || !selectedMessage.unread ? (
                    <>
                      <Archive className="w-3.5 h-3.5 text-slate-500" />
                      <span>Archived Notice</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
                      <span>Inbox (Active)</span>
                    </>
                  )}
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
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[#182C4E] hover:bg-slate-50 text-[11px] font-bold active:scale-[0.98] transition cursor-pointer shadow-2xs"
                  >
                    <RotateCcw className="w-3 h-3 text-[#0284C7]" />
                    <span>Restore to Inbox</span>
                  </button>
                )}
              </div>

              {/* Message Paper Card */}
              <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
                <h2 className="text-base font-black text-[#0F1E36] tracking-tight leading-snug">
                  {selectedMessage.title}
                </h2>
                <div className="border-t border-slate-100 pt-2">
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans whitespace-pre-line select-text">
                    {selectedMessage.body}
                  </p>
                </div>
              </div>

              {/* Delivery Channels & Governance Tag */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 flex-wrap gap-2 pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                    <Bell className="w-3 h-3 text-[#0284C7]" />
                    In-App
                  </span>
                  {selectedMessage.channels?.email && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                      <Mail className="w-3 h-3 text-[#0284C7]" />
                      Email
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-sans">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  QUANTA Official Dispatch
                </span>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-slate-100 bg-[#F8FAFC] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedMessageId(null)}
                className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-extrabold hover:bg-slate-50 active:scale-[0.98] transition cursor-pointer"
              >
                Close
              </button>

              {/* Push to Archive button if unarchived */}
              {!selectedMessage.archived && selectedMessage.unread && (
                <button
                  type="button"
                  onClick={() => {
                    archiveClubMessage(selectedMessage.id);
                    setJustArchivedBanner(`"${selectedMessage.title}" pushed to Archive`);
                    setSelectedMessageId(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[#182C4E] text-xs font-extrabold active:scale-[0.98] transition cursor-pointer flex items-center gap-1.5"
                >
                  <Archive className="w-3.5 h-3.5 text-slate-600" />
                  <span>Push to Archive</span>
                </button>
              )}

              {selectedMessage.actionLink ? (
                <button
                  type="button"
                  onClick={() => {
                    const target = selectedMessage.actionLink || "/home";
                    setSelectedMessageId(null);
                    router.push(target);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-b from-[#182C4E] to-[#101F38] text-white text-xs font-extrabold hover:opacity-95 active:scale-[0.98] transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>Open Destination</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </MobileAppShell>
  );
}
