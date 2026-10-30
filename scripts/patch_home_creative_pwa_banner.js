import fs from "fs";

let content = fs.readFileSync("src/app/(mobile)/home/page.tsx", "utf8").replace(/\r\n/g, "\n");

// 1. Update unreadCount
const unreadTarget = `  const unreadCount = messages.filter((m) => m.unread).length;`;
const unreadRepl = `  const unreadCount = messages.filter(
    (m) =>
      !m.archived &&
      m.unread &&
      !(currentMemberId && Array.isArray(m.readMemberIds) && m.readMemberIds.includes(currentMemberId))
  ).length;`;

if (content.includes(unreadTarget)) {
  content = content.replace(unreadTarget, unreadRepl);
  console.log("Updated unreadCount calculation in home page");
}

// 2. Redesign the PWA banner: vertical creative card, single download/sparkle icon, no repeat
const pwaTarget = `        {!isAppInstalled && (
          <div
            data-testid="pwa-install-box"
            className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#180B02] via-[#2A1202] to-[#120701] border border-orange-500/40 px-3 py-1.5 text-white shadow-sm animate-rise"
            style={{ animationDelay: "20ms" }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shrink-0 shadow-xs">
                  <Download className="w-3 h-3 text-white" />
                </div>
                <div className="min-w-0 flex items-center gap-1.5 flex-wrap">
                  <span className="font-display font-black text-[11.5px] text-white tracking-tight truncate">
                    {isRtl ? "تثبيت كوانترز" : "Install QUANTERS"}
                  </span>
                  <span className="px-1.5 py-0.5 rounded font-mono text-[8.5px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 shrink-0">
                    {isRtl ? "سريع أوفلاين" : "Fast & Offline"}
                  </span>
                  <span className="text-[10px] text-orange-200/80 truncate hidden sm:inline">
                    · {isRtl ? "إضافة للشاشة الرئيسية" : "Add to Home Screen"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleInstallApp}
                className="shrink-0 h-6 px-2.5 rounded-md bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:brightness-110 text-white font-display font-black text-[10.5px] shadow-sm active:scale-95 transition flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-2.5 h-2.5 stroke-[2.5]" />
                <span>{isRtl ? "تثبيت" : "Install"}</span>
              </button>
            </div>`;

const pwaRepl = `        {!isAppInstalled && (
          <div
            data-testid="pwa-install-box"
            className="relative overflow-hidden rounded-2xl bg-[#0C0F17] border border-orange-500/35 p-3.5 text-white shadow-md animate-rise space-y-2.5"
            style={{ animationDelay: "20ms" }}
          >
            {/* Top row with single device badge & tagline */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-7 h-7 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center text-xs font-black shadow-2xs shrink-0">
                  ⚡
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-display font-black text-xs text-white tracking-tight">
                      {isRtl ? "تطبيق كوانترز الذكي" : "QUANTERS Mobile App"}
                    </span>
                    <span className="px-1.5 py-0.2 rounded font-mono text-[8px] font-bold bg-orange-500/25 text-orange-300 border border-orange-500/30">
                      {isRtl ? "أوفلاين" : "Offline Ready"}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-400 font-medium leading-tight mt-0.5">
                    {isRtl ? "أضف للشاشة الرئيسية للوصول السريع ومسح الحضور" : "1-tap optical check-in and instant pass on your home screen"}
                  </p>
                </div>
              </div>
            </div>

            {/* Full-width vibrant orange CTA button (Single download action, zero repeat) */}
            <button
              type="button"
              onClick={handleInstallApp}
              className="w-full h-8 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:brightness-110 text-white font-display font-black text-xs shadow-sm active:scale-[0.99] transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>{isRtl ? "تثبيت التطبيق على جهازك" : "Install on Home Screen"}</span>
            </button>`;

if (content.includes(pwaTarget)) {
  content = content.replace(pwaTarget, pwaRepl);
  console.log("Replaced PWA banner with creative vertical card layout");
} else {
  console.log("pwaTarget not found");
}

fs.writeFileSync("src/app/(mobile)/home/page.tsx", content);
