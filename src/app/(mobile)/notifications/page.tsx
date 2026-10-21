"use client";

import React, { useState } from "react";
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
  ShieldAlert,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { MobileAppShell } from "@/components/mobile/MobileAppShell";
import { useQuantersStore } from "@/lib/store/useQuantersStore";
import { ClubMessage, NotificationPriority } from "@/lib/types/erp";

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
    bg: "#E0F0FF",
    text: "#1D63B8",
  },
  Message: {
    bg: "#E0E7FF",
    text: "#4338CA",
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

  const [activeTab, setActiveTab] = useState<FilterTab>("Inbox");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null
  );
  const [justArchivedBanner, setJustArchivedBanner] = useState<string | null>(
    null
  );

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

  const renderSenderIcon = (msg: ClubMessage) => {
    if (msg.senderRole === "HR") {
      return (
        <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-[#1D63EB] shrink-0">
          <Users className="w-5 h-5" />
        </div>
      );
    }
    if (msg.senderRole === "Scientific Team") {
      return (
        <div className="w-10 h-10 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0">
          <Orbit className="w-5 h-5" />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-full bg-sky-100 border border-sky-200 flex items-center justify-center text-[#1D63B8] shrink-0">
        <Sparkles className="w-5 h-5" />
      </div>
    );
  };

  return (
    <MobileAppShell>
      <div className="flex-1 flex flex-col px-5 pt-2 pb-6 animate-rise">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h1 className="text-[20px] font-extrabold text-slate-900 tracking-tight leading-tight">
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
              className="px-2.5 py-1.5 rounded-full bg-white border border-slate-200 text-[10px] font-bold text-slate-700 hover:text-[#1D63EB] hover:border-blue-200 active:scale-[0.98] flex items-center gap-1 shadow-2xs transition"
            >
              <CheckCheck className="w-3.5 h-3.5 text-[#1D63EB]" />
              <span>
                {unreadCount > 0
                  ? "Mark All Read & Archive"
                  : "Archive All Read"}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              className="w-8 h-8 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-slate-600 shadow-xs hover:bg-slate-50 active:scale-[0.98] transition"
              aria-label="Search messages"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Input */}
        {searchOpen && (
          <div className="mb-3 relative animate-rise">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notifications or HR messages..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1D63EB]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Filter Tabs: Inbox | HR Notices | Archived */}
        <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-0.5">
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
                className={`px-4 py-2 rounded-full text-xs font-extrabold active:scale-[0.98] transition-all whitespace-nowrap cursor-pointer ${
                  active
                    ? "bg-gradient-to-r from-[#1D63EB] to-[#0A4CC7] text-white shadow-[0_4px_14px_rgba(29,99,235,0.3)] border border-transparent"
                    : "bg-white/80 backdrop-blur-md text-slate-600 border border-white/80 hover:bg-white hover:text-slate-900 shadow-2xs"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Subtle Auto-Archive Toast Pill */}
        {justArchivedBanner && (
          <div className="mb-3 px-3.5 py-2.5 rounded-2xl bg-emerald-50/90 backdrop-blur-md border border-emerald-200/90 flex items-center justify-between gap-2 text-xs font-bold text-emerald-900 animate-rise shadow-2xs">
            <div className="flex items-center gap-2 min-w-0">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="truncate">{justArchivedBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setJustArchivedBanner(null)}
              className="text-emerald-600 hover:text-emerald-800 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Messages List */}
        <div className="space-y-3">
          {filteredMessages.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/80 text-center space-y-2.5 shadow-2xs">
              {activeTab === "Inbox" ? (
                <>
                  <Inbox className="w-10 h-10 text-emerald-500 mx-auto" />
                  <p className="text-sm font-black text-slate-800">
                    Inbox Zero — All caught up!
                  </p>
                  <p className="text-xs text-slate-500">
                    Read notifications have been automatically moved to{" "}
                    <button
                      type="button"
                      onClick={() => setActiveTab("Archived")}
                      className="text-[#1D63EB] font-bold underline"
                    >
                      Archived ({archivedCount})
                    </button>
                    .
                  </p>
                </>
              ) : (
                <>
                  <Bell className="w-10 h-10 text-slate-300 mx-auto" />
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

              return (
                <div
                  key={msg.id}
                  onClick={() => handleOpenMessage(msg)}
                  className={`p-4 rounded-3xl bg-white/85 backdrop-blur-xl border active:scale-[0.99] transition-all cursor-pointer shadow-[0_6px_24px_rgba(9,25,47,0.05)] hover:border-[#1D63EB]/40 hover:bg-white/95 ${
                    msg.unread && !msg.archived
                      ? "border-[#1D63EB]/50 ring-2 ring-[#1D63EB]/10"
                      : "border-white/80"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Sender Avatar / Icon */}
                    {renderSenderIcon(msg)}

                    {/* Message Body */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-black text-slate-900">
                            {msg.senderLabel}
                          </span>
                          <span
                            style={{
                              backgroundColor: badgeStyle.bg,
                              color: badgeStyle.text,
                            }}
                            className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold leading-tight border border-black/5"
                          >
                            {msg.priority}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[11px] font-medium text-slate-400">
                            {msg.timeAgo}
                          </span>
                          {msg.unread && !msg.archived ? (
                            <span
                              className="w-2.5 h-2.5 rounded-full bg-[#1D63EB] shadow-[0_0_8px_rgba(29,99,235,0.6)]"
                              aria-label="Unread"
                            />
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-extrabold border border-emerald-200/80">
                              Archived
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className="text-sm font-black text-slate-900 mt-1 leading-snug">
                        {msg.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                        {msg.body}
                      </p>

                      {isArchivedOrRead && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Read &amp; Archived</span>
                          </span>
                          <button
                            type="button"
                            onClick={(e) =>
                              handleRestoreToInbox(msg.id, msg.title, e)
                            }
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100/80 hover:bg-blue-50 text-slate-700 hover:text-[#1D63EB] text-[10px] font-bold active:scale-[0.98] transition cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Restore to Inbox</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Detail Bottom Sheet Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-[420px] bg-white/95 backdrop-blur-2xl rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-white/80 space-y-4 animate-rise">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                {renderSenderIcon(selectedMessage)}
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-extrabold text-slate-900">
                      {selectedMessage.senderLabel}
                    </span>
                    <span
                      style={{
                        backgroundColor:
                          PRIORITY_BADGE_STYLES[selectedMessage.priority].bg,
                        color:
                          PRIORITY_BADGE_STYLES[selectedMessage.priority].text,
                      }}
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold"
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
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Subtle green pill confirming auto-archive on read */}
            <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200/80">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  {selectedMessage.archived || !selectedMessage.unread
                    ? "Read & Moved to Archive"
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
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-slate-700 hover:text-[#1D63EB] text-[10px] font-bold shadow-2xs active:scale-[0.98] transition"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Move back to Inbox</span>
                </button>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <h3 className="text-sm font-extrabold text-slate-900">
                {selectedMessage.title}
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                {selectedMessage.body}
              </p>
            </div>

            {/* Channel & Governance Privacy Notice */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">
                  <Bell className="w-3 h-3 text-[#1D63EB]" />
                  In-App
                </span>
                {selectedMessage.channels.email && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">
                    <Mail className="w-3 h-3 text-[#1D63EB]" />
                    Email Dispatched
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" />
                Private to recipient
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setSelectedMessageId(null)}
                className="py-2.5 rounded-full bg-slate-100 text-slate-700 text-xs font-extrabold hover:bg-slate-200 active:scale-[0.98] transition cursor-pointer"
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
                  className="py-2.5 rounded-full bg-gradient-to-r from-[#1D63EB] to-[#0A4CC7] text-white text-xs font-extrabold shadow-[0_4px_14px_rgba(29,99,235,0.3)] hover:shadow-md active:scale-[0.98] transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Open Destination</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setSelectedMessageId(null)}
                  className="py-2.5 rounded-full bg-gradient-to-r from-[#1D63EB] to-[#0A4CC7] text-white text-xs font-extrabold shadow-[0_4px_14px_rgba(29,99,235,0.3)] hover:shadow-md active:scale-[0.98] transition cursor-pointer"
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
