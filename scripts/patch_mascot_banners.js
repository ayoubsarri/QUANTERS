import fs from "fs";

// 1. Workshops
let ws = fs.readFileSync("src/app/(mobile)/workshops/page.tsx", "utf8").replace(/\r\n/g, "\n");
ws = ws.replace('/brand/hero_rank_banner.webp', '/brand/mascot_workshops.png');
fs.writeFileSync("src/app/(mobile)/workshops/page.tsx", ws);
console.log("Updated workshops hero image to /brand/mascot_workshops.png");

// 2. Badges
let bd = fs.readFileSync("src/app/(mobile)/badges/page.tsx", "utf8").replace(/\r\n/g, "\n");
bd = bd.replace('/brand/hero_rank_banner.webp', '/brand/mascot_badges.png');
fs.writeFileSync("src/app/(mobile)/badges/page.tsx", bd);
console.log("Updated badges hero image to /brand/mascot_badges.png");
