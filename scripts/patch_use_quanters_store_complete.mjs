import fs from "fs";

const filePath = "src/lib/store/useQuantersStore.ts";
let content = fs.readFileSync(filePath, "utf8");

// 1. In QuantersStoreState interface:
// Add sessionStartedAt & remote session revocation methods
const stateInterfaceAnchor = `  activeAdminRole: RoleTemplateName;`;
const stateInterfaceAddition = `  activeAdminRole: RoleTemplateName;
  sessionStartedAt: number;
  forceLogoutAllSessions: (options?: { keepCurrentSession?: boolean }) => Promise<void>;
  forceLogoutSpecificMember: (memberId: string, reason?: string) => Promise<void>;
  restoreMemberSessionAccess: (memberId: string) => Promise<void>;`;

if (!content.includes("sessionStartedAt: number;")) {
  content = content.replace(stateInterfaceAnchor, stateInterfaceAddition);
  console.log("Added sessionStartedAt and revocation signatures to QuantersStoreState");
}

// 2. In loginWithEmail interface signature:
const oldLoginSig = `  loginWithEmail: (
    email: string,
    password?: string
  ) => { ok: boolean; redirectPath: string; member?: Member; message?: string };`;

const newLoginSig = `  loginWithEmail: (
    email: string,
    password?: string,
    bypassPasswordCheck?: boolean
  ) => { ok: boolean; redirectPath: string; member?: Member; message?: string };`;

if (content.includes(oldLoginSig)) {
  content = content.replace(oldLoginSig, newLoginSig);
  console.log("Updated loginWithEmail signature");
} else {
  const oldCRLF = oldLoginSig.replace(/\n/g, "\r\n");
  const newCRLF = newLoginSig.replace(/\n/g, "\r\n");
  if (content.includes(oldCRLF)) {
    content = content.replace(oldCRLF, newCRLF);
    console.log("Updated loginWithEmail signature (CRLF)");
  }
}

// 3. In reactivateFormerMember interface signature:
const oldReactivateSig = `reactivateFormerMember: (memberId: string, toStatus: "Active" | "Trainee", reason: string, actorName?: string) => void;`;
const newReactivateSig = `reactivateFormerMember: (
    memberId: string,
    toStatus: "Active" | "Trainee",
    reason: string,
    departmentIdOrActor?: string,
    teamId?: string
  ) => void;`;

if (content.includes(oldReactivateSig)) {
  content = content.replace(oldReactivateSig, newReactivateSig);
  console.log("Updated reactivateFormerMember signature");
}

// 4. In sendClubMessage interface signature:
const oldSendMsgSig = `  sendClubMessage: (payload: {
    recipientScope: string;
    priority: NotificationPriority;
    title: string;
    body: string;
    inApp: boolean;
    email: boolean;
  }) => void;`;

const newSendMsgSig = `  sendClubMessage: (payload: {
    recipientScope: string;
    priority: NotificationPriority;
    title: string;
    body: string;
    inApp: boolean;
    email: boolean;
    targetMemberId?: string;
    targetDepartmentId?: string;
    targetTeamId?: string;
  }) => void;
  deleteClubMessage: (messageId: string) => void;
  deleteAllClubMessages: () => void;`;

if (content.includes(oldSendMsgSig)) {
  content = content.replace(oldSendMsgSig, newSendMsgSig);
  console.log("Updated sendClubMessage and added delete message signatures");
} else {
  const oldCRLF = oldSendMsgSig.replace(/\n/g, "\r\n");
  const newCRLF = newSendMsgSig.replace(/\n/g, "\r\n");
  if (content.includes(oldCRLF)) {
    content = content.replace(oldCRLF, newCRLF);
    console.log("Updated sendClubMessage signature (CRLF)");
  }
}

// 5. In markMessageRead interface signature:
const oldMarkMsgSig = `  markMessageRead: (messageId: string) => void;`;
const newMarkMsgSig = `  markMessageRead: (messageId: string, memberId?: string) => void;`;

if (content.includes(oldMarkMsgSig)) {
  content = content.replace(oldMarkMsgSig, newMarkMsgSig);
  console.log("Updated markMessageRead signature");
}

// 6. In initial state (set sessionStartedAt):
const initialRoleAnchor = `  activeAdminRole: "Super Admin",`;
const initialRoleWithSession = `  activeAdminRole: "Super Admin",
  sessionStartedAt: Date.now(),`;

if (!content.includes("sessionStartedAt: Date.now()")) {
  content = content.replace(initialRoleAnchor, initialRoleWithSession);
  console.log("Added initial sessionStartedAt to store state");
}

// 7. Update loginWithEmail implementation to accept bypassPasswordCheck:
const oldLoginImpl = `  loginWithEmail: (email, password) => {`;
const newLoginImpl = `  loginWithEmail: (email, password, bypassPasswordCheck = false) => {`;

