import fs from "fs";

let content = fs.readFileSync("src/app/(mobile)/explore/page.tsx", "utf8").replace(/\r\n/g, "\n");

content = content.replace("      )}\n\n      )}\n    </MobileAppShell>", "      )}\n    </MobileAppShell>");

fs.writeFileSync("src/app/(mobile)/explore/page.tsx", content);
console.log("Fixed trailing closing parenthesis in explore page");
