const fs = require('fs');

const file = 'src/app/(mobile)/profile/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Add Quote to imports if needed
if (!code.includes('Quote,')) {
  code = code.replace(
    '  QrCode,',
    '  QrCode,\n  Quote,'
  );
}

// 2. Make Quote Font Much Bigger (Requirement 2)
const oldQuote = `          <p className="mt-3 pt-3 border-t border-slate-100 text-xs sm:text-sm text-slate-600 font-editorial leading-relaxed">
            &ldquo;{lang === "ar" && activeQuote.textAr ? activeQuote.textAr : activeQuote.text}&rdquo;{" "}
            <span className="not-italic font-sans font-semibold text-slate-400 text-xs">
              — {lang === "ar" && activeQuote.authorAr ? activeQuote.authorAr : activeQuote.author}
            </span>
          </p>`;

const newQuote = `          <div className="mt-3.5 pt-3.5 border-t border-slate-100/90 flex items-start gap-3">
            <Quote className="w-5 h-5 text-[#0284C7] shrink-0 mt-0.5 opacity-80" />
            <div className="space-y-1 min-w-0 flex-1">
              <p className="text-base sm:text-lg md:text-xl text-slate-800 font-editorial italic leading-relaxed tracking-wide">
                &ldquo;{lang === "ar" && activeQuote.textAr ? activeQuote.textAr : activeQuote.text}&rdquo;
              </p>
              <div className="text-xs sm:text-sm font-sans font-bold text-[#0284C7] flex items-center gap-1.5 flex-wrap">
                <span>—</span>
                <span>{lang === "ar" && activeQuote.authorAr ? activeQuote.authorAr : activeQuote.author}</span>
                <span className="text-[10.5px] font-mono font-normal text-slate-400">· {activeQuote.category}</span>
              </div>
            </div>
          </div>`;

code = code.replace(oldQuote, newQuote);

// 3. Use the new profile mascot (Requirement 14)
code = code.replace(
  'src="/brand/hero_rank_banner.webp"',
  'src="/brand/mascot_profile.png"'
);

// 4. Move System Notifications toggle up higher (Requirement 10)
const notifBox = `          {/* Quick Push Notification Toggle Button (Moved Higher) */}
          <button
            type="button"
            onClick={handleToggleNotifications}
            className="w-full h-10 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold flex items-center justify-between px-3.5 transition active:scale-[0.99] cursor-pointer shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Bell
                className={\`w-3.5 h-3.5 \${
                  notifsActive ? "text-[#0284C7]" : "text-slate-400"
                }\`}
              />
              <span>System Push Notifications</span>
            </div>
            <span
              className={\`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5 \${
                notifsActive
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-slate-100 text-slate-500 border border-slate-200"
              }\`}
            >
              <span
                className={\`w-1.5 h-1.5 rounded-full \${
                  notifsActive ? "bg-emerald-500" : "bg-slate-400"
                }\`}
              />
              <span>{notifsActive ? "Active" : "Inactive"}</span>
            </span>
          </button>`;

// Insert notifBox right after the language selector card at the top
const langBoxTarget = '            </div>\n          </div>\n\n          {/* Quick Push Notification Toggle Button */}';
const langBoxTargetCRLF = '            </div>\r\n          </div>\r\n\r\n          {/* Quick Push Notification Toggle Button */}';

// Remove from old bottom location
const oldNotifBox = `          {/* Quick Push Notification Toggle Button */}
          <button
            type="button"
            onClick={handleToggleNotifications}
            className="w-full h-10 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold flex items-center justify-between px-3.5 transition active:scale-[0.99] cursor-pointer shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Bell
                className={\`w-3.5 h-3.5 \${
                  notifsActive ? "text-[#0284C7]" : "text-slate-400"
                }\`}
              />
              <span>System Notifications</span>
            </div>
            <span
              className={\`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5 \${
                notifsActive
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-slate-100 text-slate-500 border border-slate-200"
              }\`}
            >
              <span
                className={\`w-1.5 h-1.5 rounded-full \${
                  notifsActive ? "bg-emerald-500" : "bg-slate-400"
                }\`}
              />
              <span>{notifsActive ? "Active" : "Inactive"}</span>
            </span>
          </button>`;

// Place notifBox right below the header Digital ID card (around line 588)
const headerCardEnd = '          </div>\n        </div>\n\n        {/* Nano Banana Cosmic Crocheted Astronaut';
const headerCardEndCRLF = '          </div>\r\n        </div>\r\n\r\n        {/* Nano Banana Cosmic Crocheted Astronaut';

if (code.includes(headerCardEnd)) {
  code = code.replace(headerCardEnd, '          </div>\n        </div>\n\n' + notifBox + '\n\n        {/* Nano Banana Cosmic Crocheted Astronaut');
  code = code.replace(oldNotifBox, '');
  console.log('Moved notif box to top header position!');
} else if (code.includes(headerCardEndCRLF)) {
  code = code.replace(headerCardEndCRLF, '          </div>\r\n        </div>\r\n\r\n' + notifBox + '\r\n\r\n        {/* Nano Banana Cosmic Crocheted Astronaut');
  code = code.replace(oldNotifBox.replace(/\n/g, '\r\n'), '');
  console.log('Moved notif box to top header position (CRLF)!');
} else {
  console.error('headerCardEnd not found');
}

fs.writeFileSync(file, code, 'utf8');
console.log('Profile page patched successfully!');
