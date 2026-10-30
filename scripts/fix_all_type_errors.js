import fs from "fs";

// 1. In src/lib/types/erp.ts: Add emblemEmoji to RankLevelThreshold
let erpTypes = fs.readFileSync("src/lib/types/erp.ts", "utf8").replace(/\r\n/g, "\n");
erpTypes = erpTypes.replace(
  `export interface RankLevelThreshold {
  level: number;
  minXp: number;
  maxXp?: number;
  title: string;
  badgeName?: string;
  colorHex?: string;
}`,
  `export interface RankLevelThreshold {
  level: number;
  minXp: number;
  maxXp?: number;
  title: string;
  badgeName?: string;
  colorHex?: string;
  emblemEmoji?: string;
}`
);
fs.writeFileSync("src/lib/types/erp.ts", erpTypes);
console.log("Updated RankLevelThreshold in erp.ts");

// 2. In src/lib/store/useQuantersStore.ts:
let store = fs.readFileSync("src/lib/store/useQuantersStore.ts", "utf8").replace(/\r\n/g, "\n");

// Add alumni fields to updateMemberProfileSelf Pick type:
store = store.replace(
  `        | "outsideActivitiesAndVolunteering"
        | "declaresOtherStudentOrg"
        | "skills"
      >`,
  `        | "outsideActivitiesAndVolunteering"
        | "declaresOtherStudentOrg"
        | "skills"
        | "alumniAccessEnabled"
        | "graduationYear"
        | "alumniPosition"
      >`
);

// Fix welcomeLedgerEntry and pointsTotal in approveMemberAdmission:
const targetAdmission = `      const welcomeLedgerEntry: PointsLedgerEntry = {
        id: \`led-adm-\${member.id}-\${Date.now()}\`,
        memberId: member.id,
        delta: 50,
        balanceAfter: (member.pointsTotal || 0) + 50,
        reason: "Welcome Admission Bonus · Official Induction into QUANTA (+50 XP)",
        ruleLabel: "HR Induction XP Bonus",
        timestamp: nowStamp(),
        awardedBy: actorName,
        date: new Date().toISOString().slice(0, 10),
      };

      return {
        members: state.members.map((m) =>
          m.id === memberId
            ? {
                ...m,
                status: targetStatus,
                statusSince: new Date().toISOString().slice(0, 10),
                xpTotal: (m.xpTotal || 0) + 50,
                xpSeason: (m.xpSeason || 0) + 50,
                pointsTotal: (m.pointsTotal || 0) + 50,`;

const replAdmission = `      const welcomeLedgerEntry: PointsLedgerEntry = {
        id: \`led-adm-\${member.id}-\${Date.now()}\`,
        memberId: member.id,
        memberName: member.fullName,
        amount: 50,
        reason: "Welcome Admission Bonus · Official Induction into QUANTA (+50 XP)",
        ruleLabel: "HR Induction XP Bonus",
        source: "Manual",
        actorName,
        date: new Date().toISOString().slice(0, 10),
      };

      return {
        members: state.members.map((m) =>
          m.id === memberId
            ? {
                ...m,
                status: targetStatus,
                statusSince: new Date().toISOString().slice(0, 10),
                xpTotal: (m.xpTotal || 0) + 50,
                xpSeason: (m.xpSeason || 0) + 50,`;

if (store.includes(targetAdmission)) {
  store = store.replace(targetAdmission, replAdmission);
  console.log("Patched approveMemberAdmission welcomeLedgerEntry and pointsTotal");
} else {
  console.log("targetAdmission not matched in store");
}

fs.writeFileSync("src/lib/store/useQuantersStore.ts", store);

// 3. In src/app/(mobile)/welcome/page.tsx: Add language state
let welcome = fs.readFileSync("src/app/(mobile)/welcome/page.tsx", "utf8").replace(/\r\n/g, "\n");
welcome = welcome.replace(
  '  const [accountDeletedModalOpen, setAccountDeletedModalOpen] = useState(false);',
  '  const [accountDeletedModalOpen, setAccountDeletedModalOpen] = useState(false);\n  const currentLang = useQuantersStore((s) => s.language) || "en";\n  const lang = currentLang;'
);
fs.writeFileSync("src/app/(mobile)/welcome/page.tsx", welcome);
console.log("Added lang to welcome page");

// 4. In src/app/admin/stats/page.tsx: Fix tasks status check and emblemEmoji
let stats = fs.readFileSync("src/app/admin/stats/page.tsx", "utf8").replace(/\r\n/g, "\n");
stats = stats.replace(
  `  const completedTasks = tasks.filter((t) => t.status === "Validated").length;
  const overdueTasks = tasks.filter((t) => t.status === "Late").length;
  const pendingTasks = tasks.filter((t) => t.status === "In Progress" || t.status === "Submitted").length;`,
  `  const completedTasks = tasks.filter((t) => t.urgencyLabel === "Completed" || t.assignees?.some((a) => a.validationState === "Validated")).length;
  const overdueTasks = tasks.filter((t) => t.assignees?.some((a) => a.validationState === "Late")).length;
  const pendingTasks = tasks.filter((t) => t.urgencyLabel === "In progress" || t.assignees?.some((a) => a.validationState === "Submitted")).length;`
);

stats = stats.replace(
  '<span className="text-sm shrink-0">{tier.emblemEmoji}</span>',
  '<span className="text-sm shrink-0">{tier.emblemEmoji || "🎖️"}</span>'
);

fs.writeFileSync("src/app/admin/stats/page.tsx", stats);
console.log("Fixed stats tasks and emblemEmoji");