if (content.includes(oldLoginImpl)) {
  content = content.replace(oldLoginImpl, newLoginImpl);
  console.log("Updated loginWithEmail implementation signature");
}

// 8. Fix approveMemberAdmission & rejectMemberAdmission types in implementation:
const oldApproveMember = `  approveMemberAdmission: ({ memberId, actorName = "HR Directorate", notes }) => {
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

const newApproveMember = `  approveMemberAdmission: ({ memberId, actorName = "HR Directorate", notes }) => {
    set((state) => {
      const member = state.members.find((m) => m.id === memberId);
      if (!member) return state;

      const targetStatus: MemberStatus = (member.tenure?.toLowerCase().includes("alumni")
        ? "Alumni"
        : "Trainee");

      const audit: AuditLogEntry = {
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

      const admissionNotice: ClubMessage = {
        id: \`msg-adm-\${Date.now()}\`,
        senderLabel: actorName,
        senderRole: "HR",
        recipientScope: \`Member:\${member.id}\`,
        priority: "High",
        title: "🎉 Welcome to QUANTA! Your Admission is Approved",
        body: \`Congratulations \${member.fullName}! Your membership application and onboarding dossier have been formally reviewed and approved by the HR Directorate. You now have full access to workshops, projects, quizzes, and community spaces.\`,
        timeAgo: "Just now",
        unread: true,
        channels: { inApp: true, email: true },
        stats: {
          totalRecipients: 1,
          inAppReadCount: 0,
          emailSentCount: 1,
          emailFailedCount: 0,
        },
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

      const audit: AuditLogEntry = {
        id: \`aud-rej-\${Date.now()}\`,
        actorName,
        actorRole: state.activeAdminRole,
        timestamp: nowStamp(),
        actionCategory: "Status Change",
        targetLabel: \`\${member.fullName} (\${member.quanterId})\`,
        oldValue: member.status,
        newValue: "Removed" as MemberStatus,
        reason: \`HR Admission Rejected: \${reason}\`,
      };

      return {
        members: state.members.map((m) =>
          m.id === memberId
            ? {
                ...m,
                status: "Removed" as MemberStatus,
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
                    toStatus: "Removed" as MemberStatus,
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
  },

  forceLogoutAllSessions: async (options) => {
    const now = Date.now();
    set((state) => ({
      sessionStartedAt: options?.keepCurrentSession ? now + 1000 : state.sessionStartedAt,
      settings: {
        ...state.settings,
        forceLogoutAllAt: now,
      },
      auditLogs: [
        {
          id: \`aud-rev-all-\${now}\`,
          actorName: state.activeAdminRole,
          actorRole: state.activeAdminRole,
          timestamp: nowStamp(),
          actionCategory: "Access Grant / Revoke",
          targetLabel: "Global Session Revocation",
          oldValue: "Active Sessions Permitted",
          newValue: \`Terminated All Sessions at \${now}\`,
          reason: "Super Admin Remote Global Session Revocation Directive",
        },
        ...state.auditLogs,
      ],
    }));
    get().saveToLocalCache();
    await get().syncWithServer(true).catch(() => {});
  },

  forceLogoutSpecificMember: async (memberId, reason = "Remote session terminated by Super Admin") => {
    const now = Date.now();
    set((state) => {
      const target = state.members.find((m) => m.id === memberId);
      const currentRevoked = state.settings.revokedSessionMemberIds || {};
      return {
        settings: {
          ...state.settings,
          revokedSessionMemberIds: {
            ...currentRevoked,
            [memberId]: now,
          },
        },
        auditLogs: [
          {
            id: \`aud-rev-mem-\${now}\`,
            actorName: state.activeAdminRole,
            actorRole: state.activeAdminRole,
            timestamp: nowStamp(),
            actionCategory: "Access Grant / Revoke",
            targetLabel: target ? \`\${target.fullName} (\${target.quanterId})\` : memberId,
            oldValue: "Active Session Permitted",
            newValue: \`Revoked Session at \${now}\`,
            reason,
          },
          ...state.auditLogs,
        ],
      };
    });
    get().saveToLocalCache();
    await get().syncWithServer(true).catch(() => {});
  },

  restoreMemberSessionAccess: async (memberId) => {
    set((state) => {
      const currentRevoked = { ...(state.settings.revokedSessionMemberIds || {}) };
      delete currentRevoked[memberId];
      return {
        settings: {
          ...state.settings,
          revokedSessionMemberIds: currentRevoked,
        },
      };
    });
    get().saveToLocalCache();
    await get().syncWithServer(true).catch(() => {});
  },

  deleteClubMessage: (messageId) => {
    set((state) => ({
      messages: state.messages.filter((m) => m.id !== messageId),
    }));
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },

  deleteAllClubMessages: () => {
    set({ messages: [] });
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },`;

if (content.includes(oldApproveMember)) {
  content = content.replace(oldApproveMember, newApproveMember);
  console.log("Updated approveMemberAdmission and added remote revocation methods");
} else {
  const oldCRLF = oldApproveMember.replace(/\n/g, "\r\n");
  const newCRLF = newApproveMember.replace(/\n/g, "\r\n");
  if (content.includes(oldCRLF)) {
    content = content.replace(oldCRLF, newCRLF);
    console.log("Updated approveMemberAdmission and added remote revocation methods (CRLF)");
  } else {
    console.warn("Could not find oldApproveMember");
  }
}

// 9. Update reactivateFormerMember implementation to handle 5 arguments:
const oldReactivateImpl = `  reactivateFormerMember: (memberId, toStatus, reason, actorName = "HR Administration") =>
    set((state) => {
      const member = state.members.find((m) => m.id === memberId);
      if (!member) return state;
      const audit: AuditLogEntry = {
        id: \`aud-\${Date.now()}\`,
        actorName,
        actorRole: state.activeAdminRole,
        timestamp: nowStamp(),
        actionCategory: "Status Change",
        targetLabel: \`\${member.fullName} (\${member.quanterId})\`,
        oldValue: member.status,
        newValue: toStatus,
        reason: \`Reactivated: \${reason}\`,
      };
      return {
        members: state.members.map((m) =>
          m.id === memberId
            ? {
                ...m,
                status: toStatus,
                statusSince: new Date().toISOString().slice(0, 10),
                statusHistory: [
                  {
                    id: \`sh-\${Date.now()}\`,
                    fromStatus: m.status,
                    toStatus,
                    reason: \`Reactivated: \${reason}\`,
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
    }),`;

const newReactivateImpl = `  reactivateFormerMember: (memberId, toStatus, reason, departmentIdOrActor, teamId) => {
    set((state) => {
      const member = state.members.find((m) => m.id === memberId);
      if (!member) return state;

      const isDept = departmentIdOrActor && departmentIdOrActor.startsWith("dept-");
      const actorName = isDept ? "HR Administration" : (departmentIdOrActor || "HR Administration");
      const targetDeptId = isDept ? departmentIdOrActor : member.departmentId;
      const targetTeamId = teamId || member.teamId;

      const audit: AuditLogEntry = {
        id: \`aud-\${Date.now()}\`,
        actorName,
        actorRole: state.activeAdminRole,
        timestamp: nowStamp(),
        actionCategory: "Status Change",
        targetLabel: \`\${member.fullName} (\${member.quanterId})\`,
        oldValue: member.status,
        newValue: toStatus,
        reason: \`Reactivated: \${reason}\`,
      };

      const nextTeams = targetTeamId
        ? state.teams.map((t) =>
            t.id === targetTeamId
              ? { ...t, memberIds: Array.from(new Set([...t.memberIds, member.id])) }
              : t
          )
        : state.teams;

      return {
        teams: nextTeams,
        members: state.members.map((m) =>
          m.id === memberId
            ? {
                ...m,
                status: toStatus,
                departmentId: targetDeptId,
                teamId: targetTeamId,
                statusSince: new Date().toISOString().slice(0, 10),
                statusHistory: [
                  {
                    id: \`sh-\${Date.now()}\`,
                    fromStatus: m.status,
                    toStatus,
                    reason: \`Reactivated: \${reason}\`,
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

if (content.includes(oldReactivateImpl)) {
  content = content.replace(oldReactivateImpl, newReactivateImpl);
  console.log("Updated reactivateFormerMember implementation");
} else {
  const oldCRLF = oldReactivateImpl.replace(/\n/g, "\r\n");
  const newCRLF = newReactivateImpl.replace(/\n/g, "\r\n");
  if (content.includes(oldCRLF)) {
    content = content.replace(oldCRLF, newCRLF);
    console.log("Updated reactivateFormerMember implementation (CRLF)");
  } else {
    console.warn("Could not find oldReactivateImpl");
  }
}

// 10. In sendClubMessage implementation:
const oldSendMsgImpl = `  sendClubMessage: ({ recipientScope, priority, title, body, inApp, email }) =>`;
const newSendMsgImpl = `  sendClubMessage: ({ recipientScope, priority, title, body, inApp, email, targetMemberId, targetDepartmentId, targetTeamId }) =>`;

if (content.includes(oldSendMsgImpl)) {
  content = content.replace(oldSendMsgImpl, newSendMsgImpl);
  console.log("Updated sendClubMessage implementation signature");
}

fs.writeFileSync(filePath, content, "utf8");
console.log("Finished complete store patch!");
