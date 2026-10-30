import fs from "fs";

let content = fs.readFileSync("src/lib/types/erp.ts", "utf8").replace(/\r\n/g, "\n");

const target = `  abstractApiKey1?: string;
  abstractApiKey2?: string;
}`;

const repl = `  abstractApiKey1?: string;
  abstractApiKey2?: string;
  // Extended Club Governance Controls
  taskGracePeriodHours?: number;
  examRetakeCooldownHours?: number;
  dailyQuizResetHour?: number;
  communityWebhookUrl?: string;
  hapticAudioFeedbackEnabled?: boolean;
}`;

if (content.includes(target)) {
  content = content.replace(target, repl);
  fs.writeFileSync("src/lib/types/erp.ts", content);
  console.log("Updated SystemSettings interface with extended governance fields");
} else {
  console.log("Target not found in erp.ts");
}
