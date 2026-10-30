import fs from "fs";

let stats = fs.readFileSync("src/app/admin/stats/page.tsx", "utf8").replace(/\r\n/g, "\n");
stats = stats.replace('a.status === "Submitted"', 'a.status === "Delivered"');
fs.writeFileSync("src/app/admin/stats/page.tsx", stats);
console.log("Updated Delivered status in stats page");
