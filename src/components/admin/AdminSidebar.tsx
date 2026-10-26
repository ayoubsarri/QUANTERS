"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Award,
  BarChart3,
  BookOpen,
  Building2,
  Calendar,
  CheckSquare,
  ExternalLink,
  FileSpreadsheet,
  GraduationCap,
  KeyRound,
  LayoutDashboard,
  Lock,
  LogOut,
  MessageSquare,
  Settings,
  ShieldAlert,
  Sparkles,
  UserCheck,
  UserX,
  Users,
  X,
} from "lucide-react";
import { QuantaLogo } from "@/components/shared/QuantaLogo";
import { useQuantersStore } from "@/lib/store/useQuantersStore";
import { RoleTemplateName } from "@/lib/types/erp";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  restricted?: boolean;
  allowedRoles?: RoleTemplateName[];
  badgeCount?: (state: ReturnType<typeof useQuantersStore.getState>) => number | undefined;
}

interface NavGroup {
  groupLabel: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    groupLabel: "Workspace",
    items: [
      {
        label: "Overview",
        href: "/admin/overview",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    groupLabel: "People",
    items: [
      {
        label: "Members",
        href: "/admin/members",
        icon: Users,
        allowedRoles: ["Super Admin", "Executive", "HR Head", "Department Head", "Co-Manager", "KPI Viewer"],
        badgeCount: (s) =>
          s.members.filter((m) => ["Trainee", "Active", "Inactive", "Suspended"].includes(m.status)).length,
      },
      {
        label: "Former Members",
        href: "/admin/members?tab=former",
        icon: UserX,
        allowedRoles: ["Super Admin", "Executive", "HR Head", "Department Head", "Co-Manager"],
        badgeCount: (s) =>
          s.members.filter((m) => ["Resigned", "Removed"].includes(m.status)).length || undefined,
      },
      {
        label: "Alumni",
        href: "/admin/members?tab=alumni",
        icon: GraduationCap,
        allowedRoles: ["Super Admin", "Executive", "HR Head", "Department Head", "Co-Manager", "KPI Viewer"],
        badgeCount: (s) =>
          s.members.filter((m) => m.status === "Alumni").length || undefined,
      },
      {
        label: "Departments & Teams",
        href: "/admin/org",
        icon: Building2,
        allowedRoles: ["Super Admin", "Executive", "HR Head", "Department Head", "Co-Manager"],
      },
    ],
  },
  {
    groupLabel: "Operations",
    items: [
      {
        label: "Workshops & Activities",
        href: "/admin/workshops",
        icon: Calendar,
        allowedRoles: ["Super Admin", "Executive", "HR Head", "Department Head", "Co-Manager"],
      },
      {
        label: "Tasks & Matrix",
        href: "/admin/tasks",
        icon: CheckSquare,
        allowedRoles: ["Super Admin", "Executive", "HR Head", "Department Head", "Co-Manager"],
      },
      {
        label: "Proposals",
        href: "/admin/proposals",
        icon: FileSpreadsheet,
        allowedRoles: ["Super Admin", "Executive", "HR Head", "Department Head", "Co-Manager"],
        badgeCount: (s) =>
          s.proposals.filter((p) => p.state === "Submitted" || p.state === "Under Review").length || undefined,
      },
    ],
  },
  {
    groupLabel: "Recognition & KPIs",
    items: [
      {
        label: "Points & Honours",
        href: "/admin/points",
        icon: Sparkles,
        allowedRoles: ["Super Admin", "Executive", "HR Head", "Department Head", "Co-Manager", "KPI Viewer"],
      },
      {
        label: "Badges & Exams",
        href: "/admin/badges",
        icon: Award,
        allowedRoles: ["Super Admin", "Executive", "HR Head", "Department Head", "Co-Manager"],
      },
      {
        label: "Statistics",
        href: "/admin/stats",
        icon: BarChart3,
        allowedRoles: ["Super Admin", "Executive", "HR Head", "Department Head", "Co-Manager", "KPI Viewer"],
      },
    ],
  },
  {
    groupLabel: "Communication",
    items: [
      {
        label: "Messages",
        href: "/admin/messages",
        icon: MessageSquare,
        allowedRoles: ["Super Admin", "Executive", "HR Head", "Department Head", "Co-Manager", "Editor"],
      },
      {
        label: "Explore, Quiz & Quotes",
        href: "/admin/explore",
        icon: BookOpen,
        allowedRoles: ["Super Admin", "Executive", "HR Head", "Department Head", "Co-Manager", "Editor"],
      },
    ],
  },
  {
    groupLabel: "Governance",
    items: [
      {
        label: "Access Control",
        href: "/admin/access",
        icon: KeyRound,
        allowedRoles: ["Super Admin", "Executive", "HR Head", "Department Head"],
      },
      {
        label: "Settings",
        href: "/admin/settings",
        icon: Settings,
        restricted: true,
        allowedRoles: ["Super Admin"],
      },
      {
        label: "Audit Log",
        href: "/admin/audit",
        icon: ShieldAlert,
        restricted: true,
        allowedRoles: ["Super Admin", "Executive", "HR Head"],
      },
    ],
  },
];

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function AdminSidebar({ mobileOpen = false, onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const state = useQuantersStore();
  const { activeAdminRole, currentMemberId, members, logout } = state;

  const adminUser =
    members.find(
      (m) =>
        m.id === currentMemberId &&
        m.roles.some((r) =>
          ["Super Admin", "Executive", "HR Head", "Department Head", "Co-Manager"].includes(r)
        )
    ) ||
    members.find((m) => m.id === "mem-lotfi") ||
    members[0];

  const sidebarContent = (
    <div className="w-64 shrink-0 bg-gradient-to-b from-[#081223] via-[#0E1B31] to-[#060D1A] text-white flex flex-col h-screen border-r border-[#2B4875]/45 select-none overflow-hidden">
      {/* Brand Header matching Member App */}
      <div className="px-4 pt-5 pb-3.5 border-b border-[#2B4875]/45">
        <div className="flex items-center justify-between">
          <Link href="/admin/overview" onClick={onCloseMobile} className="hover:opacity-95 transition">
            <QuantaLogo size={34} showSubtitle={true} variant="dark" />
          </Link>
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Compact Admin Identity Card in Member App Deep Navy Style */}
        <div className="mt-3.5 bg-gradient-to-b from-[#182C4E] to-[#101F38] border border-[#2B4875]/75 rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-[0_6px_18px_rgba(3,8,18,0.4)]">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={adminUser.avatarUrl}
              alt={adminUser.fullName}
              className="w-8 h-8 rounded-full object-cover border border-[#38BDF8]/50 shrink-0"
            />
            <div className="min-w-0">
              <div className="font-display text-xs font-black text-white truncate leading-tight">
                {adminUser.fullName}
              </div>
              <div className="text-[10px] font-mono font-semibold text-[#7DD3FC] truncate flex items-center gap-1 mt-0.5">
                <UserCheck className="w-2.5 h-2.5 shrink-0" />
                <span>{activeAdminRole}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/welcome");
            }}
            title="Sign Out"
            className="p-1.5 rounded-lg bg-[#081223]/80 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-[#2B4875]/70 transition cursor-pointer shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Scrollable Navigation Groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-3.5">
        {NAV_GROUPS.map((group) => {
          const visibleItems = group.items.filter(
            (item) => !item.allowedRoles || item.allowedRoles.includes(activeAdminRole)
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.groupLabel}>
              <div className="px-2.5 mb-1 text-[9.5px] font-mono font-bold uppercase tracking-[0.14em] text-[#7DD3FC]/70">
                {group.groupLabel}
              </div>
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/admin/overview" && pathname?.startsWith(item.href));
                  const count = item.badgeCount ? item.badgeCount(state) : undefined;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onCloseMobile}
                      className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-display font-bold transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-[#182C4E] to-[#122340] text-white border border-[#38BDF8]/40 shadow-[0_4px_14px_rgba(3,8,18,0.45)]"
                          : "text-slate-300/90 hover:bg-[#132441]/60 hover:text-white border border-transparent"
                      }`}
                    >
                      <span className="flex items-center gap-2.5 truncate">
                        <Icon
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isActive ? "text-[#7DD3FC]" : "text-slate-400"
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        {item.restricted && <Lock className="w-2.5 h-2.5 text-slate-400/80" />}
                        {count !== undefined && (
                          <span
                            className={`text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded-md tabular-nums ${
                              isActive
                                ? "bg-[#38BDF8]/20 text-[#7DD3FC] border border-[#38BDF8]/30"
                                : "bg-white/8 text-slate-300"
                            }`}
                          >
                            {count}
                          </span>
                        )}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Bottom Institutional Bar with Official Asset 2.png (Univ Algiers 1 + Quanta) & Member App Link */}
      <div className="px-3.5 py-3 border-t border-[#2B4875]/45 bg-[#060E1C]/90 space-y-2.5">
        <Link
          href="/home"
          className="w-full py-2 px-3 rounded-xl bg-[#11203A] hover:bg-[#182C4E] border border-[#2B4875]/80 flex items-center justify-between text-[11px] font-display font-bold text-[#7DD3FC] hover:text-white transition"
        >
          <span>Open Member App</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        <div className="flex items-center justify-between gap-2 px-0.5 pt-0.5">
          <img
            src="/brand/univ_quanta_asset2.png"
            alt="University of Algiers 1 & Quanta"
            className="h-[18px] w-auto object-contain opacity-95"
          />
          <div className="flex items-center gap-1.5 pl-2 border-l border-white/15">
            <img
              src="/brand/univ_logo.svg"
              alt="Faculty of Sciences"
              className="h-[18px] w-auto object-contain opacity-95"
            />
            <span className="font-mono text-[8.5px] font-semibold tracking-wider text-slate-300 uppercase">
              ALGIERS 1
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex w-64 h-screen shrink-0 select-none overflow-hidden">{sidebarContent}</aside>

      {/* Mobile Slide-Over Sidebar Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 h-full flex">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}
