import fs from "fs";

let adminProp = fs.readFileSync("src/app/admin/proposals/page.tsx", "utf8");

const regex = /<\/span>\r?\n\s*<\/button>\r?\n\s*\)\}\r?\n\s*<\/>\r?\n\s*onClick=\{[\s\S]*?<\/button>\r?\n\s*\)\}/;
const replacement = `</span>\n                      </button>\n                    )}\n                  </>`;

adminProp = adminProp.replace(regex, replacement);
fs.writeFileSync("src/app/admin/proposals/page.tsx", adminProp, "utf8");
console.log("Regex replacement done. Match found:", regex.test(adminProp) === false);
