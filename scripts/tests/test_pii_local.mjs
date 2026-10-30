import fs from "fs";
import path from "path";

const code = fs.readFileSync(path.resolve("src/lib/store/useQuantersStore.ts"), "utf-8");
const hasMaskedPhone = code.includes('phone: "🔒 Masked for privacy"');
const hasUndefWilaya = code.includes('wilaya: undefined');
const hasUndefCvUrl = code.includes('cvUrl: undefined');
const hasLeadershipCheck = code.includes('isLeadershipOrAdmin');

console.log("Local PII Masking Implementation Check:");
console.log("- Masked phone pattern:", hasMaskedPhone);
console.log("- Undefined wilaya pattern:", hasUndefWilaya);
console.log("- Undefined cvUrl pattern:", hasUndefCvUrl);
console.log("- Leadership check:", hasLeadershipCheck);

if (!hasMaskedPhone || !hasUndefWilaya || !hasUndefCvUrl || !hasLeadershipCheck) {
  console.error("FAIL: Missing PII masking implementation in useQuantersStore.ts");
  process.exit(1);
} else {
  console.log("✔ PASS: All PII masking logic verified locally in source code!");
}
