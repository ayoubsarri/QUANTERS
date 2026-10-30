import fs from "fs";

let content = fs.readFileSync("src/app/(mobile)/notifications/page.tsx", "utf8").replace(/\r\n/g, "\n");

const headerTarget = `        {/* Collapsible Notification Preferences Panel (No Manual Offline Mode Button) */}`;

const promptBanner = `        {/* High-Visibility Enable Push Notifications Banner (Placed High Up) */}
        {browserPerm !== "granted" && (
          <div className="mb-3 p-3 rounded-xl bg-gradient-to-r from-[#0284C7]/10 via-[#38BDF8]/15 to-[#0284C7]/10 border border-[#38BDF8]/30 flex items-center justify-between gap-3 shadow-2xs animate-rise">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-8 h-8 rounded-lg bg-[#0284C7] text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Bell className="w-4 h-4 animate-bounce" />
              </span>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#0F1E36]">
                  Enable Official Push Notifications
                </div>
                <p className="text-[10.5px] text-slate-500 truncate">
                  Get instant mobile alerts for workshops, tasks &amp; HR notices
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRequestPushPermission}
              className="px-3 py-1.5 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold shrink-0 transition active:scale-95 shadow-2xs cursor-pointer"
            >
              Enable Now
            </button>
          </div>
        )}

        {/* Collapsible Notification Preferences Panel (No Manual Offline Mode Button) */}`;

if (content.includes(headerTarget)) {
  content = content.replace(headerTarget, promptBanner);
  fs.writeFileSync("src/app/(mobile)/notifications/page.tsx", content);
  console.log("Placed Enable Push Notifications banner high up in notifications page");
} else {
  console.log("headerTarget not found");
}
