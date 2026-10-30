import fs from "fs";

let content = fs.readFileSync("src/app/(mobile)/profile/page.tsx", "utf8").replace(/\r\n/g, "\n");

content = content.replace(
  'className="text-base sm:text-lg md:text-xl text-slate-800 font-editorial italic leading-relaxed tracking-wide"',
  'className="text-lg sm:text-xl md:text-2xl font-editorial font-medium italic text-slate-900 leading-snug tracking-wide"'
);

content = content.replace(
  'className="w-5 h-5 text-[#0284C7] shrink-0 mt-0.5 opacity-80"',
  'className="w-6 h-6 text-[#0284C7] shrink-0 mt-1 opacity-90"'
);

fs.writeFileSync("src/app/(mobile)/profile/page.tsx", content);
console.log("Enlarged profile quote font successfully");
