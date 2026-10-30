const fs = require('fs');
const file = 'src/lib/store/useQuantersStore.ts';
let code = fs.readFileSync(file, 'utf8');

// 1. In loginWithEmail
const target1 = 'if (existing) {\n      const { adminRole, redirectPath } = resolveRoleAndRedirect(existing);';
const target1CRLF = 'if (existing) {\r\n      const { adminRole, redirectPath } = resolveRoleAndRedirect(existing);';
const repl1 = `if (existing) {
      if (existing.status === "Removed") {
        return {
          ok: false,
          isDeleted: true,
          redirectPath: "/welcome",
          message: "YOUR_ACCOUNT_DELETED",
          member: existing,
        };
      }
      const { adminRole, redirectPath } = resolveRoleAndRedirect(existing);`;

if (code.includes(target1)) code = code.replace(target1, repl1);
else if (code.includes(target1CRLF)) code = code.replace(target1CRLF, repl1);
else console.error('target1 not found');

// 2. In registerAccount
const target2 = 'const existing = state.members.find((m) => m.email.toLowerCase() === cleanEmail);\n    if (existing) {';
const target2CRLF = 'const existing = state.members.find((m) => m.email.toLowerCase() === cleanEmail);\r\n    if (existing) {';
const repl2 = `const existing = state.members.find((m) => m.email.toLowerCase() === cleanEmail);
    if (existing) {
      if (existing.status === "Removed") {
        return {
          ok: false,
          isDeleted: true,
          redirectPath: "/welcome",
          message: "YOUR_ACCOUNT_DELETED",
          member: existing,
        };
      }`;

if (code.includes(target2)) code = code.replace(target2, repl2);
else if (code.includes(target2CRLF)) code = code.replace(target2CRLF, repl2);
else console.error('target2 not found');

// 3. In approveMemberAdmission (add 50 XP to member and ledger)
const target3 = 'return {\n        members: state.members.map((m) =>\n          m.id === memberId\n            ? {\n                ...m,\n                status: targetStatus,\n                statusSince: new Date().toISOString().slice(0, 10),';
const target3CRLF = 'return {\r\n        members: state.members.map((m) =>\r\n          m.id === memberId\r\n            ? {\r\n                ...m,\r\n                status: targetStatus,\r\n                statusSince: new Date().toISOString().slice(0, 10),';
const repl3 = `const welcomeLedgerEntry: PointsLedgerEntry = {
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

if (code.includes(target3)) code = code.replace(target3, repl3);
else if (code.includes(target3CRLF)) code = code.replace(target3CRLF, repl3);
else console.error('target3 not found');

// 3b. Add ledger to return object
const target3b = 'messages: newMessages,\n        auditLogs: [audit, ...state.auditLogs],';
const target3bCRLF = 'messages: newMessages,\r\n        auditLogs: [audit, ...state.auditLogs],';
const repl3b = 'messages: newMessages,\n        ledger: [welcomeLedgerEntry, ...state.ledger],\n        auditLogs: [audit, ...state.auditLogs],';

if (code.includes(target3b)) code = code.replace(target3b, repl3b);
else if (code.includes(target3bCRLF)) code = code.replace(target3bCRLF, repl3b);
else console.error('target3b not found');

// 4. In markMessageRead (archive on read, record memberId, sync)
const target4 = 'markMessageRead: (messageId) =>\n    set((state) => ({\n      messages: state.messages.map((m) =>\n        m.id === messageId\n          ? {\n              ...m,\n              unread: false,\n              archived: true,\n              stats: { ...m.stats, inAppReadCount: m.stats.inAppReadCount + (m.unread ? 1 : 0) },\n            }\n          : m\n      ),\n    })),';
const target4CRLF = 'markMessageRead: (messageId) =>\r\n    set((state) => ({\r\n      messages: state.messages.map((m) =>\r\n        m.id === messageId\r\n          ? {\r\n              ...m,\r\n              unread: false,\r\n              archived: true,\r\n              stats: { ...m.stats, inAppReadCount: m.stats.inAppReadCount + (m.unread ? 1 : 0) },\r\n            }\r\n          : m\r\n      ),\n    })),';
const repl4 = `markMessageRead: (messageId, memberId) => {
    set((state) => {
      const curMember = memberId || state.currentMemberId;
      return {
        messages: state.messages.map((m) => {
          if (m.id !== messageId) return m;
          const reads = Array.isArray(m.readMemberIds) ? [...m.readMemberIds] : [];
          if (curMember && !reads.includes(curMember)) {
            reads.push(curMember);
          }
          return {
            ...m,
            unread: false,
            archived: true,
            readMemberIds: reads,
            stats: {
              ...m.stats,
              inAppReadCount: (m.stats?.inAppReadCount || 0) + (m.unread ? 1 : 0),
            },
          };
        }),
      };
    });
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },`;

if (code.includes(target4)) code = code.replace(target4, repl4);
else if (code.includes(target4CRLF)) code = code.replace(target4CRLF, repl4);
else console.error('target4 not found');

fs.writeFileSync(file, code, 'utf8');
console.log('Done patching store!');
