const fs = require('fs');
let code = fs.readFileSync('src/app/(mobile)/home/page.tsx', 'utf8');

const targetStart = '{!isAppInstalled && (';
const targetEnd = '{/* In-Place Browser Installation Helper for iOS / Desktop Fallback */}';

const sIdx = code.indexOf(targetStart);
const eIdx = code.indexOf(targetEnd);

if (sIdx !== -1 && eIdx !== -1) {
  const replacement = `{!isAppInstalled && (
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
            </div>
          </div>
        )}
        `;
  code = code.substring(0, sIdx) + replacement + code.substring(eIdx);
  fs.writeFileSync('src/app/(mobile)/home/page.tsx', code, 'utf8');
  console.log('Updated PWA banner in home/page.tsx');
} else {
  console.error('Target not found', { sIdx, eIdx });
}
