import fs from "fs";

const filePath = "src/lib/store/useQuantersStore.ts";
let content = fs.readFileSync(filePath, "utf8");

// 1. In existing member onboardingTicks
const oldExistingTicks = `                  declaresOtherStudentOrg: payload.declaresOtherStudentOrg,
                  onboardingTicks: {
                    ...m.onboardingTicks,
                    profileComplete: true,
                  },`;

const newExistingTicks = `                  declaresOtherStudentOrg: payload.declaresOtherStudentOrg,
                  onboardingTicks: {
                    ...m.onboardingTicks,
                    profileComplete: true,
                    hrApproved: isAlumniTarget || ((state.settings.onboardingAutoApprove ?? true) ? true : m.onboardingTicks?.hrApproved ?? false),
                    hrApprovedAt: (isAlumniTarget || (state.settings.onboardingAutoApprove ?? true)) ? (m.onboardingTicks?.hrApprovedAt || new Date().toISOString()) : m.onboardingTicks?.hrApprovedAt,
                    hrApprovedBy: (isAlumniTarget || (state.settings.onboardingAutoApprove ?? true)) ? (m.onboardingTicks?.hrApprovedBy || "System Auto-Admission") : m.onboardingTicks?.hrApprovedBy,
                  },`;

if (content.includes(oldExistingTicks)) {
  content = content.replace(oldExistingTicks, newExistingTicks);
  console.log("Patched existing member onboardingTicks");
} else {
  // Try CRLF
  const oldCRLF = oldExistingTicks.replace(/\n/g, "\r\n");
  const newCRLF = newExistingTicks.replace(/\n/g, "\r\n");
  if (content.includes(oldCRLF)) {
    content = content.replace(oldCRLF, newCRLF);
    console.log("Patched existing member onboardingTicks (CRLF)");
  } else {
    console.warn("Could not find oldExistingTicks");
  }
}

// 2. In newMember creation
const oldNewMemberStatus = `        status: isAlumniTarget ? "Alumni" : "Trainee",`;
const newNewMemberStatus = `        status: isAlumniTarget ? "Alumni" : (state.settings.onboardingAutoApprove ?? true) ? "Trainee" : "Pending",`;

if (content.includes(oldNewMemberStatus)) {
  content = content.replace(oldNewMemberStatus, newNewMemberStatus);
  console.log("Patched newMember status");
} else {
  console.warn("Could not find oldNewMemberStatus");
}

const oldNewMemberTicks = `        onboardingTicks: {
          profileComplete: true,
          buddyAssigned: false,
          firstTaskBeforeDay30: false,
          firstWorkshopAttended: false,
        },`;

const newNewMemberTicks = `        onboardingTicks: {
          profileComplete: true,
          buddyAssigned: false,
          firstTaskBeforeDay30: false,
          firstWorkshopAttended: false,
          hrApproved: isAlumniTarget || (state.settings.onboardingAutoApprove ?? true),
          hrApprovedAt: (isAlumniTarget || (state.settings.onboardingAutoApprove ?? true)) ? new Date().toISOString() : undefined,
          hrApprovedBy: (isAlumniTarget || (state.settings.onboardingAutoApprove ?? true)) ? "System Auto-Admission" : undefined,
        },`;

if (content.includes(oldNewMemberTicks)) {
  content = content.replace(oldNewMemberTicks, newNewMemberTicks);
  console.log("Patched newMember ticks");
} else {
  const oldCRLF = oldNewMemberTicks.replace(/\n/g, "\r\n");
  const newCRLF = newNewMemberTicks.replace(/\n/g, "\r\n");
  if (content.includes(oldCRLF)) {
    content = content.replace(oldCRLF, newCRLF);
    console.log("Patched newMember ticks (CRLF)");
  } else {
    console.warn("Could not find oldNewMemberTicks");
  }
}

// 3. Add approveMemberAdmission and rejectMemberAdmission after confirmTraineeToActive
const targetMethod = `      return {
        members: state.members.map((m) =>
          m.id === memberId
            ? {
                ...m,
                status: "Active",
                statusSince: "Oct 2026",
                statusHistory: [
                  {
                    id: \`sh-\${Date.now()}\`,
                    fromStatus: m.status,
                    toStatus: "Active",
                    reason,
                    actorName,
                    date: new Date().toISOString().slice(0, 10),
                  },
                  ...m.statusHistory,
                ],
              }
            : m
        ),
        auditLogs: [audit, ...state.auditLogs],
        celebration: {
          open: true,
          type: "confirmation",
          title: "Official Member Confirmed!",
          subtitle: \`\${member.fullName} has completed the 3-month qualification and is now an Official Active Member of QUANTA.\`,
          xpEarned: 50,
        },
      };
    }),`;

