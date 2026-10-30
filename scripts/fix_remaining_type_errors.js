import fs from "fs";

// 1. In src/lib/store/useQuantersStore.ts:
let store = fs.readFileSync("src/lib/store/useQuantersStore.ts", "utf8").replace(/\r\n/g, "\n");
store = store.replace(
  `        | "outsideActivitiesAndVolunteering"
        | "skills"
      >`,
  `        | "outsideActivitiesAndVolunteering"
        | "skills"
        | "alumniAccessEnabled"
        | "graduationYear"
        | "alumniPosition"
      >`
);
fs.writeFileSync("src/lib/store/useQuantersStore.ts", store);
console.log("Updated updateMemberProfileSelf in store");

// 2. In src/app/(mobile)/welcome/page.tsx:
let welcome = fs.readFileSync("src/app/(mobile)/welcome/page.tsx", "utf8").replace(/\r\n/g, "\n");
welcome = welcome.replace(
  '  const currentLang = useQuantersStore((s) => s.language) || "en";\n  const lang = currentLang;',
  '  const lang = useQuantersStore((s) => s.settings?.defaultLanguage) || "en";'
);
fs.writeFileSync("src/app/(mobile)/welcome/page.tsx", welcome);
console.log("Fixed lang in welcome page");

// 3. In src/app/admin/stats/page.tsx:
let stats = fs.readFileSync("src/app/admin/stats/page.tsx", "utf8").replace(/\r\n/g, "\n");
stats = stats.replace(
  `  const completedTasks = tasks.filter((t) => t.urgencyLabel === "Completed" || t.assignees?.some((a) => a.validationState === "Validated")).length;
  const overdueTasks = tasks.filter((t) => t.assignees?.some((a) => a.validationState === "Late")).length;
  const pendingTasks = tasks.filter((t) => t.urgencyLabel === "In progress" || t.assignees?.some((a) => a.validationState === "Submitted")).length;`,
  `  const completedTasks = tasks.filter((t) => t.urgencyLabel === "Completed" || t.assignees?.some((a) => a.status === "Validated")).length;
  const overdueTasks = tasks.filter((t) => t.assignees?.some((a) => a.status === "Late")).length;
  const pendingTasks = tasks.filter((t) => t.urgencyLabel === "In progress" || t.assignees?.some((a) => a.status === "Submitted")).length;`
);
fs.writeFileSync("src/app/admin/stats/page.tsx", stats);
console.log("Fixed task status in stats page");
