import fs from "fs";

const filePath = "src/lib/store/useQuantersStore.ts";
let content = fs.readFileSync(filePath, "utf8");

// 1. Add sessionStartedAt on line 853
const target1 = `  activeAdminRole: "Member",
  activeLanguage: "en",`;
const replace1 = `  activeAdminRole: "Member",
  sessionStartedAt: Date.now(),
  activeLanguage: "en",`;

if (content.includes(target1)) {
  content = content.replace(target1, replace1);
  console.log("Added sessionStartedAt to initial state");
} else {
  const target1CRLF = target1.replace(/\n/g, "\r\n");
  const replace1CRLF = replace1.replace(/\n/g, "\r\n");
  if (content.includes(target1CRLF)) {
    content = content.replace(target1CRLF, replace1CRLF);
    console.log("Added sessionStartedAt to initial state (CRLF)");
  } else {
    console.warn("Could not find target1");
  }
}

// 2. Fix priority: "High" to priority: "Official notice" in admissionNotice
const target2 = `        recipientScope: \`Member:\${member.id}\`,
        priority: "High",`;
const replace2 = `        recipientScope: \`Member:\${member.id}\`,
        priority: "Official notice",`;

if (content.includes(target2)) {
  content = content.replace(target2, replace2);
  console.log("Updated priority in admissionNotice");
} else {
  const target2CRLF = target2.replace(/\n/g, "\r\n");
  const replace2CRLF = replace2.replace(/\n/g, "\r\n");
  if (content.includes(target2CRLF)) {
    content = content.replace(target2CRLF, replace2CRLF);
    console.log("Updated priority in admissionNotice (CRLF)");
  } else {
    console.warn("Could not find target2");
  }
}

fs.writeFileSync(filePath, content, "utf8");
console.log("Store final fixes applied successfully!");
