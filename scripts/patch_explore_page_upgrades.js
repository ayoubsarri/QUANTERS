import fs from "fs";

let content = fs.readFileSync("src/app/(mobile)/explore/page.tsx", "utf8").replace(/\r\n/g, "\n");

// 1. Rename tab labels
content = content.replace(
  '<span>{isRtl ? "أحدث الأخبار" : "Latest Dispatches"}</span>',
  '<span>{isRtl ? "الجديد" : "Latest"}</span>'
);

content = content.replace(
  '<span>{isRtl ? "الأرشيف والأعداد السابقة" : "Past Editions & Archive"}</span>',
  '<span>{isRtl ? "الأرشيف" : "Archive"}</span>'
);

// 2. Remove duplicate second modal
const secondModalStart = content.lastIndexOf("      {activeArticle && (\n        <div className=\"fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-4 pb-16 sm:pb-6\">");
if (secondModalStart !== -1) {
  const secondModalEnd = content.lastIndexOf("      )}\n    </MobileAppShell>");
  if (secondModalEnd !== -1) {
    content = content.slice(0, secondModalStart) + content.slice(secondModalEnd);
    console.log("Removed duplicate second modal");
  }
}

// 3. Enlarge first modal
content = content.replace(
  'className="w-full max-w-2xl max-h-[88dvh] rounded-3xl bg-white overflow-hidden shadow-2xl border border-slate-200 flex flex-col animate-rise"',
  'className="w-full max-w-4xl max-h-[92dvh] rounded-3xl bg-white overflow-hidden shadow-2xl border border-slate-200 flex flex-col animate-rise"'
);

// 4. Remove Done Reading button from first modal
content = content.replace(
  `                    <button
                      type="button"
                      onClick={() => setActiveArticle(null)}
                      className="h-10 px-5 rounded-xl bg-gradient-to-b from-[#182C4E] to-[#101F38] text-white text-xs font-extrabold shadow-sm active:scale-[0.98] transition cursor-pointer"
                    >
                      Done Reading
                    </button>`,
  ""
);

fs.writeFileSync("src/app/(mobile)/explore/page.tsx", content);
console.log("Updated explore page successfully");