const targetWithNewActions = `      return {
        members: state.members.map((m) =>
          m.id === memberId
            ? {
                ...m,
                status: "Active",
                statusSince: "Oct 2026",
                statusHistory: [
                  {
                    id: \`sh-\${Date.now()}\`,
                    fromStatus: m.status,
                    toStatus: "Active",
                    reason,
                    actorName,
                    date: new Date().toISOString().slice(0, 10),
                  },
                  ...m.statusHistory,
                ],
              }
            : m
        ),
        auditLogs: [audit, ...state.auditLogs],
        celebration: {
          open: true,
          type: "confirmation",
          title: "Official Member Confirmed!",
          subtitle: \`\${member.fullName} has completed the 3-month qualification and is now an Official Active Member of QUANTA.\`,
          xpEarned: 50,
        },
      };
    }),

  approveMemberAdmission: ({ memberId, actorName = "HR Directorate", notes }) => {
    set((state) => {
      const member = state.members.find((m) => m.id === memberId);
      if (!member) return state;

      const targetStatus = (member.tenure?.toLowerCase().includes("alumni")
        ? "Alumni"
        : "Trainee");

      const audit = {
        id: \`aud-adm-\${Date.now()}\`,
        actorName,
        actorRole: state.activeAdminRole,
        timestamp: nowStamp(),
        actionCategory: "Status Change",
        targetLabel: \`\${member.fullName} (\${member.quanterId})\`,
        oldValue: member.status,
        newValue: targetStatus,
        reason: notes ? \`HR Admission Approved: \${notes}\` : "HR Admission Approved by HR Directorate",
      };

      const admissionNotice = {
        id: \`msg-adm-\${Date.now()}\`,
        title: "🎉 Welcome to QUANTA! Your Admission is Approved",
        body: \`Congratulations \${member.fullName}! Your membership application and onboarding dossier have been formally reviewed and approved by the HR Directorate. You now have full access to workshops, projects, quizzes, and community spaces.\`,
        sentBy: actorName,
        sentAt: nowStamp(),
        target: "All",
        channel: "Direct",
        recipientMemberIds: [member.id],
        readMemberIds: [],
        pinned: true,
        priority: "High",
      };

      return {
        members: state.members.map((m) =>
          m.id === memberId
            ? {
                ...m,
                status: targetStatus,
                statusSince: new Date().toISOString().slice(0, 10),
                onboardingTicks: {
                  ...m.onboardingTicks,
                  hrApproved: true,
                  hrApprovedAt: new Date().toISOString(),
                  hrApprovedBy: actorName,
                },
                statusHistory: [
                  {
                    id: \`sh-\${Date.now()}\`,
                    fromStatus: m.status,
                    toStatus: targetStatus,
                    reason: notes ? \`HR Admission Approved: \${notes}\` : "HR Admission Approved",
                    actorName,
                    date: new Date().toISOString().slice(0, 10),
                  },
                  ...m.statusHistory,
                ],
              }
            : m
        ),
        messages: [admissionNotice, ...state.messages],
        auditLogs: [audit, ...state.auditLogs],
        celebration: {
          open: true,
          type: "confirmation",
          title: "Quanter Admitted!",
          subtitle: \`\${member.fullName} has been approved and inducted into QUANTA as \${targetStatus}.\`,
          xpEarned: 50,
        },
      };
    });
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },

  rejectMemberAdmission: ({ memberId, actorName = "HR Directorate", reason }) => {
    set((state) => {
      const member = state.members.find((m) => m.id === memberId);
      if (!member) return state;

      const audit = {
        id: \`aud-rej-\${Date.now()}\`,
        actorName,
        actorRole: state.activeAdminRole,
        timestamp: nowStamp(),
        actionCategory: "Status Change",
        targetLabel: \`\${member.fullName} (\${member.quanterId})\`,
        oldValue: member.status,
        newValue: "Removed",
        reason: \`HR Admission Rejected: \${reason}\`,
      };

      return {
        members: state.members.map((m) =>
          m.id === memberId
            ? {
                ...m,
                status: "Removed",
                removalReason: reason,
                statusSince: new Date().toISOString().slice(0, 10),
                onboardingTicks: {
                  ...m.onboardingTicks,
                  hrApproved: false,
                },
                statusHistory: [
                  {
                    id: \`sh-\${Date.now()}\`,
                    fromStatus: m.status,
                    toStatus: "Removed",
                    reason,
                    actorName,
                    date: new Date().toISOString().slice(0, 10),
                  },
                  ...m.statusHistory,
                ],
              }
            : m
        ),
        auditLogs: [audit, ...state.auditLogs],
      };
    });
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },`;

let replacedTarget = false;
if (content.includes(targetMethod)) {
  content = content.replace(targetMethod, targetWithNewActions);
  replacedTarget = true;
  console.log("Added approveMemberAdmission and rejectMemberAdmission");
} else {
  const targetCRLF = targetMethod.replace(/\n/g, "\r\n");
  const targetWithNewActionsCRLF = targetWithNewActions.replace(/\n/g, "\r\n");
  if (content.includes(targetCRLF)) {
    content = content.replace(targetCRLF, targetWithNewActionsCRLF);
    replacedTarget = true;
    console.log("Added approveMemberAdmission and rejectMemberAdmission (CRLF)");
  } else {
    console.warn("Could not find targetMethod");
  }
}

fs.writeFileSync(filePath, content, "utf8");
console.log("Finished patching store!");
