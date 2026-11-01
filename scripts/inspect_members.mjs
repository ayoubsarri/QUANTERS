import fs from "fs";

const db = JSON.parse(fs.readFileSync("data/quanters-db.json", "utf8"));
const members = db.members || [];
console.log("Total members in data/quanters-db.json:", members.length);
members.forEach((m, idx) => {
  console.log(
    `[${idx + 1}] ${m.fullName.padEnd(25)} | tenure: ${(m.tenure || "N/A").padEnd(12)} | status: ${(m.status || "").padEnd(8)} | lvl: ${m.level} (${m.levelTitle || "N/A"}) | totalXP: ${m.xpTotal} | monthXP: ${m.xpMonth}`
  );
});
